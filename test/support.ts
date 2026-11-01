// Runs real commands in real directories: the tests check what a consumer of the tooling relies on,
// not its internals.
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
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

export function run(command: string, args: readonly string[], cwd: string, env: NodeJS.ProcessEnv = {}): Result {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...testEnv, ...env },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
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

/** The first version's plan in an app's folder, as the tests name it. */
export const FIRST_PLAN = ".vibe/plans/01-first-version.md";

/**
 * The plan of `lernapps create`, as the creator confirmed it: the plan template in the phase code, for the archetype,
 * at <dir>/<file> (default: the first version's plan in .vibe/plans/). Returns its path.
 */
export function confirmedPlan(dir: string, archetype: string, file = FIRST_PLAN): string {
  const plan = join(dir, file);
  mkdirSync(dirname(plan), { recursive: true });
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
 * This package, packed from a fresh clone of the repo with its dependencies installed (installedClone): the path of its
 * tarball, which the apps the tests make depend on (`--tooling file:<tarball>`). Made once per test file. The apps do not
 * depend on the working copy: installing a folder runs its prepare script there, which other tests of the same run are
 * using.
 */
let packedToolingTarball: string | undefined;
export function packedTooling(): string {
  if (packedToolingTarball === undefined) {
    const out = tempDir("tooling-pack");
    ok("npm", ["pack", "--silent", "--pack-destination", out], installedClone());
    packedToolingTarball = join(out, readdirSync(out)[0] ?? "");
  }
  return packedToolingTarball;
}

/**
 * The package @lernapps/app-templates for the generator's tests: the one named by LERNAPPS_TEMPLATES (a local copy or
 * clone), else the one installed next to this package, at the exact version package.json depends on.
 */
export function appTemplates(): string {
  const named = process.env["LERNAPPS_TEMPLATES"];
  if (named !== undefined && named !== "") return resolve(named);
  const dir = join(repoRoot, "node_modules/@lernapps/app-templates");
  if (!existsSync(join(dir, "package.json"))) {
    throw new Error("@lernapps/app-templates is not installed: run npm ci, or set LERNAPPS_TEMPLATES to a copy of it");
  }
  return dir;
}

/** The version of the templates the generator's tests run on. */
export const templatesVersion = (): string =>
  (JSON.parse(readFileSync(join(appTemplates(), "package.json"), "utf8")) as { version: string }).version;
