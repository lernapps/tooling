// Compares a juror's judgment (learning.yaml) with labels of a known audit (calibration/<app>-audit.yaml): per page
// the start (explainer-learner-start) and the action (mean of explainer-representation-explained,
// explainer-control-purpose, explainer-text-figure-agree), rounded to a level; and whether each page with a blocker
// has a unit of explainer-text-figure-agree at level 0. evals/juror/calibration.md says what counts as calibrated.
//
//   node evals/juror/calibrate.ts <learning.yaml> <labels.yaml>
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import type { Judgment } from "../juror.ts";

interface Labels {
  pages: Record<string, { start: number; action: number; blockers?: string[] }>;
}
const ACTION = ["explainer-representation-explained", "explainer-control-purpose", "explainer-text-figure-agree"];

/** The page path as the labels write it: a leading and a trailing slash, no index.html. */
const norm = (page: string) => `/${page.replace(/^\/+|\/+$/g, "").replace(/\/?index\.html$/, "")}/`.replace("//", "/");

export function compare(judgment: Judgment, labels: Labels) {
  const rows = Object.entries(labels.pages).map(([page, label]) => {
    const units = judgment.units.filter((u) => norm(u.page) === norm(page));
    const mean = (items: string[]) => {
      const levels = units.filter((u) => items.includes(u.item)).map((u) => u.level as number);
      return levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : undefined;
    };
    const start = mean(["explainer-learner-start"]);
    const action = mean(ACTION);
    const blocker = units.some((u) => u.item === "explainer-text-figure-agree" && u.level === 0);
    return {
      page,
      start: { label: label.start, juror: start === undefined ? null : Math.round(start * 100) / 100 },
      action: { label: label.action, juror: action === undefined ? null : Math.round(action * 100) / 100 },
      blockers: label.blockers?.length ? { expected: label.blockers.length, found: blocker } : undefined,
    };
  });
  const within = (key: "start" | "action") =>
    rows.filter((r) => r[key].juror !== null && Math.abs((r[key].juror as number) - r[key].label) <= 1).length;
  const judged = (key: "start" | "action") => rows.filter((r) => r[key].juror !== null).length;
  const clearWhereUnclear = rows.filter((r) => r.action.label === 0 && (r.action.juror ?? 0) >= 1.5).map((r) => r.page);
  const withBlockers = rows.filter((r) => r.blockers);
  return {
    rows,
    summary: {
      pagesLabelled: rows.length,
      startWithinOne: `${within("start")}/${judged("start")}`,
      actionWithinOne: `${within("action")}/${judged("action")}`,
      clearWhereUnclear,
      blockersFound: `${withBlockers.filter((r) => r.blockers?.found).length}/${withBlockers.length}`,
    },
  };
}

if (import.meta.main) {
  const [file, labelsFile] = process.argv.slice(2);
  if (!file || !labelsFile) {
    process.stderr.write("usage: node evals/juror/calibrate.ts <learning.yaml> <labels.yaml>\n");
    process.exit(2);
  }
  const judgment = parse(readFileSync(file, "utf8")) as Judgment;
  const labels = parse(readFileSync(labelsFile, "utf8")) as Labels;
  process.stdout.write(JSON.stringify(compare(judgment, labels), null, 2) + "\n");
}
