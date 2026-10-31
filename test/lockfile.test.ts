// The rule lockfile-matches (check/lockfile.ts): package-lock.json installs what package.json asks for, git pins
// included. npm ci catches a registry version the lock file does not satisfy, but not a git pin that moved in
// package.json alone, which then installs the old commit.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { lockfileProblems } from "../check/lockfile.ts";
import { repoRoot } from "./support.ts";

const OLD = "2ffe1fe1b57fbcb23ec2f1b0e6fa0af3a61d7333";
const NEW = "c90da20a38b41c5c169bc7781854e07b63300af2";
const pin = (commit: string) => `github:lernapps/lernapps.github.io#${commit}`;

/** A project with the site pinned at `wanted` in package.json and at `locked` in the lock file. */
function project(wanted: string, locked: string, resolved = locked): string {
  const dir = mkdtempSync(join(tmpdir(), "lockfile-"));
  const devDependencies = { "@lernapps/site": pin(wanted), yaml: "2.9.1" };
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "site", devDependencies }));
  const lock = {
    lockfileVersion: 3,
    packages: {
      "": { name: "site", devDependencies: { ...devDependencies, "@lernapps/site": pin(locked) } },
      "node_modules/@lernapps/site": {
        resolved: `git+ssh://git@github.com/lernapps/lernapps.github.io.git#${resolved}`,
      },
      "node_modules/yaml": { version: "2.9.1", resolved: "https://registry.npmjs.org/yaml/-/yaml-2.9.1.tgz" },
    },
  };
  writeFileSync(join(dir, "package-lock.json"), JSON.stringify(lock));
  return dir;
}

test("a lock file that matches package.json, git pin included, passes", () => {
  expect(lockfileProblems(project(NEW, NEW))).toEqual([]);
});

test("a git pin that moved in package.json alone fails once, naming both commits", () => {
  const problems = lockfileProblems(project(NEW, OLD)) ?? [];
  expect(problems).toHaveLength(1);
  expect(problems[0]?.found).toContain(NEW);
  expect(problems[0]?.found).toContain(OLD);
});

test("a lock file whose root entry matches but installs another commit fails", () => {
  const problems = lockfileProblems(project(NEW, NEW, OLD)) ?? [];
  expect(problems.map((problem) => problem.found)).toEqual([
    expect.stringContaining(`installs git+ssh://git@github.com/lernapps/lernapps.github.io.git#${OLD}`),
  ]);
});

test("without a lock file the rule has nothing to check", () => {
  expect(lockfileProblems(mkdtempSync(join(tmpdir(), "lockfile-")))).toBeUndefined();
});

test("the site check action's script exits 1 on a mismatch, 0 otherwise", () => {
  const main = join(repoRoot, "check/lockfile-main.ts");
  expect(spawnSync(process.execPath, [main], { cwd: project(NEW, OLD) }).status).toBe(1);
  expect(spawnSync(process.execPath, [main], { cwd: project(NEW, NEW) }).status).toBe(0);
});
