// The fixture apps of the app check action (actions/app-check): a quiz app from `lernapps create` with the fixture bank,
// installed from a fresh clone of this repo and committed, its hooks run as git runs them (`git commit`, then
// `git push` to a bare remote). The fixture `failing` plants a mistake the pre-push hook catches: a stylesheet from
// another host (check no-request-before-click on the built app). The e2e test (app-check.e2e.test.ts) and the
// workflow app-check.yml use it; both compare what the action's check finds with what the hooks found.
//
//   node test/app-fixture.ts <passing|failing> <dir> <hooks.yaml>
//       creates the app in <dir>, runs its hooks and writes what they found to <hooks.yaml>
//   node test/app-fixture.ts compare <hooks.yaml> <report.yaml> <success|failure>
//       the action's report and outcome match the hooks': exit 0, else 1 with the difference
import { appendFileSync, cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { appTemplates, freshClone, ok, repoRoot, run, tempDir, type Result } from "./support.ts";

/** Where `lernapps check` writes its full report in a repo, in the hooks and in CI. */
export const REPORT = "node_modules/.cache/lernapps/validation-report.yaml";
const BANK = join(repoRoot, "test/fixtures/quiz/quiz.json");

export interface Finding {
  rule: string;
  severity: string;
  where: string;
  found: string;
  fix: string;
  link: string;
}

/** What one hook did: whether git went on, its output, and the findings of the report its check wrote. */
export interface HookRun {
  hook: "pre-commit" | "pre-push";
  passed: boolean;
  output: string;
  findings: Finding[];
}

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

/** The report `lernapps check` wrote in the app; fails when the run wrote none. */
export function readReport(file: string): { findings: Finding[] } {
  if (!existsSync(file)) throw new Error(`no validation report at ${file}: lernapps check did not run to its end`);
  return parse(readFileSync(file, "utf8")) as { findings: Finding[] };
}

/** The quiz app with the fixture bank, installed, in a git repo with a bare remote `origin`; nothing committed. */
export function createApp(dir: string): string {
  const tooling = freshClone();
  const created = run(
    "node",
    [
      join(repoRoot, "src/cli.ts"),
      "create",
      "--archetype",
      "quiz",
      dir,
      "--tooling",
      `git+file://${tooling}`,
      "--templates",
      appTemplates(),
    ],
    repoRoot,
  );
  if (created.code !== 0) throw new Error(output(created));
  const remote = tempDir("remote");
  ok("git", ["init", "--quiet", "--bare", "--initial-branch=main"], remote);
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  ok("git", ["remote", "add", "origin", remote], dir);
  ok("npm", ["install", "--no-audit", "--no-fund"], dir); // installs the hooks
  cpSync(BANK, join(dir, "src/quiz.json"));
  ok(join(dir, "node_modules/.bin/vp"), ["fmt"], dir); // as the pre-commit hook would format it
  return dir;
}

/** A mistake the pre-push hook catches: a stylesheet from another host, loaded before any click. */
export function plantRequest(dir: string): void {
  const page = join(dir, "index.html");
  writeFileSync(
    page,
    readFileSync(page, "utf8").replace(
      "</head>",
      '  <link rel="stylesheet" href="https://fonts.lernapps.invalid/quiz.css" />\n  </head>',
    ),
  );
}

/** A mistake the pre-commit hook catches: localStorage used directly, not through the storage wrapper. */
export function plantLintError(dir: string): void {
  appendFileSync(join(dir, "src/main.ts"), 'console.info(localStorage.getItem("probe"));\n');
}

/**
 * Commits and pushes every change as the creator's assistant would, with the hooks. A commit the pre-commit hook
 * refuses is made without it, so that the pre-push hook runs too, as it would after a fix of the first mistake.
 */
export function runHooks(dir: string, message: string): HookRun[] {
  const report = join(dir, REPORT);
  const hook = (name: HookRun["hook"], args: string[]): HookRun => {
    rmSync(report, { force: true });
    const result = run("git", args, dir);
    return { hook: name, passed: result.code === 0, output: output(result), findings: readReport(report).findings };
  };
  ok("git", ["add", "--all"], dir);
  const commit = hook("pre-commit", ["commit", "--quiet", "--message", message]);
  if (!commit.passed) ok("git", ["commit", "--quiet", "--no-verify", "--message", message], dir);
  const push = hook("pre-push", ["push", "--quiet", "origin", "HEAD:main"]);
  return [commit, push];
}

/** The differences between the action's run (its report and outcome) and the hooks' runs; none when they agree. */
export function compare(hooks: readonly HookRun[], report: { findings: Finding[] }, outcome: string): string[] {
  const key = (finding: Finding) => JSON.stringify(finding);
  const expected = hooks.flatMap((run) => run.findings.map(key)).sort();
  const actual = report.findings.map(key).sort();
  const problems: string[] = [];
  const passed = hooks.every((run) => run.passed);
  if ((outcome === "success") !== passed) {
    problems.push(`the action's check ended in ${outcome}, the hooks ${passed ? "passed" : "failed"}`);
  }
  for (const finding of actual.filter((item) => !expected.includes(item))) {
    problems.push(`only the action found: ${finding}`);
  }
  for (const finding of expected.filter((item) => !actual.includes(item))) {
    problems.push(`only the hooks found: ${finding}`);
  }
  return problems;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, first, second, third] = process.argv.slice(2);
  if (command === "compare" && first && second && third) {
    const problems = compare(parse(readFileSync(first, "utf8")) as HookRun[], readReport(second), third);
    process.stdout.write(
      problems.length === 0
        ? "app check: the action's check found the same as the hooks\n"
        : `app check: the action's check and the hooks differ:\n${problems.map((line) => `- ${line}\n`).join("")}`,
    );
    process.exitCode = problems.length === 0 ? 0 : 1;
  } else if ((command === "passing" || command === "failing") && first && second) {
    const dir = createApp(resolve(first));
    if (command === "failing") {
      ok("git", ["add", "--all"], dir);
      ok("git", ["commit", "--quiet", "--no-verify", "--message", "quiz"], dir);
      plantRequest(dir);
    }
    const hooks = runHooks(dir, command === "failing" ? "a stylesheet from another host" : "quiz");
    writeFileSync(second, stringify(hooks, { lineWidth: 0 }));
    for (const run of hooks) process.stdout.write(`${run.hook}: ${run.passed ? "passed" : "failed"}\n`);
  } else {
    process.stderr.write(
      "usage: node test/app-fixture.ts <passing|failing> <dir> <hooks.yaml>\n" +
        "       node test/app-fixture.ts compare <hooks.yaml> <report.yaml> <success|failure>\n",
    );
    process.exitCode = 2;
  }
}
