#!/usr/bin/env node
// The CLI `lernapps`: one entry for the tooling's commands. `check` runs every deterministic check: in a repo the
// toolchain (format, lint, types; unit tests, build, end-to-end tests) and the checks of the built app, or the checks
// of the built app alone on a bundle or a URL. It runs whatever exists; the report is YAML. `create` writes a new app
// from an archetype's template (generator/create.ts).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { delimiter, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { parse } from "yaml";
import { measure, type App, type Context, type Entry } from "../check/check.ts";
import { failed, finding, runChecks, toYaml, type Finding, type Report } from "../check/run.ts";
import { BrowserError, launch, serve, visitApp } from "../check/visit.ts";
import { create, CreateError } from "../generator/create.ts";
import { UsageError } from "./usage.ts";

const USAGE = `Usage: lernapps <command> [options]

Commands:
  check [--pre-commit] [--pre-push] [<dir|url>]   run the checks of a repo, a built app or an app on a URL
  create --archetype <name> [<dir>]               write a new app from the archetype's template

Options:
  -h, --help      print this help
  -v, --version   print the version

Run "lernapps <command> --help" for the options of a command.
`;

const CHECK_USAGE = `Usage: lernapps check [--pre-commit] [--pre-push] [<dir|url>] [--entry <file>] [--site <path>] [--report <file>]

Runs every check that has something to check. Exits 0 when no rule of severity error fails, 1 when one does.
Passing, it prints one line; otherwise the validation report in YAML (schema:
https://lernapps.net/tooling/schemas/validation-report.v1.schema.json).

In a repo (no <dir|url>):
  --pre-commit     the fast part: format, lint, type check (the pre-commit hook)
  --pre-push       the heavy part: unit tests, build, checks of the built app in dist/, the Playwright tests
                   when playwright.config.* exists, dependency licences (the pre-push hook); a failure
                   increments prePushFailures in .vibe/plan.md
  Without a flag, or with both, it runs both parts (CI): the hooks together run exactly what CI runs.

On a built app, without its repo:
  <dir>            a bundle (a directory with index.html), served on 127.0.0.1
  <url>            an app on the web

Options:
  --entry <file>   check a catalog entry (YAML) against the app: its URL and topic links resolve, the fitness
                   values match; without <dir|url> the app at the entry's url is checked
  --site <path>    the app is served on lernapps.net at <path> (e.g. /brueche/): also the site rules
                   (lernapps-check of the site frame); needs a bundle
  --report <file>  also write the full report to <file>, passing or not
  -h, --help       print this help
`;

/** A step of a part: a command of the project's toolchain and what it checks. */
interface Step {
  name: string;
  command: string;
  args: readonly string[];
}

const PLAN = ".vibe/plan.md";
const CHECKS_PASS = "checks-pass";

function version(): string {
  const manifest: unknown = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  if (typeof manifest === "object" && manifest !== null && "version" in manifest) {
    return String(manifest.version);
  }
  return "unknown";
}

/** The toolchain of the project being checked: its node_modules/.bin first. */
const projectEnv = (): NodeJS.ProcessEnv => ({
  ...process.env,
  PATH: [join(process.cwd(), "node_modules", ".bin"), process.env["PATH"] ?? ""].join(delimiter),
});

/** Runs a step; its output is shown only when it fails. */
function runStep(step: Step): Finding | undefined {
  const result = spawnSync(step.command, step.args, {
    env: projectEnv(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  const where = [step.command, ...step.args].join(" ");
  if (result.error) {
    return finding(CHECKS_PASS, "error", {
      where,
      found: `${step.name}: cannot run ${step.command}: ${result.error.message}`,
      fix: `Install the project's dependencies (npm ci), then check again`,
    });
  }
  if (result.status === 0) return undefined;
  process.stderr.write(`${result.stdout}${result.stderr}`);
  return finding(CHECKS_PASS, "error", {
    where,
    found: `${step.name} failed (its output is above)`,
    fix: `Fix the cause from the output of ${where}, then check again`,
  });
}

const browserFinding = (error: BrowserError) =>
  finding(CHECKS_PASS, "error", {
    where: "browser",
    found: error.message,
    fix: "Install Chromium and its system libraries: npx playwright install --with-deps chromium. Where no browser can run, push and let CI check",
  });

/** Serves a bundle (or opens a URL), visits its pages and measures its fitness. */
async function visit(target: { bundle: string } | { url: string }, site: string | undefined): Promise<App> {
  const browser = await launch();
  try {
    if ("url" in target) {
      const base = new URL("./", target.url).href;
      const pages = await visitApp(browser, base, (url) => url, target.url);
      return { base, pages, fitness: measure(pages, base) };
    }
    const { server, base } = await serve(target.bundle, site ?? "/");
    try {
      const name = (url: string) => {
        const path = decodeURIComponent(url.slice(base.length));
        return path === "" || path.endsWith("/") ? `${path}index.html` : path;
      };
      const pages = await visitApp(browser, base, name);
      return { base, pages, fitness: measure(pages, base), bundle: target.bundle };
    } finally {
      server.close();
    }
  } finally {
    await browser.close();
  }
}

/** Increments prePushFailures in the plan's front matter, when there is a plan file with the key. */
function countPrePushFailure(): void {
  if (!existsSync(PLAN)) return;
  const text = readFileSync(PLAN, "utf8");
  const counted = text.replace(
    /^(---\n(?:(?!---\n)[^\n]*\n)*?prePushFailures:[ \t]*)(\d+)/,
    (_match, head: string, count: string) => `${head}${Number(count) + 1}`,
  );
  if (counted !== text) writeFileSync(PLAN, counted);
}

function commitOrDirectory(): Report["checked"] {
  const git = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  const commit = git.status === 0 ? git.stdout.trim() : "";
  return /^[0-9a-f]{40}$/.test(commit) ? { commit } : { directory: process.cwd() };
}

function readEntry(file: string): { file: string; value: Entry } {
  let value: unknown;
  try {
    value = parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new UsageError(`cannot read the entry ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (typeof value !== "object" || value === null || typeof (value as Entry).url !== "string") {
    throw new UsageError(`the entry ${file} has no url`);
  }
  return { file, value: value as Entry };
}

/** The checks of the toolchain in a repo, then the checks of what it built. */
async function checkProject(fast: boolean, heavy: boolean, context: Context): Promise<Report> {
  const findings: Finding[] = [];
  const steps: Step[] = [];
  if (fast) steps.push({ name: "format, lint, type check", command: "vp", args: ["check"] });
  if (heavy) {
    steps.push({ name: "unit tests", command: "vp", args: ["test", "--passWithNoTests"] });
    // An app (index.html, as Vite builds it) or a package (vp pack, as this tooling).
    steps.push({ name: "build", command: "vp", args: existsSync("index.html") ? ["build"] : ["pack"] });
  }
  let built = true;
  for (const step of steps) {
    const failure = runStep(step);
    if (failure) findings.push(failure);
    if (failure && step.name === "build") built = false;
  }
  const rules = steps.length > 0 ? [CHECKS_PASS] : [];
  if (heavy && built) {
    context.project = process.cwd();
    if (existsSync(join("dist", "index.html"))) {
      try {
        context.app = await visit({ bundle: "dist" }, context.site);
      } catch (error) {
        if (!(error instanceof BrowserError)) throw error;
        findings.push(browserFinding(error));
      }
    }
    const checks = await runChecks(context);
    rules.push(...checks.rules);
    findings.push(...checks.findings);
    const config = ["ts", "js", "mjs", "cjs"].map((ext) => `playwright.config.${ext}`).find((file) => existsSync(file));
    if (config !== undefined) {
      const failure =
        runStep({ name: "browser for the end-to-end tests", command: "playwright", args: ["install", "chromium"] }) ??
        runStep({ name: "end-to-end tests", command: "playwright", args: ["test"] });
      if (failure) findings.push(failure);
    }
  }
  return {
    checked: commitOrDirectory(),
    parts: [...(fast ? ["pre-commit" as const] : []), ...(heavy ? ["pre-push" as const] : [])],
    rules,
    findings,
    suppressions: [],
    ...(context.app ? { fitness: context.app.fitness } : {}),
  };
}

/** The checks of a built app alone: a bundle directory or a URL. */
async function checkApp(target: string, context: Context): Promise<Report> {
  const isUrl = /^https?:\/\//.test(target);
  if (!isUrl && !(existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, "index.html")))) {
    throw new UsageError(`${target}: not a URL, nor a directory with index.html (build the app first)`);
  }
  if (isUrl && context.site !== undefined) throw new UsageError("--site needs a bundle directory, not a URL");
  const at = new Date().toISOString();
  const findings: Finding[] = [];
  try {
    context.app = await visit(isUrl ? { url: target } : { bundle: target }, context.site);
  } catch (error) {
    if (!(error instanceof BrowserError)) throw error;
    findings.push(browserFinding(error));
  }
  const checks = await runChecks(context);
  return {
    checked: isUrl ? { url: target, at } : { bundle: target },
    rules: [...checks.rules, ...(findings.length > 0 ? [CHECKS_PASS] : [])],
    findings: [...findings, ...checks.findings],
    suppressions: [],
    ...(context.app ? { fitness: context.app.fitness } : {}),
  };
}

async function check(args: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      "pre-commit": { type: "boolean", default: false },
      "pre-push": { type: "boolean", default: false },
      entry: { type: "string" },
      site: { type: "string" },
      report: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
    allowPositionals: true,
  });
  if (values.help) {
    process.stdout.write(CHECK_USAGE);
    return 0;
  }
  if (positionals.length > 1) throw new UsageError(`one <dir|url> at most, not ${positionals.join(" ")}`);
  const context: Context = {};
  if (values.site !== undefined) {
    if (!/^\/([^/]+\/)*$/.test(values.site)) throw new UsageError(`--site ${values.site}: a path like /brueche/`);
    context.site = values.site;
  }
  if (values.entry !== undefined) context.entry = readEntry(values.entry);
  const target = positionals[0] ?? context.entry?.value.url;

  let report: Report;
  if (target !== undefined) {
    if (values["pre-commit"] || values["pre-push"]) {
      throw new UsageError("--pre-commit and --pre-push check a repo; a built app is checked without them");
    }
    report = await checkApp(target, context);
  } else {
    const all = values["pre-commit"] === values["pre-push"];
    report = await checkProject(all || values["pre-commit"], all || values["pre-push"], context);
    if (values["pre-push"] && failed(report)) countPrePushFailure();
  }

  const yaml = toYaml(report);
  if (values.report !== undefined) writeFileSync(values.report, yaml);
  if (report.findings.length > 0) {
    process.stdout.write(yaml);
  } else {
    const what =
      "commit" in report.checked
        ? `commit ${report.checked.commit.slice(0, 7)}`
        : "bundle" in report.checked
          ? relative(process.cwd(), resolve(report.checked.bundle)) || "."
          : "url" in report.checked
            ? report.checked.url
            : report.checked.directory;
    process.stdout.write(
      `lernapps check: ok, ${report.rules.length} rule${report.rules.length === 1 ? "" : "s"}, no findings (${what})\n`,
    );
  }
  return failed(report) ? 1 : 0;
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  switch (command) {
    case "check":
      return check(rest);
    case "create":
      return create(rest);
    case "-h":
    case "--help":
      process.stdout.write(USAGE);
      return 0;
    case "-v":
    case "--version":
      process.stdout.write(`${version()}\n`);
      return 0;
    case undefined:
      throw new UsageError("no command given");
    default:
      throw new UsageError(`unknown command: ${command}`);
  }
}

try {
  process.exitCode = await main(process.argv.slice(2));
} catch (error) {
  // A usage error, or an unknown or malformed option found by node:util parseArgs (ERR_PARSE_ARGS_*)
  const parseError = error instanceof TypeError && "code" in error && String(error.code).startsWith("ERR_PARSE_ARGS");
  if (error instanceof UsageError || parseError) {
    process.stderr.write(`lernapps: ${error.message}\n\n${USAGE}`);
    process.exitCode = 2;
  } else if (error instanceof CreateError) {
    process.stderr.write(`lernapps create: ${error.message}\n`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
