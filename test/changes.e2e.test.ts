// The contract of the change scope in the git hooks, end to end, run by git (`git commit`, `git push`):
//   - in a generated app (the quiz app of test/app-fixture.ts): a commit and a push of only the plan, then of only
//     docs, check nothing: each hook prints one line, builds nothing and writes no report;
//   - in this repo (a fresh clone, installed): a commit and a push of only the plan check nothing, with one line; a
//     push of only docs builds and checks the docs site, and runs no test.
// The classifier itself, where the changed files come from and the actions on a fake diff: changes.test.ts.
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { quizApp, REPORT } from "./app-fixture.ts";
import { appTemplates, installedClone, ok, PRE_COMMIT_LOG, run, runAsync, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

/** Commits everything without the hooks and pushes it to a new bare remote `origin` as main. */
function published(dir: string): void {
  const remote = tempDir("remote");
  ok("git", ["init", "--quiet", "--bare", "--initial-branch=main"], remote);
  if (run("git", ["remote", "get-url", "origin"], dir).code === 0) ok("git", ["remote", "remove", "origin"], dir);
  ok("git", ["remote", "add", "origin", remote], dir);
  ok("git", ["add", "--all"], dir);
  if (run("git", ["diff", "--cached", "--quiet"], dir).code !== 0) {
    ok("git", ["commit", "--quiet", "--no-verify", "--message", "app"], dir);
  }
  ok("git", ["push", "--quiet", "--no-verify", "origin", "HEAD:main"], dir);
}

/** Commits the change with the pre-commit hook: git's result, and what the quiet hook wrote to its log. */
function commit(dir: string, file: string, text: string): { result: Result; log: string } {
  appendFileSync(join(dir, file), text);
  ok("git", ["add", "--all"], dir);
  const result = run("git", ["commit", "--quiet", "--message", `change ${file}`], dir);
  const log = join(dir, PRE_COMMIT_LOG);
  return { result, log: existsSync(log) ? readFileSync(log, "utf8") : "" };
}

describe.skipIf(inner)("the hooks of a generated app, with a commit of only the plan or only docs", () => {
  test("check nothing: one line each, no build, no report", { timeout: SLOW }, () => {
    const dir = quizApp();
    published(dir);
    rmSync(join(dir, "dist"), { recursive: true, force: true });
    rmSync(join(dir, REPORT), { force: true });

    const plan = commit(dir, ".vibe/plan.md", "\nA note of the plan.\n");
    expect(plan.result.code, `${output(plan.result)}\n${plan.log}`).toBe(0);
    expect(plan.log).toContain("lernapps check --pre-commit: nothing to check, the change is the plan only (none:");
    const planPush = run("git", ["push", "--quiet", "origin", "HEAD:main"], dir);
    expect(planPush.code, output(planPush)).toBe(0);
    expect(output(planPush)).toContain("lernapps check --pre-push: nothing to check, the change is the plan only");

    mkdirSync(join(dir, "docs"), { recursive: true });
    const docs = commit(dir, "docs/teachers.md", "# For teachers\n");
    expect(docs.result.code, `${output(docs.result)}\n${docs.log}`).toBe(0);
    expect(docs.log).toContain("the change is docs, which an app does not bundle (docs:");
    const docsPush = run("git", ["push", "--quiet", "origin", "HEAD:main"], dir);
    expect(docsPush.code, output(docsPush)).toBe(0);
    expect(output(docsPush)).toContain(
      "lernapps check --pre-push: nothing to check, the change is docs, which an app does not bundle",
    );

    expect(existsSync(join(dir, "dist")), "nothing built").toBe(false);
    expect(existsSync(join(dir, REPORT)), "no report").toBe(false);
  });
});

describe.skipIf(inner)("the hooks of this repo, with a commit of only the plan or only docs", () => {
  test(
    "the plan checks nothing, with one line; docs build and check the docs site and run no test",
    { timeout: SLOW },
    async () => {
      const clone = installedClone();
      published(clone);

      const plan = commit(clone, ".vibe/development-plan-agentic-app-creation.md", "\nA note of the plan.\n");
      expect(plan.result.code, `${output(plan.result)}\n${plan.log}`).toBe(0);
      expect(plan.log).toContain("lernapps check --pre-commit: nothing to check, the change is the plan only");
      const planPush = run("git", ["push", "--quiet", "origin", "HEAD:main"], clone);
      expect(planPush.code, output(planPush)).toBe(0);
      expect(output(planPush).trim()).toMatch(/^lernapps pre-push: nothing to check, the push changes only the plan/);

      const docs = commit(clone, "docs/arc42/01-introduction-and-goals.arc42.md", "\nA sentence for the test.\n");
      expect(docs.result.code, `${output(docs.result)}\n${docs.log}`).toBe(0);
      expect(docs.log).toContain("nothing to check, the change is docs (docs:");
      // the docs site's build reads the schema of a quiz from the pinned app-templates: the local clone of the tests
      const docsPush = await runAsync("git", ["push", "--quiet", "origin", "HEAD:main"], clone, {
        LERNAPPS_TEMPLATES: appTemplates(),
      });
      expect(docsPush.code, output(docsPush)).toBe(0);
      expect(output(docsPush)).toContain("lernapps pre-push: the docs site only, the push changes only docs");
      expect(existsSync(join(clone, "_site/architecture/index.html")), "the site was built").toBe(true);
      const log = readFileSync(join(clone, "node_modules/.cache/lernapps/pre-push.log"), "utf8");
      expect(log).toContain("$ npm run --silent check:site");
      expect(log).not.toContain("lernapps -- check");
    },
  );
});
