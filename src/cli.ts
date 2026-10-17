#!/usr/bin/env node
// The CLI `lernapps`: one entry for the tooling's commands. `check` runs every deterministic check: in a repo the
// toolchain (format, lint, types; unit tests, build, end-to-end tests) and the checks of the built app, or the checks
// of the built app alone on a bundle or a URL. It runs whatever exists; the report is YAML. `create` writes a new app
// from an archetype's template (generator/create.ts); `update` moves an app to this tooling's pins
// (generator/update.ts); `hooks` installs an app's git hooks (archetypes/shared/install-hooks.ts); `changes` prints the
// change scope (changes/changes.ts), which each hook part of `check` asks first.
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { parse } from "yaml";
import { measure, type App, type Context, type Entry } from "../check/check.ts";
import { describeChecks, failed, finding, runChecks, toYaml, type Finding, type Report } from "../check/run.ts";
import { BrowserError, browserForTests, bundlePages, launch, serve, urlPageLimit, visitApp } from "../check/visit.ts";
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
import { ARCHITECTURE, hasArchitecture } from "../generator/architecture.ts";
import { create, CreateError, RUNTIME } from "../generator/create.ts";
import { update, UpdateError } from "../generator/update.ts";
import { countPrePushFailure } from "./plan.ts";
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
  /** arc42 of the working tree: files git does not know yet count too (ofWorkingTree). */
  workingTree?: boolean;
  /** `arc42 diff --format json` before a commit, whose findings the wrapper judges (architectureDiffFindings). */
  architectureDiff?: boolean;
}

/** In a repo, every run also writes its full report here, passing or not: the hooks and CI alike. */
const REPORT = "node_modules/.cache/lernapps/validation-report.yaml";
const CHECKS_PASS = "checks-pass";
/** A built app or a URL that could not be checked at all: a platform rule, unlike the toolchain's checks-pass. */
const APP_CHECKABLE = "app-checkable";
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

/** Folders that hold no sources of the project: what tools install or write. */
const NOT_SOURCES = new Set(["node_modules", "dist", "_site", "playwright-report", "test-results"]);

/** Whether the project has a Vue single-file component (.vue) among its sources. */
function hasVueFiles(dir: string): boolean {
  return readdirSync(dir, { withFileTypes: true }).some((entry) => {
    if (entry.isDirectory()) {
      return !entry.name.startsWith(".") && !NOT_SOURCES.has(entry.name) && hasVueFiles(join(dir, entry.name));
    }
    return entry.name.endsWith(".vue");
  });
}

/**
 * An arc42 step on the working tree, as the rest of the check reads it (the build, the tests): a file not added to git
 * yet counts too, so a freshly created app passes before anything is added. arc42 resolves paths only from
 * `git ls-files` (docToolchain/arc42-language#128). In a repository the step therefore runs on a copy of its index
 * with every untracked, not ignored file below the app added as intent to add: no content goes into git and the
 * repository's own index stays as it is. Outside a repository arc42 lists the files below its root, which must then
 * be the app's folder (by default it would be the architecture's).
 */
function ofWorkingTree(step: Step): { step: Step; done: () => void } {
  const where = step.where ?? [step.command, ...step.args].join(" ");
  const gitPath = spawnSync("git", ["rev-parse", "--git-path", "index"], { encoding: "utf8" });
  if (gitPath.status !== 0) {
    return { step: { ...step, where, args: ["--root", ".", ...step.args] }, done: () => {} };
  }
  const temp = mkdtempSync(join(tmpdir(), "lernapps-index-"));
  const index = join(temp, "index");
  const own = resolve(gitPath.stdout.trim());
  if (existsSync(own)) copyFileSync(own, index);
  const env = { ...step.env, GIT_INDEX_FILE: index };
  spawnSync("git", ["add", "--all", "--intent-to-add", "--", "."], { env: { ...process.env, ...env } });
  return { step: { ...step, where, env }, done: () => rmSync(temp, { recursive: true, force: true }) };
}

/** Runs a step; its output is shown only when it fails. */
function runStep(planned: Step): Finding | undefined {
  const { step, done } = planned.workingTree ? ofWorkingTree(planned) : { step: planned, done: () => {} };
  let result;
  try {
    result = spawnSync(step.command, step.args, {
      env: { ...projectEnv(), ...step.env },
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
    });
  } finally {
    done();
  }
  const where = step.where ?? [step.command, ...step.args].join(" ");
  if (result.error) {
    return finding(CHECKS_PASS, "error", {
      where,
      found: `${step.name}: cannot run ${step.command}: ${result.error.message}`,
      fix:
        step.command === "vue-tsc"
          ? "The app has Vue components (.vue), which vue-tsc type-checks: add it with npm install --save-dev vue-tsc typescript, then check again"
          : step.command === "arc42"
            ? `The app has an architecture (${ARCHITECTURE}/), which the arc42 CLI checks: add it with npm install --save-dev @doctc/arc42@0.36.1, then check again`
            : `Install the project's dependencies (npm ci), then check again`,
    });
  }
  if (result.status === 0) return undefined;
  process.stderr.write(`${result.stdout}${result.stderr}`);
  return finding(CHECKS_PASS, "error", {
    where,
    found: `${step.name} failed (its output is above)`,
    fix:
      step.command === "vp" && step.args[0] === "check"
        ? "Run vp check --fix, which fixes what it can of format and lint; fix the rest from the output, then check again"
        : step.command === "arc42"
          ? `Keep the architecture current with the code: fix each finding of ${where} in the app's own part, between the markers <!-- app: begin … --> and <!-- app: end … --> of ${ARCHITECTURE}/, or in the code; never edit outside those markers, which lernapps update replaces.${step.workingTree ? "" : " Before a commit arc42 reads what is staged: git add the new files that belong to the commit."} Then check again`
          : `Fix the cause from the output of ${where}, then check again`,
  });
}

/** No browser could start: in a repo a step of the toolchain's checks, on a built app or a URL the app could not be checked. */
const browserFinding = (error: BrowserError, rule: typeof CHECKS_PASS | typeof APP_CHECKABLE = CHECKS_PASS) =>
  finding(rule, "error", {
    where: "browser",
    found: error.message,
    fix:
      rule === CHECKS_PASS
        ? "Install Chromium and its system libraries: npx playwright install --with-deps chromium. Where no browser can run, push and let CI check"
        : "Install Chromium and its system libraries: npx playwright install --with-deps chromium, then check again. If no browser can start even then, open an issue at https://github.com/lernapps/tooling/issues with this message",
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

/**
 * Runs the Playwright tests in the browser of this run; a failing test of the runtime is named as a test of the
 * template, with what to do.
 */
function runEndToEndTests(browser: Record<string, string>): Finding | undefined {
  rmSync(E2E_RESULTS, { force: true });
  mkdirSync(dirname(E2E_RESULTS), { recursive: true });
  const failure = runStep({
    name: "end-to-end tests",
    command: "playwright",
    args: ["test", "--reporter=line,json"],
    where: "playwright test",
    env: { ...browser, PLAYWRIGHT_JSON_OUTPUT_FILE: resolve(E2E_RESULTS) },
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
      const { pages, stopped } = await visitApp(browser, base, (url) => url, {
        start: target.url,
        limit: urlPageLimit(),
      });
      return { base, pages, fitness: measure(pages, base), ...(stopped ? { stopped } : {}) };
    }
    const { server, base } = await serve(target.bundle, "/");
    try {
      // the file a URL serves: a folder's index.html, with or without the slash
      const name = (url: string) => {
        const path = decodeURIComponent(url.slice(base.length));
        if (path === "" || path.endsWith("/")) return `${path}index.html`;
        const file = join(target.bundle, path);
        return existsSync(file) && statSync(file).isDirectory() ? `${path}/index.html` : path;
      };
      const { pages, unreachable } = await visitApp(browser, base, name, { pages: bundlePages(target.bundle) });
      return { base, pages, fitness: measure(pages, base), bundle: target.bundle, unreachable };
    } finally {
      server.close();
    }
  } finally {
    await browser.close();
  }
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

/** What the arc42 CLI reads in an app with an architecture: a staged change of one of these is checked before a commit. */
const ARCHITECTURE_INPUTS = [`${ARCHITECTURE}/`, ".arc42ignore", "src/"];

/**
 * The architecture's step before a commit of an app with one (generator/architecture.ts), when the commit stages a
 * file of the architecture or of the sources: `arc42 diff --staged` (a fraction of a second), whose findings
 * architectureDiffFindings judges; before the first commit, which has nothing to compare with,
 * `arc42 validate --strict`.
 */
function architectureBeforeCommit(): Step | undefined {
  if (!hasArchitecture()) return undefined;
  const staged = stagedFiles();
  if (staged !== undefined && !staged.some((file) => ARCHITECTURE_INPUTS.some((input) => file.startsWith(input)))) {
    return undefined;
  }
  const head = spawnSync("git", ["rev-parse", "--verify", "--quiet", "HEAD"], { encoding: "utf8" }).status === 0;
  return head
    ? {
        name: "architecture",
        command: "arc42",
        args: ["--dir", ARCHITECTURE, "diff", "--staged", "--format", "json"],
        where: `arc42 --dir ${ARCHITECTURE} diff --staged`,
        architectureDiff: true,
      }
    : { name: "architecture", command: "arc42", args: ["--dir", ARCHITECTURE, "validate", "--strict"] };
}

/** A finding of `arc42 diff --format json` (DiffFinding of @doctc/arc42), as far as the wrapper reads it. */
interface DiffFinding {
  kind: string;
  file: string;
  line: number;
  message: string;
  elementId?: string;
}

/**
 * The paths of .arc42ignore, as arc42 reads them for its coverage hint H021 in `validate`: each line that is neither
 * blank nor a comment, trimmed, matched exactly. `arc42 diff` does not read the file (its coverage hint is not H021),
 * so the wrapper applies it to the diff's coverage hints: what validate accepts, the commit accepts too.
 */
function arc42Ignored(): Set<string> {
  if (!existsSync(".arc42ignore")) return new Set();
  return new Set(
    readFileSync(".arc42ignore", "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("#")),
  );
}

/**
 * What a commit's `arc42 diff --staged` found, judged for the commit: it fails on a block changed without its prose
 * (or the other way round) and on new code that no block claims and .arc42ignore does not list, as
 * `arc42 validate --strict` before a push would. A hint "review architecture element" (code changed under an
 * interface's path) asks a person to look at that element; it is shown as a warning and does not fail the commit,
 * since nothing in it is wrong yet. ARC42_CONSISTENT (arc42's acceptance, the HEAD commit) accepts only the
 * consistency findings, which can be intended, and they stay in the report as a warning; new code no block claims has
 * a fix that is always possible (a block, or .arc42ignore for configuration), so the acceptance does not pass it.
 */
function architectureDiffFindings(where: string, stdout: string, stderr: string): Finding[] {
  let diff: { accepted?: boolean; untracked?: string[]; findings?: DiffFinding[] };
  try {
    diff = JSON.parse(stdout) as typeof diff;
  } catch {
    process.stderr.write(`${stdout}${stderr}`);
    return [
      finding(CHECKS_PASS, "error", {
        where,
        found: "architecture: arc42 diff failed (its output is above)",
        fix: `Fix the cause from the output of ${where}, then check again`,
      }),
    ];
  }
  const ignored = arc42Ignored();
  const all = diff.findings ?? [];
  const consistency = all.filter((f) => f.kind !== "implementation-path" && f.kind !== "new-building-block-hint");
  const uncovered = all.filter((f) => f.kind === "new-building-block-hint" && !ignored.has(f.file));
  const review = all.filter((f) => f.kind === "implementation-path");
  const line = (f: DiffFinding) =>
    f.kind === "new-building-block-hint"
      ? `${f.file} is new code that no building block claims`
      : `${f.file}${f.line > 0 ? `:${f.line}` : ""} ${f.message}`;
  const findings: Finding[] = [];
  const failing = diff.accepted === true ? [] : consistency;
  if (failing.length < consistency.length) {
    findings.push(
      finding(CHECKS_PASS, "warning", {
        where,
        found: `architecture: accepted with ARC42_CONSISTENT, not fixed: ${consistency.map(line).join("; ")}`,
        fix: "Accept a finding only after reading it, with a note in the plan why it is intended; ARC42_CONSISTENT set without a finding shown is a bypass like --no-verify",
      }),
    );
  }
  const blocking = [...failing, ...uncovered];
  if (blocking.length > 0) {
    const fixes = [
      ...(uncovered.length > 0
        ? [
            `For new code no block claims, add a building block with its path to the app's section of ${ARCHITECTURE}/05-building-blocks.arc42.md (and place it on a node in chapter 7); only a path that is configuration rather than architecture goes into .arc42ignore. ARC42_CONSISTENT does not accept new code.`,
          ]
        : []),
      ...(failing.length > 0
        ? [
            "For a block changed without its prose, or prose naming a fact of a block without the block, change both together in the same commit. Only if you read the finding and judge the change intended may you accept it with ARC42_CONSISTENT (the base commit arc42 diff --staged names) and a note in the plan why.",
          ]
        : []),
    ];
    const untracked = diff.untracked ?? [];
    findings.push(
      finding(CHECKS_PASS, "error", {
        where,
        found: `architecture: ${blocking.map(line).join("; ")}`,
        fix: `Keep the architecture current with the code, in the app's own part between the markers <!-- app: begin … --> and <!-- app: end … --> of ${ARCHITECTURE}/ (never outside them, which lernapps update replaces). ${fixes.join(" ")} Before a commit arc42 reads what is staged: git add the files that belong to the commit${untracked.length > 0 ? ` (not compared until added: ${untracked.join(", ")})` : ""}. Then commit again`,
      }),
    );
  }
  if (review.length > 0) {
    findings.push(
      finding(CHECKS_PASS, "warning", {
        where,
        found: `architecture: code changed under an interface; review whether its element still says what the code does: ${review.map((f) => `${f.file} (${f.elementId ?? "?"})`).join(", ")}`,
        fix: `Read each element in ${ARCHITECTURE}/; if the change alters what it describes, update the element in the same commit. This does not fail the commit, and nothing is to be accepted`,
      }),
    );
  }
  return findings;
}

/** Runs a step and returns its findings: a diff's as architectureDiffFindings judges them, else runStep's one. */
function stepFindings(step: Step): Finding[] {
  if (!step.architectureDiff) {
    const failure = runStep(step);
    return failure ? [failure] : [];
  }
  const where = step.where ?? [step.command, ...step.args].join(" ");
  const result = spawnSync(step.command, step.args, {
    env: { ...projectEnv(), ...step.env },
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.error) return [runStep(step)].filter((f): f is Finding => f !== undefined);
  return architectureDiffFindings(where, result.stdout, result.stderr);
}

/** The checks of the toolchain in a repo, then the checks of what it built. */
async function checkProject(fast: boolean, heavy: boolean, context: Context): Promise<Report> {
  const findings: Finding[] = [];
  const steps: Step[] = [];
  if (fast && !heavy) {
    const architecture = architectureBeforeCommit();
    if (architecture) steps.push(architecture);
  }
  if (heavy && hasArchitecture()) {
    // the whole architecture of an app with one, strictly: any finding fails (references, required fields, paths
    // that exist, coverage of the sources), of the working tree like the rest of the check
    steps.push({
      name: "architecture",
      command: "arc42",
      args: ["--dir", ARCHITECTURE, "validate", "--strict"],
      workingTree: true,
    });
  }
  if (fast) {
    steps.push({ name: "format, lint, type check", command: "vp", args: ["check"] });
    // vp check type-checks the TypeScript files only; the Vue components (an explainer's src/components/<Name>.vue)
    // need vue-tsc, run only where there are any
    if (hasVueFiles(".")) {
      steps.push({ name: "type check of the Vue components", command: "vue-tsc", args: ["--noEmit"] });
    }
  }
  if (heavy) {
    steps.push({ name: "unit tests", command: "vp", args: ["test", "--passWithNoTests"] });
    // An app (index.html, as Vite builds it) or a package (vp pack, as this tooling).
    steps.push({ name: "build", command: "vp", args: existsSync("index.html") ? ["build"] : ["pack"] });
  }
  let built = true;
  for (const step of steps) {
    const found = stepFindings(step);
    findings.push(...found);
    if (found.length > 0 && step.name === "build") built = false;
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
      try {
        const failure = runEndToEndTests(await browserForTests());
        if (failure) findings.push(failure);
      } catch (error) {
        if (!(error instanceof BrowserError)) throw error;
        findings.push(browserFinding(error));
      }
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
    findings.push(browserFinding(error, APP_CHECKABLE));
  }
  const checks = await runChecks(context);
  return {
    checked: isUrl ? { url: target, at } : { bundle: target },
    rules: [...checks.rules, ...(findings.length > 0 ? [APP_CHECKABLE] : [])],
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
    // a commit of only docs still checks a change of the architecture, which is docs to the change scope
    const architecture =
      scope !== undefined && "skip" in scope && values["pre-commit"] ? architectureBeforeCommit() : undefined;
    if (architecture !== undefined) {
      report = {
        checked: commitOrDirectory(),
        parts: ["pre-commit"],
        rules: [CHECKS_PASS],
        findings: stepFindings(architecture),
        suppressions: [],
      };
    } else if (scope !== undefined && "skip" in scope) {
      rmSync(REPORT, { force: true }); // nothing was checked: no report of an earlier run stays as if it were this one's
      process.stdout.write(`${scope.skip}\n`);
      return 0;
    } else {
      report =
        scope !== undefined
          ? checkSite(scope.site)
          : await checkProject(all || values["pre-commit"], all || values["pre-push"], context);
      if (values["pre-push"] && failed(report)) countPrePushFailure();
    }
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
