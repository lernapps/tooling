// The logic of FahrtStreifen.vue: a car on a straight road, photographed every second. The learner sets the speed of
// each of the five seconds (m/s, a minus is the other direction) and so builds a drive. A task names a kind of drive;
// the answer is the five speeds. The explainer checks them with check and gives the message of reason.
// Pure functions, which the build tests over fixed seeds (the exercise contract).

/** The props the logic needs: the task texts, the messages for typical mistakes and for what is missing. */
export interface Props {
  /** One task text per kind of drive, in the order of KINDS. */
  tasks: readonly string[];
  /** Messages of the typical mistakes, in the order of about.mistakes. */
  mistakes?: readonly string[];
  /** What a drive lacks: no braking, no turn, no speeding up, no stop, not constant. */
  missing?: readonly string[];
}

/** 0: brake, then turn around; 1: speed up, then brake to a stop; 2: keep a constant speed to the left. */
export const KINDS = 3;

export interface Task {
  kind: number;
}

/** The speed of each second, in m/s; a minus is the other direction. */
export type Answer = number[];

/** How many seconds the drive has. */
export const SECONDS = 5;
/** The largest speed the learner can set. */
export const MAX_SPEED = 6;

/** The task of `seed`: seed 1 is the first kind, then the others in turn. */
export function generate(seed: number, _props?: Props): Task {
  return { kind: (((seed - 1) % KINDS) + KINDS) % KINDS };
}

/** The position of the car at the start and after each second, in metres. */
export function positions(speeds: readonly number[]): number[] {
  const result = [0];
  for (const speed of speeds) result.push((result[result.length - 1] ?? 0) + speed);
  return result;
}

/** Whether the car brakes in second `i`: it keeps its direction (or stops) and becomes slower. */
const brakes = (v: readonly number[], i: number): boolean => {
  const now = v[i] ?? 0;
  const next = v[i + 1] ?? 0;
  return now !== 0 && now * next >= 0 && Math.abs(next) < Math.abs(now);
};

/** Whether the car speeds up in second `i`: it keeps its direction and becomes faster. */
const speedsUp = (v: readonly number[], i: number): boolean => {
  const now = v[i] ?? 0;
  const next = v[i + 1] ?? 0;
  return now * next >= 0 && Math.abs(next) > Math.abs(now);
};

/** Whether the car slows down in second `i` but still drives afterwards: braking that is not a jump to 0. */
const slows = (v: readonly number[], i: number): boolean => brakes(v, i) && (v[i + 1] ?? 0) !== 0;

/** The first second in which the car slows down (and still drives), or -1. */
const firstBrake = (v: readonly number[]) => v.findIndex((_, i) => i < v.length - 1 && slows(v, i));

/** Whether the direction is turned after second `from`: a later speed has the other sign. */
const turnsAfter = (v: readonly number[], from: number): boolean => {
  const start = v[from] ?? 0;
  return v.slice(from + 1).some((speed) => speed * start < 0);
};

/** What a drive lacks for its kind, as indices into props.missing; empty when it fits. */
export function lacking(task: Task, answer: Answer): number[] {
  if (task.kind === 0) {
    const brake = firstBrake(answer);
    if (brake < 0) return [0];
    return turnsAfter(answer, brake) ? [] : [1];
  }
  if (task.kind === 1) {
    const up = answer.findIndex((_, i) => i < answer.length - 1 && speedsUp(answer, i));
    if (up < 0) return [2];
    const brake = answer.findIndex((_, i) => i > up && i < answer.length - 1 && slows(answer, i));
    const turned = answer.some((speed) => speed * (answer.find((s) => s !== 0) ?? 0) < 0);
    return brake < 0 || turned || (answer[answer.length - 1] ?? 1) !== 0 ? [3] : [];
  }
  const first = answer[0] ?? 0;
  return first < 0 && answer.every((speed) => speed === first) ? [] : [4];
}

/** Whether `answer` is a drive of the asked kind: the property, not one model drive. */
export function check(task: Task, answer: Answer): boolean {
  return answer.length === SECONDS && lacking(task, answer).length === 0;
}

/** A right drive of each kind. */
const SOLUTIONS: Answer[] = [
  [4, 2, 0, -2, -4],
  [2, 4, 6, 3, 0],
  [-3, -3, -3, -3, -3],
];

/** A right answer. */
export function solution(task: Task): Answer {
  return [...(SOLUTIONS[task.kind] ?? SOLUTIONS[0] ?? [])];
}

/** A wrong answer: the car stands still. */
export function wrong(_task: Task): Answer {
  return [0, 0, 0, 0, 0];
}

/**
 * The answer of each typical mistake of about.mistakes (undefined when it does not fit the kind of the task):
 * 0 braking is a jump to 0 (kinds 0 and 1), 1 turning without braking (kind 0), 2 standing still is no constant
 * speed (kind 2), 3 only speeding up (kind 1).
 */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [
    task.kind <= 1 ? [4, 0, 0, 0, 0] : undefined,
    task.kind === 0 ? [4, 4, -4, -4, -4] : undefined,
    task.kind === 2 ? [0, 0, 0, 0, 0] : undefined,
    task.kind === 1 ? [1, 2, 3, 4, 5] : undefined,
  ];
}

const same = (a: readonly number[], b: readonly number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** The app's message for a wrong answer: that of a typical mistake, else what the drive lacks; none for a right one. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task).findIndex((mistaken) => mistaken !== undefined && same(mistaken, answer));
  const typical = index < 0 ? undefined : props.mistakes?.[index];
  if (typical !== undefined) return typical;
  const [missing] = lacking(task, answer);
  return missing === undefined ? undefined : props.missing?.[missing];
}

/** A drive as text: "4, 2, 0, −2, −4 m/s". */
export const show = (answer: Answer, _task?: Task, _props?: Props, _lang?: string): string =>
  `${answer.map((speed) => String(speed).replace("-", "−")).join(", ")} m/s`;

/** The task as a learner sees it, and a solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: props.tasks[task.kind] ?? "",
    solution: `Zum Beispiel ${show(solution(task))} (die Geschwindigkeit in jeder der fünf Sekunden).`,
  };
}

/** The tasks as a learner reads them: the task of the kind, as an input {Aufgabe}. */
export function template(_props: Props, _lang: string): string {
  return "{Aufgabe}";
}

/** What sets a task: its text. */
export function params(task: Task, props: Props, _lang: string): Record<string, string> {
  return { Aufgabe: props.tasks[task.kind] ?? "" };
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Ein Auto fährt auf einer geraden Straße und wird jede Sekunde fotografiert, fünf Sekunden lang. Das Kind stellt mit − und + für jede Sekunde die Geschwindigkeit in m/s ein (ein Minus heißt: in die andere Richtung) und sieht die Fotos und die Pfeile. Es baut eine Fahrt, die zur Aufgabe passt (bremsen und wenden, beschleunigen und anhalten, gleichbleibend nach links fahren) und drückt „Prüfen“.",
  answer: "Die fünf Geschwindigkeiten in m/s, eine je Sekunde.",
  correct:
    "Richtig, wenn die Fahrt die Eigenschaft der Aufgabe hat; welche Zahlen es genau sind, ist egal. Bremsen zählt nur, wenn das Auto dabei noch fährt (kein Sprung auf 0).",
  mistakes: [
    "Bremsen als Sprung auf 0 m/s: Die Geschwindigkeit springt auf null, statt kleiner zu werden.",
    "Wenden ohne Bremsen: Das Vorzeichen wechselt, ohne dass das Auto vorher langsamer wird.",
    "Stillstand statt gleichbleibender Fahrt nach links: alle Werte 0.",
    "Nur beschleunigen: Das Auto wird immer schneller und hält am Ende nicht an.",
  ],
};
