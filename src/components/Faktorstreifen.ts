// The logic of Faktorstreifen.vue: two strips of the same length, above the fraction z/n, below the same fraction
// expanded (erweitern) or reduced (kuerzen) by a number f the learner chooses. Pure functions, which the test checks.

export type Direction = "erweitern" | "kuerzen";

/** The fraction a strip shows: z of n equal parts coloured. */
export interface Fraction {
  z: number;
  n: number;
}

/** The numbers of the expansion: 1 (nothing changes) to 6, as long as the strip has at most 24 parts. */
const MAX_FACTOR = 6;
const MAX_PARTS = 24;

/** The numbers the learner may choose: for erweitern 1 to 6, for kuerzen the common divisors of z and n. */
export function factors(fraction: Fraction, direction: Direction): number[] {
  const all = Array.from({ length: MAX_FACTOR }, (_, i) => i + 1);
  if (direction === "erweitern") return all.filter((f) => fraction.n * f <= MAX_PARTS);
  return Array.from({ length: fraction.n }, (_, i) => i + 1).filter(
    (f) => fraction.z % f === 0 && fraction.n % f === 0,
  );
}

/** The fraction after erweitern or kuerzen with f: both numbers times f, or both divided by f. */
export function apply(fraction: Fraction, direction: Direction, f: number): Fraction {
  return direction === "erweitern"
    ? { z: fraction.z * f, n: fraction.n * f }
    : { z: fraction.z / f, n: fraction.n / f };
}

/** A text of the props with {z}, {n} (the fraction shown) and {f} filled in. */
export const fill = (text: string, fraction: Fraction, f = 1) =>
  text.replace(/\{z\}/g, String(fraction.z)).replace(/\{n\}/g, String(fraction.n)).replace(/\{f\}/g, String(f));
