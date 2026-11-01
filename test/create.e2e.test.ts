// The contract of the generator and its archetypes, end to end: `lernapps create --archetype quiz` in a
// temporary folder, then a question bank, gives an app that passes `lernapps check` without further code.
//   - it runs as an assistant starts it, with npx and nothing installed (`npx --yes @lernapps/tooling create ...`, here
//     the package packed from a fresh clone of this repo): npm installs the package and its dependency
//     @lernapps/app-templates, the app depends on the versions and its workflows use the actions of the tag of this
//     version, `npm install` installs the hooks;
//   - the hooks go into the app's own repository only: in a folder inside another repository (as a template folder
//     sits in lernapps/app-templates), `npm install` leaves that repository's hooks alone;
//   - what it writes, and what it refuses, is tested on files alone in create.test.ts, on every push;
//   - the app with the fixture bank (test/fixtures/quiz/quiz.json, every type of question) passes `lernapps check`,
//     which runs the quiz's generic end-to-end tests (quizTests of @lernapps/app-templates) on that bank in a browser;
//   - its publish workflow runs on every push to main and pull request, with no paths filter: the actions decide what
//     a change can affect (lernapps changes), so a push of only the plan (.vibe/) checks and publishes nothing;
//   - a failing generic test of the runtime (quizTests, patched in the installed copy) is named as a test of the
//     template: Playwright's report locates it below node_modules/@lernapps/app-templates/;
//   - `lernapps update` leaves an app at the versions of the tooling alone and keeps a local copy of the tooling; which
//     range moves when is tested on its own (cli.test.ts, nextRange).
//   - an explainer app from the same generator passes `lernapps check` as generated, `lernapps update` leaves it as it
//     is and adds the content guide to an app made before it, a Vue component passes the commit's part of the
//     check (vue-tsc checks the app's code, not the runtime's in node_modules) and one with a type error fails it in
//     vue-tsc. Kept to that:
//     the explainer's own tests (every block, exercise and component) run in lernapps/app-templates.
// The quiz runtime itself (the browser behaviour, the page without JavaScript, the messages for a broken bank) is
// tested in lernapps/app-templates, where it lives: its unit tests and quizTests.
// The templates come from the package @lernapps/app-templates installed next to this one, or the copy named by
// LERNAPPS_TEMPLATES (support.ts, appTemplates).
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { findingsOf, output } from "./check-report.ts";
import { appTemplates, confirmedPlan, ok, packedTooling, repoRoot, run, tempDir, templatesVersion } from "./support.ts";

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

const freshTooling = packedTooling;
/** The version of this package, which the app's workflows name as the tag of their actions. */
const version = (JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { version: string }).version;

describe.skipIf(inner)("a quiz app from lernapps create, run with npx", () => {
  let templates = "";
  let app = "";
  let tooling = "";

  beforeAll(async () => {
    templates = appTemplates();
    tooling = `file:${freshTooling()}`;
    const parent = tempDir("quiz");
    app = join(parent, "naturwunder");
    // as the plan template says, in the folder of the confirmed plan, where nothing is installed
    confirmedPlan(app, "quiz");
    const created = run(
      "npx",
      [
        "--yes",
        `--package=${freshTooling()}`,
        "--",
        "lernapps",
        "create",
        "--archetype",
        "quiz",
        app,
        "--templates",
        templates,
        "--tooling",
        tooling,
      ],
      parent,
    );
    if (created.code !== 0) throw new Error(output(created));
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    ok("npm", ["install", "--no-audit", "--no-fund"], app);
    cpSync(BANK, join(app, "src/quiz.json"));
    ok(join(app, "node_modules/.bin/vp"), ["fmt"], app); // as the pre-commit hook formats it
  }, SLOW);

  test("npm install installs the hooks of the package", () => {
    expect(ok("git", ["config", "core.hooksPath"], app).stdout.trim()).toBe("node_modules/.cache/lernapps/hooks/_");
  });

  test("the app depends on the tooling it was told to and on the runtime's version, and its workflows use the tag's actions", () => {
    const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    expect(manifest.devDependencies["@lernapps/tooling"]).toBe(tooling);
    expect(manifest.devDependencies["@lernapps/app-templates"]).toBe(`^${templatesVersion()}`);
    const pages = readFileSync(join(app, ".github/workflows/pages.yml"), "utf8");
    expect(pages).toContain(`uses: lernapps/tooling/actions/app-check@v${version}`);
    expect(pages).toContain(`uses: lernapps/tooling/actions/app-publish@v${version}`);
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
    const manifest = () =>
      JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as { devDependencies: Record<string, string> };

    test(
      "leaves the runtime at the version of the tooling and keeps a local copy of the tooling",
      { timeout: SLOW },
      () => {
        const before = manifest().devDependencies;
        const result = run("npx", ["--no", "--", "lernapps", "update"], app);
        expect(result.code, output(result)).toBe(0);
        expect(result.stdout).toContain(`@lernapps/app-templates: unchanged (^${templatesVersion()})`);
        expect(result.stdout).toContain(`@lernapps/tooling: kept ${tooling}, a local copy`);
        expect(manifest().devDependencies).toEqual(before);
        expect(result.stdout).toContain("npx lernapps check");
      },
    );
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
describe.skipIf(inner)("an explainer app from lernapps create, run with npx", () => {
  let app = "";

  beforeAll(async () => {
    const templates = appTemplates();
    const parent = tempDir("explainer");
    app = join(parent, "prozent");
    confirmedPlan(app, "explainer");
    const created = run(
      "npx",
      [
        "--yes",
        `--package=${freshTooling()}`,
        "--",
        "lernapps",
        "create",
        "--archetype",
        "explainer",
        app,
        "--templates",
        templates,
        "--tooling",
        `file:${freshTooling()}`,
      ],
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

  test("lernapps update finds it at the versions and leaves it as it is", { timeout: SLOW }, () => {
    const before = readFileSync(join(app, "package.json"), "utf8");
    const result = run("npx", ["--no", "--", "lernapps", "update"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toContain("@lernapps/app-templates: unchanged");
    expect(result.stdout).toContain("@lernapps/tooling: kept file:");
    // run as the app's own tooling, it knows no newer version: it names the command that does
    expect(result.stdout).toContain(
      "this is the app's own tooling, which knows only its own version; for the latest run: npx --yes @lernapps/tooling@latest update",
    );
    expect(readFileSync(join(app, "package.json"), "utf8")).toBe(before);
  });

  test("lernapps update adds the content guide to an app made before it, and says so", { timeout: SLOW }, () => {
    const guide = join(app, ".agents/skills/app-content/SKILL.md");
    const written = readFileSync(guide, "utf8");
    rmSync(join(app, ".agents"), { recursive: true, force: true });
    rmSync(join(app, ".claude"), { recursive: true, force: true });
    const result = run("npx", ["--no", "--", "lernapps", "update"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toContain("content guide: added .agents/skills/app-content/SKILL.md");
    expect(readFileSync(guide, "utf8")).toBe(written);
    expect(readFileSync(join(app, ".claude/skills/app-content/SKILL.md"), "utf8")).toBe(written);
  });

  test(
    "a Vue component passes the commit's part of the check: vue-tsc checks the app's code, not the runtime's",
    {
      timeout: SLOW,
    },
    () => {
      const component = "src/components/Zahl.vue";
      mkdirSync(join(app, "src/components"), { recursive: true });
      writeFileSync(
        join(app, component),
        '<script setup lang="ts">\nconst count = 3;\n</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n',
      );
      ok("git", ["add", component], app);
      try {
        const result = run("npx", ["--no", "--", "lernapps", "check", "--pre-commit"], app);
        expect(result.code, output(result)).toBe(0);
      } finally {
        ok("git", ["rm", "--quiet", "--force", component], app);
      }
    },
  );

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

// The interactive archetype with the same generator, kept to what the tooling adds: the template passes the check as
// generated (its runtime's tests run in lernapps/app-templates), and its architecture (docs/arc42/, the generic part
// and the interactive extension of app-templates with the app's paths) validates strictly in the app, before anything
// is added to git; the first commit
// passes the pre-commit hook, also after an earlier commit (arc42 diff, with .arc42ignore applied and its review hints
// as warnings), new code that no block claims fails the commit's check (arc42 diff --staged), even with ARC42_CONSISTENT,
// a broken architecture fails the check, and lernapps update keeps the app's own sections and replaces the rest.
describe.skipIf(inner)("an interactive app from lernapps create, run with npx", () => {
  let app = "";
  const arc42 = (...args: string[]) => run(join(app, "node_modules/.bin/arc42"), ["--dir", "docs/arc42", ...args], app);
  const blocks = () => join(app, "docs/arc42/05-building-blocks.arc42.md");
  const commit = (message: string) =>
    run(
      "git",
      ["-c", "user.name=t", "-c", "user.email=t@example.org", "-c", "maintenance.auto=false", "commit", "-qm", message],
      app,
    );

  beforeAll(async () => {
    const templates = appTemplates();
    const parent = tempDir("interactive");
    app = join(parent, "zehnfinger");
    confirmedPlan(app, "interactive");
    const created = run(
      "npx",
      [
        "--yes",
        `--package=${freshTooling()}`,
        "--",
        "lernapps",
        "create",
        "--archetype",
        "interactive",
        app,
        "--templates",
        templates,
        "--tooling",
        `file:${freshTooling()}`,
      ],
      parent,
    );
    if (created.code !== 0) throw new Error(output(created));
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    ok("npm", ["install", "--no-audit", "--no-fund"], app);
  }, SLOW);

  // as the creator and the plan go on: nothing added to git yet, which arc42 alone resolves paths from
  test(
    "as generated, nothing added to git, the app passes lernapps check, its architecture included",
    { timeout: SLOW },
    () => {
      expect(ok("git", ["ls-files"], app).stdout).toBe("");
      const result = run("npx", ["--no", "--", "lernapps", "check"], app);
      expect(result.code, output(result)).toBe(0);
      expect(result.stdout).toMatch(/^lernapps check: ok/);
      // the check leaves the repository's index as it was
      expect(ok("git", ["ls-files"], app).stdout).toBe("");
    },
  );

  test("the first commit passes the pre-commit hook", { timeout: SLOW }, () => {
    ok("git", ["add", "--all"], app);
    const result = commit("app");
    expect(result.code, output(result)).toBe(0);
  });

  // as in a repository whose plan was committed before lernapps create: the app's first commit then has a HEAD to
  // compare with and runs arc42 diff, which does not read .arc42ignore and hints at every file under an interface's
  // path; the copy shares the app's node_modules and runs the real hook
  test(
    "the first commit after an earlier one (the plan) passes the pre-commit hook: .arc42ignore holds, a review hint is a warning",
    { timeout: SLOW },
    () => {
      const copy = join(dirname(app), "zehnfinger-planned");
      cpSync(app, copy, {
        recursive: true,
        filter: (source) => !["node_modules", ".git"].includes(source.slice(app.length + 1).split("/")[0] ?? ""),
      });
      symlinkSync(join(app, "node_modules"), join(copy, "node_modules"));
      ok("git", ["init", "--quiet", "--initial-branch=main"], copy);
      // the hooks npm install set up in the app, which the copy shares through node_modules
      const hooksPath = ok("git", ["config", "--local", "core.hooksPath"], app).stdout.trim();
      ok("git", ["config", "--local", "core.hooksPath", hooksPath], copy);
      ok("git", ["add", ".vibe"], copy);
      const plan = run("git", ["-c", "user.name=t", "-c", "user.email=t@example.org", "commit", "-qm", "plan"], copy);
      expect(plan.code, output(plan)).toBe(0);
      ok("git", ["add", "--all"], copy);
      const log = join(copy, "node_modules/.cache/lernapps/pre-commit.log");
      rmSync(log, { force: true });
      const first = run(
        "git",
        ["-c", "user.name=t", "-c", "user.email=t@example.org", "-c", "maintenance.auto=false", "commit", "-qm", "app"],
        copy,
      );
      expect(first.code, `${output(first)}\n${existsSync(log) ? readFileSync(log, "utf8") : ""}`).toBe(0);
      expect(readFileSync(log, "utf8")).toContain("lernapps check --pre-commit");
      // what the hook checked: the diff, whose hint at code under an interface the report keeps as a warning
      const report = readFileSync(join(copy, "node_modules/.cache/lernapps/validation-report.yaml"), "utf8");
      const diffFindings = (
        parse(report) as { findings: { severity: string; where: string; found: string }[] }
      ).findings.filter((finding) => finding.where === "arc42 --dir docs/arc42 diff --staged");
      expect(diffFindings.map((finding) => finding.severity)).toEqual(["warning"]);
      expect(diffFindings[0]?.found).toContain("review whether its element still says what the code does");
      expect(report).not.toContain("src/main.ts");
      expect(report).not.toContain("src/env.d.ts");
    },
  );

  test("its architecture validates strictly: no error, warning or hint", () => {
    const result = arc42("validate", "--strict");
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toContain("0 errors, 0 warnings, 0 hints");
  });

  test("new code that no block claims fails the commit's check, in arc42 diff", { timeout: SLOW }, () => {
    const file = "src/effects/burst.ts";
    mkdirSync(join(app, "src/effects"), { recursive: true });
    writeFileSync(join(app, file), "export const burst = 1;\n");
    ok("git", ["add", file], app);
    try {
      const result = run("npx", ["--no", "--", "lernapps", "check", "--pre-commit"], app);
      expect(result.code, output(result)).toBe(1);
      const failed = findingsOf(result, "checks-pass");
      expect(failed.map((finding) => finding.where)).toEqual(["arc42 --dir docs/arc42 diff --staged"]);
      expect(failed[0]?.found).toContain("src/effects is new code that no building block claims");
      // ARC42_CONSISTENT, set to the HEAD commit without a finding read, accepts no new code
      const accepted = run(
        "env",
        [
          `ARC42_CONSISTENT=${ok("git", ["rev-parse", "HEAD"], app).stdout.trim()}`,
          "npx",
          "--no",
          "--",
          "lernapps",
          "check",
          "--pre-commit",
        ],
        app,
      );
      expect(accepted.code, output(accepted)).toBe(1);
      expect(
        findingsOf(accepted, "checks-pass")
          .filter((finding) => finding.severity === "error")
          .map((finding) => finding.found),
      ).toEqual(["architecture: src/effects is new code that no building block claims"]);
    } finally {
      ok("git", ["rm", "--quiet", "--force", file], app);
    }
  });

  test("a broken architecture fails the check, in arc42 validate", { timeout: SLOW }, () => {
    const original = readFileSync(blocks(), "utf8");
    writeFileSync(
      blocks(),
      original.replace(
        "<!-- app: begin core -->\n",
        "<!-- app: begin core -->\n### Scoring\n\nCounts the letters typed in time.\n\n```arc42\n:::building-block\nid: bb-app-scoring\ntitle: Scoring\nparent: bb-interactive-core\nrequires: if-nowhere\n:::\n```\n\n",
      ),
    );
    try {
      const result = run("npx", ["--no", "--", "lernapps", "check", "--pre-push"], app);
      expect(result.code, output(result)).toBe(1);
      const failed = findingsOf(result, "checks-pass");
      expect(failed.map((finding) => finding.where)).toEqual(["arc42 --dir docs/arc42 validate --strict"]);
      expect(output(result)).toContain("if-nowhere");
    } finally {
      writeFileSync(blocks(), original);
    }
  });

  test("lernapps update keeps the app's own sections and replaces the rest", { timeout: SLOW }, () => {
    const original = readFileSync(blocks(), "utf8");
    const own = "### Scoring\n\nCounts the letters typed in time.\n";
    writeFileSync(
      blocks(),
      original
        .replace("<!-- app: begin core -->\n", `<!-- app: begin core -->\n${own}`)
        .replace("## Core\n", "## Core, edited by hand\n"),
    );
    try {
      const result = run("npx", ["--no", "--", "lernapps", "update"], app);
      expect(result.code, output(result)).toBe(0);
      const text = readFileSync(blocks(), "utf8");
      expect(text).toContain(`<!-- app: begin core -->\n${own}<!-- app: end core -->`);
      expect(text).not.toContain("edited by hand");
      expect(text).toBe(original.replace("<!-- app: begin core -->\n", `<!-- app: begin core -->\n${own}`));
    } finally {
      writeFileSync(blocks(), original);
    }
  });
});
