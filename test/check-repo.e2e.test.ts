// The contract of `lernapps check` in an app's repo, end to end: `--pre-push` builds, checks the built app, runs the
// Playwright tests and the dependency licences, and counts a failed run in the plan's front matter; the fast part
// does not build and does not count. A failing test of the archetype's runtime (@lernapps/app-templates, its generic
// tests) is named as a test of the template, with where to report it; a failing test of the app's own is not.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, test } from "vite-plus/test";
import { app, findingsOf, lernapps, output, report } from "./check-report.ts";
import { DEFAULTS } from "../changes/changes.ts";
import { ok, repoRoot, tempDir, testEnv } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 5 * 60 * 1000;

/**
 * An app's repo: the fixture's built files as its source (index.html), the toolchain from the tooling's own
 * node_modules (linked), a plan file, and the files given. `git init` so the report names a commit.
 */
function project(files: Record<string, string>, source = app("passing")): string {
  const dir = tempDir("app");
  cpSync(source, dir, { recursive: true });
  mkdirSync(join(dir, "node_modules"));
  for (const name of readdirSync(join(repoRoot, "node_modules"))) {
    symlinkSync(join(repoRoot, "node_modules", name), join(dir, "node_modules", name));
  }
  const all: Record<string, string> = {
    "package.json": `${JSON.stringify({ name: "app", private: true, type: "module" }, null, 2)}\n`,
    "vite.config.ts": [
      'import { defineConfig } from "vite-plus";',
      "",
      "export default defineConfig({",
      '  build: { rollupOptions: { input: ["index.html", "kuerzen/index.html"] } },',
      "});",
      "",
    ].join("\n"),
    ".vibe/plans/01-first-version.md": "---\narchetype: quiz\nphase: code\nprePushFailures: 0\n---\n\n# Plan\n",
    ...files,
  };
  for (const [file, content] of Object.entries(all)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  writeFileSync(join(dir, ".gitignore"), "node_modules/\ndist/\n");
  ok(join(dir, "node_modules", ".bin", "vp"), ["fmt"], dir); // the fixture's pages as the app's formatted source
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  ok("git", ["add", "--all"], dir);
  ok("git", ["commit", "--quiet", "--no-verify", "--message", "app"], dir);
  return dir;
}

/** A Playwright configuration for the planted tests, which open no page: no server needed. */
const PLAYWRIGHT_CONFIG = [
  'import { defineConfig } from "playwright/test";',
  "",
  'export default defineConfig({ testDir: "e2e", testMatch: "*.e2e.ts" });',
  "",
].join("\n");

const failures = (dir: string) =>
  /prePushFailures: (\d+)/.exec(readFileSync(join(dir, ".vibe/plans/01-first-version.md"), "utf8"))?.[1];

describe.skipIf(inner)("lernapps check in an app's repo", () => {
  test("--pre-push builds and checks the built app; passing, it prints one line", { timeout: SLOW }, () => {
    const dir = project({});
    const result = lernapps(["check", "--pre-push"], dir);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    expect(failures(dir)).toBe("0");
  });

  test(
    "the fast part does not build and does not count; without a flag a failure is not counted",
    {
      timeout: SLOW,
    },
    () => {
      const dir = project({}, app("request-before-click"));
      const fast = lernapps(["check", "--pre-commit"], dir);
      expect(fast.code, output(fast)).toBe(0);
      expect(readdirSync(dir)).not.toContain("dist");
      const all = lernapps(["check"], dir);
      expect(all.code, output(all)).toBe(1);
      expect(failures(dir)).toBe("0");
    },
  );

  test(
    "a failed --pre-push reports the built app's finding and a failing Playwright test, and counts the failure; a bad licence fails the next run, counted again",
    { timeout: SLOW },
    () => {
      const dir = project(
        {
          "playwright.config.ts": [
            'import { defineConfig } from "playwright/test";',
            "",
            "export default defineConfig({",
            '  testDir: "e2e",',
            '  testMatch: "*.e2e.ts",',
            '  use: { baseURL: "http://127.0.0.1:4179/", launchOptions: { executablePath: process.env.LERNAPPS_CHROMIUM } },',
            '  webServer: { command: "vp preview --host 127.0.0.1 --port 4179 --strictPort", url: "http://127.0.0.1:4179/" },',
            "});",
            "",
          ].join("\n"),
          "e2e/start.e2e.ts": [
            'import { expect, test } from "playwright/test";',
            "",
            'test("the start page names the planted topic", async ({ page }) => {',
            '  await page.goto("/");',
            '  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Brüche erweitern");',
            "});",
            "",
          ].join("\n"),
        },
        app("request-before-click"),
      );
      // run 1: the built app's finding and the failing Playwright test; counted once
      const first = lernapps(["check", "--pre-push"], dir);
      expect(first.code, output(first)).toBe(1);
      expect(findingsOf(first, "no-request-before-click").length).toBeGreaterThan(0);
      const e2e = findingsOf(first, "checks-pass").filter((finding) => finding.where === "playwright test");
      expect(e2e, output(first)).toHaveLength(1);
      // the app's own test: not a test of the template
      expect(e2e[0]?.found).not.toContain("@lernapps/app-templates");
      expect(first.stderr).toContain("Brüche erweitern");
      expect(report(first).checked["commit"]).toMatch(/^[0-9a-f]{40}$/);
      expect(failures(dir)).toBe("1");
      // run 2: a dependency with a licence outside the allowlist; counted again
      writeFileSync(
        join(dir, "package.json"),
        `${JSON.stringify({ name: "app", private: true, type: "module", dependencies: { "copyleft-lib": "1.0.0" } }, null, 2)}\n`,
      );
      mkdirSync(join(dir, "node_modules/copyleft-lib"));
      writeFileSync(
        join(dir, "node_modules/copyleft-lib/package.json"),
        `${JSON.stringify({ name: "copyleft-lib", version: "1.0.0", license: "GPL-3.0-only" })}\n`,
      );
      const second = lernapps(["check", "--pre-push"], dir);
      expect(second.code, output(second)).toBe(1);
      const found = findingsOf(second, "dependency-licence");
      expect(found).toHaveLength(1);
      expect(`${found[0]?.where} ${found[0]?.found}`).toContain("copyleft-lib");
      expect(found[0]?.found).toContain("GPL-3.0-only");
      expect(failures(dir)).toBe("2");
    },
  );

  test(
    "a failing generic test of the runtime @lernapps/app-templates is named as a test of the template, with where to report it",
    { timeout: SLOW },
    () => {
      const dir = project({
        "playwright.config.ts": PLAYWRIGHT_CONFIG,
        "e2e/quiz.e2e.ts": 'import { quizTests } from "@lernapps/app-templates/quiz/e2e";\n\nquizTests();\n',
      });
      // the runtime, with a bug in one of its generic tests, as an app installs it: in node_modules/@lernapps/
      rmSync(join(dir, "node_modules/@lernapps"));
      const runtime = join(dir, "node_modules/@lernapps/app-templates");
      mkdirSync(join(runtime, "dist"), { recursive: true });
      writeFileSync(
        join(runtime, "package.json"),
        `${JSON.stringify({ name: "@lernapps/app-templates", type: "module", exports: { "./quiz/e2e": "./dist/quiz-e2e.mjs" } })}\n`,
      );
      writeFileSync(
        join(runtime, "dist/quiz-e2e.mjs"),
        [
          'import { expect, test } from "playwright/test";',
          "export function quizTests() {",
          '  test.describe("quiz", () => {',
          '    test("every question opens by its link", () => expect(true).toBe(true));',
          '    test("all right answers give the full score", () => expect("a bug").toBe("fixed"));',
          "  });",
          "}",
          "",
        ].join("\n"),
      );
      const result = lernapps(["check", "--pre-push"], dir);
      expect(result.code, output(result)).toBe(1);
      const e2e = findingsOf(result, "checks-pass").filter((finding) => finding.where === "playwright test");
      expect(e2e, output(result)).toHaveLength(1);
      expect(e2e[0]?.found).toContain("generic test of the template's runtime @lernapps/app-templates");
      expect(e2e[0]?.found).toContain("quiz › all right answers give the full score");
      expect(e2e[0]?.found).not.toContain("every question opens by its link");
      expect(e2e[0]?.fix).toContain("bug in the template");
      expect(e2e[0]?.fix).toContain("https://github.com/lernapps/app-templates/issues");
      expect(e2e[0]?.fix).toContain("Never change the tests or the configuration");
      expect(e2e[0]?.fix).toContain("lernapps update");
    },
  );

  // Spike (not a contract yet): can Vite+'s task cache (`vp run`, node_modules/vite-plus/docs/guide/cache.md) skip a
  // second `--pre-push` of a state that already passed, whoever ran the first (the assistant before its pull request,
  // the pre-push hook)? It fingerprints the files the command read and the folders it listed, the arguments and the
  // declared environment, and replays a passing run's output. What changes nothing at runtime is no input: the change
  // scope's plan and docs (DEFAULTS.app of changes/changes.ts, which already let a push of only those skip the hook).
  // Each step records what the spike found; whether to build on it is open.
  test("spike: vp run caches a passing --pre-push; only a runtime change runs it again", { timeout: SLOW }, () => {
    const cli = join(repoRoot, "src/cli.ts");
    const scope = DEFAULTS.app;
    // Patterns of files, and the folders they live in: the check lists them (e.g. docs/arc42), and a listing is an
    // input of its own, so a file added there would miss.
    const ignored = [...scope.none, ...scope.docs, ".vibe", "docs", "docs/**"].map((pattern) => `!${pattern}`);
    const input = [
      { auto: true },
      // the check's own cache: read and written by each run (playwright-results.json), which vp refuses to cache
      "!node_modules/.cache/lernapps/**",
      "!test-results/**",
      ...ignored,
    ];
    const dir = project({
      "vite.config.ts": [
        'import { defineConfig } from "vite-plus";',
        "",
        "export default defineConfig({",
        '  build: { rollupOptions: { input: ["index.html", "kuerzen/index.html"] } },',
        "  run: {",
        "    tasks: {",
        '      "check-push": {',
        `        command: ${JSON.stringify(`node ${cli} check --pre-push`)},`,
        // a task runs in a clean environment: Playwright's browser folder is passed on, but is no part of the key
        `        cache: { untrackedEnv: ["PLAYWRIGHT_BROWSERS_PATH"], input: ${JSON.stringify(input)} },`,
        "      },",
        "    },",
        "  },",
        "});",
        "",
      ].join("\n"),
      "playwright.config.ts": [
        'import { defineConfig } from "playwright/test";',
        "",
        "export default defineConfig({",
        '  testDir: "e2e",',
        '  testMatch: "*.e2e.ts",',
        '  use: { baseURL: "http://127.0.0.1:4181/", launchOptions: { executablePath: process.env.LERNAPPS_CHROMIUM } },',
        '  webServer: { command: "vp preview --host 127.0.0.1 --port 4181 --strictPort", url: "http://127.0.0.1:4181/" },',
        "});",
        "",
      ].join("\n"),
      "e2e/start.e2e.ts": [
        'import { expect, test } from "playwright/test";',
        "",
        'test("the start page has a heading", async ({ page }) => {',
        '  await page.goto("/");',
        '  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();',
        "});",
        "",
      ].join("\n"),
      "docs/arc42/01-introduction-and-goals.arc42.md": "# Introduction and goals\n",
      "README.md": "# App\n",
    });
    // its own task cache (node_modules/.vite/task-cache), not the tooling's, which project() links with the rest
    rmSync(join(dir, "node_modules", ".vite"), { force: true });
    const plan = join(dir, ".vibe/plans/01-first-version.md");
    const append = (file: string, text: string) =>
      writeFileSync(join(dir, file), `${readFileSync(join(dir, file), "utf8")}${text}`);
    const vp = (input = "") => {
      const result = spawnSync(join(dir, "node_modules", ".bin", "vp"), ["run", "check-push"], {
        cwd: dir,
        env: testEnv,
        input,
        encoding: "utf8",
      });
      return { code: result.status ?? 1, text: `${result.stdout}\n${result.stderr}` };
    };
    const hit = /cache hit, replaying/;

    // 1. The first run checks everything (build, the built app in Chromium, the Playwright test with its server).
    const first = vp();
    expect(first.code, first.text).toBe(0);
    expect(first.text).not.toMatch(/cache hit|not cached/);
    // 2. Unchanged: replayed, nothing runs; the report of the first run is restored as an output.
    const second = vp();
    expect(second.code, second.text).toBe(0);
    expect(second.text).toMatch(hit);
    expect(readFileSync(join(dir, "node_modules/.cache/lernapps/validation-report.yaml"), "utf8")).toContain(
      "pre-push",
    );
    // 3. The pushed refs on standard input (as the pre-push hook gets them) reach the task, but are no input.
    const head = ok("git", ["rev-parse", "HEAD"], dir).stdout.trim();
    expect(vp(`refs/heads/main ${head} refs/heads/main ${"0".repeat(40)}\n`).text).toMatch(hit);
    // 4. Not at runtime, so no input: a ticked box and the next phase in the plan, a changed or a new page of the
    //    architecture, the README (which the check does not read).
    writeFileSync(plan, `${readFileSync(plan, "utf8").replace("phase: code", "phase: commit")}\n- [x] a task\n`);
    append("docs/arc42/01-introduction-and-goals.arc42.md", "More.\n");
    writeFileSync(join(dir, "docs/arc42/02-constraints.arc42.md"), "# Constraints\n");
    append("README.md", "More.\n");
    expect(vp().text).toMatch(hit);
    // 5. A commit of those files: still a hit (git's own files are no input). A gap: the replayed line and the
    //    restored report name the commit of the first run, not the one pushed.
    ok("git", ["add", "--all"], dir);
    ok("git", ["commit", "--quiet", "--no-verify", "--message", "plan and docs"], dir);
    const afterCommit = vp();
    expect(afterCommit.text).toMatch(hit);
    expect(afterCommit.text).toContain(`(commit ${head.slice(0, 7)})`);
    // 6. A gap: a new file at the root misses, even one that changes nothing at runtime: the check lists the root.
    writeFileSync(join(dir, "NOTES.md"), "# Notes\n");
    expect(vp().text).toContain("cache miss: 'NOTES.md' added in workspace root");
    // 7. A gap: a file in node_modules (here one the check reads at runtime) is no input. package.json is: it pins
    //    the tooling, so `lernapps update` runs the check again.
    const axe = join(dir, "node_modules", "axe-core");
    rmSync(axe);
    cpSync(join(repoRoot, "node_modules", "axe-core"), axe, { recursive: true });
    append("node_modules/axe-core/axe.min.js", "\n/* changed */\n");
    expect(vp().text).toMatch(hit);
    const manifest = join(dir, "package.json");
    writeFileSync(
      manifest,
      readFileSync(manifest, "utf8").replace('"private": true', '"private": true, "version": "1.0.1"'),
    );
    expect(vp().text).toContain("cache miss: 'package.json' modified");
    // 8. A change at runtime: a miss; a failing run is never cached, it runs and fails again.
    writeFileSync(
      join(dir, "index.html"),
      readFileSync(join(dir, "index.html"), "utf8").replace(
        "</head>",
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto"></head>',
      ),
    );
    const failing = vp();
    expect(failing.code, failing.text).toBe(1);
    expect(failing.text).toContain("cache miss: 'index.html' modified");
    const again = vp();
    expect(again.code, again.text).toBe(1);
    expect(again.text).not.toMatch(hit);
  });
});
