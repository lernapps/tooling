<script setup lang="ts">
// A car on a straight road, photographed at the start and after each of five seconds. The learner sets the speed of
// every second with − and +; the photos and the arrows above them show the drive. Its logic is in FahrtStreifen.ts.
// It is the input of the task: it emits the five speeds with answer, and the explainer draws "Prüfen", checks the
// answer, gives the feedback, the task number and "Neue Aufgabe".
import { computed, ref } from "vue";
import { generate, MAX_SPEED, positions, SECONDS } from "./FahrtStreifen.ts";

const props = defineProps<{
  /** One task text per kind of drive: braking and turning, speeding up and stopping, constant speed. */
  tasks: string[];
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes: string[];
  /** What a drive lacks: no braking, no turn, no speeding up, no stop, not constant. */
  missing: string[];
  /** The name of a second for the controls, with {n} for its number. */
  secondLabel: string;
  /** The button that lowers the speed, with {n} for the second. */
  lessLabel: string;
  /** The button that raises the speed, with {n} for the second. */
  moreLabel: string;
  /** The speed of a second as shown and read, with {v} for the speed in m/s. */
  valueLabel: string;
  /** What the picture shows, for screen readers: the road, the photos, the arrows. */
  figureAlt: string;
  /** The legend below the picture: what a dot and what an arrow mean. */
  legend: string;
  /** The button that sets the drive back to the start. */
  resetLabel: string;
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the picture gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number[] | undefined] }>();

const START = 2;
const task = computed(() => generate(props.seed, undefined));
const speeds = ref<number[]>(Array.from({ length: SECONDS }, () => START));
const positionsNow = computed(() => positions(speeds.value));

const fill = (text: string, n: number, v = 0) =>
  text.replace(/\{n\}/g, String(n)).replace(/\{v\}/g, String(v).replace("-", "−"));

function change(index: number, step: number): void {
  const next = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, (speeds.value[index] ?? 0) + step));
  speeds.value[index] = next;
  emit("answer", [...speeds.value]);
}

function reset(): void {
  speeds.value = Array.from({ length: SECONDS }, () => START);
  emit("answer", undefined);
}

// the picture: x in metres, the road at y 32; the arrow of second k above, in two rows so that neighbours show apart
const arrowY = (k: number) => (k % 2 === 0 ? 20 : 11);
const arrowHead = (from: number, to: number, y: number) => {
  const h = Math.min(1.6, Math.abs(to - from) * 0.8);
  const back = to >= from ? to - h : to + h;
  return `${to},${y} ${back},${y - 1} ${back},${y + 1}`;
};
// the labels of the photos: where photos lie on one spot, their times share one label
const photoLabels = computed(() => {
  const spots = new Map<number, number[]>();
  positionsNow.value.forEach((x, time) => spots.set(x, [...(spots.get(x) ?? []), time]));
  return [...spots.entries()].map(([x, times]) => ({ x, text: `${times.join(", ")} s` }));
});
</script>

<template>
  <div class="fahrt-streifen">
    <p class="fahrt-streifen-task">{{ tasks[task.kind] }}</p>
    <svg viewBox="-34 4 68 42" role="img" :aria-label="figureAlt" class="fahrt-streifen-figure">
      <line x1="-33" y1="32" x2="33" y2="32" class="fahrt-road" />
      <g v-for="(v, k) in speeds" :key="`arrow-${k}`">
        <template v-if="v !== 0">
          <line :x1="positionsNow[k]" :y1="arrowY(k)" :x2="positionsNow[k + 1]" :y2="arrowY(k)" class="fahrt-arrow" />
          <polygon
            :points="arrowHead(positionsNow[k] ?? 0, positionsNow[k + 1] ?? 0, arrowY(k))"
            class="fahrt-arrow-head"
          />
        </template>
        <text
          :x="((positionsNow[k] ?? 0) + (positionsNow[k + 1] ?? 0)) / 2"
          :y="arrowY(k) - 2"
          class="fahrt-arrow-text"
          text-anchor="middle"
        >
          {{ String(v).replace("-", "−") }}
        </text>
      </g>
      <circle v-for="(x, time) in positionsNow" :key="`photo-${time}`" :cx="x" cy="32" r="1.5" class="fahrt-photo" />
      <text
        v-for="(label, i) in photoLabels"
        :key="`time-${i}`"
        :x="label.x"
        :y="i % 2 === 0 ? 38 : 42"
        class="fahrt-time-text"
        text-anchor="middle"
      >
        {{ label.text }}
      </text>
    </svg>
    <p class="fahrt-streifen-legend">{{ legend }}</p>
    <div class="fahrt-streifen-controls">
      <div
        v-for="(v, index) in speeds"
        :key="index"
        class="fahrt-streifen-control"
        role="group"
        :aria-label="fill(secondLabel, index + 1)"
      >
        <span class="fahrt-streifen-name">{{ fill(secondLabel, index + 1) }}</span>
        <div class="fahrt-streifen-buttons">
          <button
            type="button"
            :aria-label="fill(lessLabel, index + 1)"
            :disabled="v <= -MAX_SPEED"
            @click="change(index, -1)"
          >
            −
          </button>
          <output aria-live="polite">{{ fill(valueLabel, index + 1, v) }}</output>
          <button
            type="button"
            :aria-label="fill(moreLabel, index + 1)"
            :disabled="v >= MAX_SPEED"
            @click="change(index, 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>
    <p>
      <button type="button" class="fahrt-streifen-reset" :disabled="checked" @click="reset">{{ resetLabel }}</button>
    </p>
  </div>
</template>

<style scoped>
.fahrt-streifen-figure {
  display: block;
  width: 100%;
  max-width: 36rem;
  height: auto;
  border: 1px solid var(--page-border);
  background: var(--page-surface);
}

.fahrt-road {
  stroke: var(--page-text);
  stroke-width: 0.4;
}

.fahrt-photo {
  fill: var(--page-text);
  stroke: var(--page-surface);
  stroke-width: 0.4;
}

.fahrt-arrow {
  stroke: #b34700;
  stroke-width: 0.8;
}

.fahrt-arrow-head {
  fill: #b34700;
}

.fahrt-arrow-text {
  fill: var(--page-text);
  font-size: 2.6px;
}

.fahrt-time-text {
  fill: var(--page-muted);
  font-size: 2.4px;
}

@media (prefers-color-scheme: dark) {
  .fahrt-arrow {
    stroke: #ffb066;
  }

  .fahrt-arrow-head {
    fill: #ffb066;
  }
}

.fahrt-streifen-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.fahrt-streifen-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fahrt-streifen-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fahrt-streifen-buttons output {
  min-width: 4.5rem;
  text-align: center;
}

.fahrt-streifen-buttons button,
.fahrt-streifen-reset {
  min-width: 44px;
  min-height: 44px;
}
</style>
