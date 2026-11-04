import { expect, test } from "vite-plus/test";
import { clampNenner, clampZaehler } from "./BruchBild.ts";

// The building block keeps the numerator within the denominator when the denominator gets smaller.
test("lowering the denominator pulls the numerator down with it", () => {
  const nenner = clampNenner(3);
  expect(clampZaehler(5, nenner)).toBe(3);
});

test("the numerator can be 0 and the denominator cannot drop below 2", () => {
  expect(clampZaehler(0, 4)).toBe(0);
  expect(clampNenner(1)).toBe(2);
});
