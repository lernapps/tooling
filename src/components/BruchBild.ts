// The logic of BruchBild.vue, which draws a fraction as parts of a whole: a rectangle strip or a circle (pizza),
// divided into `nenner` equal parts, `zaehler` of them coloured. Pure geometry, tested in BruchBild.test.ts.

export type Form = "rechteck" | "kreis";

/** The smallest and the largest number of parts the building blocks offer. */
export const MIN_NENNER = 2;
export const MAX_NENNER = 12;

/** The least number a fraction may have as numerator, and a limit by its denominator. */
export function clampZaehler(zaehler: number, nenner: number): number {
  return Math.min(Math.max(zaehler, 0), nenner);
}

export function clampNenner(nenner: number): number {
  return Math.min(Math.max(nenner, MIN_NENNER), MAX_NENNER);
}

/** The point on a circle of radius `r` around (`cx`, `cy`), `part` of the way round, starting at the top. */
function point(cx: number, cy: number, r: number, part: number): { x: number; y: number } {
  const angle = part * 2 * Math.PI;
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
}

const round = (value: number) => Math.round(value * 100) / 100;

/** The path of part number `index` (from 0) of a circle with `nenner` equal parts. */
export function sectorPath(index: number, nenner: number, cx = 50, cy = 50, r = 45): string {
  const start = point(cx, cy, r, index / nenner);
  const end = point(cx, cy, r, (index + 1) / nenner);
  const large = 1 / nenner > 0.5 ? 1 : 0;
  return `M${cx} ${cy} L${round(start.x)} ${round(start.y)} A${r} ${r} 0 ${large} 1 ${round(end.x)} ${round(end.y)} Z`;
}

/** The x position and width of part number `index` of a strip 100 wide with `nenner` equal parts. */
export function stripPart(index: number, nenner: number, width = 100): { x: number; width: number } {
  const w = width / nenner;
  return { x: round(index * w), width: round(w) };
}

/** The description of a fraction picture for screen readers. */
export function describeBild(form: Form, nenner: number, zaehler: number): string {
  const ganzes = form === "kreis" ? "Ein Kreis" : "Ein Rechteck";
  return `${ganzes} in ${nenner} gleich große Teile geteilt, ${zaehler} davon ausgemalt.`;
}
