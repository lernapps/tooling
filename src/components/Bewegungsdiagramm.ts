// The texts and slider limits of the component Bewegungsdiagramm, apart from the picture so that tests can reach them.
import {
  ABSCHNITT,
  DAUER,
  V_MAX,
  fuelle,
  geschwindigkeitBei,
  untereGrenze,
  wegBei,
  zahl,
  type Ansicht,
  type Art,
} from "./Bewegungsmodell.ts";

/** The line below the diagram for the time marker at t. */
export function anzeigeText(anzeige: string, art: Art, werte: number[], t: number): string {
  return fuelle(anzeige, {
    t: t.toFixed(1).replace(".", ","),
    s: zahl(wegBei(art, werte, t)),
    v: zahl(geschwindigkeitBei(art, werte, t)),
  });
}

/** What the diagram shows as text: the values at 0, 2, 4, 6 and 8 s. */
export function beschreibung(alt: string, einheitY: string, ansicht: Ansicht, art: Art, werte: number[]): string {
  const zeilen: string[] = [];
  for (let zeit = 0; zeit <= DAUER; zeit += ABSCHNITT) {
    const wert = ansicht === "weg" ? wegBei(art, werte, zeit) : geschwindigkeitBei(art, werte, zeit);
    zeilen.push(`${zeit} s: ${zahl(wert)} ${einheitY}`);
  }
  return `${alt} ${zeilen.join("; ")}.`;
}

/** The label and limits of the slider with this index. */
export function reglerFuer(
  vorlageAbschnitt: string,
  vorlageKnoten: string,
  ansicht: Ansicht,
  art: Art,
  werte: number[],
  index: number,
): { label: string; min: number; max: number } {
  const label =
    art === "abschnitte"
      ? fuelle(vorlageAbschnitt, { n: index + 1, von: index * ABSCHNITT, bis: (index + 1) * ABSCHNITT })
      : fuelle(vorlageKnoten, { t: index * ABSCHNITT });
  const min = ansicht === "weg" ? untereGrenze(art, werte, index) : 0;
  return { label, min, max: V_MAX };
}
