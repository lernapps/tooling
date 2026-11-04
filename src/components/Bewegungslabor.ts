// Logic of the Bewegungslabor: a ride of 20 s in four sections of 5 s. In each section the speed changes in a straight
// line from the speed at its start to the chosen speed at its end. The distance from the start point follows from it.

export const SECTIONS = 4;
export const SECTION_SECONDS = 5;
export const TOTAL_SECONDS = SECTIONS * SECTION_SECONDS;
/** The speed in m/s at the start of the ride. */
export const START_SPEED = 10;
export const MAX_SPEED = 20;
export const SPEED_STEP = 5;
/** The fixed scale of the diagrams. */
export const S_MIN = -400;
export const S_MAX = 400;

export interface Section {
  /** The speed in m/s at the end of the section, 0 to MAX_SPEED in steps of SPEED_STEP. */
  end: number;
  /** Whether the section goes backwards (towards and past the start point). */
  back: boolean;
}

export type Kind = "faster" | "steady" | "slower" | "stopped";

/** The ride the lab starts with: 10 m/s all the time, forwards. */
export function initial(): Section[] {
  return Array.from({ length: SECTIONS }, () => ({ end: START_SPEED, back: false }));
}

/** The speed in m/s at the start of section i (0-based). */
export function startSpeed(sections: Section[], i: number): number {
  return i === 0 ? START_SPEED : (sections[i - 1]?.end ?? START_SPEED);
}

/** What happens to the speed in section i. */
export function kind(sections: Section[], i: number): Kind {
  const from = startSpeed(sections, i);
  const to = sections[i]?.end ?? from;
  if (from === 0 && to === 0) return "stopped";
  if (to > from) return "faster";
  if (to < from) return "slower";
  return "steady";
}

/** Whether section i can go backwards: it needs some speed. */
export function canGoBack(sections: Section[], i: number): boolean {
  return Math.max(startSpeed(sections, i), sections[i]?.end ?? 0) > 0;
}

/** The speed in m/s at time t (0 to 20 s). */
export function speedAt(sections: Section[], t: number): number {
  const clamped = Math.min(Math.max(t, 0), TOTAL_SECONDS);
  const i = Math.min(Math.floor(clamped / SECTION_SECONDS), SECTIONS - 1);
  const from = startSpeed(sections, i);
  const to = sections[i]?.end ?? from;
  return from + ((to - from) * (clamped - i * SECTION_SECONDS)) / SECTION_SECONDS;
}

/** The distance in m from the start point at the end of each section (and 0 at the start): five values. */
export function distances(sections: Section[]): number[] {
  const values = [0];
  for (let i = 0; i < SECTIONS; i++) {
    const section = sections[i];
    const average = (startSpeed(sections, i) + (section?.end ?? 0)) / 2;
    const sign = section?.back && canGoBack(sections, i) ? -1 : 1;
    values.push((values[i] ?? 0) + sign * average * SECTION_SECONDS);
  }
  return values;
}

/** The distance in m at time t. Inside a section the speed changes evenly, so the distance bends. */
export function distanceAt(sections: Section[], t: number): number {
  const clamped = Math.min(Math.max(t, 0), TOTAL_SECONDS);
  const i = Math.min(Math.floor(clamped / SECTION_SECONDS), SECTIONS - 1);
  const section = sections[i];
  const from = startSpeed(sections, i);
  const to = section?.end ?? from;
  const tau = clamped - i * SECTION_SECONDS;
  const sign = section?.back && canGoBack(sections, i) ? -1 : 1;
  const run = from * tau + ((to - from) * tau * tau) / (2 * SECTION_SECONDS);
  return (distances(sections)[i] ?? 0) + sign * run;
}

/** Points (t, v) of the speed-time diagram: the corners between the sections. */
export function speedPoints(sections: Section[]): [number, number][] {
  const points: [number, number][] = [[0, START_SPEED]];
  for (let i = 0; i < SECTIONS; i++) points.push([(i + 1) * SECTION_SECONDS, sections[i]?.end ?? 0]);
  return points;
}

/** Points (t, s) of the distance-time diagram, every half second. */
export function distancePoints(sections: Section[]): [number, number][] {
  const points: [number, number][] = [];
  for (let k = 0; k <= TOTAL_SECONDS * 2; k++) points.push([k / 2, distanceAt(sections, k / 2)]);
  return points;
}

/** Fills {name} placeholders of a text. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

/** The values at 0, 5, 10, 15 and 20 s as a text for the diagram's description. */
export function valuesText(values: number[]): string {
  return values.map((value) => String(Math.round(value * 10) / 10).replace(".", ",")).join(", ");
}
