// The plans of an app (guidance/AGENTS.md): one per piece of work, .vibe/plans/<NN>-<short name>.md, NN two digits
// from 01. The plan with the highest number is the current one; the others record earlier work and never change. An
// app made before this keeps its one plan at .vibe/plan.md until `lernapps update` moves it to
// .vibe/plans/01-first-version.md: while there is no plan in .vibe/plans/, it counts as plan 01. The hooks, the checks
// and the generator read the current plan here.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/** The folder of the plans, relative to the app's root. */
export const PLANS = ".vibe/plans";
/** The one plan of an app made before the plans had a folder. */
export const LEGACY_PLAN = ".vibe/plan.md";
/** Where `lernapps update` moves the legacy plan. */
export const MIGRATED_PLAN = `${PLANS}/01-first-version.md`;
/** A plan's file name: two digits, a hyphen, a short name. */
export const PLAN_NAME = /^(\d{2})-[^/\\]+\.md$/;

/** The plans in .vibe/plans/ (regular files named <NN>-<short name>.md), relative to `root`, by number. */
export function plans(root = "."): string[] {
  const folder = join(root, PLANS);
  if (!existsSync(folder) || !statSync(folder).isDirectory()) return [];
  return readdirSync(folder)
    .filter((name) => PLAN_NAME.test(name) && statSync(join(folder, name)).isFile())
    .sort((a, b) => Number(a.slice(0, 2)) - Number(b.slice(0, 2)) || a.localeCompare(b))
    .map((name) => `${PLANS}/${name}`);
}

/** The current plan, relative to `root`: the highest number in .vibe/plans/, else .vibe/plan.md; undefined if none. */
export function currentPlan(root = "."): string | undefined {
  const numbered = plans(root).at(-1);
  if (numbered !== undefined) return numbered;
  const legacy = join(root, LEGACY_PLAN);
  return existsSync(legacy) && statSync(legacy).isFile() ? LEGACY_PLAN : undefined;
}

/**
 * The front matter of a plan file, as an object: empty when it has none or it is not YAML. The hooks read it as the
 * schema guidance/plan-front-matter.v1.schema.json describes it.
 */
export function planFrontMatter(file: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(file, "utf8"));
  if (!match) return {};
  try {
    const front: unknown = parse(match[1] ?? "");
    return typeof front === "object" && front !== null ? (front as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Increments prePushFailures in the front matter of the current plan below `root`, when it has the key. */
export function countPrePushFailure(root = "."): void {
  const plan = currentPlan(root);
  if (plan === undefined) return;
  const file = join(root, plan);
  const text = readFileSync(file, "utf8");
  const counted = text.replace(
    /^(---\n(?:(?!---\n)[^\n]*\n)*?prePushFailures:[ \t]*)(\d+)/,
    (_match, head: string, count: string) => `${head}${Number(count) + 1}`,
  );
  if (counted !== text) writeFileSync(file, counted);
}

/**
 * Counts a failed check in failedChecks of the current plan's front matter below `root`, when it has the key: one run
 * more for each of `rules`, the rules with an error in that run. A flow map on one line, the rule ids sorted, so the
 * front matter stays one key per line: `failedChecks: { checks-pass: 2, quiz-bank-valid: 1 }`.
 */
export function countFailedChecks(rules: readonly string[], root = "."): void {
  const plan = currentPlan(root);
  if (plan === undefined || rules.length === 0) return;
  const file = join(root, plan);
  const text = readFileSync(file, "utf8");
  const line = /^(---\n(?:(?!---\n)[^\n]*\n)*?failedChecks:[ \t]*)([^\n]*)/.exec(text);
  if (line === null) return;
  let counts: Record<string, number> = {};
  try {
    const value: unknown = parse(line[2] ?? "");
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      for (const [rule, runs] of Object.entries(value)) if (typeof runs === "number") counts[rule] = runs;
    }
  } catch {
    counts = {};
  }
  for (const rule of new Set(rules)) counts[rule] = (counts[rule] ?? 0) + 1;
  const entries = Object.keys(counts)
    .sort()
    .map((rule) => `${rule}: ${counts[rule]}`);
  const head = line[1] ?? "";
  writeFileSync(file, `${head}{ ${entries.join(", ")} }${text.slice(head.length + (line[2] ?? "").length)}`);
}
