// The contract of the app check action (actions/app-check) and of the hooks the preset installs, end to end: CI
// checks what the hooks checked, with the same result and the same messages. The action is a thin wrapper around one
// command; these tests run that command, as the action's step names it, on the quiz app from `lernapps create`
// (test/app-fixture.ts, shared by the test files and copied here; it only extends the preset), and compare it with
// the app's hooks, run by git (`git commit`, `git push`). Two files, so that the rounds run in parallel:
//   - app-check.e2e.test.ts: the action's step, and a passing app;
//   - this file: with a lint error and a stylesheet from another host, the commit fails with one line naming the
//     hook's log, which holds the lint message with its fix and rule link; committed without the hook, the push fails
//     on the request and counts the failed push in the plan; the action's one check reports both, with the same lint
//     message and the same findings for the request.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stripVTControlCharacters } from "node:util";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import {
  failedChecks,
  plantLintError,
  plantRequest,
  prePushFailures,
  quizApp,
  readReport,
  REPORT,
  runActionCheck,
  runHooks,
  type HookRun,
} from "./app-fixture.ts";
import { PRE_COMMIT_LOG, run, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const output = (result: Result) => `${result.stdout}\n${result.stderr}`;
const RULES = "https://lernapps.net/tooling/rules/#";

describe.skipIf(inner)(
  "the app check action and the hooks, on an app with two mistakes",
  () => {
    let failing = "";

    beforeAll(() => {
      failing = quizApp();
    }, SLOW);

    test(
      "a lint error stops the commit, a stylesheet from another host the push, and the action's check finds both",
      { timeout: SLOW },
      () => {
        plantLintError(failing);
        plantRequest(failing);
        const hooks: HookRun[] = runHooks(
          failing,
          "localStorage and a stylesheet from another host",
        );
        expect(
          hooks.map((hook) => hook.passed),
          hooks.map((hook) => hook.output).join("\n"),
        ).toEqual([false, false]);

        // the commit: one line naming the log; the log holds the lint message with its fix and rule link
        const [commit, push] = hooks;
        const lines = (commit?.printed ?? "")
          .trim()
          .split("\n")
          .filter((line) => !line.startsWith("VITE+ - "));
        expect(lines, commit?.printed).toHaveLength(1);
        expect(lines[0]).toMatch(
          /^lernapps pre-commit: .+ failed \(exit [1-9]\d*\); the full output is in /,
        );
        expect(
          lines[0]?.endsWith(`the full output is in ${PRE_COMMIT_LOG}`),
        ).toBe(true);
        const log = stripVTControlCharacters(
          readFileSync(join(failing, PRE_COMMIT_LOG), "utf8"),
        );
        expect(log).toContain("src/main.ts");
        expect(log).toContain("createStorage");
        expect(log).toContain(`${RULES}storage-through-wrapper`);

        // the push: the request, named with its host; the remote did not get the branch; the failed push counted
        expect(push?.output).toContain("rule: no-request-before-click");
        expect(push?.output).toContain("fonts.lernapps.invalid");
        expect(
          run(
            "git",
            ["ls-remote", "--heads", "origin", "main"],
            failing,
          ).stdout.trim(),
        ).toBe("");
        expect(push?.findings.map((finding) => finding.rule)).toContain(
          "no-request-before-click",
        );
        expect(prePushFailures(failing)).toBe("1");
        expect(failedChecks(failing)).toMatch(/\bno-request-before-click: 1\b/);

        // the action's one check: both, with the same lint message and the same findings for the request
        const result = runActionCheck(failing);
        expect(result.code, output(result)).toBe(1);
        const plain = stripVTControlCharacters(output(result));
        // the lint message with its code frame, from its first line to the frame's end: plain (`x`, `----`) on a
        // terminal, with colours and box drawing (`×`, `╰────`) where the linter sees CI; the same in hook and action
        const message =
          /^ *[x×] lernapps\(storage-through-wrapper\)[^]*?^ *(?:`-+|╰─+)$/m.exec(
            log,
          )?.[0];
        expect(message, log).toBeDefined();
        expect(plain).toContain(message?.trim());
        const report = readReport(join(failing, REPORT));
        const checks = report.findings.filter(
          (finding) => finding.rule === "checks-pass",
        );
        expect(checks.map((finding) => finding.where)).toContain("vp check");
        const requests = (findings: { rule: string }[]) =>
          findings.filter(
            (finding) => finding.rule === "no-request-before-click",
          );
        expect(requests(report.findings)).toEqual(
          requests(push?.findings ?? []),
        );
        expect(requests(report.findings).length).toBeGreaterThan(0);
        // the same report on standard output, finding for finding
        expect(
          (parse(result.stdout) as { findings: unknown[] }).findings,
        ).toEqual(report.findings);
      },
    );
  },
);
