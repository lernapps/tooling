<script setup lang="ts">
// The learner draws a speed-time diagram: five columns for five stretches of 2 s, each as high as the speed in that
// stretch, set with − and +. Its logic is in VtZeichnen.ts. It is the input of the task: it emits the five speeds with
// answer, and the explainer draws "Prüfen", checks the answer, gives the feedback, the task number and "Neue Aufgabe".
import { computed, ref } from "vue";
import { fillText, STRETCH, DURATION } from "./Bewegung.ts";
import { generate, STRETCHES, TOP_SPEED } from "./VtZeichnen.ts";

const props = defineProps<{
  /** One task text per kind of drive. */
  tasks: string[];
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes: string[];
  /** What a drawing lacks. */
  missing: string[];
  /** The label of the speed of a stretch, with {from} and {to} for its seconds. */
  stretchLabel: string;
  /** The button that lowers the speed of a stretch, with {from} and {to}. */
  lessLabel: string;
  /** The button that raises the speed of a stretch, with {from} and {to}. */
  moreLabel: string;
  /** The speed as shown, with {v}. */
  valueLabel: string;
  /** What the diagram shows, for screen readers. */
  diagramAlt: string;
  /** The title of the axis of time. */
  timeAxis: string;
  /** The title of the axis of speed. */
  speedAxis: string;
  /** The button that sets the columns back to the start. */
  resetLabel: string;
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the diagram gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number[] | undefined] }>();

const START = 3;
const task = computed(() => generate(props.seed, undefined));
const speeds = ref<number[]>(Array.from({ length: STRETCHES }, () => START));

function change(index: number, step: number): void {
  speeds.value[index] = Math.max(0, Math.min(TOP_SPEED, (speeds.value[index] ?? 0) + step));
  emit("answer", [...speeds.value]);
}

function reset(): void {
  speeds.value = Array.from({ length: STRETCHES }, () => START);
  emit("answer", undefined);
}

// the diagram: the origin at (22, 76), 10 units per second, 5.6 per m/s
const X0 = 22;
const Y0 = 76;
const px = (seconds: number) => X0 + seconds * 10;
const py = (speed: number) => Y0 - speed * 5.6;
const timeTicks = Array.from({ length: DURATION / STRETCH + 1 }, (_, i) => i * STRETCH);
const speedTicks = Array.from({ length: TOP_SPEED / 2 + 1 }, (_, i) => i * 2);
const fromTo = (index: number) => ({ from: index * STRETCH, to: (index + 1) * STRETCH });
</script>

<template>
  <div class="vt-zeichnen">
    <p>{{ tasks[task.kind] }}</p>
    <svg viewBox="0 0 130 90" role="img" :aria-label="diagramAlt" class="vt-figure">
      <g v-for="tick in timeTicks" :key="`t-${tick}`">
        <line :x1="px(tick)" :y1="py(0)" :x2="px(tick)" :y2="py(TOP_SPEED)" class="vt-grid" />
        <text :x="px(tick)" :y="Y0 + 6" text-anchor="middle" class="vt-tick-text">{{ tick }}</text>
      </g>
      <g v-for="tick in speedTicks" :key="`v-${tick}`">
        <line :x1="px(0)" :y1="py(tick)" :x2="px(DURATION)" :y2="py(tick)" class="vt-grid" />
        <text :x="X0 - 2" :y="py(tick) + 1" text-anchor="end" class="vt-tick-text">{{ tick }}</text>
      </g>
      <rect
        v-for="(v, index) in speeds"
        :key="`bar-${index}`"
        :x="px(index * STRETCH) + 0.5"
        :y="py(v)"
        :width="STRETCH * 10 - 1"
        :height="v * 5.6"
        class="vt-bar"
      />
      <line :x1="px(0)" :y1="py(0)" :x2="px(DURATION) + 3" :y2="py(0)" class="vt-axis" />
      <line :x1="px(0)" :y1="py(0)" :x2="px(0)" :y2="py(TOP_SPEED) - 3" class="vt-axis" />
      <text :x="px(DURATION / 2)" :y="Y0 + 12" text-anchor="middle" class="vt-axis-text">{{ timeAxis }}</text>
      <text :x="X0 + 2" :y="5" class="vt-axis-text">{{ speedAxis }}</text>
    </svg>
    <div class="vt-controls">
      <div
        v-for="(v, index) in speeds"
        :key="index"
        class="vt-control"
        role="group"
        :aria-label="fillText(stretchLabel, fromTo(index))"
      >
        <span>{{ fillText(stretchLabel, fromTo(index)) }}</span>
        <div class="vt-buttons">
          <button
            type="button"
            :aria-label="fillText(lessLabel, fromTo(index))"
            :disabled="v <= 0"
            @click="change(index, -1)"
          >
            −
          </button>
          <output aria-live="polite">{{ fillText(valueLabel, { v }) }}</output>
          <button
            type="button"
            :aria-label="fillText(moreLabel, fromTo(index))"
            :disabled="v >= TOP_SPEED"
            @click="change(index, 1)"
          >
            +
          </button>
        </div>
      </div>
    </div>
    <p>
      <button type="button" class="vt-reset" :disabled="checked" @click="reset">{{ resetLabel }}</button>
    </p>
  </div>
</template>

<style scoped>
.vt-figure {
  display: block;
  width: 100%;
  max-width: 36rem;
  height: auto;
  border: 1px solid var(--page-border);
  background: var(--page-surface);
}

.vt-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.vt-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.vt-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vt-buttons output {
  min-width: 4.5rem;
  text-align: center;
}

.vt-buttons button,
.vt-reset {
  min-width: 44px;
  min-height: 44px;
}

.vt-grid {
  stroke: var(--page-border);
  stroke-width: 0.2;
}

.vt-axis {
  stroke: var(--page-text);
  stroke-width: 0.5;
}

.vt-tick-text {
  fill: var(--page-muted);
  font-size: 3.4px;
}

.vt-axis-text {
  fill: var(--page-text);
  font-size: 4px;
}

.vt-bar {
  fill: #9ec1ee;
  stroke: #1a5fb4;
  stroke-width: 0.6;
}

@media (prefers-color-scheme: dark) {
  .vt-bar {
    fill: #35527a;
    stroke: #8ab4f8;
  }
}
</style>
