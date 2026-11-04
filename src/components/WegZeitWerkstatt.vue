<script setup lang="ts">
// A drive on a straight road and its distance-time diagram side by side. The learner chooses a drive, changes the
// speed of each stretch of 2 s with − and +, and moves the time with a slider: the car and a point on the line move
// together. The road stays straight; the line of the diagram bends. The logic is in Bewegung.ts.
import { computed, ref } from "vue";
import {
  distanceAt,
  fillText,
  pathPoints,
  speedsOf,
  STRETCH,
  STRETCHES,
  TOP_DISTANCE,
  TOP_SPEED,
  DURATION,
} from "./Bewegung.ts";
import type { Fahrt } from "./Bewegung.ts";

const props = defineProps<{
  /** The drives to choose from; the first is the start state. */
  fahrten: Fahrt[];
  /** The label of the choice of a drive. */
  chooseLabel: string;
  /** The label of the speed of a stretch, with {from} and {to} for its seconds. */
  speedLabel: string;
  /** The button that lowers the speed of a stretch, with {from} and {to}. */
  lessLabel: string;
  /** The button that raises the speed of a stretch, with {from} and {to}. */
  moreLabel: string;
  /** The speed as shown, with {v}. */
  valueLabel: string;
  /** The label of the time slider. */
  timeLabel: string;
  /** What the time and distance say now, with {t} and {s}. */
  readout: string;
  /** The title above the road. */
  roadTitle: string;
  /** The title above the diagram. */
  diagramTitle: string;
  /** What the road figure shows, for screen readers. */
  roadAlt: string;
  /** What the diagram shows, for screen readers. */
  diagramAlt: string;
  /** The title of the axis of time. */
  timeAxis: string;
  /** The title of the axis of distance. */
  distanceAxis: string;
}>();

const first = props.fahrten[0];
const chosen = ref(first?.id ?? "");
const speeds = ref<number[]>(first ? speedsOf(first) : Array.from({ length: STRETCHES }, () => 5));
const t = ref(0);

function choose(): void {
  const fahrt = props.fahrten.find((item) => item.id === chosen.value);
  if (fahrt) speeds.value = speedsOf(fahrt);
}

function change(index: number, step: number): void {
  speeds.value[index] = Math.max(0, Math.min(TOP_SPEED, (speeds.value[index] ?? 0) + step));
}

const distance = computed(() => distanceAt(speeds.value, t.value));
const points = computed(() => pathPoints(speeds.value));

// the road: 0 to 100 m on 100 units, the diagram: the origin at (22, 76), 10 units per second, 0.65 per metre
const X0 = 22;
const Y0 = 76;
const px = (seconds: number) => X0 + seconds * 10;
const py = (metres: number) => Y0 - metres * 0.65;
const line = computed(() => points.value.map((p) => `${px(p.t)},${py(p.s)}`).join(" "));
const timeTicks = Array.from({ length: DURATION / STRETCH + 1 }, (_, i) => i * STRETCH);
const distanceTicks = Array.from({ length: TOP_DISTANCE / 20 + 1 }, (_, i) => i * 20);
const fromTo = (index: number) => ({ from: index * STRETCH, to: (index + 1) * STRETCH });
</script>

<template>
  <div class="wz-werkstatt">
    <p>
      <label>
        {{ chooseLabel }}
        <select v-model="chosen" @change="choose">
          <option v-for="fahrt in fahrten" :key="fahrt.id" :value="fahrt.id">{{ fahrt.name }}</option>
        </select>
      </label>
    </p>
    <div class="wz-controls">
      <div
        v-for="(v, index) in speeds"
        :key="index"
        class="wz-control"
        role="group"
        :aria-label="fillText(speedLabel, fromTo(index))"
      >
        <span>{{ fillText(speedLabel, fromTo(index)) }}</span>
        <div class="wz-buttons">
          <button
            type="button"
            :aria-label="fillText(lessLabel, fromTo(index))"
            :disabled="v <= 0"
            @click="change(index, -1)"
          >
            −
          </button>
          <output>{{ fillText(valueLabel, { v }) }}</output>
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
      <label class="wz-time">
        {{ timeLabel }}
        <input v-model.number="t" type="range" min="0" :max="DURATION" step="0.5" />
      </label>
    </p>
    <p aria-live="polite" class="wz-readout">{{ fillText(readout, { t, s: Math.round(distance * 10) / 10 }) }}</p>
    <p class="wz-title">{{ roadTitle }}</p>
    <svg viewBox="0 0 110 22" role="img" :aria-label="roadAlt" class="wz-figure">
      <line x1="5" y1="12" x2="105" y2="12" class="wz-road" />
      <line x1="5" y1="12" :x2="5 + distance" y2="12" class="wz-covered" />
      <g v-for="tick in distanceTicks" :key="`road-${tick}`">
        <line :x1="5 + tick" y1="14" :x2="5 + tick" y2="16" class="wz-road" />
        <text :x="5 + tick" y="20" text-anchor="middle" class="wz-tick-text">{{ tick }}</text>
      </g>
      <rect :x="5 + distance - 3" y="5" width="6" height="5" rx="1" class="wz-car" />
    </svg>
    <p class="wz-title">{{ diagramTitle }}</p>
    <svg viewBox="0 0 130 90" role="img" :aria-label="diagramAlt" class="wz-figure">
      <g v-for="tick in timeTicks" :key="`t-${tick}`">
        <line :x1="px(tick)" :y1="py(0)" :x2="px(tick)" :y2="py(TOP_DISTANCE)" class="wz-grid" />
        <text :x="px(tick)" :y="Y0 + 6" text-anchor="middle" class="wz-tick-text">{{ tick }}</text>
      </g>
      <g v-for="tick in distanceTicks" :key="`s-${tick}`">
        <line :x1="px(0)" :y1="py(tick)" :x2="px(DURATION)" :y2="py(tick)" class="wz-grid" />
        <text :x="X0 - 2" :y="py(tick) + 1" text-anchor="end" class="wz-tick-text">{{ tick }}</text>
      </g>
      <line :x1="px(0)" :y1="py(0)" :x2="px(DURATION) + 3" :y2="py(0)" class="wz-axis" />
      <line :x1="px(0)" :y1="py(0)" :x2="px(0)" :y2="py(TOP_DISTANCE) - 3" class="wz-axis" />
      <text :x="px(DURATION / 2)" :y="Y0 + 12" text-anchor="middle" class="wz-axis-text">{{ timeAxis }}</text>
      <text :x="X0 + 2" :y="5" class="wz-axis-text">{{ distanceAxis }}</text>
      <polyline :points="line" class="wz-line" />
      <line :x1="px(t)" :y1="py(distance)" :x2="px(t)" :y2="py(0)" class="wz-guide" />
      <line :x1="px(0)" :y1="py(distance)" :x2="px(t)" :y2="py(distance)" class="wz-guide" />
      <circle :cx="px(t)" :cy="py(distance)" r="2" class="wz-point" />
    </svg>
  </div>
</template>

<style scoped>
.wz-figure {
  display: block;
  width: 100%;
  max-width: 36rem;
  height: auto;
  border: 1px solid var(--page-border);
  background: var(--page-surface);
}

.wz-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.wz-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wz-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wz-buttons output {
  min-width: 4.5rem;
  text-align: center;
}

.wz-buttons button {
  min-width: 44px;
  min-height: 44px;
}

.wz-werkstatt select {
  min-height: 44px;
  margin-left: 0.5rem;
}

.wz-time {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.wz-time input {
  width: min(100%, 20rem);
  min-height: 44px;
}

.wz-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.wz-road {
  stroke: var(--page-text);
  stroke-width: 0.5;
}

.wz-covered {
  stroke: #1a5fb4;
  stroke-width: 2;
}

.wz-car {
  fill: var(--page-text);
}

.wz-grid {
  stroke: var(--page-border);
  stroke-width: 0.2;
}

.wz-axis {
  stroke: var(--page-text);
  stroke-width: 0.5;
}

.wz-tick-text {
  fill: var(--page-muted);
  font-size: 3.4px;
}

.wz-axis-text {
  fill: var(--page-text);
  font-size: 4px;
}

.wz-line {
  fill: none;
  stroke: #1a5fb4;
  stroke-width: 1.2;
}

.wz-guide {
  stroke: #b34700;
  stroke-dasharray: 1.5 1.2;
  stroke-width: 0.5;
}

.wz-point {
  fill: #b34700;
  stroke: var(--page-surface);
  stroke-width: 0.5;
}

@media (prefers-color-scheme: dark) {
  .wz-covered,
  .wz-line {
    stroke: #8ab4f8;
  }

  .wz-guide {
    stroke: #ffb066;
  }

  .wz-point {
    fill: #ffb066;
  }
}
</style>
