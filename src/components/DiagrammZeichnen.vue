<script setup lang="ts">
// The exercise "Diagramm zeichnen": a story of a trip of 12 s; learners set the velocity at 0, 4, 8 and 12 s with four
// sliders and so draw the v-t diagram. It is the input of the task: it emits the four velocities with answer, and the
// explainer draws "Prüfen", checks the answer and gives the feedback. Its logic is in DiagrammZeichnen.ts.
import { computed, ref } from "vue";
import { generate, ZEITEN } from "./DiagrammZeichnen.ts";

const props = defineProps<{
  /** The task, with {geschichte} for the story. */
  aufgabe: string;
  /** The stories: the velocity at 0, 4, 8 and 12 s. */
  bewegungen: { geschichte: string; v0: number; v1: number; v2: number; v3: number }[];
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes: string[];
  /** The texts: the slider with {t}, the axes and the diagram. */
  texte: { regler: string; zeit: string; geschwindigkeit: string; diagramm: string; alt: string };
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the sliders give now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number[]] }>();

const task = computed(() => generate(props.seed, props));
// the start state: a line on the time axis, nothing set yet
const werte = ref<number[]>([0, 0, 0, 0]);

const X0 = 56;
const X1 = 388;
const Y0 = 206;
const Y1 = 14;
const V_MAX = 12;
const px = (t: number) => X0 + (t / 12) * (X1 - X0);
const py = (v: number) => Y0 - (v / V_MAX) * (Y0 - Y1);
const linie = computed(() =>
  werte.value.map((v, i) => `${i === 0 ? "M" : "L"}${px(ZEITEN[i] ?? 0)} ${py(v)}`).join(" "),
);
const yTicks = [0, 4, 8, 12];

function setze(index: number, wert: number): void {
  werte.value[index] = wert;
  emit("answer", werte.value.slice());
}
</script>

<template>
  <div class="diagramm-zeichnen">
    <p>{{ aufgabe.replace("{geschichte}", task.geschichte) }}</p>
    <figure class="dz-diagramm" :class="{ 'dz-checked': checked }">
      <svg viewBox="0 0 400 240" role="img" :aria-label="texte.alt">
        <g class="dz-gitter">
          <line v-for="t in ZEITEN" :key="'x' + t" :x1="px(t)" :x2="px(t)" :y1="Y1" :y2="Y0" />
          <line v-for="v in yTicks" :key="'y' + v" :x1="X0" :x2="X1" :y1="py(v)" :y2="py(v)" />
        </g>
        <line :x1="X0" :x2="X1" :y1="Y0" :y2="Y0" class="dz-achse" />
        <line :x1="X0" :x2="X0" :y1="Y1" :y2="Y0" class="dz-achse" />
        <path :d="linie" class="dz-linie" fill="none" />
        <rect
          v-for="(v, i) in werte"
          :key="'p' + i"
          :x="px(ZEITEN[i] ?? 0) - 5"
          :y="py(v) - 5"
          width="10"
          height="10"
          class="dz-punkt"
        />
        <g class="dz-zahlen">
          <text v-for="t in ZEITEN" :key="'tx' + t" :x="px(t)" :y="Y0 + 16" text-anchor="middle">{{ t }}</text>
          <text v-for="v in yTicks" :key="'ty' + v" :x="X0 - 6" :y="py(v) + 4" text-anchor="end">{{ v }}</text>
          <text :x="X1" :y="Y0 + 32" text-anchor="end">{{ texte.zeit }}</text>
          <text :x="X0" :y="10" text-anchor="start" class="dz-achsentitel">{{ texte.geschwindigkeit }}</text>
        </g>
      </svg>
      <figcaption>{{ texte.diagramm }}</figcaption>
    </figure>
    <div class="dz-regler">
      <label v-for="(v, i) in werte" :key="i" class="dz-zeile">
        <span>{{ texte.regler.replace("{t}", String(ZEITEN[i])) }}</span>
        <input
          type="range"
          min="0"
          :max="V_MAX"
          step="1"
          :value="v"
          @input="setze(i, Number(($event.target as HTMLInputElement).value))"
        />
        <output>{{ v }} m/s</output>
      </label>
    </div>
  </div>
</template>

<style scoped>
.diagramm-zeichnen {
  --tempo: #b45309;
  max-width: 34rem;
}

@media (prefers-color-scheme: dark) {
  .diagramm-zeichnen {
    --tempo: #f59e0b;
  }
}

.dz-diagramm {
  margin: 0 0 1rem;
}

.dz-diagramm svg {
  width: 100%;
  height: auto;
  display: block;
}

.dz-gitter line {
  stroke: var(--page-border);
  stroke-width: 1;
}

.dz-achse {
  stroke: var(--page-text);
  stroke-width: 1.5;
}

.dz-zahlen text {
  fill: var(--page-text);
  font-size: 12px;
}

.dz-zahlen .dz-achsentitel {
  font-weight: bold;
}

.dz-linie {
  stroke: var(--tempo);
  stroke-width: 3;
  stroke-dasharray: 10 4;
}

.dz-punkt {
  fill: var(--tempo);
  stroke: var(--page-background);
  stroke-width: 2;
}

.dz-checked .dz-linie {
  opacity: 0.7;
}

.dz-regler {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dz-zeile {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) 4.5rem;
  gap: 0.5rem;
  align-items: center;
  min-height: 2.75rem;
}

.dz-zeile input {
  width: 100%;
  min-height: 2.75rem;
  accent-color: var(--page-accent);
}

.dz-zeile output {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 30rem) {
  .dz-zeile {
    grid-template-columns: 1fr 4.5rem;
  }

  .dz-zeile span {
    grid-column: 1 / -1;
  }
}
</style>
