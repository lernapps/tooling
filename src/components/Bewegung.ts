// Shared helpers of the diagram components: a drive of five stretches of 2 s each, with one speed per stretch.
// Only whole stretches have a constant speed; the distance between two points in time follows from them.

/** Seconds of one stretch. */
export const STRETCH = 2;
/** The number of stretches: together 10 s. */
export const STRETCHES = 5;
/** The length of the drive in seconds. */
export const DURATION = STRETCH * STRETCHES;
/** The largest speed in m/s the components set. */
export const TOP_SPEED = 10;
/** The longest distance in m a drive can cover: five stretches at the top speed. */
export const TOP_DISTANCE = TOP_SPEED * DURATION;

/** A record of src/data/fahrten.yaml: a name and the five speeds. */
export interface Fahrt {
  id: string;
  name: string;
  beschreibung: string;
  v1: number;
  v2: number;
  v3: number;
  v4: number;
  v5: number;
}

/** The five speeds of a record. */
export const speedsOf = (fahrt: Fahrt): number[] => [fahrt.v1, fahrt.v2, fahrt.v3, fahrt.v4, fahrt.v5];

/** The distance in m covered at time `t` (0 to 10 s) by a drive with these speeds. */
export function distanceAt(speeds: readonly number[], t: number): number {
  const time = Math.max(0, Math.min(DURATION, t));
  let distance = 0;
  for (let i = 0; i < speeds.length; i++) {
    const inStretch = Math.max(0, Math.min(STRETCH, time - i * STRETCH));
    distance += (speeds[i] ?? 0) * inStretch;
  }
  return distance;
}

/** The corners of the distance-time line: the distance at 0, 2, 4, 6, 8 and 10 s. */
export function pathPoints(speeds: readonly number[]): { t: number; s: number }[] {
  return Array.from({ length: speeds.length + 1 }, (_, i) => ({ t: i * STRETCH, s: distanceAt(speeds, i * STRETCH) }));
}

/** A text with {name} placeholders filled in from `values`. */
export function fillText(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = values[name];
    return value === undefined ? whole : String(value).replace(".", ",");
  });
}
