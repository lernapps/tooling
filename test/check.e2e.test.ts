// The contract of `npm run check` and of the git hooks, end to end: a fresh clone, a real `npm ci`, the real
// commands. The same mistake must turn the hook command and the CI command red.
//   - hook commands: `npm run lernapps -- check --pre-commit` (pre-commit), `... --pre-push` (pre-push)
//   - CI command:    `npm run lernapps -- check` (job `check` in .github/workflows/check.yml)
//   - `npm run check`: the CI command; it builds nothing
//   - `npm run build && npm run check:site`: the docs site, built and checked (site actions, job `site`)
//   - installed from git: the CLI, its checks of a built app, and the subpath exports (guidance, skills, the schemas
//     of the validation report and of the review verdict) a consumer relies on
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { frontMatterErrors } from "./plan.ts";
import { freshClone, ok, repoRoot, run, tempDir, type Result } from "./support.ts";

// A check run inside a test copy runs the tests too; it must not start these tests again.
const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;

const hookFast = ["run", "--silent", "lernapps", "--", "check", "--pre-commit"];
const hookHeavy = ["run", "--silent", "lernapps", "--", "check", "--pre-push"];
const ciCheck = ["run", "--silent", "lernapps", "--", "check"];

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

describe.skipIf(inner)("a fresh clone", () => {
  let clone = "";
  let head = "";

  beforeAll(() => {
    clone = freshClone();
    ok("npm", ["ci", "--no-audit", "--no-fund"], clone);
    head = ok("git", ["rev-parse", "HEAD"], clone).stdout.trim();
  }, SLOW);

  afterEach(() => {
    ok("git", ["reset", "--quiet", "--hard", head], clone);
    ok("git", ["clean", "--quiet", "-fd"], clone);
  });

  const plant = (file: string, content: string) => writeFileSync(join(clone, file), content);

  test("npm run check is green", { timeout: SLOW }, () => {
    const result = run("npm", ["run", "check"], clone);
    expect(result.code, output(result)).toBe(0);
  });

  test("npm run check builds nothing", { timeout: SLOW }, () => {
    ok("npm", ["run", "check"], clone);
    expect(run("test", ["-e", "_site"], clone).code).not.toBe(0);
  });

  test("npm run build && npm run check:site is green", { timeout: SLOW }, () => {
    ok("npm", ["run", "build"], clone);
    const result = run("npm", ["run", "check:site"], clone);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toContain("lernapps-check");
    // the published schemas: of the validation report and of the review verdict
    for (const schema of ["validation-report.v1.schema.json", "verdict.v1.schema.json"]) {
      expect(existsSync(join(clone, "_site/schemas", schema)), schema).toBe(true);
    }
  });

  test("npm ci installs the git hooks", () => {
    expect(ok("git", ["config", "core.hooksPath"], clone).stdout.trim()).toBe(".vite-hooks/_");
  });

  describe.each([
    ["a type error", "src/planted.ts", 'export const count: number = "three";\n'],
    ["a lint error (explicit any)", "src/planted.ts", "export const value: any = 1;\n"],
  ])("%s", (_name, file, content) => {
    test("turns the pre-commit hook command and the CI command red", { timeout: SLOW }, () => {
      plant(file, content);
      const fast = run("npm", hookFast, clone);
      expect(fast.code, output(fast)).not.toBe(0);
      expect(output(fast)).toContain("planted.ts");
      const ci = run("npm", ciCheck, clone);
      expect(ci.code, output(ci)).not.toBe(0);
      expect(output(ci)).toContain("planted.ts");
    });

    test("turns npm run check red", { timeout: SLOW }, () => {
      plant(file, content);
      const result = run("npm", ["run", "check"], clone);
      expect(result.code, output(result)).not.toBe(0);
    });

    test("stops git commit", { timeout: SLOW }, () => {
      plant(file, content);
      ok("git", ["add", file], clone);
      const result = run("git", ["commit", "--message", "planted"], clone);
      expect(result.code, output(result)).not.toBe(0);
      expect(output(result)).toContain("planted.ts");
      expect(ok("git", ["rev-parse", "HEAD"], clone).stdout.trim()).toBe(head);
    });
  });

  describe("a failing unit test", () => {
    const failing =
      'import { expect, test } from "vite-plus/test";\n\ntest("planted", () => {\n  expect(1).toBe(2);\n});\n';

    test("passes the fast part, turns the heavy part and the CI command red", { timeout: SLOW }, () => {
      plant("test/planted.test.ts", failing);
      const fast = run("npm", hookFast, clone);
      expect(fast.code, output(fast)).toBe(0);
      const heavy = run("npm", hookHeavy, clone);
      expect(heavy.code, output(heavy)).not.toBe(0);
      expect(output(heavy)).toContain("planted");
      const ci = run("npm", ciCheck, clone);
      expect(ci.code, output(ci)).not.toBe(0);
    });

    test("can be committed, but stops git push", { timeout: SLOW }, () => {
      const remote = tempDir("remote");
      ok("git", ["init", "--quiet", "--bare", remote], clone);
      ok("git", ["remote", "add", "origin", remote], clone);
      plant("test/planted.test.ts", failing);
      ok("git", ["add", "test/planted.test.ts"], clone);
      ok("git", ["commit", "--quiet", "--message", "planted"], clone);
      const result = run("git", ["push", "origin", "main"], clone);
      ok("git", ["remote", "remove", "origin"], clone);
      expect(result.code, output(result)).not.toBe(0);
      expect(output(result)).toContain("planted");
      expect(run("git", ["rev-parse", "--verify", "--quiet", "main"], remote).code).not.toBe(0);
    });
  });
});

describe.skipIf(inner)("installed from git", () => {
  let consumer = "";

  beforeAll(() => {
    const source = freshClone();
    consumer = tempDir("consumer");
    writeFileSync(join(consumer, "package.json"), `${JSON.stringify({ name: "consumer", private: true })}\n`);
    ok("npm", ["install", "--no-audit", "--no-fund", `git+file://${source}`], consumer);
  }, SLOW);

  test("a consumer gets the CLI lernapps", { timeout: SLOW }, () => {
    const result = run("npx", ["--no", "--", "lernapps", "--help"], consumer);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps <command>/);
  });

  test("the installed CLI runs the checks of a built app", { timeout: SLOW }, () => {
    const passing = run(
      "npx",
      ["--no", "--", "lernapps", "check", join(repoRoot, "test/fixtures/apps/passing")],
      consumer,
    );
    expect(passing.code, output(passing)).toBe(0);
    expect(passing.stdout).toMatch(/^lernapps check: ok, 6 rules, no findings/);
    const broken = run(
      "npx",
      ["--no", "--", "lernapps", "check", join(repoRoot, "test/fixtures/apps/broken-link")],
      consumer,
    );
    expect(broken.code, output(broken)).toBe(1);
    expect(broken.stdout).toContain("rule: links-resolve");
  });

  // The generator copies these; the hooks and the review validate the plan's front matter against the schema.
  const resolve = (specifier: string) => {
    const script = `process.stdout.write(fileURLToPath(import.meta.resolve(${JSON.stringify(specifier)})))`;
    const prelude = 'import { fileURLToPath } from "node:url";';
    return ok("node", ["--input-type=module", "--eval", `${prelude}\n${script}`], consumer).stdout;
  };

  test.each([
    "@lernapps/tooling/guidance/AGENTS.md",
    "@lernapps/tooling/guidance/plan-template.md",
    "@lernapps/tooling/guidance/plan-front-matter.v1.schema.json",
    "@lernapps/tooling/skills/lernapps-app/SKILL.md",
    "@lernapps/tooling/check/validation-report.v1.schema.json",
    "@lernapps/tooling/review/verdict.v1.schema.json",
  ])("a consumer resolves %s to a file in the package", (specifier) => {
    const path = resolve(specifier);
    expect(path.startsWith(join(consumer, "node_modules", "@lernapps", "tooling"))).toBe(true);
    expect(existsSync(path), path).toBe(true);
  });

  test("the installed plan template validates against the installed schema", () => {
    const template = resolve("@lernapps/tooling/guidance/plan-template.md");
    const schema = resolve("@lernapps/tooling/guidance/plan-front-matter.v1.schema.json");
    expect(frontMatterErrors(schema, template)).toEqual([]);
  });
});
