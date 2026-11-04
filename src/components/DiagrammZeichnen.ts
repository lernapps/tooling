// The logic of DiagrammZeichnen.vue: learners set the velocity at 0, 4, 8 and 12 s for a story of a trip, and so draw
// the v-t diagram. Pure functions, which the build tests over fixed seeds (the exercise contract). A task is one story
// of the data file `bewegungen`; an answer is the four velocities in m/s. The explainer checks an answer with check and
// gives the message of reason. describe states a task and its solution; template, params, mistakes and show give a
// tutor the task once and each number's inputs and outputs.

/** One story: the four velocities (at 0, 4, 8 and 12 s) it tells. */
export interface Bewegung {
  geschichte: string;
  v0: number;
  v1: number;
  v2: number;
  v3: number;
}

/** The props the logic needs: the task sentence with {geschichte}, the stories and the message of each mistake. */
export interface Props {
  aufgabe: string;
  bewegungen: readonly Bewegung[];
  mistakes?: readonly string[];
}

/** A task: which story, and the velocities it tells. */
export interface Task {
  /** The number of the story in the data file, from 0. */
  index: number;
  geschichte: string;
  /** The right velocities at 0, 4, 8 and 12 s. */
  v: [number, number, number, number];
}

/** The velocities the learner set at 0, 4, 8 and 12 s. */
export type Answer = number[];

/** The times of the four points in s. */
export const ZEITEN = [0, 4, 8, 12];

/** The task of `seed`: the stories in turn, so that nothing repeats before every story had its turn. */
export function generate(seed: number, props: Props): Task {
  const stories = props.bewegungen;
  const index = (Math.max(1, Math.floor(seed)) - 1) % Math.max(1, stories.length);
  const story = stories[index];
  if (story === undefined) return { index: 0, geschichte: "", v: [0, 0, 0, 0] };
  return { index, geschichte: story.geschichte, v: [story.v0, story.v1, story.v2, story.v3] };
}

const same = (a: readonly number[], b: readonly number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Whether the four velocities are those of the story. */
export function check(task: Task, answer: Answer): boolean {
  return same(task.v, answer);
}

/** The right answer. */
export function solution(task: Task): Answer {
  return [...task.v];
}

/** A wrong answer: the last point one step off. */
export function wrong(task: Task): Answer {
  const last = task.v[3] >= 12 ? task.v[3] - 1 : task.v[3] + 1;
  return [task.v[0], task.v[1], task.v[2], last];
}

/**
 * The answer of each typical mistake of about.mistakes, none where it would equal the solution or an earlier mistake:
 * the braking forgotten (the last point stays at the level of the one before), the start at full speed instead of
 * the acceleration, the time mirrored (the trip read from the end).
 */
export function mistakes(task: Task): (Answer | undefined)[] {
  const [v0, v1, v2, v3] = task.v;
  const candidates: Answer[] = [
    [v0, v1, v2, v2],
    [v1, v1, v2, v3],
    [v3, v2, v1, v0],
  ];
  const seen: Answer[] = [solution(task)];
  return candidates.map((c) => {
    if (seen.some((s) => same(s, c))) return undefined;
    seen.push(c);
    return c;
  });
}

/** The app's message for a wrong answer, from the props: that of its typical mistake, or none. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task).findIndex((mistaken) => mistaken !== undefined && same(mistaken, answer));
  return index < 0 ? undefined : props.mistakes?.[index];
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `${answer.join(", ")} m/s`;
}

/** The task as a learner reads it: the prop aufgabe with {geschichte} filled in. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: props.aufgabe.replace("{geschichte}", task.geschichte),
    solution: `Geschwindigkeit bei 0, 4, 8 und 12 s: ${show(task.v)}`,
  };
}

/** The task once, with {geschichte} for the story. */
export function template(props: Props, _lang: string): string {
  return props.aufgabe;
}

/** What sets a task: its story. */
export function params(task: Task, _props: Props, _lang: string): Record<string, string> {
  return { geschichte: task.geschichte };
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Eine kleine Geschichte erzählt eine Fahrt von 12 s. Das Kind stellt mit vier Reglern die Geschwindigkeit bei 0, 4, 8 und 12 s ein und zeichnet so das Geschwindigkeit-Zeit-Diagramm. Danach drückt es „Prüfen“.",
  answer: "Die vier Geschwindigkeiten in m/s bei 0, 4, 8 und 12 s.",
  correct: "Richtig, wenn alle vier Geschwindigkeiten genau zur Geschichte passen.",
  mistakes: [
    "Das Abbremsen vergessen: Der letzte Punkt liegt so hoch wie der davor.",
    "Das Anfahren vergessen: Die Fahrt beginnt gleich mit der höchsten Geschwindigkeit.",
    "Die Fahrt von hinten gelesen: Die Punkte sind in umgekehrter Reihenfolge eingestellt.",
  ],
};
