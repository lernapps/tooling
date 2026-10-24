// The pre-push hook of the platform sites (changes/site-pre-push.ts), in real git repos: a push of only the plan checks
// nothing, a push of only docs builds and checks the site, any other push also runs the site's own fast tests when it
// names them; the steps run without the variables that tie git to the repo being pushed; and node runs the hook from a checkout that holds only
// changes/ and src/, the folders a site fetches.
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { type Step, sitePrePush } from "../changes/site-pre-push.ts";
import { ok, repoRoot, tempDir, testEnv } from "./support.ts";

// The hook runs git in this process: without the variables git sets for a hook, which would point its commands at
// the repo being pushed when the pre-push hook runs these tests (as testEnv does for the commands the tests start).
for (const name of Object.keys(process.env)) if (name.startsWith("GIT_")) delete process.env[name];

const GIT = { timeout: 120_000 };

/** A site repo with one commit, its package.json naming `scripts`; the push of a commit that adds `files`. */
function site(scripts: Record<string, string>, files: string[]): { dir: string; lines: string } {
  const dir = tempDir("site-pre-push");
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "site", private: true, scripts }));
  ok("git", ["add", "--all"], dir);
  ok("git", ["commit", "--quiet", "--message", "base"], dir);
  const base = ok("git", ["rev-parse", "HEAD"], dir).stdout.trim();
  for (const file of files) {
    mkdirSync(join(dir, file, ".."), { recursive: true });
    writeFileSync(join(dir, file), "x\n");
  }
  ok("git", ["add", "--all"], dir);
  ok("git", ["commit", "--quiet", "--message", "change"], dir);
  const head = ok("git", ["rev-parse", "HEAD"], dir).stdout.trim();
  return { dir, lines: `refs/heads/x ${head} refs/heads/x ${base}\n` };
}

/** The hook with steps that only record themselves: its exit code, its output and the steps' names. */
function hook(scripts: Record<string, string>, files: string[]) {
  const { dir, lines } = site(scripts, files);
  let output = "";
  const ran: string[] = [];
  const code = sitePrePush(lines, {
    cwd: dir,
    write: (text) => (output += text),
    run: (steps: readonly Step[]) => {
      ran.push(...steps.map(([name]) => name));
      return undefined;
    },
  });
  return { code, output, ran };
}

const TESTS = { build: "true", check: "true", "test:pre-push": "true" };

test("a push of only the plan checks nothing", GIT, () => {
  const { code, output, ran } = hook(TESTS, [".vibe/plan.md"]);
  expect(code, output).toBe(0);
  expect(ran).toEqual([]);
  expect(output).toMatch(/^lernapps pre-push: nothing to check, the push changes only the plan \(.*\)\n$/);
});

test("a push of only docs builds and checks the site, without its tests", GIT, () => {
  const { code, output, ran } = hook(TESTS, ["docs/guide.md"]);
  expect(code, output).toBe(0);
  expect(ran).toEqual(["npm run build", "npm run check"]);
});

test("any other push also runs the site's own fast tests, when it names them", GIT, () => {
  expect(hook(TESTS, ["src/page.njk"]).ran).toEqual(["npm run build", "npm run check", "npm run test:pre-push"]);
  expect(hook({ build: "true", check: "true" }, ["src/page.njk"]).ran).toEqual(["npm run build", "npm run check"]);
});

test("a failing step stops the push and names the log", GIT, () => {
  const { dir, lines } = site({ build: "true", check: "exit 3" }, ["src/page.njk"]);
  let output = "";
  const code = sitePrePush(lines, { cwd: dir, write: (text) => (output += text) });
  expect(code).toBe(3);
  expect(output).toBe(
    "lernapps pre-push: npm run check failed (exit 3); the full output is in node_modules/.cache/lernapps/pre-push.log\n",
  );
});

test("a push that only deletes checks nothing", () => {
  let output = "";
  const zero = "0".repeat(40);
  const code = sitePrePush(`(delete) ${zero} refs/heads/x ${"1".repeat(40)}\n`, {
    cwd: tempDir("site-pre-push"),
    write: (text) => (output += text),
    run: () => expect.fail("a push that only deletes runs no step"),
  });
  expect(code).toBe(0);
  expect(output).toBe("lernapps pre-push: nothing to check, the push only deletes\n");
});

test(
  "node runs the hook from changes/ and src/ alone, and its steps see neither GIT_DIR nor GIT_WORK_TREE",
  GIT,
  () => {
    // what a site fetches (its scripts/pre-push.mjs): only these two folders, run with node, nothing installed
    const tooling = tempDir("site-pre-push-tooling");
    cpSync(join(repoRoot, "changes"), join(tooling, "changes"), { recursive: true });
    cpSync(join(repoRoot, "src"), join(tooling, "src"), { recursive: true });
    const record = `node -e "require('fs').writeFileSync('env.json', JSON.stringify(Object.keys(process.env).filter((k) => ['GIT_DIR', 'GIT_WORK_TREE'].includes(k))))"`;
    const { dir, lines } = site({ build: record, check: "true" }, ["src/page.njk"]);
    const result = spawnSync(process.execPath, [join(tooling, "changes", "site-pre-push.ts")], {
      cwd: dir,
      input: lines,
      encoding: "utf8",
      // as git starts a hook: GIT_DIR and the like point at the repo being pushed
      env: { ...testEnv, GIT_DIR: join(dir, ".git"), GIT_WORK_TREE: dir },
    });
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
    expect(result.stdout).toMatch(/^lernapps pre-push: scope all: npm run build, npm run check passed/);
    expect(JSON.parse(readFileSync(join(dir, "env.json"), "utf8"))).toEqual([]);
  },
);
