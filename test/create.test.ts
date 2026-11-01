// The contract of the generator on files, without installing anything: `lernapps create --archetype quiz`, run from
// this repo with a confirmed plan, writes the template of app-templates at the pinned commit with the runtime of that
// commit as dependency, AGENTS.md, the content guide (an app-local skill, linked for Claude Code), the workflows,
// LICENSE and the issue form for content errors; it keeps the plan and the skills `npx skills add` installed, which
// the app commits; it fails on an unknown archetype, on a folder that is not empty, on more than one plan, and
// without a plan the creator confirmed for this archetype. Fast enough for every push of this repo.
// create.e2e.test.ts runs it as an assistant does, with npx from git, installs the app and checks it.
// The templates come from a local clone of lernapps/app-templates with the pinned commit (support.ts, appTemplates).
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import {
  appTemplates,
  confirmedPlan,
  FIRST_PLAN,
  ok,
  repoRoot,
  run,
  tempDir,
  templatesVersion,
  type Result,
} from "./support.ts";

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
    expect(result.stderr).toContain("unknown archetype: essay (known: explainer, interactive, quiz)");
  });

  test("a folder that is not empty, naming what is there", () => {
    const dir = tempDir("create-full");
    writeFileSync(join(dir, "README.md"), "# Mein Quiz\n");
    const result = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("is not empty (README.md)");
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  test("an app-templates folder that is no package, saying how to name one", () => {
    const dir = tempDir("create-offline");
    confirmedPlan(dir, "quiz");
    const result = lernapps(["create", "--archetype", "quiz", dir, "--templates", join(dir, "nowhere")], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("is no package @lernapps/app-templates");
  });

  test("a folder without a plan, saying to start it from the plan template", () => {
    const dir = tempDir("create-no-plan");
    const result = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("there is no plan");
    expect(result.stderr).toContain("npx --yes @lernapps/tooling init <short name>");
    expect(result.stderr).toContain("work through Explore and Plan with the creator first");
  });

  test("sketches in .vibe/ do not stop it: the planning folder holds more than the plan", () => {
    const dir = tempDir("create-sketches");
    confirmedPlan(dir, "quiz");
    mkdirSync(join(dir, ".vibe/sketches"), { recursive: true });
    writeFileSync(join(dir, ".vibe/sketches/table.svg"), "<svg xmlns='http://www.w3.org/2000/svg'/>\n");
    const result = lernapps(
      ["create", "--archetype", "quiz", dir, "--templates", appTemplates(), "--tooling", "^0.1.0"],
      repoRoot,
    );
    expect(result.code, output(result)).toBe(0);
    expect(existsSync(join(dir, ".vibe/sketches/table.svg"))).toBe(true);
    expect(existsSync(join(dir, "package.json"))).toBe(true);
  }, 20_000);

  test("a plan the creator has not confirmed yet", () => {
    const dir = tempDir("create-unconfirmed");
    const plan = confirmedPlan(dir, "quiz");
    writeFileSync(plan, readFileSync(plan, "utf8").replace(/^phase: code$/m, "phase: plan"));
    const result = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("is in the phase plan: the creator must confirm the plan first");
    expect(result.stderr).toContain("the Plan phase ends with phase: code");
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  test("a second plan, or a first plan not numbered 01: a new app has one plan, the first version's", () => {
    const dir = tempDir("create-two-plans");
    confirmedPlan(dir, "quiz");
    confirmedPlan(dir, "quiz", ".vibe/plans/02-mehr-runden.md");
    const two = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(two.code, output(two)).toBe(1);
    expect(two.stderr).toContain("there is more than one plan");
    expect(two.stderr).toContain("a new app has one plan, the first version's, .vibe/plans/01-<short name>.md");
    rmSync(join(dir, FIRST_PLAN));
    const second = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(second.code, output(second)).toBe(1);
    expect(second.stderr).toContain("is not numbered 01");
    expect(existsSync(join(dir, "package.json"))).toBe(false);
    // two runs of the CLI, about 2 s each: more than the default 5 s on a busy runner
  }, 20_000);

  test("a plan .vibe/plan.md of an earlier tooling is read as the first plan", () => {
    const dir = tempDir("create-legacy-plan");
    confirmedPlan(dir, "quiz", ".vibe/plan.md");
    const result = lernapps(["create", "--archetype", "explainer", dir], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain(`${join(dir, ".vibe/plan.md")} chose the archetype quiz, not explainer`);
  });

  test("a plan for another archetype, naming both", () => {
    const dir = tempDir("create-other-archetype");
    const plan = join(repoRoot, "test/fixtures/plans/filled.md");
    const result = lernapps(["create", "--archetype", "explainer", dir, "--plan", plan], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("chose the archetype quiz, not explainer (--archetype)");
  });
});

describe.skipIf(inner)("a quiz app from lernapps create, its files", () => {
  let templates = "";
  let app = "";
  const tooling = "^9.9.9";
  const version = (JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { version: string }).version;

  beforeAll(() => {
    templates = appTemplates();
    app = join(tempDir("quiz-files"), "naturwunder");
    confirmedPlan(app, "quiz");
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
    // the runtime of the version the template was copied from
    expect(manifest.devDependencies["@lernapps/app-templates"]).toBe(`^${templatesVersion()}`);
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
    // both of the tag of the version that wrote the app
    const pages = readFileSync(join(app, ".github/workflows/pages.yml"), "utf8");
    const [check, deploy] = [
      `uses: lernapps/tooling/actions/app-check@v${version}`,
      `uses: lernapps/tooling/actions/app-publish@v${version}`,
    ].map((step) => pages.indexOf(step));
    expect(check, pages).toBeGreaterThan(-1);
    expect(deploy, pages).toBeGreaterThan(check ?? Infinity);
    expect(pages).toContain(`uses: lernapps/tooling/actions/app-preview@v${version}`);
    expect(pages).toContain("pages: write"); // the app publish action reads the Pages settings
    expect(pages).not.toContain("site-check");
  });

  test("it writes the content guide, linked for Claude Code; the link survives a commit and a clone", () => {
    const guide = ".agents/skills/app-content/SKILL.md";
    expect(readFileSync(join(app, guide), "utf8")).toBe(readFileSync(join(repoRoot, "generator/app", guide), "utf8"));
    const link = join(app, ".claude/skills/app-content");
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(readlinkSync(link)).toBe("../../.agents/skills/app-content");
    // as the creator's first commit keeps it, and as anyone else gets it
    const repo = join(tempDir("guide-link"), "app");
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    ok("git", ["add", "--all"], app);
    ok(
      "git",
      // no automatic maintenance: newer git runs it detached after a commit, writing into .git while it is removed
      [
        "-c",
        "user.name=t",
        "-c",
        "user.email=t@example.org",
        "-c",
        "maintenance.auto=false",
        "-c",
        "gc.auto=0",
        "commit",
        "--quiet",
        "--no-verify",
        "-m",
        "app",
      ],
      app,
    );
    expect(ok("git", ["ls-files", "--stage", ".claude/skills/app-content"], app).stdout).toMatch(/^120000 /);
    ok("git", ["clone", "--quiet", app, repo], repoRoot);
    expect(lstatSync(join(repo, ".claude/skills/app-content")).isSymbolicLink()).toBe(true);
    expect(readFileSync(join(repo, ".claude/skills/app-content/SKILL.md"), "utf8")).toMatch(
      /^---\nname: app-content\n/,
    );
    rmSync(join(app, ".git"), { recursive: true, force: true });
  });

  test("an explainer app gets its template and what the type check of its Vue components needs", () => {
    const dir = join(tempDir("explainer-files"), "prozent");
    const plan = confirmedPlan(tempDir("explainer-plan"), "explainer");
    const result = lernapps(
      ["create", "--archetype", "explainer", dir, "--templates", templates, "--plan", plan],
      repoRoot,
    );
    expect(result.code, output(result)).toBe(0);
    for (const file of ["src/app.yaml", "src/main.ts", "vite.config.ts", "e2e/explainer.e2e.ts"]) {
      expect(existsSync(join(dir, file)), file).toBe(true);
    }
    expect(readFileSync(join(dir, "vite.config.ts"), "utf8")).toContain("lernapps({ plugins: [explainer()] })");
    const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    // lernapps check runs vue-tsc once the app has a component (src/components/<Name>.vue)
    expect(manifest.devDependencies["vue-tsc"]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.devDependencies["typescript"]).toMatch(/^\d+\.\d+\.\d+$/);
    // the plan given with --plan, carried over
    expect(readFileSync(join(dir, FIRST_PLAN), "utf8")).toBe(readFileSync(plan, "utf8"));
    expect(existsSync(join(dir, ".claude/skills/app-content/SKILL.md"))).toBe(true);
  });

  test("a quiz app gets no architecture: only interactive apps have one", () => {
    expect(existsSync(join(app, "docs/arc42"))).toBe(false);
    expect(existsSync(join(app, ".arc42ignore"))).toBe(false);
  });

  test("an interactive app gets its template, the type check of its Vue components and its architecture", () => {
    const dir = join(tempDir("interactive-files"), "zehnfinger");
    const plan = confirmedPlan(tempDir("interactive-plan"), "interactive");
    const result = lernapps(
      ["create", "--archetype", "interactive", dir, "--templates", templates, "--plan", plan],
      repoRoot,
    );
    expect(result.code, output(result)).toBe(0);
    for (const file of ["src/app.yaml", "src/core/index.ts", "src/ui/App.vue", "src/main.ts", ".arc42ignore"]) {
      expect(existsSync(join(dir, file)), file).toBe(true);
    }
    const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    expect(manifest.devDependencies["vue-tsc"]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.devDependencies["@doctc/arc42"]).toBe("0.38.0");
    // the generic part and the interactive extension, combined chapter by chapter, with the app's paths
    const chapters = readdirSync(join(dir, "docs/arc42")).sort();
    expect(chapters).toHaveLength(12);
    expect(chapters[0]).toBe("01-introduction-and-goals.arc42.md");
    const blocks = readFileSync(join(dir, "docs/arc42/05-building-blocks.arc42.md"), "utf8");
    expect(blocks).toContain("lernapps update replaces this file");
    expect(blocks).toContain("id: bb-interactive-core");
    expect(blocks).toContain("path: src/core\n");
    expect(blocks).not.toMatch(/^path: (runtime|interactive)\//m);
    expect(blocks).toContain(":::ignore H014 installed package @lernapps/app-templates");
    expect(blocks).toContain("<!-- app: begin core -->\n<!-- app: end core -->");
  });

  test(
    "it keeps the plan from the conversation and the skills npx skills add installed, which the app commits",
    {
      timeout: SLOW,
    },
    () => {
      const dir = join(tempDir("plan"), "app");
      mkdirSync(join(dir, ".vibe/plans"), { recursive: true });
      ok("git", ["init", "--quiet"], dir);
      const plan = readFileSync(join(repoRoot, "test/fixtures/plans/filled.md"), "utf8");
      writeFileSync(join(dir, ".vibe/plans/01-naturwunder.md"), plan);
      // as `npx skills add lernapps/tooling --yes` installs a skill: the folder, a link for Claude Code, the lock file
      const skill = readFileSync(join(repoRoot, "skills/process/lernapps-app/SKILL.md"), "utf8");
      mkdirSync(join(dir, ".agents/skills/lernapps-app"), { recursive: true });
      writeFileSync(join(dir, ".agents/skills/lernapps-app/SKILL.md"), skill);
      mkdirSync(join(dir, ".claude/skills"), { recursive: true });
      symlinkSync("../../.agents/skills/lernapps-app", join(dir, ".claude/skills/lernapps-app"));
      const lock = `${JSON.stringify({ version: 1, skills: { "lernapps-app": { source: "lernapps/tooling" } } })}\n`;
      writeFileSync(join(dir, "skills-lock.json"), lock);
      const result = lernapps(["create", "--archetype", "quiz", dir, "--templates", templates], repoRoot);
      expect(result.code, output(result)).toBe(0);
      expect(readFileSync(join(dir, ".vibe/plans/01-naturwunder.md"), "utf8")).toBe(plan);
      expect(existsSync(join(dir, "src/quiz.json"))).toBe(true);
      expect(readFileSync(join(dir, ".claude/skills/lernapps-app/SKILL.md"), "utf8")).toBe(skill);
      expect(readFileSync(join(dir, "skills-lock.json"), "utf8")).toBe(lock);
      expect(readFileSync(join(dir, ".claude/skills/app-content/SKILL.md"), "utf8")).toMatch(
        /^---\nname: app-content\n/,
      );
      // the first commit holds the installed skills with their links and lock, besides the content guide
      expect(readFileSync(join(dir, ".gitignore"), "utf8")).not.toContain("skills");
      ok("git", ["add", "--all"], dir);
      const staged = ok("git", ["ls-files", ".agents", ".claude", "skills-lock.json"], dir).stdout.trim().split("\n");
      expect(staged).toEqual([
        ".agents/skills/app-content/SKILL.md",
        ".agents/skills/lernapps-app/SKILL.md",
        ".claude/skills/app-content",
        ".claude/skills/lernapps-app",
        "skills-lock.json",
      ]);
    },
  );
});
