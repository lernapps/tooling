// The logic of the component Bewegungsspur: a cart on a straight track and one dot for each second (stroboscopic
// picture). A motion is given by the places of the cart at 0, 1, 2 ... seconds, in metres from the start.

export const SPURLAENGE = 40;
export const SEKUNDEN_MAX = 6;

export interface Bewegung {
  name: string;
  orte: number[];
}

/** The place of the cart at time t (in s), evenly between the places at whole seconds. */
export function ortBei(orte: number[], t: number): number {
  const zeit = Math.min(Math.max(t, 0), orte.length - 1);
  const index = Math.min(Math.floor(zeit), orte.length - 2);
  const von = orte[index] ?? 0;
  const bis = orte[index + 1] ?? von;
  return von + (bis - von) * (zeit - index);
}

/** The signed distance covered in each second. */
export function abstaende(orte: number[]): number[] {
  return orte.slice(1).map((ort, i) => ort - (orte[i] ?? 0));
}

/** The row of each dot: a new row each time the cart turns round, so the way back is not drawn over the way out. */
export function reihen(orte: number[]): number[] {
  const reihe: number[] = [0];
  let aktuell = 0;
  let richtung = 0;
  abstaende(orte).forEach((d) => {
    const neu = Math.sign(d);
    if (neu !== 0 && richtung !== 0 && neu !== richtung) aktuell += 1;
    if (neu !== 0) richtung = neu;
    reihe.push(aktuell);
  });
  return reihe;
}

/** How the motion changes, read from the distances: "schneller", "gleich", "langsamer", "zurueck" or "gemischt". */
export function art(orte: number[]): "schneller" | "gleich" | "langsamer" | "zurueck" | "gemischt" {
  const d = abstaende(orte);
  if (d.some((x) => x < 0) && d.some((x) => x > 0)) return "zurueck";
  const betrag = d.map(Math.abs);
  const waechst = betrag.every((x, i) => i === 0 || x >= (betrag[i - 1] ?? 0));
  const schrumpft = betrag.every((x, i) => i === 0 || x <= (betrag[i - 1] ?? 0));
  if (waechst && schrumpft) return "gleich";
  if (waechst) return "schneller";
  if (schrumpft) return "langsamer";
  return "gemischt";
}

/** Whether the motion fits on the track and has two to seven places. */
export function gueltig(bewegung: Bewegung): boolean {
  return (
    bewegung.orte.length >= 2 &&
    bewegung.orte.length <= SEKUNDEN_MAX + 1 &&
    bewegung.orte.every((o) => o >= 0 && o <= SPURLAENGE)
  );
}

/** How many dots are shown at time t: one for each whole second reached. */
export function sichtbar(orte: number[], t: number): number {
  return Math.min(orte.length, Math.floor(t + 1e-9) + 1);
}

/** The distances of the visible dots as text, with a decimal comma. */
export function abstandsText(vorlage: string, orte: number[], t: number, zurueck = ""): string[] {
  const n = sichtbar(orte, t);
  return abstaende(orte)
    .slice(0, Math.max(0, n - 1))
    .map(
      (d, i) =>
        vorlage
          .replace("{n}", String(i))
          .replace("{m}", String(i + 1))
          .replace("{d}", String(Math.round(Math.abs(d) * 10) / 10).replace(".", ",")) + (d < 0 ? zurueck : ""),
    );
}
