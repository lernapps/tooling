import { expect, test } from "vite-plus/test";
import {
  S_MAX,
  V_MAX,
  fuelle,
  geschwindigkeitBei,
  geschwindigkeitPunkte,
  normalisiere,
  untereGrenze,
  wegBei,
  wegPunkte,
  wertetabelle,
  zahl,
} from "./Bewegungsmodell.ts";

test("sections: constant speed gives the way as speed times time", () => {
  const werte = [5, 0, 3, 3];
  expect(wegBei("abschnitte", werte, 2)).toBe(10);
  expect(wegBei("abschnitte", werte, 4)).toBe(10);
  expect(wegBei("abschnitte", werte, 5)).toBe(13);
  expect(wegBei("abschnitte", werte, 8)).toBe(22);
  expect(geschwindigkeitBei("abschnitte", werte, 3)).toBe(0);
});

test("nodes: the speed grows evenly, the way is the area under it", () => {
  const werte = [0, 4, 8, 8, 4];
  expect(geschwindigkeitBei("knoten", werte, 1)).toBe(2);
  expect(wegBei("knoten", werte, 2)).toBe(4);
  expect(wegBei("knoten", werte, 4)).toBe(16);
  expect(wegBei("knoten", werte, 8)).toBe(16 + 16 + 12);
});

test("a way going back never goes below the start", () => {
  const werte = normalisiere("abschnitte", "weg", [4, -12, -12, -12]);
  expect(werte[0]).toBe(4);
  expect(werte[1]).toBe(-4);
  expect(werte[2]).toBe(0);
  for (let t = 0; t <= 8; t += 0.5) expect(wegBei("abschnitte", werte, t)).toBeGreaterThanOrEqual(0);
  expect(untereGrenze("abschnitte", [4], 1)).toBe(-4);
});

test("the speed view has no negative values and stays below the limit", () => {
  expect(normalisiere("knoten", "geschwindigkeit", [-3, 50, 5, 5, 5])).toEqual([0, V_MAX, 5, 5, 5]);
});

test("the way stays on the axis for every allowed setting", () => {
  expect(wegBei("abschnitte", Array(4).fill(V_MAX), 8)).toBeLessThanOrEqual(S_MAX);
  expect(wegBei("knoten", Array(5).fill(V_MAX), 8)).toBeLessThanOrEqual(S_MAX);
});

test("points of the graphs and the table for readers without the picture", () => {
  expect(wegPunkte("abschnitte", [5, 5, 5, 5]).map((p) => p.y)).toEqual([0, 10, 20, 30, 40]);
  expect(geschwindigkeitPunkte("abschnitte", [1, 2, 3, 4])).toHaveLength(8);
  expect(geschwindigkeitPunkte("knoten", [0, 1, 2, 3, 4])).toHaveLength(5);
  expect(wertetabelle("abschnitte", "weg", [5, 5, 5, 5])[4]).toEqual({ t: 8, wert: 40 });
});

test("fuelle fills named places and leaves unknown ones", () => {
  expect(fuelle("Abschnitt {n}: {v} m/s {x}", { n: 2, v: 5 })).toBe("Abschnitt 2: 5 m/s {x}");
});

test("zahl writes a decimal comma and at most one decimal", () => {
  expect(zahl(10.3)).toBe("10,3");
  expect(zahl(16)).toBe("16");
  expect(zahl(2.04)).toBe("2");
});
