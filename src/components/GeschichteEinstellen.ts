// The logic of GeschichteEinstellen.vue: a short story about a ride of 30 s in three sections of 10 s. The learner says
// for each section whether the speed becomes greater ("mehr"), stays the same ("gleich") or becomes smaller
// ("weniger") compared with the section before; the speed-time diagram follows the choice.
// Pure functions, which the build tests over fixed seeds (the exercise contract).

import { MAX_SPEED, SECTIONS, clampSpeed } from "./Bewegungslabor.ts";

/** How much the speed changes when a section is "mehr" or "weniger", in m/s. */
export const STEP = 3;

/** The three choices. */
export type Choice = "mehr" | "gleich" | "weniger";
export const CHOICES: readonly Choice[] = ["mehr", "gleich", "weniger"];

/** A story: its text, the speed before the first section and what happens in each section. */
export interface Story {
  text: string;
  /** The speed before the first section, in m/s. */
  v0: number;
  c1: string;
  c2: string;
  c3: string;
}

/** The props the logic needs: the stories (from a data file), the introduction, the labels and the messages. */
export interface Props {
  stories: readonly Story[];
  task?: string;
  sectionLabel?: string;
  more?: string;
  same?: string;
  less?: string;
  mistakes?: readonly string[];
}

export interface Task {
  story: Story;
  /** The right choice for each of the three sections. */
  solution: Choice[];
}

/** The choice of a section for each of the three sections: the answer. */
export type Answer = string[];

const isChoice = (value: string): value is Choice => (CHOICES as readonly string[]).includes(value);

/** The right choices of a story. */
function choicesOf(story: Story): Choice[] {
  return [story.c1, story.c2, story.c3].map((value) => (isChoice(value) ? value : "gleich"));
}

/** The task of `seed`: the stories in turn. */
export function generate(seed: number, props: Props): Task {
  const stories = props.stories;
  const story = stories[(Math.max(1, Math.floor(seed)) - 1) % stories.length] as Story;
  return { story, solution: choicesOf(story) };
}

/** The change of speed a choice means, in m/s. */
const delta = (choice: string) => (choice === "mehr" ? STEP : choice === "weniger" ? -STEP : 0);

/** The speed of each section for the choices made (a section not chosen yet counts as "gleich"). */
export function speedsFor(v0: number, choices: readonly string[]): number[] {
  const speeds: number[] = [];
  let speed = clampSpeed(v0);
  for (let i = 0; i < SECTIONS; i++) {
    speed = Math.min(MAX_SPEED, Math.max(0, speed + delta(choices[i] ?? "gleich")));
    speeds.push(speed);
  }
  return speeds;
}

/** Whether the three choices are the story's. */
export function check(task: Task, answer: Answer): boolean {
  return answer.length === SECTIONS && task.solution.every((choice, i) => answer[i] === choice);
}

/** The right answer. */
export function solution(task: Task): Answer {
  return [...task.solution];
}

const flip = (choice: Choice): Choice => (choice === "mehr" ? "weniger" : "mehr");

/** A wrong answer: the direction of the first change turned around. */
export function wrong(task: Task): Answer {
  const index = task.solution.findIndex((choice) => choice !== "gleich");
  return task.solution.map((choice, i) => (i === index ? flip(choice) : choice));
}

/** The answers of the typical mistakes of about.mistakes: "gleich" for a change, a change for "gleich", the turned direction. */
export function mistakes(task: Task): (Answer | undefined)[] {
  const change = task.solution.findIndex((choice) => choice !== "gleich");
  const same = task.solution.findIndex((choice) => choice === "gleich");
  return [
    change < 0 ? undefined : task.solution.map((choice, i) => (i === change ? "gleich" : choice)),
    same < 0 ? undefined : task.solution.map((choice, i) => (i === same ? "mehr" : choice)),
    change < 0 ? undefined : wrong(task),
  ];
}

/** A text with {n} filled in. */
export const fill = (text: string, n: number) => text.replace(/\{n\}/g, String(n));

/** The app's message for the first wrong section: which kind of mistake it is, or none when the answer is right. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = task.solution.findIndex((choice, i) => answer[i] !== choice);
  if (index < 0) return undefined;
  const right = task.solution[index];
  const chosen = answer[index];
  const kind = chosen === "gleich" ? 0 : right === "gleich" ? 1 : 2;
  const message = props.mistakes?.[kind];
  return message === undefined ? undefined : fill(message, index + 1);
}

const label = (choice: string, props: Props) =>
  choice === "mehr" ? (props.more ?? choice) : choice === "weniger" ? (props.less ?? choice) : (props.same ?? choice);

/** An answer as text, short. */
export function show(answer: Answer, _task?: Task, props?: Props, _lang?: string): string {
  return answer.map((choice) => (props ? label(choice, props) : choice)).join(", ");
}

/** The task as a learner sees it, and its solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return {
    task: `${props.task ?? ""} ${task.story.text}`.trim(),
    solution: task.solution
      .map((choice, i) => `${fill(props.sectionLabel ?? "{n}", i + 1)}: ${label(choice, props)}`)
      .join("; "),
  };
}

/** The task once, with {geschichte} for the story. */
export function template(props: Props, _lang: string): string {
  return `${props.task ?? ""} {geschichte}`.trim();
}

/** What sets a task: its story. */
export function params(task: Task, _props: Props, _lang: string): Record<string, string> {
  return { geschichte: task.story.text };
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Eine kurze Geschichte erzählt eine Fahrt von 30 s in drei Abschnitten zu je 10 s. Das Kind wählt für jeden Abschnitt, ob die Geschwindigkeit größer wird, gleich bleibt oder kleiner wird, im Vergleich zum Abschnitt davor. Das Geschwindigkeit-Zeit-Diagramm zeichnet sich nach der Wahl. Dann drückt es „Prüfen“.",
  answer: "Drei Wahlfelder, eines je Abschnitt: größer, gleich oder kleiner.",
  correct: "Richtig, wenn alle drei Abschnitte zur Geschichte passen.",
  mistakes: [
    "„Gleich“ gewählt, obwohl sich die Geschwindigkeit in der Geschichte ändert.",
    "Eine Änderung gewählt, obwohl die Geschwindigkeit in der Geschichte gleich bleibt.",
    "Die Richtung der Änderung vertauscht: größer statt kleiner oder umgekehrt.",
  ],
};
