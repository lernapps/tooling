import { expect, test } from "vite-plus/test";
import { apply, factors, fill } from "./Faktorstreifen.ts";

test("erweitern offers 1 to 6 as long as the strip has at most 24 parts", () => {
  expect(factors({ z: 3, n: 4 }, "erweitern")).toEqual([1, 2, 3, 4, 5, 6]);
  expect(factors({ z: 3, n: 8 }, "erweitern")).toEqual([1, 2, 3]);
});

test("kuerzen offers the common divisors", () => {
  expect(factors({ z: 12, n: 18 }, "kuerzen")).toEqual([1, 2, 3, 6]);
  expect(factors({ z: 3, n: 8 }, "kuerzen")).toEqual([1]);
});

test("the value stays the same: z/n and the result are equal fractions", () => {
  for (const f of factors({ z: 3, n: 4 }, "erweitern")) {
    const result = apply({ z: 3, n: 4 }, "erweitern", f);
    expect(result.z * 4).toBe(3 * result.n);
  }
  for (const f of factors({ z: 12, n: 18 }, "kuerzen")) {
    const result = apply({ z: 12, n: 18 }, "kuerzen", f);
    expect(Number.isInteger(result.z)).toBe(true);
    expect(result.z * 18).toBe(12 * result.n);
  }
});

test("fill puts the numbers into a label", () => {
  expect(fill("mit {f}: {z}/{n}", { z: 6, n: 8 }, 2)).toBe("mit 2: 6/8");
});
