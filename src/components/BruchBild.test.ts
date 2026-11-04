import { expect, test } from "vite-plus/test";
import { clampNenner, clampZaehler, describeBild, sectorPath, stripPart } from "./BruchBild.ts";

test("the numerator stays between 0 and the denominator, the denominator between 2 and 12", () => {
  expect(clampZaehler(5, 4)).toBe(4);
  expect(clampZaehler(-1, 4)).toBe(0);
  expect(clampZaehler(3, 4)).toBe(3);
  expect(clampNenner(1)).toBe(2);
  expect(clampNenner(20)).toBe(12);
  expect(clampNenner(7)).toBe(7);
});

test("the parts of a strip are equal and fill the whole width", () => {
  for (let nenner = 2; nenner <= 12; nenner++) {
    const last = stripPart(nenner - 1, nenner);
    expect(last.x + last.width).toBeCloseTo(100, 0);
    expect(stripPart(0, nenner).x).toBe(0);
  }
});

test("a circle sector path starts at the middle and closes", () => {
  expect(sectorPath(0, 4)).toMatch(/^M50 50 L50 5 A45 45 0 0 1 95 50 Z$/);
  expect(sectorPath(0, 2)).toMatch(/ 0 0 1 /);
});

test("the picture is described with the denominator and numerator", () => {
  expect(describeBild("kreis", 8, 3)).toBe("Ein Kreis in 8 gleich große Teile geteilt, 3 davon ausgemalt.");
  expect(describeBild("rechteck", 4, 1)).toContain("Rechteck");
});
