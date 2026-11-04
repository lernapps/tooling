<script setup lang="ts">
// The Bewegungslabor: four sections of 5 s, a slider for the speed at the end of each, a box "backwards", and the
// distance-time and/or speed-time diagram of the ride. The scales stay put. The logic is in Bewegungslabor.ts.
import { computed, ref } from "vue";
import {
  MAX_SPEED,
  S_MAX,
  S_MIN,
  SECTION_SECONDS,
  SPEED_STEP,
  TOTAL_SECONDS,
  canGoBack,
  distancePoints,
  distances,
  fill,
  initial,
  kind,
  speedPoints,
  startSpeed,
  valuesText,
  type Section,
} from "./Bewegungslabor.ts";

const props = defineProps<{
  /** Which diagram shows: the distance-time diagram, the speed-time diagram or both. */
  show: "s" | "v" | "both";
  /** The title of a section's box, with {n}, {from} and {to}. */
  sectionTitle: string;
  /** The label of a slider, with {v} for the speed at the end. */
  endLabel: string;
  /** What happens to the speed in a section, with {v0} and {v1}. */
  faster: string;
  steady: string;
  slower: string;
  stopped: string;
  /** The label of the box that sends a section backwards. */
  backLabel: string;
  /** The label of the button that resets the ride. */
  resetLabel: string;
  /** The titles of the two diagrams. */
  sTitle: string;
  vTitle: string;
  /** The axis titles. */
  sAxis: string;
  vAxis: string;
  tAxis: string;
  /** The descriptions of the diagrams for screen readers, with {values}. */
  sAlt: string;
  vAlt: string;
}>();

const emit = defineEmits<{ change: [ends: number[]] }>();
const ride = ref<Section[]>(initial());
const announce = (): void =>
  emit(
    "change",
    ride.value.map((section) => section.end),
  );

const levels = Array.from({ length: MAX_SPEED / SPEED_STEP + 1 }, (_, i) => i * SPEED_STEP);

// the geometry of a diagram, in a viewBox of 420 x 300
const W = 420;
const H = 300;
const LEFT = 58;
const RIGHT = 404;
const TOP = 20;
const BOTTOM = 252;
const px = (t: number): number => LEFT + (t / TOTAL_SECONDS) * (RIGHT - LEFT);
const pys = (s: number): number => BOTTOM - ((s - S_MIN) / (S_MAX - S_MIN)) * (BOTTOM - TOP);
const pyv = (v: number): number => BOTTOM - (v / MAX_SPEED) * (BOTTOM - TOP);

const ticksT = [0, 5, 10, 15, 20];
const ticksS = [-400, -200, 0, 200, 400];
const ticksV = [0, 5, 10, 15, 20];

const sLine = computed(() =>
  distancePoints(ride.value)
    .map(([t, s]) => `${px(t).toFixed(1)},${pys(s).toFixed(1)}`)
    .join(" "),
);
const vLine = computed(() =>
  speedPoints(ride.value)
    .map(([t, v]) => `${px(t).toFixed(1)},${pyv(v).toFixed(1)}`)
    .join(" "),
);
const sCorners = computed(() => distances(ride.value).map((s, i) => [px(i * SECTION_SECONDS), pys(s)] as const));
const vCorners = computed(() => speedPoints(ride.value).map(([t, v]) => [px(t), pyv(v)] as const));

const sDescription = computed(() => fill(props.sAlt, { values: valuesText(distances(ride.value)) }));
const vDescription = computed(() =>
  fill(props.vAlt, { values: valuesText(speedPoints(ride.value).map(([, v]) => v)) }),
);

function describeSection(i: number): string {
  const text = { faster: props.faster, steady: props.steady, slower: props.slower, stopped: props.stopped }[
    kind(ride.value, i)
  ];
  return fill(text, { v0: startSpeed(ride.value, i), v1: ride.value[i]?.end ?? 0 });
}

function setEnd(i: number, event: Event): void {
  const section = ride.value[i];
  if (section) section.end = Number((event.target as HTMLInputElement).value);
  // a section without any speed cannot go backwards
  ride.value.forEach((s, index) => {
    if (s.back && !canGoBack(ride.value, index)) s.back = false;
  });
  announce();
}

function setBack(i: number, event: Event): void {
  const section = ride.value[i];
  if (section) section.back = (event.target as HTMLInputElement).checked;
}

function reset(): void {
  ride.value = initial();
  announce();
}
</script>

<template>
  <div class="bewegungslabor">
    <div class="labor-sections">
      <div v-for="(section, i) in ride" :key="i" class="labor-section">
        <p class="labor-section-title">
          {{ fill(sectionTitle, { n: i + 1, from: i * SECTION_SECONDS, to: (i + 1) * SECTION_SECONDS }) }}
        </p>
        <label class="labor-field">
          <span>{{ fill(endLabel, { v: section.end }) }}</span>
          <input
            type="range"
            :min="0"
            :max="MAX_SPEED"
            :step="SPEED_STEP"
            :value="section.end"
            :list="`labor-levels-${i}`"
            @input="setEnd(i, $event)"
          />
        </label>
        <datalist :id="`labor-levels-${i}`">
          <option v-for="level in levels" :key="level" :value="level"></option>
        </datalist>
        <p class="labor-kind" aria-live="polite">{{ describeSection(i) }}</p>
        <label class="labor-back">
          <input type="checkbox" :checked="section.back" :disabled="!canGoBack(ride, i)" @change="setBack(i, $event)" />
          <span>{{ backLabel }}</span>
        </label>
      </div>
    </div>
    <p>
      <button type="button" class="labor-reset" @click="reset">{{ resetLabel }}</button>
    </p>

    <div class="labor-diagrams">
      <figure v-if="show !== 'v'" class="labor-diagram">
        <figcaption class="labor-diagram-title">{{ sTitle }}</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="sDescription">
          <g class="labor-grid">
            <line v-for="t in ticksT" :key="`gt${t}`" :x1="px(t)" :y1="TOP" :x2="px(t)" :y2="BOTTOM" />
            <line v-for="s in ticksS" :key="`gs${s}`" :x1="LEFT" :y1="pys(s)" :x2="RIGHT" :y2="pys(s)" />
          </g>
          <line class="labor-zero" :x1="LEFT" :y1="pys(0)" :x2="RIGHT" :y2="pys(0)" />
          <line class="labor-axis" :x1="LEFT" :y1="TOP - 6" :x2="LEFT" :y2="BOTTOM" />
          <line class="labor-axis" :x1="LEFT" :y1="BOTTOM" :x2="RIGHT + 6" :y2="BOTTOM" />
          <text v-for="t in ticksT" :key="`lt${t}`" class="labor-tick" :x="px(t)" :y="BOTTOM + 16" text-anchor="middle">
            {{ t }}
          </text>
          <text v-for="s in ticksS" :key="`ls${s}`" class="labor-tick" :x="LEFT - 6" :y="pys(s) + 4" text-anchor="end">
            {{ s }}
          </text>
          <text class="labor-axis-title" :x="RIGHT" :y="H - 8" text-anchor="end">{{ tAxis }}</text>
          <text class="labor-axis-title" :x="4" :y="12">{{ sAxis }}</text>
          <polyline class="labor-line labor-line-s" :points="sLine" />
          <rect
            v-for="([x, y], i) in sCorners"
            :key="`cs${i}`"
            class="labor-corner labor-corner-s"
            :x="x - 4"
            :y="y - 4"
            width="8"
            height="8"
          />
        </svg>
      </figure>

      <figure v-if="show !== 's'" class="labor-diagram">
        <figcaption class="labor-diagram-title">{{ vTitle }}</figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="vDescription">
          <g class="labor-grid">
            <line v-for="t in ticksT" :key="`gt${t}`" :x1="px(t)" :y1="TOP" :x2="px(t)" :y2="BOTTOM" />
            <line v-for="v in ticksV" :key="`gv${v}`" :x1="LEFT" :y1="pyv(v)" :x2="RIGHT" :y2="pyv(v)" />
          </g>
          <line class="labor-axis" :x1="LEFT" :y1="TOP - 6" :x2="LEFT" :y2="BOTTOM" />
          <line class="labor-axis" :x1="LEFT" :y1="BOTTOM" :x2="RIGHT + 6" :y2="BOTTOM" />
          <text v-for="t in ticksT" :key="`lt${t}`" class="labor-tick" :x="px(t)" :y="BOTTOM + 16" text-anchor="middle">
            {{ t }}
          </text>
          <text v-for="v in ticksV" :key="`lv${v}`" class="labor-tick" :x="LEFT - 6" :y="pyv(v) + 4" text-anchor="end">
            {{ v }}
          </text>
          <text class="labor-axis-title" :x="RIGHT" :y="H - 8" text-anchor="end">{{ tAxis }}</text>
          <text class="labor-axis-title" :x="4" :y="12">{{ vAxis }}</text>
          <polyline class="labor-line labor-line-v" :points="vLine" />
          <circle
            v-for="([x, y], i) in vCorners"
            :key="`cv${i}`"
            class="labor-corner labor-corner-v"
            :cx="x"
            :cy="y"
            r="4.5"
          />
        </svg>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.bewegungslabor {
  --labor-s: #1b6e3a;
  --labor-v: #1f5fbf;
}

@media (prefers-color-scheme: dark) {
  .bewegungslabor {
    --labor-s: #6fd391;
    --labor-v: #8bb8ff;
  }
}

.labor-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.labor-section {
  flex: 1 1 9.5rem;
  min-width: 9.5rem;
  padding: 0.5rem;
  border: 1px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
}

.labor-section-title {
  margin: 0 0 0.25rem;
  font-weight: bold;
}

.labor-field {
  display: block;
}

.labor-field span {
  display: block;
  margin-bottom: 0.25rem;
}

.labor-field input[type="range"] {
  width: 100%;
  min-height: 2.75rem;
  accent-color: var(--page-accent);
}

.labor-kind {
  margin: 0.25rem 0;
  color: var(--page-muted);
}

.labor-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
}

.labor-back input {
  width: 1.5rem;
  height: 1.5rem;
}

.labor-reset {
  min-height: 2.75rem;
  padding: 0 1rem;
  border: 1px solid var(--page-accent);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
}

.labor-diagrams {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.labor-diagram {
  flex: 1 1 18rem;
  margin: 0;
}

.labor-diagram svg {
  width: 100%;
  height: auto;
}

.labor-diagram-title {
  font-weight: bold;
}

.labor-grid line {
  stroke: var(--page-border);
  stroke-width: 1;
}

.labor-zero {
  stroke: var(--page-muted);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}

.labor-axis {
  stroke: var(--page-text);
  stroke-width: 2;
}

.labor-tick,
.labor-axis-title {
  fill: var(--page-text);
  font-size: 12px;
}

.labor-axis-title {
  font-weight: bold;
}

.labor-line {
  fill: none;
  stroke-width: 3.5;
  stroke-linejoin: round;
}

.labor-line-s {
  stroke: var(--labor-s);
}

.labor-line-v {
  stroke: var(--labor-v);
  stroke-dasharray: 9 4;
}

.labor-corner-s {
  fill: var(--labor-s);
}

.labor-corner-v {
  fill: var(--labor-v);
}
</style>
