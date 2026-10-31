#!/usr/bin/env node
// The rule lockfile-matches for the sites (docs, practice, the site frame): they do not install the tooling, so they
// have no lernapps check, and a git pin that moved in package.json alone would go unnoticed there. Their site check
// action runs this file from its own checkout; apps, the templates and this repo get the rule from lernapps check.
import { lockfileProblems } from "./lockfile.ts";

const problems = lockfileProblems(process.cwd()) ?? [];
for (const problem of problems) {
  process.stderr.write(`${problem.where}: ${problem.found}. ${problem.fix}.\n`);
}
process.exitCode = problems.length === 0 ? 0 : 1;
