// A passing check of the same state is not repeated, and runs in one clone do not overlap (docs/arc42, decision
// dec-check-cache). The CLI asks both before the heavy part of a check in a repo (src/cli.ts).
//
// The key of a state: the tree of HEAD, the folder checked, the parts, the versions of the tooling and of Node, the
// packages installed (check/environment.ts) and every LERNAPPS_* variable (the tooling's own push runs a fast subset
// of its tests with LERNAPPS_TESTS=fast, which must not stand in for all of them). A state has a key only when the
// working tree is clean: the check reads the working tree, the tree of HEAD names only what is committed. Never in CI.
//
// Both live in the repository's common git directory (<git common dir>/lernapps/), which the worktrees of a clone
// share: a state checked in one worktree is checked for all, and their checks wait for each other, which also keeps
// browsers of parallel runs from slowing each other down. Separate clones stay independent.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { join, relative, resolve } from "node:path";
import { installedPackages } from "./environment.ts";

/** How many checked states the cache keeps: the newest. */
export const KEEP = 20;

const git = (cwd: string, ...args: string[]) => {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return result.status === 0 ? result.stdout : undefined;
};

/** The folder of the cache and the lock: <git common dir>/lernapps, or undefined outside a repository. */
export function stateDir(cwd = "."): string | undefined {
  const common = git(cwd, "rev-parse", "--git-common-dir")?.trim();
  return common === undefined || common === "" ? undefined : join(resolve(cwd, common), "lernapps");
}

/**
 * The key of the state in `cwd` for a check of `parts`, or the reason it has none: not a repository, no commit, a
 * working tree with changes git sees (untracked files included), or a run in CI.
 */
export function cacheKey(
  cwd: string,
  parts: readonly string[],
  toolingVersion: string,
  env: NodeJS.ProcessEnv = process.env,
): { key: string } | { none: string } {
  if (env["CI"] !== undefined && env["CI"] !== "" && env["CI"] !== "false") return { none: "CI checks every time" };
  const top = git(cwd, "rev-parse", "--show-toplevel")?.trim();
  if (top === undefined) return { none: "not a git repository" };
  const tree = git(cwd, "rev-parse", "--verify", "--quiet", "HEAD^{tree}")?.trim();
  if (tree === undefined || tree === "") return { none: "no commit yet" };
  const status = git(top, "status", "--porcelain", "--untracked-files=all");
  if (status === undefined) return { none: "git status failed" };
  if (status.trim() !== "") return { none: "the working tree has changes that are not committed" };
  const variables = Object.keys(env)
    .filter((name) => name.startsWith("LERNAPPS_"))
    .sort()
    .map((name) => `${name}=${env[name]}`);
  const hash = createHash("sha256");
  for (const part of [
    `tree ${tree}`,
    `folder ${relative(top, resolve(cwd)).split("\\").join("/")}`,
    `parts ${[...parts].sort().join(",")}`,
    `tooling ${toolingVersion}`,
    `node ${process.versions.node}`,
    ...variables,
    `installed\n${installedPackages(cwd) ?? ""}`,
  ]) {
    hash.update(part);
    hash.update("\0");
  }
  return { key: hash.digest("hex") };
}

const checkedFile = (dir: string, key: string) => join(dir, "checked", `${key}.yaml`);

/** The report of a passing check of this state, and when it was made; undefined when there is none. */
export function cachedReport(dir: string, key: string): { report: string; at: Date } | undefined {
  const file = checkedFile(dir, key);
  try {
    return { report: readFileSync(file, "utf8"), at: statSync(file).mtime };
  } catch {
    return undefined;
  }
}

/** Keeps the report of a passing check of this state; the cache keeps the newest KEEP states. */
export function storeReport(dir: string, key: string, report: string): void {
  const folder = join(dir, "checked");
  mkdirSync(folder, { recursive: true });
  writeFileSync(checkedFile(dir, key), report);
  const files = readdirSync(folder)
    .filter((name) => name.endsWith(".yaml"))
    .map((name) => ({ file: join(folder, name), at: statSync(join(folder, name)).mtimeMs }))
    .sort((a, b) => b.at - a.at);
  for (const { file } of files.slice(KEEP)) rmSync(file, { force: true });
}

interface Owner {
  pid: number;
  host: string;
  at: string;
}

/** Whether a process with this id runs on this machine. */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM: it runs, as another user
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

function readOwner(lock: string): Owner | undefined {
  try {
    return JSON.parse(readFileSync(join(lock, "owner.json"), "utf8")) as Owner;
  } catch {
    return undefined;
  }
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

/**
 * Takes the lock of checks in this clone (a folder, made atomically with mkdir), waiting while another check holds
 * it; `waiting` is called once, with its owner, when it has to wait. A lock whose process no longer runs on this
 * machine is taken over. Returns the function that releases it; the lock is also released when the process exits or
 * is interrupted.
 */
export async function acquireLock(
  dir: string,
  waiting: (owner: Owner | undefined) => void,
  poll = 1000,
): Promise<() => void> {
  mkdirSync(dir, { recursive: true });
  const lock = join(dir, "check.lock");
  let told = false;
  for (;;) {
    try {
      mkdirSync(lock);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    const owner = readOwner(lock);
    if (owner !== undefined && owner.host === hostname() && !alive(owner.pid)) {
      rmSync(lock, { recursive: true, force: true });
      continue;
    }
    const made = statSync(lock, { throwIfNoEntry: false })?.mtimeMs;
    if (owner === undefined && made !== undefined && Date.now() - made > 10 * poll) {
      // a lock without an owner for a while: its process ended between mkdir and writing the owner
      rmSync(lock, { recursive: true, force: true });
      continue;
    }
    if (!told) {
      waiting(owner);
      told = true;
    }
    await sleep(poll);
  }
  writeFileSync(
    join(lock, "owner.json"),
    JSON.stringify({ pid: process.pid, host: hostname(), at: new Date().toISOString() } satisfies Owner),
  );
  const release = () => {
    process.off("exit", release);
    process.off("SIGINT", interrupted);
    process.off("SIGTERM", interrupted);
    if (readOwner(lock)?.pid === process.pid) rmSync(lock, { recursive: true, force: true });
  };
  const interrupted = (signal: NodeJS.Signals) => {
    release();
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.on("exit", release);
  process.on("SIGINT", interrupted);
  process.on("SIGTERM", interrupted);
  return release;
}
