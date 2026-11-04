// The logic of BruchUmteilen.vue: strips of equal height that show the same part of the whole in a finer or coarser
// division (erweitern, kürzen) or two fractions in the same division (vergleichen). Pure functions; the component
// only draws them.

export type Mode = "erweitern" | "kuerzen" | "vergleichen";

/** A strip: `b` equal pieces, the first `a` coloured. */
export interface Strip {
  a: number;
  b: number;
}

export function gcd(x: number, y: number): number {
  return y === 0 ? x : gcd(y, x % y);
}

export function lcm(x: number, y: number): number {
  return (x / gcd(x, y)) * y;
}

/** Whether the factor `k` can be used: erweitern always, kürzen only if k divides numerator and denominator. */
export function usable(mode: Mode, a: number, b: number, k: number): boolean {
  if (mode === "kuerzen") return k >= 2 && a % k === 0 && b % k === 0;
  return k >= 2;
}

/** The strip after the step: erweitern multiplies by k, kürzen divides by k. */
export function after(mode: Mode, strip: Strip, k: number): Strip {
  if (mode === "kuerzen") return { a: strip.a / k, b: strip.b / k };
  return { a: strip.a * k, b: strip.b * k };
}

/** The two fractions of vergleichen in the common denominator (the least common multiple of the denominators). */
export function common(first: Strip, second: Strip): [Strip, Strip] {
  const n = lcm(first.b, second.b);
  return [
    { a: (first.a * n) / first.b, b: n },
    { a: (second.a * n) / second.b, b: n },
  ];
}

/** A text with `{name}` placeholders filled in from `values`. */
export function fill(text: string, values: Record<string, number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}
