// Runs real commands in real directories: the tests check what a consumer of the tooling relies on,
// not its internals.
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll } from "vite-plus/test";

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

/** Runs a command without blocking the test's own process, e.g. while the test serves an app the command checks. */
export function runAsync(command: string, args: readonly string[], cwd: string): Promise<Result> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: testEnv });
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
