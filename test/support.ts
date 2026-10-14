// Runs real commands in real directories: the tests check what a consumer of the tooling relies on,
// not its internals.
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, inject } from "vite-plus/test";
import { copyRepo, repoRoot, testEnv } from "./repo-copy.ts";

export { repoRoot, testEnv } from "./repo-copy.ts";

/** Where the quiet pre-commit hook writes what its steps print, in an app and in this repo. */
export const PRE_COMMIT_LOG = "node_modules/.cache/lernapps/pre-commit.log";

export interface Result {
  code: number;
  stdout: string;
  stderr: string;
}

export function run(command: string, args: readonly string[], cwd: string): Result {
  const result = spawnSync(command, args, { cwd, env: testEnv, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  return { code: result.status ?? 1, stdout: result.stdout, stderr: result.stderr };
}

/** Runs a command without blocking the test's own process, e.g. while the test serves an app the command checks. */
export function runAsync(
  command: string,
  args: readonly string[],
  cwd: string,
  env: NodeJS.ProcessEnv = {},
): Promise<Result> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { ...testEnv, ...env } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => (stdout += chunk.toString()));
    child.stderr.on("data", (chunk: Buffer) => (stderr += chunk.toString()));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

/** Runs a command and fails with its output when it does not exit 0. */
export function ok(command: string, args: readonly string[], cwd: string): Result {
  const result = run(command, args, cwd);
  if (result.code !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited ${result.code}\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

/**
 * The temporary directories of one test file live under one root, removed when the file's tests are done: a fresh
 * clone with node_modules is hundreds of megabytes, and a test run makes dozens.
 */
let tempRoot: string | undefined;
// Also imported by scripts run outside the test runner (review-fixture.ts); they keep their directories.
if (process.env["VITEST"]) {
  // Removing a fresh clone's node_modules can take longer than the default hook timeout on a busy machine.
  afterAll(() => {
    if (tempRoot !== undefined) rmSync(tempRoot, { recursive: true, force: true });
  }, 120_000);
}

export function tempDir(name: string): string {
  if (tempRoot === undefined) {
    tempRoot = mkdtempSync(join(tmpdir(), "lernapps-test-"));
  }
  return mkdtempSync(join(tempRoot, `${name}-`));
}

/**
 * The plan of `lernapps create`, as the creator confirmed it: the plan template in the phase code, for the archetype,
 * at <dir>/.vibe/plan.md. Returns its path.
 */
export function confirmedPlan(dir: string, archetype: string): string {
  const plan = join(dir, ".vibe/plan.md");
  mkdirSync(join(dir, ".vibe"), { recursive: true });
  const template = readFileSync(join(repoRoot, "guidance/plan-template.md"), "utf8");
  writeFileSync(
    plan,
    template.replace(/^archetype: null$/m, `archetype: ${archetype}`).replace(/^phase: explore$/m, "phase: code"),
  );
  return plan;
}

/**
 * A fresh clone of the repo as it is now, including uncommitted changes: the files git tracks or would
 * track, copied into a new repository with one commit. No node_modules, no build output.
 */
export function freshClone(): string {
  const dir = tempDir("clone");
  copyRepo(dir);
  return dir;
}

/** Waits without busy looping. */
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/**
 * Something the test files of one run share, read only, made once: the first test file to ask makes it with `make`;
 * the others wait until it is done (test/global-setup.ts reserves the directory of the run).
 */
export function shared(name: string, make: (dir: string) => void, leaf = "dir"): string {
  const root = join(inject("installRoot"), name);
  mkdirSync(root, { recursive: true });
  const dir = join(root, leaf);
  const done = join(root, "done");
  const failed = join(root, "failed");
  try {
    mkdirSync(join(root, "lock"));
  } catch {
    // another test file makes it
    for (;;) {
      if (existsSync(done)) return dir;
      if (existsSync(failed)) throw new Error(readFileSync(failed, "utf8"));
      sleep(500);
    }
  }
  try {
    make(dir);
    writeFileSync(done, "");
    return dir;
  } catch (error) {
    writeFileSync(failed, String(error));
    throw error;
  }
}

/** The one fresh clone of the test run installed with a real `npm ci`, read only. */
export const sharedInstall = (): string =>
  shared("installed-clone", (dir) => {
    copyRepo(dir);
    ok("npm", ["ci", "--no-audit", "--no-fund"], dir);
  });

/**
 * Links `target`'s node_modules, entry by entry, to `installed`'s, leaving out caches, so that what a run writes
 * there (reports, logs, build caches) stays in `target`.
 */
export function linkNodeModules(installed: string, target: string): void {
  mkdirSync(join(target, "node_modules"));
  for (const name of readdirSync(join(installed, "node_modules"))) {
    if (name === ".cache" || name.startsWith(".vite")) continue;
    symlinkSync(join(installed, "node_modules", name), join(target, "node_modules", name));
  }
}

/**
 * A fresh clone of the repo as it is now, installed: its node_modules links, entry by entry, to the shared clone
 * installed with `npm ci` (sharedInstall), and `npm run prepare` builds the CLI and installs the git hooks, as
 * `npm ci` does after the install. Caches stay in the copy's own node_modules, so test files that work in their own
 * copies at the same time share none.
 */
export function installedClone(): string {
  const dir = freshClone();
  linkNodeModules(sharedInstall(), dir);
  ok("npm", ["run", "prepare"], dir);
  return dir;
}

/**
 * A local clone of lernapps/app-templates with the commit pinned in package.json (appTemplates), for the generator's
 * tests: the one named by LERNAPPS_TEMPLATES, else one fetched once into node_modules/.cache/lernapps/. The commit is
 * pinned, so the clone is the same everywhere, and the hooks run these tests as CI does. Without the network and
 * without a cached clone, it fails and says what to do.
 */
export function appTemplates(): string {
  const named = process.env["LERNAPPS_TEMPLATES"];
  if (named !== undefined && named !== "") return resolve(named);
  const manifest = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
    appTemplates: { repository: string; commit: string };
  };
  const { repository, commit } = manifest.appTemplates;
  const cache = join(repoRoot, "node_modules/.cache/lernapps/app-templates");
  const dir = join(cache, commit);
  if (existsSync(join(dir, ".git"))) return dir;
  mkdirSync(cache, { recursive: true });
  const work = mkdtempSync(join(cache, "fetch-"));
  const git = (...args: string[]) => run("git", ["-c", "advice.detachedHead=false", ...args], work);
  // the full history of the commit, on a branch: npm installs the runtime from this clone at the commit
  const fetched = git("init", "--quiet").code === 0 ? git("fetch", "--quiet", repository, commit) : undefined;
  if (fetched === undefined || fetched.code !== 0 || git("checkout", "--quiet", "-B", "pinned", "FETCH_HEAD").code) {
    rmSync(work, { recursive: true, force: true });
    throw new Error(
      `cannot fetch lernapps/app-templates at ${commit} from ${repository}: ${fetched?.stderr.trim() ?? "git init failed"}. ` +
        "The generator's tests need it once (then it is cached in node_modules/.cache/lernapps/); connect to the " +
        "network, or set LERNAPPS_TEMPLATES to a local clone that has this commit",
    );
  }
  try {
    renameSync(work, dir);
  } catch (error) {
    // another test file fetched it at the same time
    rmSync(work, { recursive: true, force: true });
    if (!existsSync(join(dir, ".git"))) throw error;
  }
  return dir;
}
