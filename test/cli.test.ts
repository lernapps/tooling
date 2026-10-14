// The contract of the CLI `lernapps`: usage, exit codes, the command structure.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { ParseArgsOptionsConfig } from "node:util";
import { describe, expect, test } from "vite-plus/test";
import { CREATE_OPTIONS } from "../generator/create.ts";
import { UPDATE_OPTIONS } from "../generator/update.ts";
import { CHANGES_OPTIONS, CHECK_OPTIONS, HOOKS_OPTIONS } from "../src/usage.ts";
import { repoRoot, run, tempDir } from "./support.ts";

/** The help must name every option the parser accepts: the help is where the options are documented. */
function expectEveryOption(help: string, options: ParseArgsOptionsConfig): void {
  for (const [name, option] of Object.entries(options)) {
    expect(help, `--${name}`).toMatch(new RegExp(`(^|[\\s\\[,])--${name}\\b`, "m"));
    if (option.short !== undefined) expect(help, `-${option.short}`).toContain(`-${option.short}, --${name}`);
  }
}

const lernapps = (...args: string[]) => run("node", ["src/cli.ts", ...args], repoRoot);

describe("lernapps", () => {
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
    expect(result.stdout).toContain("npx --yes github:lernapps/tooling#main update");
    expect(result.stdout).toContain("@lernapps/app-templates");
    expect(result.stdout).toContain("2 on a usage");
  });

  test("update outside an app fails and says where to run it", () => {
    const result = run("node", [join(repoRoot, "src/cli.ts"), "update"], tempDir("not-an-app"));
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("lernapps update: no package.json here: run it in the app's folder");
  });

  test("update from a clone of the tooling says what it did not move and why, and exits 1", () => {
    // run from this repo: not installed by npm from a git commit, so there is no commit to move the tooling to
    const { commit } = (
      JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { appTemplates: { commit: string } }
    ).appTemplates;
    const toolingCommit = "0123456789abcdef0123456789abcdef01234567";
    const dir = tempDir("app");
    const workflow = `jobs:\n  app:\n    steps:\n      - uses: lernapps/tooling/actions/app-check@${toolingCommit} # main\n`;
    mkdirSync(join(dir, ".github/workflows"), { recursive: true });
    writeFileSync(join(dir, ".github/workflows/pages.yml"), workflow);
    const devDependencies = {
      "@lernapps/app-templates": `github:lernapps/app-templates#${commit}`,
      "@lernapps/tooling": `github:lernapps/tooling#${toolingCommit}`,
    };
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "app", devDependencies }));
    const result = run("node", [join(repoRoot, "src/cli.ts"), "update"], dir);
    expect(result.code, result.stderr).toBe(1);
    expect(result.stdout).toContain(`lernapps update: @lernapps/app-templates: unchanged (${commit.slice(0, 7)})`);
    expect(result.stdout).toContain(
      `lernapps update: @lernapps/tooling: not moved (still ${toolingCommit.slice(0, 7)}): this tooling (`,
    );
    expect(result.stdout).toContain("was not installed by npm from a git commit, so there is no commit to move to");
    expect(result.stdout).toContain(
      `lernapps update: the actions of lernapps/tooling in ${join(".github", "workflows", "pages.yml")}: not moved, for the same reason`,
    );
    expect(result.stdout).not.toContain("Next:");
    expect(result.stderr).toContain(
      "lernapps update: partly updated: @lernapps/tooling and the actions of lernapps/tooling not moved (see above). Run it from the latest tooling, installed by npx: npx --yes github:lernapps/tooling#main update",
    );
    expect(readFileSync(join(dir, ".github/workflows/pages.yml"), "utf8")).toBe(workflow);
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))).toEqual({ name: "app", devDependencies });
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
    expect(result.stdout).toContain("quiz");
    for (const option of ["--plan <file>", "--templates <repo>", "--tooling <spec>", "LERNAPPS_TEMPLATES"]) {
      expect(result.stdout).toContain(option);
    }
  });

  test("create --help names every option it accepts, how to run it before installing, and the exit codes", () => {
    const result = lernapps("create", "--help");
    expect(result.code).toBe(0);
    expectEveryOption(result.stdout, CREATE_OPTIONS);
    expect(result.stdout).toContain("npx --yes github:lernapps/tooling#main create --archetype <name>");
    expect(result.stdout).toContain("github.com, codeload.github.com and the npm registry");
    expect(result.stdout).toContain("2 on a usage error");
  });

  test("--help says how to run the CLI before it is installed, and the exit codes", () => {
    const result = lernapps("--help");
    expect(result.stdout).toContain("npx --yes github:lernapps/tooling#main <command>");
    expect(result.stdout).toContain("2 on a usage error");
  });

  test("create without --archetype is a usage error", () => {
    const result = lernapps("create");
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("create needs --archetype <name> (quiz)");
  });
});
