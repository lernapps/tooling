// The contract of `lernapps check` in an app's repo, end to end: `--pre-push` builds, checks the built app, runs the
// Playwright tests and the dependency licences, and counts a failed run in the plan's front matter; the fast part
// does not build and does not count. A failing test of the archetype's runtime (@lernapps/app-templates, its generic
// tests) is named as a test of the template, with where to report it; a failing test of the app's own is not.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { app, findingsOf, lernapps, output, report } from "./check-report.ts";
import { ok, repoRoot, tempDir } from "./support.ts";

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
            '  use: { baseURL: "http://127.0.0.1:4179/" },',
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
});
