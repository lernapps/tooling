// A copy of this repo as it is now, for the tests and their global setup. No test runner imports here: the global
// setup runs outside the test files.
import { spawnSync } from "node:child_process";
import { cpSync, lstatSync, mkdirSync, readlinkSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
  // the generated apps' end-to-end tests with one worker each: many apps are checked at the same time here, and their
  // browsers compete for the cores (archetypes/shared/playwright.ts)
  LERNAPPS_PLAYWRIGHT_WORKERS: "1",
  GIT_AUTHOR_NAME: "lernapps test",
  GIT_AUTHOR_EMAIL: "test@lernapps.invalid",
  GIT_COMMITTER_NAME: "lernapps test",
  GIT_COMMITTER_EMAIL: "test@lernapps.invalid",
};

/** Runs a command and fails with its output when it does not exit 0. */
export function sh(command: string, args: readonly string[], cwd: string): string {
  const result = spawnSync(command, args, { cwd, env: testEnv, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited ${result.status}\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

/**
 * Copies the repo as it is now into `dir`, including uncommitted changes: the files git tracks or would track, in a
 * new repository with one commit. No node_modules, no build output.
 */
export function copyRepo(dir: string): void {
  const files = sh("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], repoRoot)
    .split("\0")
    .filter((file) => file !== "");
  for (const file of files) {
    const target = join(dir, file);
    mkdirSync(dirname(target), { recursive: true });
    try {
      // a symlink (e.g. .claude/skills/commit) stays one, as in a clone
      const source = join(repoRoot, file);
      if (lstatSync(source).isSymbolicLink()) symlinkSync(readlinkSync(source), target);
      else cpSync(source, target);
    } catch (error) {
      // a file deleted in the working tree but not yet in the index
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  sh("git", ["init", "--quiet", "--initial-branch=main"], dir);
  sh("git", ["add", "--all"], dir);
  sh("git", ["commit", "--quiet", "--no-verify", "--message", "fresh clone"], dir);
}
