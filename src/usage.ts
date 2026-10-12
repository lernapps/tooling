// The usage texts and options of the CLI `lernapps`: the one place where its commands, options, exit codes and
// behaviour are described for its users. The docs (README, architecture) describe responsibilities and link here;
// test/cli.test.ts checks that the help names every option the parser accepts.
import type { ParseArgsOptionsConfig } from "node:util";

/** A command was called wrongly: the CLI prints the message and the usage, and exits 2. */
export class UsageError extends Error {}

export const USAGE = `Usage: lernapps <command> [options]

Commands:
  check [--pre-commit] [--pre-push] [<dir|url>]   run the checks of a repo, a built app or an app on a URL
  create --archetype <name> [<dir>]               write a new app from the archetype's template

Options:
  -h, --help      print this help
  -v, --version   print the version

Run "lernapps <command> --help" for the options of a command. Exit codes: 0 on success, 1 when a check fails or
the app cannot be created, 2 on a usage error.

The package @lernapps/tooling is installed from git, not from npm. Before it is installed, run a command with
  npx --yes github:lernapps/tooling#main <command> ...
In an app, it is a development dependency at a commit: npx lernapps <command> ...
`;

/** The options of `lernapps check`, as node:util parseArgs takes them. */
export const CHECK_OPTIONS = {
  "pre-commit": { type: "boolean", default: false },
  "pre-push": { type: "boolean", default: false },
  entry: { type: "string" },
  report: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const CHECK_USAGE = `Usage: lernapps check [--pre-commit] [--pre-push] [<dir|url>] [--entry <file>] [--report <file>]

Runs every check that has something to check. Passing, it prints one line; otherwise the validation report in
YAML (schema: https://lernapps.net/tooling/schemas/validation-report.v1.schema.json). Every finding names its
rule id and severity, where, what was found and how to fix it, and links its rule.

Exit codes: 0 when no rule of severity error fails, 1 when one does, 2 on a usage error.

In a repo (no <dir|url>):
  --pre-commit     the fast part: format, lint, type check (the pre-commit hook)
  --pre-push       the heavy part: unit tests, build (vp build for an app with index.html, else vp pack),
                   checks of the built app in dist/, the Playwright tests when playwright.config.* exists,
                   dependency licences (the pre-push hook); a failure increments prePushFailures in the front
                   matter of .vibe/plan.md
  Without a flag, or with both, it runs both parts (CI): the hooks together run exactly what CI runs.
  Every run in a repo also writes the full report to node_modules/.cache/lernapps/validation-report.yaml,
  passing or not; the app check action keeps it.

On a built app, without its repo:
  <dir>            a bundle (a directory with index.html), served on 127.0.0.1
  <url>            an app on the web

The checks of a built app open every page reachable from the start page in Chromium, as a learner would, without
a click; a link that only changes the query string is the same page. Requests to other hosts are blocked and
recorded. Chromium is downloaded on the first run and cached; where no browser can run, the report says so.

Options:
  --entry <file>   check a catalog entry (YAML) against the app: its URL and topic links resolve, the fitness
                   values match; without <dir|url> the app at the entry's url is checked
  --report <file>  also write the full report to <file>, passing or not
  -h, --help       print this help

`;
