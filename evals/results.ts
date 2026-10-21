// The results of one eval run (a matrix of tasks and models, run together) as one file, evals/runs/<run>/results.json:
// the configurations, a cell per task, model and configuration (n, mean, min and max of every row and metric, the agent
// minutes of each trial), every trial with its numbers and status, and what was left out and why. The page of the
// evals (site/prompt-engineering/) is built from these files and the run's conclusions.yaml; the numbers are never
// written by hand. No transcripts, paths of the machine or credentials: only numbers, names and reasons.
//
// What is left out, and why (each with its reason in the file):
// - a job with excluded.txt: ruled out by the orchestrator (a harness fault, not the agent's);
// - a trial that hit the subscription's usage limit (HTTP 429) or broke off before its agent started: not a result;
//   a job whose trials were all left out is listed with the job of the same task, model and configuration that
//   replaced it, if any;
// - a trial whose verifier crashed stays a result of the agent, without the verifier's numbers ("partial").
// Trials of different configurations (harness and version, Harbor, creator model, guidance commit) are never mixed.
//
//   node evals/results.ts <run id> <job dir or jobs dir>... [--out evals/runs/<run id>/results.json]
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  type Cell,
  METRICS,
  ROWS,
  TASKS,
  modelLabel,
  modelRank,
  readTrial,
  round,
  stat,
  type Stat,
  type Trial,
} from "./report.ts";
import { type Configuration, jobsOf } from "./summary.ts";

export const SCHEMA = "results.v1";

export interface TrialRecord {
  job: string;
  trial: string;
  task: string;
  model: string;
  configuration: string;
  /** valid: a result; partial: a result without the verifier's numbers; excluded: not a result. */
  status: "valid" | "partial" | "excluded";
  reason?: string;
  startedAt?: string;
  numbers: Record<string, number>;
}

export interface Results {
  schema: typeof SCHEMA;
  run: string;
  dataDate: string;
  runsFrom: string;
  runsTo: string;
  /** id → what was tested; a cell names its configuration. */
  configurations: Record<string, Omit<Configuration, "task" | "toolingCommit" | "model">>;
  rows: { id: string; label: string; group: string; source: string; kind: string; expectations: string[] }[];
  cells: (Cell & { configuration: string })[];
  trials: TrialRecord[];
  excludedJobs: { job: string; task: string; model: string; reason: string; replacedBy?: string }[];
  totals: Record<string, number>;
}

const readJson = <T>(path: string): T | undefined =>
  existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : undefined;

/**
 * A sign of the subscription's usage limit in what a trial wrote: Harbor's exception, the trial's log or the agent's
 * logs. Only the API's own error names: the guidance itself speaks of HTTP 429 on a link, which is no such sign.
 */
const USAGE_LIMIT = /usage_limit_reached|rate_limit_error/;

/** The text files of a directory, recursively (the agent's logs are a few megabytes at most). */
function textsUnder(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    const stats = statSync(path, { throwIfNoEntry: false });
    if (!stats) return [];
    if (stats.isDirectory()) return textsUnder(path);
    return /\.(jsonl?|log|txt)$/.test(name) && stats.size < 50 * 1024 * 1024 ? [readFileSync(path, "utf8")] : [];
  });
}

interface HarborTrial {
  exception_info?: { exception_type?: string; exception_message?: string } | null;
  started_at?: string;
  finished_at?: string;
  agent_execution?: { started_at?: string | null } | null;
}

/** Why a trial is not a result, or undefined when it is one. */
export function exclusionOf(trial: string): string | undefined {
  const result = readJson<HarborTrial>(join(trial, "result.json"));
  const exception = result?.exception_info;
  const texts = [JSON.stringify(exception ?? ""), ...textsUnder(join(trial, "agent"))];
  if (existsSync(join(trial, "trial.log"))) texts.push(readFileSync(join(trial, "trial.log"), "utf8"));
  if (texts.some((text) => USAGE_LIMIT.test(text))) return "the subscription's usage limit (HTTP 429)";
  if (exception && !result?.agent_execution?.started_at) {
    return `broke off before the agent started (${exception.exception_type ?? "exception"})`;
  }
  return undefined;
}

/** Whether the verifier of a trial crashed: no reward, or the verifier's own error flag. */
export function verifierCrashed(trial: string): boolean {
  const reward = readJson<Record<string, unknown>>(join(trial, "verifier", "reward.json"));
  return reward === undefined || reward["verifier_error"] === 1;
}

/** The numbers that come from Harbor, not from the verifier: kept when the verifier crashed, like the transcript's. */
const HARBOR_NUMBERS = new Set(["agent_minutes", "input_tokens", "cache_tokens", "output_tokens", "cost_usd"]);

/** When a job ran: the stamp that ends its name (`<task>__<model>__g<commit>__<stamp>`), else its name. */
const stampOf = (job: string) => job.split("/").filter(Boolean).at(-1)?.split("__").at(-1) ?? job;

export function results(
  run: string,
  jobDirs: string[],
  expectations: Record<string, Record<string, string[]>>,
): Results {
  const configurations: Results["configurations"] = {};
  const configId = (configuration: Results["configurations"][string]) => {
    const key = JSON.stringify(configuration);
    const found = Object.entries(configurations).find(([, value]) => JSON.stringify(value) === key);
    if (found) return found[0];
    const id = `c${Object.keys(configurations).length + 1}`;
    configurations[id] = configuration;
    return id;
  };
  const trials: TrialRecord[] = [];
  const kept = new Map<TrialRecord, Trial>();
  const excludedJobs: Results["excludedJobs"] = [];
  const times: string[] = [];
  for (const job of [...jobDirs].sort((a, b) => stampOf(a).localeCompare(stampOf(b)))) {
    const name = job.split("/").filter(Boolean).at(-1) ?? job;
    const {
      task = "?",
      model = "?",
      toolingCommit: _tooling,
      ...configuration
    } = readJson<Configuration>(join(job, "configuration.json")) ?? {};
    const excludedTxt = join(job, "excluded.txt");
    if (existsSync(excludedTxt)) {
      excludedJobs.push({
        job: name,
        task,
        model: modelLabel(model),
        reason: readFileSync(excludedTxt, "utf8").trim(),
      });
      continue;
    }
    const id = configId(configuration);
    const jobTrials: TrialRecord[] = [];
    for (const trialName of readdirSync(job).sort()) {
      const dir = join(job, trialName);
      if (!statSync(dir).isDirectory() || !existsSync(join(dir, "result.json"))) continue;
      const result = readJson<HarborTrial>(join(dir, "result.json"));
      const reason = exclusionOf(dir);
      const crashed = !reason && verifierCrashed(dir);
      const trial = readTrial(dir);
      const numbers = Object.fromEntries(
        Object.entries(trial.numbers)
          .filter(([key]) => !crashed || key.startsWith("t_") || HARBOR_NUMBERS.has(key))
          .map(([key, value]) => [key, round(value, 3)]),
      );
      const record: TrialRecord = {
        job: name,
        trial: trialName,
        task,
        model: modelLabel(model),
        configuration: id,
        status: reason ? "excluded" : crashed ? "partial" : "valid",
        ...(reason ? { reason } : crashed ? { reason: "the verifier crashed; its numbers are left out" } : {}),
        ...(result?.started_at ? { startedAt: result.started_at } : {}),
        numbers,
      };
      jobTrials.push(record);
      if (!reason) {
        kept.set(record, crashed ? { ...trial, numbers } : trial);
        if (result?.started_at) times.push(result.started_at);
        if (result?.finished_at) times.push(result.finished_at);
      }
    }
    trials.push(...jobTrials);
    if (jobTrials.length > 0 && jobTrials.every((trial) => trial.status === "excluded")) {
      excludedJobs.push({ job: name, task, model: modelLabel(model), reason: jobTrials[0]?.reason ?? "" });
    }
  }
  // A left-out job is replaced by a later job of the same task, model and configuration that has results.
  for (const excluded of excludedJobs) {
    const replacement = trials.find(
      (trial) =>
        trial.status !== "excluded" &&
        trial.task === excluded.task &&
        trial.model === excluded.model &&
        stampOf(trial.job) > stampOf(excluded.job) &&
        trials.find((other) => other.job === excluded.job)?.configuration === trial.configuration,
    );
    if (replacement) excluded.replacedBy = replacement.job;
  }

  const byCell = new Map<string, { task: string; model: string; configuration: string; trials: Trial[] }>();
  for (const [record, trial] of kept) {
    const key = `${record.task}|${record.model}|${record.configuration}`;
    const cell = byCell.get(key) ?? {
      task: record.task,
      model: record.model,
      configuration: record.configuration,
      trials: [],
    };
    byCell.set(key, cell);
    cell.trials.push(trial);
  }
  const cells = [...byCell.values()]
    .sort(
      (a, b) =>
        TASKS.indexOf(a.task as (typeof TASKS)[number]) - TASKS.indexOf(b.task as (typeof TASKS)[number]) ||
        modelRank(a.model.toLowerCase()) - modelRank(b.model.toLowerCase()) ||
        a.configuration.localeCompare(b.configuration),
    )
    .map(({ task, model, configuration, trials: cellTrials }) => {
      const rows: Record<string, Stat> = {};
      for (const row of ROWS) {
        const s = stat(cellTrials.map(row.value).filter((value): value is number => value !== undefined));
        if (s) rows[row.id] = s;
      }
      const metrics: Record<string, Stat> = {};
      for (const [metric, key] of Object.entries(METRICS)) {
        const s = stat(
          cellTrials.map((trial) => trial.numbers[key]).filter((value): value is number => value !== undefined),
        );
        if (s) metrics[metric] = s;
      }
      const minutes = cellTrials
        .map((trial) => trial.numbers["agent_minutes"])
        .filter((value): value is number => value !== undefined)
        .map((value) => round(value, 1))
        .sort((a, b) => a - b);
      return { task, model, configuration, n: cellTrials.length, rows, metrics, minutes };
    });

  const all = [...kept.values()];
  const count = (predicate: (trial: Trial) => boolean) => all.filter(predicate).length;
  const sorted = times.sort();
  return {
    schema: SCHEMA,
    run,
    dataDate: (sorted.at(-1) ?? "").slice(0, 10),
    runsFrom: sorted[0] ?? "",
    runsTo: sorted.at(-1) ?? "",
    configurations,
    rows: ROWS.map(({ id, label, group, source, kind }) => ({
      id,
      label,
      group,
      source,
      kind,
      expectations: (group === "process" ? expectations["reward"] : expectations["transcript"])?.[source] ?? [],
    })),
    cells,
    trials,
    excludedJobs,
    totals: {
      trials: all.length,
      excludedTrials: trials.filter((trial) => trial.status === "excluded").length,
      partialTrials: trials.filter((trial) => trial.status === "partial").length,
      checkPasses: count((trial) => trial.numbers["check_passes"] === 1),
      agentHours: round(all.reduce((sum, trial) => sum + (trial.numbers["agent_minutes"] ?? 0), 0) / 60, 1),
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const [run, ...rest] = outIndex >= 0 ? args.filter((_, index) => index !== outIndex && index !== outIndex + 1) : args;
  if (!run || rest.length === 0) {
    process.stderr.write("Usage: node evals/results.ts <run id> <job dir or jobs dir>... [--out <results.json>]\n");
    process.exit(2);
  }
  const out = outIndex >= 0 ? (args[outIndex + 1] ?? "") : join("evals", "runs", run, "results.json");
  const expectations = JSON.parse(readFileSync(new URL("expectations.json", import.meta.url), "utf8")) as Record<
    string,
    Record<string, string[]>
  >;
  const data = results(run, rest.flatMap(jobsOf), expectations);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`);
  process.stdout.write(
    `${out}: ${data.totals["trials"]} trials in ${data.cells.length} cells, ${data.totals["excludedTrials"]} left out, ${data.totals["partialTrials"]} partial, ${Object.keys(data.configurations).length} configuration(s)\n`,
  );
}
