// The logic of Bruchfeld.vue, a strip of n equal parts of which the learner colours z, for the fraction z/n: pure
// functions, which the build tests over fixed seeds (the exercise contract). A task is n and z; an answer is the
// number of parts coloured, whichever they are. The explainer checks an answer with check and gives the message of
// reason. describe states a task and its solution; template, params, mistakes and show give a tutor the task once and
// each number's inputs and outputs.

/** The props the logic needs: the task with {n} and {z}, and the app's message for each typical mistake. */
export interface Props {
  task: string;
  mistakes?: readonly string[];
}

export interface Task {
  /** The number of equal parts of the strip: the whole, the denominator. */
  n: number;
  /** The number of parts to colour: the numerator. */
  z: number;
}

/** The number of parts coloured. */
export type Answer = number;

/** The numbers of parts of the strip: small, so that every part is easy to tap. */
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

/**
 * The numerators of a strip of n parts: at least 1 and less than n, and not half of n (the rest would then be as many
 * as the answer, and the two could not be told apart), and not 1 less than n (one part left over is too easy).
 */
const numerators = (n: number) =>
  Array.from({ length: n - 1 }, (_, i) => i + 1).filter((z) => z * 2 !== n && z !== n - 1);

/** The task of `seed`: a number of parts and how many to colour. */
export function generate(seed: number, _props?: Props): Task {
  const next = random(seed);
  const n = SIZES[Math.floor(next() * SIZES.length)] ?? 8;
  const choices = numerators(n);
  return { n, z: choices[Math.floor(next() * choices.length)] ?? 3 };
}

/** Whether `answer` parts are the numerator of the fraction. */
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

/** The answer of each typical mistake of about.mistakes: the rest coloured, every part coloured. */
export function mistakes(task: Task, _props?: Props): (Answer | undefined)[] {
  return [wrong(task), task.n];
}

/** A text of the props with {n}, {z} and {r} (the rest) filled in. */
export const fill = (text: string, task: Task) =>
  text
    .replace(/\{n\}/g, String(task.n))
    .replace(/\{z\}/g, String(task.z))
    .replace(/\{r\}/g, String(task.n - task.z));

/** The app's message for a wrong answer, from the props: that of its typical mistake, or none. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task).findIndex((mistaken) => mistaken === answer);
  const message = index < 0 ? undefined : props.mistakes?.[index];
  return message === undefined ? undefined : fill(message, task);
}

/** The task as a learner sees it, and its solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: fill(props.task, task),
    solution: `${task.z} von ${task.n} Teilen gefärbt`,
  };
}

/** The task as a learner reads it, with {n} and {z}: the prop task. */
export function template(props: Props, _lang: string): string {
  return props.task;
}

/** What sets a task: the number of parts and the numerator. */
export function params(task: Task, _props: Props, _lang: string): Record<string, number> {
  return { n: task.n, z: task.z };
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `${answer} ${answer === 1 ? "Teil" : "Teile"} gefärbt`;
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Ein Streifen aus n gleich großen Teilen ist das Ganze. Das Kind färbt durch Antippen z Teile, passend zum Bruch z/n, und drückt „Prüfen“ unter dem Streifen. Ein zweiter Knopf setzt den Streifen zurück.",
  answer: "Die Zahl der gefärbten Teile; welche es sind, ist egal.",
  correct: "Richtig, wenn genau z Teile gefärbt sind.",
  mistakes: [
    "Den Rest gefärbt: n − z Teile, die Teile, die nicht zum Bruch gehören.",
    "Alle n Teile gefärbt: der Nenner wurde mit dem Zähler verwechselt.",
  ],
};
