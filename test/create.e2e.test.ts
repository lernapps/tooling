// The contract of the generator and the quiz archetype, end to end: `lernapps create --archetype quiz` in a
// temporary folder, then a question bank, gives an app that passes `lernapps check` without further code.
//   - the generator fails on an unknown archetype and on a folder that is not empty;
//   - it runs as an assistant starts it, with npx from git and nothing installed (`npx --yes github:lernapps/tooling#main
//     create ...`, here from a local clone at its commit): npm prepares the package from git, the app depends on that
//     commit and its workflows use the actions of that commit, `npm install` installs the hooks;
//   - it writes the template of app-templates at the pinned commit, with the runtime of that commit as dependency,
//     AGENTS.md, the plan, the workflows, LICENSE, the issue form for content errors; it keeps a plan already there;
//   - the app with the fixture bank (test/fixtures/quiz/quiz.json, every type of question) passes `lernapps check`,
//     which runs the quiz's generic end-to-end tests (quizTests of @lernapps/app-templates) on that bank in a browser.
// The quiz runtime itself (the browser behaviour, the page without JavaScript, the messages for a broken bank) is
// tested in lernapps/app-templates, where it lives: its unit tests and quizTests.
// The templates and the runtime come from a local clone of lernapps/app-templates with the pinned commit: the one named
// by LERNAPPS_TEMPLATES, else one fetched once into a cache (support.ts, appTemplates), so the hooks run these tests as
// CI does. The packages are installed from git.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { frontMatter, frontMatterErrors } from "./plan.ts";
import { appTemplates, freshClone, ok, repoRoot, run, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const cli = join(repoRoot, "src/cli.ts");
const BANK = join(repoRoot, "test/fixtures/quiz/quiz.json");

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;
const lernapps = (args: readonly string[], cwd: string) => run("node", [cli, ...args], cwd);

describe.skipIf(inner)("lernapps create refuses", () => {
  test("an unknown archetype, naming the known ones", () => {
    const dir = tempDir("create-unknown");
    const result = lernapps(["create", "--archetype", "essay", dir], repoRoot);
    expect(result.code, output(result)).toBe(2);
    expect(result.stderr).toContain("unknown archetype: essay (known: quiz)");
  });

  test("a folder that is not empty, naming what is there", () => {
    const dir = tempDir("create-full");
    writeFileSync(join(dir, "README.md"), "# Mein Quiz\n");
    const result = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("is not empty (README.md)");
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  test("an app-templates it cannot fetch, saying how to name a local clone", () => {
    const dir = tempDir("create-offline");
    const result = lernapps(["create", "--archetype", "quiz", dir, "--templates", join(dir, "nowhere")], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("cannot fetch app-templates");
    expect(result.stderr).toContain("LERNAPPS_TEMPLATES");
  });
});

describe.skipIf(inner)("a quiz app from lernapps create, run with npx from git", () => {
  let templates = "";
  let app = "";
  let tooling = "";
  /** npx keeps the package it installed in the npm cache (_npx/<hash>/); the test removes what it added there. */
  const npxCache = join(ok("npm", ["config", "get", "cache"], repoRoot).stdout.trim(), "_npx");
  const npxBefore = existsSync(npxCache) ? new Set(readdirSync(npxCache)) : new Set<string>();

  beforeAll(async () => {
    templates = appTemplates();
    const clone = freshClone();
    tooling = `git+file://${clone}#${ok("git", ["rev-parse", "HEAD"], clone).stdout.trim()}`;
    const parent = tempDir("quiz");
    app = join(parent, "naturwunder");
    // as the plan template says, in a folder where nothing is installed
    const created = run(
      "npx",
      ["--yes", tooling, "create", "--archetype", "quiz", app, "--templates", templates],
      parent,
    );
    if (created.code !== 0) throw new Error(output(created));
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    ok("npm", ["install", "--no-audit", "--no-fund"], app);
    cpSync(BANK, join(app, "src/quiz.json"));
    ok(join(app, "node_modules/.bin/vp"), ["fmt"], app); // as the pre-commit hook formats it
  }, SLOW);

  afterAll(async () => {
    for (const dir of existsSync(npxCache) ? readdirSync(npxCache) : []) {
      if (!npxBefore.has(dir)) rmSync(join(npxCache, dir), { recursive: true, force: true });
    }
  }, 120_000);

  test("npm install installs the hooks of the package", () => {
    expect(ok("git", ["config", "core.hooksPath"], app).stdout.trim()).toBe(
      "node_modules/@lernapps/tooling/archetypes/shared/hooks/_",
    );
  });

  test("it writes the template and the files every app has", () => {
    for (const file of [
      "index.html",
      "src/main.ts",
      "vite.config.ts",
      "tsconfig.json",
      "playwright.config.ts",
      "e2e/quiz.e2e.ts",
      "AGENTS.md",
      "LICENSE",
      "renovate.json",
      ".github/workflows/pages.yml",
      ".github/ISSUE_TEMPLATE/inhaltsfehler.yml",
    ]) {
      expect(existsSync(join(app, file)), file).toBe(true);
    }
    const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as {
      name: string;
      devDependencies: Record<string, string>;
    };
    expect(manifest.name).toBe("naturwunder");
    // the commit npx installed the generator from
    expect(manifest.devDependencies["@lernapps/tooling"]).toBe(tooling);
    // the runtime of the commit the template was copied from, installed from the same clone
    const pin = (
      JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { appTemplates: { commit: string } }
    ).appTemplates.commit;
    expect(manifest.devDependencies["@lernapps/app-templates"]).toBe(`git+file://${resolve(templates)}#${pin}`);
    expect(existsSync(join(app, ".npmrc"))).toBe(false);
    expect(readFileSync(join(app, "AGENTS.md"), "utf8")).toBe(
      readFileSync(join(repoRoot, "guidance/AGENTS.md"), "utf8"),
    );
    const config = readFileSync(join(app, "vite.config.ts"), "utf8");
    expect(config).toContain('from "@lernapps/tooling/preset"');
    expect(config).toContain('from "@lernapps/app-templates/quiz/plugin"');
    expect(config).toContain("lernapps({ plugins: [quiz()] })");
    expect(readFileSync(join(app, "LICENSE"), "utf8")).toContain(`Copyright (c) ${new Date().getFullYear()}`);
    const pages = readFileSync(join(app, ".github/workflows/pages.yml"), "utf8");
    // the app check action (the same check as the hooks), then the app publish action with the bundle it checked
    // the actions of the commit the app depends on
    const commit = tooling.slice(tooling.indexOf("#") + 1);
    const [check, deploy] = [
      `uses: lernapps/tooling/actions/app-check@${commit} # main`,
      `uses: lernapps/tooling/actions/app-publish@${commit} # main`,
    ].map((step) => pages.indexOf(step));
    expect(check, pages).toBeGreaterThan(-1);
    expect(deploy, pages).toBeGreaterThan(check ?? Infinity);
    expect(pages).toContain("pages: write"); // the app publish action reads the Pages settings
    expect(pages).not.toContain("site-check");
  });

  test("it starts the plan in Code, for the archetype quiz", () => {
    const plan = join(app, ".vibe/plan.md");
    expect(frontMatterErrors(join(repoRoot, "guidance/plan-front-matter.v1.schema.json"), plan)).toEqual([]);
    expect(frontMatter(readFileSync(plan, "utf8"))).toEqual({ archetype: "quiz", phase: "code", prePushFailures: 0 });
  });

  test("it keeps the plan from the conversation", { timeout: SLOW }, () => {
    const dir = join(tempDir("plan"), "app");
    mkdirSync(join(dir, ".vibe"), { recursive: true });
    ok("git", ["init", "--quiet"], dir);
    const plan = readFileSync(join(repoRoot, "test/fixtures/plans/filled.md"), "utf8");
    writeFileSync(join(dir, ".vibe/plan.md"), plan);
    const result = lernapps(["create", "--archetype", "quiz", dir, "--templates", templates], repoRoot);
    expect(result.code, output(result)).toBe(0);
    expect(readFileSync(join(dir, ".vibe/plan.md"), "utf8")).toBe(plan);
    expect(existsSync(join(dir, "src/quiz.json"))).toBe(true);
  });

  test("with the fixture bank, the app passes lernapps check", { timeout: SLOW }, () => {
    const result = run("npx", ["--no", "--", "lernapps", "check"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
  });

  test("the check leaves the bundle it checked in dist/, which the app check action deploys", () => {
    expect(readFileSync(join(app, "dist/index.html"), "utf8")).toContain("Naturwunder der Welt");
  });
});
