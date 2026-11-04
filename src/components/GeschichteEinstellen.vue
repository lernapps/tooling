<script setup lang="ts">
// A story about a ride of 30 s in three sections. The learner chooses for each section whether the speed becomes
// greater, stays the same or becomes smaller; the speed-time diagram follows the choice. Its logic is in
// GeschichteEinstellen.ts. It is the input of the task: it emits the three choices once all are made, and the explainer
// draws "Prüfen", checks the answer and gives the message of the mistake.
import { computed, ref } from "vue";
import { MAX_SPEED, SECTION_SECONDS, SECTIONS, TOTAL_SECONDS, normalise, speedPoints } from "./Bewegungslabor.ts";
import { fill, generate, speedsFor } from "./GeschichteEinstellen.ts";

type StoryProp = { text: string; v0: number; c1: string; c2: string; c3: string };

const props = defineProps<{
  /** The introduction of the task, above the story. */
  task: string;
  /** The stories, from a data file. */
  stories: StoryProp[];
  /** The name of a section, with {n} for its number. */
  sectionLabel: string;
  /** The prompt of a choice not made yet. */
  choose: string;
  /** The choice for a greater speed. */
  more: string;
  /** The choice for the same speed. */
  same: string;
  /** The choice for a smaller speed. */
  less: string;
  /** The title of the diagram. */
  diagramTitle: string;
  /** The name of the time axis, with its unit. */
  timeAxis: string;
  /** The name of the speed axis, with its unit. */
  speedAxis: string;
  /** What the diagram shows now, with {v1} to {v3}. */
  alt: string;
  /** The app's message for each kind of mistake, in the order of about.mistakes, with {n} for the section. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the choices give now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [string[] | undefined] }>();

const current = computed(() => generate(props.seed, props));
const choices = ref<string[]>(Array.from({ length: SECTIONS }, () => ""));

const speeds = computed(() => normalise(speedsFor(current.value.story.v0, choices.value)));
const line = computed(() =>
  speedPoints(speeds.value)
    .map((p) => `${x(p.t)},${y(p.value)}`)
    .join(" "),
);
const altText = computed(() =>
  props.alt
    .replace(/\{v1\}/g, String(speeds.value[0]))
    .replace(/\{v2\}/g, String(speeds.value[1]))
    .replace(/\{v3\}/g, String(speeds.value[2])),
);

// the plot area, in the units of the viewBox
const LEFT = 46;
const RIGHT = 286;
const TOP = 16;
const BOTTOM = 156;
const x = (t: number) => LEFT + ((RIGHT - LEFT) * t) / TOTAL_SECONDS;
const y = (value: number) => BOTTOM - ((BOTTOM - TOP) * value) / MAX_SPEED;
const timeTicks = Array.from({ length: SECTIONS + 1 }, (_, i) => i * SECTION_SECONDS);
const speedTicks = [0, 5, 10];

function choose(index: number, event: Event): void {
  const next = [...choices.value];
  next[index] = (event.target as HTMLSelectElement).value;
  choices.value = next;
  emit("answer", next.every((value) => value !== "") ? next : undefined);
}
</script>

<template>
  <div class="geschichte">
    <p>{{ task }}</p>
    <p class="geschichte-story">{{ current.story.text }}</p>
    <figure class="geschichte-figure">
      <p class="geschichte-title">{{ diagramTitle }}</p>
      <svg viewBox="0 0 300 190" role="img" :aria-label="altText" class="geschichte-svg">
        <line :x1="LEFT" :y1="BOTTOM" :x2="RIGHT" :y2="BOTTOM" class="axis" />
        <line :x1="LEFT" :y1="TOP" :x2="LEFT" :y2="BOTTOM" class="axis" />
        <g v-for="tick in timeTicks" :key="`t${tick}`">
          <line :x1="x(tick)" :y1="TOP" :x2="x(tick)" :y2="BOTTOM" class="grid" />
          <text :x="x(tick)" :y="BOTTOM + 13" text-anchor="middle">{{ tick }}</text>
        </g>
        <g v-for="tick in speedTicks" :key="`v${tick}`">
          <line :x1="LEFT" :y1="y(tick)" :x2="RIGHT" :y2="y(tick)" class="grid" />
          <text :x="LEFT - 5" :y="y(tick) + 4" text-anchor="end">{{ tick }}</text>
        </g>
        <text :x="(LEFT + RIGHT) / 2" :y="BOTTOM + 30" text-anchor="middle">{{ timeAxis }}</text>
        <text :x="LEFT" :y="TOP - 5" text-anchor="start">{{ speedAxis }}</text>
        <polyline :points="line" class="line" />
      </svg>
    </figure>
    <div class="geschichte-controls">
      <label v-for="n in SECTIONS" :key="n" class="geschichte-choice">
        <span>{{ fill(sectionLabel, n) }}</span>
        <select :value="choices[n - 1]" @change="choose(n - 1, $event)">
          <option value="" disabled>{{ props.choose }}</option>
          <option value="mehr">{{ more }}</option>
          <option value="gleich">{{ same }}</option>
          <option value="weniger">{{ less }}</option>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.geschichte {
  --lab-speed: #a64b00;
}

@media (prefers-color-scheme: dark) {
  .geschichte {
    --lab-speed: #ffb066;
  }
}

.geschichte-story {
  font-style: italic;
}

.geschichte-figure {
  margin: 0;
  max-width: 28rem;
}

.geschichte-title {
  margin: 0 0 0.25rem;
  font-weight: bold;
}

.geschichte-svg {
  width: 100%;
  height: auto;
  color: var(--page-text);
}

.geschichte-svg text {
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
  stroke: var(--lab-speed);
  stroke-width: 3;
  stroke-linejoin: round;
}

.geschichte-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 0.75rem;
}

.geschichte-choice {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.geschichte-choice select {
  min-height: 44px;
  min-width: 11rem;
}
</style>
