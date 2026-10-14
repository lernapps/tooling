#!/usr/bin/env node
// The CLI `lernapps`: one entry for the tooling's commands. `check` runs every deterministic check: in a repo the
// toolchain (format, lint, types; unit tests, build, end-to-end tests) and the checks of the built app, or the checks
// of the built app alone on a bundle or a URL. It runs whatever exists; the report is YAML. `create` writes a new app
// from an archetype's template (generator/create.ts); `update` moves an app to this tooling's pins
// (generator/update.ts); `hooks` installs an app's git hooks (archetypes/shared/install-hooks.ts); `changes` prints the
// change scope (changes/changes.ts), which each hook part of `check` asks first.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { delimiter, dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { parse } from "yaml";
import { measure, type App, type Context, type Entry } from "../check/check.ts";
import { describeChecks, failed, finding, runChecks, toYaml, type Finding, type Report } from "../check/run.ts";
import { BrowserError, launch, serve, visitApp } from "../check/visit.ts";
import { installHooks } from "../archetypes/shared/install-hooks.ts";
import {
  changes,
  ChangesConfigError,
  classify,
  loadRules,
  pushedFiles,
  readStdin,
  SITE_CHECK,
  stagedFiles,
} from "../changes/changes.ts";
import { create, CreateError, RUNTIME } from "../generator/create.ts";
import { update, UpdateError } from "../generator/update.ts";
import { CHECK_OPTIONS, CHECK_USAGE, USAGE, UsageError } from "./usage.ts";

/** A step of a part: a command of the project's toolchain and what it checks. */
interface Step {
  name: string;
  command: string;
  args: readonly string[];
  /** How the messages name the step, when not by its command line. */
  where?: string;
  /** Environment variables for the step only. */
  env?: Record<string, string>;
}

const PLAN = ".vibe/plan.md";
/** In a repo, every run also writes its full report here, passing or not: the hooks and CI alike. */
const REPORT = "node_modules/.cache/lernapps/validation-report.yaml";
const CHECKS_PASS = "checks-pass";
/** The Playwright tests' results, as its JSON reporter writes them, to tell the runtime's tests from the app's. */
const E2E_RESULTS = "node_modules/.cache/lernapps/playwright-results.json";
const RUNTIME_ISSUES = "https://github.com/lernapps/app-templates/issues";

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
    env: { ...projectEnv(), ...step.env },
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  const where = step.where ?? [step.command, ...step.args].join(" ");
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

interface Suite {
  title?: string;
  specs?: { title: string; file: string; ok: boolean }[];
  suites?: Suite[];
}

/**
 * The failing tests that are defined in the runtime (a file below node_modules/@lernapps/app-templates/), by their
 * titles: the suites' titles below the file, then the test's. Playwright names a spec's file relative to the test
 * folder, e.g. ../node_modules/@lernapps/app-templates/dist/quiz-e2e.mjs for the quiz's e2e/quiz.e2e.ts, which only
 * calls quizTests(). Empty when the results cannot be read.
 */
function failingRuntimeTests(): string[] {
  let results: { suites?: Suite[] };
  try {
    results = JSON.parse(readFileSync(E2E_RESULTS, "utf8")) as { suites?: Suite[] };
  } catch {
    return [];
  }
  const found = new Set<string>();
  const walk = (suite: Suite, titles: string[]) => {
    for (const spec of suite.specs ?? []) {
      if (!spec.ok && spec.file.split(/[\\/]/).join("/").includes(`node_modules/${RUNTIME}/`)) {
        found.add([...titles, spec.title].join(" › "));
      }
    }
    for (const child of suite.suites ?? []) walk(child, child.title ? [...titles, child.title] : titles);
  };
  // the top suites are files: their titles are file names, not part of a test's title
  for (const file of results.suites ?? []) walk(file, []);
  return [...found].sort();
}

/** Runs the Playwright tests; a failing test of the runtime is named as a test of the template, with what to do. */
function runEndToEndTests(): Finding | undefined {
  rmSync(E2E_RESULTS, { force: true });
  mkdirSync(dirname(E2E_RESULTS), { recursive: true });
  const failure = runStep({
    name: "end-to-end tests",
    command: "playwright",
    args: ["test", "--reporter=line,json"],
    where: "playwright test",
    env: { PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(E2E_RESULTS) },
  });
  if (failure === undefined) return undefined;
  const runtime = failingRuntimeTests();
  if (runtime.length === 0) return failure;
  const shown = runtime.slice(0, 5).map((title) => `"${title}"`);
  const more = runtime.length > shown.length ? ` and ${runtime.length - shown.length} more` : "";
  return {
    ...failure,
    found: `end-to-end tests failed (their output is above): ${runtime.length === 1 ? "a generic test" : "generic tests"} of the template's runtime ${RUNTIME}, not of this app: ${shown.join(", ")}${more}`,
    fix: `If the content validates (the build passed), this is a bug in the template: tell the creator and open an issue at ${RUNTIME_ISSUES} with this validation report (or ask the creator to). Never change the tests or the configuration to get around it. Once it is fixed, lernapps update moves the app to the fixed runtime: npx --yes github:lernapps/tooling#main update`,
  };
}

/** Serves a bundle (or opens a URL), visits its pages and measures its fitness. */
async function visit(target: { bundle: string } | { url: string }): Promise<App> {
  const browser = await launch();
  try {
    if ("url" in target) {
      const base = new URL("./", target.url).href;
      const pages = await visitApp(browser, base, (url) => url, target.url);
      return { base, pages, fitness: measure(pages, base) };
    }
    const { server, base } = await serve(target.bundle, "/");
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
        context.app = await visit({ bundle: "dist" });
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
        runEndToEndTests();
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

/**
 * Before a hook part, the change scope (changes/changes.ts) of the staged files (pre-commit) or the pushed commits
 * (pre-push): the line to print when the part has nothing to check, the site's check when the push changes only docs
 * in a repo with a site, else undefined and the part runs.
 */
function hookScope(part: "pre-commit" | "pre-push"): { skip: string } | { site: string } | undefined {
  const rules = loadRules(".");
  const { scope, reason } = classify(part === "pre-commit" ? stagedFiles() : pushedFiles(readStdin()), rules);
  if (scope === "all") return undefined;
  const site = SITE_CHECK[rules.kind];
  if (scope === "docs" && part === "pre-push" && site !== undefined) return { site };
  const what =
    scope === "none" ? "the plan only" : rules.kind === "app" ? "docs, which an app does not bundle" : "docs";
  return { skip: `lernapps check --${part}: nothing to check, the change is ${what} (${scope}: ${reason})` };
}

/** The check of a repo's site before a push that changes only docs: build it, then its check script. */
function checkSite(script: string): Report {
  const findings: Finding[] = [];
  for (const step of [
    { name: "site build", command: "npm", args: ["run", "--silent", "build"] },
    { name: "site check", command: "npm", args: ["run", "--silent", script] },
  ]) {
    const failure = runStep(step);
    if (failure) {
      findings.push(failure);
      break;
    }
  }
  return { checked: commitOrDirectory(), parts: ["pre-push"], rules: [CHECKS_PASS], findings, suppressions: [] };
}

/** The checks of a built app alone: a bundle directory or a URL. */
async function checkApp(target: string, context: Context): Promise<Report> {
  const isUrl = /^https?:\/\//.test(target);
  if (!isUrl && !(existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, "index.html")))) {
    throw new UsageError(`${target}: not a URL, nor a directory with index.html (build the app first)`);
  }
  const at = new Date().toISOString();
  const findings: Finding[] = [];
  try {
    context.app = await visit(isUrl ? { url: target } : { bundle: target });
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
    options: CHECK_OPTIONS,
    strict: true,
    allowPositionals: true,
  });
  if (values.help) {
    process.stdout.write(`${CHECK_USAGE}${await describeChecks()}`);
    return 0;
  }
  if (positionals.length > 1) throw new UsageError(`one <dir|url> at most, not ${positionals.join(" ")}`);
  const context: Context = {};
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
    const scope = all ? undefined : hookScope(values["pre-commit"] ? "pre-commit" : "pre-push");
    if (scope !== undefined && "skip" in scope) {
      rmSync(REPORT, { force: true }); // nothing was checked: no report of an earlier run stays as if it were this one's
      process.stdout.write(`${scope.skip}\n`);
      return 0;
    }
    report =
      scope !== undefined
        ? checkSite(scope.site)
        : await checkProject(all || values["pre-commit"], all || values["pre-push"], context);
    if (values["pre-push"] && failed(report)) countPrePushFailure();
  }

  const yaml = toYaml(report);
  if (target === undefined) {
    mkdirSync(dirname(REPORT), { recursive: true });
    writeFileSync(REPORT, yaml);
  }
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
    case "changes":
      return changes(rest);
    case "check":
      return check(rest);
    case "create":
      return create(rest);
    case "hooks":
      return installHooks(rest);
    case "update":
      return update(rest);
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
  } else if (error instanceof ChangesConfigError) {
    process.stderr.write(`lernapps: ${error.message}\n`);
    process.exitCode = 1;
  } else if (error instanceof CreateError) {
    process.stderr.write(`lernapps create: ${error.message}\n`);
    process.exitCode = 1;
  } else if (error instanceof UpdateError) {
    process.stderr.write(`lernapps update: ${error.message}\n`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
