// The logic of Bewegungslabor.vue and DiagrammZeichnen.vue: a trip of 12 s in three sections of 4 s on a straight
// line. Pure functions, tested in Bewegungslabor.test.ts. A trip is a list of sections; each section has the velocity
// at its start and at its end, and the velocity changes evenly in between. Velocity is in m/s, time in s, distance in
// m; a negative velocity means: against the chosen direction.

/** The modes of the lab: the s-t diagram, the v-t diagram, or both one above the other. */
export type Modus = "st" | "vt" | "beide";

/** One section of the trip: the velocity at its start and at its end. */
export interface Abschnitt {
  von: number;
  bis: number;
}

/** A point of a curve: the time and the value. */
export interface Punkt {
  t: number;
  y: number;
}

/** The length of a section in s. */
export const DAUER = 4;
/** The number of sections. */
export const ANZAHL = 3;
/** The length of the trip in s. */
export const GESAMT = DAUER * ANZAHL;

/**
 * The sections of a trip. In the mode "st" there are three values, one steady velocity per section. In the other
 * modes there are four values, the velocity at 0, 4, 8 and 12 s; between them it changes evenly.
 */
export function abschnitte(modus: Modus, werte: readonly number[]): Abschnitt[] {
  const result: Abschnitt[] = [];
  for (let i = 0; i < ANZAHL; i++) {
    if (modus === "st") {
      const v = werte[i] ?? 0;
      result.push({ von: v, bis: v });
    } else {
      result.push({ von: werte[i] ?? 0, bis: werte[i + 1] ?? 0 });
    }
  }
  return result;
}

/** The section a time belongs to (the last one for the end of the trip) and the time since its start. */
function lage(t: number): { index: number; tau: number } {
  const clamped = Math.min(Math.max(t, 0), GESAMT);
  const index = Math.min(Math.floor(clamped / DAUER), ANZAHL - 1);
  return { index, tau: clamped - index * DAUER };
}

/** The velocity at the time t in m/s. */
export function geschwindigkeitBei(trip: readonly Abschnitt[], t: number): number {
  const { index, tau } = lage(t);
  const a = trip[index];
  if (a === undefined) return 0;
  return a.von + ((a.bis - a.von) * tau) / DAUER;
}

/** The distance from the start at the time t in m: the area under the v-t line. */
export function wegBei(trip: readonly Abschnitt[], t: number): number {
  const { index, tau } = lage(t);
  let s = 0;
  for (let i = 0; i < index; i++) {
    const a = trip[i];
    if (a !== undefined) s += ((a.von + a.bis) / 2) * DAUER;
  }
  const a = trip[index];
  if (a !== undefined) s += a.von * tau + ((a.bis - a.von) * tau * tau) / (2 * DAUER);
  return s;
}

/** The points of a curve every `schritt` s, from 0 to 12 s. */
export function kurve(trip: readonly Abschnitt[], art: "s" | "v", schritt = 0.25): Punkt[] {
  const points: Punkt[] = [];
  const n = Math.round(GESAMT / schritt);
  for (let i = 0; i <= n; i++) {
    const t = i * schritt;
    points.push({ t, y: art === "s" ? wegBei(trip, t) : geschwindigkeitBei(trip, t) });
  }
  return points;
}

/** The ticks of an axis from min to max in steps of `schritt`. */
export function ticks(min: number, max: number, schritt: number): number[] {
  const result: number[] = [];
  for (let v = Math.ceil(min / schritt) * schritt; v <= max + 1e-9; v += schritt)
    result.push(Math.round(v * 1000) / 1000);
  return result;
}

/** A number as text with a decimal comma and at most one decimal place. */
export function zahl(x: number): string {
  const rounded = Math.round(x * 10) / 10;
  return String(rounded === 0 ? 0 : rounded).replace(".", ",");
}

/** A text with {name} replaced by the values; a placeholder without a value stays. */
export function fill(text: string, values: Readonly<Record<string, string | number>>): string {
  return text.replace(/\{(\w+)\}/g, (all, name: string) => {
    const value = values[name];
    return value === undefined ? all : typeof value === "number" ? zahl(value) : value;
  });
}
