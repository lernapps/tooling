import { expect, test } from "vite-plus/test";
import {
  begrenzen,
  bruchStreifen,
  erweitern,
  fuellen,
  gemeinsameTeiler,
  kuerzen,
  MAX_NENNER,
  neueTeilung,
  umschalten,
  vergleichen,
  zaehler,
} from "./Bruchstreifen.ts";

test("the denominator stays between 1 and the limit", () => {
  expect(begrenzen(0)).toBe(1);
  expect(begrenzen(-3)).toBe(1);
  expect(begrenzen(5)).toBe(5);
  expect(begrenzen(99)).toBe(MAX_NENNER);
  expect(begrenzen(20, 20)).toBe(20);
});

test("a new division has that many parts, none coloured", () => {
  const teile = neueTeilung(8);
  expect(teile).toHaveLength(8);
  expect(zaehler(teile)).toBe(0);
  expect(neueTeilung(40)).toHaveLength(MAX_NENNER);
});

test("the strip of a fraction has n parts and z of them coloured", () => {
  expect(bruchStreifen(3, 4)).toEqual([true, true, true, false]);
  expect(zaehler(bruchStreifen(0, 5))).toBe(0);
});

test("a tap colours a part and a second tap empties it; the others stay", () => {
  const start = neueTeilung(4);
  const eins = umschalten(start, 2);
  expect(eins).toEqual([false, false, true, false]);
  expect(zaehler(eins)).toBe(1);
  expect(umschalten(eins, 2)).toEqual(start);
  expect(start).toEqual([false, false, false, false]);
});

test("expanding multiplies both numbers and keeps the value", () => {
  expect(erweitern({ z: 3, n: 4 }, 3)).toEqual({ z: 9, n: 12 });
  expect(erweitern({ z: 3, n: 4 }, 1)).toEqual({ z: 3, n: 4 });
  expect(vergleichen({ z: 3, n: 4 }, erweitern({ z: 3, n: 4 }, 5))).toBe(0);
});

test("reducing divides both numbers, and only by a common divisor", () => {
  expect(kuerzen({ z: 8, n: 12 }, 4)).toEqual({ z: 2, n: 3 });
  expect(kuerzen({ z: 8, n: 12 }, 3)).toBeUndefined();
  expect(kuerzen({ z: 8, n: 12 }, 0)).toBeUndefined();
  expect(gemeinsameTeiler({ z: 8, n: 12 })).toEqual([2, 4]);
  expect(gemeinsameTeiler({ z: 3, n: 8 })).toEqual([]);
});

test("comparing: the larger denominator does not make the larger fraction", () => {
  expect(vergleichen({ z: 1, n: 8 }, { z: 1, n: 4 })).toBe(-1);
  expect(vergleichen({ z: 3, n: 4 }, { z: 2, n: 3 })).toBe(1);
  expect(vergleichen({ z: 2, n: 4 }, { z: 1, n: 2 })).toBe(0);
});

test("texts get their numbers", () => {
  expect(fuellen("{z} von {n} Teilen gefärbt", { z: 3, n: 8 })).toBe("3 von 8 Teilen gefärbt");
  expect(fuellen("Teil {i} von {n}", { i: 2, n: 5 })).toBe("Teil 2 von 5");
  expect(fuellen("mit {k}", { k: 3 })).toBe("mit 3");
});
