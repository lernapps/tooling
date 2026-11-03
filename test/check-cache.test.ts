// The cache of passing checks and the lock of checks in a clone (check/cache.ts), in temporary git repositories.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { acquireLock, cachedReport, cacheKey, KEEP, stateDir, storeReport } from "../check/cache.ts";
import { ok, tempDir } from "./support.ts";

const NO_CI = { PATH: process.env["PATH"] ?? "" };

/** A repository with one commit: package.json, a lock file, one installed package, and src/app.ts. */
function repo(): string {
  const dir = tempDir("cache");
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  writeFileSync(join(dir, ".gitignore"), "node_modules/\n");
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "app" }));
  writeFileSync(
    join(dir, "package-lock.json"),
    JSON.stringify({ lockfileVersion: 3, packages: { "": {}, "node_modules/a": { version: "1.0.0" } } }),
  );
  install(dir, "1.0.0");
  mkdirSync(join(dir, "src"));
  writeFileSync(join(dir, "src/app.ts"), "export const answer = 42;\n");
  commit(dir);
  return dir;
}

function install(dir: string, version: string): void {
  mkdirSync(join(dir, "node_modules/a"), { recursive: true });
  writeFileSync(join(dir, "node_modules/a/package.json"), JSON.stringify({ name: "a", version }));
}

function commit(dir: string): void {
  ok("git", ["add", "--all"], dir);
  ok("git", ["commit", "--quiet", "--no-verify", "--allow-empty", "--message", "change"], dir);
}

const keyOf = (dir: string, env: NodeJS.ProcessEnv = NO_CI, parts = ["pre-push"]) => {
  const key = cacheKey(dir, parts, "1.0.0", env);
  return "key" in key ? key.key : key.none;
};

test("the same state has the same key; a commit with the same tree too", () => {
  const dir = repo();
  const key = keyOf(dir);
  expect(key).toMatch(/^[0-9a-f]{64}$/);
  expect(keyOf(dir)).toBe(key);
  commit(dir); // an empty commit: another commit, the same tree
  expect(keyOf(dir)).toBe(key);
});

test("another tree, folder, part, LERNAPPS_* variable or installed version is another key", () => {
  const dir = repo();
  const key = keyOf(dir);
  expect(keyOf(dir, { ...NO_CI, LERNAPPS_TESTS: "fast" })).not.toBe(key);
  expect(keyOf(dir, NO_CI, ["pre-commit", "pre-push"])).not.toBe(key);
  expect(keyOf(join(dir, "src"))).not.toBe(key);
  install(dir, "1.0.1"); // ignored by git: the tree stays clean
  expect(keyOf(dir)).not.toBe(key);
  install(dir, "1.0.0");
  expect(keyOf(dir)).toBe(key);
  writeFileSync(join(dir, "src/app.ts"), "export const answer = 43;\n");
  commit(dir);
  expect(keyOf(dir)).not.toBe(key);
});

test("a working tree with changes, untracked files included, has no key; nor has CI", () => {
  const dir = repo();
  writeFileSync(join(dir, "src/app.ts"), "export const answer = 43;\n");
  expect(keyOf(dir)).toBe("the working tree has changes that are not committed");
  ok("git", ["checkout", "--quiet", "--", "src/app.ts"], dir);
  writeFileSync(join(dir, "src/new.ts"), "export {};\n");
  expect(keyOf(dir)).toBe("the working tree has changes that are not committed");
  ok("git", ["clean", "--quiet", "--force"], dir);
  expect(keyOf(dir, { ...NO_CI, CI: "true" })).toBe("CI checks every time");
  expect(keyOf(tempDir("no-repo"))).toBe("not a git repository");
});

test("a stored report is found by its key; the cache keeps the newest KEEP", async () => {
  const dir = stateDir(repo()) ?? "";
  expect(cachedReport(dir, "a")).toBeUndefined();
  storeReport(dir, "a", "checked: {}\n");
  expect(cachedReport(dir, "a")?.report).toBe("checked: {}\n");
  for (let index = 0; index < KEEP + 3; index++) {
    await new Promise((done) => setTimeout(done, 5)); // distinct modification times
    storeReport(dir, `k${index}`, "x");
  }
  expect(readdirSync(join(dir, "checked"))).toHaveLength(KEEP);
  expect(cachedReport(dir, "a")).toBeUndefined();
  expect(cachedReport(dir, `k${KEEP + 2}`)).toBeDefined();
});

test("the worktrees of a clone share the cache and the lock", () => {
  const dir = repo();
  const other = join(tempDir("worktree"), "other");
  ok("git", ["worktree", "add", "--quiet", "--detach", other], dir);
  expect(stateDir(other)).toBe(stateDir(dir));
});

test("a second check waits for the first, once told, and gets the lock when it is released", async () => {
  const dir = stateDir(repo()) ?? "";
  const release = await acquireLock(dir, () => {
    throw new Error("the first check need not wait");
  });
  const told: unknown[] = [];
  let got = false;
  const second = acquireLock(dir, (owner) => told.push(owner), 20).then((releaseSecond) => {
    got = true;
    return releaseSecond;
  });
  await new Promise((done) => setTimeout(done, 100));
  expect(got).toBe(false);
  expect(told).toEqual([expect.objectContaining({ pid: process.pid, host: hostname() })]);
  release();
  (await second)();
  expect(got).toBe(true);
  expect(existsSync(join(dir, "check.lock"))).toBe(false);
});

test("a lock whose process no longer runs is taken over without waiting", async () => {
  const dir = stateDir(repo()) ?? "";
  const ended = spawn(process.execPath, ["-e", ""]);
  await new Promise((done) => ended.on("exit", done));
  mkdirSync(join(dir, "check.lock"), { recursive: true });
  writeFileSync(
    join(dir, "check.lock", "owner.json"),
    JSON.stringify({ pid: ended.pid, host: hostname(), at: new Date().toISOString() }),
  );
  const release = await acquireLock(dir, () => {
    throw new Error("an orphaned lock is not waited for");
  });
  release();
});
