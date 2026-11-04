// The logic of BruchEinteilung.vue, a strip that is the whole: the learner chooses into how many equal parts it is
// divided and colours parts. Pure functions, which the unit test covers. It is an exploration, not an exercise.

/** The fewest and the most equal parts the strip can have. */
export const MIN_PARTS = 2;
export const MAX_PARTS = 12;
/** The parts the strip starts with, none coloured. */
export const START_PARTS = 4;

/** The numbers of parts the learner can choose, in order. */
export function choices(): number[] {
  return Array.from({ length: MAX_PARTS - MIN_PARTS + 1 }, (_, i) => MIN_PARTS + i);
}

/** A strip of `parts` equal parts, none coloured. */
export function empty(parts: number): boolean[] {
  const n = Math.min(MAX_PARTS, Math.max(MIN_PARTS, Math.round(parts)));
  return Array.from({ length: n }, () => false);
}

/** The strip with the part at `index` coloured, or uncoloured when it was coloured. */
export function toggle(coloured: readonly boolean[], index: number): boolean[] {
  return coloured.map((on, i) => (i === index ? !on : on));
}

/** The number of coloured parts. */
export function count(coloured: readonly boolean[]): number {
  return coloured.filter(Boolean).length;
}

/** A text of the props with {z} for the coloured parts, {n} for all parts and {i} for a part's number. */
export function fill(text: string, coloured: readonly boolean[], index = 0): string {
  return text
    .replace(/\{z\}/g, String(count(coloured)))
    .replace(/\{n\}/g, String(coloured.length))
    .replace(/\{i\}/g, String(index));
}
