// Aggregates finished eval jobs into one table per task and configuration: mean, min and max of every dimension
// (reward.json of the verifier, transcript-score.json of evals/score-transcript.ts, tokens and minutes from Harbor's
// result.json), with the number of trials. Trials of different configurations (harness and version, Harbor, models,
// guidance commit: <job>/configuration.json from evals/harbor/run.sh) are never mixed.
//   node evals/summary.ts <job dir or jobs dir>... [--json]
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface Configuration {
  harness?: string;
  harnessVersion?: string | string[];
  harbor?: string;
  model?: string;
  userModel?: string;
  task?: string;
  guidanceCommit?: string;
  toolingCommit?: string;
}

export interface Group {
  task: string;
  configuration: Omit<Configuration, "task" | "toolingCommit">;
  trials: number;
  dimensions: Record<string, { mean: number; min: number; max: number; n: number }>;
}

const readJson = <T>(path: string): T | undefined =>
  existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : undefined;

/** The job directories under the given paths: a path with configuration.json is a job, else its children are. */
export function jobsOf(path: string): string[] {
  if (existsSync(join(path, "configuration.json"))) return [path];
  return readdirSync(path)
    .map((name) => join(path, name))
    .filter((child) => statSync(child).isDirectory() && existsSync(join(child, "configuration.json")));
}

interface HarborResult {
  agent_result?: {
    n_input_tokens?: number | null;
    n_cache_tokens?: number | null;
    n_output_tokens?: number | null;
    cost_usd?: number | null;
  } | null;
  agent_execution?: { started_at?: string | null; finished_at?: string | null } | null;
}

/** The numbers of one trial: verifier dimensions, transcript dimensions (prefix `t_`), tokens and agent minutes. */
export function trialNumbers(trial: string): Record<string, number> {
  const numbers: Record<string, number> = {};
  for (const [key, value] of Object.entries(
    readJson<Record<string, unknown>>(join(trial, "verifier", "reward.json")) ?? {},
  )) {
    if (typeof value === "number") numbers[key] = value;
  }
  const transcript = readJson<{ dimensions?: Record<string, number> }>(join(trial, "transcript-score.json"));
  for (const [key, value] of Object.entries(transcript?.dimensions ?? {})) numbers[`t_${key}`] = value;
  const result = readJson<HarborResult>(join(trial, "result.json"));
  const agent = result?.agent_result;
  if (typeof agent?.n_input_tokens === "number") numbers["input_tokens"] = agent.n_input_tokens;
  if (typeof agent?.n_cache_tokens === "number") numbers["cache_tokens"] = agent.n_cache_tokens;
  if (typeof agent?.n_output_tokens === "number") numbers["output_tokens"] = agent.n_output_tokens;
  if (typeof agent?.cost_usd === "number") numbers["cost_usd"] = agent.cost_usd;
  const started = result?.agent_execution?.started_at;
  const finished = result?.agent_execution?.finished_at;
  if (started && finished) numbers["agent_minutes"] = (Date.parse(finished) - Date.parse(started)) / 60_000;
  return numbers;
}

export function summarise(jobDirs: string[]): Group[] {
  const groups = new Map<
    string,
    { task: string; configuration: Group["configuration"]; trials: Record<string, number>[] }
  >();
  for (const job of jobDirs) {
    const {
      task = "?",
      toolingCommit: _tooling,
      ...configuration
    } = readJson<Configuration>(join(job, "configuration.json")) ?? {};
    const key = JSON.stringify({ task, configuration });
    const group = groups.get(key) ?? { task, configuration, trials: [] };
    groups.set(key, group);
    for (const name of readdirSync(job)) {
      const trial = join(job, name);
      if (statSync(trial).isDirectory() && existsSync(join(trial, "result.json")))
        group.trials.push(trialNumbers(trial));
    }
  }
  return [...groups.values()].map(({ task, configuration, trials }) => {
    const names = [...new Set(trials.flatMap((trial) => Object.keys(trial)))].sort();
    const dimensions: Group["dimensions"] = {};
    for (const name of names) {
      const values = trials.map((trial) => trial[name]).filter((value): value is number => typeof value === "number");
      const round = (value: number) => Math.round(value * 1000) / 1000;
      dimensions[name] = {
        mean: round(values.reduce((sum, value) => sum + value, 0) / values.length),
        min: round(Math.min(...values)),
        max: round(Math.max(...values)),
        n: values.length,
      };
    }
    return { task, configuration, trials: trials.length, dimensions };
  });
}

export function toMarkdown(groups: Group[]): string {
  return groups
    .map((group) => {
      const c = group.configuration;
      const head = `## ${group.task} · ${c.harness ?? "?"} ${String(c.harnessVersion ?? "?")} · ${c.model ?? "?"} (creator ${c.userModel ?? "?"}) · Harbor ${c.harbor ?? "?"} · guidance ${(c.guidanceCommit ?? "?").slice(0, 7)} · ${group.trials} trials`;
      const rows = Object.entries(group.dimensions).map(
        ([name, d]) => `| ${name} | ${d.mean} | ${d.min} | ${d.max} | ${d.n} |`,
      );
      return [head, "", "| dimension | mean | min | max | n |", "|---|---|---|---|---|", ...rows].join("\n");
    })
    .join("\n\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const paths = args.filter((arg) => arg !== "--json");
  if (paths.length === 0) {
    process.stderr.write("Usage: node evals/summary.ts <job dir or jobs dir>... [--json]\n");
    process.exit(2);
  }
  const groups = summarise(paths.flatMap(jobsOf));
  process.stdout.write(args.includes("--json") ? `${JSON.stringify(groups, null, 2)}\n` : `${toMarkdown(groups)}\n`);
}
