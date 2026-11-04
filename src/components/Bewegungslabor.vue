<script setup lang="ts">
// A ride of 30 s in three sections of 10 s. The learner sets one speed per section with a slider and sees the
// way-time diagram, the speed-time diagram or both change. The time axis and the scales stay put.
// Its logic is in Bewegungslabor.ts.
import { computed, ref } from "vue";
import {
  MAX_SPEED,
  MAX_WAY,
  SECTIONS,
  SECTION_SECONDS,
  TOTAL_SECONDS,
  fill,
  normalise,
  speedPoints,
  wayPoints,
  type Point,
} from "./Bewegungslabor.ts";

const props = defineProps<{
  /** Which diagrams show: the way-time diagram, the speed-time diagram or both side by side. */
  view: "st" | "vt" | "both";
  /** The three speeds the sliders start with, in m/s. */
  start: number[];
  /** The label of a slider, with {n} for the section. */
  sliderLabel: string;
  /** The title of the way-time diagram. */
  stTitle: string;
  /** The title of the speed-time diagram. */
  vtTitle: string;
  /** The name of the time axis, with its unit. */
  timeAxis: string;
  /** The name of the way axis, with its unit. */
  wayAxis: string;
  /** The name of the speed axis, with its unit. */
  speedAxis: string;
  /** What the way-time diagram shows now, with {s1} to {s3} (the way after 10, 20 and 30 s). */
  stAlt: string;
  /** What the speed-time diagram shows now, with {v1} to {v3}. */
  vtAlt: string;
  /** The unit of a speed, shown after the value of a slider. */
  unit: string;
  /** The sentence under the sliders, with {s1} to {s3} and {v1} to {v3}. */
  readout: string;
}>();

const speeds = ref<number[]>(normalise(props.start));

// the plot area of one diagram, in the units of its viewBox
const LEFT = 46;
const RIGHT = 286;
const TOP = 16;
const BOTTOM = 156;
const x = (t: number) => LEFT + ((RIGHT - LEFT) * t) / TOTAL_SECONDS;
const yWay = (value: number) => BOTTOM - ((BOTTOM - TOP) * value) / MAX_WAY;
const ySpeed = (value: number) => BOTTOM - ((BOTTOM - TOP) * value) / MAX_SPEED;

const line = (points: Point[], y: (value: number) => number) => points.map((p) => `${x(p.t)},${y(p.value)}`).join(" ");

const stLine = computed(() => line(wayPoints(speeds.value), yWay));
const vtLine = computed(() => line(speedPoints(speeds.value), ySpeed));
const stDots = computed(() => wayPoints(speeds.value).map((p) => ({ cx: x(p.t), cy: yWay(p.value) })));
const vtDots = computed(() =>
  speedPoints(speeds.value)
    .filter((_, i) => i % 2 === 0)
    .map((p) => ({ cx: x(p.t), cy: ySpeed(p.value) })),
);

const timeTicks = Array.from({ length: SECTIONS + 1 }, (_, i) => i * SECTION_SECONDS);
const wayTicks = [0, 100, 200, 300];
const speedTicks = [0, 5, 10];

const showSt = computed(() => props.view !== "vt");
const showVt = computed(() => props.view !== "st");
const stText = computed(() => fill(props.stAlt, speeds.value));
const vtText = computed(() => fill(props.vtAlt, speeds.value));
const readoutText = computed(() => fill(props.readout, speeds.value));

function set(index: number, event: Event): void {
  const next = [...speeds.value];
  next[index] = Number((event.target as HTMLInputElement).value);
  speeds.value = normalise(next);
}
</script>

<template>
  <div class="bewegungslabor">
    <div class="bewegungslabor-diagrams">
      <figure v-if="showSt" class="bewegungslabor-figure">
        <p class="bewegungslabor-title">{{ stTitle }}</p>
        <svg viewBox="0 0 300 190" role="img" :aria-label="stText" class="bewegungslabor-svg st">
          <line :x1="LEFT" :y1="BOTTOM" :x2="RIGHT" :y2="BOTTOM" class="axis" />
          <line :x1="LEFT" :y1="TOP" :x2="LEFT" :y2="BOTTOM" class="axis" />
          <g v-for="tick in timeTicks" :key="`t${tick}`">
            <line :x1="x(tick)" :y1="TOP" :x2="x(tick)" :y2="BOTTOM" class="grid" />
            <text :x="x(tick)" :y="BOTTOM + 13" text-anchor="middle">{{ tick }}</text>
          </g>
          <g v-for="tick in wayTicks" :key="`w${tick}`">
            <line :x1="LEFT" :y1="yWay(tick)" :x2="RIGHT" :y2="yWay(tick)" class="grid" />
            <text :x="LEFT - 5" :y="yWay(tick) + 4" text-anchor="end">{{ tick }}</text>
          </g>
          <text :x="(LEFT + RIGHT) / 2" :y="BOTTOM + 30" text-anchor="middle">{{ timeAxis }}</text>
          <text :x="LEFT" :y="TOP - 5" text-anchor="start">{{ wayAxis }}</text>
          <polyline :points="stLine" class="line st-line" />
          <circle v-for="(dot, i) in stDots" :key="i" :cx="dot.cx" :cy="dot.cy" r="3.5" class="dot st-dot" />
        </svg>
      </figure>
      <figure v-if="showVt" class="bewegungslabor-figure">
        <p class="bewegungslabor-title">{{ vtTitle }}</p>
        <svg viewBox="0 0 300 190" role="img" :aria-label="vtText" class="bewegungslabor-svg vt">
          <line :x1="LEFT" :y1="BOTTOM" :x2="RIGHT" :y2="BOTTOM" class="axis" />
          <line :x1="LEFT" :y1="TOP" :x2="LEFT" :y2="BOTTOM" class="axis" />
          <g v-for="tick in timeTicks" :key="`t${tick}`">
            <line :x1="x(tick)" :y1="TOP" :x2="x(tick)" :y2="BOTTOM" class="grid" />
            <text :x="x(tick)" :y="BOTTOM + 13" text-anchor="middle">{{ tick }}</text>
          </g>
          <g v-for="tick in speedTicks" :key="`v${tick}`">
            <line :x1="LEFT" :y1="ySpeed(tick)" :x2="RIGHT" :y2="ySpeed(tick)" class="grid" />
            <text :x="LEFT - 5" :y="ySpeed(tick) + 4" text-anchor="end">{{ tick }}</text>
          </g>
          <text :x="(LEFT + RIGHT) / 2" :y="BOTTOM + 30" text-anchor="middle">{{ timeAxis }}</text>
          <text :x="LEFT" :y="TOP - 5" text-anchor="start">{{ speedAxis }}</text>
          <polyline :points="vtLine" class="line vt-line" />
          <rect
            v-for="(dot, i) in vtDots"
            :key="i"
            :x="dot.cx - 3.5"
            :y="dot.cy - 3.5"
            width="7"
            height="7"
            class="dot vt-dot"
          />
        </svg>
      </figure>
    </div>

    <div class="bewegungslabor-controls">
      <label v-for="(speed, i) in speeds" :key="i" class="bewegungslabor-slider">
        <span>{{ fill(sliderLabel, speeds, i + 1) }}</span>
        <input type="range" min="0" :max="MAX_SPEED" step="1" :value="speed" @input="set(i, $event)" />
        <output>{{ speed }} {{ unit }}</output>
      </label>
    </div>
    <p class="bewegungslabor-readout" aria-live="polite">{{ readoutText }}</p>
  </div>
</template>

<style scoped>
.bewegungslabor {
  --lab-way: #1b5cb8;
  --lab-speed: #a64b00;
}

@media (prefers-color-scheme: dark) {
  .bewegungslabor {
    --lab-way: #7db4ff;
    --lab-speed: #ffb066;
  }
}

.bewegungslabor-diagrams {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.bewegungslabor-figure {
  flex: 1 1 18rem;
  min-width: 0;
  margin: 0;
}

.bewegungslabor-title {
  margin: 0 0 0.25rem;
  font-weight: bold;
}

.bewegungslabor-svg {
  width: 100%;
  height: auto;
  color: var(--page-text);
}

.bewegungslabor-svg text {
  fill: currentcolor;
  font-size: 11px;
}

.axis {
  stroke: var(--page-text);
  stroke-width: 1.5;
}

.grid {
  stroke: var(--page-border);
  stroke-width: 0.75;
}

.line {
  fill: none;
  stroke-width: 3;
  stroke-linejoin: round;
}

.st-line,
.st-dot {
  stroke: var(--lab-way);
}

.st-dot {
  fill: var(--page-background);
  stroke-width: 2.5;
}

.vt-line,
.vt-dot {
  stroke: var(--lab-speed);
}

.vt-dot {
  fill: var(--lab-speed);
}

.bewegungslabor-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.bewegungslabor-slider {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
}

.bewegungslabor-slider span {
  flex: 1 1 12rem;
}

.bewegungslabor-slider input {
  flex: 1 1 8rem;
  min-height: 44px;
  accent-color: var(--page-accent);
}

.bewegungslabor-slider output {
  min-width: 4.5rem;
  text-align: right;
}

.bewegungslabor-readout {
  margin: 0.5rem 0 0;
}
</style>
