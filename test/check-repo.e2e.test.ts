// The contract of `lernapps check` in an app's repo, end to end: `--pre-push` builds, checks the built app, runs the
// Playwright tests and the dependency licences, and counts a failed run in the plan's front matter; the fast part
// does not build and does not count.
import { cpSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
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
    ".vibe/plan.md": "---\narchetype: quiz\nphase: code\nprePushFailures: 0\n---\n\n# Plan\n",
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

const failures = (dir: string) => /prePushFailures: (\d+)/.exec(readFileSync(join(dir, ".vibe/plan.md"), "utf8"))?.[1];

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
      expect(findingsOf(first, "checks-pass").map((finding) => finding.where)).toContain("playwright test");
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
});
