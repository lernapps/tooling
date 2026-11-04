<script setup lang="ts">
// A straight motion in a diagram. Learners set the speed with sliders (one per section, or one per time); the graph
// of the way or of the speed follows at once, and a cart on a track runs with a time marker. The logic is in
// Bewegungsmodell.ts. The component only shows and changes; it checks nothing.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  ABSCHNITT,
  DAUER,
  S_MAX,
  V_MAX,
  geschwindigkeitBei,
  geschwindigkeitPunkte,
  normalisiere,
  wegBei,
  wegPunkte,
} from "./Bewegungsmodell.ts";
import { anzeigeText as anzeigeFuer, beschreibung as beschreibungFuer, reglerFuer } from "./Bewegungsdiagramm.ts";

const props = defineProps<{
  /** "weg" draws the way over time, "geschwindigkeit" the speed over time. */
  ansicht: "weg" | "geschwindigkeit";
  /** "abschnitte": one speed for each section of 2 s; "knoten": the speed at 0, 2, 4, 6 and 8 s. */
  art: "abschnitte" | "knoten";
  /** The speeds the sliders start with, four for sections, five for nodes (m/s). */
  start: number[];
  /** What the diagram shows, for screen readers; the values by time are added. */
  alt: string;
  /** Axis label of the time axis. */
  achseT: string;
  /** Axis label of the vertical axis. */
  achseY: string;
  /** The unit of the vertical axis for the values in the description. */
  einheitY: string;
  /** Label of a slider for a section, with {n}, {von}, {bis}. */
  abschnitt: string;
  /** Label of a slider for a time, with {t}. */
  knoten: string;
  /** Label of the slider for the time marker. */
  zeit: string;
  /** The line below the diagram, with {t}, {s} and {v}. */
  anzeige: string;
  /** The label of the cart's track. */
  bahn: string;
  /** Texts of the buttons. */
  startKnopf: string;
  pauseKnopf: string;
  zuruecksetzen: string;
}>();

const werte = ref<number[]>(normalisiere(props.art, props.ansicht, props.start));
const t = ref(0);
const laeuft = ref(false);
let rahmen = 0;
let zuletzt = 0;
// browser functions are set when the component is mounted in the browser (the build renders it without them)
let naechster: (f: (zeitpunkt: number) => void) => number = () => 0;
let abbrechen: (id: number) => void = () => {};
let jetzt: () => number = () => 0;
onMounted(() => {
  naechster = (f) => requestAnimationFrame(f);
  abbrechen = (id) => cancelAnimationFrame(id);
  jetzt = () => performance.now();
});

// the drawing: 400 x 290; the track on top, the diagram below
const links = 52;
const rechts = 384;
const oben = 78;
const unten = 250;
const yMax = computed(() => (props.ansicht === "weg" ? S_MAX : V_MAX));
const yTeiler = computed(() => (props.ansicht === "weg" ? 20 : 2));
const x = (zeit: number): number => links + ((rechts - links) * zeit) / DAUER;
const y = (wert: number): number => unten - ((unten - oben) * wert) / yMax.value;

const punkte = computed(() =>
  props.ansicht === "weg" ? wegPunkte(props.art, werte.value) : geschwindigkeitPunkte(props.art, werte.value),
);
const linie = computed(() => punkte.value.map((p) => `${x(p.t).toFixed(1)},${y(p.y).toFixed(1)}`).join(" "));
const marke = computed(() => {
  const wert =
    props.ansicht === "weg"
      ? wegBei(props.art, werte.value, t.value)
      : geschwindigkeitBei(props.art, werte.value, t.value);
  return { x: x(t.value), y: y(wert) };
});
const wagenX = computed(() => 16 + (368 * wegBei(props.art, werte.value, t.value)) / S_MAX);
const xTicks = Array.from({ length: DAUER / ABSCHNITT + 1 }, (_, i) => i * ABSCHNITT);
const yTicks = computed(() => Array.from({ length: yMax.value / yTeiler.value + 1 }, (_, i) => i * yTeiler.value));

const anzeigeText = computed(() => anzeigeFuer(props.anzeige, props.art, werte.value, t.value));
const beschreibung = computed(() => beschreibungFuer(props.alt, props.einheitY, props.ansicht, props.art, werte.value));

function regler(index: number): { label: string; min: number; max: number } {
  return reglerFuer(props.abschnitt, props.knoten, props.ansicht, props.art, werte.value, index);
}

function setze(index: number, ereignis: Event): void {
  const neu = werte.value.slice();
  neu[index] = Number((ereignis.target as HTMLInputElement).value);
  werte.value = normalisiere(props.art, props.ansicht, neu);
}

function schritt(zeitpunkt: number): void {
  const vergangen = (zeitpunkt - zuletzt) / 1000;
  zuletzt = zeitpunkt;
  t.value = Math.min(DAUER, t.value + vergangen);
  if (t.value >= DAUER) {
    laeuft.value = false;
    return;
  }
  rahmen = naechster(schritt);
}

function startPause(): void {
  if (laeuft.value) {
    laeuft.value = false;
    abbrechen(rahmen);
    return;
  }
  if (t.value >= DAUER) t.value = 0;
  laeuft.value = true;
  zuletzt = jetzt();
  rahmen = naechster(schritt);
}

function zeitSetzen(ereignis: Event): void {
  laeuft.value = false;
  abbrechen(rahmen);
  t.value = Number((ereignis.target as HTMLInputElement).value);
}

function neuStart(): void {
  laeuft.value = false;
  abbrechen(rahmen);
  t.value = 0;
  werte.value = normalisiere(props.art, props.ansicht, props.start);
}

onBeforeUnmount(() => abbrechen(rahmen));
</script>

<template>
  <div class="bewegungsdiagramm">
    <svg viewBox="0 0 400 290" role="img" :aria-label="beschreibung" class="bd-bild">
      <!-- the track with the cart -->
      <text x="16" y="14" class="bd-text bd-klein">{{ bahn }}</text>
      <line x1="16" y1="52" x2="384" y2="52" class="bd-achse" />
      <rect :x="wagenX - 14" y="30" width="28" height="16" class="bd-wagen" />
      <circle :cx="wagenX - 8" cy="49" r="3.5" class="bd-wagen" />
      <circle :cx="wagenX + 8" cy="49" r="3.5" class="bd-wagen" />
      <!-- the diagram -->
      <g v-for="tick in yTicks" :key="'y' + tick">
        <line :x1="links" :y1="y(tick)" :x2="rechts" :y2="y(tick)" class="bd-gitter" />
        <text :x="links - 6" :y="y(tick) + 4" text-anchor="end" class="bd-text bd-klein">{{ tick }}</text>
      </g>
      <g v-for="tick in xTicks" :key="'x' + tick">
        <line :x1="x(tick)" :y1="oben" :x2="x(tick)" :y2="unten" class="bd-gitter" />
        <text :x="x(tick)" :y="unten + 15" text-anchor="middle" class="bd-text bd-klein">{{ tick }}</text>
      </g>
      <line :x1="links" :y1="oben" :x2="links" :y2="unten" class="bd-achse" />
      <line :x1="links" :y1="unten" :x2="rechts" :y2="unten" class="bd-achse" />
      <text :x="links" :y="oben - 8" class="bd-text bd-klein">{{ achseY }}</text>
      <text :x="rechts" :y="unten + 31" text-anchor="end" class="bd-text bd-klein">{{ achseT }}</text>
      <polyline :points="linie" class="bd-graph" />
      <line :x1="marke.x" :y1="oben" :x2="marke.x" :y2="unten" class="bd-marke" />
      <circle :cx="marke.x" :cy="marke.y" r="5.5" class="bd-punkt" />
    </svg>
    <p class="bd-anzeige" aria-live="off">{{ anzeigeText }}</p>
    <div class="bd-zeile">
      <button type="button" class="bd-knopf" @click="startPause">{{ laeuft ? pauseKnopf : startKnopf }}</button>
      <label class="bd-zeit"
        >{{ zeit }}
        <input type="range" min="0" :max="DAUER" step="0.1" :value="t" @input="zeitSetzen" />
      </label>
    </div>
    <div class="bd-regler">
      <label v-for="(wert, index) in werte" :key="index" class="bd-feld">
        <span>{{ regler(index).label }}: {{ wert }} m/s</span>
        <input
          type="range"
          :min="regler(index).min"
          :max="regler(index).max"
          step="1"
          :value="wert"
          @input="setze(index, $event)"
        />
      </label>
    </div>
    <div class="bd-zeile">
      <button type="button" class="bd-knopf" @click="neuStart">{{ props.zuruecksetzen }}</button>
    </div>
  </div>
</template>

<style scoped>
.bewegungsdiagramm {
  --bd-marke: #c2255c;
  display: grid;
  gap: 0.75rem;
}
@media (prefers-color-scheme: dark) {
  .bewegungsdiagramm {
    --bd-marke: #ff8cc6;
  }
}
.bd-bild {
  width: 100%;
  max-width: 34rem;
  height: auto;
}
.bd-text {
  fill: var(--page-text);
  font-size: 14px;
}
.bd-klein {
  font-size: 13px;
}
.bd-achse {
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.bd-gitter {
  stroke: var(--page-border);
  stroke-width: 1;
}
.bd-graph {
  fill: none;
  stroke: var(--page-accent);
  stroke-width: 3;
  stroke-linejoin: round;
}
.bd-marke {
  stroke: var(--bd-marke);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.bd-punkt {
  fill: var(--bd-marke);
  stroke: var(--page-background);
  stroke-width: 2;
}
.bd-wagen {
  fill: var(--page-accent);
}
.bd-anzeige {
  margin: 0;
  font-weight: 600;
}
.bd-zeile {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.bd-zeit {
  display: flex;
  flex: 1 1 12rem;
  flex-direction: column;
  gap: 0.25rem;
}
.bd-regler {
  display: grid;
  gap: 0.5rem;
}
.bd-feld {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.bd-feld input,
.bd-zeit input {
  min-height: 2.75rem;
  width: 100%;
}
.bd-knopf {
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-surface);
  color: var(--page-text);
  font: inherit;
  cursor: pointer;
}
</style>
