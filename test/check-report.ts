// What the tests of `lernapps check` share: the CLI, the fixture apps, and the report on standard output, validated
// against its published schema, with the findings of one rule.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { expect } from "vite-plus/test";
import { parse } from "yaml";
import { repoRoot, run, runAsync, type Result } from "./support.ts";

const RULES = "https://lernapps.net/tooling/rules/#";
const SCHEMA = join(repoRoot, "check/validation-report.v1.schema.json");

export const output = (result: Result) => `${result.stdout}\n${result.stderr}`;
/** A fixture app of test/fixtures/apps/, as a build writes it. */
export const app = (name: string) => join(repoRoot, "test/fixtures/apps", name);
const cli = join(repoRoot, "src/cli.ts");
export const lernapps = (args: readonly string[], cwd = repoRoot) => run("node", [cli, ...args], cwd);
/** `lernapps check` on a bundle, a URL or an entry, from the tooling's repo. */
export const check = (...args: string[]) => lernapps(["check", ...args]);
export const checkAsync = (...args: string[]) => runAsync("node", [cli, "check", ...args], repoRoot);

export interface Finding {
  rule: string;
  severity: string;
  where: string;
  found: string;
  fix: string;
  link: string;
}
export interface Report {
  checked: Record<string, string>;
  rules: string[];
  findings: Finding[];
  fitness?: Record<string, string>;
}

const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
  JSON.parse(readFileSync(SCHEMA, "utf8")) as object,
);

/** The report on standard output, validated against the published schema. */
export function report(result: Result): Report {
  const value: unknown = parse(result.stdout);
  expect(validate(value), `${JSON.stringify(validate.errors)}\n${output(result)}`).toBe(true);
  return value as Report;
}

/** The findings of one rule; each has the shape every message has, with the link to its rule. */
export function findingsOf(result: Result, rule: string): Finding[] {
  const found = report(result).findings.filter((finding) => finding.rule === rule);
  for (const finding of found) {
    expect(finding.link).toBe(`${RULES}${rule}`);
    for (const key of ["severity", "where", "found", "fix"] as const) expect(finding[key], key).not.toBe("");
  }
  return found;
}
