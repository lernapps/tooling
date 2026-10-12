// Runs every check in check/rules/ on what exists and writes the validation report (docs/arc42 ch. 5, "Validation
// report"; schema: check/validation-report.v1.schema.json). Deterministic: the same input gives the same report.
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { stringify } from "yaml";
import type { Context, Fitness, Problem, Severity } from "./check.ts";

const RULE_PAGE = "https://lernapps.net/tooling/rules/#";

/** One finding of the report: the shape of every message. */
export interface Finding {
  rule: string;
  severity: Severity;
  where: string;
  found: string;
  fix: string;
  link: string;
}

export const finding = (rule: string, severity: Severity, problem: Problem): Finding => ({
  rule,
  severity,
  where: problem.where,
  found: problem.found,
  fix: problem.fix,
  link: `${RULE_PAGE}${rule}`,
});

interface Loaded {
  id: string;
  severity: Severity;
  description: string;
  run: (context: Context) => unknown;
}

/** The checks next to the CLI: check/rules/*.ts in the source, dist/check/rules/*.mjs in the package. */
async function loadChecks(): Promise<Loaded[]> {
  const source = import.meta.url.endsWith(".ts");
  const dir = fileURLToPath(new URL(source ? "./rules/" : "./check/rules/", import.meta.url));
  const files = readdirSync(dir)
    .filter((file) => file.endsWith(source ? ".ts" : ".mjs"))
    .sort();
  const checks: Loaded[] = [];
  for (const file of files) {
    const module = (await import(pathToFileURL(join(dir, file)).href)) as { default?: Partial<Loaded> };
    const check = module.default;
    if (typeof check?.id !== "string" || typeof check.run !== "function") continue;
    checks.push({
      id: check.id,
      severity: check.severity ?? "error",
      description: check.description ?? "",
      run: check.run,
    });
  }
  return checks;
}

/** Every check with its rule id, severity and what it checks, for the help of `lernapps check`. */
export async function describeChecks(): Promise<string> {
  const checks = await loadChecks();
  const width = Math.max(...checks.map((check) => check.id.length));
  const lines = checks.map((check) => `  ${check.id.padEnd(width)}  ${check.severity.padEnd(7)}  ${check.description}`);
  return `Checks (rule id, severity, what it checks; each rule at ${RULE_PAGE}<id>):\n${lines.join("\n")}\n`;
}

/**
 * Runs every check; a check that returns undefined found nothing to check and is left out of the rules. A problem
 * has its check's severity, or the lower one it names.
 */
export async function runChecks(context: Context): Promise<{ rules: string[]; findings: Finding[] }> {
  const rules: string[] = [];
  const findings: Finding[] = [];
  for (const check of await loadChecks()) {
    const problems = (await check.run(context)) as Problem[] | undefined;
    if (problems === undefined) continue;
    rules.push(check.id);
    findings.push(...problems.map((problem) => finding(check.id, problem.severity ?? check.severity, problem)));
  }
  return { rules, findings };
}

export interface Report {
  checked: { commit: string } | { directory: string } | { bundle: string } | { url: string; at: string };
  parts?: ("pre-commit" | "pre-push")[];
  rules: string[];
  findings: Finding[];
  suppressions: { rule: string; where: string; reason: string }[];
  fitness?: Fitness;
}

const byPlace = (a: Finding, b: Finding) =>
  a.rule.localeCompare(b.rule) || a.where.localeCompare(b.where) || a.found.localeCompare(b.found);

export function toYaml(report: Report): string {
  const sorted: Report = {
    ...report,
    rules: [...new Set(report.rules)].sort(),
    findings: [...report.findings].sort(byPlace),
  };
  return stringify(sorted, { lineWidth: 0 });
}

export const failed = (report: Report) => report.findings.some((finding) => finding.severity === "error");
