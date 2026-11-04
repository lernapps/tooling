import { expect, test } from "vite-plus/test";
import {
  MAX_SPEED,
  S_MAX,
  S_MIN,
  canGoBack,
  distanceAt,
  distancePoints,
  distances,
  fill,
  initial,
  kind,
  speedAt,
  speedPoints,
  valuesText,
  type Section,
} from "./Bewegungslabor.ts";

test("the start ride is 10 m/s all the time: 50 m in every section", () => {
  const ride = initial();
  expect(distances(ride)).toEqual([0, 50, 100, 150, 200]);
  expect(speedPoints(ride)).toEqual([
    [0, 10],
    [5, 10],
    [10, 10],
    [15, 10],
    [20, 10],
  ]);
  expect(ride.map((_, i) => kind(ride, i))).toEqual(["steady", "steady", "steady", "steady"]);
});

test("a section that starts at 10 and ends at 20 m/s covers 75 m and is faster", () => {
  const ride: Section[] = [{ end: 20, back: false }, ...initial().slice(1)];
  expect(kind(ride, 0)).toBe("faster");
  expect(distances(ride)[1]).toBe(75);
  expect(speedAt(ride, 2.5)).toBe(15);
  // later sections start at the end speed of the one before
  expect(kind(ride, 1)).toBe("slower");
});

test("stopped means no speed at the start and at the end", () => {
  const ride: Section[] = [
    { end: 0, back: false },
    { end: 0, back: false },
    { end: 10, back: false },
    { end: 10, back: false },
  ];
  expect(kind(ride, 0)).toBe("slower");
  expect(kind(ride, 1)).toBe("stopped");
  expect(kind(ride, 2)).toBe("faster");
  expect(distances(ride)).toEqual([0, 25, 25, 50, 100]);
});

test("backwards turns the distance around and needs some speed", () => {
  const ride: Section[] = [
    { end: 10, back: false },
    { end: 10, back: true },
    { end: 0, back: false },
    { end: 0, back: true },
  ];
  expect(distances(ride)).toEqual([0, 50, 0, 25, 25]);
  expect(canGoBack(ride, 3)).toBe(false);
  expect(canGoBack(ride, 1)).toBe(true);
});

test("the distance bends inside a section and agrees with the corners", () => {
  const ride: Section[] = [{ end: 20, back: false }, ...initial().slice(1)];
  expect(distanceAt(ride, 5)).toBe(75);
  expect(distanceAt(ride, 0)).toBe(0);
  // halfway through the section the ride has covered less than half of 75 m plus the linear part
  expect(distanceAt(ride, 2.5)).toBeCloseTo(10 * 2.5 + (10 * 2.5 * 2.5) / 10, 10);
  const points = distancePoints(ride);
  expect(points).toHaveLength(41);
  expect(points[40]).toEqual([20, 250]);
});

test("every possible ride stays inside the fixed scale of the diagram", () => {
  for (let a = 0; a <= MAX_SPEED; a += 5) {
    for (let b = 0; b <= MAX_SPEED; b += 5) {
      for (const back of [false, true]) {
        const ride: Section[] = [
          { end: a, back },
          { end: b, back },
          { end: MAX_SPEED, back },
          { end: MAX_SPEED, back },
        ];
        for (const [, s] of distancePoints(ride)) {
          expect(s).toBeGreaterThanOrEqual(S_MIN);
          expect(s).toBeLessThanOrEqual(S_MAX);
        }
      }
    }
  }
});

test("fill and valuesText", () => {
  expect(fill("Abschnitt {n} von {m}", { n: 2, m: 4 })).toBe("Abschnitt 2 von 4");
  expect(fill("Unbekannt {x}", {})).toBe("Unbekannt {x}");
  expect(valuesText([0, 12.5, -50])).toBe("0, 12,5, -50");
});
