// The Renovate preset (default.json) keeps every pin of the lernapps/tooling commit in a repo the same commit: the
// custom managers find the plain strings Renovate knows nothing of (tooling-ref in a workflow, TOOLING_REF of the
// pre-push hook), and one group moves them together with the actions, changes.yml@ and the @lernapps/tooling pin.
// The matchStrings run here as Renovate runs them (a RegExp with the flag "g", every match of a file whose path
// matches managerFilePatterns) against snippets copied from the workflows and hooks of the lernapps repos.
import { readFileSync } from "node:fs";
import { join, matchesGlob } from "node:path";
import { expect, test } from "vite-plus/test";
import { repoRoot } from "./support.ts";

interface CustomManager {
  customType: string;
  managerFilePatterns: string[];
  matchStrings: string[];
  depNameTemplate: string;
  packageNameTemplate: string;
  datasourceTemplate: string;
  currentValueTemplate: string;
}
interface PackageRule {
  matchDepNames?: string[];
  groupName?: string;
  minimumReleaseAge?: string;
  schedule?: string[];
  automerge?: boolean;
  automergeSchedule?: string[];
}
interface Preset {
  customManagers: CustomManager[];
  packageRules: PackageRule[];
}

const preset = JSON.parse(readFileSync(join(repoRoot, "default.json"), "utf8")) as Preset;

const SHA = "9b9a34c25af4fa397b64f5e01b1640245a1d3726";

/** A pattern of managerFilePatterns: "/regex/" is a regular expression, anything else a glob (as in Renovate). */
const matchesFile = (pattern: string, path: string) =>
  pattern.startsWith("/") && pattern.endsWith("/")
    ? new RegExp(pattern.slice(1, -1)).test(path)
    : matchesGlob(path, pattern);

/** The digests the custom managers extract from a file, as Renovate's regex manager (matchStringsStrategy "any"). */
function extract(path: string, content: string): string[] {
  return preset.customManagers
    .filter((manager) => manager.managerFilePatterns.some((pattern) => matchesFile(pattern, path)))
    .flatMap((manager) =>
      manager.matchStrings.flatMap((source) =>
        [...content.matchAll(new RegExp(source, "g"))].map((match) => match.groups?.["currentDigest"] ?? ""),
      ),
    );
}

// app-templates main, .github/workflows/check.yml
const APP_TEMPLATES_WORKFLOW = `jobs:
  changes:
    uses: lernapps/tooling/.github/workflows/changes.yml@${SHA} # main
    with:
      tooling-ref: ${SHA} # the classifier the pre-push hook runs (TOOLING_REF)

  runtime:
`;

// apps (pull request 16), .github/workflows/pages.yml and pr-preview.yml
const APPS_WORKFLOW = `jobs:
  changes:
    uses: lernapps/tooling/.github/workflows/changes.yml@${SHA} # main
    with:
      tooling-ref: ${SHA} # the commit of @lernapps/tooling in package.json, and TOOLING_REF of the pre-push hook

  build: # builds and checks the site
`;

// lernapps.github.io (pull request 32), .github/workflows/pages.yml and pr-preview.yml
const SITE_WORKFLOW = `jobs:
  changes:
    uses: lernapps/tooling/.github/workflows/changes.yml@${SHA} # main
    with:
      tooling-ref: ${SHA} # the classifier of the same commit, and TOOLING_REF of the pre-push hook
`;

// app-templates main, scripts/pre-push.ts
const APP_TEMPLATES_HOOK = ` * fails on this one). The same commit as \`tooling-ref\` in .github/workflows/check.yml (test/pre-push.test.ts checks it).
 */
export const TOOLING_REF = "${SHA}";
`;

// apps (pull request 16) and lernapps.github.io (pull request 32), scripts/pre-push.mjs
const SITE_HOOK = ` * changes.yml@ in .github/workflows/ (test/pre-push.test.mjs).
 */
export const TOOLING_REF = "${SHA}";
`;

test("tooling-ref in a workflow is the commit of lernapps/tooling", () => {
  for (const workflow of [APP_TEMPLATES_WORKFLOW, APPS_WORKFLOW, SITE_WORKFLOW]) {
    for (const path of [
      ".github/workflows/check.yml",
      ".github/workflows/pages.yml",
      ".github/workflows/pr-preview.yml",
    ]) {
      expect(extract(path, workflow), path).toEqual([SHA]);
    }
  }
});

test("TOOLING_REF of the pre-push hook is the commit of lernapps/tooling", () => {
  expect(extract("scripts/pre-push.ts", APP_TEMPLATES_HOOK)).toEqual([SHA]);
  expect(extract("scripts/pre-push.mjs", SITE_HOOK)).toEqual([SHA]);
});

test("nothing else is taken for the commit", () => {
  // tooling's own changes.yml: the input's declaration and the usage in its comment, no commit
  const changes = readFileSync(join(repoRoot, ".github/workflows/changes.yml"), "utf8");
  expect(extract(".github/workflows/changes.yml", changes)).toEqual([]);
  // the strings outside the files the managers look at
  expect(extract("quiz/.github/workflows/check.yml", APP_TEMPLATES_WORKFLOW)).toEqual([]);
  expect(extract("scripts/listing.mjs", SITE_HOOK)).toEqual([]);
  expect(extract("scripts/pre-push.ts", APP_TEMPLATES_WORKFLOW)).toEqual([]);
  // a shortened commit is no pin
  expect(extract(".github/workflows/pages.yml", "      tooling-ref: 9b9a34c # main\n")).toEqual([]);
});

test("each custom manager reads the commit main of lernapps/tooling from git", () => {
  expect(preset.customManagers.length).toBeGreaterThan(0);
  for (const manager of preset.customManagers) {
    expect(manager).toMatchObject({
      customType: "regex",
      depNameTemplate: "lernapps/tooling",
      packageNameTemplate: "https://github.com/lernapps/tooling",
      datasourceTemplate: "git-refs",
      currentValueTemplate: "main",
    });
  }
});

test("one group moves every pin of the tooling commit: actions, changes.yml@, the custom strings, the package", () => {
  const groupOf = (depName: string) =>
    preset.packageRules
      .filter((rule) => rule.groupName && rule.matchDepNames?.some((pattern) => matchesGlob(depName, pattern)))
      .map((rule) => rule.groupName);
  // lernapps/tooling: the depName of the github-actions manager (uses: lernapps/tooling/...@) and of the custom managers
  for (const depName of ["lernapps/tooling", "@lernapps/tooling", "@lernapps/site", "@lernapps/app-templates"]) {
    expect(groupOf(depName), depName).toEqual(["lernapps building blocks"]);
  }
  expect(groupOf("vite-plus")).toEqual([]);
});

test("the group waits for a window of its schedule, not for a release age, and still merges on its own", () => {
  const group = preset.packageRules.find((rule) => rule.groupName === "lernapps building blocks");
  // The npm git pin and the git-refs managers have no release timestamp: a minimumReleaseAge above 0 would hold them
  // back for good (timestamp-required) while the timestamped actions moved alone. The grace is the schedule instead.
  expect(group).toMatchObject({ minimumReleaseAge: "0 days", schedule: ["* */3 * * *"], automerge: true });
  expect(group?.automergeSchedule).toBeUndefined();
});
