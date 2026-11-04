// The logic of DiagrammZeichnen.vue: learners set the speed at 0, 3, 6 and 9 seconds so that the speed-time diagram
// fits a story. Pure functions, which the build tests over fixed seeds (the exercise contract). A task is a scenario
// and a top speed V; an answer is the four speeds. The explainer checks an answer with check and gives the message of
// reason. describe states a task and its solution; template, params, mistakes and show give a tutor the task.

/** The props the logic needs. */
export interface Props {
  /** The stories, one for each scenario, with {v} for the top speed and {h} for half of it (m/s). */
  szenarien: readonly string[];
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes?: readonly string[];
  /** The message when one section does not fit, with {n}, {von} and {bis}. */
  fehlerAbschnitt?: string;
  /** The message when the shape fits but a value does not. */
  fehlerWert?: string;
}

export interface Task {
  /** The scenario: 0 start, keep, stop; 1 keep, slow down, keep; 2 stand, start, keep. */
  szenario: number;
  /** The top speed in m/s. */
  v: number;
}

/** The speeds at 0, 3, 6 and 9 s. */
export type Answer = number[];

export const ZEITEN = [0, 3, 6, 9];
export const V_MAX = 12;
const TOLERANZ = 1;
const SPEEDS = [4, 6, 8];
const SZENARIEN = 3;

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

/** The task of `seed`: a scenario and a top speed. */
export function generate(seed: number, _props?: Props): Task {
  const next = random(seed);
  return {
    szenario: Math.floor(next() * SZENARIEN) % SZENARIEN,
    v: SPEEDS[Math.floor(next() * SPEEDS.length)] ?? 6,
  };
}

/** The speeds the story asks for. */
export function solution(task: Task): Answer {
  const h = task.v / 2;
  if (task.szenario === 0) return [0, task.v, task.v, 0];
  if (task.szenario === 1) return [task.v, task.v, h, h];
  return [0, 0, task.v, task.v];
}

/** The way a section goes: 1 up, 0 level (up to the tolerance), -1 down. */
const richtung = (von: number, bis: number): number => (Math.abs(bis - von) <= TOLERANZ ? 0 : Math.sign(bis - von));

/** The first section whose shape differs from the story, as 0 to 2, or -1 when all shapes fit. */
export function falscherAbschnitt(task: Task, answer: Answer): number {
  const soll = solution(task);
  for (let i = 0; i < 3; i++) {
    if (richtung(answer[i] ?? 0, answer[i + 1] ?? 0) !== richtung(soll[i] ?? 0, soll[i + 1] ?? 0)) return i;
  }
  return -1;
}

/** Whether every speed is within a tolerance of 1 m/s of the story's and every section has the story's shape. */
export function check(task: Task, answer: Answer): boolean {
  const soll = solution(task);
  return (
    answer.length === soll.length &&
    falscherAbschnitt(task, answer) === -1 &&
    soll.every((v, i) => Math.abs(v - (answer[i] ?? Number.NaN)) <= TOLERANZ)
  );
}

/** A wrong answer: one level line. */
export function wrong(task: Task): Answer {
  return [task.v, task.v, task.v, task.v];
}

/** The answer of each typical mistake of about.mistakes: a level line, the right shape three m/s too high. */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [wrong(task), solution(task).map((v) => v + 3)];
}

/** A text of the props with {v} and {h} filled in. */
export const fill = (text: string, task: Task) =>
  text.replace(/\{v\}/g, String(task.v)).replace(/\{h\}/g, String(task.v / 2));

/** The story of a task. */
export function story(task: Task, props: Props): string {
  return fill(props.szenarien[task.szenario % props.szenarien.length] ?? "", task);
}

/** The app's message for a wrong answer: the first section that does not fit, else the values, else the typical one. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task).findIndex((m) => m !== undefined && m.every((v, i) => v === answer[i]));
  if (index >= 0 && props.mistakes?.[index] !== undefined) return props.mistakes[index];
  const abschnitt = falscherAbschnitt(task, answer);
  if (abschnitt >= 0 && props.fehlerAbschnitt !== undefined) {
    return props.fehlerAbschnitt
      .replace("{n}", String(abschnitt + 1))
      .replace("{von}", String(ZEITEN[abschnitt]))
      .replace("{bis}", String(ZEITEN[abschnitt + 1]));
  }
  return props.fehlerWert;
}

/** The answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return ZEITEN.map((t, i) => `${answer[i] ?? "?"} m/s bei ${t} s`).join(", ");
}

/** The task as a learner sees it, and its solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return { task: story(task, props), solution: show(solution(task)) };
}

/** The task as the tutor gets it: the sentence that changes is an input. */
export function template(_props: Props, _lang: string): string {
  return "Stelle das Geschwindigkeit-Zeit-Diagramm so ein, dass es zur Geschichte passt. {Aufgabe}";
}

/** What sets a task: the story. */
export function params(task: Task, props: Props, _lang: string): Record<string, string> {
  return { Aufgabe: story(task, props) };
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Eine Geschichte beschreibt, wie sich ein Wagen bewegt (anfahren, gleich schnell fahren, bremsen). Das Kind stellt mit vier Reglern die Geschwindigkeit bei 0, 3, 6 und 9 Sekunden ein. Das Geschwindigkeit-Zeit-Diagramm verbindet die vier Punkte mit geraden Strichen. Dann drückt es „Prüfen“.",
  answer: "Vier Geschwindigkeiten in m/s bei 0, 3, 6 und 9 s.",
  correct:
    "Richtig, wenn jeder der drei Abschnitte die Form der Geschichte hat (steigt, bleibt, fällt) und jede Geschwindigkeit höchstens 1 m/s von der Geschichte abweicht.",
  mistakes: [
    "Eine waagerechte Linie in allen Abschnitten: das Kind hat die Änderung der Geschwindigkeit nicht eingezeichnet.",
    "Die richtige Form, aber alle Geschwindigkeiten 3 m/s zu hoch: das Kind hat die Zahlen der Geschichte nicht beachtet.",
  ],
};
