// The contract of the shared preset, end to end: an app that only extends it (vite.config.ts, tsconfig.json and the
// hooks of @lernapps/tooling, nothing configured of its own) gets every lint rule and both git hooks.
//   - `npm install` installs the hooks: pre-commit runs `lernapps check --pre-commit`, pre-push `--pre-push`;
//   - a lint violation stops `git commit` with the rule's message and its link;
//   - a request to another host stops `git push`, and the failed push increments prePushFailures in the plan;
//   - each lint rule gives its verdict on a source snippet, through the preset's configuration;
//   - the helpers (storage, i18n, a11y) and the Playwright configuration work in the app as they are.
// The app is installed from git, as a consumer installs the package.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { freshClone, ok, repoRoot, run, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const RULES = "https://lernapps.net/tooling/rules/#";
const HOOKS = "node_modules/@lernapps/tooling/archetypes/shared/hooks";

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

/** The app as the generator would write it: thin files that refer to the package, its pages and sources. */
const appFiles = (tooling: string): Record<string, string> => ({
  "package.json": `${JSON.stringify(
    {
      name: "brueche",
      private: true,
      type: "module",
      scripts: { prepare: `vp config --no-agent --hooks-dir ${HOOKS}` },
      devDependencies: { "@lernapps/tooling": `git+file://${tooling}`, "vite-plus": "1.0.0" },
      overrides: { vite: "npm:@voidzero-dev/vite-plus-core@1.0.0" },
    },
    null,
    2,
  )}\n`,
  ".gitignore": "node_modules/\ndist/\ntest-results/\nplaywright-report/\n",
  "vite.config.ts": 'import { lernapps } from "@lernapps/tooling/preset";\n\nexport default lernapps();\n',
  "tsconfig.json": '{ "extends": "@lernapps/tooling/tsconfig.json" }\n',
  "playwright.config.ts": 'export { default } from "@lernapps/tooling/playwright";\n',
  ".vibe/plan.md": "---\narchetype: quiz\nphase: code\nprePushFailures: 0\n---\n\n# Plan\n",
  "index.html": [
    "<!doctype html>",
    '<html lang="de">',
    "  <head>",
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    "    <title>Brüche üben</title>",
    '    <script type="module" src="/src/main.ts"></script>',
    "  </head>",
    "  <body>",
    "    <main>",
    "      <h1>Brüche üben</h1>",
    "      <p>Hier übst du, Brüche zu kürzen. Du bekommst Aufgaben und siehst sofort, ob du richtig liegst.</p>",
    '      <button type="button">Nächste Aufgabe</button>',
    "      <output></output>",
    "    </main>",
    "  </body>",
    "</html>",
    "",
  ].join("\n"),
  "src/messages/de.json": `${JSON.stringify({ next: "Nächste Aufgabe", solved: "Du hast {count} Aufgaben gelöst." }, null, 2)}\n`,
  "src/main.ts": [
    'import { announce } from "@lernapps/tooling/a11y";',
    'import { translator } from "@lernapps/tooling/i18n";',
    'import { createStorage } from "@lernapps/tooling/storage";',
    'import de from "./messages/de.json";',
    "",
    "const t = translator(de);",
    'const storage = createStorage("brueche");',
    'const isCount = (value: unknown): value is number => typeof value === "number";',
    "",
    'const button = document.querySelector("button");',
    'const result = document.querySelector("output");',
    "if (button && result) {",
    '  let count = storage.load("count", isCount) ?? 0;',
    '  button.textContent = t("next");',
    '  button.addEventListener("click", () => {',
    "    count += 1;",
    '    storage.save("count", count);',
    '    result.textContent = t("solved", { count });',
    "    announce(result.textContent);",
    "  });",
    "}",
    "",
  ].join("\n"),
  "src/count.test.ts": [
    'import { expect, test } from "vite-plus/test";',
    'import { translator } from "@lernapps/tooling/i18n";',
    "",
    'test("the solved message names the count", () => {',
    '  const t = translator({ solved: "Du hast {count} Aufgaben gelöst." });',
    '  expect(t("solved", { count: 3 })).toBe("Du hast 3 Aufgaben gelöst.");',
    "});",
    "",
  ].join("\n"),
  "e2e/start.e2e.ts": [
    'import { expect, test } from "playwright/test";',
    "",
    'test("a click on the button counts a solved task", async ({ page }) => {',
    '  await page.goto("./");',
    '  await page.getByRole("button").click();',
    '  await expect(page.locator("output")).toHaveText("Du hast 1 Aufgaben gelöst.");',
    "});",
    "",
  ].join("\n"),
});

/**
 * Snippets with the verdict of each lint rule, as `src/snippet.ts` of the app. `rule` is the rule as Oxlint names
 * it in its output; every lint rule of the package (lint/rules/<id>.ts) has cases here.
 */
const verdicts: { rule: string; name: string; snippet: string; reported: boolean }[] = [
  {
    rule: "lernapps(no-request-before-click)",
    name: "a URL of another host",
    snippet: 'export const font = "https://fonts.example.org/inter.woff2";\n',
    reported: true,
  },
  {
    rule: "lernapps(no-request-before-click)",
    name: "a protocol-relative URL in a template",
    snippet: "export const load = (name: string) => fetch(`//cdn.example.org/${name}.json`);\n",
    reported: true,
  },
  {
    rule: "lernapps(no-request-before-click)",
    name: "links to lernapps.net, an XML namespace and a relative URL",
    snippet:
      'export const imprint = "https://lernapps.net/imprint/";\n' +
      'export const svg = "http://www.w3.org/2000/svg";\n' +
      'export const data = "./data.json";\n',
    reported: false,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "localStorage used directly",
    snippet: 'localStorage.setItem("count", "1");\nexport {};\n',
    reported: true,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "IndexedDB through window",
    snippet: 'export const open = () => window.indexedDB.open("brueche");\n',
    reported: true,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "a cookie",
    snippet: 'document.cookie = "besuch=1";\nexport {};\n',
    reported: true,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "the preset's storage, and a property named localStorage",
    snippet:
      'import { createStorage } from "@lernapps/tooling/storage";\n\n' +
      'export const storage = createStorage("brueche");\n' +
      "export const settings = { localStorage: false };\n",
    reported: false,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "a text written into the page",
    snippet: 'export const praise = (element: HTMLElement) => {\n  element.textContent = "Richtig!";\n};\n',
    reported: true,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "a label set as an attribute",
    snippet:
      'export const label = (element: HTMLElement) => {\n  element.setAttribute("aria-label", "Nächste Aufgabe");\n};\n',
    reported: true,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "the document's title",
    snippet: 'document.title = "Brüche üben";\nexport {};\n',
    reported: true,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "texts from the message file, numbers and symbols",
    snippet:
      'import de from "./messages/de.json";\n\n' +
      "export const show = (element: HTMLElement, count: number) => {\n" +
      "  element.textContent = de.next;\n" +
      '  element.setAttribute("aria-label", de.solved);\n' +
      '  element.title = "–";\n' +
      "  element.dataset['count'] = String(count);\n" +
      '  new URLSearchParams().append("thema", "brueche");\n' +
      "};\n",
    reported: false,
  },
  {
    rule: "lernapps(suppression-reason)",
    name: "a suppression without a reason",
    snippet:
      "export const reset = () => {\n" +
      "  // oxlint-disable-next-line lernapps/storage-through-wrapper\n" +
      "  localStorage.clear();\n" +
      "};\n",
    reported: true,
  },
  {
    rule: "lernapps(suppression-reason)",
    name: "@ts-ignore",
    snippet: '// @ts-ignore\nexport const count: number = "drei";\n',
    reported: true,
  },
  {
    rule: "lernapps(suppression-reason)",
    name: "suppressions with their reasons",
    snippet:
      "export const reset = () => {\n" +
      "  // oxlint-disable-next-line lernapps/storage-through-wrapper -- removes the data of the app's first version\n" +
      "  localStorage.clear();\n" +
      "};\n" +
      "// @ts-expect-error -- a planted type error with its reason\n" +
      'export const count: number = "drei";\n',
    reported: false,
  },
  {
    rule: "typescript(no-explicit-any)",
    name: "any",
    snippet: "export const value: any = 1;\n",
    reported: true,
  },
];

describe.skipIf(inner)("an app that only extends the preset", () => {
  let app = "";
  let head = "";

  beforeAll(() => {
    const tooling = freshClone();
    app = tempDir("preset-app");
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    for (const [file, content] of Object.entries(appFiles(tooling))) {
      mkdirSync(dirname(join(app, file)), { recursive: true });
      writeFileSync(join(app, file), content);
    }
    ok("npm", ["install", "--no-audit", "--no-fund"], app);
    ok(join(app, "node_modules/.bin/vp"), ["fmt"], app); // the generator writes formatted files
    ok("git", ["add", "--all"], app);
    ok("git", ["commit", "--quiet", "--no-verify", "--message", "app"], app);
    head = ok("git", ["rev-parse", "HEAD"], app).stdout.trim();
  }, SLOW);

  afterEach(() => {
    ok("git", ["reset", "--quiet", "--hard", head], app);
    ok("git", ["clean", "--quiet", "-fd"], app);
  });

  const plant = (file: string, content: string) => {
    mkdirSync(dirname(join(app, file)), { recursive: true });
    writeFileSync(join(app, file), content);
  };
  const failures = () => /prePushFailures: (\d+)/.exec(readFileSync(join(app, ".vibe/plan.md"), "utf8"))?.[1];
  /** A bare repo as the app's remote; returns the push and whether the remote got the branch. */
  const push = () => {
    const remote = tempDir("remote");
    ok("git", ["init", "--quiet", "--bare", remote], app);
    const result = run("git", ["push", remote, "main"], app);
    const arrived = run("git", ["rev-parse", "--verify", "--quiet", "main"], remote).code === 0;
    return { result, arrived };
  };

  test("npm install installs the hooks of the preset", () => {
    expect(ok("git", ["config", "core.hooksPath"], app).stdout.trim()).toBe(`${HOOKS}/_`);
  });

  test("the app passes both hooks: its commit and its push go through", { timeout: SLOW }, () => {
    plant(
      "src/messages/de.json",
      `${JSON.stringify({ next: "Weiter", solved: "Du hast {count} Aufgaben gelöst." }, null, 2)}\n`,
    );
    plant("index.html", readFileSync(join(app, "index.html"), "utf8").replace(">Nächste Aufgabe<", ">Weiter<"));
    ok("git", ["add", "--all"], app);
    const commit = run("git", ["commit", "--message", "shorter button"], app);
    expect(commit.code, output(commit)).toBe(0);
    const { result, arrived } = push();
    expect(result.code, output(result)).toBe(0);
    expect(arrived).toBe(true);
    expect(failures()).toBe("0");
  });

  test("a lint violation stops git commit with the rule's message and link", { timeout: SLOW }, () => {
    plant("src/planted.ts", 'export const remember = () => localStorage.setItem("count", "1");\n');
    ok("git", ["add", "src/planted.ts"], app);
    const result = run("git", ["commit", "--message", "planted"], app);
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toContain("src/planted.ts");
    expect(output(result)).toContain("lernapps(storage-through-wrapper)");
    expect(output(result)).toContain("createStorage");
    expect(output(result)).toContain(`${RULES}storage-through-wrapper`);
    expect(ok("git", ["rev-parse", "HEAD"], app).stdout.trim()).toBe(head);
  });

  test("a request to another host stops git push and counts the failed push", { timeout: SLOW }, () => {
    const page = readFileSync(join(app, "index.html"), "utf8");
    plant(
      "index.html",
      page.replace(
        "    <main>\n",
        '    <main>\n      <img src="https://bilder.example.org/bruch.png" alt="Ein Bruch" />\n',
      ),
    );
    ok("git", ["add", "index.html"], app);
    const commit = run("git", ["commit", "--message", "a picture from another host"], app);
    expect(commit.code, output(commit)).toBe(0);
    const { result, arrived } = push();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toContain("rule: no-request-before-click");
    expect(output(result)).toContain("bilder.example.org");
    expect(arrived).toBe(false);
    expect(failures()).toBe("1");
  });

  test.each(verdicts)("$rule on $name: reported $reported", { timeout: SLOW }, ({ rule, snippet, reported }) => {
    plant("src/snippet.ts", snippet);
    const result = run(join(app, "node_modules/.bin/vp"), ["lint", "src/snippet.ts"], app);
    if (reported) {
      expect(result.code, output(result)).not.toBe(0);
      expect(output(result)).toContain(rule);
      const id = /^lernapps\((.+)\)$/.exec(rule)?.[1];
      if (id !== undefined) expect(output(result)).toContain(`${RULES}${id}`);
    } else {
      expect(output(result)).not.toContain(rule);
      expect(result.code, output(result)).toBe(0);
    }
  });
});

// Not inside a test copy: the rule catalog's tests plant lint rules there that have no snippets.
test.skipIf(inner)("every lint rule of the package has a reported and a passing snippet", () => {
  const ids = readdirSync(join(repoRoot, "lint/rules"))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => basename(file, ".ts"));
  expect(ids.length).toBeGreaterThan(0);
  for (const id of ids) {
    const cases = verdicts.filter((verdict) => verdict.rule === `lernapps(${id})`);
    expect(
      cases.map((verdict) => verdict.reported),
      id,
    ).toEqual(expect.arrayContaining([true, false]));
  }
});
