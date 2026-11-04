import { expect, test } from "vite-plus/test";
import {
  DAUER,
  aendere,
  bahnProzent,
  bereich,
  fuelle,
  findeFahrt,
  geschwindigkeitsPunkte,
  normiere,
  setzeKonstant,
  wegNachSekunden,
  wegPunkte,
  wegZu,
  zahl,
} from "./BewegungsDiagramm.ts";

test("constant speed gives a straight distance line; standing gives none", () => {
  expect(wegNachSekunden([2, 2, 2, 2, 2, 2, 2])).toEqual([0, 2, 4, 6, 8, 10, 12]);
  expect(wegNachSekunden([0, 0, 0, 0, 0, 0, 0])).toEqual([0, 0, 0, 0, 0, 0, 0]);
});

test("speeding up covers more distance each second", () => {
  const weg = wegNachSekunden([0, 1, 2, 3, 4, 4, 4]);
  expect(weg).toEqual([0, 0.5, 2, 4.5, 8, 12, 16]);
  const schritte = weg.slice(1).map((s, i) => s - weg[i]!);
  expect(schritte.slice(0, 4)).toEqual([0.5, 1.5, 2.5, 3.5]);
});

test("the curve between two seconds meets the distances at the seconds", () => {
  const tempo = [0, 1, 2, 3, 4, 4, 4];
  const weg = wegNachSekunden(tempo);
  for (let i = 0; i <= DAUER; i++) expect(wegZu(tempo, i)).toBeCloseTo(weg[i]!, 9);
});

test("a change stays within the limits and leaves t = 0 s alone", () => {
  const tempo = normiere([0, 1, 2]);
  expect(tempo).toHaveLength(DAUER + 1);
  expect(aendere(tempo, 1, -5, false)[1]).toBe(0);
  expect(aendere(tempo, 1, -5, true)[1]).toBe(-2);
  expect(aendere(tempo, 2, 9, false)[2]).toBe(4);
  expect(aendere(tempo, 0, 1, false)).toEqual(tempo);
  expect(tempo[1]).toBe(1);
});

test("constant mode sets every speed of the drive", () => {
  expect(setzeKonstant([0, 0, 0, 0, 0, 0, 0], 3, false)).toEqual([3, 3, 3, 3, 3, 3, 3]);
  expect(setzeKonstant([0, 1, 1, 1, 1, 1, 1], 9, false)[6]).toBe(4);
});

test("the fixed axes hold every possible drive", () => {
  for (const rueckwaerts of [false, true]) {
    const b = bereich(rueckwaerts);
    const schnell = Array.from({ length: DAUER + 1 }, () => 4);
    const rueck = Array.from({ length: DAUER + 1 }, () => -2);
    expect(Math.max(...wegNachSekunden(schnell))).toBeLessThanOrEqual(b.sMax);
    if (rueckwaerts) expect(Math.min(...wegNachSekunden(rueck))).toBeGreaterThanOrEqual(b.sMin);
    for (const p of bahnProzent(schnell, rueckwaerts)) expect(p).toBeLessThanOrEqual(100);
  }
});

test("diagram points are inside the drawing and the speed line has one point per second", () => {
  const tempo = [0, 1, 2, 3, 4, 4, 4];
  const v = geschwindigkeitsPunkte(tempo, false);
  expect(v).toHaveLength(DAUER + 1);
  for (const p of [...v, ...wegPunkte(tempo, false)]) {
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(320);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(160);
  }
  // a faster speed is higher in the picture, that is a smaller y
  expect(v[4]!.y).toBeLessThan(v[1]!.y);
});

test("findeFahrt takes the drive by id, else the first", () => {
  const fahrten = [
    { id: "a", titel: "A", beschreibung: "a", tempo: [0, 1] },
    { id: "b", titel: "B", beschreibung: "b", tempo: [2, 2, 2, 2, 2, 2, 2] },
  ];
  expect(findeFahrt(fahrten, "b").titel).toBe("B");
  expect(findeFahrt(fahrten, "x").id).toBe("a");
  expect(findeFahrt(fahrten, "a").tempo).toEqual([0, 1, 0, 0, 0, 0, 0]);
});

test("texts: decimal comma and placeholders", () => {
  expect(zahl(1.5)).toBe("1,5");
  expect(zahl(4)).toBe("4");
  expect(fuelle("Nach {t} s: {s} m", { t: "2", s: "4,5" })).toBe("Nach 2 s: 4,5 m");
  expect(fuelle("{x}", {})).toBe("{x}");
});
