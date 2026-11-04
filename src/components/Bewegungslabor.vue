<script setup lang="ts">
// The lab for a trip of 12 s in three sections: learners move the sliders for the velocity and see the s-t diagram, the
// v-t diagram or both change. The axes stay where they are. A marker (a time slider) shows the values at one time.
// It is no exercise: the questions are below it on the page. Its logic is in Bewegungslabor.ts.
import { computed, ref } from "vue";
import { abschnitte, ANZAHL, DAUER, fill, GESAMT, kurve, ticks, wegBei, geschwindigkeitBei } from "./Bewegungslabor.ts";

const props = defineProps<{
  /** "st": the s-t diagram, one steady velocity per section; "vt": the v-t diagram; "beide": both. */
  modus: "st" | "vt" | "beide";
  /** The velocity at the start: three values (st) or four (vt, beide: at 0, 4, 8 and 12 s). */
  werte: number[];
  /** The smallest and the largest velocity of a slider in m/s. */
  vMin: number;
  vMax: number;
  /** The range of the distance axis in m. */
  sMin: number;
  sMax: number;
  /** The step of the velocity axis and of the distance axis. */
  vSchritt: number;
  sSchritt: number;
  /** The texts. {n} = number of the section, {t} = time, {s} = distance, {v} = velocity. */
  texte: {
    zeit: string;
    weg: string;
    geschwindigkeit: string;
    reglerSt: string;
    reglerVt: string;
    messmarke: string;
    ablesenS: string;
    ablesenV: string;
    diagrammS: string;
    diagrammV: string;
    flaeche: string;
    zuruecksetzen: string;
  };
}>();

const start = props.werte.slice();
const werte = ref<number[]>(start.slice());
const t = ref(6);

const trip = computed(() => abschnitte(props.modus, werte.value));
const sNow = computed(() => wegBei(trip.value, t.value));
const vNow = computed(() => geschwindigkeitBei(trip.value, t.value));

// the drawing area in the viewBox 0 0 400 240
const X0 = 56;
const X1 = 388;
const Y0 = 206;
const Y1 = 14;
const px = (time: number) => X0 + (time / GESAMT) * (X1 - X0);

interface Zeichnung {
  art: "s" | "v";
  titel: string;
  min: number;
  max: number;
  achse: string;
  yTicks: number[];
  linie: string;
  flaeche: string;
  markeY: number;
  nullY: number;
}

function zeichne(art: "s" | "v"): Zeichnung {
  const min = art === "s" ? props.sMin : props.vMin;
  const max = art === "s" ? props.sMax : props.vMax;
  const py = (value: number) => Y0 - ((value - min) / (max - min)) * (Y0 - Y1);
  const punkte = kurve(trip.value, art);
  const linie = punkte.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.t).toFixed(1)} ${py(p.y).toFixed(1)}`).join(" ");
  const nullY = py(0);
  const flaeche =
    art === "v"
      ? `${linie} L${px(GESAMT).toFixed(1)} ${nullY.toFixed(1)} L${px(0).toFixed(1)} ${nullY.toFixed(1)} Z`
      : "";
  const now = art === "s" ? sNow.value : vNow.value;
  return {
    art,
    titel: art === "s" ? props.texte.diagrammS : props.texte.diagrammV,
    min,
    max,
    achse: art === "s" ? props.texte.weg : props.texte.geschwindigkeit,
    yTicks: ticks(min, max, art === "s" ? props.sSchritt : props.vSchritt),
    linie,
    flaeche,
    markeY: py(now),
    nullY,
  };
}

const diagramme = computed<Zeichnung[]>(() => {
  if (props.modus === "st") return [zeichne("s")];
  if (props.modus === "vt") return [zeichne("v")];
  return [zeichne("v"), zeichne("s")];
});

const yPos = (d: Zeichnung, value: number) => Y0 - ((value - d.min) / (d.max - d.min)) * (Y0 - Y1);
const zeitTicks = ticks(0, GESAMT, DAUER);
const reglerAnzahl = computed(() => (props.modus === "st" ? ANZAHL : ANZAHL + 1));

function zuruecksetzen(): void {
  werte.value = start.slice();
}

const ablesen = computed(() => ({
  s: fill(props.texte.ablesenS, { t: t.value, s: sNow.value }),
  v: fill(props.texte.ablesenV, { t: t.value, v: vNow.value }),
}));
</script>

<template>
  <div class="bewegungslabor">
    <figure v-for="d in diagramme" :key="d.art" class="bl-diagramm">
      <figcaption>{{ d.titel }}</figcaption>
      <svg viewBox="0 0 400 240" role="img" :aria-label="d.titel">
        <defs>
          <pattern id="bl-schraffur" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" class="bl-schraffur" />
          </pattern>
        </defs>
        <g class="bl-gitter">
          <line v-for="v in zeitTicks" :key="'x' + v" :x1="px(v)" :x2="px(v)" :y1="Y1" :y2="Y0" />
          <line v-for="v in d.yTicks" :key="'y' + v" :x1="X0" :x2="X1" :y1="yPos(d, v)" :y2="yPos(d, v)" />
        </g>
        <path v-if="d.flaeche && modus !== 'st'" :d="d.flaeche" class="bl-flaeche" />
        <line :x1="X0" :x2="X1" :y1="d.nullY" :y2="d.nullY" class="bl-achse" />
        <line :x1="X0" :x2="X0" :y1="Y1" :y2="Y0" class="bl-achse" />
        <path :d="d.linie" :class="d.art === 's' ? 'bl-linie-s' : 'bl-linie-v'" fill="none" />
        <line :x1="px(t)" :x2="px(t)" :y1="Y1" :y2="Y0" class="bl-marke" />
        <circle :cx="px(t)" :cy="d.markeY" r="5" :class="d.art === 's' ? 'bl-punkt-s' : 'bl-punkt-v'" />
        <g class="bl-zahlen">
          <text v-for="v in zeitTicks" :key="'tx' + v" :x="px(v)" :y="Y0 + 16" text-anchor="middle">{{ v }}</text>
          <text v-for="v in d.yTicks" :key="'ty' + v" :x="X0 - 6" :y="yPos(d, v) + 4" text-anchor="end">{{ v }}</text>
          <text :x="X1" :y="Y0 + 32" text-anchor="end">{{ texte.zeit }}</text>
          <text :x="X0" :y="10" text-anchor="start" class="bl-achsentitel">{{ d.achse }}</text>
        </g>
      </svg>
      <p v-if="d.art === 'v' && modus !== 'st'" class="bl-hinweis">{{ texte.flaeche }}</p>
    </figure>

    <div class="bl-regler">
      <template v-if="modus === 'st'">
        <label v-for="i in reglerAnzahl" :key="i" class="bl-zeile">
          <span>{{ fill(texte.reglerSt, { n: i }) }}</span>
          <input v-model.number="werte[i - 1]" type="range" :min="vMin" :max="vMax" :step="vSchritt" />
          <output>{{ fill("{v}", { v: werte[i - 1] ?? 0 }) }} m/s</output>
        </label>
      </template>
      <template v-else>
        <label v-for="i in reglerAnzahl" :key="i" class="bl-zeile">
          <span>{{ fill(texte.reglerVt, { t: (i - 1) * DAUER }) }}</span>
          <input v-model.number="werte[i - 1]" type="range" :min="vMin" :max="vMax" :step="vSchritt" />
          <output>{{ fill("{v}", { v: werte[i - 1] ?? 0 }) }} m/s</output>
        </label>
      </template>
      <label class="bl-zeile">
        <span>{{ texte.messmarke }}</span>
        <input v-model.number="t" type="range" min="0" :max="GESAMT" step="1" />
        <output>{{ t }} s</output>
      </label>
      <button type="button" class="bl-knopf" @click="zuruecksetzen">{{ texte.zuruecksetzen }}</button>
    </div>

    <div aria-live="polite" class="bl-ablesen">
      <p>{{ ablesen.s }}</p>
      <p v-if="modus !== 'st'">{{ ablesen.v }}</p>
    </div>
  </div>
</template>

<style scoped>
.bewegungslabor {
  --weg: #1f5fbf;
  --tempo: #b45309;
  max-width: 34rem;
}

@media (prefers-color-scheme: dark) {
  .bewegungslabor {
    --weg: #6aa3ff;
    --tempo: #f59e0b;
  }
}

.bl-diagramm {
  margin: 0 0 1rem;
}

.bl-diagramm svg {
  width: 100%;
  height: auto;
  display: block;
}

.bl-gitter line {
  stroke: var(--page-border);
  stroke-width: 1;
}

.bl-achse {
  stroke: var(--page-text);
  stroke-width: 1.5;
}

.bl-zahlen text {
  fill: var(--page-text);
  font-size: 12px;
}

.bl-zahlen .bl-achsentitel {
  font-weight: bold;
}

.bl-linie-s {
  stroke: var(--weg);
  stroke-width: 3;
}

.bl-linie-v {
  stroke: var(--tempo);
  stroke-width: 3;
  stroke-dasharray: 10 4;
}

.bl-flaeche {
  fill: url(#bl-schraffur);
}

.bl-schraffur {
  stroke: var(--tempo);
  stroke-width: 2;
}

.bl-marke {
  stroke: var(--page-muted);
  stroke-width: 1.5;
  stroke-dasharray: 2 3;
}

.bl-punkt-s {
  fill: var(--weg);
  stroke: var(--page-background);
  stroke-width: 2;
}

.bl-punkt-v {
  fill: var(--tempo);
  stroke: var(--page-background);
  stroke-width: 2;
}

.bl-hinweis {
  margin: 0.25rem 0 0;
  color: var(--page-muted);
}

.bl-regler {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bl-zeile {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) 4.5rem;
  gap: 0.5rem;
  align-items: center;
  min-height: 2.75rem;
}

.bl-zeile input {
  width: 100%;
  min-height: 2.75rem;
  accent-color: var(--page-accent);
}

.bl-zeile output {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.bl-knopf {
  align-self: flex-start;
  min-height: 2.75rem;
  padding: 0 1rem;
}

.bl-ablesen p {
  margin: 0.5rem 0 0;
}

@media (max-width: 30rem) {
  .bl-zeile {
    grid-template-columns: 1fr 4.5rem;
  }

  .bl-zeile span {
    grid-column: 1 / -1;
  }
}
</style>
