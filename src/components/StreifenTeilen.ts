// The logic of StreifenTeilen.vue: a strip of n equal fields, z of them coloured, and the same strip cut finer
// (erweitern: every field into k equal parts) or put together coarser (kuerzen: k fields into one). The coloured part
// of the whole stays the same; only the numbers change. Pure functions, which the build tests.

export type Richtung = "erweitern" | "kuerzen";

/** The strips the learner sees: the given one and the one made from it with the factor k. */
export interface Streifen {
  n: number;
  z: number;
}

/** The greatest common divisor of two positive whole numbers. */
export function ggt(a: number, b: number): number {
  return b === 0 ? a : ggt(b, a % b);
}

/**
 * The factors the learner can choose: erweitern 1 to `max`; kuerzen every common divisor of n and z, in ascending
 * order (1 is always one of them: the strip as it is).
 */
export function faktoren(n: number, z: number, richtung: Richtung, max = 6): number[] {
  if (richtung === "erweitern") return Array.from({ length: max }, (_, i) => i + 1);
  const g = ggt(n, z);
  return Array.from({ length: g }, (_, i) => i + 1).filter((k) => g % k === 0);
}

/** The strip made from (n, z) with the factor k. */
export function ergebnis(n: number, z: number, k: number, richtung: Richtung): Streifen {
  return richtung === "erweitern" ? { n: n * k, z: z * k } : { n: n / k, z: z / k };
}

/** A text with {z}, {n}, {k}, {z2} and {n2} filled in. */
export function fill(text: string, n: number, z: number, k: number, richtung: Richtung): string {
  const r = ergebnis(n, z, k, richtung);
  return text
    .replace(/\{z2\}/g, String(r.z))
    .replace(/\{n2\}/g, String(r.n))
    .replace(/\{z\}/g, String(z))
    .replace(/\{n\}/g, String(n))
    .replace(/\{k\}/g, String(k));
}
