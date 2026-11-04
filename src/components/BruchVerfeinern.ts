// The logic of BruchVerfeinern.vue, which shows a fraction z/n of a rectangle before and after a change of the
// division: refined (erweitern: each part is cut into k smaller ones) or merged (kuerzen: k parts are put together).
// The coloured area stays the same. Pure functions, which the build tests.

export type Modus = "erweitern" | "kuerzen";

/** One picture: a grid of columns times rows equal fields, the first `coloured` columns coloured. */
export interface Bild {
  cols: number;
  rows: number;
  coloured: number;
  /** The numerator and denominator the picture shows. */
  z: number;
  n: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** The factors a learner can choose: 1 to 6 for erweitern, the common divisors of z and n for kuerzen. */
export function options(modus: Modus, z: number, n: number): number[] {
  if (modus === "erweitern") return [1, 2, 3, 4, 5, 6];
  const g = gcd(z, n);
  return Array.from({ length: g }, (_, i) => i + 1).filter((d) => g % d === 0);
}

/** The picture before the change: n columns in one row, z of them coloured. */
export function vorher(z: number, n: number): Bild {
  return { cols: n, rows: 1, coloured: z, z, n };
}

/** The picture after the change by the factor k. The coloured area is the same as before. */
export function nachher(modus: Modus, z: number, n: number, k: number): Bild {
  if (modus === "erweitern") return { cols: n, rows: k, coloured: z, z: z * k, n: n * k };
  return { cols: n / k, rows: 1, coloured: z / k, z: z / k, n: n / k };
}

/** The share of the picture that is coloured, as a fraction of its fields. */
export const share = (bild: Bild): [number, number] => [bild.coloured * bild.rows, bild.cols * bild.rows];

/** A text with {z}, {n}, {k}, {zz} and {nn} filled in. */
export function fill(text: string, z: number, n: number, k: number, after: Bild): string {
  return text
    .replace(/\{zz\}/g, String(after.z))
    .replace(/\{nn\}/g, String(after.n))
    .replace(/\{z\}/g, String(z))
    .replace(/\{n\}/g, String(n))
    .replace(/\{k\}/g, String(k));
}
