import { expect, test } from "vite-plus/test";
import { after, common, fill, gcd, lcm, usable } from "./BruchUmteilen.ts";

test("gcd and lcm", () => {
  expect(gcd(18, 24)).toBe(6);
  expect(lcm(3, 4)).toBe(12);
});

test("erweitern multiplies, kürzen divides, and only by a common divisor", () => {
  expect(after("erweitern", { a: 3, b: 4 }, 3)).toEqual({ a: 9, b: 12 });
  expect(after("kuerzen", { a: 8, b: 12 }, 4)).toEqual({ a: 2, b: 3 });
  expect(usable("kuerzen", 8, 12, 4)).toBe(true);
  expect(usable("kuerzen", 8, 12, 3)).toBe(false);
  expect(usable("erweitern", 3, 4, 5)).toBe(true);
});

test("vergleichen brings both fractions to the common denominator without changing their value", () => {
  expect(common({ a: 2, b: 3 }, { a: 3, b: 4 })).toEqual([
    { a: 8, b: 12 },
    { a: 9, b: 12 },
  ]);
});

test("fill replaces known placeholders only", () => {
  expect(fill("{a}/{b} und {x}", { a: 3, b: 4 })).toBe("3/4 und {x}");
});
