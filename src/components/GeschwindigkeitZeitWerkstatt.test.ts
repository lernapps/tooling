import { expect, test } from "vite-plus/test";
import { distanceAt, pathPoints, speedsOf } from "./Bewegung.ts";

// The workshop draws the columns from the speeds and the line from the same speeds: the line is as steep in a stretch
// as its column is high.

test("the line is as steep in a stretch as the column is high", () => {
  const speeds = [2, 4, 4, 0, 6];
  const points = pathPoints(speeds);
  for (let i = 0; i < speeds.length; i++) {
    const rise = (points[i + 1]?.s ?? 0) - (points[i]?.s ?? 0);
    expect(rise / 2).toBe(speeds[i]);
  }
});

test("a column of height 0 leaves the line flat", () => {
  expect(distanceAt([5, 0, 5, 5, 5], 4)).toBe(distanceAt([5, 0, 5, 5, 5], 2));
});

test("the first drive of the data is the constant one: all columns equally high, a straight line", () => {
  const fahrt = {
    id: "gleichmaessig",
    name: "Radfahrt gleichmäßig",
    beschreibung: "",
    v1: 5,
    v2: 5,
    v3: 5,
    v4: 5,
    v5: 5,
  };
  const points = pathPoints(speedsOf(fahrt));
  expect(points.map((p) => p.s)).toEqual([0, 10, 20, 30, 40, 50]);
});
