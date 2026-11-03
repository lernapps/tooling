// What makes a local check differ from CI (check/environment.ts): node_modules against package-lock.json, and the
// major version of Node.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { CI_NODE_MAJOR, installedPackages, installedProblems, nodeMajorProblem } from "../check/environment.ts";
import { repoRoot, tempDir } from "./support.ts";

type Entry = { version?: string; optional?: boolean; link?: boolean; resolved?: string };

/** A project whose lock file asks for `locked` and whose node_modules holds `installed` (path → version). */
function project(locked: Record<string, Entry>, installed: Record<string, string>): string {
  const dir = tempDir("environment");
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "app" }));
  writeFileSync(
    join(dir, "package-lock.json"),
    JSON.stringify({ lockfileVersion: 3, packages: { "": { name: "app" }, ...locked } }),
  );
  for (const [path, version] of Object.entries(installed)) {
    mkdirSync(join(dir, path), { recursive: true });
    writeFileSync(
      join(dir, path, "package.json"),
      JSON.stringify({ name: path.split("node_modules/").pop(), version }),
    );
  }
  return dir;
}

test("node_modules that holds what the lock file asks for, nested packages included, passes", () => {
  const dir = project(
    { "node_modules/a": { version: "1.0.0" }, "node_modules/a/node_modules/b": { version: "2.0.0" } },
    { "node_modules/a": "1.0.0", "node_modules/a/node_modules/b": "2.0.0" },
  );
  expect(installedProblems(dir)).toEqual([]);
});

test("another version installed fails with npm ci as the fix, naming both versions", () => {
  const dir = project({ "node_modules/is-number": { version: "6.0.0" } }, { "node_modules/is-number": "7.0.0" });
  const problems = installedProblems(dir);
  expect(problems).toHaveLength(1);
  expect(problems[0]?.found).toContain("is-number 7.0.0 is installed, the lock file asks for 6.0.0");
  expect(problems[0]?.fix).toContain("npm ci");
});

test("a package not installed fails; an optional one (another platform's) does not", () => {
  const dir = project(
    {
      "node_modules/a": { version: "1.0.0" },
      "node_modules/@esbuild/win32-x64": { version: "0.25.0", optional: true },
    },
    {},
  );
  const problems = installedProblems(dir);
  expect(problems).toHaveLength(1);
  expect(problems[0]?.found).toContain("a is not installed (the lock file asks for 1.0.0)");
  expect(problems[0]?.found).not.toContain("win32");
});

test("a linked package (a workspace) is the project's own, not checked", () => {
  const dir = project({ "node_modules/own": { link: true, resolved: "packages/own" } }, {});
  expect(installedProblems(dir)).toEqual([]);
});

test("many mismatches are named up to five, then counted", () => {
  const locked = Object.fromEntries(
    ["a", "b", "c", "d", "e", "f", "g"].map((name) => [`node_modules/${name}`, { version: "1.0.0" }]),
  );
  const problems = installedProblems(project(locked, {}));
  expect(problems[0]?.found).toContain("and 2 more");
});

test("without a lock file there is nothing to compare", () => {
  const dir = tempDir("environment");
  expect(installedProblems(dir)).toEqual([]);
  expect(installedPackages(dir)).toBeUndefined();
});

test("the installed packages, for the cache key, change with what is installed", () => {
  const locked = { "node_modules/a": { version: "1.0.0" } };
  expect(installedPackages(project(locked, { "node_modules/a": "1.0.0" }))).toBe("node_modules/a 1.0.0");
  expect(installedPackages(project(locked, { "node_modules/a": "1.0.1" }))).toBe("node_modules/a 1.0.1");
  expect(installedPackages(project(locked, {}))).toBe("node_modules/a -");
});

test("another major version of Node than CI is a warning, the same major none", () => {
  expect(nodeMajorProblem(`${CI_NODE_MAJOR}.3.1`)).toBeUndefined();
  const problem = nodeMajorProblem("22.18.0");
  expect(problem?.severity).toBe("warning");
  expect(problem?.found).toContain(`CI runs Node ${CI_NODE_MAJOR}`);
});

test("CI_NODE_MAJOR is the Node of every action and workflow of CI", () => {
  const files = [
    ...readdirSync(join(repoRoot, "actions")).map((name) => join(repoRoot, "actions", name, "action.yml")),
    ...readdirSync(join(repoRoot, ".github/workflows")).map((name) => join(repoRoot, ".github/workflows", name)),
  ];
  const versions = files.flatMap((file) => {
    try {
      return [...readFileSync(file, "utf8").matchAll(/node-version:\s*["']?(\d+)/g)].map((match) => Number(match[1]));
    } catch {
      return [];
    }
  });
  expect(versions.length).toBeGreaterThan(0);
  expect(new Set(versions)).toEqual(new Set([CI_NODE_MAJOR]));
});
