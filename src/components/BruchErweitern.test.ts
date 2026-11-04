import { expect, test } from "vite-plus/test";
import { apply, fill, gcd, steps } from "./BruchErweitern.ts";

test("gcd finds the greatest common divisor", () => {
  expect(gcd(12, 18)).toBe(6);
  expect(gcd(5, 7)).toBe(1);
});

test("expanding offers the factors 1 to max; reducing only the common divisors", () => {
  expect(steps(2, 3, "erweitern", 4)).toEqual([1, 2, 3, 4]);
  expect(steps(12, 18, "kuerzen")).toEqual([1, 2, 3, 6]);
  expect(steps(5, 7, "kuerzen")).toEqual([1]);
});

test("apply multiplies or divides numerator and denominator by the same number", () => {
  expect(apply(2, 3, 3, "erweitern")).toEqual({ z: 6, n: 9 });
  expect(apply(6, 9, 3, "kuerzen")).toEqual({ z: 2, n: 3 });
  expect(apply(2, 3, 1, "erweitern")).toEqual({ z: 2, n: 3 });
});

test("fill replaces the placeholders", () => {
  expect(fill("{a}/{b} · {k} = {z}/{n}", 2, 3, 3, "erweitern")).toBe("2/3 · 3 = 6/9");
});
