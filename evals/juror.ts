// Checks and scores the judgment of the eval juror (evals/juror/prompt.md): learning.yaml, valid against
// evals/juror/learning.v1.schema.json, with a level 0–2 for every unit of each learning-quality item of
// review/archetypes/explainer.md (the section "Learning quality", and explainer-figure-hides-answer).
//
//   node evals/juror.ts <learning.yaml> [--out <score.json>]
//
// Prints the score as JSON and writes it to --out; one line per problem and exit 1 when the file is not valid; 2 on a
// usage error. The score per item: the units judged, the mean level, the units at level 0. Across items: the mean of
// the item means (each item weighs the same, however many units it has), and the units at level 0.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { Ajv2020 } from "ajv/dist/2020.js";
import { parse } from "yaml";

const ROOT = resolve(import.meta.dirname, "..");
const SCHEMA = resolve(ROOT, "evals/juror/learning.v1.schema.json");
const RUBRIC = resolve(ROOT, "review/archetypes/explainer.md");

export interface Unit {
  item: string;
  page: string;
  unit: string;
  level: 0 | 1 | 2;
  evidence: string;
  did?: string;
}
export interface Judgment {
  url: string;
  grade: string;
  subject?: string;
  competencies?: string[];
  pages: string[];
  units: Unit[];
  notes?: string;
  at?: string;
}
export interface ItemScore {
  units: number;
  mean: number | null;
  zeros: number;
}
export interface Score {
  items: Record<string, ItemScore>;
  mean: number | null;
  zeros: number;
  pages: number;
}

/** The rule ids the juror judges: the items under "# Learning quality" in the explainer rubric, and the answer item. */
export function jurorItems(rubric = readFileSync(RUBRIC, "utf8")): string[] {
  const start = rubric.search(/^# Learning quality\s*$/m);
  if (start < 0) throw new Error(`${RUBRIC} has no section "# Learning quality"`);
  const ids = [...rubric.slice(start).matchAll(/^```rubric\s*\nid: ([a-z0-9-]+)/gm)].map((m) => m[1] as string);
  return ["explainer-figure-hides-answer", ...ids];
}

/** Problems of a judgment beyond its schema: unknown items, pages not listed, the two-level item at level 1. */
export function problems(judgment: Judgment, items = jurorItems()): string[] {
  const out: string[] = [];
  const pages = new Set(judgment.pages);
  judgment.units.forEach((unit, i) => {
    const at = `units[${i}] (${unit.item}, ${unit.page})`;
    if (!items.includes(unit.item)) out.push(`${at}: ${unit.item} is no learning-quality item (${items.join(", ")})`);
    if (!pages.has(unit.page)) out.push(`${at}: page ${unit.page} is not in pages`);
    if (unit.item === "explainer-figure-hides-answer" && unit.level === 1)
      out.push(`${at}: explainer-figure-hides-answer has the levels 0 and 2 only`);
  });
  return out;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** The score of a judgment: per item, and the mean of the item means. Items without a unit are left out. */
export function score(judgment: Judgment, items = jurorItems()): Score {
  const byItem: Record<string, ItemScore> = {};
  for (const item of items) {
    const levels = judgment.units.filter((u) => u.item === item).map((u) => u.level);
    if (levels.length === 0) continue;
    byItem[item] = {
      units: levels.length,
      mean: round(levels.reduce<number>((a, b) => a + b, 0) / levels.length),
      zeros: levels.filter((l) => l === 0).length,
    };
  }
  const means = Object.values(byItem).map((s) => s.mean as number);
  return {
    items: byItem,
    mean: means.length ? round(means.reduce((a, b) => a + b, 0) / means.length) : null,
    zeros: Object.values(byItem).reduce((a, s) => a + s.zeros, 0),
    pages: judgment.pages.length,
  };
}

/** Reads and checks a judgment: the schema, then problems(). */
export function readJudgment(file: string): { judgment?: Judgment; problems: string[] } {
  const data = parse(readFileSync(file, "utf8")) as unknown;
  const ajv = new Ajv2020({ allErrors: true });
  const validate = ajv.compile(JSON.parse(readFileSync(SCHEMA, "utf8")) as object);
  if (!validate(data))
    return {
      problems: (validate.errors ?? []).map((e) => `${e.instancePath || "/"}: ${e.message ?? "invalid"}`),
    };
  const judgment = data as Judgment;
  return { judgment, problems: problems(judgment) };
}

if (import.meta.main) {
  const { values, positionals } = parseArgs({ options: { out: { type: "string" } }, allowPositionals: true });
  if (positionals.length !== 1) {
    process.stderr.write("usage: node evals/juror.ts <learning.yaml> [--out <score.json>]\n");
    process.exit(2);
  }
  const { judgment, problems: found } = readJudgment(positionals[0] as string);
  if (!judgment || found.length) {
    process.stdout.write(found.join("\n") + "\n");
    process.exit(1);
  }
  const result = JSON.stringify(score(judgment), null, 2) + "\n";
  if (values.out) writeFileSync(values.out, result);
  process.stdout.write(result);
}
