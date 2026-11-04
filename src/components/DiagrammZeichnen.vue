<script setup lang="ts">
// The speed-time diagram of a drive told in words. Learners set the speed at t = 1 to 6 s with + and −; the line
// follows. The start speed is given. It emits the 7 speeds as the answer on every change; the explainer draws "Prüfen",
// checks and gives the feedback. Its logic is in DiagrammZeichnen.ts. It never shows the solution.
import { computed, ref } from "vue";
import { generate, type Aufgabe } from "./DiagrammZeichnen.ts";
import {
  DAUER,
  FLAECHE,
  TEMPO_MAX,
  aendere,
  alsPunkte,
  bereich,
  fuelle,
  geschwindigkeitsPunkte,
  tempoMin,
  xVon,
  yVon,
} from "./BewegungsDiagramm.ts";

const props = defineProps<{
  /** The drives in words: text, verlauf (one sign per second), start speed and, where asked, end speed. */
  aufgaben: Aufgabe[];
  /** The speed may be negative: the wagon goes backwards, too. */
  rueckwaerts?: boolean;
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes: string[];
  /** The message for a wrong second, with {a} and {b}. */
  abschnitt: string;
  /** The message for a wrong start or end. */
  endeFalsch: string;
  anweisung: string;
  startText: string;
  tempoTitel: string;
  tempoLabel: string;
  mehr: string;
  weniger: string;
  zuruecksetzen: string;
  diagrammTitel: string;
  achseZeit: string;
  achseGeschwindigkeit: string;
  bild: string;
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the diagram gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number[]] }>();

const aufgabe = computed(() => generate(props.seed, props));
const rueckwaerts = computed(() => props.rueckwaerts === true);
const anfang = (): number[] => Array.from({ length: DAUER + 1 }, () => aufgabe.value.start);
const tempo = ref<number[]>(anfang());
const bereichen = computed(() => bereich(rueckwaerts.value));
const sekunden = Array.from({ length: DAUER }, (_, i) => i + 1);
const zeiten = Array.from({ length: DAUER + 1 }, (_, i) => i);
const linie = computed(() => alsPunkte(geschwindigkeitsPunkte(tempo.value, rueckwaerts.value)));
const punkte = computed(() => geschwindigkeitsPunkte(tempo.value, rueckwaerts.value));
const ticks = computed(() => {
  const liste: number[] = [];
  for (let v = tempoMin(rueckwaerts.value); v <= TEMPO_MAX; v += 2) liste.push(v);
  return liste;
});
const alt = computed(() => fuelle(props.bild, { v: tempo.value.join(", ") }));
const unten = FLAECHE.hoehe - FLAECHE.unten;

function aendern(sekunde: number, schritt: number): void {
  tempo.value = aendere(tempo.value, sekunde, schritt, rueckwaerts.value);
  emit("answer", tempo.value.slice());
}
function ruecksetzen(): void {
  tempo.value = anfang();
  emit("answer", tempo.value.slice());
}
</script>

<template>
  <div class="zeichnen">
    <p>{{ aufgabe.text }}</p>
    <p>{{ anweisung }} {{ fuelle(startText, { v: String(aufgabe.start) }) }}</p>
    <p class="zw-titel">{{ diagrammTitel }}</p>
    <svg
      class="zw-diagramm"
      :class="{ 'zw-geprueft': checked }"
      :viewBox="`0 0 ${FLAECHE.breite} ${FLAECHE.hoehe}`"
      role="img"
      :aria-label="alt"
    >
      <line class="zw-achse" :x1="FLAECHE.links" :y1="FLAECHE.oben" :x2="FLAECHE.links" :y2="unten" />
      <line class="zw-achse" :x1="FLAECHE.links" :y1="unten" :x2="FLAECHE.breite - FLAECHE.rechts" :y2="unten" />
      <g v-for="v in ticks" :key="`t${v}`">
        <line
          class="zw-raster"
          :x1="FLAECHE.links"
          :x2="FLAECHE.breite - FLAECHE.rechts"
          :y1="yVon(v, bereichen.vMin, bereichen.vMax)"
          :y2="yVon(v, bereichen.vMin, bereichen.vMax)"
        />
        <text class="zw-zahl" :x="FLAECHE.links - 6" :y="yVon(v, bereichen.vMin, bereichen.vMax) + 4" text-anchor="end">
          {{ v }}
        </text>
      </g>
      <g v-for="t in zeiten" :key="`x${t}`">
        <line class="zw-achse" :x1="xVon(t)" :x2="xVon(t)" :y1="unten" :y2="unten + 4" />
        <text class="zw-zahl" :x="xVon(t)" :y="unten + 16" text-anchor="middle">{{ t }}</text>
      </g>
      <text class="zw-beschriftung" :x="FLAECHE.links + 4" :y="10">{{ achseGeschwindigkeit }}</text>
      <text class="zw-beschriftung" :x="FLAECHE.breite - FLAECHE.rechts" :y="FLAECHE.hoehe - 2" text-anchor="end">
        {{ achseZeit }}
      </text>
      <polyline class="zw-linie" :points="linie" />
      <circle v-for="(p, i) in punkte" :key="`p${i}`" class="zw-marke" :cx="p.x" :cy="p.y" r="3.5" />
    </svg>

    <p class="zw-titel">{{ tempoTitel }}</p>
    <div class="zw-reihe">
      <div v-for="t in sekunden" :key="t" class="zw-steller">
        <span class="zw-wert">{{ fuelle(tempoLabel, { t: String(t) }) }}</span>
        <span class="zw-knoepfe">
          <button type="button" :aria-label="fuelle(weniger, { t: String(t) })" @click="aendern(t, -1)">−</button>
          <output :aria-label="fuelle(tempoLabel, { t: String(t) })">{{ tempo[t] }}</output>
          <button type="button" :aria-label="fuelle(mehr, { t: String(t) })" @click="aendern(t, 1)">+</button>
        </span>
      </div>
    </div>
    <p>
      <button type="button" class="zw-zurueck" @click="ruecksetzen">{{ zuruecksetzen }}</button>
    </p>
  </div>
</template>

<style scoped>
.zeichnen {
  --zw-v: #a14a00;
}

@media (prefers-color-scheme: dark) {
  .zeichnen {
    --zw-v: #ffa45c;
  }
}

.zw-titel {
  margin-block: 0.75rem 0.25rem;
  font-weight: 600;
}

.zw-diagramm {
  display: block;
  width: 100%;
  max-width: 28rem;
  height: auto;
}

.zw-achse {
  stroke: var(--page-text);
  stroke-width: 1.5;
}

.zw-raster {
  stroke: var(--page-border);
  stroke-width: 1;
}

.zw-zahl {
  fill: var(--page-text);
  font-size: 10px;
}

.zw-beschriftung {
  fill: var(--page-text);
  font-size: 11px;
  font-weight: 600;
}

.zw-linie {
  fill: none;
  stroke: var(--zw-v);
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.zw-marke {
  fill: var(--zw-v);
  stroke: var(--page-background);
  stroke-width: 1;
}

/* the answer checked: the line a little lighter until the learner changes it */
.zw-geprueft .zw-linie {
  opacity: 0.75;
}

.zw-reihe {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.zw-steller {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  min-width: 6.5rem;
}

.zw-knoepfe {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.zw-knoepfe output {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.zw-wert {
  font-size: 0.9rem;
}

.zeichnen button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0 0.5rem;
  border: 1px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-surface);
  color: var(--page-text);
  cursor: pointer;
}

.zeichnen button:focus-visible {
  outline: 3px solid var(--page-accent);
  outline-offset: 2px;
}
</style>
