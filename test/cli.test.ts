// The contract of the CLI `lernapps`: usage, exit codes, the command structure.
import { describe, expect, test } from "vite-plus/test";
import { repoRoot, run } from "./support.ts";

const lernapps = (...args: string[]) => run("node", ["src/cli.ts", ...args], repoRoot);

describe("lernapps", () => {
  test("--help prints the usage with the check command and exits 0", () => {
    const result = lernapps("--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^Usage: lernapps <command>/);
    expect(result.stdout).toContain("check [--pre-commit] [--pre-push]");
    expect(result.stdout).toContain("create --archetype <name> [<dir>]");
    expect(result.stderr).toBe("");
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
    for (const option of ["<dir|url>", "--entry <file>", "--site <path>", "--report <file>"]) {
      expect(result.stdout).toContain(option);
    }
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

  test("create without --archetype is a usage error", () => {
    const result = lernapps("create");
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("create needs --archetype <name> (quiz)");
  });
});
