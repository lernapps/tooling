// The logic of Streifen.vue: two strips of the same length (the same whole). Above, the fraction z/n; below, the same
// fraction expanded (erweitern) or reduced (kürzen) with a factor the learner chooses. Pure functions, which the unit
// test covers. It is an exploration, not an exercise.

export type Mode = "erweitern" | "kuerzen";

/** The fractions above and below: z of n parts, and z2 of n2 parts. */
export interface Pair {
  z: number;
  n: number;
  z2: number;
  n2: number;
}

/** The common divisors of z and n, smallest first (1 is always one). */
export function commonDivisors(z: number, n: number): number[] {
  const found: number[] = [];
  for (let d = 1; d <= Math.min(z, n); d++) if (z % d === 0 && n % d === 0) found.push(d);
  return found;
}

/** The factors the learner can choose: 1 to `max` when expanding, the common divisors when reducing. */
export function factors(mode: Mode, z: number, n: number, max = 6): number[] {
  return mode === "erweitern" ? Array.from({ length: max }, (_, i) => i + 1) : commonDivisors(z, n);
}

/** The fraction below for the factor k: both numbers times k, or both divided by k. */
export function pairFor(mode: Mode, z: number, n: number, k: number): Pair {
  return mode === "erweitern" ? { z, n, z2: z * k, n2: n * k } : { z, n, z2: z / k, n2: n / k };
}

/** The parts of a strip as coloured (true) or not: the first z of n. */
export function parts(z: number, n: number): boolean[] {
  return Array.from({ length: n }, (_, i) => i < z);
}

/** A text of the props with {z}, {n}, {k}, {z2} and {n2} filled in. */
export function fill(text: string, pair: Pair, k: number): string {
  return text
    .replace(/\{z2\}/g, String(pair.z2))
    .replace(/\{n2\}/g, String(pair.n2))
    .replace(/\{z\}/g, String(pair.z))
    .replace(/\{n\}/g, String(pair.n))
    .replace(/\{k\}/g, String(k));
}
