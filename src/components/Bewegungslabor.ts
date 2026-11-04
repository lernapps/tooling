// The logic of Bewegungslabor.vue: a ride of 30 s in three sections of 10 s each, with one constant speed per section.
// Pure functions: the points of the way-time and the speed-time diagram, and the texts with their numbers filled in.

/** The sections of the ride. */
export const SECTIONS = 3;
/** The duration of one section, in s. */
export const SECTION_SECONDS = 10;
/** The duration of the whole ride, in s: the time axis always runs to here. */
export const TOTAL_SECONDS = SECTIONS * SECTION_SECONDS;
/** The highest speed a slider offers, in m/s: the speed axis always runs to here. */
export const MAX_SPEED = 10;
/** The longest way of the ride, in m: the way axis always runs to here. */
export const MAX_WAY = MAX_SPEED * TOTAL_SECONDS;

export type View = "st" | "vt" | "both";

export interface Point {
  /** Time in s. */
  t: number;
  /** Way in m, or speed in m/s. */
  value: number;
}

/** A speed as the slider gives it: a whole number from 0 to MAX_SPEED. */
export function clampSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 0;
  return Math.min(MAX_SPEED, Math.max(0, Math.round(speed)));
}

/** Three speeds in m/s, each clamped; a list that is too short is filled with 0. */
export function normalise(speeds: readonly number[]): number[] {
  return Array.from({ length: SECTIONS }, (_, i) => clampSpeed(speeds[i] ?? 0));
}

/** The way covered at the start of the ride and at the end of each section, in m: four values. */
export function ways(speeds: readonly number[]): number[] {
  const result = [0];
  for (const speed of normalise(speeds)) result.push((result[result.length - 1] ?? 0) + speed * SECTION_SECONDS);
  return result;
}

/** The corners of the way-time line: time 0, 10, 20, 30 s with the way covered then. */
export function wayPoints(speeds: readonly number[]): Point[] {
  return ways(speeds).map((value, i) => ({ t: i * SECTION_SECONDS, value }));
}

/** The corners of the speed-time line: a step per section, so two corners per section. */
export function speedPoints(speeds: readonly number[]): Point[] {
  return normalise(speeds).flatMap((value, i) => [
    { t: i * SECTION_SECONDS, value },
    { t: (i + 1) * SECTION_SECONDS, value },
  ]);
}

/** The speed during the section that contains `t` (the end of the ride belongs to the last section). */
export function speedAt(speeds: readonly number[], t: number): number {
  const section = Math.min(SECTIONS - 1, Math.max(0, Math.floor(t / SECTION_SECONDS)));
  return normalise(speeds)[section] ?? 0;
}

/** A text with {n}, {v}, {v1} to {v3} and {s1} to {s3} filled in (speeds in m/s, ways in m). */
export function fill(text: string, speeds: readonly number[], n = 0): string {
  const v = normalise(speeds);
  const s = ways(speeds);
  return text
    .replace(/\{n\}/g, String(n))
    .replace(/\{v\}/g, String(v[Math.max(0, n - 1)] ?? 0))
    .replace(/\{v([1-3])\}/g, (_, i: string) => String(v[Number(i) - 1] ?? 0))
    .replace(/\{s([1-3])\}/g, (_, i: string) => String(s[Number(i)] ?? 0));
}
