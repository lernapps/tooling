import { expect, test } from "vite-plus/test";
import { ergebnis, faktoren, fill, ggt } from "./StreifenTeilen.ts";

test("ggt", () => {
  expect(ggt(12, 8)).toBe(4);
  expect(ggt(7, 3)).toBe(1);
});

test("erweitern: the factors are 1 to max and numerator and denominator are multiplied", () => {
  expect(faktoren(3, 2, "erweitern")).toEqual([1, 2, 3, 4, 5, 6]);
  expect(ergebnis(3, 2, 4, "erweitern")).toEqual({ n: 12, z: 8 });
  expect(ergebnis(3, 2, 1, "erweitern")).toEqual({ n: 3, z: 2 });
});

test("kuerzen: the factors are the common divisors, and both numbers are divided", () => {
  expect(faktoren(12, 8, "kuerzen")).toEqual([1, 2, 4]);
  expect(faktoren(9, 4, "kuerzen")).toEqual([1]);
  expect(ergebnis(12, 8, 4, "kuerzen")).toEqual({ n: 3, z: 2 });
});

test("the coloured part of the whole stays the same", () => {
  for (const [n, z, k] of [
    [3, 2, 5],
    [4, 3, 6],
  ] as const) {
    const r = ergebnis(n, z, k, "erweitern");
    expect(r.z / r.n).toBeCloseTo(z / n);
  }
});

test("fill fills in all names", () => {
  expect(fill("{z}/{n} = {z2}/{n2} mit {k}", 3, 2, 4, "erweitern")).toBe("2/3 = 8/12 mit 4");
});
