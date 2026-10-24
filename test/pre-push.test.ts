// The contract of this repo's pre-push hook (scripts/pre-push.ts): the heavy end-to-end tests run when a push changes
// a path of the positive list; docs and texts alone run only the fast set; when the changed paths are not known,
// everything runs. The heavy tests named there exist, and the list names each of them.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { stepEnv } from "../changes/changes.ts";
import { changedPaths, HEAVY_PATHS, HEAVY_TESTS, isHeavy } from "../scripts/pre-push.ts";
import { repoRoot } from "./support.ts";

test("a change to code, the generator or a heavy test runs the heavy tests", () => {
  for (const path of ["generator/create.ts", "src/cli.ts", "archetypes/shared/hooks/pre-push", "package.json"]) {
    expect(isHeavy(path), path).toBe(true);
  }
  for (const path of HEAVY_TESTS) expect(isHeavy(path), path).toBe(true);
});

test("docs, skills, guidance and the README alone run only the fast tests", () => {
  for (const path of ["docs/arc42/05-building-blocks.arc42.md", "skills/process/lernapps-app/SKILL.md", "README.md"]) {
    expect(isHeavy(path), path).toBe(false);
  }
  expect(isHeavy("guidance/plan-template.md")).toBe(false);
});

test("without the pushed refs, the changed paths are not known: everything runs", () => {
  expect(changedPaths("")).toBeUndefined();
});

test("the steps run without the variables that tie git to this repo, so a test's own `git init` stays in its folder", () => {
  const env = stepEnv({
    GIT_DIR: "/repo/.git",
    GIT_INDEX_FILE: "/repo/.git/index",
    GIT_SSL_CAINFO: "/etc/ca.pem",
    PATH: "/bin",
    LERNAPPS_PRE_PUSH: "1",
  });
  expect(env).toEqual({ GIT_SSL_CAINFO: "/etc/ca.pem", PATH: "/bin", LERNAPPS_PRE_PUSH: "1" });
});

test("every heavy test exists, and every end-to-end test that installs or builds apps is heavy or fast on purpose", () => {
  for (const file of HEAVY_TESTS) expect(existsSync(join(repoRoot, file)), file).toBe(true);
  for (const entry of HEAVY_PATHS) {
    expect(existsSync(join(repoRoot, entry.replace(/\/$/, ""))), entry).toBe(true);
  }
  const e2e = readdirSync(join(repoRoot, "test")).filter((file) => file.endsWith(".e2e.test.ts"));
  // the fast end-to-end tests: quick, and no install of an app
  const fast = [
    "test/app-publish.e2e.test.ts",
    "test/check-app.e2e.test.ts",
    "test/check-pages.e2e.test.ts",
    "test/review.e2e.test.ts",
  ];
  expect(e2e.map((file) => `test/${file}`).sort()).toEqual([...HEAVY_TESTS, ...fast].sort());
});
