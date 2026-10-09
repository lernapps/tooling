// A fixture app repo of the review (test/fixtures/reviews/<name>/app/), committed into a new repository with a fixed
// author, date and message, so that its commit is the same on every machine: the recorded verdict names it.
//
//   node test/review-fixture.ts <name> <dir>   creates the repo in <dir> (empty or new) and prints its commit
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { repoRoot, testEnv } from "./support.ts";

const FIXED = "2026-10-09T12:00:00Z";

export function reviewFixture(name: string, dir: string): { dir: string; commit: string } {
  mkdirSync(dir, { recursive: true });
  cpSync(join(repoRoot, "test/fixtures/reviews", name, "app"), dir, { recursive: true });
  // Without the user's git settings that change a commit (signing, line endings); with the fixed identity and date.
  const env = { ...testEnv, GIT_AUTHOR_DATE: FIXED, GIT_COMMITTER_DATE: FIXED };
  const git = (...args: string[]) => {
    const settings = ["-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", "-c", "core.filemode=true"];
    const result = spawnSync("git", [...settings, ...args], { cwd: dir, env, encoding: "utf8" });
    if (result.status !== 0) throw new Error(`git ${args.join(" ")} exited ${result.status}\n${result.stderr}`);
    return result.stdout.trim();
  };
  git("init", "--quiet", "--initial-branch=main");
  git("add", "--all", "--force");
  git("commit", "--quiet", "--no-verify", "--message", `fixture ${name}`);
  return { dir, commit: git("rev-parse", "HEAD") };
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [name, dir] = process.argv.slice(2);
  if (name === undefined || dir === undefined) {
    process.stderr.write("usage: node test/review-fixture.ts <name> <dir>\n");
    process.exitCode = 2;
  } else {
    process.stdout.write(`${reviewFixture(name, resolve(dir)).commit}\n`);
  }
}
