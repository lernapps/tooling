import { expect, test } from "vite-plus/test";
import { anzeigeText, beschreibung, reglerFuer } from "./Bewegungsdiagramm.ts";

test("the description gives the values at 0, 2, 4, 6 and 8 s for readers without the picture", () => {
  expect(beschreibung("Weg-Zeit-Diagramm.", "m", "weg", "abschnitte", [5, 0, 5, 5])).toBe(
    "Weg-Zeit-Diagramm. 0 s: 0 m; 2 s: 10 m; 4 s: 10 m; 6 s: 20 m; 8 s: 30 m.",
  );
  expect(beschreibung("v-t.", "m/s", "geschwindigkeit", "knoten", [0, 4, 8, 8, 4])).toBe(
    "v-t. 0 s: 0 m/s; 2 s: 4 m/s; 4 s: 8 m/s; 6 s: 8 m/s; 8 s: 4 m/s.",
  );
});

test("the line below the diagram names time, way and speed", () => {
  expect(anzeigeText("Bei {t} s: {s} m, {v} m/s", "abschnitte", [5, 0, 5, 5], 3)).toBe("Bei 3,0 s: 10 m, 0 m/s");
});

test("a slider for a way going back may not take the way below the start", () => {
  const abschnitt = reglerFuer("Abschnitt {n}", "bei {t} s", "weg", "abschnitte", [4, 0, 0, 0], 1);
  expect(abschnitt).toEqual({ label: "Abschnitt 2", min: -4, max: 12 });
  expect(reglerFuer("A {n}", "bei {t} s", "geschwindigkeit", "knoten", [0, 0, 0, 0, 0], 2)).toEqual({
    label: "bei 4 s",
    min: 0,
    max: 12,
  });
});

test("the line below the diagram uses a decimal comma", () => {
  expect(anzeigeText("{s} m, {v} m/s", "knoten", [0, 3, 6, 6, 3], 1)).toBe("0,8 m, 1,5 m/s");
});
