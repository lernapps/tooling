// The logic of DiagrammEinstellen: the learner sets the speed at the end of each of the four sections of the ride so
// that it fits a story ("faster, steady, slower, slower"). Pure functions, which the build tests over fixed seeds (the
// exercise contract). A task is the number of a story; an answer is the four end speeds. What counts is how the speed
// changes in each section (faster, steady, slower, stopped), not the exact numbers.
import { START_SPEED, initial, kind, type Kind, type Section } from "./Bewegungslabor.ts";

/** The props the logic needs. */
export interface Props {
  /** The task, with {story}. */
  task: string;
  /** The stories, in the order of STORIES. */
  stories: readonly string[];
  /** The words for faster, steady, slower and stopped, in this order. */
  kindWords: readonly string[];
  /** The name of a section, with {n}. */
  sectionName: string;
  /** The message when a section does not fit, with {n}. */
  sectionWrong: string;
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes?: readonly string[];
}

export interface Task {
  /** The index of the story (0-based). */
  story: number;
}

/** The speeds at the end of the four sections. */
export type Answer = number[];

/** What each story asks for in its four sections, and one way to do it. */
const STORIES: { kinds: Kind[]; ends: Answer }[] = [
  { kinds: ["faster", "steady", "slower", "slower"], ends: [20, 20, 10, 0] },
  { kinds: ["steady", "slower", "stopped", "faster"], ends: [10, 0, 0, 10] },
  { kinds: ["slower", "steady", "faster", "steady"], ends: [5, 5, 15, 15] },
  { kinds: ["faster", "faster", "steady", "slower"], ends: [15, 20, 20, 10] },
  { kinds: ["slower", "slower", "stopped", "stopped"], ends: [5, 0, 0, 0] },
  { kinds: ["steady", "faster", "slower", "steady"], ends: [10, 20, 5, 5] },
];

export const STORY_COUNT = STORIES.length;

/** The task of `seed`: the stories in turn. */
export function generate(seed: number, _props?: Props): Task {
  return { story: (Math.max(seed, 1) - 1) % STORIES.length };
}

const target = (task: Task) => STORIES[task.story] ?? STORIES[0]!;

/** The sections an answer makes: its end speeds, none going backwards. */
const sectionsOf = (answer: Answer): Section[] => {
  const sections = initial();
  sections.forEach((section, i) => {
    section.end = answer[i] ?? START_SPEED;
  });
  return sections;
};

/** How the speed changes in each section of an answer. */
export const kindsOf = (answer: Answer): Kind[] => {
  const sections = sectionsOf(answer);
  return sections.map((_, i) => kind(sections, i));
};

/** The first section (1-based) of the answer that does not fit the story, or 0 when all fit. */
export function firstWrong(task: Task, answer: Answer): number {
  const wanted = target(task).kinds;
  const given = kindsOf(answer);
  const index = wanted.findIndex((k, i) => given[i] !== k);
  return index + 1;
}

/** Whether the answer fits the story in every section. */
export function check(task: Task, answer: Answer): boolean {
  return firstWrong(task, answer) === 0;
}

/** One right answer. */
export function solution(task: Task): Answer {
  return [...target(task).ends];
}

/** A wrong answer: the speed never changes. */
export function wrong(_task: Task): Answer {
  return [START_SPEED, START_SPEED, START_SPEED, START_SPEED];
}

/** The answers of the typical mistakes: nothing changed; faster and slower swapped (the speeds mirrored at 10 m/s). */
export function mistakes(task: Task): (Answer | undefined)[] {
  return [wrong(task), solution(task).map((end) => 2 * START_SPEED - end)];
}

/** A text of the props with {n} and {story} filled in. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));

/** The app's message for a wrong answer: that of its typical mistake, else the first section that does not fit. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  if (check(task, answer)) return undefined;
  const index = mistakes(task).findIndex((mistaken) => mistaken !== undefined && mistaken.join() === answer.join());
  const message = index < 0 ? undefined : props.mistakes?.[index];
  if (message !== undefined) return message;
  return fill(props.sectionWrong, { n: firstWrong(task, answer) });
}

const kindWord = (props: Props, k: Kind) => props.kindWords[["faster", "steady", "slower", "stopped"].indexOf(k)] ?? k;

/** The task as a learner sees it, and one solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: fill(props.task, { story: props.stories[task.story] ?? "" }),
    solution: target(task)
      .kinds.map((k, i) => `${fill(props.sectionName, { n: i + 1 })}: ${kindWord(props, k)}`)
      .join("; "),
  };
}

/** The task as a learner reads it, with {story}. */
export function template(props: Props, _lang: string): string {
  return props.task;
}

/** What sets a task: the story. */
export function params(task: Task, props: Props, _lang: string): Record<string, string> {
  return { story: props.stories[task.story] ?? "" };
}

/** An answer as text: the four end speeds. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return answer.map((end) => `${end}`).join(", ") + " m/s";
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Das Kind liest eine Geschichte über eine Fahrt von 20 Sekunden in vier Abschnitten. Es stellt mit vier Reglern das Tempo am Ende jedes Abschnitts ein (0 bis 20 m/s in 5er-Schritten) und sieht dabei das Weg-Zeit- und das Geschwindigkeit-Zeit-Diagramm seiner Fahrt. Das Tempo am Anfang ist 10 m/s. Dann drückt es „Prüfen“.",
  answer: "Die vier Tempi am Ende der Abschnitte, zum Beispiel 20, 20, 10, 0 m/s.",
  correct:
    "Richtig, wenn in jedem Abschnitt das Tempo so wechselt, wie die Geschichte es sagt (schneller, gleichbleibend, langsamer, Stillstand). Welche Zahlen es genau sind, ist egal.",
  mistakes: [
    "Alle Regler auf 10 m/s gelassen: Das Tempo ändert sich nie.",
    "Schneller und langsamer vertauscht: Das Tempo geht dort hoch, wo es sinken soll, und umgekehrt.",
  ],
};
