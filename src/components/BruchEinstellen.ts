// The logic of BruchEinstellen.vue: the learner sets a fraction z/n in a picture (n equal parts, z coloured). Pure
// functions, which the build tests over fixed seeds (the exercise contract). A task is the fraction and the form of the
// whole; an answer is the denominator and the numerator the learner set. The explainer checks an answer with check and
// gives the message of reason. describe states a task and its solution; template, params, mistakes and show give a
// tutor the task once and each number's inputs and outputs.

import type { Form } from "./BruchBild.ts";

/** The props the logic needs: the task with {z} and {n}, and the app's message for each typical mistake. */
export interface Props {
  task: string;
  mistakes?: readonly string[];
}

export interface Task {
  /** The denominator: the number of equal parts. */
  n: number;
  /** The numerator: the number of coloured parts. */
  z: number;
  /** The form of the whole. */
  form: Form;
}

/** What the learner set: the number of parts and the number coloured. */
export interface Answer {
  nenner: number;
  zaehler: number;
}

/** The denominators of the tasks: no 2 or 3 (too few parts to tell the mistakes apart). */
const NENNER = [4, 5, 6, 7, 8, 9, 10, 12];

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

/** The numerators of a denominator: 2 to n − 1, and not n : 2, where the rest would be as many as the part. */
const numerators = (n: number) => Array.from({ length: n - 2 }, (_, i) => i + 2).filter((z) => z < n && 2 * z !== n);

/** The task of `seed`: a fraction and a form. */
export function generate(seed: number, _props?: Props): Task {
  const next = random(seed);
  const n = NENNER[Math.floor(next() * NENNER.length)] ?? 8;
  const choices = numerators(n);
  const z = choices[Math.floor(next() * choices.length)] ?? 3;
  return { n, z, form: next() < 0.5 ? "rechteck" : "kreis" };
}

/** Whether `answer` is the fraction of the task. */
export function check(task: Task, answer: Answer): boolean {
  return answer.nenner === task.n && answer.zaehler === task.z;
}

/** The right answer. */
export function solution(task: Task): Answer {
  return { nenner: task.n, zaehler: task.z };
}

/** A wrong answer: the rest coloured. */
export function wrong(task: Task): Answer {
  return { nenner: task.n, zaehler: task.n - task.z };
}

/** The answer of each typical mistake of about.mistakes: the rest coloured; the numerator used as the denominator. */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [wrong(task), { nenner: task.z, zaehler: task.z }];
}

/** A text of the props with {z}, {n} and {r} (the rest, n − z) filled in. */
export const fill = (text: string, task: Task) =>
  text
    .replace(/\{z\}/g, String(task.z))
    .replace(/\{n\}/g, String(task.n))
    .replace(/\{r\}/g, String(task.n - task.z));

/** The app's message for a wrong answer, from the props: that of its typical mistake, or none. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task).findIndex(
    (mistaken) => mistaken !== undefined && mistaken.nenner === answer.nenner && mistaken.zaehler === answer.zaehler,
  );
  const message = index < 0 ? undefined : props.mistakes?.[index];
  return message === undefined ? undefined : fill(message, task);
}

/** The task as a learner sees it, and its solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: fill(props.task, task),
    solution: `${task.n} gleich große Teile, ${task.z} davon ausgemalt: $\\frac{${task.z}}{${task.n}}$`,
  };
}

/** The task as a learner reads it, with {z} and {n}: the prop task. */
export function template(props: Props, _lang: string): string {
  return props.task;
}

/** What sets a task: the numerator and the denominator. */
export function params(task: Task, _props: Props, _lang: string): Record<string, number> {
  return { z: task.z, n: task.n };
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `${answer.zaehler} von ${answer.nenner} Teilen`;
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Das Kind soll einen Bruch einstellen: Mit „Nenner“ legt es fest, in wie viele gleich große Teile das Ganze (Rechteck oder Kreis) geteilt ist, mit „Zähler“, wie viele davon ausgemalt sind. Danach drückt es „Prüfen“.",
  answer: "Die Zahl der Teile (Nenner) und die Zahl der ausgemalten Teile (Zähler), wie im Bild eingestellt.",
  correct: "Richtig, wenn das Bild genau n gleich große Teile hat und z davon ausgemalt sind.",
  mistakes: [
    "Den Rest ausgemalt: n − z Teile statt z.",
    "Die Zahl der ausgemalten Teile als Zahl aller Teile genommen: Nenner und Zähler verwechselt.",
  ],
};
