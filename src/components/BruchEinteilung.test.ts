import { expect, test } from "vite-plus/test";
import { choices, count, empty, fill, MAX_PARTS, MIN_PARTS, toggle } from "./BruchEinteilung.ts";

test("the strip has 2 to 12 equal parts and starts uncoloured", () => {
  expect(choices()[0]).toBe(MIN_PARTS);
  expect(choices().at(-1)).toBe(MAX_PARTS);
  expect(empty(4)).toEqual([false, false, false, false]);
  expect(empty(1)).toHaveLength(MIN_PARTS);
  expect(empty(40)).toHaveLength(MAX_PARTS);
});

test("tapping a part colours it, tapping again clears it, and the others stay", () => {
  const once = toggle(empty(4), 1);
  expect(once).toEqual([false, true, false, false]);
  expect(count(once)).toBe(1);
  expect(toggle(once, 1)).toEqual(empty(4));
  expect(count(toggle(once, 3))).toBe(2);
});

test("the count text fills in the coloured and all parts", () => {
  const strip = toggle(toggle(empty(5), 0), 4);
  expect(fill("{z} von {n} Teilen", strip)).toBe("2 von 5 Teilen");
  expect(fill("Teil {i}", strip, 3)).toBe("Teil 3");
});
