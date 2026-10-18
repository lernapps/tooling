// The results page of the evals (site/evals/, https://lernapps.net/tooling/evals/): reads finished jobs and writes
// - site/evals/data.json: aggregates per task and model (n, mean, min and max of each dimension, agent minutes,
//   transcript numbers) and the run's configuration; no transcripts, no paths, no credentials;
// - the generated parts of site/evals/index.html, between `<!-- report:<name> -->` and `<!-- /report:<name> -->`:
//   the heatmap, the minutes per run, the stat tiles and the data date, as plain HTML that reads without JavaScript.
// One configuration (harness and version, Harbor, creator model, guidance commit) per page: the models differ only.
//   node evals/report.ts <job dir or jobs dir>... [--out site/evals]
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Configuration, jobsOf, trialNumbers } from "./summary.ts";

export const TASKS = ["quiz-fresh", "explainer-fresh", "interactive-fresh"] as const;
const TASK_LABELS: Record<string, string> = {
  "quiz-fresh": "Quiz",
  "explainer-fresh": "Explainer",
  "interactive-fresh": "Interactive",
};

/** A row of the heatmap: a share between 0 and 1 per trial, higher is what the guidance asks for. */
interface Row {
  id: string;
  label: string;
  group: "process" | "transcript";
  /** The dimension of reward.json or transcript-score.json it is read from (evals/expectations.json). */
  source: string;
  /** How the value reads in a tooltip: a mean share, or runs that meet a condition. */
  kind: "share" | "runs";
  value: (trial: Trial) => number | undefined;
}

interface Trial {
  numbers: Record<string, number>;
  /** An app was created (the create command ran) before the creator confirmed the plan. */
  createdBeforePlan: boolean;
  /** The verifier left the retrospective out because the run stopped before the listing checkpoint. */
  retrospectiveNa: boolean;
}

const threshold = (key: string, max: number) => (trial: Trial) => {
  const value = trial.numbers[key];
  return value === undefined ? undefined : value <= max ? 1 : 0;
};

export const ROWS: Row[] = [
  { id: "plan_boxes_ticked", label: "Plan boxes ticked", group: "process", source: "plan_boxes_ticked", kind: "share" },
  {
    id: "competencies_written",
    label: "Competencies written (“Ich kann …”)",
    group: "process",
    source: "competencies_written",
    kind: "runs",
  },
  {
    id: "app_content_filled",
    label: "Content guide filled (app-content)",
    group: "process",
    source: "app_content_filled",
    kind: "runs",
  },
  {
    id: "archetype_expected",
    label: "Archetype chosen right",
    group: "process",
    source: "archetype_expected",
    kind: "runs",
  },
  { id: "check_passes", label: "lernapps check passes", group: "process", source: "check_passes", kind: "runs" },
  { id: "phase_reached", label: "Phase reached", group: "process", source: "phase_reached", kind: "share" },
  { id: "committed_clean", label: "Committed clean", group: "process", source: "committed_clean", kind: "runs" },
].map((row): Row => ({ ...(row as Omit<Row, "value">), value: (trial: Trial) => trial.numbers[row.source] }));
ROWS.push(
  {
    id: "turns_after_plan_max_3",
    label: "At most 3 creator turns after the plan",
    group: "transcript",
    source: "creator_turns_after_plan",
    kind: "runs",
    value: threshold("t_creator_turns_after_plan", 3),
  },
  {
    id: "questions_max_2",
    label: "At most 2 questions in every turn",
    group: "transcript",
    source: "questions_per_turn_max",
    kind: "runs",
    value: threshold("t_questions_per_turn_max", 2),
  },
  {
    id: "not_created_before_plan",
    label: "No app created before the plan was confirmed",
    group: "transcript",
    source: "installs_before_plan",
    kind: "runs",
    value: (trial) => (trial.createdBeforePlan ? 0 : 1),
  },
  {
    id: "plan_template_read_raw",
    label: "Plan template read word for word",
    group: "transcript",
    source: "plan_template_read_raw",
    kind: "runs",
    value: (trial) => trial.numbers["t_plan_template_read_raw"],
  },
);

/** The numbers with min, mean and max per cell beside the heatmap. */
const METRICS: Record<string, string> = {
  agent_minutes: "agent_minutes",
  creator_turns: "t_creator_turns",
  creator_turns_after_plan: "t_creator_turns_after_plan",
  questions_per_turn_max: "t_questions_per_turn_max",
  questions_per_turn_mean: "t_questions_per_turn_mean",
  output_tokens: "t_agent_output_tokens",
  input_tokens: "t_agent_input_tokens",
  cache_read_tokens: "t_agent_cache_read_tokens",
};

interface Stat {
  mean: number;
  min: number;
  max: number;
  n: number;
}
export interface Cell {
  task: string;
  model: string;
  n: number;
  rows: Record<string, Stat>;
  metrics: Record<string, Stat>;
  /** Agent minutes of each run, sorted: the dots of the strip plot. */
  minutes: number[];
}
export interface Report {
  dataDate: string;
  runsFrom: string;
  runsTo: string;
  configuration: Omit<Configuration, "task" | "toolingCommit" | "model">;
  models: string[];
  tasks: string[];
  rows: { id: string; label: string; group: string; source: string; expectations: string[] }[];
  cells: Cell[];
  excluded: { task: string; model: string; reason: string }[];
  totals: Record<string, number>;
}

const readJson = <T>(path: string): T | undefined =>
  existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : undefined;
const round = (value: number, digits = 3) => Math.round(value * 10 ** digits) / 10 ** digits;
const stat = (values: number[]): Stat | undefined =>
  values.length === 0
    ? undefined
    : {
        mean: round(values.reduce((sum, value) => sum + value, 0) / values.length),
        min: round(Math.min(...values)),
        max: round(Math.max(...values)),
        n: values.length,
      };
/** "anthropic/claude-haiku-5-5" → "Haiku 5.5". */
export const modelLabel = (model: string) => {
  const match = /claude-([a-z]+)-(\d+)-(\d+)/.exec(model);
  return match ? `${match[1]![0]!.toUpperCase()}${match[1]!.slice(1)} ${match[2]}.${match[3]}` : model;
};
const MODEL_ORDER = ["haiku", "sonnet", "opus"];
const modelRank = (model: string) => {
  const rank = MODEL_ORDER.findIndex((name) => model.includes(name));
  return rank < 0 ? MODEL_ORDER.length : rank;
};

function readTrial(dir: string): Trial {
  const numbers = trialNumbers(dir);
  const transcript = readJson<{ evidence?: { installsBeforePlan?: string[] } }>(join(dir, "transcript-score.json"));
  // The transcript score counts every install before the plan; here only the create command counts, judged by the
  // command's first line (a plan file written with a heredoc may quote a command without running it).
  const createdBeforePlan = (transcript?.evidence?.installsBeforePlan ?? []).some((command) =>
    /create --archetype|lernapps create/.test(command.split("\n")[0] ?? ""),
  );
  const reward = readJson<Record<string, unknown>>(join(dir, "verifier", "reward.json")) ?? {};
  const original = readJson<Record<string, unknown>>(join(dir, "verifier", "reward.orig.json"));
  const retrospectiveNa = !("retrospective_filled" in reward) && original !== undefined;
  return { numbers, createdBeforePlan, retrospectiveNa };
}

export function report(jobDirs: string[], expectations: Record<string, Record<string, string[]>>): Report {
  const byCell = new Map<string, { task: string; model: string; trials: Trial[] }>();
  const excluded: Report["excluded"] = [];
  const configurations = new Set<string>();
  let configuration: Report["configuration"] = {};
  const times: string[] = [];
  for (const job of jobDirs) {
    const {
      task = "?",
      model = "?",
      toolingCommit: _tooling,
      ...rest
    } = readJson<Configuration>(join(job, "configuration.json")) ?? {};
    if (existsSync(join(job, "excluded.txt"))) {
      excluded.push({ task, model: modelLabel(model), reason: readFileSync(join(job, "excluded.txt"), "utf8").trim() });
      continue;
    }
    configurations.add(JSON.stringify(rest));
    configuration = rest;
    const key = `${task} ${model}`;
    const cell = byCell.get(key) ?? { task, model, trials: [] };
    byCell.set(key, cell);
    for (const name of readdirSync(job).sort()) {
      const dir = join(job, name);
      if (!statSync(dir).isDirectory() || !existsSync(join(dir, "result.json"))) continue;
      cell.trials.push(readTrial(dir));
      const result = readJson<{ started_at?: string; finished_at?: string }>(join(dir, "result.json"));
      if (result?.started_at) times.push(result.started_at);
      if (result?.finished_at) times.push(result.finished_at);
    }
  }
  if (configurations.size > 1) {
    throw new Error(
      `jobs of ${configurations.size} configurations; the page shows one:\n${[...configurations].join("\n")}`,
    );
  }
  const cells: Cell[] = [...byCell.values()]
    .sort(
      (a, b) =>
        TASKS.indexOf(a.task as (typeof TASKS)[number]) - TASKS.indexOf(b.task as (typeof TASKS)[number]) ||
        modelRank(a.model) - modelRank(b.model),
    )
    .map(({ task, model, trials }) => {
      const rows: Record<string, Stat> = {};
      for (const row of ROWS) {
        const values = trials.map(row.value).filter((value): value is number => value !== undefined);
        const s = stat(values);
        if (s) rows[row.id] = s;
      }
      const metrics: Record<string, Stat> = {};
      for (const [name, key] of Object.entries(METRICS)) {
        const values = trials
          .map((trial) => trial.numbers[key])
          .filter((value): value is number => value !== undefined);
        const s = stat(values.map((value) => round(value, 2)));
        if (s) metrics[name] = s;
      }
      const minutes = trials
        .map((trial) => trial.numbers["agent_minutes"])
        .filter((value): value is number => value !== undefined)
        .map((value) => round(value, 1))
        .sort((a, b) => a - b);
      return { task, model: modelLabel(model), n: trials.length, rows, metrics, minutes };
    });
  const all = [...byCell.values()].flatMap((cell) => cell.trials);
  const count = (predicate: (trial: Trial) => boolean) => all.filter(predicate).length;
  const sorted = times.sort();
  return {
    dataDate: (sorted.at(-1) ?? "").slice(0, 10),
    runsFrom: sorted[0] ?? "",
    runsTo: sorted.at(-1) ?? "",
    configuration,
    models: [...new Set(cells.map((cell) => cell.model))],
    tasks: TASKS.filter((task) => cells.some((cell) => cell.task === task)),
    rows: ROWS.map(({ id, label, group, source }) => ({
      id,
      label,
      group,
      source,
      expectations: (group === "process" ? expectations["reward"] : expectations["transcript"])?.[source] ?? [],
    })),
    cells,
    excluded,
    totals: {
      trials: all.length,
      checkPasses: count((trial) => trial.numbers["check_passes"] === 1),
      hookBypasses: count((trial) => trial.numbers["t_no_verify_bypass"] === 0),
      prePushFailures: all.reduce((sum, trial) => sum + (trial.numbers["pre_push_failures"] ?? 0), 0),
      summaryFetchRuns: count((trial) => (trial.numbers["t_guidance_summary_fetches"] ?? 0) > 0),
      planTemplateRawRuns: count((trial) => trial.numbers["t_plan_template_read_raw"] === 1),
      createdBeforePlanRuns: count((trial) => trial.createdBeforePlan),
      installsBeforePlanRuns: count((trial) => (trial.numbers["t_installs_before_plan"] ?? 0) > 0),
      retrospectiveNa: count((trial) => trial.retrospectiveNa),
      agentHours: round(all.reduce((sum, trial) => sum + (trial.numbers["agent_minutes"] ?? 0), 0) / 60, 1),
      creatorTurnsMedian: median(all.map((trial) => trial.numbers["t_creator_turns"] ?? 0)),
    },
  };
}

const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? (s[mid] ?? 0) : ((s[mid - 1] ?? 0) + (s[mid] ?? 0)) / 2;
};

// HTML

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pct = (value: number) => `${Math.round(value * 100)}`;
/** The step of the sequential ramp for a share, in five bins of 20 points; the page's CSS colours .h0 to .h4. */
const step = (value: number) => Math.max(0, Math.min(4, Math.floor(value * 5)));

function tip(row: Row, cell: Cell, s: Stat) {
  const head = `${TASK_LABELS[cell.task] ?? cell.task} · ${cell.model} · ${row.label}`;
  if (row.kind === "runs") return `${head}: ${Math.round(s.mean * s.n)} of ${s.n} runs`;
  return `${head}: mean ${pct(s.mean)} %, min ${pct(s.min)} %, max ${pct(s.max)} %, n = ${s.n}`;
}

export function heatmapHtml(data: Report): string {
  const cellOf = (task: string, model: string) => data.cells.find((c) => c.task === task && c.model === model);
  const head1 = data.tasks
    .map((task) => `<th scope="colgroup" colspan="${data.models.length}">${esc(TASK_LABELS[task] ?? task)}</th>`)
    .join("");
  const head2 = data.tasks
    .flatMap((task) =>
      data.models.map((model) => {
        const n = cellOf(task, model)?.n ?? 0;
        return `<th scope="col" class="m${data.models.indexOf(model) === 0 ? " first" : ""}"><span>${esc(model.split(" ")[0] ?? model)}</span><small>n=${n}</small></th>`;
      }),
    )
    .join("");
  const body = (["process", "transcript"] as const)
    .map((group) => {
      const title = group === "process" ? "Process (plan, app, git)" : "Transcript (what the agent said and did)";
      const rows = ROWS.filter((row) => row.group === group).map((row) => {
        const meta = data.rows.find((r) => r.id === row.id);
        const cells = data.tasks
          .flatMap((task) =>
            data.models.map((model, index) => {
              const cell = cellOf(task, model);
              const s = cell?.rows[row.id];
              const first = index === 0 ? " first" : "";
              if (!cell || !s) return `<td class="na${first}">–</td>`;
              return `<td class="h${step(s.mean)}${first}" data-tip="${esc(tip(row, cell, s))}">${pct(s.mean)}</td>`;
            }),
          )
          .join("");
        return `<tr><th scope="row">${esc(row.label)} <small>${esc((meta?.expectations ?? []).join(", "))}</small></th>${cells}</tr>`;
      });
      const span = 1 + data.tasks.length * data.models.length;
      return `<tbody><tr class="group"><th scope="rowgroup" colspan="${span}">${title}</th></tr>${rows.join("")}</tbody>`;
    })
    .join("");
  return `<table class="heatmap">
<caption>Share per run in percent (0–100), mean over the runs; darker is closer to the guidance. n = runs per cell.</caption>
<thead><tr><td></td>${head1}</tr><tr><th scope="col">Dimension <small>expectation</small></th>${head2}</tr></thead>
${body}
</table>`;
}

export function durationsHtml(data: Report): string {
  const max = Math.max(...data.cells.flatMap((cell) => cell.minutes));
  const axisMax = Math.ceil(max / 15) * 15;
  const x = (value: number) => `${round((value / axisMax) * 100, 2)}%`;
  const ticks = Array.from({ length: axisMax / 15 + 1 }, (_, i) => i * 15);
  const groups = data.tasks
    .map((task) => {
      const rows = data.models
        .map((model) => {
          const cell = data.cells.find((c) => c.task === task && c.model === model);
          if (!cell) return "";
          const mean = cell.metrics["agent_minutes"]?.mean ?? 0;
          const label = `${TASK_LABELS[task]}, ${model}: ${cell.minutes.length} runs, ${cell.minutes.join(", ")} minutes, mean ${round(mean, 1)}`;
          const dots = cell.minutes
            .map(
              (m) =>
                `<span class="dot" style="left:${x(m)}" data-tip="${esc(`${TASK_LABELS[task]} · ${model}: ${m} min`)}"></span>`,
            )
            .join("");
          return `<div class="strip-row"><span class="strip-label">${esc(model)}</span><span class="track" role="img" aria-label="${esc(label)}"><span class="mean" style="left:${x(mean)}" data-tip="${esc(`${TASK_LABELS[task]} · ${model}: mean ${round(mean, 1)} min`)}"></span>${dots}</span><span class="strip-value">⌀ ${Math.round(mean)}</span></div>`;
        })
        .join("");
      return `<div class="strip-group"><p class="strip-task">${esc(TASK_LABELS[task] ?? task)}</p>${rows}</div>`;
    })
    .join("");
  const axis = `<div class="strip-row axis" aria-hidden="true"><span class="strip-label"></span><span class="track">${ticks
    .map((t) => `<span class="tick" style="left:${x(t)}">${t}</span>`)
    .join("")}</span><span class="strip-value">min</span></div>`;
  const grid = `<div class="strip-grid" aria-hidden="true">${ticks.map((t) => `<span style="left:${x(t)}"></span>`).join("")}</div>`;
  const table = data.cells
    .map((cell) => {
      const m = cell.metrics;
      const f = (name: string, digits = 0) => {
        const s = m[name];
        return s ? `${round(s.mean, digits)} (${round(s.min, digits)}–${round(s.max, digits)})` : "–";
      };
      return `<tr><td>${esc(TASK_LABELS[cell.task] ?? cell.task)}</td><td>${esc(cell.model)}</td><td>${cell.n}</td><td>${f("agent_minutes")}</td><td>${f("creator_turns", 1)}</td><td>${f("creator_turns_after_plan", 1)}</td><td>${f("questions_per_turn_max", 1)}</td></tr>`;
    })
    .join("");
  return `<div class="strip">${grid}${groups}${axis}</div>
<details>
<summary>Table: minutes and transcript numbers per task and model</summary>
<div class="scroll" tabindex="0" role="region" aria-label="Table of minutes and transcript numbers"><table class="numbers">
<thead><tr><th scope="col">Task</th><th scope="col">Model</th><th scope="col">n</th><th scope="col">Agent minutes, mean (min–max)</th><th scope="col">Creator turns</th><th scope="col">Creator turns after the plan</th><th scope="col">Most questions in one turn</th></tr></thead>
<tbody>${table}</tbody>
</table></div>
</details>`;
}

/** Today's cost per task and model, the reference for a later variant of the guidance. */
export function baselineHtml(data: Report): string {
  const k = (s: Stat | undefined) => (s ? `${Math.round(s.mean / 1000).toLocaleString("en")}k` : "–");
  const n1 = (s: Stat | undefined) => (s ? `${round(s.mean, 1)}` : "–");
  const rows = data.cells
    .map((cell) => {
      const m = cell.metrics;
      return `<tr><td>${esc(TASK_LABELS[cell.task] ?? cell.task)}</td><td>${esc(cell.model)}</td><td>${cell.n}</td><td>${k(m["input_tokens"])}</td><td>${k(m["cache_read_tokens"])}</td><td>${k(m["output_tokens"])}</td><td>${n1(m["agent_minutes"])}</td><td>${n1(m["creator_turns"])}</td></tr>`;
    })
    .join("");
  return `<div class="scroll" tabindex="0" role="region" aria-label="Cost baseline per task and model"><table class="numbers">
<caption>Mean per run. Tokens of the agent under test, summed from its session log (not Harbor's numbers); k = thousand.</caption>
<thead><tr><th scope="col">Task</th><th scope="col">Model</th><th scope="col">n</th><th scope="col">Input tokens</th><th scope="col">Cache-read tokens</th><th scope="col">Output tokens</th><th scope="col">Agent minutes</th><th scope="col">Creator turns</th></tr></thead>
<tbody>${rows}</tbody>
</table></div>`;
}

export function tilesHtml(data: Report): string {
  const t = data.totals;
  const tiles: [string, string][] = [
    [`${t["checkPasses"]} of ${t["trials"]}`, "runs where <code>lernapps check</code> passed at the end"],
    [`${t["hookBypasses"]}`, `runs that bypassed a git hook; ${t["prePushFailures"]} failed pre-push runs counted`],
    [
      `${t["summaryFetchRuns"]} of ${t["trials"]}`,
      `runs that read guidance through a summarising fetch tool at least once (${t["planTemplateRawRuns"]} also read the plan template word for word)`,
    ],
    [`${t["agentHours"]} h`, `agent time in all runs; median ${t["creatorTurnsMedian"]} creator turns per run`],
  ];
  return `<ul class="tiles">${tiles.map(([value, label]) => `<li><strong>${value}</strong><span>${label}</span></li>`).join("")}</ul>`;
}

export function dateHtml(data: Report): string {
  const c = data.configuration;
  return `<p class="meta">Data of ${esc(data.dataDate)} (runs ${esc(data.runsFrom.slice(0, 16).replace("T", " "))} to ${esc(data.runsTo.slice(0, 16).replace("T", " "))} UTC) · ${data.totals["trials"]} runs · ${esc(c.harness ?? "?")} ${esc(String(c.harnessVersion ?? "?"))} · Harbor ${esc(c.harbor ?? "?")} · creator played by ${esc(modelLabel(c.userModel ?? "?"))} · guidance <a href="https://github.com/lernapps/tooling/tree/${esc(c.guidanceCommit ?? "")}">${esc((c.guidanceCommit ?? "?").slice(0, 7))}</a> · <a href="data.json">data.json</a></p>`;
}

/** Replaces the generated parts of the page, each between its two markers. */
export function fill(page: string, parts: Record<string, string>): string {
  let result = page;
  for (const [name, html] of Object.entries(parts)) {
    const start = `<!-- report:${name} -->`;
    const end = `<!-- /report:${name} -->`;
    const from = result.indexOf(start);
    const to = result.indexOf(end);
    if (from < 0 || to < from) throw new Error(`markers of ${name} missing in the page`);
    result = `${result.slice(0, from + start.length)}\n${html}\n${result.slice(to)}`;
  }
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const out = outIndex >= 0 ? (args[outIndex + 1] ?? "site/evals") : "site/evals";
  const paths = outIndex >= 0 ? args.filter((_, index) => index !== outIndex && index !== outIndex + 1) : args;
  if (paths.length === 0) {
    process.stderr.write("Usage: node evals/report.ts <job dir or jobs dir>... [--out site/evals]\n");
    process.exit(2);
  }
  const expectations = JSON.parse(readFileSync(new URL("expectations.json", import.meta.url), "utf8")) as Record<
    string,
    Record<string, string[]>
  >;
  const data = report(paths.flatMap(jobsOf), expectations);
  writeFileSync(join(out, "data.json"), `${JSON.stringify(data, null, 2)}\n`);
  const page = join(out, "index.html");
  writeFileSync(
    page,
    fill(readFileSync(page, "utf8"), {
      date: dateHtml(data),
      tiles: tilesHtml(data),
      heatmap: heatmapHtml(data),
      durations: durationsHtml(data),
      baseline: baselineHtml(data),
    }),
  );
  process.stdout.write(`wrote ${join(out, "data.json")} and the generated parts of ${page}\n`);
}
