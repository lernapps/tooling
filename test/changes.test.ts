// The contract of the change scope (changes/changes.ts, `lernapps changes`): what a change can affect, and so what the
// hooks and CI run for it.
//   - the classifier on sample path lists: only the plan is none, only docs (docs/**/*.md) and the plan is docs,
//     anything else, an unknown path or a mixed list is all; not known or empty is all, except a push of no file, which is none;
//   - the default map per kind of repo and the exceptions a repo declares in package.json, validated;
//   - where the changed files come from, in real git repos: the staged files, the pushed refs (an existing branch, a
//     new branch, unknown commits), a GitHub event (a pull request, a push, a new branch, a shallow clone);
//   - the CLI, its step outputs for GitHub Actions and its exit codes;
//   - the actions app-check, app-publish and app-preview on a fake diff: their classifier step, run as the action runs it, skips
//     every later step for a change of only the plan or only docs, and runs them for any other change;
//   - the reusable workflow changes.yml and the pattern of the tooling's own workflows: every job is gated by it,
//     and one final job always runs and reports the result (actionlint checks the workflows in check.yml).
// The hooks with a commit of only the plan or only docs, in a generated app and in this repo: changes.e2e.test.ts.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import {
  classify,
  classifyPush,
  DEFAULTS,
  eventFiles,
  loadRules,
  matchesAny,
  pushedFiles,
  rangeFiles,
  runs,
  stagedFiles,
  type Rules,
} from "../changes/changes.ts";
import { ok, repoRoot, run, tempDir, testEnv } from "./support.ts";

// The library runs git in this process: without the variables git sets for a hook (GIT_DIR, GIT_INDEX_FILE, ...),
// which would point its commands at the repo being pushed when the pre-push hook runs these tests (as testEnv does
// for the commands the tests start).
for (const name of Object.keys(process.env)) if (name.startsWith("GIT_")) delete process.env[name];

/** Tests that make git repos and run commands: generous on a machine busy with other test files. */
const GIT = { timeout: 120_000 };

const app = DEFAULTS.app;
const scope = (files: string[] | undefined, rules: Rules = app) => classify(files, rules).scope;

describe("the classifier", () => {
  test("only the plan is none", () => {
    expect(scope([".vibe/plan.md"])).toBe("none");
    expect(scope([".vibe/plan.md", ".vibe/notes/run-1.md"])).toBe("none");
    expect(scope([".vibe/plans/01-first-version.md", ".vibe/plans/02-mehr-runden.md"])).toBe("none");
  });

  test("only Markdown below docs/, with or without the plan, is docs", () => {
    expect(scope(["docs/arc42/05-building-blocks.arc42.md"])).toBe("docs");
    expect(scope(["docs/README.md", "docs/a/b/c.md", ".vibe/plan.md"])).toBe("docs");
  });

  test("anything else is all: README, AGENTS.md, other files below docs/, unknown and new paths", () => {
    for (const path of [
      "README.md",
      "AGENTS.md",
      "docs.md",
      "docs/diagram.svg",
      "docs/arc42/config.yaml",
      "src/docs/x.md",
      "site/index.html",
      "a-new-folder/notes.md",
      ".vibe",
      ".vibe-old/plan.md",
      "package.json",
    ]) {
      expect(scope([path]), path).toBe("all");
    }
  });

  test("a mixed list is all as soon as one path is neither plan nor docs, and says which", () => {
    expect(scope(["docs/a.md", "src/main.ts"])).toBe("all");
    expect(scope([".vibe/plan.md", "package.json"])).toBe("all");
    expect(classify([".vibe/plan.md", "docs/a.md", "index.html"], app).reason).toContain("index.html");
  });

  test("changed files that are not known, or none, are all; a push of no file (an empty start commit) is none", () => {
    expect(scope(undefined)).toBe("all");
    expect(scope([])).toBe("all");
    expect(classifyPush([], app).scope).toBe("none");
    expect(classifyPush(undefined, app).scope).toBe("all");
    expect(classifyPush(["src/a.ts"], app).scope).toBe("all");
  });

  test("patterns: ** any folders, * within a folder, a trailing / a folder", () => {
    expect(matchesAny("docs/x.md", ["docs/**/*.md"])).toBe(true);
    expect(matchesAny("docs/a/b/x.md", ["docs/**/*.md"])).toBe(true);
    expect(matchesAny("docs/x.mdx", ["docs/**/*.md"])).toBe(false);
    expect(matchesAny("src/a/b.ts", ["src/"])).toBe(true);
    expect(matchesAny("src", ["src/"])).toBe(false);
    expect(matchesAny("srcx/a.ts", ["src/"])).toBe(false);
    expect(matchesAny("notes/a.md", ["notes/*.md"])).toBe(true);
    expect(matchesAny("notes/a/b.md", ["notes/*.md"])).toBe(false);
    expect(matchesAny("a.b", ["a?b"])).toBe(true);
    expect(matchesAny("axb", ["a.b"])).toBe(false);
  });

  test("the kind decides what docs runs: nothing in an app, the site in the tooling and in a site", () => {
    expect(runs("docs", "app")).toEqual({ code: false, site: false });
    expect(runs("docs", "tooling")).toEqual({ code: false, site: true });
    expect(runs("docs", "site")).toEqual({ code: false, site: true });
    for (const kind of ["app", "tooling", "site"] as const) {
      expect(runs("none", kind)).toEqual({ code: false, site: false });
      expect(runs("all", kind)).toEqual({ code: true, site: true });
    }
  });
});

/** A folder with the given files. */
function folder(files: Record<string, string>): string {
  const dir = tempDir("changes");
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  return dir;
}
const manifest = (value: object) => `${JSON.stringify(value)}\n`;

describe("the default map per kind and the exceptions in package.json", GIT, () => {
  test("the kind is detected: the tooling, an app (index.html), else a site", () => {
    expect(loadRules(repoRoot).kind).toBe("tooling");
    expect(loadRules(folder({ "package.json": manifest({ name: "quiz" }), "index.html": "" })).kind).toBe("app");
    expect(loadRules(folder({ "package.json": manifest({ name: "lernapps-docs" }) })).kind).toBe("site");
    expect(loadRules(folder({})).kind).toBe("site");
  });

  test("a repo names its kind and adds patterns to none and docs; all overrides both", () => {
    const rules = loadRules(
      folder({
        "package.json": manifest({
          name: "catalog",
          lernapps: {
            changes: {
              kind: "app",
              none: ["notes/**"],
              docs: ["handbook/**/*.md"],
              all: ["docs/generated/**", ".vibe/build.md"],
            },
          },
        }),
      }),
    );
    expect(rules.kind).toBe("app");
    expect(scope(["notes/a.txt"], rules)).toBe("none");
    expect(scope(["handbook/a.md", "notes/b"], rules)).toBe("docs");
    expect(scope(["docs/a.md"], rules)).toBe("docs"); // the defaults stay
    expect(scope(["docs/generated/api.md"], rules)).toBe("all");
    expect(scope([".vibe/build.md"], rules)).toBe("all");
    expect(classify(["docs/generated/api.md"], rules).reason).toContain("lernapps.changes.all");
  });

  test("a malformed configuration is an error that says what to fix", () => {
    const cases: [unknown, string][] = [
      ["yes", "lernapps: an object"],
      [{ changes: [] }, "lernapps.changes: an object"],
      [{ changes: { skip: ["x/**"] } }, "unknown key skip"],
      [{ changes: { kind: "library" } }, "kind: one of app, tooling, site"],
      [{ changes: { none: "notes/**" } }, "none: a list of path patterns"],
      [{ changes: { docs: [""] } }, "non-empty string"],
      [{ changes: { all: ["../other/**"] } }, 'all: "../other/**" must be relative'],
      [{ changes: { none: ["!src/**"] } }, "not negated"],
      [{ changes: { none: ["/abs/**"] } }, "relative to the repo root"],
    ];
    for (const [lernapps, message] of cases) {
      const dir = folder({ "package.json": manifest({ name: "x", lernapps }) });
      expect(() => loadRules(dir), message).toThrow(message);
    }
  });
});

const git = (dir: string, ...args: string[]) => ok("git", args, dir).stdout.trim();

/** A repo with one commit of an app (index.html) and a bare remote `origin` that has its main. */
function repo(): { dir: string; remote: string } {
  const dir = folder({ "index.html": "<!doctype html>\n", "src/main.ts": "", ".vibe/plan.md": "# Plan\n" });
  const remote = tempDir("remote");
  git(remote, "init", "--quiet", "--bare", "--initial-branch=main");
  git(dir, "init", "--quiet", "--initial-branch=main");
  git(dir, "remote", "add", "origin", remote);
  git(dir, "add", "--all");
  git(dir, "commit", "--quiet", "--no-verify", "--message", "app");
  git(dir, "push", "--quiet", "--no-verify", "origin", "main");
  return { dir, remote };
}

/** Changes the files and commits them; returns the commit. */
function commit(dir: string, files: Record<string, string>): string {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  git(dir, "add", "--all");
  git(dir, "commit", "--quiet", "--no-verify", "--message", "change");
  return git(dir, "rev-parse", "HEAD");
}

const ZEROS = "0".repeat(40);

describe("where the changed files come from", GIT, () => {
  test("the staged files; a move counts both paths", () => {
    const { dir } = repo();
    writeFileSync(join(dir, ".vibe/plan.md"), "# Plan\n\nmore\n");
    git(dir, "add", "--all");
    expect(stagedFiles(dir)).toEqual([".vibe/plan.md"]);
    git(dir, "commit", "--quiet", "--no-verify", "--message", "plan");
    commit(dir, { "src/guide.md": "# Guide\n" });
    mkdirSync(join(dir, "docs"));
    git(dir, "mv", "src/guide.md", "docs/guide.md");
    expect(stagedFiles(dir)?.sort()).toEqual(["docs/guide.md", "src/guide.md"]);
    expect(scope(stagedFiles(dir))).toBe("all");
    expect(stagedFiles(tempDir("not-a-repo"))).toBeUndefined();
  });

  test("the pushed refs: against the remote's commit; a new branch against its merge base with origin/main", () => {
    const { dir } = repo();
    const main = git(dir, "rev-parse", "HEAD");
    const plan = commit(dir, { ".vibe/plan.md": "# Plan\n\ndone\n" });
    expect(pushedFiles(`refs/heads/main ${plan} refs/heads/main ${main}\n`, dir)).toEqual([".vibe/plan.md"]);
    git(dir, "fetch", "--quiet", "origin");
    git(dir, "switch", "--quiet", "-c", "work");
    const docs = commit(dir, { "docs/notes.md": "# Notes\n" });
    // a new branch: what it adds to main, the plan commit included
    expect(pushedFiles(`refs/heads/work ${docs} refs/heads/work ${ZEROS}\n`, dir)?.sort()).toEqual([
      ".vibe/plan.md",
      "docs/notes.md",
    ]);
    // a deleted branch adds nothing; together with another ref, that ref counts
    expect(
      pushedFiles(`(delete) ${ZEROS} refs/heads/old ${main}\nrefs/heads/main ${plan} refs/heads/main ${main}\n`, dir),
    ).toEqual([".vibe/plan.md"]);
  });

  test("the pushed refs are not known without lines, or with a commit the clone does not have: all", () => {
    const { dir } = repo();
    const head = git(dir, "rev-parse", "HEAD");
    expect(pushedFiles("", dir)).toBeUndefined();
    expect(pushedFiles(`refs/heads/main ${head} refs/heads/main ${"1".repeat(40)}\n`, dir)).toBeUndefined();
  });

  test("a new branch without origin/main adds what it holds: all files, or none for an empty start commit", () => {
    const dir = folder({ "a.md": "" });
    git(dir, "init", "--quiet", "--initial-branch=work");
    git(dir, "commit", "--quiet", "--no-verify", "--allow-empty", "--message", "start");
    const start = git(dir, "rev-parse", "HEAD");
    expect(pushedFiles(`refs/heads/work ${start} refs/heads/work ${ZEROS}\n`, dir)).toEqual([]);
    expect(classifyPush(pushedFiles(`refs/heads/work ${start} refs/heads/work ${ZEROS}\n`, dir), app).scope).toBe(
      "none",
    );
    git(dir, "add", "--all");
    git(dir, "commit", "--quiet", "--no-verify", "--message", "a");
    const head = git(dir, "rev-parse", "HEAD");
    expect(pushedFiles(`refs/heads/work ${head} refs/heads/work ${ZEROS}\n`, dir)).toEqual(["a.md"]);
  });

  test("a GitHub event: a pull request against its merge base, a push before..after; other events all", () => {
    const { dir } = repo();
    const main = git(dir, "rev-parse", "HEAD");
    git(dir, "switch", "--quiet", "-c", "work");
    const head = commit(dir, { "docs/a.md": "# A\n" });
    git(dir, "switch", "--quiet", "main");
    const moved = commit(dir, { "src/main.ts": "export {};\n" }); // main moved on: not part of the pull request
    const event = (name: string, payload: object) => {
      const file = join(tempDir("event"), "event.json");
      writeFileSync(file, JSON.stringify(payload));
      return eventFiles({ GITHUB_EVENT_NAME: name, GITHUB_EVENT_PATH: file }, dir);
    };
    expect(event("pull_request", { pull_request: { base: { sha: moved }, head: { sha: head } } })).toEqual([
      "docs/a.md",
    ]);
    expect(event("push", { before: main, after: moved })).toEqual(["src/main.ts"]);
    expect(event("push", { before: ZEROS, after: moved })).toBeUndefined(); // a new branch
    expect(event("workflow_dispatch", {})).toBeUndefined();
    expect(event("push", { before: "1".repeat(40), after: moved })).toBeUndefined(); // an unknown commit
    expect(eventFiles({}, dir)).toBeUndefined();
  });

  test("a shallow clone, as actions/checkout makes it, is deepened once for the commit before a push", () => {
    const { dir, remote } = repo();
    const before = commit(dir, { "src/main.ts": "export {};\n" });
    const after = commit(dir, { ".vibe/plan.md": "# Plan\n\nshallow\n" });
    git(dir, "push", "--quiet", "--no-verify", "origin", "main");
    const clone = join(tempDir("shallow"), "clone");
    ok("git", ["clone", "--quiet", "--depth", "1", `file://${remote}`, clone], repoRoot);
    expect(git(clone, "rev-parse", "--is-shallow-repository")).toBe("true");
    expect(rangeFiles(before, after, false, clone)).toEqual([".vibe/plan.md"]);
    expect(git(clone, "rev-parse", "--is-shallow-repository")).toBe("false");
  });
});

const main = join(repoRoot, "changes/main.ts");

describe("lernapps changes", GIT, () => {
  test("prints the scope, and why on standard error", () => {
    const result = run("node", [main, ".vibe/plan.md", "docs/a.md"], repoRoot);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe("docs\n");
    expect(result.stderr).toContain("docs in a repo of kind tooling");
    const cli = run("node", [join(repoRoot, "src/cli.ts"), "changes", "README.md"], repoRoot);
    expect(cli.stdout).toBe("all\n");
    expect(cli.stderr).toContain("README.md is neither plan nor docs");
  });

  test("without a source the changed files are not known: all", () => {
    expect(run("node", [main], repoRoot).stdout).toBe("all\n");
  });

  test("--ci writes the step outputs and a notice when something is skipped", () => {
    const { dir } = repo();
    const before = git(dir, "rev-parse", "HEAD");
    const after = commit(dir, { ".vibe/plan.md": "# Plan\n\nci\n" });
    const work = tempDir("ci");
    writeFileSync(join(work, "event.json"), JSON.stringify({ before, after }));
    writeFileSync(join(work, "output"), "");
    const result = ok(
      "env",
      [
        `GITHUB_EVENT_NAME=push`,
        `GITHUB_EVENT_PATH=${join(work, "event.json")}`,
        `GITHUB_OUTPUT=${join(work, "output")}`,
        "node",
        main,
        "--ci",
      ],
      dir,
    );
    expect(result.stdout).toMatch(/^none\n::notice title=lernapps changes::change scope none: nothing to build/);
    expect(readFileSync(join(work, "output"), "utf8")).toBe("scope=none\nkind=app\ncode=false\nsite=false\n");
  });

  test("a malformed configuration exits 1 with what to fix; two sources are a usage error", () => {
    const dir = folder({ "package.json": manifest({ lernapps: { changes: { kind: "x" } } }) });
    const bad = run("node", [main, "a.md"], dir);
    expect(bad.code).toBe(1);
    expect(bad.stderr).toContain("lernapps.changes.kind: one of app, tooling, site");
    const two = run("node", [main, "--staged", "a.md"], repoRoot);
    expect(two.code).toBe(2);
    expect(two.stderr).toContain("one source");
    expect(run("node", [main, "--head", "HEAD"], repoRoot).code).toBe(2);
  });
});

describe("lernapps check in a hook asks the change scope first", GIT, () => {
  const cli = join(repoRoot, "src/cli.ts");
  const check = (dir: string, part: string, input = "") =>
    spawnSync("node", [cli, "check", part], { cwd: dir, env: testEnv, input, encoding: "utf8" });

  test("an app: a commit of only the plan, a push of only docs: one line, exit 0, no report", () => {
    const { dir } = repo();
    mkdirSync(join(dir, "node_modules/.cache/lernapps"), { recursive: true });
    writeFileSync(join(dir, "node_modules/.cache/lernapps/validation-report.yaml"), "an earlier run\n");
    writeFileSync(join(dir, ".vibe/plan.md"), "# Plan\n\nstaged\n");
    git(dir, "add", ".vibe/plan.md");
    const commitResult = check(dir, "--pre-commit");
    expect(commitResult.status, commitResult.stderr).toBe(0);
    expect(commitResult.stdout).toMatch(/^lernapps check --pre-commit: nothing to check, the change is the plan only/);
    expect(existsSync(join(dir, "node_modules/.cache/lernapps/validation-report.yaml"))).toBe(false);
    git(dir, "commit", "--quiet", "--no-verify", "--message", "plan");
    const before = git(dir, "rev-parse", "HEAD");
    const after = commit(dir, { "docs/teachers.md": "# For teachers\n" });
    const push = check(dir, "--pre-push", `refs/heads/main ${after} refs/heads/main ${before}\n`);
    expect(push.status, push.stderr).toBe(0);
    expect(push.stdout.trim().split("\n")).toEqual([
      expect.stringMatching(/^lernapps check --pre-push: nothing to check, the change is docs, which an app/),
    ]);
  });

  test("a site: a push of only docs builds and checks the site (npm run build, npm run check), nothing else", () => {
    const { dir } = repo();
    // an app by its index.html, but the configuration names the kind
    const scripts = { build: "echo built > built.txt", check: "echo checked > checked.txt" };
    writeFileSync(
      join(dir, "package.json"),
      manifest({ name: "site", scripts, lernapps: { changes: { kind: "site" } } }),
    );
    git(dir, "add", "--all");
    git(dir, "commit", "--quiet", "--no-verify", "--message", "site");
    const before = git(dir, "rev-parse", "HEAD");
    const after = commit(dir, { "docs/a.md": "# A\n" });
    const push = check(dir, "--pre-push", `refs/heads/main ${after} refs/heads/main ${before}\n`);
    expect(push.status, `${push.stdout}${push.stderr}`).toBe(0);
    expect(push.stdout).toMatch(/^lernapps check: ok, 1 rule, no findings/);
    expect(readFileSync(join(dir, "built.txt"), "utf8")).toBe("built\n");
    expect(readFileSync(join(dir, "checked.txt"), "utf8")).toBe("checked\n");
  });
});

interface Step {
  id?: string;
  if?: string;
  run?: string;
  uses?: string;
}
const steps = (action: string) =>
  (parse(readFileSync(join(repoRoot, "actions", action, "action.yml"), "utf8")) as { runs: { steps: Step[] } }).runs
    .steps;
const GATE = "steps.changes.outputs.code == 'true'";

describe.each(["app-check", "app-publish", "app-preview"])("the action %s on a fake diff", GIT, (action) => {
  const all = steps(action);
  const index = all.findIndex((step) => step.id === "changes");

  test("asks the classifier of its own checkout before anything is installed, and gates every later step", () => {
    expect(index).toBeGreaterThan(0);
    expect(all[index]?.run).toBe('node "$GITHUB_ACTION_PATH/../../changes/main.ts" --ci');
    for (const step of all.slice(0, index)) expect(step.run, JSON.stringify(step)).toBeUndefined();
    for (const step of all.slice(index + 1)) expect(step.if ?? "", JSON.stringify(step)).toContain(GATE);
  });

  /** The action's classifier step, run as the action runs it, on a push of `files`: its outputs. */
  function classifierStep(files: Record<string, string>): Record<string, string> {
    const { dir } = repo();
    const before = git(dir, "rev-parse", "HEAD");
    const after = commit(dir, files);
    const work = tempDir("action");
    writeFileSync(join(work, "event.json"), JSON.stringify({ before, after }));
    writeFileSync(join(work, "output"), "");
    const result = ok(
      "env",
      [
        `GITHUB_ACTION_PATH=${join(repoRoot, "actions", action)}`,
        "GITHUB_EVENT_NAME=push",
        `GITHUB_EVENT_PATH=${join(work, "event.json")}`,
        `GITHUB_OUTPUT=${join(work, "output")}`,
        "PATH=" + (testEnv["PATH"] ?? ""),
        "bash",
        "-c",
        all[index]?.run ?? "false",
      ],
      dir,
    );
    expect(result.code).toBe(0);
    return Object.fromEntries(
      readFileSync(join(work, "output"), "utf8")
        .trim()
        .split("\n")
        .map((line) => line.split("=") as [string, string]),
    );
  }

  test("a push of only the plan, or only docs, skips every later step", () => {
    expect(classifierStep({ ".vibe/plan.md": "# Plan\n\nnext\n" })).toMatchObject({ scope: "none", code: "false" });
    expect(classifierStep({ "docs/how.md": "# How\n" })).toMatchObject({ scope: "docs", code: "false" });
  });

  test("a push of code, or of the plan with code, runs them", () => {
    expect(classifierStep({ "src/main.ts": "export {};\n" })).toMatchObject({ scope: "all", code: "true" });
    expect(classifierStep({ ".vibe/plan.md": "# Plan\n\nx\n", "README.md": "# App\n" })).toMatchObject({
      scope: "all",
      code: "true",
    });
  });
});

interface Job {
  uses?: string;
  needs?: string | string[];
  if?: string;
  steps?: { run?: string; env?: Record<string, string> }[];
  outputs?: Record<string, string>;
}
interface Workflow {
  on: Record<string, unknown>;
  jobs: Record<string, Job>;
}
const byName = (a: string | undefined, b: string | undefined) => (a ?? "").localeCompare(b ?? "");
const workflow = (file: string) => parse(readFileSync(join(repoRoot, ".github/workflows", file), "utf8")) as Workflow;

describe("the reusable workflow changes.yml and the tooling's own workflows", () => {
  test("changes.yml is called with workflow_call and outputs scope, kind, code and site from the classifier", () => {
    const changes = workflow("changes.yml");
    const call = changes.on["workflow_call"] as { outputs: Record<string, { value: string }> };
    for (const name of ["scope", "kind", "code", "site"]) {
      expect(call.outputs[name]?.value).toBe(`\${{ jobs.changes.outputs.${name} }}`);
      expect(changes.jobs["changes"]?.outputs?.[name]).toBe(`\${{ steps.changes.outputs.${name} }}`);
    }
    const steps = changes.jobs["changes"]?.steps ?? [];
    expect(steps.some((step) => step.run?.includes('node "$tooling/changes/main.ts" --ci'))).toBe(true);
  });

  // release.yml runs after a merge to main and releases whatever the commits say: no change scope gates it
  const consumers = readdirSync(join(repoRoot, ".github/workflows")).filter(
    (file) => file !== "changes.yml" && file !== "release.yml",
  );
  test("release.yml releases after a merge to main with semantic-release, the app token and no npm token", () => {
    const { on } = workflow("release.yml");
    expect(on).toEqual({ push: { branches: ["main"] }, workflow_dispatch: null });
    const text = readFileSync(join(repoRoot, ".github/workflows/release.yml"), "utf8");
    expect(text).toContain("id-token: write"); // npm trusts the workflow: provenance without a token
    expect(text).toContain("npx --yes semantic-release@");
    expect(text).toContain("VERSION_BUMPER_APPID");
    expect(text).not.toMatch(/NODE_AUTH_TOKEN|NPM_TOKEN/);
    expect(JSON.parse(readFileSync(join(repoRoot, ".releaserc.json"), "utf8"))).toMatchObject({ branches: ["main"] });
  });

  test.each(consumers)(
    "%s: no paths filter; every job is gated by the change scope; one final job always runs and needs every job",
    (file) => {
      const { on, jobs } = workflow(file);
      expect(JSON.stringify(on)).not.toMatch(/paths/);
      expect(jobs["changes"]?.uses).toBe("./.github/workflows/changes.yml");
      const names = Object.keys(jobs).filter((name) => name !== "changes");
      const final = names.filter((name) => jobs[name]?.if === "always()");
      expect(final, "one final job").toHaveLength(1);
      const last = jobs[final[0] ?? ""];
      expect([last?.needs].flat().sort(byName)).toEqual(
        Object.keys(jobs)
          .filter((name) => name !== final[0])
          .sort(byName),
      );
      expect(last?.steps?.[0]?.env?.["RESULTS"]).toBe("${{ join(needs.*.result, ' ') }}");
      expect(last?.steps?.[0]?.run).toContain('*" failure "* | *" cancelled "*) exit 1');
      for (const name of names.filter((name) => name !== final[0])) {
        expect([jobs[name]?.needs].flat(), name).toContain("changes");
        expect(jobs[name]?.if, name).toMatch(/needs\.changes\.outputs\.(code|site) == 'true'/);
      }
    },
  );

  test("in the tooling, docs run only the site's jobs: the docs site and its preview", () => {
    const gate = (file: string, job: string) => workflow(file).jobs[job]?.if ?? "";
    for (const [file, job] of [
      ["pages.yml", "build"],
      ["pages.yml", "deploy"],
      ["pr-preview.yml", "build"],
    ] as const) {
      expect(gate(file, job), `${file} ${job}`).toContain("needs.changes.outputs.site == 'true'");
    }
    for (const [file, job] of [
      ["check.yml", "toolchain"],
      ["check.yml", "actionlint"],
      ["app-check.yml", "fixture"],
      ["app-publish.yml", "before"],
    ] as const) {
      expect(gate(file, job), `${file} ${job}`).toBe("needs.changes.outputs.code == 'true'");
    }
  });
});
