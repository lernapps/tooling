// The logic of BruchErweitern.vue: a fraction a/b as a strip, and the same amount expanded (numerator and denominator
// times k) or reduced (both divided by k). Pure functions, tested in BruchErweitern.test.ts.

/** Whether the fraction is expanded or reduced. */
export type Mode = "erweitern" | "kuerzen";

/** The fraction after the step: numerator z of n parts. */
export interface Fraction {
  z: number;
  n: number;
}

/** The greatest common divisor of two positive whole numbers. */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * The factors or divisors the learner can choose, from 1 up: expanding takes 1 to `max`; reducing takes the common
 * divisors of numerator and denominator, so that the result stays whole.
 */
export function steps(a: number, b: number, mode: Mode, max = 6): number[] {
  if (mode === "erweitern") return Array.from({ length: max }, (_, i) => i + 1);
  const g = gcd(a, b);
  return Array.from({ length: g }, (_, i) => i + 1).filter((d) => g % d === 0);
}

/** The fraction a/b after expanding with k or reducing by k. */
export function apply(a: number, b: number, k: number, mode: Mode): Fraction {
  return mode === "erweitern" ? { z: a * k, n: b * k } : { z: a / k, n: b / k };
}

/** A text with {a}, {b}, {k}, {z} and {n} filled in. */
export function fill(text: string, a: number, b: number, k: number, mode: Mode): string {
  const { z, n } = apply(a, b, k, mode);
  return text
    .replace(/\{a\}/g, String(a))
    .replace(/\{b\}/g, String(b))
    .replace(/\{k\}/g, String(k))
    .replace(/\{z\}/g, String(z))
    .replace(/\{n\}/g, String(n));
}
