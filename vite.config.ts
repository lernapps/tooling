// The toolchain of the tooling itself (vite-plus): format, lint with type check, tests, package build and
// the staged files of the pre-commit hook. The same conventions the tooling gives apps: strict TypeScript,
// no `any`, no JavaScript sources.
import { defineConfig } from "vite-plus";

// Not code: prose, the docs site's static files, workflows and actions, files written by tools.
const notCode = [
  "_site/**",
  "dist/**",
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
    entry: { cli: "src/cli.ts" },
    format: "esm",
    platform: "node",
    dts: false,
  },
  staged: {
    // Formats and fixes the staged files before the hook runs the fast part of `lernapps check`.
    "*.{ts,json}": "vp check --fix",
  },
});
