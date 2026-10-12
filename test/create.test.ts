// The contract of the generator on files, without installing anything: `lernapps create --archetype quiz`, run from
// this repo, writes the template of app-templates at the pinned commit with the runtime of that commit as dependency,
// AGENTS.md, the plan, the workflows, LICENSE and the issue form for content errors; it keeps a plan already there; it
// fails on an unknown archetype and on a folder that is not empty. Fast enough for every push of this repo.
// create.e2e.test.ts runs it as an assistant does, with npx from git, installs the app and checks it.
// The templates come from a local clone of lernapps/app-templates with the pinned commit (support.ts, appTemplates).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import { frontMatter, frontMatterErrors } from "./plan.ts";
import { appTemplates, ok, repoRoot, run, tempDir, type Result } from "./support.ts";

const SLOW = 5 * 60 * 1000;
const cli = join(repoRoot, "src/cli.ts");
const output = (result: Result) => `${result.stdout}\n${result.stderr}`;
const lernapps = (args: readonly string[], cwd: string) => run("node", [cli, ...args], cwd);
const inner = process.env["LERNAPPS_E2E_INNER"] === "1";

describe("lernapps create refuses", () => {
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

describe.skipIf(inner)("a quiz app from lernapps create, its files", () => {
  let templates = "";
  let app = "";
  const commit = "0123456789abcdef0123456789abcdef01234567";
  const tooling = `github:lernapps/tooling#${commit}`;

  beforeAll(() => {
    templates = appTemplates();
    app = join(tempDir("quiz-files"), "naturwunder");
    const created = lernapps(
      ["create", "--archetype", "quiz", app, "--templates", templates, "--tooling", tooling],
      repoRoot,
    );
    if (created.code !== 0) throw new Error(output(created));
  }, SLOW);

  test("it writes the template and the files every app has", () => {
    for (const file of [
      "index.html",
      "src/main.ts",
      "src/quiz.json",
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
    expect(manifest.devDependencies["@lernapps/tooling"]).toBe(tooling);
    // the runtime of the commit the template was copied from
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
    // the app check action (the same check as the hooks), then the app publish action with the bundle it checked,
    // both of the commit the app depends on
    const pages = readFileSync(join(app, ".github/workflows/pages.yml"), "utf8");
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
});
