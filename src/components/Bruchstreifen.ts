// The logic of Bruchstreifen.vue, the strip learners divide into equal parts and colour. Pure functions, which the
// tests run. The strip is the whole; the number of parts is the denominator, the number of coloured parts the numerator.

/** The modes of the strip. */
export type Modus = "anteil" | "erweitern" | "kuerzen" | "vergleichen";

export const MIN_NENNER = 1;
export const MAX_NENNER = 12;

/** The denominator kept within the strip's limits. */
export function begrenzen(n: number, max: number = MAX_NENNER): number {
  return Math.min(Math.max(Math.round(n), MIN_NENNER), max);
}

/** The parts after the denominator changed: nothing is coloured on a new division (the whole stays, the parts are new). */
export function neueTeilung(n: number, max: number = MAX_NENNER): boolean[] {
  return Array.from({ length: begrenzen(n, max) }, () => false);
}

/** The strip of the fraction z/n: n parts, the first z coloured. */
export function bruchStreifen(z: number, n: number): boolean[] {
  return Array.from({ length: n }, (_, i) => i < z);
}

/** The parts after a tap on part `index`: that part changes colour. */
export function umschalten(teile: readonly boolean[], index: number): boolean[] {
  return teile.map((gefaerbt, i) => (i === index ? !gefaerbt : gefaerbt));
}

/** The number of coloured parts: the numerator. */
export function zaehler(teile: readonly boolean[]): number {
  return teile.filter(Boolean).length;
}

export interface Bruch {
  z: number;
  n: number;
}

/** The fraction z/n expanded by k: numerator and denominator times k. */
export function erweitern(bruch: Bruch, k: number): Bruch {
  return { z: bruch.z * k, n: bruch.n * k };
}

/** The fraction z/n reduced by t, or undefined when t does not divide both numbers. */
export function kuerzen(bruch: Bruch, t: number): Bruch | undefined {
  if (t < 1 || bruch.z % t !== 0 || bruch.n % t !== 0) return undefined;
  return { z: bruch.z / t, n: bruch.n / t };
}

/** The numbers above 1 that divide numerator and denominator both. */
export function gemeinsameTeiler(bruch: Bruch): number[] {
  const teiler: number[] = [];
  for (let t = 2; t <= Math.min(bruch.z, bruch.n); t++) if (kuerzen(bruch, t)) teiler.push(t);
  return teiler;
}

/** Which fraction is larger: -1 when a is smaller, 0 when they are equal, 1 when a is larger. */
export function vergleichen(a: Bruch, b: Bruch): -1 | 0 | 1 {
  const links = a.z * b.n;
  const rechts = b.z * a.n;
  return links < rechts ? -1 : links > rechts ? 1 : 0;
}

/** A text with {n}, {z}, {i} and {k} filled in. */
export function fuellen(text: string, werte: { n?: number; z?: number; i?: number; k?: number }): string {
  return text
    .replace(/\{n\}/g, String(werte.n ?? ""))
    .replace(/\{z\}/g, String(werte.z ?? ""))
    .replace(/\{i\}/g, String(werte.i ?? ""))
    .replace(/\{k\}/g, String(werte.k ?? ""));
}
