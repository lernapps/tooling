// The logic of BruchStreifen.vue, a strip as the whole, divided in equal pieces, of which the learner colours some.
// Pure functions; the component only draws them.

/** The fewest and the most pieces of the strip. */
export const MIN_PARTS = 2;
export const MAX_PARTS = 12;

/** `n` kept between the fewest and the most pieces, whole. */
export function clampParts(n: number): number {
  return Math.min(MAX_PARTS, Math.max(MIN_PARTS, Math.round(n)));
}

/** The pieces after the strip has `n` pieces: colours of the first ones stay, new ones are not coloured. */
export function resize(coloured: readonly boolean[], n: number): boolean[] {
  return Array.from({ length: clampParts(n) }, (_, i) => coloured[i] ?? false);
}

/** The pieces with piece `index` switched. */
export function toggle(coloured: readonly boolean[], index: number): boolean[] {
  return coloured.map((on, i) => (i === index ? !on : on));
}

/** The number of coloured pieces: the numerator. */
export function count(coloured: readonly boolean[]): number {
  return coloured.filter(Boolean).length;
}

/** A text with {z} for the numerator and {n} for the denominator filled in. */
export function fill(text: string, coloured: readonly boolean[]): string {
  return text.replace(/\{z\}/g, String(count(coloured))).replace(/\{n\}/g, String(coloured.length));
}
