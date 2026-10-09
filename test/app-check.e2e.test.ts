// The contract of the app check action (actions/app-check), end to end: CI checks what the hooks checked, with the same
// result and the same messages. The action is a thin wrapper around one command; this test runs that command, as the
// action's step names it, on a quiz app from `lernapps create` (test/app-fixture.ts) and compares it with the app's
// hooks, run by git (`git commit`, `git push`):
//   - the action's check step is `lernapps check` without a flag, and the hooks run its two parts;
//   - a passing app passes the hooks and the action's check, whose report (uploaded by the action) has no findings;
//   - a stylesheet from another host fails the pre-push hook and the action's check with the same findings;
//   - a lint error fails the pre-commit hook and the action's check with the same message.
// The workflow app-check.yml runs the real action on the same fixture apps in GitHub Actions.
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { stripVTControlCharacters } from "node:util";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import {
  compare,
  createApp,
  plantLintError,
  plantRequest,
  readReport,
  REPORT,
  runHooks,
  type HookRun,
} from "./app-fixture.ts";
import { ok, repoRoot, run, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;

interface Step {
  id?: string;
  run?: string;
  uses?: string;
  with?: Record<string, string>;
}
const action = parse(readFileSync(join(repoRoot, "actions/app-check/action.yml"), "utf8")) as {
  runs: { steps: Step[] };
};
const steps = action.runs.steps;
const checkStep = steps.find((step) => step.id === "check");

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

describe.skipIf(inner)("the app check action", () => {
  let app = "";

  /** The action's check step, run in the app as the action runs it. */
  const runAction = (): Result => {
    rmSync(join(app, REPORT), { force: true });
    return run("bash", ["-c", checkStep?.run ?? "false"], app);
  };

  beforeAll(() => {
    app = createApp(join(tempDir("app-check"), "naturwunder"));
  }, SLOW);

  test("runs the hooks' command without a flag and uploads the report it writes", () => {
    expect(checkStep?.run).toBe("npx --no -- lernapps check");
    const hooks = (name: string) =>
      readFileSync(join(app, "node_modules/@lernapps/tooling/archetypes/shared/hooks", name), "utf8");
    expect(hooks("pre-commit")).toMatch(/^lernapps check --pre-commit$/m);
    expect(hooks("pre-push")).toMatch(/^lernapps check --pre-push$/m);
    const uploads = steps.filter((step) => step.uses?.startsWith("actions/upload-artifact@"));
    expect(uploads.map((step) => step.with?.["path"])).toContain(`\${{ inputs.working-directory }}/${REPORT}`);
  });

  test(
    "a passing app passes the hooks and the action's check, with a report without findings",
    { timeout: SLOW },
    () => {
      const hooks = runHooks(app, "quiz");
      expect(
        hooks.map((hook) => hook.passed),
        hooks.map((hook) => hook.output).join("\n"),
      ).toEqual([true, true]);
      const result = runAction();
      expect(result.code, output(result)).toBe(0);
      expect(result.stdout).toMatch(/^lernapps check: ok/);
      const report = readReport(join(app, REPORT));
      expect(report.findings).toEqual([]);
      expect(compare(hooks, report, "success")).toEqual([]);
    },
  );

  test(
    "a stylesheet from another host fails the pre-push hook and the action's check with the same findings",
    { timeout: SLOW },
    () => {
      plantRequest(app);
      const hooks: HookRun[] = runHooks(app, "a stylesheet from another host");
      expect(hooks.map((hook) => hook.passed)).toEqual([true, false]);
      const result = runAction();
      expect(result.code, output(result)).toBe(1);
      const report = readReport(join(app, REPORT));
      expect(report.findings.map((finding) => finding.rule)).toContain("no-request-before-click");
      expect(compare(hooks, report, "failure")).toEqual([]);
      // the same message: the report on standard output, finding for finding
      const printed = parse(result.stdout) as { findings: unknown[] };
      expect(printed.findings).toEqual(hooks[1]?.findings);
    },
  );

  test("a lint error fails the pre-commit hook and the action's check with the same message", { timeout: SLOW }, () => {
    plantLintError(app);
    ok("git", ["add", "--all"], app);
    const commit = run("git", ["commit", "--quiet", "--message", "localStorage"], app);
    expect(commit.code, output(commit)).not.toBe(0);
    // the lint message with its code frame, from its first line to the frame's end: plain (`x`, `----`) on a
    // terminal, with colours and box drawing (`×`, `╰────`) where the linter sees CI; the same in hook and action
    const plain = (result: Result) => stripVTControlCharacters(output(result));
    const message = /^ *[x×] lernapps\(storage-through-wrapper\)[^]*?^ *(?:`-+|╰─+)$/m.exec(plain(commit))?.[0];
    expect(message, plain(commit)).toBeDefined();
    const result = runAction();
    expect(result.code, output(result)).toBe(1);
    expect(plain(result)).toContain(message?.trim());
    expect(existsSync(join(app, REPORT))).toBe(true);
    const checks = readReport(join(app, REPORT)).findings.filter((finding) => finding.rule === "checks-pass");
    expect(checks.map((finding) => finding.where)).toContain("vp check");
  });
});
