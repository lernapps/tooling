import { expect, test } from "vite-plus/test";
import { commonDivisors, factors, fill, pairFor, parts } from "./Streifen.ts";

test("expanding multiplies both numbers; the factor 1 changes nothing", () => {
  expect(pairFor("erweitern", 2, 3, 1)).toEqual({ z: 2, n: 3, z2: 2, n2: 3 });
  expect(pairFor("erweitern", 2, 3, 3)).toEqual({ z: 2, n: 3, z2: 6, n2: 9 });
  expect(factors("erweitern", 2, 3)).toEqual([1, 2, 3, 4, 5, 6]);
});

test("reducing divides both numbers by a common divisor", () => {
  expect(commonDivisors(12, 18)).toEqual([1, 2, 3, 6]);
  expect(factors("kuerzen", 12, 18)).toEqual([1, 2, 3, 6]);
  expect(pairFor("kuerzen", 12, 18, 6)).toEqual({ z: 12, n: 18, z2: 2, n2: 3 });
  for (const k of factors("kuerzen", 12, 18)) {
    const pair = pairFor("kuerzen", 12, 18, k);
    expect(Number.isInteger(pair.z2) && Number.isInteger(pair.n2)).toBe(true);
    expect(pair.z2 * pair.n).toBe(pair.z * pair.n2);
  }
});

test("both strips colour the same share of the whole", () => {
  const pair = pairFor("erweitern", 2, 3, 4);
  expect(parts(pair.z2, pair.n2).filter(Boolean)).toHaveLength(8);
  expect(parts(pair.z2, pair.n2)).toHaveLength(12);
  expect(pair.z2 / pair.n2).toBeCloseTo(pair.z / pair.n);
});

test("the texts fill in the numbers", () => {
  const pair = pairFor("erweitern", 2, 3, 3);
  expect(fill("{z}/{n} = {z2}/{n2} mit {k}", pair, 3)).toBe("2/3 = 6/9 mit 3");
});
