// The logic of DiagrammZeichnen.vue: the learner sets the speed at t = 1 to 6 s so that the speed-time line fits a
// drive told in words. A task is one of the props' `aufgaben`; an answer is the 7 speeds at t = 0 to 6 s. The line
// fits when it rises, stays level or falls between the seconds as the task says (`verlauf`), starts at `start` and,
// where the task says so, ends at `ende`. The explainer checks an answer with check and gives the message of reason.

import { DAUER, TEMPO_MAX, tempoMin } from "./BewegungsDiagramm.ts";

/** One drive in words: `verlauf` has one sign per second, `+` rises, `-` falls, `0` stays level. */
export interface Aufgabe {
  text: string;
  verlauf: string;
  start: number;
  ende?: number;
}

/** The props the logic needs. */
export interface Props {
  aufgaben: readonly Aufgabe[];
  rueckwaerts?: boolean;
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes?: readonly string[];
  /** The message for a wrong second, with {a} and {b} for the seconds the stretch lies between. */
  abschnitt?: string;
  /** The message for a wrong start or end. */
  endeFalsch?: string;
  /** The instruction under the drive in words, and the sentence with the start speed ({v}). */
  anweisung?: string;
  startText?: string;
}

/** A task holds the whole drive, so that check and solution need nothing else. */
export interface Task {
  /** The index of the drive in props.aufgaben. */
  index: number;
  text: string;
  verlauf: string;
  start: number;
  /** The end speed, -99 where the task does not ask for one. */
  ende: number;
  rueckwaerts: boolean;
}

/** The speeds at t = 0, 1, ... 6 s. */
export type Answer = number[];

const KEIN_ENDE = -99;

/** The task of `seed`: seed 1 is the first drive, seed 2 the second, and so on round again. */
export function generate(seed: number, props?: Props): Task {
  const aufgaben = props?.aufgaben ?? [];
  const index = aufgaben.length === 0 ? 0 : (Math.max(1, Math.floor(seed)) - 1) % aufgaben.length;
  const aufgabe = aufgaben[index] ?? { text: "", verlauf: "0".repeat(DAUER), start: 0 };
  return {
    index,
    text: aufgabe.text,
    verlauf: aufgabe.verlauf,
    start: aufgabe.start,
    ende: aufgabe.ende ?? KEIN_ENDE,
    rueckwaerts: props?.rueckwaerts === true,
  };
}

const zeichen = (von: number, nach: number): string => (nach > von ? "+" : nach < von ? "-" : "0");

/** The first second (1 to 6) in which the line does not do what the task says, or 0. */
export function ersterFehler(task: Task, answer: Answer): number {
  for (let sekunde = 1; sekunde <= DAUER; sekunde++) {
    if (zeichen(answer[sekunde - 1]!, answer[sekunde]!) !== task.verlauf[sekunde - 1]) return sekunde;
  }
  return 0;
}

const endeStimmt = (task: Task, answer: Answer): boolean => task.ende === KEIN_ENDE || answer[DAUER] === task.ende;

/** Whether the line fits the drive in words. */
export function check(task: Task, answer: Answer): boolean {
  if (answer.length !== DAUER + 1) return false;
  const min = tempoMin(task.rueckwaerts);
  if (answer.some((v) => !Number.isInteger(v) || v < min || v > TEMPO_MAX)) return false;
  if (answer[0] !== task.start || !endeStimmt(task, answer)) return false;
  return ersterFehler(task, answer) === 0;
}

/** One right answer: every sign is one step of 1 m/s. */
export function solution(task: Task): Answer {
  const tempo = [task.start];
  for (const z of task.verlauf) tempo.push(tempo[tempo.length - 1]! + (z === "+" ? 1 : z === "-" ? -1 : 0));
  return tempo;
}

/** A wrong answer: the line stays level at the start speed, which no task asks for. */
export function wrong(task: Task): Answer {
  return Array.from({ length: DAUER + 1 }, () => task.start);
}

/** The speeds of the drive with the signs swapped, as far as the limits allow (the mistake: up and down mixed up). */
function vertauscht(task: Task): Answer {
  const min = tempoMin(task.rueckwaerts);
  const tempo = [task.start];
  for (const z of task.verlauf) {
    const schritt = z === "+" ? -1 : z === "-" ? 1 : 0;
    tempo.push(Math.min(TEMPO_MAX, Math.max(min, tempo[tempo.length - 1]! + schritt)));
  }
  return tempo;
}

const gleich = (a: Answer, b: Answer) => a.length === b.length && a.every((v, i) => v === b[i]);

/** The answers of the typical mistakes of about.mistakes: the line level, speeding up and slowing down swapped. */
export function mistakes(task: Task): (Answer | undefined)[] {
  const waagerecht = wrong(task);
  const getauscht = vertauscht(task);
  const erstes = check(task, waagerecht) ? undefined : waagerecht;
  const zweites = check(task, getauscht) || (erstes !== undefined && gleich(erstes, getauscht)) ? undefined : getauscht;
  return [erstes, zweites];
}

/** A text with {a} and {b} filled in. */
export const fill = (text: string, a: number, b: number) =>
  text.replace(/\{a\}/g, String(a)).replace(/\{b\}/g, String(b));

/** The app's message for a wrong answer: of its typical mistake, else for the first wrong stretch, else for the ends. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  if (answer.length !== DAUER + 1) return undefined;
  const index = mistakes(task).findIndex((m) => m !== undefined && gleich(m, answer));
  const typisch = index < 0 ? undefined : props.mistakes?.[index];
  if (typisch !== undefined) return typisch;
  if (answer[0] !== task.start || !endeStimmt(task, answer)) return props.endeFalsch;
  const fehler = ersterFehler(task, answer);
  if (fehler > 0 && props.abschnitt !== undefined) return fill(props.abschnitt, fehler - 1, fehler);
  return undefined;
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `Tempo bei 0 bis 6 s: ${answer.join(", ")} m/s`;
}

const satz = (text: string) => text.replace(/ +/g, " ").trim();

/** The task as a learner sees it, and one solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  const start = (props.startText ?? "").replace(/\{v\}/g, String(task.start));
  return { task: satz(`${task.text} ${props.anweisung ?? ""} ${start}`), solution: show(solution(task)) };
}

/** The task once, with {Aufgabe} for the drive in words and {Start} for the speed at 0 s. */
export function template(props: Props, _lang: string): string {
  const start = (props.startText ?? "").replace(/\{v\}/g, "{Start}");
  return satz(`{Aufgabe} ${props.anweisung ?? ""} ${start}`);
}

/** What sets a task: the drive in words and the start speed. */
export function params(task: Task, _props: Props, _lang: string): Record<string, string | number> {
  return { Aufgabe: task.text, Start: task.start };
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Eine Fahrt ist in Worten beschrieben (zum Beispiel: ein Bus fährt an, fährt gleichmäßig und bremst bis zum Halt). Das Kind stellt mit + und − das Tempo für jede Sekunde von 1 bis 6 s ein. Der Wert bei 0 s ist vorgegeben. Das Geschwindigkeit-Zeit-Diagramm zeigt die Linie dazu. Es drückt „Prüfen“ unter dem Diagramm.",
  answer: "Die sieben Tempowerte bei 0 bis 6 s; das Kind ändert nur die Werte von 1 bis 6 s.",
  correct:
    "Richtig, wenn die Linie zwischen den Sekunden steigt, gleich bleibt oder fällt, wie die Fahrt es sagt, und wenn Anfang und, wo verlangt, Ende stimmen. Mehrere Linien sind richtig.",
  mistakes: [
    "Die Linie waagerecht gelassen: das Tempo ändert sich nie. Dann wird weder beschleunigt noch abgebremst.",
    "Beschleunigen und Abbremsen vertauscht: die Linie fällt, wo sie steigen sollte, und steigt, wo sie fallen sollte.",
  ],
};
