// The eval runs on the page "Prompt engineering" (site/prompt-engineering/, https://lernapps.net/tooling/prompt-engineering/):
// built from the runs in evals/runs/<run>/, each with results.json (the numbers, written by evals/results.ts) and
// conclusions.yaml (what we concluded, written by people). The page holds every run as plain HTML that reads without
// JavaScript; its script turns the list into a choice of one run and compares it with another. Next to the page:
// runs.json (the index) and runs/<run>/results.json and conclusions.json, for machines.
// Fails, with one line per problem, when a conclusion names a cell, row, metric or finding the run does not have.
//
//   node evals/site.ts test          the check alone (test/evals.test.ts)
//   node evals/site.ts page <dir>    writes <dir>/index.html from the page's template and the data files (scripts/build.sh)
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import type { Results } from "./results.ts";
import type { Stat } from "./rows.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RUNS = join(ROOT, "evals", "runs");
const TEMPLATE = join(ROOT, "site", "prompt-engineering", "index.html");
const MARKER = "<!-- evals:runs -->";
const GITHUB = "https://github.com/lernapps/tooling";
const TASK_LABELS: Record<string, string> = {
  "quiz-fresh": "Quiz",
  "explainer-fresh": "Explainer",
  "interactive-fresh": "Interactive",
};
const STATUSES = ["open", "done", "dropped"] as const;

export interface Evidence {
  task: string;
  model: string;
  configuration?: string;
  row?: string;
  metric?: string;
}
export interface Conclusions {
  title: string;
  question: string;
  bottomLine: string[];
  findings: { id: string; title: string; text: string; evidence: Evidence[] }[];
  actions: { text: string; status: (typeof STATUSES)[number]; findings?: string[]; link?: string }[];
  notes?: string[];
}
export interface Run {
  id: string;
  results: Results;
  conclusions: Conclusions;
}

/** The runs in evals/runs/, newest first. */
export function runs(dir = RUNS): Run[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "results.json")))
    .map((entry) => ({
      id: entry.name,
      results: JSON.parse(readFileSync(join(dir, entry.name, "results.json"), "utf8")) as Results,
      conclusions: (existsSync(join(dir, entry.name, "conclusions.yaml"))
        ? parse(readFileSync(join(dir, entry.name, "conclusions.yaml"), "utf8"))
        : {}) as Conclusions,
    }))
    .sort((a, b) => b.results.dataDate.localeCompare(a.results.dataDate) || b.id.localeCompare(a.id));
}

/** The cell an evidence names: its configuration, or the run's first configuration that has the cell. */
const cellOf = (results: Results, evidence: Evidence) =>
  results.cells.find(
    (cell) =>
      cell.task === evidence.task &&
      cell.model === evidence.model &&
      (evidence.configuration === undefined || cell.configuration === evidence.configuration),
  );

/** One line per problem of a run; none when its files fit together. */
export function problems(run: Run): string[] {
  const found: string[] = [];
  const at = (where: string, what: string) => found.push(`${run.id}: ${where}: ${what}`);
  const { results, conclusions: c } = run;
  if (results.schema !== "results.v1") at("results.json", `schema ${String(results.schema)}, expected results.v1`);
  if (results.run !== run.id) at("results.json", `run ${results.run}, but the folder is ${run.id}`);
  if (!c.title || !c.question) at("conclusions.yaml", "needs a title and a question");
  if (!Array.isArray(c.bottomLine) || c.bottomLine.length === 0) at("conclusions.yaml", "needs a bottomLine");
  const ids = new Set<string>();
  for (const finding of c.findings ?? []) {
    if (ids.has(finding.id)) at(`finding ${finding.id}`, "its id is used twice");
    ids.add(finding.id);
    if (!finding.title || !finding.text) at(`finding ${finding.id}`, "needs a title and a text");
    for (const evidence of finding.evidence ?? []) {
      const name = `${evidence.task} · ${evidence.model}${evidence.configuration ? ` · ${evidence.configuration}` : ""}`;
      const cell = cellOf(results, evidence);
      if (!cell) at(`finding ${finding.id}`, `no cell ${name}`);
      else if (evidence.row && !cell.rows[evidence.row])
        at(`finding ${finding.id}`, `${name} has no row ${evidence.row}`);
      else if (evidence.metric && !cell.metrics[evidence.metric])
        at(`finding ${finding.id}`, `${name} has no metric ${evidence.metric}`);
      else if (!evidence.row && !evidence.metric) at(`finding ${finding.id}`, `${name}: name a row or a metric`);
    }
  }
  for (const action of c.actions ?? []) {
    if (!STATUSES.includes(action.status)) at(`action "${action.text}"`, `status ${String(action.status)}`);
    for (const id of action.findings ?? []) if (!ids.has(id)) at(`action "${action.text}"`, `no finding ${id}`);
  }
  return found;
}

// HTML

const esc = (text: string) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Text of the conclusions: `code` and [text](https://…) links, everything else escaped. */
const inline = (text: string) =>
  esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
const pct = (value: number) => `${Math.round(value * 100)}`;
const step = (value: number) => Math.max(0, Math.min(4, Math.floor(value * 5)));
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const cellId = (run: string, task: string, model: string, configuration: string, key: string) =>
  `${run}--${task}--${slug(model)}--${configuration}--${key}`;
const short = (commit = "") => commit.slice(0, 7);
const cfgLabel = (results: Results, id: string) => {
  const cfg = results.configurations[id] ?? {};
  return `guidance ${short(cfg.guidanceCommit)}`;
};
const number = (value: number, digits = 0) =>
  value.toLocaleString("en", { maximumFractionDigits: digits, minimumFractionDigits: digits });

/**
 * The tables of a run: one per guidance commit (with its creator model and Harbor), so that a harness updated during
 * the run does not split a table. Configurations stay apart where they share a task and model: no cell is mixed.
 */
export function tablesOf(results: Results): string[][] {
  const tables: string[][] = [];
  const keyOf = (id: string) => {
    const { harness: _h, harnessVersion: _v, ...rest } = results.configurations[id] ?? {};
    return JSON.stringify(rest);
  };
  const cellsOf = (ids: string[]) =>
    results.cells.filter((cell) => ids.includes(cell.configuration)).map((cell) => `${cell.task}|${cell.model}`);
  for (const id of Object.keys(results.configurations)) {
    const own = cellsOf([id]);
    const table = tables.find(
      (ids) => keyOf(ids[0] ?? "") === keyOf(id) && !cellsOf(ids).some((cell) => own.includes(cell)),
    );
    if (table) table.push(id);
    else tables.push([id]);
  }
  return tables;
}

const tableLabel = (results: Results, ids: string[]) => {
  const first = results.configurations[ids[0] ?? ""] ?? {};
  const versions = [...new Set(ids.map((id) => results.configurations[id]?.harnessVersion).flat())].join(", ");
  return `guidance ${short(first.guidanceCommit)} · ${first.harness ?? "?"} ${versions}`;
};

function heatmap(run: Run, ids: string[]): string {
  const { results } = run;
  const cells = results.cells.filter((cell) => ids.includes(cell.configuration));
  const tasks = [...new Set(cells.map((cell) => cell.task))];
  const models = [...new Set(cells.map((cell) => cell.model))];
  const head1 = tasks
    .map((task) => {
      const span = models.filter((model) => cells.some((c) => c.task === task && c.model === model)).length;
      return `<th scope="colgroup" colspan="${span}">${esc(TASK_LABELS[task] ?? task)}</th>`;
    })
    .join("");
  const columns = tasks.flatMap((task) =>
    models.filter((model) => cells.some((c) => c.task === task && c.model === model)).map((model) => ({ task, model })),
  );
  const head2 = columns
    .map(({ task, model }, index) => {
      const cell = cells.find((c) => c.task === task && c.model === model);
      const first = index === 0 || columns[index - 1]?.task !== task ? " first" : "";
      return `<th scope="col" class="m${first}"><span>${esc(model.split(" ")[0] ?? model)}</span><small>n=${cell?.n ?? 0}</small></th>`;
    })
    .join("");
  const body = (["process", "transcript"] as const)
    .map((group) => {
      const title = group === "process" ? "Process (plan, app, git)" : "Transcript (what the agent said and did)";
      const rows = results.rows
        .filter((row) => row.group === group && cells.some((cell) => cell.rows[row.id]))
        .map((row) => {
          const tds = columns
            .map(({ task, model }, index) => {
              const cell = cells.find((c) => c.task === task && c.model === model);
              const s = cell?.rows[row.id];
              const first = index === 0 || columns[index - 1]?.task !== task ? " first" : "";
              if (!cell || !s) return `<td class="na${first}">–</td>`;
              const tip =
                row.kind === "runs"
                  ? `${TASK_LABELS[task] ?? task} · ${model} · ${row.label}: ${Math.round(s.mean * s.n)} of ${s.n} runs`
                  : `${TASK_LABELS[task] ?? task} · ${model} · ${row.label}: mean ${pct(s.mean)} %, min ${pct(s.min)} %, max ${pct(s.max)} %, n = ${s.n}`;
              return `<td id="${esc(cellId(run.id, task, model, cell.configuration, row.id))}" class="h${step(s.mean)}${first}" data-key="${esc(`${task}|${model}|${row.id}`)}" data-mean="${s.mean}" data-tip="${esc(tip)}">${pct(s.mean)}</td>`;
            })
            .join("");
          return `<tr><th scope="row">${esc(row.label)} <small>${esc(row.expectations.join(", "))}</small></th>${tds}</tr>`;
        });
      if (rows.length === 0) return "";
      return `<tbody><tr class="group"><th scope="rowgroup" colspan="${1 + columns.length}">${title}</th></tr>${rows.join("")}</tbody>`;
    })
    .join("");
  return `<div class="scroll" tabindex="0" role="region" aria-label="${esc(`Heatmap of ${run.conclusions.title}, ${tableLabel(results, ids)}`)}"><table class="heatmap">
<caption>Share per run in percent (0–100), mean over the runs; darker is closer to the guidance. n = runs per cell.</caption>
<thead><tr><td></td>${head1}</tr><tr><th scope="col">Dimension <small>expectation</small></th>${head2}</tr></thead>
${body}
</table></div>`;
}

function numbers(run: Run): string {
  const { results } = run;
  const multi = Object.keys(results.configurations).length > 1;
  const fmt = (s: Stat | undefined, digits = 0, scale = 1) =>
    s ? `${number(s.mean / scale, digits)} (${number(s.min / scale, digits)}–${number(s.max / scale, digits)})` : "–";
  const rows = results.cells
    .map((cell) => {
      const m = cell.metrics;
      const id = (key: string) => esc(cellId(run.id, cell.task, cell.model, cell.configuration, key));
      return `<tr><td>${esc(TASK_LABELS[cell.task] ?? cell.task)}</td><td>${esc(cell.model)}${multi ? ` <small>${esc(cfgLabel(results, cell.configuration))}</small>` : ""}</td><td>${cell.n}</td><td id="${id("agent_minutes")}">${fmt(m["agent_minutes"])}</td><td id="${id("output_tokens")}">${fmt(m["output_tokens"], 0, 1000)}</td><td id="${id("creator_turns")}">${fmt(m["creator_turns"], 1)}</td><td id="${id("creator_turns_after_plan")}">${fmt(m["creator_turns_after_plan"], 1)}</td><td id="${id("questions_per_turn_max")}">${fmt(m["questions_per_turn_max"], 1)}</td></tr>`;
    })
    .join("");
  return `<details><summary>Minutes, tokens and turns per task and model</summary><div class="scroll" tabindex="0" role="region" aria-label="Minutes, tokens and turns"><table class="numbers">
<caption>Mean (min–max) per run. Output tokens in thousands, from the agent's session log.</caption>
<thead><tr><th scope="col">Task</th><th scope="col">Model</th><th scope="col">n</th><th scope="col">Agent minutes</th><th scope="col">Output tokens (k)</th><th scope="col">Creator turns</th><th scope="col">… after the plan</th><th scope="col">Questions in a turn, max</th></tr></thead>
<tbody>${rows}</tbody></table></div></details>`;
}

function evidenceLink(run: Run, evidence: Evidence): string {
  const cell = cellOf(run.results, evidence);
  if (!cell) return "";
  const key = evidence.row ?? evidence.metric ?? "";
  const row = run.results.rows.find((r) => r.id === evidence.row);
  const value = evidence.row ? cell.rows[evidence.row] : cell.metrics[evidence.metric ?? ""];
  const shown = !value ? "" : evidence.row ? ` ${pct(value.mean)} %` : ` ${number(value.mean, 1)}`;
  const label = `${TASK_LABELS[cell.task] ?? cell.task} · ${cell.model} · ${row?.label ?? key.replace(/_/g, " ")}${shown}`;
  return `<a href="#${esc(cellId(run.id, cell.task, cell.model, cell.configuration, key))}">${esc(label)}</a>`;
}

const STATUS_LABELS = { done: "Done", open: "Open", dropped: "Dropped" } as const;
const STATUS_MARKS = { done: "✓", open: "○", dropped: "✕" } as const;

function article(run: Run, previous: Run | undefined, all: Run[]): string {
  const { results, conclusions: c } = run;
  const configs = Object.entries(results.configurations);
  const [, first] = configs[0] ?? ["", {}];
  const guidance = [...new Set(configs.map(([, cfg]) => cfg.guidanceCommit ?? ""))]
    .map((commit) => `<a href="${GITHUB}/tree/${esc(commit)}">${esc(short(commit))}</a>`)
    .join(", ");
  const versions = [...new Set(configs.flatMap(([, cfg]) => [cfg.harnessVersion ?? ""].flat()))].join(", ");
  const compareWith = previous?.results.configurations["c1"]?.guidanceCommit;
  const diff =
    compareWith && first.guidanceCommit
      ? ` · <a href="${GITHUB}/compare/${esc(compareWith)}...${esc(first.guidanceCommit)}">guidance changes since ${esc(previous?.conclusions.title ?? "")}</a>`
      : "";
  const left = [
    ...results.excludedJobs.map(
      (job) =>
        `<li>${esc(TASK_LABELS[job.task] ?? job.task)} · ${esc(job.model)}: the whole job, ${inline(job.reason)}${job.replacedBy ? "; run again" : ""}</li>`,
    ),
    ...results.trials
      .filter((trial) => trial.status !== "valid" && !results.excludedJobs.some((job) => job.job === trial.job))
      .map(
        (trial) =>
          `<li>${esc(TASK_LABELS[trial.task] ?? trial.task)} · ${esc(trial.model)}, one run (${trial.status === "partial" ? "kept in part" : "left out"}): ${inline(trial.reason ?? "")}</li>`,
      ),
  ];
  const findings = c.findings
    .map(
      (f) =>
        `<li id="${esc(`${run.id}--finding--${f.id}`)}"><strong>${inline(f.title)}</strong><p>${inline(f.text)}</p>${f.evidence.length ? `<p class="evidence">Evidence: ${f.evidence.map((e) => evidenceLink(run, e)).join(" · ")}</p>` : ""}</li>`,
    )
    .join("");
  const action = (a: Conclusions["actions"][number]) => {
    const refs = (a.findings ?? [])
      .map(
        (id) =>
          `<a href="#${esc(`${run.id}--finding--${id}`)}">${esc(c.findings.find((f) => f.id === id)?.title ?? id)}</a>`,
      )
      .join(", ");
    return `<li>${inline(a.text)}${a.link ? ` <a href="${esc(a.link)}">${esc(a.link.replace(/^https:\/\/github\.com\/lernapps\//, ""))}</a>` : ""}${refs ? `<small>Because of: ${refs}</small>` : ""}</li>`;
  };
  const counts = STATUSES.map((status) => [status, c.actions.filter((a) => a.status === status)] as const).filter(
    ([, list]) => list.length > 0,
  );
  const actions = counts
    .map(
      ([status, list]) =>
        `<section class="actions ${status}" aria-label="${STATUS_LABELS[status]}"><h5><span class="mark" aria-hidden="true">${STATUS_MARKS[status]}</span>${STATUS_LABELS[status]} <span class="count">${list.length}</span></h5><ul>${list.map(action).join("")}</ul></section>`,
    )
    .join("");
  const others = all.filter((other) => other.id !== run.id);
  const compare = others.length
    ? `<div class="compare" hidden><label>Compare the heatmap with <select data-compare><option value="">no other run</option>${others.map((other) => `<option value="${esc(other.id)}"${other === previous ? " selected" : ""}>${esc(other.results.dataDate)} · ${esc(other.conclusions.title)}</option>`).join("")}</select></label><p class="compare-key" data-compare-key hidden>Each cell shows its value in this run and, below it, the change against <strong data-compare-name></strong> in points: <span class="up">▲</span> closer to the guidance, <span class="down">▼</span> further from it. A cell without a change has no value in the other run.</p></div>`
    : "";
  const cfg = first;
  return `<article class="run" id="run-${esc(run.id)}" data-run="${esc(run.id)}" aria-labelledby="run-${esc(run.id)}-h">
<h3 id="run-${esc(run.id)}-h">${esc(c.title)} <small>${esc(results.dataDate)}</small></h3>
<p class="meta">${results.totals["trials"]} runs · runs ${esc(results.runsFrom.slice(0, 16).replace("T", " "))} to ${esc(results.runsTo.slice(0, 16).replace("T", " "))} UTC · ${esc(cfg.harness ?? "?")} ${esc(versions)} · Harbor ${esc(cfg.harbor ?? "?")} · creator played by ${esc((cfg.userModel ?? "?").replace(/^.*claude-([a-z]+)-(\d+)-(\d+)$/, (_, m: string, a: string, b: string) => `${m[0]!.toUpperCase()}${m.slice(1)} ${a}.${b}`))} · guidance ${guidance}${diff} · <a href="runs/${esc(run.id)}/results.json">results.json</a> · <a href="runs/${esc(run.id)}/conclusions.json">conclusions.json</a></p>
<p class="question"><strong>Question:</strong> ${inline(c.question)}</p>
<section class="bottom-line" aria-label="Bottom line"><h4>Bottom line</h4><ul>${c.bottomLine.map((line) => `<li>${inline(line)}</li>`).join("")}</ul></section>
${compare}
${tablesOf(results)
  .map(
    (ids, _index, all) =>
      `<h4>${all.length > 1 ? `Results at ${esc(tableLabel(results, ids))}` : "Results"}</h4>${heatmap(run, ids)}`,
  )
  .join("\n")}
${numbers(run)}
<h4>Findings</h4><p class="note">What the numbers show. Each finding links the cells it rests on.</p><ol class="findings">${findings}</ol>
<h4>What we did about it</h4><p class="note">The changes these findings led to, and those still to do.</p>${actions}
${left.length ? `<h4>Left out</h4><ul class="left-out">${left.join("")}</ul>` : ""}
${c.notes?.length ? `<h4>Notes</h4><ul class="notes">${c.notes.map((note) => `<li>${inline(note)}</li>`).join("")}</ul>` : ""}
</article>`;
}

/** The list of runs, then each run: what the page shows between its marker. */
export function render(all: Run[]): string {
  const list = all
    .map((run) => {
      const r = run.results;
      const commits = [...new Set(Object.values(r.configurations).map((cfg) => short(cfg.guidanceCommit)))].join(", ");
      const open = run.conclusions.actions.filter((a) => a.status === "open").length;
      return `<li><a href="#run-${esc(run.id)}" data-run="${esc(run.id)}"><time datetime="${esc(r.dataDate)}">${esc(r.dataDate)}</time><strong>${esc(run.conclusions.title)}</strong><span>${r.totals["trials"]} runs · guidance ${esc(commits)} · ${open} open ${open === 1 ? "action" : "actions"}</span><span class="headline">${inline(run.conclusions.bottomLine[0] ?? "")}</span></a></li>`;
    })
    .join("");
  return `<div class="runs" data-runs>
<ol class="run-list" aria-label="Eval runs">${list}</ol>
${all.map((run, index) => article(run, all[index + 1], all)).join("\n")}
</div>`;
}

/** The page and its data files: index.html from the template, runs.json, and each run's results and conclusions. */
export function writePage(out: string, all = runs()): void {
  const template = readFileSync(TEMPLATE, "utf8");
  if (!template.includes(MARKER)) throw new Error(`${TEMPLATE}: the marker ${MARKER} is missing`);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "index.html"), template.replace(MARKER, render(all)));
  const index = all.map((run) => ({
    id: run.id,
    title: run.conclusions.title,
    dataDate: run.results.dataDate,
    guidanceCommits: [...new Set(Object.values(run.results.configurations).map((cfg) => cfg.guidanceCommit))],
    trials: run.results.totals["trials"],
    results: `runs/${run.id}/results.json`,
    conclusions: `runs/${run.id}/conclusions.json`,
  }));
  writeFileSync(join(out, "runs.json"), `${JSON.stringify(index, null, 2)}\n`);
  for (const run of all) {
    mkdirSync(join(out, "runs", run.id), { recursive: true });
    writeFileSync(join(out, "runs", run.id, "results.json"), `${JSON.stringify(run.results, null, 2)}\n`);
    writeFileSync(join(out, "runs", run.id, "conclusions.json"), `${JSON.stringify(run.conclusions, null, 2)}\n`);
  }
}

function main(argv: string[]): number {
  const [command, out] = argv;
  if (command !== "test" && !(command === "page" && out)) {
    process.stderr.write("usage: node evals/site.ts test | page <dir>\n");
    return 2;
  }
  const all = runs();
  const found = all.flatMap(problems);
  if (found.length > 0) {
    process.stderr.write(`${found.map((line) => `evals: ${line}`).join("\n")}\n`);
    return 1;
  }
  if (command === "page" && out) writePage(out, all);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
