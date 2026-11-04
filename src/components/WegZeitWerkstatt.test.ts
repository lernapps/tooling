import { expect, test } from "vite-plus/test";
import { distanceAt, fillText, pathPoints, speedsOf, DURATION, TOP_DISTANCE, TOP_SPEED } from "./Bewegung.ts";

const fahrt = { id: "x", name: "X", beschreibung: "", v1: 5, v2: 5, v3: 10, v4: 10, v5: 0 };

test("the speeds of a record are its five fields in order", () => {
  expect(speedsOf(fahrt)).toEqual([5, 5, 10, 10, 0]);
});

test("a constant speed gives a straight line: the distance grows by the same amount every second", () => {
  const speeds = [5, 5, 5, 5, 5];
  expect([0, 1, 2, 5, 10].map((t) => distanceAt(speeds, t))).toEqual([0, 5, 10, 25, 50]);
});

test("the distance follows the speed of each stretch and stays when the car stands", () => {
  const speeds = speedsOf(fahrt);
  expect(pathPoints(speeds)).toEqual([
    { t: 0, s: 0 },
    { t: 2, s: 10 },
    { t: 4, s: 20 },
    { t: 6, s: 40 },
    { t: 8, s: 60 },
    { t: 10, s: 60 },
  ]);
  expect(distanceAt(speeds, 9)).toBe(60);
  expect(distanceAt(speeds, 5)).toBe(30);
});

test("times outside the drive are cut to its ends; the longest drive covers 100 m", () => {
  expect(distanceAt([5, 5, 5, 5, 5], -3)).toBe(0);
  expect(distanceAt([5, 5, 5, 5, 5], 99)).toBe(50);
  expect(
    distanceAt(
      Array.from({ length: 5 }, () => TOP_SPEED),
      DURATION,
    ),
  ).toBe(TOP_DISTANCE);
});

test("fillText fills placeholders and writes a decimal comma", () => {
  expect(fillText("Bei {t} s: {s} m", { t: 2.5, s: 12.5 })).toBe("Bei 2,5 s: 12,5 m");
  expect(fillText("{unbekannt}", {})).toBe("{unbekannt}");
});
