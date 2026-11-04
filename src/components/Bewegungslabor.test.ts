import { expect, test } from "vite-plus/test";
import {
  MAX_SPEED,
  MAX_WAY,
  TOTAL_SECONDS,
  clampSpeed,
  fill,
  normalise,
  speedAt,
  speedPoints,
  wayPoints,
  ways,
} from "./Bewegungslabor.ts";

test("the way is the sum of speed times 10 s per section", () => {
  expect(ways([3, 5, 7])).toEqual([0, 30, 80, 150]);
  expect(ways([0, 0, 0])).toEqual([0, 0, 0, 0]);
  expect(ways([MAX_SPEED, MAX_SPEED, MAX_SPEED])[3]).toBe(MAX_WAY);
});

test("the way-time line starts at 0 and has a corner at the end of every section", () => {
  expect(wayPoints([3, 5, 7])).toEqual([
    { t: 0, value: 0 },
    { t: 10, value: 30 },
    { t: 20, value: 80 },
    { t: 30, value: 150 },
  ]);
});

test("the speed-time line is a step per section and ends at the end of the ride", () => {
  const points = speedPoints([3, 5, 7]);
  expect(points).toHaveLength(6);
  expect(points[0]).toEqual({ t: 0, value: 3 });
  expect(points[5]).toEqual({ t: TOTAL_SECONDS, value: 7 });
});

test("speeds are whole numbers from 0 to the maximum", () => {
  expect(clampSpeed(-4)).toBe(0);
  expect(clampSpeed(99)).toBe(MAX_SPEED);
  expect(clampSpeed(4.6)).toBe(5);
  expect(clampSpeed(Number.NaN)).toBe(0);
  expect(normalise([2])).toEqual([2, 0, 0]);
});

test("speedAt gives the speed of the section and the last one at the end", () => {
  expect(speedAt([3, 5, 7], 0)).toBe(3);
  expect(speedAt([3, 5, 7], 10)).toBe(5);
  expect(speedAt([3, 5, 7], 30)).toBe(7);
});

test("fill puts speeds and ways into a text", () => {
  expect(fill("Abschnitt {n}: {v} m/s", [3, 5, 7], 2)).toBe("Abschnitt 2: 5 m/s");
  expect(fill("{s1}, {s2}, {s3}; {v1} {v2} {v3}", [3, 5, 7])).toBe("30, 80, 150; 3 5 7");
});
