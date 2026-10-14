// The contract of the generator and its archetypes, end to end: `lernapps create --archetype quiz` in a
// temporary folder, then a question bank, gives an app that passes `lernapps check` without further code.
//   - it runs as an assistant starts it, with npx from git and nothing installed (`npx --yes github:lernapps/tooling#main
//     create ...`, here from a local clone at its commit): npm prepares the package from git, the app depends on that
//     commit and its workflows use the actions of that commit, `npm install` installs the hooks;
//   - the hooks go into the app's own repository only: in a folder inside another repository (as a template folder
//     sits in lernapps/app-templates), `npm install` leaves that repository's hooks alone;
//   - what it writes, and what it refuses, is tested on files alone in create.test.ts, on every push;
//   - the app with the fixture bank (test/fixtures/quiz/quiz.json, every type of question) passes `lernapps check`,
//     which runs the quiz's generic end-to-end tests (quizTests of @lernapps/app-templates) on that bank in a browser;
//   - its publish workflow runs on every push to main and pull request, with no paths filter: the actions decide what
//     a change can affect (lernapps changes), so a push of only the plan (.vibe/) checks and publishes nothing;
//   - a failing generic test of the runtime (quizTests, patched in the installed copy) is named as a test of the
//     template: Playwright's report locates it below node_modules/@lernapps/app-templates/;
//   - `lernapps update` moves an app on an older runtime to the commit the tooling pins, installs it and says so; a
//     runtime newer than the pin, or one whose order it cannot tell, it keeps, and says so.
//   - an explainer app from the same generator passes `lernapps check` as generated, `lernapps update` leaves it at
//     the pins, and a Vue component with a type error fails the commit's part of the check in vue-tsc. Kept to that:
//     the explainer's own tests (every block, exercise and component) run in lernapps/app-templates.
// The quiz runtime itself (the browser behaviour, the page without JavaScript, the messages for a broken bank) is
// tested in lernapps/app-templates, where it lives: its unit tests and quizTests.
// The templates and the runtime come from a local clone of lernapps/app-templates with the pinned commit: the one named
// by LERNAPPS_TEMPLATES, else one fetched once into a cache (support.ts, appTemplates), so the hooks run these tests as
// CI does. The packages are installed from git.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { findingsOf, output } from "./check-report.ts";
import { appTemplates, freshClone, ok, repoRoot, run, tempDir } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const BANK = join(repoRoot, "test/fixtures/quiz/quiz.json");

/** npx keeps the package it installed in the npm cache (_npx/<hash>/); the test removes what it added there. */
const npxCache = join(ok("npm", ["config", "get", "cache"], repoRoot).stdout.trim(), "_npx");
const npxBefore = existsSync(npxCache) ? new Set(readdirSync(npxCache)) : new Set<string>();

afterAll(async () => {
  for (const dir of existsSync(npxCache) ? readdirSync(npxCache) : []) {
    if (!npxBefore.has(dir)) rmSync(join(npxCache, dir), { recursive: true, force: true });
  }
}, 120_000);

/** The npm spec of one fresh clone of this repo at its commit, shared by the apps of this file. */
let toolingSpec: string | undefined;
const freshTooling = () => {
  if (toolingSpec === undefined) {
    const clone = freshClone();
    toolingSpec = `git+file://${clone}#${ok("git", ["rev-parse", "HEAD"], clone).stdout.trim()}`;
  }
  return toolingSpec;
};

describe.skipIf(inner)("a quiz app from lernapps create, run with npx from git", () => {
  let templates = "";
  let app = "";
  let tooling = "";

  beforeAll(async () => {
    templates = appTemplates();
    tooling = freshTooling();
    const parent = tempDir("quiz");
    app = join(parent, "naturwunder");
    // as the plan template says, in a folder where nothing is installed
    const created = run(
      "npx",
      ["--yes", tooling, "create", "--archetype", "quiz", app, "--templates", templates],
      parent,
    );
    if (created.code !== 0) throw new Error(output(created));
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    ok("npm", ["install", "--no-audit", "--no-fund"], app);
    cpSync(BANK, join(app, "src/quiz.json"));
    ok(join(app, "node_modules/.bin/vp"), ["fmt"], app); // as the pre-commit hook formats it
  }, SLOW);

  test("npm install installs the hooks of the package", () => {
    expect(ok("git", ["config", "core.hooksPath"], app).stdout.trim()).toBe(
      "node_modules/@lernapps/tooling/archetypes/shared/hooks/_",
    );
  });

  test("the app depends on the commit npx installed the generator from, and its workflows use that commit's actions", () => {
    const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    expect(manifest.devDependencies["@lernapps/tooling"]).toBe(tooling);
    const pages = readFileSync(join(app, ".github/workflows/pages.yml"), "utf8");
    const commit = tooling.slice(tooling.indexOf("#") + 1);
    expect(pages).toContain(`uses: lernapps/tooling/actions/app-check@${commit} # main`);
    expect(pages).toContain(`uses: lernapps/tooling/actions/app-publish@${commit} # main`);
  });

  test("the publish workflow runs on every push to main, with no paths filter: the actions skip a plan-only push", () => {
    const pages = parse(readFileSync(join(app, ".github/workflows/pages.yml"), "utf8")) as {
      on: { push: { branches: string[] }; pull_request: unknown };
    };
    expect(pages.on.push).toEqual({ branches: ["main"] });
    expect(pages.on).toHaveProperty("pull_request");
  });

  test("with the fixture bank, the app passes lernapps check", { timeout: SLOW }, () => {
    const result = run("npx", ["--no", "--", "lernapps", "check"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
  });

  test("the check leaves the bundle it checked in dist/, which the app check action deploys", () => {
    expect(readFileSync(join(app, "dist/index.html"), "utf8")).toContain("Naturwunder der Welt");
  });

  test(
    "a failing generic test of the runtime, in the real app, is named as a test of the template",
    { timeout: SLOW },
    () => {
      // the runtime as installed, with a bug in its full run: a copy patched for this test only. quizTests is in
      // dist/quiz-e2e.mjs or in a chunk it shares with the explainer's tests
      const title = "all right answers give the full score, then the solutions show";
      const opening = `test(${JSON.stringify(title)}, async ({ page }) => {`;
      const dist = join(app, "node_modules/@lernapps/app-templates/dist");
      const e2e = readdirSync(dist)
        .filter((file) => file.endsWith(".mjs"))
        .map((file) => join(dist, file))
        .find((file) => readFileSync(file, "utf8").includes(opening));
      if (e2e === undefined) throw new Error(`no file of ${dist} defines the test "${title}"`);
      const original = readFileSync(e2e, "utf8");
      writeFileSync(e2e, original.replace(opening, `${opening} expect("a bug").toBe("fixed");`));
      try {
        const result = run("npx", ["--no", "--", "lernapps", "check", "--pre-push"], app);
        expect(result.code, output(result)).toBe(1);
        const failed = findingsOf(result, "checks-pass").filter((finding) => finding.where === "playwright test");
        expect(failed, output(result)).toHaveLength(1);
        expect(failed[0]?.found).toContain(`a generic test of the template's runtime @lernapps/app-templates`);
        expect(failed[0]?.found).toContain(`"quiz › ${title}"`);
        expect(failed[0]?.fix).toContain("https://github.com/lernapps/app-templates/issues");
      } finally {
        writeFileSync(e2e, original);
      }
    },
  );

  describe("lernapps update", () => {
    const pinned = (
      JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { appTemplates: { commit: string } }
    ).appTemplates.commit;
    const manifest = () =>
      JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as { devDependencies: Record<string, string> };
    const resolved = () =>
      (
        JSON.parse(readFileSync(join(app, "package-lock.json"), "utf8")) as {
          packages: Record<string, { resolved?: string }>;
        }
      ).packages["node_modules/@lernapps/app-templates"]?.resolved ?? "";

    test("moves an older runtime to the commit the tooling pins, and installs it", { timeout: SLOW }, () => {
      const older = ok("git", ["rev-parse", `${pinned}~1`], templates).stdout.trim();
      // the app on the runtime of an older commit, installed
      const runtime = manifest().devDependencies["@lernapps/app-templates"] ?? "";
      expect(runtime).toMatch(new RegExp(`#${pinned}$`));
      const olderSpec = runtime.replace(new RegExp(`#${pinned}$`), `#${older}`);
      ok("npm", ["install", "--no-audit", "--no-fund", "--save-dev", `@lernapps/app-templates@${olderSpec}`], app);
      expect(resolved()).toContain(`#${older}`);

      const result = run("npx", ["--no", "--", "lernapps", "update"], app);
      expect(result.code, output(result)).toBe(0);
      expect(result.stdout).toContain(`@lernapps/app-templates: ${older.slice(0, 7)} → ${pinned.slice(0, 7)}`);
      expect(result.stdout).toContain("@lernapps/tooling: unchanged");
      expect(manifest().devDependencies["@lernapps/app-templates"]).toBe(runtime);
      expect(manifest().devDependencies["@lernapps/tooling"]).toBe(tooling);
      expect(resolved()).toContain(`#${pinned}`);
      expect(result.stdout).toContain("npx lernapps check");
    });

    // The app's runtime stays at the pin; the tooling's pin moves (in the installed copy, for this test only).
    test.each([
      [
        "newer than the pin (as after Renovate)",
        () => ok("git", ["rev-parse", `${pinned}~1`], templates).stdout.trim(),
        "it is newer",
      ],
      [
        "at a commit git cannot fetch, so the order is unknown",
        () => "0123456789abcdef0123456789abcdef01234567",
        "cannot tell whether it is older: git cannot fetch both commits",
      ],
    ])("keeps a runtime %s, and says so", { timeout: SLOW }, (_name, pinOfTooling, why) => {
      const toolingManifest = join(app, "node_modules/@lernapps/tooling/package.json");
      const original = readFileSync(toolingManifest, "utf8");
      const pin = pinOfTooling();
      writeFileSync(toolingManifest, original.replace(pinned, pin));
      try {
        const runtime = manifest().devDependencies["@lernapps/app-templates"];
        const result = run("npx", ["--no", "--", "lernapps", "update"], app);
        expect(result.code, output(result)).toBe(0);
        expect(result.stdout).toContain(
          `@lernapps/app-templates: kept ${pinned.slice(0, 7)}, not moved to ${pin.slice(0, 7)}, the commit this tooling pins: ${why}`,
        );
        expect(manifest().devDependencies["@lernapps/app-templates"]).toBe(runtime);
        expect(resolved()).toContain(`#${pinned}`);
      } finally {
        writeFileSync(toolingManifest, original);
      }
    });
  });

  // Last: it turns the app's folder into a folder of another repository.
  test("npm install in a folder inside another repository leaves that repository's hooks alone", () => {
    rmSync(join(app, ".git"), { recursive: true, force: true });
    const outer = dirname(app);
    ok("git", ["init", "--quiet", "--initial-branch=main"], outer);
    const installed = ok("npm", ["install", "--no-audit", "--no-fund"], app);
    expect(output(installed)).toContain("lernapps hooks: this folder is naturwunder/ inside another git repository");
    expect(run("git", ["config", "core.hooksPath"], outer).stdout).toBe("");
    expect(run("git", ["config", "core.hooksPath"], app).stdout).toBe("");
  });
});

// The explainer archetype with the same generator, kept to what the tooling adds: the template's own content passes
// the check (its runtime's tests run in lernapps/app-templates), a Vue component is type-checked by vue-tsc, and
// lernapps update works on it as on a quiz.
describe.skipIf(inner)("an explainer app from lernapps create, run with npx from git", () => {
  let app = "";

  beforeAll(async () => {
    const templates = appTemplates();
    const parent = tempDir("explainer");
    app = join(parent, "prozent");
    const created = run(
      "npx",
      ["--yes", freshTooling(), "create", "--archetype", "explainer", app, "--templates", templates],
      parent,
    );
    if (created.code !== 0) throw new Error(output(created));
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    ok("npm", ["install", "--no-audit", "--no-fund"], app);
  }, SLOW);

  test("as generated, the app passes lernapps check", { timeout: SLOW }, () => {
    const result = run("npx", ["--no", "--", "lernapps", "check"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
    expect(readFileSync(join(app, "dist/prozent/prozentwert/index.html"), "utf8")).toContain("Prozentwert");
  });

  test("lernapps update finds it at the pins and leaves it as it is", { timeout: SLOW }, () => {
    const before = readFileSync(join(app, "package.json"), "utf8");
    const result = run("npx", ["--no", "--", "lernapps", "update"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toContain("@lernapps/app-templates: unchanged");
    expect(result.stdout).toContain("@lernapps/tooling: unchanged");
    expect(readFileSync(join(app, "package.json"), "utf8")).toBe(before);
  });

  test("a Vue component with a type error fails the commit's part of the check, in vue-tsc", { timeout: SLOW }, () => {
    const component = "src/components/Zahl.vue";
    mkdirSync(join(app, "src/components"), { recursive: true });
    writeFileSync(
      join(app, component),
      '<script setup lang="ts">\nconst count: number = "drei";\n</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n',
    );
    ok("git", ["add", component], app);
    try {
      const result = run("npx", ["--no", "--", "lernapps", "check", "--pre-commit"], app);
      expect(result.code, output(result)).toBe(1);
      const failed = findingsOf(result, "checks-pass");
      expect(failed.map((finding) => finding.where)).toEqual(["vue-tsc --noEmit"]);
      expect(output(result)).toContain("Zahl.vue");
    } finally {
      ok("git", ["rm", "--quiet", "--force", component], app);
    }
  });
});
