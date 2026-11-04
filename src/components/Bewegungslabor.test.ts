import { expect, test } from "vite-plus/test";
import { abschnitte, fill, geschwindigkeitBei, kurve, ticks, wegBei, zahl, DAUER, GESAMT } from "./Bewegungslabor.ts";

test("steady velocities give a straight s-t line: s = v · t", () => {
  const trip = abschnitte("st", [5, 0, 10]);
  expect(wegBei(trip, 0)).toBe(0);
  expect(wegBei(trip, 2)).toBe(10);
  expect(wegBei(trip, DAUER)).toBe(20);
  expect(wegBei(trip, 8)).toBe(20);
  expect(wegBei(trip, GESAMT)).toBe(60);
  expect(geschwindigkeitBei(trip, 5)).toBe(0);
});

test("an even change of velocity: the distance is the area under the v-t line", () => {
  const trip = abschnitte("vt", [0, 8, 8, 0]);
  expect(geschwindigkeitBei(trip, 2)).toBe(4);
  expect(wegBei(trip, DAUER)).toBe(16);
  expect(wegBei(trip, 8)).toBe(48);
  expect(wegBei(trip, GESAMT)).toBe(64);
  expect(wegBei(trip, 10)).toBe(60);
});

test("a negative velocity brings the distance from the start back down", () => {
  const trip = abschnitte("beide", [6, 6, -6, -6]);
  expect(wegBei(trip, DAUER)).toBe(24);
  expect(wegBei(trip, 6)).toBe(30);
  expect(wegBei(trip, 8)).toBe(24);
  expect(wegBei(trip, GESAMT)).toBe(0);
});

test("times outside the trip are clamped; missing values count as 0", () => {
  const trip = abschnitte("st", [5]);
  expect(wegBei(trip, -3)).toBe(0);
  expect(wegBei(trip, 99)).toBe(20);
  expect(geschwindigkeitBei(trip, 99)).toBe(0);
});

test("a curve has a point every step from 0 to 12 s", () => {
  const points = kurve(abschnitte("st", [4, 4, 4]), "s");
  expect(points).toHaveLength(49);
  expect(points[0]).toEqual({ t: 0, y: 0 });
  expect(points[48]).toEqual({ t: 12, y: 48 });
  expect(kurve(abschnitte("st", [4, 4, 4]), "v", 1)).toHaveLength(13);
});

test("ticks, numbers and texts", () => {
  expect(ticks(-6, 6, 3)).toEqual([-6, -3, 0, 3, 6]);
  expect(ticks(0, 150, 50)).toEqual([0, 50, 100, 150]);
  expect(zahl(2.5)).toBe("2,5");
  expect(zahl(-0)).toBe("0");
  expect(fill("Bei t = {t} s ist s = {s} m. {x}", { t: 4, s: 12.5 })).toBe("Bei t = 4 s ist s = 12,5 m. {x}");
});
