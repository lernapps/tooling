import { expect, test } from "vite-plus/test";
import { fill, nachher, options, share, vorher } from "./BruchVerfeinern.ts";

test("erweitern: the coloured area stays the same and both numbers grow by the factor", () => {
  for (const [z, n] of [
    [2, 3],
    [3, 4],
    [3, 5],
  ] as const) {
    const before = share(vorher(z, n));
    for (const k of options("erweitern", z, n)) {
      const after = nachher("erweitern", z, n, k);
      expect(after.z).toBe(z * k);
      expect(after.n).toBe(n * k);
      const [c, t] = share(after);
      expect(c * before[1]).toBe(before[0] * t);
      expect(c).toBe(after.z);
      expect(t).toBe(after.n);
    }
  }
});

test("kuerzen: the common divisors, and the area stays the same", () => {
  expect(options("kuerzen", 12, 18)).toEqual([1, 2, 3, 6]);
  expect(options("kuerzen", 2, 3)).toEqual([1]);
  const before = share(vorher(12, 18));
  for (const k of options("kuerzen", 12, 18)) {
    const after = nachher("kuerzen", 12, 18, k);
    expect(after.z).toBe(12 / k);
    expect(after.n).toBe(18 / k);
    const [c, t] = share(after);
    expect(c * before[1]).toBe(before[0] * t);
  }
});

test("fill puts the numbers in", () => {
  const after = nachher("erweitern", 2, 3, 3);
  expect(fill("{z}/{n} mal {k} ist {zz}/{nn}", 2, 3, 3, after)).toBe("2/3 mal 3 ist 6/9");
});
