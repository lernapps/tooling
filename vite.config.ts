// The toolchain of the tooling itself (vite-plus): format, lint with type check, tests, package build and
// the staged files of the pre-commit hook. The same conventions the tooling gives apps: strict TypeScript,
// no `any`, no JavaScript sources.
import { readdirSync } from "node:fs";
import { defineConfig } from "vite-plus";

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
  },
  pack: {
    // The CLI, its checks, and what apps import at runtime: the presets, their helpers and the lint plugin.
    entry: {
      cli: "src/cli.ts",
      ...checks,
      preset: "archetypes/shared/preset.ts",
      playwright: "archetypes/shared/playwright.ts",
      storage: "archetypes/shared/storage.ts",
      i18n: "archetypes/shared/i18n.ts",
      a11y: "archetypes/shared/a11y.ts",
      "quiz-preset": "archetypes/quiz/preset.ts",
      quiz: "archetypes/quiz/engine.ts",
      "quiz-e2e": "archetypes/quiz/e2e.ts",
      lint: "lint/plugin.ts",
    },
    format: "esm",
    platform: "node",
    dts: false,
  },
  staged: {
    // Formats and fixes the staged files before the hook runs the fast part of `lernapps check`.
    "*.{ts,json}": "vp check --fix",
  },
});
