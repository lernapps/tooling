// The logic of BruchFaerben.vue, a strip of b equal pieces, the whole, of which the learner colours the fraction a/b:
// pure functions, which the build tests over fixed seeds (the exercise contract). A task is a and b; an answer is the
// number of pieces coloured, whichever they are. The explainer checks an answer with check and gives the message of
// reason. describe states a task and its solution; template, params, mistakes and show give a tutor the task once
// and each number's inputs and outputs.

/** The props the logic needs: the task with {a} and {b}, and the app's message for each typical mistake. */
export interface Props {
  task: string;
  mistakes?: readonly string[];
}

export interface Task {
  /** The numerator: the pieces to colour. */
  a: number;
  /** The denominator: the pieces of the whole strip. */
  b: number;
}

/** The number of pieces coloured. */
export type Answer = number;

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

/** The denominators of the strip: from 3 to 12 pieces. */
const DENOMINATORS = [3, 4, 5, 6, 7, 8, 9, 10, 12];

/** The numerators of a strip of `b` pieces: never b - a equal to a, so that the swapped fraction is a mistake. */
const numerators = (b: number) => Array.from({ length: b - 1 }, (_, i) => i + 1).filter((a) => b - a !== a);

/** The task of `seed`: a denominator and a numerator smaller than it. */
export function generate(seed: number, _props?: Props): Task {
  const next = random(seed);
  const b = DENOMINATORS[Math.floor(next() * DENOMINATORS.length)] ?? 4;
  const choices = numerators(b);
  return { a: choices[Math.floor(next() * choices.length)] ?? 1, b };
}

/** Whether `answer` pieces are the fraction a/b of the strip. */
export function check(task: Task, answer: Answer): boolean {
  return answer === task.a;
}

/** The right answer. */
export function solution(task: Task): Answer {
  return task.a;
}

/** A wrong answer: numerator and denominator swapped, so the rest is coloured. */
export function wrong(task: Task): Answer {
  return task.b - task.a;
}

/** The answer of each typical mistake of about.mistakes: the rest coloured, the whole strip coloured. */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [wrong(task), task.b];
}

/** A text of the props with {a}, {b} and {n} filled in. */
export const fill = (text: string, task: Task, n = 0) =>
  text.replace(/\{a\}/g, String(task.a)).replace(/\{b\}/g, String(task.b)).replace(/\{n\}/g, String(n));

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
    solution: `${show(task.a)}: der Zähler ${task.a} sagt, wie viele der ${task.b} Stücke gefärbt sind`,
  };
}

/** The task as a learner reads it, with {a} and {b}: the prop task. */
export function template(props: Props, _lang: string): string {
  return props.task;
}

/** What sets a task: the numerator and the denominator. */
export function params(task: Task, _props: Props, _lang: string): Record<string, number> {
  return { a: task.a, b: task.b };
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `${answer} gefärbte Stücke`;
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Ein Streifen ist das Ganze und in b gleich große Stücke geteilt. Das Kind färbt durch Antippen den Bruch a/b und drückt „Prüfen“ unter dem Streifen.",
  answer: "Die Zahl der gefärbten Stücke; welche es sind, ist egal.",
  correct: "Richtig, wenn genau a Stücke gefärbt sind: der Zähler sagt, wie viele Stücke gefärbt werden.",
  mistakes: [
    "b − a Stücke gefärbt: Zähler und Nenner vertauscht, das Kind färbt den Rest.",
    "Alle b Stücke gefärbt: das Kind nimmt den Nenner als Zahl der gefärbten Stücke.",
  ],
};
