// The logic of BruchFeld.vue, a strip of n equal parts, together one whole, of which the learner colours z parts:
// pure functions, which the build tests over fixed seeds (the exercise contract). A task is n and z; an answer is the
// number of parts coloured, whichever they are. The explainer checks an answer with check and gives the message of
// reason. describe states a task and its solution; template, params, mistakes and show give a tutor the task once
// and each number's inputs and outputs.

/** The props the logic needs: the task with {n} and {z}, and the app's message for each typical mistake. */
export interface Props {
  task: string;
  mistakes?: readonly string[];
}

export interface Task {
  /** The number of equal parts the whole is divided into (the denominator). */
  n: number;
  /** The number of parts to colour (the numerator). */
  z: number;
}

/** The number of parts coloured. */
export type Answer = number;

/** The strip's numbers of parts: few enough for a tap target on a narrow screen. */
const SIZES = [4, 5, 6, 8, 10];

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

/** The numerators for n parts: a proper fraction whose rest is a different number of parts, so the mistake differs. */
const numerators = (n: number) => Array.from({ length: n - 1 }, (_, i) => i + 1).filter((z) => n - z !== z);

/** The task of `seed`: a number of parts and how many to colour. */
export function generate(seed: number, _props?: Props): Task {
  const next = random(seed);
  const n = SIZES[Math.floor(next() * SIZES.length)] ?? 8;
  const choices = numerators(n);
  return { n, z: choices[Math.floor(next() * choices.length)] ?? 1 };
}

/** Whether `answer` parts are the fraction asked. */
export function check(task: Task, answer: Answer): boolean {
  return answer === task.z;
}

/** The right answer. */
export function solution(task: Task): Answer {
  return task.z;
}

/** A wrong answer: the rest coloured. */
export function wrong(task: Task): Answer {
  return task.n - task.z;
}

/** The answer of each typical mistake of about.mistakes: the rest of the strip coloured. */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [wrong(task)];
}

/** A text of the props with {n}, {z} and {k} filled in. */
export const fill = (text: string, task: Task, k = 0) =>
  text.replace(/\{n\}/g, String(task.n)).replace(/\{z\}/g, String(task.z)).replace(/\{k\}/g, String(k));

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
    solution: `${show(task.z)} von ${task.n} Teilen`,
  };
}

/** The task as a learner reads it, with {n} and {z}: the prop task. */
export function template(props: Props, _lang: string): string {
  return props.task;
}

/** What sets a task: the number of parts and how many to colour. */
export function params(task: Task, _props: Props, _lang: string): Record<string, number> {
  return { n: task.n, z: task.z };
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `${answer} Teile gefärbt`;
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Ein Streifen ist das Ganze und in n gleich große Teile geteilt. Das Kind färbt durch Antippen z Teile, also den Bruch z/n, und drückt „Prüfen“ unter dem Streifen.",
  answer: "Die Zahl der gefärbten Teile; welche es sind, ist egal.",
  correct: "Richtig, wenn genau z Teile gefärbt sind.",
  mistakes: ["Den Rest gefärbt: n − z Teile, also die Teile, die nicht zum Bruch gehören."],
};
