// The rows and metrics of the evals: what each trial is scored on and how a cell (task, model, configuration) sums
// them up. evals/results.ts writes them into a run's results.json; the page (evals/site.ts) reads only that file.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { trialNumbers } from "./summary.ts";

export const TASKS = ["quiz-fresh", "explainer-fresh", "interactive-fresh"] as const;
export const TASK_LABELS: Record<string, string> = {
  "quiz-fresh": "Quiz",
  "explainer-fresh": "Explainer",
  "interactive-fresh": "Interactive",
};

/** A row of the heatmap: a share between 0 and 1 per trial, higher is what the guidance asks for. */
export interface Row {
  id: string;
  label: string;
  group: "process" | "transcript";
  /** The dimension of reward.json or transcript-score.json it is read from (evals/expectations.json). */
  source: string;
  /** How the value reads in a tooltip: a mean share, or runs that meet a condition. */
  kind: "share" | "runs";
  value: (trial: Trial) => number | undefined;
}

export interface Trial {
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
  {
    id: "phase_reached",
    label: "Phase in the plan at the end (commit = 100 %)",
    group: "process",
    source: "phase_reached",
    kind: "share",
  },
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
  // The scenarios end before Commit's pushes (no repo, no publishing); this is the end the process should reach.
  {
    id: "code_done",
    label: "Code done: check green and the scenario ended after the plan",
    group: "transcript",
    source: "scenario_end",
    kind: "runs",
    value: (trial) => {
      const check = trial.numbers["check_passes"];
      const end = trial.numbers["t_scenario_end"];
      return check === undefined || end === undefined ? undefined : Math.min(check, end);
    },
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
  // A2, from the guidance whose architecture gives its skills a phase (skills-by-phase.json of the job); empty before
  {
    id: "skills_in_phase",
    label: "Skills loaded in their phase",
    group: "transcript",
    source: "skills_in_phase",
    kind: "share",
    value: (trial) => trial.numbers["t_skills_in_phase"],
  },
  {
    id: "no_skill_out_of_place",
    label: "No skill of another archetype or before its phase",
    group: "transcript",
    source: "skills_out_of_place",
    kind: "runs",
    value: threshold("t_skills_out_of_place", 0),
  },
);

/** The numbers with min, mean and max per cell beside the heatmap. */
export const METRICS: Record<string, string> = {
  agent_minutes: "agent_minutes",
  creator_turns: "t_creator_turns",
  creator_turns_after_plan: "t_creator_turns_after_plan",
  questions_per_turn_max: "t_questions_per_turn_max",
  questions_per_turn_mean: "t_questions_per_turn_mean",
  output_tokens: "t_agent_output_tokens",
  input_tokens: "t_agent_input_tokens",
  cache_read_tokens: "t_agent_cache_read_tokens",
};

export interface Stat {
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

const readJson = <T>(path: string): T | undefined =>
  existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : undefined;
export const round = (value: number, digits = 3) => Math.round(value * 10 ** digits) / 10 ** digits;
export const stat = (values: number[]): Stat | undefined =>
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
export const MODEL_ORDER = ["haiku", "sonnet", "opus"];
export const modelRank = (model: string) => {
  const rank = MODEL_ORDER.findIndex((name) => model.includes(name));
  return rank < 0 ? MODEL_ORDER.length : rank;
};

export function readTrial(dir: string): Trial {
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
