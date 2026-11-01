// The toolchain of the tooling itself (vite-plus): format, lint with type check, tests, package build and
// the staged files of the pre-commit hook. The same conventions the tooling gives apps: strict TypeScript,
// no `any`, no JavaScript sources.
import { readdirSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { defineConfig } from "vite-plus";
import { HEAVY_TESTS } from "./scripts/pre-push.ts";

// The checks of the check CLI, each its own module next to the CLI (dist/check/rules/), loaded by the CLI at runtime.
const checks = Object.fromEntries(
  readdirSync("check/rules")
    .filter((file) => file.endsWith(".ts"))
    .map((file) => [`check/rules/${file.slice(0, -".ts".length)}`, `check/rules/${file}`]),
);

// Not code: prose, the docs site's static files, workflows and actions, files written by tools, the built apps
// the tests check (test/fixtures/apps/, as a build writes them), the fixture app repos of the review, and the clone
// of app-templates in CI.
const notCode = [
  "_site/**",
  ".app-templates/**",
  "dist/**",
  "test/fixtures/apps/**",
  "test/fixtures/reviews/**",
  "docs/**",
  "site/**",
  ".agents/**",
  ".vibe/**",
  ".github/**",
  "actions/**",
  "**/*.md",
  "package-lock.json",
  "skills-lock.json",
];

export default defineConfig({
  fmt: {
    printWidth: 120,
    ignorePatterns: notCode,
  },
  lint: {
    ignorePatterns: notCode,
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "typescript/no-explicit-any": "error",
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
    // LERNAPPS_TESTS=fast leaves out the heavy end-to-end tests: the pre-push hook of a push that changes none of the
    // paths they exercise (scripts/pre-push.ts). CI and every other run run everything.
    exclude: process.env["LERNAPPS_TESTS"] === "fast" ? HEAVY_TESTS : [],
    // One fresh clone with `npm ci`, shared by the test files that need an installed clone.
    globalSetup: ["test/global-setup.ts"],
    // macOS keeps its temporary folders below /var, a link to /private/var. Node resolves a path to the real one
    // (import.meta.resolve, import.meta.url), so a test that compares a path it made with one it resolved would fail
    // there: the tests, and the commands they start, get the real path as their temporary folder.
    env: { TMPDIR: realpathSync(tmpdir()) },
  },
  pack: {
    // The CLI, its checks, and what apps import at runtime: the preset, its helpers and the lint plugin.
    entry: {
      cli: "src/cli.ts",
      ...checks,
      preset: "archetypes/shared/preset.ts",
      playwright: "archetypes/shared/playwright.ts",
      storage: "archetypes/shared/storage.ts",
      i18n: "archetypes/shared/i18n.ts",
      a11y: "archetypes/shared/a11y.ts",
      lint: "lint/plugin.ts",
    },
    format: "esm",
    platform: "node",
    dts: false,
  },
  staged: {
    // Formats the staged files before the hook runs the fast part of `lernapps check`, which lints and type-checks once.
    // A commit of only files the formatter ignores (e.g. skills-lock.json) has nothing to format; that is no error.
    "*.{ts,json}": "vp fmt --no-error-on-unmatched-pattern",
  },
});
