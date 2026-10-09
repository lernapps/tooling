// The shared base of the archetype presets (docs/arc42 ch. 5, "Archetype presets"): the vite-plus configuration an
// app extends and never edits. Its vite.config.ts is
//
//   import { lernapps } from "@lernapps/tooling/preset";
//   export default lernapps();
//
// with the app's own settings, if any, as the argument (merged over the preset). It sets lint (the lernapps lint
// plugin and the severity of each of its rules, type-aware with type check, no `any`), format, unit tests, the
// staged files of the pre-commit hook, and a build with relative URLs, so the app works under any path.
import { defineConfig, mergeConfig, type UserConfig } from "vite-plus";

/** Not code: what tools write, and prose. */
const notCode = ["dist/**", "node_modules/**", "playwright-report/**", "test-results/**", "**/*.md"];

/** The severity of each rule of the lint plugin (lint/rules/<id>.ts), as `lernapps/<id>`. */
const lernappsRules = {
  "lernapps/learner-text-german": "error",
  "lernapps/no-request-before-click": "error",
  "lernapps/storage-through-wrapper": "error",
  "lernapps/suppression-reason": "error",
} as const;

const preset: UserConfig = {
  base: "./",
  fmt: {
    printWidth: 120,
    ignorePatterns: notCode,
  },
  lint: {
    ignorePatterns: notCode,
    jsPlugins: ["@lernapps/tooling/lint"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      ...lernappsRules,
      "typescript/no-explicit-any": "error",
    },
  },
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
  },
  staged: {
    // Formats and fixes the staged files before the hook runs the fast part of `lernapps check`.
    "*.{ts,tsx,json}": "vp check --fix",
  },
};

/** The preset, with the app's own settings merged over it. */
export const lernapps = (config: UserConfig = {}): UserConfig => defineConfig(mergeConfig(preset, config));

export default lernapps();
