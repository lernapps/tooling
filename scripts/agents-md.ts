// Writes the table of the process rules into guidance/AGENTS.md, between its markers, from the rule blocks of
// guidance/workflow-rules.md: one row per rule with its id, its title and what it asks, so that the file every app
// gets (and the end of https://lernapps.net/tooling/llms.txt) holds every rule of the process in a few lines.
// workflow-rules.md stays the source: its full text is what the rule page, the checks and the review read.
//
//   node scripts/agents-md.ts           rewrite the table
//   node scripts/agents-md.ts --check   exit 1 when the table is not the one the rules give (the tests run it)
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const RULES = resolve(ROOT, "guidance/workflow-rules.md");
const AGENTS = resolve(ROOT, "guidance/AGENTS.md");
const BEGIN = "<!-- process rules: written by scripts/agents-md.ts from guidance/workflow-rules.md -->";
const END = "<!-- end of the process rules -->";

export interface ProcessRule {
  id: string;
  title: string;
  severity: string;
  points: string[];
}

/** The rules of workflow-rules.md in order: heading "### `id`: Title", its rule block, its bullet points. */
export function processRules(text = readFileSync(RULES, "utf8")): ProcessRule[] {
  const sections = text.split(/^### /m).slice(1);
  return sections.map((section) => {
    const heading = /^`([a-z0-9-]+)`: (.+)$/m.exec(section);
    if (!heading) throw new Error(`workflow-rules.md: a rule heading without "\`id\`: Title": ${section.slice(0, 60)}`);
    const severity = /^severity: (\w+)$/m.exec(section)?.[1] ?? "hint";
    const body = section.split(/^## /m)[0] ?? "";
    const points: string[] = [];
    for (const line of body.split("\n")) {
      if (line.startsWith("- ")) points.push(line.slice(2).trim());
      else if (/^ {2}\S/.test(line) && points.length) points[points.length - 1] += ` ${line.trim()}`;
    }
    return { id: heading[1] as string, title: (heading[2] as string).trim(), severity, points };
  });
}

const cell = (text: string) => text.replace(/\|/g, "\\|");

/** The table, one row per rule. */
export function table(rules = processRules()): string {
  // the examples stay in workflow-rules.md: the table holds what to do
  const rows = rules.map(
    (r) => `| \`${r.id}\` | ${cell(r.title)} | ${cell(r.points.filter((p) => !p.startsWith("Example")).join(" "))} |`,
  );
  return [BEGIN, "", "| Rule | What | What to do |", "|---|---|---|", ...rows, "", END].join("\n");
}

/** AGENTS.md with the table between its markers. */
export function withTable(agents = readFileSync(AGENTS, "utf8"), rules = processRules()): string {
  const start = agents.indexOf(BEGIN);
  const end = agents.indexOf(END);
  if (start < 0 || end < start) throw new Error(`guidance/AGENTS.md has no markers ${BEGIN} … ${END}`);
  return agents.slice(0, start) + table(rules) + agents.slice(end + END.length);
}

if (import.meta.main) {
  const next = withTable();
  if (process.argv.includes("--check")) {
    if (next !== readFileSync(AGENTS, "utf8")) {
      process.stdout.write(
        "guidance/AGENTS.md: the process rules are not those of guidance/workflow-rules.md; run node scripts/agents-md.ts\n",
      );
      process.exit(1);
    }
  } else writeFileSync(AGENTS, next);
}
