#!/usr/bin/env node
// The lock file check without installing anything: the site check action runs it from its own checkout of this repo
// (node check/lockfile-main.ts), before npm ci. In an app, lernapps check runs the same as the rule lockfile-matches.
import { lockfileProblems } from "./lockfile.ts";

const problems = lockfileProblems(process.cwd()) ?? [];
for (const problem of problems) {
  process.stderr.write(`${problem.where}: ${problem.found}. ${problem.fix}.\n`);
}
process.exitCode = problems.length === 0 ? 0 : 1;
