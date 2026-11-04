<script setup lang="ts">
// A speed-time diagram of five columns and, below it, the distance-time diagram of the same drive. The learner
// chooses a drive and changes the height of a column with − and +: the line below gets steeper where the column is
// higher. The logic is in Bewegung.ts.
import { computed, ref } from "vue";
import { fillText, pathPoints, speedsOf, STRETCH, STRETCHES, TOP_DISTANCE, TOP_SPEED, DURATION } from "./Bewegung.ts";
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
  /** The title above the speed-time diagram. */
  speedTitle: string;
  /** The title above the distance-time diagram. */
  distanceTitle: string;
  /** What the speed-time diagram shows, for screen readers. */
  speedAlt: string;
  /** What the distance-time diagram shows, for screen readers. */
  distanceAlt: string;
  /** The title of the axis of time. */
  timeAxis: string;
  /** The title of the axis of speed. */
  speedAxis: string;
  /** The title of the axis of distance. */
  distanceAxis: string;
}>();

const first = props.fahrten[0];
const chosen = ref(first?.id ?? "");
const speeds = ref<number[]>(first ? speedsOf(first) : Array.from({ length: STRETCHES }, () => 5));

function choose(): void {
  const fahrt = props.fahrten.find((item) => item.id === chosen.value);
  if (fahrt) speeds.value = speedsOf(fahrt);
}

function change(index: number, step: number): void {
  speeds.value[index] = Math.max(0, Math.min(TOP_SPEED, (speeds.value[index] ?? 0) + step));
}

const points = computed(() => pathPoints(speeds.value));

// both diagrams: the origin at (22, 76), 10 units per second; speed 5.6 per m/s, distance 0.65 per m
const X0 = 22;
const Y0 = 76;
const px = (seconds: number) => X0 + seconds * 10;
const pv = (speed: number) => Y0 - speed * 5.6;
const ps = (metres: number) => Y0 - metres * 0.65;
const line = computed(() => points.value.map((p) => `${px(p.t)},${ps(p.s)}`).join(" "));
const timeTicks = Array.from({ length: DURATION / STRETCH + 1 }, (_, i) => i * STRETCH);
const speedTicks = Array.from({ length: TOP_SPEED / 2 + 1 }, (_, i) => i * 2);
const distanceTicks = Array.from({ length: TOP_DISTANCE / 20 + 1 }, (_, i) => i * 20);
const fromTo = (index: number) => ({ from: index * STRETCH, to: (index + 1) * STRETCH });
</script>

<template>
  <div class="gz-werkstatt">
    <p>
      <label>
        {{ chooseLabel }}
        <select v-model="chosen" @change="choose">
          <option v-for="fahrt in fahrten" :key="fahrt.id" :value="fahrt.id">{{ fahrt.name }}</option>
        </select>
      </label>
    </p>
    <div class="gz-controls">
      <div
        v-for="(v, index) in speeds"
        :key="index"
        class="gz-control"
        role="group"
        :aria-label="fillText(speedLabel, fromTo(index))"
      >
        <span>{{ fillText(speedLabel, fromTo(index)) }}</span>
        <div class="gz-buttons">
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
    <p class="gz-title">{{ speedTitle }}</p>
    <svg viewBox="0 0 130 90" role="img" :aria-label="speedAlt" class="gz-figure">
      <g v-for="tick in timeTicks" :key="`vt-${tick}`">
        <line :x1="px(tick)" :y1="pv(0)" :x2="px(tick)" :y2="pv(TOP_SPEED)" class="gz-grid" />
        <text :x="px(tick)" :y="Y0 + 6" text-anchor="middle" class="gz-tick-text">{{ tick }}</text>
      </g>
      <g v-for="tick in speedTicks" :key="`vv-${tick}`">
        <line :x1="px(0)" :y1="pv(tick)" :x2="px(DURATION)" :y2="pv(tick)" class="gz-grid" />
        <text :x="X0 - 2" :y="pv(tick) + 1" text-anchor="end" class="gz-tick-text">{{ tick }}</text>
      </g>
      <rect
        v-for="(v, index) in speeds"
        :key="`bar-${index}`"
        :x="px(index * STRETCH) + 0.5"
        :y="pv(v)"
        :width="STRETCH * 10 - 1"
        :height="v * 5.6"
        class="gz-bar"
      />
      <line :x1="px(0)" :y1="pv(0)" :x2="px(DURATION) + 3" :y2="pv(0)" class="gz-axis" />
      <line :x1="px(0)" :y1="pv(0)" :x2="px(0)" :y2="pv(TOP_SPEED) - 3" class="gz-axis" />
      <text :x="px(DURATION / 2)" :y="Y0 + 12" text-anchor="middle" class="gz-axis-text">{{ timeAxis }}</text>
      <text :x="X0 + 2" :y="5" class="gz-axis-text">{{ speedAxis }}</text>
    </svg>
    <p class="gz-title">{{ distanceTitle }}</p>
    <svg viewBox="0 0 130 90" role="img" :aria-label="distanceAlt" class="gz-figure">
      <g v-for="tick in timeTicks" :key="`st-${tick}`">
        <line :x1="px(tick)" :y1="ps(0)" :x2="px(tick)" :y2="ps(TOP_DISTANCE)" class="gz-grid" />
        <text :x="px(tick)" :y="Y0 + 6" text-anchor="middle" class="gz-tick-text">{{ tick }}</text>
      </g>
      <g v-for="tick in distanceTicks" :key="`ss-${tick}`">
        <line :x1="px(0)" :y1="ps(tick)" :x2="px(DURATION)" :y2="ps(tick)" class="gz-grid" />
        <text :x="X0 - 2" :y="ps(tick) + 1" text-anchor="end" class="gz-tick-text">{{ tick }}</text>
      </g>
      <line :x1="px(0)" :y1="ps(0)" :x2="px(DURATION) + 3" :y2="ps(0)" class="gz-axis" />
      <line :x1="px(0)" :y1="ps(0)" :x2="px(0)" :y2="ps(TOP_DISTANCE) - 3" class="gz-axis" />
      <text :x="px(DURATION / 2)" :y="Y0 + 12" text-anchor="middle" class="gz-axis-text">{{ timeAxis }}</text>
      <text :x="X0 + 2" :y="5" class="gz-axis-text">{{ distanceAxis }}</text>
      <polyline :points="line" class="gz-line" />
    </svg>
  </div>
</template>

<style scoped>
.gz-figure {
  display: block;
  width: 100%;
  max-width: 36rem;
  height: auto;
  border: 1px solid var(--page-border);
  background: var(--page-surface);
}

.gz-werkstatt select {
  min-height: 44px;
  margin-left: 0.5rem;
}

.gz-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.gz-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.gz-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gz-buttons output {
  min-width: 4.5rem;
  text-align: center;
}

.gz-buttons button {
  min-width: 44px;
  min-height: 44px;
}

.gz-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.gz-grid {
  stroke: var(--page-border);
  stroke-width: 0.2;
}

.gz-axis {
  stroke: var(--page-text);
  stroke-width: 0.5;
}

.gz-tick-text {
  fill: var(--page-muted);
  font-size: 3.4px;
}

.gz-axis-text {
  fill: var(--page-text);
  font-size: 4px;
}

.gz-bar {
  fill: #9ec1ee;
  stroke: #1a5fb4;
  stroke-width: 0.6;
}

.gz-line {
  fill: none;
  stroke: #1a5fb4;
  stroke-width: 1.2;
}

@media (prefers-color-scheme: dark) {
  .gz-bar {
    fill: #35527a;
    stroke: #8ab4f8;
  }

  .gz-line {
    stroke: #8ab4f8;
  }
}
</style>
