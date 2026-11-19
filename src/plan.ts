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

// --- The tasks of a plan -------------------------------------------------------------------------------------------
// `lernapps plan` reads and changes the tasks, the phase and the archetype of the current plan, so that an assistant
// reads one task at a time and never edits a task line by hand (guidance/AGENTS.md). The plan stays Markdown: what the
// creator reads, and what the assistant writes by hand in its free sections (Goal, Key decisions, Notes, Answers,
// Entry draft, Content method, Retrospective). The functions below take and return the text of a plan and tolerate
// what a hand may have done to it: ticked boxes, tasks moved to "Completed", a phase set by hand.

/** The phases of a plan, in order. */
export const PHASES = ["explore", "plan", "code", "commit"] as const;
export type Phase = (typeof PHASES)[number];

/** A task: a box at the start of a line in the section of a phase, with the indented lines that continue it. */
export interface Task {
  phase: Phase;
  /** Index of its first line. */
  line: number;
  /** Index after its last line. */
  end: number;
  done: boolean;
  /** The task without its box, its lines joined by a space. */
  text: string;
}

/** A place where the assistant adds its own tasks: `<!-- tasks: <name>: <what belongs here> -->`. */
export interface Slot {
  phase: Phase;
  line: number;
  name: string;
  added: number;
  about: string;
}

/** The plan cannot do what the command asks: the message says what to do instead. */
export class PlanError extends Error {}

const BOX = /^- \[( |x|X)\] /;
const SLOT = /^<!-- tasks: ([a-z][a-z0-9-]*)(?: \((\d+) added\))?(?:: (.*?))? -->$/;
const ARCHETYPE_SLOT = /^<!-- archetype: ([a-z][a-z0-9-]*) -->$/;
const CHECKPOINT = "**Checkpoint:**";
const title = (phase: Phase) => `${phase[0]?.toUpperCase() ?? ""}${phase.slice(1)}`;

interface Parsed {
  lines: string[];
  tasks: Task[];
  slots: Slot[];
  /** Per phase: the index of its heading and the index after its last line. */
  sections: Partial<Record<Phase, { start: number; end: number }>>;
}

function parsePlan(text: string): Parsed {
  const lines = text.split("\n");
  const tasks: Task[] = [];
  const slots: Slot[] = [];
  const sections: Parsed["sections"] = {};
  let phase: Phase | undefined;
  let comment = false;
  let fence = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? "";
    if (line.startsWith("```")) fence = !fence;
    if (fence) continue;
    const slot = SLOT.exec(line);
    if (slot !== null && phase !== undefined) {
      slots.push({ phase, line: index, name: slot[1] ?? "", added: Number(slot[2] ?? 0), about: slot[3] ?? "" });
      continue;
    }
    if (comment) {
      if (line.includes("-->")) comment = false;
      continue;
    }
    if (line.startsWith("<!--")) {
      comment = !line.includes("-->");
      continue;
    }
    const heading = /^## (.+?)\s*$/.exec(line);
    if (heading !== null) {
      if (phase !== undefined) (sections[phase] as { end: number }).end = index;
      const name = (heading[1] ?? "").toLowerCase();
      phase = (PHASES as readonly string[]).includes(name) ? (name as Phase) : undefined;
      if (phase !== undefined) sections[phase] = { start: index, end: lines.length };
      continue;
    }
    const box = BOX.exec(line);
    if (phase === undefined || box === null) continue;
    let end = index + 1;
    while (end < lines.length && /^\s+\S/.test(lines[end] ?? "")) end++;
    const body = [line.slice(box[0].length), ...lines.slice(index + 1, end).map((more) => more.trim())];
    tasks.push({ phase, line: index, end, done: box[1] !== " ", text: body.join(" ").trim() });
    index = end - 1;
  }
  return { lines, tasks, slots, sections };
}

/** The tasks of a plan, in the order of the file. */
export const planTasks = (text: string): Task[] => parsePlan(text).tasks;

/** The phase in the front matter of a plan; Explore when it names none. */
export function planPhase(text: string): Phase {
  const value = /^---\n(?:(?!---\n)[^\n]*\n)*?phase:[ \t]*([a-z]+)/.exec(text)?.[1];
  return (PHASES as readonly string[]).includes(value ?? "") ? (value as Phase) : "explore";
}

const setFrontMatter = (text: string, key: string, value: string): string =>
  text.replace(new RegExp(`^(---\\n(?:(?!---\\n)[^\\n]*\\n)*?${key}:[ \\t]*)[^\\n]*`), `$1${value}`);

/** The hints of a phase: the comments right under its heading, without the comment marks. */
function hints(parsed: Parsed, phase: Phase): string {
  const section = parsed.sections[phase];
  if (section === undefined) return "";
  const body: string[] = [];
  let comment = false;
  for (let index = section.start + 1; index < section.end; index++) {
    const line = parsed.lines[index] ?? "";
    if (!comment) {
      if (line.trim() === "") continue;
      if (!line.startsWith("<!--") || SLOT.test(line) || ARCHETYPE_SLOT.test(line)) break;
    }
    body.push(line.replace(/^<!--\s?/, "").replace(/\s?-->\s*$/, ""));
    comment = !line.includes("-->");
  }
  return body.filter((line) => line.trim() !== "").join("\n");
}

/** Where the plan stands: its phase, the next open task of the phase, and what keeps it from being the next step. */
export interface Position {
  phase: Phase;
  /** The next open task of the phase; undefined when every task of the phase is ticked. */
  task?: Task;
  /** A place before the task where the assistant has added no task yet. */
  empty?: Slot;
  /** How many tasks the phase has, and how many of them are ticked. */
  total: number;
  ticked: number;
  /** Open tasks of the phases before this one. */
  earlier: Task[];
  hints: string;
}

export function planPosition(text: string): Position {
  const parsed = parsePlan(text);
  const phase = planPhase(text);
  const mine = parsed.tasks.filter((task) => task.phase === phase);
  const task = mine.find((candidate) => !candidate.done);
  const empty = parsed.slots.find(
    (slot) => slot.phase === phase && slot.added === 0 && (task === undefined || slot.line < task.line),
  );
  const before = PHASES.slice(0, PHASES.indexOf(phase));
  return {
    phase,
    ...(task === undefined ? {} : { task }),
    ...(empty === undefined ? {} : { empty }),
    total: mine.length,
    ticked: mine.filter((candidate) => candidate.done).length,
    earlier: parsed.tasks.filter((candidate) => !candidate.done && before.includes(candidate.phase)),
    hints: hints(parsed, phase),
  };
}

const addCommand = (slot: Slot) => `npx --no -- lernapps plan add --at ${slot.name} "<task>"`;

/**
 * What `lernapps plan` prints: the one task to do now. With `hints`, the hints of its phase too: on `next`, and when
 * a phase begins.
 */
export function describePosition(file: string, position: Position, withHints = true): string {
  const out = [`${file} · ${title(position.phase)}`];
  if (position.earlier.length > 0) {
    out.push(
      `Open in an earlier phase (${position.earlier.length}): ${position.earlier.map((task) => brief(task.text)).join("; ")}`,
    );
  }
  if (position.empty !== undefined) {
    out.push(
      `Before you go on, add your tasks for "${position.empty.name}"${position.empty.about ? ` (${position.empty.about})` : ""}, one call each:`,
      `  ${addCommand(position.empty)}`,
    );
    return `${out.join("\n")}\n`;
  }
  if (position.task === undefined) {
    const next = PHASES[PHASES.indexOf(position.phase) + 1];
    out.push(
      next === undefined
        ? "Every task of the plan is ticked."
        : `Every task of ${title(position.phase)} is ticked. Enter ${title(next)}: npx --no -- lernapps plan done`,
    );
    return `${out.join("\n")}\n`;
  }
  if (position.hints !== "" && (withHints || position.ticked === 0)) {
    out.push("", `In ${title(position.phase)}:`, position.hints);
  }
  out.push("", `Task ${position.ticked + 1} of ${position.total}:`, position.task.text, "");
  const files = skillFiles(position.task.text);
  if (files.length > 0) {
    // In manual runs an assistant read skills through the shell and cut them with head or sed; a step below the cut
    // was then not done. Reads with the file tool were whole.
    out.push(
      "Read first, with your file tool and not through the shell, each file whole to its last line:",
      ...files.map((file) => `  ${file}`),
      "",
    );
  }
  out.push(
    position.task.text.includes(CHECKPOINT)
      ? 'A checkpoint: stop, ask the creator, wait. With their answer: npx --no -- lernapps plan done --answer "<their words>"'
      : 'When the task is done, as a command of its own: npx --no -- lernapps plan done (it does not apply: plan skip "<reason>"; more to do: plan add "<task>")',
  );
  return `${out.join("\n")}\n`;
}

/** Where an app's skills are, relative to its root: what `lernapps init`, `skills` and `create` put there. */
const SKILLS = ".agents/skills";

/**
 * The skills a task asks to load ("Load skill `lernapps-app`", "load skills `a` and `b`"), as the files to read. A
 * skill a task only refers to ("as skill `lernapps-github` says") was loaded by an earlier task and is not among them.
 */
export function skillFiles(task: string): string[] {
  const files: string[] = [];
  for (const load of task.matchAll(/\bload (?:the )?skills? ((?:`[a-z][a-z0-9-]*`(?:,? and |, )?)+)/gi)) {
    for (const name of (load[1] ?? "").matchAll(/`([a-z][a-z0-9-]*)`/g)) {
      const file = `${SKILLS}/${name[1] ?? ""}/SKILL.md`;
      if (!files.includes(file)) files.push(file);
    }
  }
  return files;
}

const brief = (text: string) => (text.length > 70 ? `${text.slice(0, 67)}…` : text);

/** Ticks the next open task of the phase; after the last one, enters the next phase. `answer` only at a checkpoint. */
export function planDone(text: string, options: { answer?: string; skip?: string } = {}): string {
  const position = planPosition(text);
  if (position.empty !== undefined) {
    throw new PlanError(`no task was added for "${position.empty.name}" yet: ${addCommand(position.empty)}`);
  }
  const task = position.task;
  if (task === undefined) return enterNext(text, position.phase);
  const checkpoint = task.text.includes(CHECKPOINT);
  if (options.skip !== undefined) {
    if (checkpoint) throw new PlanError("a checkpoint cannot be skipped: ask the creator and wait for the answer");
    if (options.skip.trim() === "") throw new PlanError('skip needs the reason: plan skip "<reason>"');
  } else if (checkpoint && (options.answer ?? "").trim() === "") {
    throw new PlanError(
      `this task is a checkpoint: stop, ask the creator and wait. Tick it with their answer: plan done --answer "<their words>"`,
    );
  } else if (!checkpoint && options.answer !== undefined) {
    throw new PlanError("--answer is for a checkpoint; this task is none");
  }
  const lines = text.split("\n");
  const first = lines[task.line] ?? "";
  const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();
  lines[task.line] =
    options.skip === undefined
      ? first.replace(BOX, "- [x] ")
      : first.replace(BOX, `- [x] (skipped: ${oneLine(options.skip)}) `);
  if (options.answer !== undefined) lines.splice(task.end, 0, `      Creator: ${oneLine(options.answer)}`);
  const ticked = lines.join("\n");
  return planPosition(ticked).task === undefined ? enterNext(ticked, position.phase) : ticked;
}

function enterNext(text: string, phase: Phase): string {
  const next = PHASES[PHASES.indexOf(phase) + 1];
  return next === undefined ? text : setFrontMatter(text, "phase", next);
}

/**
 * Adds a task: at the place `at` names (a `<!-- tasks: <name> -->` line, in the order of the calls), else right after
 * the next open task of the phase, or at the end of the phase's tasks when none is open.
 */
export function planAdd(text: string, task: string, at?: string): string {
  const added = task.replace(/\s+/g, " ").trim();
  if (added === "") throw new PlanError('add needs the task: plan add "<task>"');
  const parsed = parsePlan(text);
  const lines = [...parsed.lines];
  const entry = `- [ ] ${added.replace(BOX, "")}`;
  if (at !== undefined) {
    const slot = parsed.slots.find((candidate) => candidate.name === at);
    if (slot === undefined) {
      const names = parsed.slots.map((candidate) => candidate.name);
      throw new PlanError(`the plan has no place "${at}"${names.length > 0 ? ` (it has: ${names.join(", ")})` : ""}`);
    }
    lines[slot.line] = `<!-- tasks: ${slot.name} (${slot.added + 1} added)${slot.about ? `: ${slot.about}` : ""} -->`;
    lines.splice(slot.line, 0, entry);
    return lines.join("\n");
  }
  const phase = planPhase(text);
  const mine = parsed.tasks.filter((candidate) => candidate.phase === phase);
  const after = mine.find((candidate) => !candidate.done) ?? mine.at(-1);
  if (after === undefined) throw new PlanError(`the plan has no tasks in ${title(phase)} to add one to`);
  lines.splice(after.end, 0, entry);
  return lines.join("\n");
}

/**
 * Makes a plan the plan of an archetype: sets `archetype`, names the archetype's skills (`lernapps-<archetype>` becomes
 * `lernapps-explainer`), and puts the archetype's tasks and hints where the template leaves room for them. `part` is
 * guidance/plan-<archetype>.md: sections `## <name>`, each replacing the line `<!-- archetype: <name> -->`. A place the
 * part has nothing for is removed. A plan without such places (made by hand, or done already) keeps its tasks.
 */
export function applyArchetype(text: string, archetype: string, part: string): string {
  const pieces = new Map<string, string[]>();
  let name: string | undefined;
  for (const line of part.split("\n")) {
    const heading = /^## ([a-z][a-z0-9-]*)\s*$/.exec(line);
    if (heading !== null) {
      name = heading[1] ?? "";
      pieces.set(name, []);
    } else if (name !== undefined) pieces.get(name)?.push(line);
  }
  const trim = (body: string[]) => {
    const kept = [...body];
    while (kept.length > 0 && (kept[0] ?? "").trim() === "") kept.shift();
    while (kept.length > 0 && (kept.at(-1) ?? "").trim() === "") kept.pop();
    return kept;
  };
  const lines = text.split("\n").flatMap((line) => {
    const place = ARCHETYPE_SLOT.exec(line);
    return place === null ? [line] : trim(pieces.get(place[1] ?? "") ?? []);
  });
  return setFrontMatter(lines.join("\n"), "archetype", archetype).replaceAll("<archetype>", archetype);
}

/** How a task line reads without its box, a skip note and the white space a wrap adds: what must not change. */
const stable = (task: Task) =>
  task.text
    .replace(/^\(skipped: [^)]*\) /, "")
    .replace(/ Creator: .*$/, "")
    .replace(/\s+/g, " ")
    .trim();

/** The tasks of `before` that `after` no longer has in the same words: a task is ticked, skipped or added, never rewritten. */
export function changedTasks(before: string, after: string): string[] {
  const kept = new Set(planTasks(after).map(stable));
  return planTasks(before)
    .map(stable)
    .filter((task) => !kept.has(task));
}

/**
 * A plan as it starts: the placeholders of its head filled, which no section the assistant may write holds. `name`
 * is the app's short name (a first version) or the short name of the increment; `date` an ISO date.
 */
export function startPlan(template: string, name: string, date: string): string {
  return template
    .replace("# Plan: <app name>, first version", `# Plan: ${name}, first version`)
    .replace("# Increment: <what it adds>", `# Increment: ${name}`)
    .replace("*Started <date>.", `*Started ${date}.`);
}
