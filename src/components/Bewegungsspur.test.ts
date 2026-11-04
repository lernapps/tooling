import { expect, test } from "vite-plus/test";
import { abstaende, abstandsText, art, gueltig, ortBei, reihen, sichtbar } from "./Bewegungsspur.ts";

const schneller = [0, 2, 6, 12, 20, 30];
const gleich = [0, 6, 12, 18, 24, 30];
const langsamer = [0, 10, 18, 24, 28, 30];
const zurueck = [0, 6, 12, 18, 12, 6, 0];

test("the kind of motion is read from the distances", () => {
  expect(art(schneller)).toBe("schneller");
  expect(art(gleich)).toBe("gleich");
  expect(art(langsamer)).toBe("langsamer");
  expect(art(zurueck)).toBe("zurueck");
  expect(art([0, 2, 8, 10, 16])).toBe("gemischt");
});

test("distances and places", () => {
  expect(abstaende(schneller)).toEqual([2, 4, 6, 8, 10]);
  expect(ortBei(gleich, 2.5)).toBe(15);
  expect(ortBei(gleich, 99)).toBe(30);
  expect(ortBei(gleich, -1)).toBe(0);
});

test("the way back gets its own row, the way out stays in the first", () => {
  expect(reihen(zurueck)).toEqual([0, 0, 0, 0, 1, 1, 1]);
  expect(reihen(schneller)).toEqual([0, 0, 0, 0, 0, 0]);
});

test("the dots appear second by second", () => {
  expect(sichtbar(gleich, 0)).toBe(1);
  expect(sichtbar(gleich, 2.9)).toBe(3);
  expect(sichtbar(gleich, 99)).toBe(6);
  expect(abstandsText("{n}-{m}: {d} m", schneller, 3)).toEqual(["0-1: 2 m", "1-2: 4 m", "2-3: 6 m"]);
  expect(abstandsText("{n}: {d} m", [0, 1.5, 3], 2)).toEqual(["0: 1,5 m", "1: 1,5 m"]);
});

test("the way back is marked in the list", () => {
  expect(abstandsText("{n}-{m}: {d} m", [0, 6, 0], 2, " (zurück)")).toEqual(["0-1: 6 m", "1-2: 6 m (zurück)"]);
});

test("a motion must fit on the track", () => {
  expect(gueltig({ name: "a", orte: gleich })).toBe(true);
  expect(gueltig({ name: "a", orte: [0, 50] })).toBe(false);
  expect(gueltig({ name: "a", orte: [0] })).toBe(false);
});
