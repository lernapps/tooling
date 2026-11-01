// The contract of the CLI `lernapps`: usage, exit codes, the command structure.
import { lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ParseArgsOptionsConfig } from "node:util";
import { describe, expect, test } from "vite-plus/test";
import { CREATE_OPTIONS, IGNORED_SKILLS_LINES, ownVersion } from "../generator/create.ts";
import { nextRange, replaceSkills, unignoreSkills, UPDATE_OPTIONS } from "../generator/update.ts";
import { countFailedChecks, countPrePushFailure } from "../src/plan.ts";
import { CHANGES_OPTIONS, CHECK_OPTIONS, HOOKS_OPTIONS, SCREENSHOTS_OPTIONS } from "../src/usage.ts";
import { repoRoot, run, tempDir, templatesVersion } from "./support.ts";

/** The help must name every option the parser accepts: the help is where the options are documented. */
function expectEveryOption(help: string, options: ParseArgsOptionsConfig): void {
  for (const [name, option] of Object.entries(options)) {
    expect(help, `--${name}`).toMatch(new RegExp(`(^|[\\s\\[,])--${name}\\b`, "m"));
    if (option.short !== undefined) expect(help, `-${option.short}`).toContain(`-${option.short}, --${name}`);
  }
}

const lernapps = (...args: string[]) => run("node", ["src/cli.ts", ...args], repoRoot);

// Each test starts the CLI (about 2 s, more on a busy runner): the default 5 s is too tight.
describe("lernapps", { timeout: 20_000 }, () => {
  test("--help prints the usage with the check command and exits 0", () => {
    const result = lernapps("--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps <command>/);
    expect(result.stdout).toContain("check [--pre-commit] [--pre-push]");
    expect(result.stdout).toContain("create --archetype <name> [<dir>]");
    expect(result.stdout).toMatch(/^  hooks +/m);
    expect(result.stdout).toMatch(/^  update +/m);
    expect(result.stderr).toBe("");
  });

  test("screenshots --help names every option and the exit codes; the usage lists the command", () => {
    const result = lernapps("screenshots", "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps screenshots /);
    expectEveryOption(result.stdout, SCREENSHOTS_OPTIONS);
    expect(result.stdout).toContain("explainer or quiz");
    expect(result.stdout).toContain("2 on a usage error");
    expect(lernapps("--help").stdout).toMatch(/^  screenshots +/m);
  });

  test("screenshots with an unknown option is a usage error", () => {
    const result = lernapps("screenshots", "--nope");
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("Usage: lernapps");
  });

  test("changes --help names every option, the map, what docs are, the configuration and the exit codes", () => {
    const result = lernapps("changes", "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps changes /);
    expectEveryOption(result.stdout, CHANGES_OPTIONS);
    for (const text of [
      ".vibe/**",
      "docs/**/*.md",
      "README.md, AGENTS.md and every other path are not",
      "allowlists",
    ]) {
      expect(result.stdout).toContain(text);
    }
    expect(result.stdout).toContain('"lernapps": { "changes": {');
    expect(result.stdout).toContain("0 when the scope is printed, 1 when package.json lernapps.changes is malformed");
    expect(lernapps("--help").stdout).toMatch(/^  changes \[--staged \| --pushed \| --ci\] +/m);
  });

  test("hooks --help names every option it accepts, and the exit codes", () => {
    const result = lernapps("hooks", "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps hooks$/m);
    expectEveryOption(result.stdout, HOOKS_OPTIONS);
    expect(result.stdout).toContain("0 when the hooks are installed or deliberately not, 1 when they cannot be");
  });

  test("update --help says what it moves, how to run it from the latest tooling, and the exit codes", () => {
    const result = lernapps("update", "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps update$/m);
    expectEveryOption(result.stdout, UPDATE_OPTIONS);
    expect(result.stdout).toContain("npx --yes @lernapps/tooling@latest update");
    expect(result.stdout).toContain("@lernapps/app-templates");
    expect(result.stdout).toContain("2 on a usage");
  });

  test("update outside an app fails and says where to run it", () => {
    const result = run("node", [join(repoRoot, "src/cli.ts"), "update"], tempDir("not-an-app"));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("lernapps update: no package.json here: run it in the app's folder");
  });

  test("update moves the actions to the tag of this version, keeps a newer runtime and moves nothing back", () => {
    const { version } = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { version: string };
    const oldCommit = "0123456789abcdef0123456789abcdef01234567";
    const dir = tempDir("app");
    const workflow = (ref: string) =>
      `jobs:\n  app:\n    steps:\n      - uses: lernapps/tooling/actions/app-check@${ref}\n`;
    mkdirSync(join(dir, ".github/workflows"), { recursive: true });
    writeFileSync(join(dir, ".github/workflows/pages.yml"), workflow(oldCommit));
    // the tooling is at this version already and the runtime is newer, so there is nothing for npm to install
    const devDependencies = { "@lernapps/app-templates": "^99.0.0", "@lernapps/tooling": `^${version}` };
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "app", devDependencies }));
    const result = run("node", [join(repoRoot, "src/cli.ts"), "update"], dir);
    expect(result.code, result.stderr).toBe(0);
    expect(result.stdout).toContain(
      `lernapps update: @lernapps/app-templates: kept ^99.0.0, not moved to ^${templatesVersion()}: it is not older`,
    );
    expect(result.stdout).toContain(`lernapps update: @lernapps/tooling: unchanged (^${version})`);
    expect(result.stdout).toContain(
      `lernapps update: the actions of lernapps/tooling in ${join(".github", "workflows", "pages.yml")}: v${version}`,
    );
    expect(result.stdout).toContain("Next:");
    expect(readFileSync(join(dir, ".github/workflows/pages.yml"), "utf8")).toBe(workflow(`v${version}`));
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))).toEqual({ name: "app", devDependencies });
  });

  test("update's ranges: a git commit or an older version becomes this version, a newer one stays", () => {
    const commit = "github:lernapps/tooling#0123456789abcdef0123456789abcdef01234567";
    expect(nextRange("@lernapps/tooling", commit, "0.2.0")).toEqual({
      spec: "^0.2.0",
      line: `@lernapps/tooling: ${commit} → ^0.2.0`,
    });
    expect(nextRange("@lernapps/tooling", "^0.1.0", "0.2.0").spec).toBe("^0.2.0");
    expect(nextRange("@lernapps/tooling", "^0.2.0", "0.2.0")).toEqual({
      spec: "^0.2.0",
      line: "@lernapps/tooling: unchanged (^0.2.0)",
    });
    expect(nextRange("@lernapps/tooling", "^0.3.1", "0.2.0")).toEqual({
      spec: "^0.3.1",
      line: "@lernapps/tooling: kept ^0.3.1, not moved to ^0.2.0: it is not older",
    });
    expect(nextRange("@lernapps/tooling", undefined, "0.2.0").spec).toBe("^0.2.0");
    // a local copy stays: it is what the app is developed against
    expect(nextRange("@lernapps/tooling", "file:../tooling", "0.2.0")).toEqual({
      spec: "file:../tooling",
      line: "@lernapps/tooling: kept file:../tooling, a local copy",
    });
  });

  test("update moves the plan .vibe/plan.md of an older app to .vibe/plans/01-first-version.md, and says so", () => {
    const dir = tempDir("app");
    const plan = "---\narchetype: quiz\nphase: commit\nprePushFailures: 2\n---\n\n# Plan\n";
    mkdirSync(join(dir, ".vibe"));
    writeFileSync(join(dir, ".vibe/plan.md"), plan);
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ devDependencies: { "@lernapps/tooling": `^${ownVersion()}` } }),
    );
    const result = run("node", [join(repoRoot, "src/cli.ts"), "update"], dir);
    expect(result.stdout).toContain(
      "lernapps update: plan: moved .vibe/plan.md to .vibe/plans/01-first-version.md, unchanged",
    );
    expect(readdirSync(join(dir, ".vibe"))).toEqual(["plans"]);
    // and installs the skills of this tooling (the skills step is tested on its own below)
    expect(result.stdout).toMatch(/^lernapps update: skills: added lernapps-app, /m);
    expect(readFileSync(join(dir, ".vibe/plans/01-first-version.md"), "utf8")).toBe(plan);
  });

  test("update's skills step installs those of every phase and of the plan's archetype, keeps the app's own", () => {
    // the tooling's skills, by group: a changed lernapps-app with a file in a subfolder, a new lernapps-listing, the
    // two skills of two archetypes, and a folder of another name
    const source = tempDir("skills");
    const write = (file: string, text: string) => {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, text);
    };
    write(join(source, "process/lernapps-app/SKILL.md"), "---\nname: lernapps-app\n---\nnew\n");
    write(join(source, "process/lernapps-app/references/platform-rules.md"), "# Platform rules\n");
    write(join(source, "process/lernapps-listing/SKILL.md"), "---\nname: lernapps-listing\n---\n");
    for (const name of ["lernapps-quiz", "lernapps-quiz-design", "lernapps-explainer", "lernapps-explainer-design"]) {
      write(join(source, "archetypes", name, "SKILL.md"), `---\nname: ${name}\n---\n`);
    }
    write(join(source, "process/planted/SKILL.md"), "---\nname: planted\n---\n");
    // the app, a quiz: an older lernapps-app, one the tooling no longer has and one of another archetype, as npx
    // skills add installed them, next to the app's own guide; an older generator had git ignore them
    const dir = tempDir("app");
    write(join(dir, ".vibe/plans/01-first-version.md"), "---\narchetype: quiz\nphase: code\n---\n");
    const installed = (name: string, text: string) => {
      write(join(dir, ".agents/skills", name, "SKILL.md"), text);
      mkdirSync(join(dir, ".claude/skills"), { recursive: true });
      symlinkSync(`../../.agents/skills/${name}`, join(dir, ".claude/skills", name));
    };
    installed("lernapps-app", "---\nname: lernapps-app\n---\nold\n");
    installed("lernapps-gone", "---\nname: lernapps-gone\n---\n");
    installed("lernapps-explainer", "---\nname: lernapps-explainer\n---\n");
    installed("app-content", "---\nname: app-content\n---\nthe app's own\n");
    const lock = {
      "lernapps-app": {
        source: "lernapps/tooling",
        sourceType: "github",
        computedHash: "old",
      },
    };
    writeFileSync(join(dir, "skills-lock.json"), JSON.stringify({ version: 1, skills: lock }));
    writeFileSync(join(dir, ".gitignore"), `node_modules/\n\n${IGNORED_SKILLS_LINES.join("\n")}\n`);

    expect(replaceSkills(dir, source)).toEqual([
      "skills: replaced lernapps-app; added lernapps-listing, lernapps-quiz, lernapps-quiz-design; removed " +
        "lernapps-explainer, lernapps-gone: not of this tooling, or of another archetype: " +
        `the lernapps-* skills of this tooling, in ${join(".agents", "skills")}/ and ${join(".claude", "skills")}/`,
    ]);
    expect(unignoreSkills(dir)).toEqual([
      "skills: removed the lines from .gitignore that had git ignore them: the app commits its skills",
    ]);
    for (const [name, group] of [
      ["lernapps-app", "process"],
      ["lernapps-listing", "process"],
      ["lernapps-quiz", "archetypes"],
    ] as const) {
      const ours = readFileSync(join(source, group, name, "SKILL.md"), "utf8");
      expect(readFileSync(join(dir, ".claude/skills", name, "SKILL.md"), "utf8"), name).toBe(ours);
      expect(readlinkSync(join(dir, ".claude/skills", name))).toBe(`../../.agents/skills/${name}`);
    }
    expect(readdirSync(join(dir, ".agents/skills")).sort()).toEqual([
      "app-content",
      "lernapps-app",
      "lernapps-listing",
      "lernapps-quiz",
      "lernapps-quiz-design",
    ]);
    expect(readFileSync(join(dir, ".claude/skills/lernapps-app/references/platform-rules.md"), "utf8")).toBe(
      "# Platform rules\n",
    );
    expect(() => lstatSync(join(dir, ".claude/skills/lernapps-gone"))).toThrow();
    expect(() => lstatSync(join(dir, ".claude/skills/lernapps-explainer"))).toThrow();
    expect(readFileSync(join(dir, ".claude/skills/app-content/SKILL.md"), "utf8")).toContain("the app's own");
    const written = JSON.parse(readFileSync(join(dir, "skills-lock.json"), "utf8")) as {
      skills: Record<string, { source: string; skillPath: string; computedHash: string }>;
    };
    expect(Object.keys(written.skills)).toEqual([
      "lernapps-app",
      "lernapps-listing",
      "lernapps-quiz",
      "lernapps-quiz-design",
    ]);
    expect(written.skills["lernapps-app"]?.skillPath).toBe("skills/process/lernapps-app/SKILL.md");
    expect(written.skills["lernapps-app"]?.computedHash).toMatch(/^[0-9a-f]{64}$/);
    expect(readFileSync(join(dir, ".gitignore"), "utf8")).toBe("node_modules/\n");
    // a second run finds them as they are
    expect(replaceSkills(dir, source)).toEqual(["skills: the lernapps-* skills are those of this tooling already (4)"]);
    expect(unignoreSkills(dir)).toEqual([]);
  });

  test("update's skills step keeps the archetype skills an app has when its plan names no archetype", () => {
    const source = tempDir("skills");
    for (const name of ["lernapps-quiz", "lernapps-explainer"]) {
      mkdirSync(join(source, "archetypes", name), { recursive: true });
      writeFileSync(join(source, "archetypes", name, "SKILL.md"), `---\nname: ${name}\n---\n`);
    }
    const dir = tempDir("app");
    mkdirSync(join(dir, ".agents/skills/lernapps-quiz"), { recursive: true });
    writeFileSync(join(dir, ".agents/skills/lernapps-quiz/SKILL.md"), "---\nname: lernapps-quiz\n---\nold\n");
    replaceSkills(dir, source);
    expect(readdirSync(join(dir, ".agents/skills"))).toEqual(["lernapps-quiz"]);
  });

  test("update's skills step leaves the lernapps-practice-* skills of lernapps/practice and their lock entries", () => {
    const source = tempDir("skills");
    mkdirSync(join(source, "process/lernapps-app"), { recursive: true });
    writeFileSync(join(source, "process/lernapps-app/SKILL.md"), "---\nname: lernapps-app\n---\n");
    const dir = tempDir("app");
    const practice = [
      "lernapps-practice-explore",
      "lernapps-practice-photos",
      "lernapps-practice-plan",
      "lernapps-practice-submit",
    ];
    const lock: Record<string, unknown> = {};
    for (const name of [...practice, "lernapps-gone"]) {
      mkdirSync(join(dir, ".agents/skills", name), { recursive: true });
      writeFileSync(join(dir, ".agents/skills", name, "SKILL.md"), `---\nname: ${name}\n---\n`);
      mkdirSync(join(dir, ".claude/skills"), { recursive: true });
      symlinkSync(`../../.agents/skills/${name}`, join(dir, ".claude/skills", name));
      lock[name] = {
        source: name === "lernapps-gone" ? "lernapps/tooling" : "lernapps/practice",
        sourceType: "github",
        computedHash: "x",
      };
    }
    writeFileSync(join(dir, "skills-lock.json"), JSON.stringify({ version: 1, skills: lock }));

    const lines = replaceSkills(dir, source);
    expect(lines.join("\n")).toContain("removed lernapps-gone");
    expect(lines.join("\n")).not.toContain("practice");
    expect(readdirSync(join(dir, ".agents/skills")).sort()).toEqual(["lernapps-app", ...practice]);
    expect(readdirSync(join(dir, ".claude/skills")).sort()).toEqual(["lernapps-app", ...practice]);
    const written = JSON.parse(readFileSync(join(dir, "skills-lock.json"), "utf8")) as {
      skills: Record<string, { source: string }>;
    };
    expect(Object.keys(written.skills)).toEqual(["lernapps-app", ...practice]);
    expect(written.skills["lernapps-practice-submit"]?.source).toBe("lernapps/practice");
  });

  test("a failed check --pre-push counts in the current plan, the highest number; else in .vibe/plan.md", () => {
    // the counting itself; that a failed pre-push counts at all, the e2e test of the failing app shows
    const plan = (failures: number) => `---\narchetype: quiz\nphase: code\nprePushFailures: ${failures}\n---\n`;
    const counted = (files: Record<string, string>) => {
      const dir = tempDir("pre-push");
      for (const [file, text] of Object.entries(files)) {
        mkdirSync(join(dir, file, ".."), { recursive: true });
        writeFileSync(join(dir, file), text);
      }
      countPrePushFailure(dir);
      return Object.keys(files).map(
        (file) => /prePushFailures: (\d+)/.exec(readFileSync(join(dir, file), "utf8"))?.[1],
      );
    };
    const plans = {
      ".vibe/plans/01-first-version.md": plan(3),
      ".vibe/plans/02-mehr-runden.md": plan(0),
    };
    expect(counted({ ".vibe/plan.md": plan(5), ...plans })).toEqual(["5", "3", "1"]);
    expect(counted({ ".vibe/plan.md": plan(5) })).toEqual(["6"]);
  });

  test("a failed check counts each failed rule once per run in failedChecks of the current plan, when it has the key", () => {
    const dir = tempDir("failed-checks");
    const plan = join(dir, ".vibe/plans/01-first-version.md");
    mkdirSync(join(plan, ".."), { recursive: true });
    const front = (failed: string) =>
      `---\narchetype: quiz\nphase: code\nprePushFailures: 0\nfailedChecks: ${failed}\n---\n`;
    writeFileSync(plan, `${front("{}")}\n# Plan\n`);
    countFailedChecks(["quiz-bank-valid", "checks-pass", "quiz-bank-valid"], dir);
    countFailedChecks(["checks-pass"], dir);
    expect(readFileSync(plan, "utf8")).toBe(`${front("{ checks-pass: 2, quiz-bank-valid: 1 }")}\n# Plan\n`);
    // a plan made before the key stays as it is
    const old = "---\narchetype: quiz\nphase: code\nprePushFailures: 0\n---\n\nfailedChecks: {}\n";
    writeFileSync(plan, old);
    countFailedChecks(["checks-pass"], dir);
    expect(readFileSync(plan, "utf8")).toBe(old);
  });

  test("without a command it prints the usage and exits non-zero", () => {
    const result = lernapps();
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("Usage: lernapps <command>");
  });

  test("an unknown command exits non-zero and says so", () => {
    const result = lernapps("frobnicate");
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("unknown command: frobnicate");
  });

  test("check --help describes the fast and the heavy part and exits 0", () => {
    const result = lernapps("check", "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps check \[--pre-commit\] \[--pre-push\]/);
    expect(result.stdout).toContain("--pre-commit");
    expect(result.stdout).toContain("--pre-push");
  });

  test("check --help describes the checks of a built app and the report", () => {
    const result = lernapps("check", "--help");
    expect(result.code).toBe(0);
    for (const option of ["<dir|url>", "--entry <file>", "--report <file>"]) {
      expect(result.stdout).toContain(option);
    }
    // the second visit without JavaScript, only of explainer pages, and the section anchors of an entry's topics
    expect(result.stdout).toContain('<meta name="lernapps-archetype" content="explainer">');
    expect(result.stdout).toContain("Pages without the marker get no second visit");
    expect(result.stdout).toContain("#<section>");
  });

  test("check --help names no site rules: the check has no option for them", () => {
    const result = lernapps("check", "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).not.toMatch(/--site|site rules|scope/);
  });

  test("check --site is a usage error", () => {
    const result = lernapps("check", "--site", "/brueche/", "test/fixtures/apps/passing");
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("--site");
  });

  test("check --help names every option it accepts, and the exit codes", () => {
    const result = lernapps("check", "--help");
    expect(result.code).toBe(0);
    expectEveryOption(result.stdout, CHECK_OPTIONS);
    expect(result.stdout).toContain("0 when no rule of severity error fails, 1 when one does, 2 on a usage error");
  });

  test("check --help lists every check with its rule id, severity and what it checks", async () => {
    const result = lernapps("check", "--help");
    const dir = join(repoRoot, "check", "rules");
    const files = readdirSync(dir).filter((file) => file.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const module = (await import(pathToFileURL(join(dir, file)).href)) as {
        default?: { id?: string; severity?: string; description?: string };
      };
      const { id, severity = "error", description = "" } = module.default ?? {};
      if (id === undefined) continue; // not a check; the id test of the rule catalog reports it
      const escaped = description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(result.stdout).toMatch(new RegExp(`^  ${id} +${severity} +${escaped}$`, "m"));
    }
    expect(result.stdout).toContain("https://lernapps.net/tooling/rules/#<id>");
  });

  test("check with a built app and --pre-push is a usage error", () => {
    const result = lernapps("check", "--pre-push", "https://lernapps.net/");
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("--pre-push");
  });

  test("check with an unknown option exits non-zero", () => {
    const result = lernapps("check", "--pre-merge");
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("--pre-merge");
  });

  test("--version prints the version of the package", () => {
    const result = lernapps("--version");
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  test("create --help names the archetypes and where the templates come from, and exits 0", () => {
    const result = lernapps("create", "--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps create --archetype <name> \[<dir>\]/);
    expect(result.stdout).toContain("explainer, interactive, quiz");
    for (const option of ["--plan <file>", "--templates <dir>", "--tooling <spec>", "LERNAPPS_TEMPLATES"]) {
      expect(result.stdout).toContain(option);
    }
  });

  test("create --help names every option it accepts, how to run it before installing, and the exit codes", () => {
    const result = lernapps("create", "--help");
    expect(result.code).toBe(0);
    expectEveryOption(result.stdout, CREATE_OPTIONS);
    expect(result.stdout).toContain("npx lernapps create --archetype <name>");
    expect(result.stdout).toContain("git, and the npm registry");
    expect(result.stdout).toContain("2 on a usage error");
  });

  test("--help says how to run the CLI before it is installed, and the exit codes", () => {
    const result = lernapps("--help");
    expect(result.stdout).toContain("npx --yes @lernapps/tooling <command>");
    expect(result.stdout).toContain("2 on a usage error");
  });

  test("create without --archetype is a usage error", () => {
    const result = lernapps("create");
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("create needs --archetype <name> (explainer, interactive, quiz)");
  });
});
