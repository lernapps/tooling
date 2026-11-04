// Logic of the component BewegungsDiagramm: a drive of 6 seconds is described by the speed at t = 0 s, 1 s, ... 6 s.
// Between two seconds a straight line connects the speeds. From them follow the distance covered after each moment
// and the points of the two diagrams. Pure functions, no DOM.

/** One drive of the data file `fahrten`: speed in m/s at t = 0 to 6 s. */
export type Fahrt = { id: string; titel: string; beschreibung: string; tempo: number[] };

/** Number of seconds the drive lasts, and so the number of speeds after the start speed. */
export const DAUER = 6;
/** Highest speed in m/s. */
export const TEMPO_MAX = 4;

/** Lowest speed in m/s: 0, or -2 for drives that go backwards, too. */
export function tempoMin(rueckwaerts: boolean): number {
  return rueckwaerts ? -2 : 0;
}

/** The drive with the given id, or the first one. */
export function findeFahrt(fahrten: Fahrt[], id: string): Fahrt {
  const fahrt = fahrten.find((eintrag) => eintrag.id === id) ?? fahrten[0];
  if (fahrt === undefined) throw new Error("fahrten is empty");
  return { ...fahrt, tempo: normiere(fahrt.tempo) };
}

/** Exactly DAUER + 1 whole speeds. */
export function normiere(tempo: number[]): number[] {
  return Array.from({ length: DAUER + 1 }, (_, i) => Math.round(tempo[i] ?? 0));
}

/** Changes the speed at second `index` (1 to DAUER) by `schritt` m/s, kept between the limits; t = 0 s stays. */
export function aendere(tempo: number[], index: number, schritt: number, rueckwaerts: boolean): number[] {
  if (index < 1 || index > DAUER) return tempo;
  const neu = Math.min(TEMPO_MAX, Math.max(tempoMin(rueckwaerts), tempo[index]! + schritt));
  return tempo.map((wert, i) => (i === index ? neu : wert));
}

/** One speed for the whole drive (the mode where the speed stays the same, also at t = 0 s). */
export function setzeKonstant(tempo: number[], wert: number, rueckwaerts: boolean): number[] {
  const begrenzt = Math.min(TEMPO_MAX, Math.max(tempoMin(rueckwaerts), wert));
  return tempo.map(() => begrenzt);
}

/** Distance covered after 0, 1, ... DAUER seconds: the mean of the two speeds of a second, added up. */
export function wegNachSekunden(tempo: number[]): number[] {
  const weg = [0];
  for (let i = 1; i <= DAUER; i++) weg.push(weg[i - 1]! + (tempo[i - 1]! + tempo[i]!) / 2);
  return weg;
}

/** Distance covered at the moment t (0 to DAUER), between two seconds on a curve, since the speed changes evenly. */
export function wegZu(tempo: number[], t: number): number {
  const i = Math.min(DAUER - 1, Math.floor(t));
  const u = t - i;
  const vorher = wegNachSekunden(tempo)[i]!;
  return vorher + tempo[i]! * u + ((tempo[i + 1]! - tempo[i]!) * u * u) / 2;
}

/** Axis ranges, fixed so that they stay put while learners change the drive. */
export function bereich(rueckwaerts: boolean): { vMin: number; vMax: number; sMin: number; sMax: number } {
  return rueckwaerts
    ? { vMin: -2, vMax: TEMPO_MAX, sMin: -12, sMax: 24 }
    : { vMin: 0, vMax: TEMPO_MAX, sMin: 0, sMax: 24 };
}

export type Diagramm = { breite: number; hoehe: number; links: number; rechts: number; oben: number; unten: number };

/** The drawing area of a diagram in SVG units. */
export const FLAECHE: Diagramm = { breite: 320, hoehe: 160, links: 44, rechts: 12, oben: 12, unten: 30 };

/** SVG x of a moment. */
export function xVon(t: number, flaeche: Diagramm = FLAECHE): number {
  return flaeche.links + (t / DAUER) * (flaeche.breite - flaeche.links - flaeche.rechts);
}

/** SVG y of a value between min and max. */
export function yVon(wert: number, min: number, max: number, flaeche: Diagramm = FLAECHE): number {
  const innen = flaeche.hoehe - flaeche.oben - flaeche.unten;
  return flaeche.hoehe - flaeche.unten - ((wert - min) / (max - min)) * innen;
}

const rund = (zahl: number): number => Math.round(zahl * 10) / 10;

/** Points of the speed-time line (a polyline). */
export function geschwindigkeitsPunkte(tempo: number[], rueckwaerts: boolean): { x: number; y: number }[] {
  const b = bereich(rueckwaerts);
  return tempo.map((v, i) => ({ x: rund(xVon(i)), y: rund(yVon(v, b.vMin, b.vMax)) }));
}

/** Points of the distance-time curve, several per second so that it looks smooth. */
export function wegPunkte(tempo: number[], rueckwaerts: boolean): { x: number; y: number }[] {
  const b = bereich(rueckwaerts);
  const punkte: { x: number; y: number }[] = [];
  for (let schritt = 0; schritt <= DAUER * 4; schritt++) {
    const t = schritt / 4;
    punkte.push({ x: rund(xVon(t)), y: rund(yVon(wegZu(tempo, t), b.sMin, b.sMax)) });
  }
  return punkte;
}

/** Position 0 to 100 % of the wagon on the track after each second. */
export function bahnProzent(tempo: number[], rueckwaerts: boolean): number[] {
  const b = bereich(rueckwaerts);
  return wegNachSekunden(tempo).map((s) => ((s - b.sMin) / (b.sMax - b.sMin)) * 100);
}

/** SVG `points` text. */
export function alsPunkte(punkte: { x: number; y: number }[]): string {
  return punkte.map((p) => `${p.x},${p.y}`).join(" ");
}

/** A number as text with a decimal comma. */
export function zahl(wert: number): string {
  return String(Math.round(wert * 10) / 10).replace(".", ",");
}

/** Replaces {name} in a text by the given values. */
export function fuelle(text: string, werte: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (stelle, name: string) => werte[name] ?? stelle);
}
