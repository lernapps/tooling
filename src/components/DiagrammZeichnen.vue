<script setup lang="ts">
// A speed-time diagram that learners set to fit a story: four sliders for the speed at 0, 3, 6 and 9 seconds, and the
// graph joins the four points. Its logic is in DiagrammZeichnen.ts. It is the input of the task: it emits the four
// speeds with answer, and the explainer draws "Prüfen", checks the answer and gives the feedback.
import { computed, ref } from "vue";
import { V_MAX, ZEITEN, generate, story } from "./DiagrammZeichnen.ts";

const props = defineProps<{
  /** The stories, one for each scenario, with {v} for the top speed and {h} for half of it (m/s). */
  szenarien: string[];
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes: string[];
  /** The message when one section does not fit, with {n}, {von} and {bis}. */
  fehlerAbschnitt: string;
  /** The message when the shape fits but a value does not. */
  fehlerWert: string;
  /** What the diagram shows, for screen readers. */
  alt: string;
  /** Label of a slider, with {t}. */
  regler: string;
  /** Axis labels. */
  achseT: string;
  achseY: string;
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the diagram gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number[]] }>();

const aufgabe = computed(() => story(generate(props.seed, props), props));
const werte = ref<number[]>([6, 6, 6, 6]);

// the drawing: 400 x 280
const links = 52;
const rechts = 384;
const oben = 30;
const unten = 232;
const x = (t: number): number => links + ((rechts - links) * t) / 9;
const y = (v: number): number => unten - ((unten - oben) * v) / V_MAX;
const linie = computed(() => werte.value.map((v, i) => `${x(ZEITEN[i] ?? 0).toFixed(1)},${y(v).toFixed(1)}`).join(" "));
const yTicks = [0, 2, 4, 6, 8, 10, 12];
const beschreibung = computed(
  () => `${props.alt} ${ZEITEN.map((t, i) => `${t} s: ${werte.value[i]} m/s`).join("; ")}.`,
);

function setze(index: number, ereignis: Event): void {
  const neu = werte.value.slice();
  neu[index] = Number((ereignis.target as HTMLInputElement).value);
  werte.value = neu;
  emit("answer", neu);
}
</script>

<template>
  <div class="diagramm-zeichnen">
    <p>{{ aufgabe }}</p>
    <svg viewBox="0 0 400 280" role="img" :aria-label="beschreibung" class="dz-bild">
      <g v-for="tick in yTicks" :key="'y' + tick">
        <line :x1="links" :y1="y(tick)" :x2="rechts" :y2="y(tick)" class="dz-gitter" />
        <text :x="links - 6" :y="y(tick) + 4" text-anchor="end" class="dz-text">{{ tick }}</text>
      </g>
      <g v-for="t in ZEITEN" :key="'x' + t">
        <line :x1="x(t)" :y1="oben" :x2="x(t)" :y2="unten" class="dz-gitter" />
        <text :x="x(t)" :y="unten + 16" text-anchor="middle" class="dz-text">{{ t }}</text>
      </g>
      <line :x1="links" :y1="oben" :x2="links" :y2="unten" class="dz-achse" />
      <line :x1="links" :y1="unten" :x2="rechts" :y2="unten" class="dz-achse" />
      <text :x="links" :y="oben - 10" class="dz-text">{{ achseY }}</text>
      <text :x="rechts" :y="unten + 34" text-anchor="end" class="dz-text">{{ achseT }}</text>
      <polyline :points="linie" class="dz-graph" :class="{ 'dz-geprueft': checked }" />
      <circle v-for="(v, i) in werte" :key="i" :cx="x(ZEITEN[i] ?? 0)" :cy="y(v)" r="6" class="dz-punkt" />
    </svg>
    <div class="dz-regler">
      <label v-for="(v, i) in werte" :key="i" class="dz-feld">
        <span>{{ regler.replace("{t}", String(ZEITEN[i])) }}: {{ v }} m/s</span>
        <input type="range" min="0" :max="V_MAX" step="1" :value="v" @input="setze(i, $event)" />
      </label>
    </div>
  </div>
</template>

<style scoped>
.diagramm-zeichnen {
  display: grid;
  gap: 0.75rem;
}
.dz-bild {
  width: 100%;
  max-width: 34rem;
  height: auto;
}
.dz-text {
  fill: var(--page-text);
  font-size: 14px;
}
.dz-achse {
  stroke: var(--page-text);
  stroke-width: 1.5;
}
.dz-gitter {
  stroke: var(--page-border);
  stroke-width: 1;
}
.dz-graph {
  fill: none;
  stroke: var(--page-accent);
  stroke-width: 3;
  stroke-linejoin: round;
}
.dz-geprueft {
  stroke-dasharray: 8 3;
}
.dz-punkt {
  fill: var(--page-accent);
  stroke: var(--page-background);
  stroke-width: 2;
}
.dz-regler {
  display: grid;
  gap: 0.5rem;
}
.dz-feld {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.dz-feld input {
  min-height: 2.75rem;
  width: 100%;
}
</style>
