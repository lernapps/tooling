// The shared base of the archetype presets (docs/arc42 ch. 5, "Archetypes"): the vite-plus configuration an
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
  "lernapps/vue-component-browser-globals": "error",
  "lernapps/vue-component-imports": "error",
  "lernapps/vue-component-no-html-injection": "error",
  "lernapps/vue-component-no-network": "error",
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
    // Formats the staged files before the hook runs the fast part of `lernapps check`, which lints and type-checks the
    // whole app once: `vp check --fix` here would type-check the staged files a second time.
    "*.{ts,tsx,json}": "vp fmt",
  },
};

/** Whether the plugins (nested lists, as Vite takes them) hold one named `name`. */
const hasPlugin = (plugins: unknown, name: string): boolean =>
  Array.isArray(plugins)
    ? plugins.some((plugin) => hasPlugin(plugin, name))
    : typeof plugins === "object" && plugins !== null && "name" in plugins && plugins.name === name;

/**
 * The preset, with the app's own settings merged over it. With the interactive runtime's build step among the
 * plugins, a component may also import the app's own files in src/ and the libraries in its dependencies, as that
 * build allows (lint/rules/vue-component-imports.ts).
 */
export const lernapps = (config: UserConfig = {}): UserConfig => {
  const interactive = hasPlugin(config.plugins, "lernapps-interactive");
  // set in place, not merged: mergeConfig would concatenate the rule's severity with its options
  const base: UserConfig = interactive
    ? {
        ...preset,
        lint: {
          ...preset.lint,
          rules: { ...preset.lint?.rules, "lernapps/vue-component-imports": ["error", { scope: "src" }] },
        },
      }
    : preset;
  return defineConfig(mergeConfig(base, config));
};

export default lernapps();
