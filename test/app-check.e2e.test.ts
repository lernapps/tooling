// The contract of the app check action (actions/app-check) and of the hooks the preset installs, end to end: CI
// checks what the hooks checked, with the same result and the same messages. The action is a thin wrapper around one
// command; these tests run that command, as the action's step names it, on the quiz app from `lernapps create`
// (test/app-fixture.ts, shared by the test files and copied here; it only extends the preset), and compare it with
// the app's hooks, run by git (`git commit`, `git push`). Two files, so that the rounds run in parallel:
//   - this file: the action's check step is `lernapps check` without a flag, and the hooks run its two parts; a
//     passing app passes the hooks (the quiet pre-commit hook prints nothing) and the action's check, whose report
//     (uploaded by the action) has no findings; no failed push is counted;
//   - app-check-failing.e2e.test.ts: a lint error and a request to another host.
// The workflow app-check.yml runs the real action on the same fixture apps in GitHub Actions.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import {
  actionSteps,
  checkStep,
  compare,
  prePushFailures,
  quizApp,
  readReport,
  REPORT,
  runActionCheck,
  runHooks,
} from "./app-fixture.ts";
import type { Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

describe.skipIf(inner)("the app check action and the hooks, on a passing app", () => {
  let passing = "";

  beforeAll(() => {
    passing = quizApp();
  }, SLOW);

  test("runs the hooks' command without a flag and uploads the report it writes", () => {
    expect(checkStep?.run).toBe("npx --no -- lernapps check");
    const hooks = (name: string) =>
      readFileSync(join(passing, "node_modules/@lernapps/tooling/archetypes/shared/hooks", name), "utf8");
    expect(hooks("pre-commit")).toMatch(/ lernapps check --pre-commit$/m);
    // an empty commit (the start commits of main and gh-pages) has nothing to check: the hook lets it pass
    expect(hooks("pre-commit")).toContain("git diff --cached --quiet && exit 0");
    expect(hooks("pre-push")).toMatch(/^lernapps check --pre-push$/m);
    const uploads = actionSteps.filter((step) => step.uses?.startsWith("actions/upload-artifact@"));
    expect(uploads.map((step) => step.with?.["path"])).toContain(`\${{ inputs.working-directory }}/${REPORT}`);
  });

  test(
    "a passing app passes the hooks and the action's check, with a report without findings",
    { timeout: SLOW },
    () => {
      const hooks = runHooks(passing, "quiz");
      expect(
        hooks.map((hook) => hook.passed),
        hooks.map((hook) => hook.output).join("\n"),
      ).toEqual([true, true]);
      // quiet: a passing pre-commit hook prints nothing
      expect(hooks[0]?.printed.trim()).toBe("");
      expect(prePushFailures(passing)).toBe("0");
      const result = runActionCheck(passing);
      expect(result.code, output(result)).toBe(0);
      expect(result.stdout).toMatch(/^lernapps check: ok/);
      const report = readReport(join(passing, REPORT));
      expect(report.findings).toEqual([]);
      expect(compare(hooks, report, "success")).toEqual([]);
    },
  );
});
