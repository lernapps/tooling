// The logic of BruchFeld.vue, a rectangle of N equal fields, the whole, of which the learner colours Z, so that Z/N
// of it is coloured: pure functions, which the build tests over fixed seeds (the exercise contract). A task is Z and
// N; an answer is the number of fields coloured, whichever they are. The explainer checks an answer with check and
// gives the message of reason. describe states a task and its solution, about what the exercise is; template,
// params, mistakes and show give a tutor the task once and each number's inputs and outputs.

/** The props the logic needs: the task with {Z} and {N}, and the app's message for each typical mistake. */
export interface Props {
  task: string;
  mistakes?: readonly string[];
}

export interface Task {
  /** The numerator: the number of fields to colour. */
  Z: number;
  /** The denominator: the number of equal fields, the whole. */
  N: number;
}

/** The number of fields coloured. */
export type Answer = number;

/** The numbers of fields of the whole. */
const SIZES = [4, 5, 6, 8, 10, 12];

/** A small seeded random generator (mulberry32). */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The numerators of a whole of `N` fields: at least 1, less than N, and not half, so the rest differs from Z. */
const numerators = (N: number) => Array.from({ length: N - 1 }, (_, i) => i + 1).filter((Z) => N - Z !== Z);

/** The task of `seed`: a number of fields and a numerator. */
export function generate(seed: number, _props?: Props): Task {
  const next = random(seed);
  const N = SIZES[Math.floor(next() * SIZES.length)] ?? 8;
  const choices = numerators(N);
  return { Z: choices[Math.floor(next() * choices.length)] ?? 1, N };
}

/** Whether `answer` fields are Z/N of the whole. */
export function check(task: Task, answer: Answer): boolean {
  return answer === task.Z;
}

/** The right answer. */
export function solution(task: Task): Answer {
  return task.Z;
}

/** A wrong answer: the rest coloured. */
export function wrong(task: Task): Answer {
  return task.N - task.Z;
}

/** The answer of each typical mistake of about.mistakes: the rest coloured, the whole coloured. */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [task.N - task.Z, task.N];
}

/** A text of the props with {Z}, {N} and {n} filled in. */
export const fill = (text: string, task: Task, n = 0) =>
  text.replace(/\{Z\}/g, String(task.Z)).replace(/\{N\}/g, String(task.N)).replace(/\{n\}/g, String(n));

/** The app's message for a wrong answer, from the props: that of its typical mistake, or none. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task).findIndex((mistaken) => mistaken === answer);
  const message = index < 0 ? undefined : props.mistakes?.[index];
  return message === undefined ? undefined : fill(message, task, answer);
}

/** The task as a learner sees it, and its solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: fill(props.task, task),
    solution: `${show(task.Z)}: der Zähler ${task.Z} sagt, wie viele der ${task.N} gleich großen Felder gefärbt sind`,
  };
}

/** The task as a learner reads it, with {Z} and {N}: the prop task. */
export function template(props: Props, _lang: string): string {
  return props.task;
}

/** What sets a task: the numerator and the number of fields. */
export function params(task: Task, _props: Props, _lang: string): Record<string, number> {
  return { Z: task.Z, N: task.N };
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `${answer} Felder`;
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Ein Rechteck aus N gleich großen Feldern ist das Ganze. Das Kind färbt durch Antippen Z/N davon und drückt „Prüfen“ unter dem Rechteck. Ein Zählerstand wird vor „Prüfen“ nicht gezeigt.",
  answer: "Die Zahl der gefärbten Felder; welche es sind, ist egal.",
  correct: "Richtig, wenn genau Z Felder gefärbt sind, der Zähler.",
  mistakes: [
    "Den Rest gefärbt: N − Z Felder, also die Felder, die nicht zum Bruch gehören.",
    "Alle N Felder gefärbt: Zähler und Nenner verwechselt, der Nenner sagt nur, in wie viele Teile das Ganze geteilt ist.",
  ],
};
