#!/usr/bin/env node
// Writes the previews of pull requests on the branch gh-pages, below pr-preview/pr-<number>/: for the preview actions
// (actions/site-preview, actions/app-preview) and the reusable workflow preview-cleanup.yml. Three commands:
//   deploy --number <n> --dir <folder>   puts the folder at pr-preview/pr-<n>/, replacing what was there. When the pull
//                                        request is no longer open (merged within seconds, before this run wrote), it
//                                        removes the preview instead.
//   remove --number <n>                  removes pr-preview/pr-<n>/, the whole folder.
//   cleanup [--dry-run]                  removes every pr-preview/pr-<n>/ whose pull request is not open: the ones a
//                                        run missed (a stacked pull request closed with its deleted base, a push that
//                                        lost a race, a preview written after its pull request closed). One commit.
// Several runs write gh-pages at once (the previews of other pull requests, the deploy of main), so a push can be
// rejected. Each attempt therefore starts from the branch as it is now, applies its change again and pushes; a
// rejected push waits a random, growing time and tries again, up to ATTEMPTS times. No change touches another's folder,
// so applying it again on a newer branch is always right. A new repo without gh-pages gets the branch, with .nojekyll at
// its root (Pages then serves files that start with _). Writes the output `result` (deployed, removed or unchanged).
// Only Node's own modules and git: the actions run it without installing anything.
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const PREFIX = "lernapps gh-pages";
export const BRANCH = "gh-pages";
export const UMBRELLA = "pr-preview";
/** How often a rejected push is tried, in all. */
export const ATTEMPTS = 10;

const USAGE = `Usage: node publish/gh-pages.ts deploy --number <n> --dir <folder>
       node publish/gh-pages.ts remove --number <n>
       node publish/gh-pages.ts cleanup [--dry-run]

Environment: GITHUB_REPOSITORY (owner/name), GITHUB_TOKEN (contents: write; pull-requests: read for deploy and
cleanup), GITHUB_SERVER_URL (default https://github.com), GITHUB_API_URL (default https://api.github.com).
Exit code 0 when done, 1 when not, 2 on a usage error.
`;

/** The folder of a pull request's preview on gh-pages. */
export const previewPath = (number: number): string => `${UMBRELLA}/pr-${number}`;

/** The numbers of the preview folders among the names below pr-preview/ ("pr-12" → 12), ascending. */
export function previewNumbers(names: readonly string[]): number[] {
  return names
    .map((name) => /^pr-([1-9][0-9]*)$/.exec(name)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number)
    .sort((a, b) => a - b);
}

/** The previews whose pull request is not open. */
export const stalePreviews = (numbers: readonly number[], open: ReadonlySet<number>): number[] =>
  numbers.filter((n) => !open.has(n));

/** Milliseconds to wait after the rejected attempt `attempt` (1, 2, ...): random, up to 2^attempt s, at most 30 s. */
export function backoff(attempt: number, random: () => number = Math.random): number {
  const most = Math.min(30, 2 ** attempt) * 1000;
  return Math.round(most / 2 + (random() * most) / 2);
}

/** Changes the checkout of gh-pages; returns the commit message, or undefined when there is nothing to change. */
export type Change = (worktree: string) => string | undefined;

export interface Remote {
  /** The URL git pushes to. */
  url: string;
  /** The environment of git: the credentials, never on the command line. */
  env: NodeJS.ProcessEnv;
}

export interface WriteOptions {
  attempts?: number;
  wait?: (ms: number) => Promise<void>;
  /** Called before each push, with the attempt (for tests: another writer comes first). */
  beforePush?: (attempt: number) => void;
  log?: (line: string) => void;
}

function git(cwd: string, env: NodeJS.ProcessEnv, ...args: string[]): { ok: boolean; out: string } {
  const result = spawnSync("git", args, {
    cwd,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", ...env },
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { ok: result.status === 0, out: `${result.stdout}${result.stderr}`.trim() };
}

function must(cwd: string, env: NodeJS.ProcessEnv, ...args: string[]): string {
  const result = git(cwd, env, ...args);
  if (!result.ok) throw new Error(`git ${args[0]} failed: ${result.out}`);
  return result.out;
}

/**
 * Applies the change to gh-pages as it is now and pushes it; a rejected push starts over from the newer branch.
 * Returns whether it pushed a commit.
 */
export async function write(
  remote: Remote,
  change: Change,
  options: WriteOptions = {},
): Promise<"pushed" | "unchanged"> {
  const attempts = options.attempts ?? ATTEMPTS;
  const wait = options.wait ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const log = options.log ?? ((line: string) => console.log(`${PREFIX}: ${line}`));
  const dir = mkdtempSync(join(tmpdir(), "lernapps-gh-pages-"));
  const env = remote.env;
  try {
    must(dir, env, "init", "--quiet");
    must(dir, env, "config", "user.name", "github-actions[bot]");
    must(dir, env, "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
    must(dir, env, "remote", "add", "origin", remote.url);
    let last = "";
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const heads = must(dir, env, "ls-remote", "--heads", "origin", BRANCH);
      if (heads === "") {
        // a new repo: the branch starts here, with .nojekyll at its root
        must(dir, env, "checkout", "--quiet", "--orphan", `${BRANCH}-${attempt}`);
        git(dir, env, "rm", "-r", "--quiet", "--cached", "--ignore-unmatch", ".");
        git(dir, env, "clean", "-ffdxq");
        writeFileSync(join(dir, ".nojekyll"), "");
      } else {
        must(dir, env, "fetch", "--quiet", "--no-tags", "--depth", "1", "origin", BRANCH);
        must(dir, env, "checkout", "--quiet", "--force", "-B", `${BRANCH}-${attempt}`, "FETCH_HEAD");
        must(dir, env, "clean", "-ffdxq");
      }
      const message = change(dir);
      must(dir, env, "add", "--all");
      if (message === undefined || git(dir, env, "diff", "--cached", "--quiet").ok) {
        log("nothing to change on gh-pages");
        return "unchanged";
      }
      must(dir, env, "commit", "--quiet", "--no-verify", "-m", message);
      options.beforePush?.(attempt);
      const pushed = git(dir, env, "push", "--porcelain", "origin", `HEAD:refs/heads/${BRANCH}`);
      if (pushed.ok) {
        log(`${message} (attempt ${attempt} of ${attempts})`);
        return "pushed";
      }
      last = pushed.out;
      if (/\b(403|401)\b|Authentication failed|Permission to .* denied/i.test(last)) break;
      if (attempt < attempts) {
        const ms = backoff(attempt);
        log(`the push was rejected (attempt ${attempt} of ${attempts}), another run wrote gh-pages; again in ${ms} ms`);
        await wait(ms);
      }
    }
    throw new Error(`cannot push to gh-pages: ${last}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Puts the folder at pr-preview/pr-<number>/, replacing what was there. */
export const deployChange =
  (number: number, folder: string): Change =>
  (worktree) => {
    const target = join(worktree, previewPath(number));
    rmSync(target, { recursive: true, force: true });
    cpSync(folder, target, { recursive: true });
    return `Deploy preview for PR #${number}`;
  };

/** Removes pr-preview/pr-<number>/, the whole folder (.nojekyll too). */
export const removeChange =
  (number: number): Change =>
  (worktree) => {
    const target = join(worktree, previewPath(number));
    if (!existsSync(target)) return undefined;
    rmSync(target, { recursive: true, force: true });
    return `Remove preview for PR #${number}`;
  };

/** The previews on the branch now (in the worktree). */
const previewsIn = (worktree: string): number[] => {
  const umbrella = join(worktree, UMBRELLA);
  return existsSync(umbrella) ? previewNumbers(readdirSync(umbrella)) : [];
};

/** Removes every preview whose pull request is not open; `removed` collects their numbers. */
export const cleanupChange =
  (open: ReadonlySet<number>, removed: number[] = [], dryRun = false): Change =>
  (worktree) => {
    const stale = stalePreviews(previewsIn(worktree), open);
    removed.splice(0, removed.length, ...stale);
    if (stale.length === 0 || dryRun) return undefined;
    for (const n of stale) rmSync(join(worktree, previewPath(n)), { recursive: true, force: true });
    return `Remove previews of closed PRs: ${stale.map((n) => `#${n}`).join(", ")}`;
  };

/** The command was called wrongly. */
class UsageFailure extends Error {}

interface Env {
  api: string;
  repo: string;
  token: string;
  remote: Remote;
}

function env(): Env {
  const need = (name: string): string => {
    const value = process.env[name];
    if (value === undefined || value === "") throw new UsageFailure(`${name} is not set`);
    return value;
  };
  const repo = need("GITHUB_REPOSITORY");
  const token = need("GITHUB_TOKEN");
  const server = (process.env["GITHUB_SERVER_URL"] || "https://github.com").replace(/\/+$/, "");
  const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
  return {
    api: (process.env["GITHUB_API_URL"] || "https://api.github.com").replace(/\/+$/, ""),
    repo,
    token,
    remote: {
      url: `${server}/${repo}.git`,
      env: {
        GIT_CONFIG_COUNT: "1",
        GIT_CONFIG_KEY_0: `http.${server}/.extraheader`,
        GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${basic}`,
      },
    },
  };
}

async function get(e: Env, path: string): Promise<unknown> {
  const response = await fetch(`${e.api}${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${e.token}`,
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`);
  return response.json();
}

/** Whether the pull request is open now. */
async function isOpen(e: Env, number: number): Promise<boolean> {
  const pull = (await get(e, `/repos/${e.repo}/pulls/${number}`)) as { state?: string };
  return pull.state === "open";
}

/** The numbers of all open pull requests; throws when GitHub does not answer (then nothing is removed). */
async function openPulls(e: Env): Promise<Set<number>> {
  const open = new Set<number>();
  for (let page = 1; ; page++) {
    const pulls = (await get(e, `/repos/${e.repo}/pulls?state=open&per_page=100&page=${page}`)) as { number: number }[];
    for (const pull of pulls) open.add(pull.number);
    if (pulls.length < 100) return open;
  }
}

function output(name: string, value: string): void {
  const file = process.env["GITHUB_OUTPUT"];
  if (file) appendFileSync(file, `${name}=${value}\n`);
}

function number(value: string | undefined): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new UsageFailure("--number <n>: the number of the pull request");
  return n;
}

async function main(args: string[]): Promise<number> {
  try {
    const { values, positionals } = parseArgs({
      args,
      options: {
        number: { type: "string" },
        dir: { type: "string" },
        "dry-run": { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
      },
      allowPositionals: true,
    });
    if (values.help) {
      process.stdout.write(USAGE);
      return 0;
    }
    const [command, ...rest] = positionals;
    if (rest.length > 0) throw new UsageFailure("one command");
    if (command === "deploy") {
      const n = number(values.number);
      if (values.dir === undefined || !existsSync(values.dir)) throw new UsageFailure("--dir <folder>: the preview");
      const e = env();
      if (!(await isOpen(e, n))) {
        console.log(`${PREFIX}: pull request #${n} is no longer open; its preview is removed, not deployed`);
        await write(e.remote, removeChange(n));
        output("result", "removed");
        return 0;
      }
      const done = await write(e.remote, deployChange(n, values.dir));
      output("result", done === "pushed" ? "deployed" : "unchanged");
    } else if (command === "remove") {
      const n = number(values.number);
      const done = await write(env().remote, removeChange(n));
      output("result", done === "pushed" ? "removed" : "unchanged");
    } else if (command === "cleanup") {
      const e = env();
      const open = await openPulls(e);
      const removed: number[] = [];
      const dryRun = values["dry-run"];
      const done = await write(e.remote, cleanupChange(open, removed, dryRun));
      const list = removed.map((n) => `#${n}`).join(", ") || "none";
      console.log(`${PREFIX}: previews of pull requests that are not open: ${list}${dryRun ? " (dry run)" : ""}`);
      output("result", done === "pushed" ? "removed" : "unchanged");
    } else {
      throw new UsageFailure("deploy, remove or cleanup");
    }
    return 0;
  } catch (error) {
    if (error instanceof UsageFailure || (error instanceof TypeError && "code" in error)) {
      console.error(`${PREFIX}: ${error.message}\n\n${USAGE}`);
      return 2;
    }
    console.error(`::error::${PREFIX}: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
