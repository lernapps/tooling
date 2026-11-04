// The model of a straight motion for the components Bewegungsdiagramm and DiagrammZeichnen.
// Time runs from 0 to DAUER seconds. The motion is given by speeds:
//  - "abschnitte": one constant speed for each section of ABSCHNITT seconds (the graph of the way is a polyline);
//  - "knoten": the speed at the times 0, 2, 4, 6, 8 s, growing or shrinking evenly in between.
// The way s is the distance from the start on a straight line and never negative.

export type Art = "abschnitte" | "knoten";
export type Ansicht = "weg" | "geschwindigkeit";

export const DAUER = 8;
export const ABSCHNITT = 2;
export const V_MAX = 12;
export const S_MAX = 100;

export interface Punkt {
  t: number;
  y: number;
}

/** The number of values: four sections, or five nodes. */
export function anzahlWerte(art: Art): number {
  return art === "abschnitte" ? DAUER / ABSCHNITT : DAUER / ABSCHNITT + 1;
}

/** The speed at time t (in m/s, signed for "abschnitte" with way going back). */
export function geschwindigkeitBei(art: Art, werte: number[], t: number): number {
  const zeit = Math.min(Math.max(t, 0), DAUER);
  if (art === "abschnitte") {
    const index = Math.min(Math.floor(zeit / ABSCHNITT), werte.length - 1);
    return werte[index] ?? 0;
  }
  const index = Math.min(Math.floor(zeit / ABSCHNITT), werte.length - 2);
  const anteil = (zeit - index * ABSCHNITT) / ABSCHNITT;
  const von = werte[index] ?? 0;
  const bis = werte[index + 1] ?? 0;
  return von + (bis - von) * anteil;
}

/** The way at time t (in m): the area under the speed, exact for both kinds. */
export function wegBei(art: Art, werte: number[], t: number): number {
  const zeit = Math.min(Math.max(t, 0), DAUER);
  let weg = 0;
  for (let start = 0; start < zeit; start += ABSCHNITT) {
    const ende = Math.min(start + ABSCHNITT, zeit);
    const vAnfang = geschwindigkeitBei(art, werte, start);
    // at the section end the speed of the section just left, not of the next one
    const vEnde = art === "abschnitte" ? vAnfang : geschwindigkeitBei(art, werte, ende);
    weg += ((vAnfang + vEnde) / 2) * (ende - start);
  }
  return Math.round(weg * 1e9) / 1e9;
}

/** The lowest speed of a section that keeps the way at or above 0, given the sections before. */
export function untereGrenze(art: Art, werte: number[], index: number): number {
  if (art === "knoten") return 0;
  const davor = wegBei(art, werte, index * ABSCHNITT);
  return Math.max(-V_MAX, Math.ceil(-davor / ABSCHNITT)) || 0;
}

/** The values within their limits; for a way going back no value takes the way below 0. */
export function normalisiere(art: Art, ansicht: Ansicht, werte: number[]): number[] {
  const ergebnis: number[] = [];
  for (let i = 0; i < anzahlWerte(art); i++) {
    const wert = Math.round(werte[i] ?? 0);
    const unten = ansicht === "weg" ? untereGrenze(art, ergebnis, i) : 0;
    ergebnis.push(Math.min(Math.max(wert, unten), V_MAX));
  }
  return ergebnis;
}

/** The points of the graph of the way: the corners for sections, steps of 0.25 s for the curve. */
export function wegPunkte(art: Art, werte: number[]): Punkt[] {
  const punkte: Punkt[] = [];
  const schritt = art === "abschnitte" ? ABSCHNITT : 0.25;
  for (let t = 0; t <= DAUER + 1e-9; t += schritt) {
    punkte.push({ t: Math.round(t * 100) / 100, y: wegBei(art, werte, t) });
  }
  return punkte;
}

/** The points of the graph of the speed. For sections a step at each boundary. */
export function geschwindigkeitPunkte(art: Art, werte: number[]): Punkt[] {
  if (art === "knoten") return werte.map((y, i) => ({ t: i * ABSCHNITT, y }));
  const punkte: Punkt[] = [];
  werte.forEach((y, i) => {
    punkte.push({ t: i * ABSCHNITT, y }, { t: (i + 1) * ABSCHNITT, y });
  });
  return punkte;
}

/** What a reader without the picture needs: the values by time as text lines. */
export function wertetabelle(art: Art, ansicht: Ansicht, werte: number[]): { t: number; wert: number }[] {
  const zeilen: { t: number; wert: number }[] = [];
  for (let t = 0; t <= DAUER; t += ABSCHNITT) {
    zeilen.push({ t, wert: ansicht === "weg" ? wegBei(art, werte, t) : geschwindigkeitBei(art, werte, t) });
  }
  return zeilen;
}

/** Fills {name} in a text. */
export function fuelle(text: string, werte: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (stelle, name: string) => (name in werte ? String(werte[name]) : stelle));
}

/** A number as a German reader writes it: decimal comma. */
export function zahl(n: number): string {
  return String(Math.round(n * 10) / 10).replace(".", ",");
}
