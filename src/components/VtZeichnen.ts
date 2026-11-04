// The logic of VtZeichnen.vue: the learner draws a speed-time diagram of five stretches of 2 s as five columns, each as
// high as the speed in that stretch (whole m/s, 0 to 10). A task names a drive; the answer is the five speeds. The
// explainer checks them with check and gives the message of reason. Pure functions, which the build tests over fixed
// seeds (the exercise contract).

/** The props the logic needs: the task texts, the messages for typical mistakes and for what is missing. */
export interface Props {
  /** One task text per kind of drive, in the order of KINDS. */
  tasks: readonly string[];
  /** Messages of the typical mistakes, in the order of about.mistakes. */
  mistakes?: readonly string[];
  /** What a drawing lacks, in the order of MISSING. */
  missing?: readonly string[];
}

/** 0: stands, then speeds up in every stretch; 1: constant, then slows down in every stretch to a stop; 2: given values. */
export const KINDS = 3;
/** The number of columns. */
export const STRETCHES = 5;
/** The highest speed in m/s. */
export const TOP_SPEED = 10;

export interface Task {
  kind: number;
}

/** The speed of each stretch in m/s. */
export type Answer = number[];

/** The task of `seed`: seed 1 is the first kind, then the others in turn. */
export function generate(seed: number, _props?: Props): Task {
  return { kind: (((seed - 1) % KINDS) + KINDS) % KINDS };
}

/** The drive of the third kind: 4 s with 6 m/s, 2 s standing, 4 s with 3 m/s. */
const GIVEN: Answer = [6, 6, 0, 3, 3];

/**
 * What a drawing lacks, as indices into props.missing:
 * 0 standing first, 1 faster in every stretch, 2 constant at first, 3 slower in every stretch, 4 a stop at the end,
 * 5 the given values.
 */
export function lacking(task: Task, answer: Answer): number[] {
  const [a = 0, b = 0, c = 0, d = 0, e = 0] = answer;
  const missing: number[] = [];
  if (task.kind === 0) {
    if (a !== 0) missing.push(0);
    if (!(a < b && b < c && c < d && d < e)) missing.push(1);
  } else if (task.kind === 1) {
    if (!(a === b && b > 0)) missing.push(2);
    if (!(b > c && c > d && d > e)) missing.push(3);
    else if (e !== 0) missing.push(4);
  } else if (answer.some((speed, i) => speed !== GIVEN[i])) {
    missing.push(5);
  }
  return missing;
}

/** Whether `answer` is a drawing of the asked drive: the property, not one model drawing. */
export function check(task: Task, answer: Answer): boolean {
  return (
    answer.length === STRETCHES &&
    answer.every((speed) => Number.isInteger(speed) && speed >= 0 && speed <= TOP_SPEED) &&
    lacking(task, answer).length === 0
  );
}

/** A right drawing of each kind. */
const SOLUTIONS: Answer[] = [[0, 2, 4, 6, 8], [6, 6, 4, 2, 0], GIVEN];

/** A right answer. */
export function solution(task: Task): Answer {
  return [...(SOLUTIONS[task.kind] ?? GIVEN)];
}

/** A wrong answer: all columns equally high. */
export function wrong(_task: Task): Answer {
  return [5, 5, 5, 5, 5];
}

/**
 * The answer of each typical mistake of about.mistakes (undefined when it does not fit the task): 0 all equally high
 * (kinds 0 and 1), 1 slowing down with a jump to 0 (kind 1), 2 standing as a constant speed (kind 2), 3 speeding up
 * from the start (kind 0).
 */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [
    task.kind <= 1 ? [5, 5, 5, 5, 5] : undefined,
    task.kind === 1 ? [6, 6, 0, 0, 0] : undefined,
    task.kind === 2 ? [6, 6, 6, 3, 3] : undefined,
    task.kind === 0 ? [2, 3, 4, 5, 6] : undefined,
  ];
}

const same = (a: readonly number[], b: readonly number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** The app's message for a wrong answer: that of a typical mistake, else what the drawing lacks; none for a right one. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task).findIndex((mistaken) => mistaken !== undefined && same(mistaken, answer));
  const typical = index < 0 ? undefined : props.mistakes?.[index];
  if (typical !== undefined) return typical;
  const [missing] = lacking(task, answer);
  return missing === undefined ? undefined : props.missing?.[missing];
}

/** A drawing as text: "0, 2, 4, 6, 8 m/s". */
export const show = (answer: Answer, _task?: Task, _props?: Props, _lang?: string): string =>
  `${answer.join(", ")} m/s`;

/** The task as a learner sees it, and a solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: props.tasks[task.kind] ?? "",
    solution: `Zum Beispiel die Säulen ${show(solution(task))} (die Geschwindigkeit der fünf Zwei-Sekunden-Stufen).`,
  };
}

/** The task as a learner reads it: the text of the kind, as an input {Aufgabe}. */
export function template(_props: Props, _lang: string): string {
  return "{Aufgabe}";
}

/** What sets a task: its text. */
export function params(task: Task, props: Props, _lang: string): Record<string, string> {
  return { Aufgabe: props.tasks[task.kind] ?? "" };
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Ein Geschwindigkeit-Zeit-Diagramm hat fünf Säulen für fünf Stufen von je 2 Sekunden (insgesamt 10 s). Das Kind stellt mit − und + die Höhe jeder Säule ein, also die Geschwindigkeit in m/s, so dass das Diagramm zur beschriebenen Fahrt passt, und drückt „Prüfen“.",
  answer: "Die fünf Geschwindigkeiten in m/s, eine je Stufe.",
  correct:
    "Richtig, wenn die Säulen die Eigenschaft der Aufgabe haben (bei der dritten Fahrt genau die gegebenen Werte); welche Zahlen es bei den anderen genau sind, ist egal.",
  mistakes: [
    "Alle Säulen gleich hoch gezeichnet, obwohl sich die Geschwindigkeit ändern soll.",
    "Beim Abbremsen springt die Geschwindigkeit auf 0, statt Stufe für Stufe kleiner zu werden.",
    "Stillstand mit einer Säule gezeichnet, die nicht null hoch ist.",
    "Von Anfang an schneller werdend gezeichnet, obwohl das Auto zuerst stehen soll.",
  ],
};
