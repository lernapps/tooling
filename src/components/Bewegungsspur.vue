<script setup lang="ts">
// A cart on a track and one dot for each second (stroboscopic picture). Learners choose a motion and press "Start":
// the cart runs and a dot appears each second. They see whether the distances between the dots grow, stay or shrink.
// The logic is in Bewegungsspur.ts. The component only shows; it checks nothing.
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { SPURLAENGE, abstandsText, ortBei, reihen, sichtbar } from "./Bewegungsspur.ts";

const props = defineProps<{
  /** The motions to choose from: a name and the places of the cart at 0, 1, 2 ... seconds in metres. */
  bewegungen: { name: string; orte: number[] }[];
  /** What the picture shows, for screen readers. */
  alt: string;
  /** The label of the track. */
  bahn: string;
  /** The label of the choice of motion. */
  auswahl: string;
  /** One distance between two dots, with {n} and {m} for the seconds and {d} for the metres. */
  abstand: string;
  /** The mark behind a distance on the way back. */
  zurueck: string;
  /** The label above the list of distances. */
  abstandUeberschrift: string;
  /** The label of a second under a dot, with {t}. */
  sekunde: string;
  startKnopf: string;
  pauseKnopf: string;
}>();

const gewaehlt = ref(0);
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

const orte = computed(() => props.bewegungen[gewaehlt.value]?.orte ?? [0, 0]);
const ende = computed(() => orte.value.length - 1);
const ZEILE = 56;
const links = 20;
const breite = 360;
const x = (ort: number): number => links + (breite * ort) / SPURLAENGE;
const reihe = computed(() => reihen(orte.value));
const punkte = computed(() => {
  const n = sichtbar(orte.value, t.value);
  return orte.value.slice(0, n).map((ort, i) => ({ i, x: x(ort), y: 100 + ZEILE * (reihe.value[i] ?? 0) }));
});
// the height fits the motion with most rows, so the picture does not jump when another motion is chosen
const hoehe = computed(() => 130 + ZEILE * Math.max(...props.bewegungen.map((b) => Math.max(...reihen(b.orte)))));
const wagenX = computed(() => x(ortBei(orte.value, t.value)));
const abstaende = computed(() => abstandsText(props.abstand, orte.value, t.value, props.zurueck));
const ticks = [0, 10, 20, 30, 40];

function schritt(zeitpunkt: number): void {
  t.value = Math.min(ende.value, t.value + (zeitpunkt - zuletzt) / 1000);
  zuletzt = zeitpunkt;
  if (t.value >= ende.value) {
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
  if (t.value >= ende.value) t.value = 0;
  laeuft.value = true;
  zuletzt = jetzt();
  rahmen = naechster(schritt);
}

function waehle(index: number): void {
  laeuft.value = false;
  abbrechen(rahmen);
  t.value = 0;
  gewaehlt.value = index;
}

onBeforeUnmount(() => abbrechen(rahmen));
</script>

<template>
  <div class="bewegungsspur">
    <div class="bs-auswahl" role="group" :aria-label="auswahl">
      <button
        v-for="(bewegung, index) in bewegungen"
        :key="index"
        type="button"
        class="bs-knopf"
        :aria-pressed="index === gewaehlt"
        @click="waehle(index)"
      >
        {{ bewegung.name }}
      </button>
    </div>
    <svg :viewBox="`0 0 400 ${hoehe}`" role="img" :aria-label="alt" class="bs-bild">
      <text x="20" y="16" class="bs-text">{{ bahn }}</text>
      <line :x1="links" y1="62" :x2="links + breite" y2="62" class="bs-achse" />
      <g v-for="tick in ticks" :key="tick">
        <line :x1="x(tick)" y1="62" :x2="x(tick)" y2="68" class="bs-achse" />
        <text :x="x(tick)" y="82" text-anchor="middle" class="bs-text bs-klein">{{ tick }}</text>
      </g>
      <rect :x="wagenX - 16" y="36" width="32" height="18" class="bs-wagen" />
      <circle :cx="wagenX - 9" cy="58" r="4" class="bs-wagen" />
      <circle :cx="wagenX + 9" cy="58" r="4" class="bs-wagen" />
      <g v-for="punkt in punkte" :key="punkt.i">
        <circle :cx="punkt.x" :cy="punkt.y" r="6" class="bs-punkt" />
        <text :x="punkt.x" :y="punkt.y + 22 + (punkt.i % 2) * 16" text-anchor="middle" class="bs-text bs-klein">
          {{ sekunde.replace("{t}", String(punkt.i)) }}
        </text>
      </g>
    </svg>
    <div class="bs-zeile">
      <button type="button" class="bs-knopf" @click="startPause">{{ laeuft ? pauseKnopf : startKnopf }}</button>
    </div>
    <div v-if="abstaende.length > 0" class="bs-liste">
      <p class="bs-ueberschrift">{{ abstandUeberschrift }}</p>
      <ul>
        <li v-for="zeile in abstaende" :key="zeile">{{ zeile }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.bewegungsspur {
  display: grid;
  gap: 0.75rem;
}
.bs-auswahl,
.bs-zeile {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.bs-knopf {
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-surface);
  color: var(--page-text);
  font: inherit;
  cursor: pointer;
}
.bs-knopf[aria-pressed="true"] {
  background: var(--page-accent);
  border-color: var(--page-accent);
  color: var(--page-on-accent);
  font-weight: 600;
}
.bs-bild {
  width: 100%;
  max-width: 34rem;
  height: auto;
}
.bs-text {
  fill: var(--page-text);
  font-size: 14px;
}
.bs-klein {
  font-size: 13px;
}
.bs-achse {
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.bs-wagen {
  fill: var(--page-accent);
}
.bs-punkt {
  fill: var(--page-accent);
  stroke: var(--page-background);
  stroke-width: 2;
}
.bs-ueberschrift {
  margin: 0 0 0.25rem;
  font-weight: 600;
}
.bs-liste ul {
  margin: 0;
  padding-left: 1.25rem;
}
</style>
