import { expect, test } from "vite-plus/test";
import { clampParts, count, fill, resize, toggle } from "./BruchStreifen.ts";

test("the number of pieces stays between 2 and 12", () => {
  expect(clampParts(1)).toBe(2);
  expect(clampParts(13)).toBe(12);
  expect(clampParts(7)).toBe(7);
});

test("resize keeps the colours of the first pieces and adds uncoloured ones", () => {
  const start = [true, false, true, false];
  expect(resize(start, 6)).toEqual([true, false, true, false, false, false]);
  expect(resize(start, 2)).toEqual([true, false]);
  expect(resize(start, 1)).toHaveLength(2);
});

test("toggle switches one piece; count and fill name numerator and denominator", () => {
  const pieces = toggle([false, false, false], 1);
  expect(pieces).toEqual([false, true, false]);
  expect(count(pieces)).toBe(1);
  expect(fill("{z} von {n}", pieces)).toBe("1 von 3");
});
