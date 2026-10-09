// Runs real commands in real directories: the tests check what a consumer of the tooling relies on,
// not its internals.
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export interface Result {
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * The environment of every command a test starts: a git identity for commits, and LERNAPPS_E2E_INNER so
 * that a check run inside a test copy does not start the end-to-end tests again (they would recurse).
 * Without the settings of a preview build (pr-preview.yml): a test copy has no base branch to compare with.
 */
const { ARC42_DIFF_BASE: _base, SITE_PATH_PREFIX: _prefix, SITE_PREVIEW: _preview, ...inherited } = process.env;
/**
 * Without the variables git sets for a hook (GIT_DIR, GIT_INDEX_FILE, ...): a test started by the pre-push hook would
 * otherwise run `git init`, `git add` and `git reset` of its temporary repos against the repo being pushed.
 */
const outsideGit = Object.fromEntries(Object.entries(inherited).filter(([name]) => !name.startsWith("GIT_")));
export const testEnv: NodeJS.ProcessEnv = {
  ...outsideGit,
  LERNAPPS_E2E_INNER: "1",
  GIT_AUTHOR_NAME: "lernapps test",
  GIT_AUTHOR_EMAIL: "test@lernapps.invalid",
  GIT_COMMITTER_NAME: "lernapps test",
  GIT_COMMITTER_EMAIL: "test@lernapps.invalid",
};

export function run(command: string, args: readonly string[], cwd: string): Result {
  const result = spawnSync(command, args, { cwd, env: testEnv, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  return { code: result.status ?? 1, stdout: result.stdout, stderr: result.stderr };
}

/** Runs a command and fails with its output when it does not exit 0. */
export function ok(command: string, args: readonly string[], cwd: string): Result {
  const result = run(command, args, cwd);
  if (result.code !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited ${result.code}\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

export function tempDir(name: string): string {
  return mkdtempSync(join(tmpdir(), `lernapps-${name}-`));
}

/**
 * A fresh clone of the repo as it is now, including uncommitted changes: the files git tracks or would
 * track, copied into a new repository with one commit. No node_modules, no build output.
 */
export function freshClone(): string {
  const dir = tempDir("clone");
  const files = ok("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], repoRoot)
    .stdout.split("\0")
    .filter((file) => file !== "");
  for (const file of files) {
    const target = join(dir, file);
    mkdirSync(dirname(target), { recursive: true });
    try {
      cpSync(join(repoRoot, file), target);
    } catch (error) {
      // a file deleted in the working tree but not yet in the index
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  ok("git", ["add", "--all"], dir);
  ok("git", ["commit", "--quiet", "--no-verify", "--message", "fresh clone"], dir);
  return dir;
}
