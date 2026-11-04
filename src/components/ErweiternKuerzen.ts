// The logic of ErweiternKuerzen.vue: a fraction z/n and the same fraction after expanding (erweitern) or reducing
// (kürzen) by a factor. Pure functions, tested in ErweiternKuerzen.test.ts.

export type Modus = "erweitern" | "kuerzen";

/** The factors an expansion offers: 1 (nothing changed) up to 6. */
export const MAX_FAKTOR = 6;

/** The greatest common divisor of two whole numbers above 0. */
export function ggT(a: number, b: number): number {
  return b === 0 ? a : ggT(b, a % b);
}

/** The common divisors of z and n in order, 1 first. */
export function gemeinsameTeiler(z: number, n: number): number[] {
  const g = ggT(z, n);
  return Array.from({ length: g }, (_, i) => i + 1).filter((d) => g % d === 0);
}

/** The factors the building block offers: 1 to 6 for expanding, the common divisors of z and n for reducing. */
export function faktoren(modus: Modus, z: number, n: number): number[] {
  return modus === "erweitern" ? Array.from({ length: MAX_FAKTOR }, (_, i) => i + 1) : gemeinsameTeiler(z, n);
}

/** The fraction after expanding by or reducing with `f`. */
export function ergebnis(modus: Modus, z: number, n: number, f: number): { zaehler: number; nenner: number } {
  return modus === "erweitern" ? { zaehler: z * f, nenner: n * f } : { zaehler: z / f, nenner: n / f };
}

/** A text with {z}, {n}, {f}, {z2}, {n2} (the result) and {liste} (the offered factors) filled in. */
export function fuelle(text: string, modus: Modus, z: number, n: number, f: number): string {
  const r = ergebnis(modus, z, n, f);
  return text
    .replace(/\{z2\}/g, String(r.zaehler))
    .replace(/\{n2\}/g, String(r.nenner))
    .replace(/\{z\}/g, String(z))
    .replace(/\{n\}/g, String(n))
    .replace(/\{f\}/g, String(f))
    .replace(
      /\{liste\}/g,
      faktoren(modus, z, n)
        .filter((d) => d > 1)
        .join(", "),
    );
}
