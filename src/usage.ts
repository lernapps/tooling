// The usage texts and options of the CLI `lernapps`: the one place where its commands, options, exit codes and
// behaviour are described for its users. The docs (README, architecture) describe responsibilities and link here;
// test/cli.test.ts checks that the help names every option the parser accepts.
import type { ParseArgsOptionsConfig } from "node:util";

/** A command was called wrongly: the CLI prints the message and the usage, and exits 2. */
export class UsageError extends Error {}

export const USAGE = `Usage: lernapps <command> [options]

Commands:
  changes [--staged | --pushed | --ci]            what a change can affect: none, docs or all
  check [--pre-commit] [--pre-push] [<dir|url>]   run the checks of a repo, a built app or an app on a URL
  create --archetype <name> [<dir>]               write a new app from the archetype's template
  hooks                                           install the app's git hooks (the app's prepare script)
  screenshots [--out <dir>] [<dir>]               an image of every page and every figure of a built explainer or quiz
  update                                          move the app to the runtime and tooling this tooling pins

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
  --pre-commit     the fast part: format, lint, type check (the pre-commit hook); where the project has
                   Vue components (.vue files), also their type check with vue-tsc --noEmit; in an app with
                   an architecture (docs/arc42/ from lernapps create, an interactive app), when the commit
                   stages a file of it, .arc42ignore or src/, arc42 diff --staged (also when the commit is only
                   docs): a block and its prose not changed together fail, and new code no block claims that
                   .arc42ignore does not list; a hint to review an element under whose path code changed is a
                   warning. Before the first commit arc42 validate --strict
  --pre-push       the heavy part: in an app with an architecture arc42 validate --strict, unit tests, build (vp build for an app with index.html, else vp pack),
                   checks of the built app in dist/, the Playwright tests when playwright.config.* exists,
                   dependency licences (the pre-push hook); a failure increments prePushFailures in the front
                   matter of the current plan (the highest number in .vibe/plans/, else .vibe/plan.md). A
                   failing generic test of the archetype's runtime (@lernapps/app-templates) is named as a test
                   of the template, with where to report it
  Without a flag, or with both, it runs both parts (CI): the hooks together run exactly what CI runs.
  Each hook part first asks lernapps changes what the change can affect (the staged files before a commit, the
  pushed commits before a push): a change of only the plan (.vibe/**) checks nothing; a change of only docs
  (docs/**/*.md) and the plan checks nothing in an app, whose bundle has no docs, and before a push builds and
  checks the site in a repo with one (npm run build, then npm run check:site in the tooling, npm run check in a
  site). Then it prints one line and writes no report. Anything else, or changed files it cannot know, runs the
  part. CI decides the same in the app check action (lernapps changes --help).
  Every run in a repo also writes the full report to node_modules/.cache/lernapps/validation-report.yaml,
  passing or not; the app check action keeps it. A failed run counts each rule with an error in failedChecks
  of the current plan's front matter, when it has the key.

On a built app, without its repo:
  <dir>            a bundle (a directory with index.html), served on 127.0.0.1
  <url>            an app on the web

The checks of a built app open its pages in Chromium, as a learner would, without a click; a link that only
changes the query string is the same page. Requests to other hosts are blocked and recorded.
  On a bundle   every page: first those reachable by links from the start page, then every other .html file,
                which is a finding of pages-reachable (unreachable from the start page). Not pages: 404.html at
                the root (the host's page for missing addresses) and a file without <!doctype html>. A page with
                <meta name="robots" content="noindex"> is checked, but no link needs to reach it.
  On a URL      the pages reachable by links, at most 100: a check of a deployed app stays within minutes and
                asks its host a bounded number of times. When it stops there, a hint of pages-reachable says how
                many pages it checked and that further pages were not visited; check the bundle for all of them.
  Explainer     a page the explainer runtime marks as its own, <meta name="lernapps-archetype" content="explainer">,
                is opened once more with JavaScript off, for explainer-readable-without-js: its h1, every heading,
                formula (<math>) and figure visible, a figure with its accessible name, every exercise's "Lösung"
                and every component's nojs text not empty. Pages without the marker get no second visit.
A page takes about a second; four are visited at a time, about 0.3 s per page: 120 pages in about 40 s.
Chromium is downloaded on the first run and cached; where no browser can run, the report says so.
A link whose server answers 429 (rate limited) is asked again after a short wait, at most a few seconds; still
limited, it is a finding of severity hint that names the link: not checked, nothing failed.

Options:
  --entry <file>   check a catalog entry (YAML) against the app: its URL and topic links resolve, a topic's
                   #<section> (or #<section>/<sub>) is an element id of its page as the server sends it, the
                   fitness values match; without <dir|url> the app at the entry's url is checked
  --report <file>  also write the full report to <file>, passing or not
  -h, --help       print this help

`;
/** The options of `lernapps changes`, as node:util parseArgs takes them. */
export const CHANGES_OPTIONS = {
  staged: { type: "boolean", default: false },
  pushed: { type: "boolean", default: false },
  ci: { type: "boolean", default: false },
  base: { type: "string" },
  head: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const CHANGES_USAGE = `Usage: lernapps changes [--staged | --pushed | --ci | --base <rev> [--head <rev>] | <path>...]

Prints the change scope of a change: what it can affect, and so what the hooks and CI run for it.
  none   every changed file is a plan: .vibe/**. Nothing runs
  docs   every changed file is docs, docs/**/*.md, or the plan. Only the site's checks and deployment run; an
         app has no site (its bundle holds no docs), so nothing runs
  all    anything else, also when the changed files are not known, or none are. Everything runs

"Docs" are only Markdown files below docs/ (docs/**/*.md). README.md, AGENTS.md and every other path are not
docs. The lists of none and docs are allowlists: every other path is all, so a new folder never causes a skip.

Where the changed files come from (one source):
  --staged         the staged files (the pre-commit hook)
  --pushed         the pushed commits, from git's lines on standard input (the pre-push hook): each ref against
                   the remote's commit; a new branch against its merge base with origin/main; no lines (run by
                   hand) or an unknown commit is all
  --ci             the GitHub Actions event: a pull request against the merge base with its base, a push to a
                   branch before..after; a new branch, workflow_dispatch and any other event is all. A shallow
                   clone is deepened once when a commit is missing. Also writes the step outputs scope, kind, code
                   (true when the code's build and tests run: scope all) and site (true when the site's checks and
                   deployment run) to GITHUB_OUTPUT, and a notice when something is skipped
  --base <rev>     what --head (default HEAD) adds to its merge base with <rev>
  <path>...        these paths, relative to the repo root
Without a source the changed files are not known: all.

The kind of repo decides what docs runs: app (index.html at the root), tooling (the package @lernapps/tooling),
site (any other: a site or the catalog). A repo may name its kind and declare exceptions in package.json, each
key optional, each list of path patterns relative to the repo root (** any folders, * any characters but /, a
pattern ending in / a folder):
  "lernapps": { "changes": { "kind": "site", "none": ["notes/**"], "docs": ["handbook/**/*.md"],
                             "all": ["docs/generated/**"] } }
  kind   app, tooling or site, instead of the detected one
  none   more patterns that are plan: nothing runs for them
  docs   more patterns that are docs
  all    patterns that are all, also where they match none or docs
Any other key, or a malformed value, is an error.

Prints the scope (none, docs or all) on standard output and why on standard error.
Exit codes: 0 when the scope is printed, 1 when package.json lernapps.changes is malformed, 2 on a usage error.

Options:
  -h, --help   print this help
`;

/** The options of `lernapps hooks`, as node:util parseArgs takes them. */
export const HOOKS_OPTIONS = {
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const HOOKS_USAGE = `Usage: lernapps hooks

Installs the git hooks of @lernapps/tooling (the fast part of lernapps check before a commit, the heavy part
before a push) into the repository of the app in the current folder. Every app runs it as its prepare script, so
npm install installs the hooks.

It installs them only where the current folder is the root of its git repository. In a folder inside another
repository, such as a template folder of lernapps/app-templates, it changes nothing and says so: that
repository keeps its own hooks. Outside a repository it says so too: git init, then npm install again.

Exit codes: 0 when the hooks are installed or deliberately not, 1 when they cannot be, 2 on a usage error.

Options:
  -h, --help   print this help
`;

/** The options of `lernapps screenshots`. */
export const SCREENSHOTS_OPTIONS = {
  out: { type: "string", default: "screenshots" },
  width: { type: "string", default: "360" },
  desktop: { type: "boolean", default: false },
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const SCREENSHOTS_USAGE = `Usage: lernapps screenshots [--out <dir>] [--width <px>] [--desktop] [<dir>]

Writes a full-page image of every page of a built explainer or quiz, and an image of every figure on it, so that a
creator sees what a learner sees before the app goes out. A page image is scaled down to be shown whole; check the
details of a figure, such as where a line of a drawing points, in its own image. It works where an assistant can only
send images: the images are PNG files, and an index.html shows them all in page order with each page's title and path
(one file, images relative, no network).

The built app is <dir>, default dist/ (build it first). Its pages are those lernapps check visits; the start page
comes first. Each is opened in Chromium, as a learner first sees it: nothing answered, no hover, animations off,
fonts and images loaded; requests to other hosts are blocked. A figure is a block figure or labelled-figure, or any
other figure with an image or a drawing. It is cut out with its caption, at twice its size on screen, from the page
as the build writes it, without JavaScript, so that the figures of every question of a quiz are there too; a figure
that takes no space, such as one in a closed details element, is left out. Another archetype, such as an interactive
app, is not supported. Prints the folder and the number of pages and figures.

Exit codes: 0 when the images are written, 1 when they cannot be (an archetype not supported, no browser can run),
2 on a usage error, such as no build in <dir>. Then no folder is written or emptied.

Output: one PNG per page, named by its order and path (01-index.png, 02-plan-selbsteinschaetzung.png), one PNG per
figure, named by its page and its place on the page (02-plan-selbsteinschaetzung-figure-1.png), and the index.html,
which shows the figures with their page, in the folder --out. The folder is emptied first. It is not part of the app: do not commit it.

Options:
  --out <dir>    the folder of the images (default screenshots)
  --width <px>   the width of the images in pixels (default 360, a phone)
  --desktop      also images 1280 px wide; every image is then named with its width (01-index-360.png,
                 01-index-1280.png, 01-index-figure-1-1280.png)
  -h, --help     print this help
`;
