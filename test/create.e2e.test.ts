// The contract of the generator and the quiz archetype, end to end: `lernapps create --archetype quiz` in a
// temporary folder, then a question bank, gives an app that passes `lernapps check` without further code.
//   - it runs as an assistant starts it, with npx from git and nothing installed (`npx --yes github:lernapps/tooling#main
//     create ...`, here from a local clone at its commit): npm prepares the package from git, the app depends on that
//     commit and its workflows use the actions of that commit, `npm install` installs the hooks;
//   - the hooks go into the app's own repository only: in a folder inside another repository (as a template folder
//     sits in lernapps/app-templates), `npm install` leaves that repository's hooks alone;
//   - what it writes, and what it refuses, is tested on files alone in create.test.ts, on every push;
//   - the app with the fixture bank (test/fixtures/quiz/quiz.json, every type of question) passes `lernapps check`,
//     which runs the quiz's generic end-to-end tests (quizTests of @lernapps/app-templates) on that bank in a browser;
//   - its publish workflow publishes on a push to main, but not for a push that changes only the plan (.vibe/);
//   - `lernapps update` moves an app on an older runtime to the commit the tooling pins, installs it and says so.
// The quiz runtime itself (the browser behaviour, the page without JavaScript, the messages for a broken bank) is
// tested in lernapps/app-templates, where it lives: its unit tests and quizTests.
// The templates and the runtime come from a local clone of lernapps/app-templates with the pinned commit: the one named
// by LERNAPPS_TEMPLATES, else one fetched once into a cache (support.ts, appTemplates), so the hooks run these tests as
// CI does. The packages are installed from git.
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { appTemplates, freshClone, ok, repoRoot, run, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const BANK = join(repoRoot, "test/fixtures/quiz/quiz.json");

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

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

  test("the app depends on the commit npx installed the generator from, and its workflows use that commit's actions", () => {
    const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    expect(manifest.devDependencies["@lernapps/tooling"]).toBe(tooling);
    const pages = readFileSync(join(app, ".github/workflows/pages.yml"), "utf8");
    const commit = tooling.slice(tooling.indexOf("#") + 1);
    expect(pages).toContain(`uses: lernapps/tooling/actions/app-check@${commit} # main`);
    expect(pages).toContain(`uses: lernapps/tooling/actions/app-publish@${commit} # main`);
  });

  test("the publish workflow runs on a push to main, except for one that changes only the plan", () => {
    const pages = parse(readFileSync(join(app, ".github/workflows/pages.yml"), "utf8")) as {
      on: { push: { branches: string[]; "paths-ignore": string[] }; pull_request: unknown };
    };
    expect(pages.on.push).toEqual({ branches: ["main"], "paths-ignore": [".vibe/**"] });
    expect(pages.on).toHaveProperty("pull_request");
  });

  test("with the fixture bank, the app passes lernapps check", { timeout: SLOW }, () => {
    const result = run("npx", ["--no", "--", "lernapps", "check"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
  });

  test("the check leaves the bundle it checked in dist/, which the app check action deploys", () => {
    expect(readFileSync(join(app, "dist/index.html"), "utf8")).toContain("Naturwunder der Welt");
  });

  test(
    "lernapps update moves an older runtime to the commit the tooling pins, and installs it",
    { timeout: SLOW },
    () => {
      const pinned = (
        JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { appTemplates: { commit: string } }
      ).appTemplates.commit;
      const older = ok("git", ["rev-parse", `${pinned}~1`], templates).stdout.trim();
      const manifest = () =>
        JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as { devDependencies: Record<string, string> };
      const resolved = () =>
        (
          JSON.parse(readFileSync(join(app, "package-lock.json"), "utf8")) as {
            packages: Record<string, { resolved?: string }>;
          }
        ).packages["node_modules/@lernapps/app-templates"]?.resolved ?? "";
      // the app on the runtime of an older commit, installed
      const runtime = manifest().devDependencies["@lernapps/app-templates"] ?? "";
      expect(runtime).toMatch(new RegExp(`#${pinned}$`));
      const olderSpec = runtime.replace(new RegExp(`#${pinned}$`), `#${older}`);
      ok("npm", ["install", "--no-audit", "--no-fund", "--save-dev", `@lernapps/app-templates@${olderSpec}`], app);
      expect(resolved()).toContain(`#${older}`);

      const result = run("npx", ["--no", "--", "lernapps", "update"], app);
      expect(result.code, output(result)).toBe(0);
      expect(result.stdout).toContain(`@lernapps/app-templates: ${older.slice(0, 7)} → ${pinned.slice(0, 7)}`);
      expect(result.stdout).toContain("@lernapps/tooling: unchanged");
      expect(manifest().devDependencies["@lernapps/app-templates"]).toBe(runtime);
      expect(manifest().devDependencies["@lernapps/tooling"]).toBe(tooling);
      expect(resolved()).toContain(`#${pinned}`);
      expect(result.stdout).toContain("npx lernapps check");
    },
  );

  // Last: it turns the app's folder into a folder of another repository.
  test("npm install in a folder inside another repository leaves that repository's hooks alone", () => {
    rmSync(join(app, ".git"), { recursive: true, force: true });
    const outer = dirname(app);
    ok("git", ["init", "--quiet", "--initial-branch=main"], outer);
    const installed = ok("npm", ["install", "--no-audit", "--no-fund"], app);
    expect(output(installed)).toContain("lernapps hooks: this folder is naturwunder/ inside another git repository");
    expect(run("git", ["config", "core.hooksPath"], outer).stdout).toBe("");
    expect(run("git", ["config", "core.hooksPath"], app).stdout).toBe("");
  });
});
