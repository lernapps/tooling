<script setup lang="ts">
// Two strips of the same length, one above the other: the fraction a/b given, and the same amount with every part
// divided finer (expanding with k) or put together coarser (reducing by k). The learner changes k with two buttons;
// numerator and denominator change by the same factor, the coloured length stays. Its logic is in BruchErweitern.ts.
import { computed, ref } from "vue";
import { apply, fill, steps } from "./BruchErweitern.ts";

const props = defineProps<{
  /** The numerator of the given fraction. */
  a: number;
  /** The denominator of the given fraction. */
  b: number;
  /** Expanding or reducing. */
  mode: "erweitern" | "kuerzen";
  /** The largest factor when expanding. */
  max?: number;
  /** The label above the given strip, with {a} and {b}. */
  before: string;
  /** The label above the changed strip, with {a}, {b}, {k}, {z} and {n}. */
  after: string;
  /** The name of the number the learner changes: "Faktor" or "Teiler". */
  control: string;
  /** The sentence for the numerator, with {a}, {k} and {z}. */
  numerator: string;
  /** The sentence for the denominator, with {b}, {k} and {n}. */
  denominator: string;
  /** The result, with {a}, {b}, {z} and {n}. */
  result: string;
  /** The name of the button that makes k larger. */
  larger: string;
  /** The name of the button that makes k smaller. */
  smaller: string;
}>();

const options = computed(() => steps(props.a, props.b, props.mode, props.max));
const position = ref(0);
const k = computed(() => options.value[position.value] ?? 1);
const now = computed(() => apply(props.a, props.b, k.value, props.mode));
const text = (t: string) => fill(t, props.a, props.b, k.value, props.mode);

const W = 320;
const H = 36;
// the cells of a strip: x, width, whether coloured
function cells(parts: number, coloured: number): { x: number; w: number; on: boolean }[] {
  return Array.from({ length: parts }, (_, i) => ({ x: (i * W) / parts, w: W / parts, on: i < coloured }));
}
const upper = computed(() => cells(props.b, props.a));
const lower = computed(() => cells(now.value.n, now.value.z));

function move(delta: number): void {
  position.value = Math.min(options.value.length - 1, Math.max(0, position.value + delta));
}
</script>

<template>
  <div class="bruch-erweitern">
    <p class="bruch-erweitern-label">{{ text(before) }}</p>
    <svg :viewBox="`0 0 ${W + 4} ${H + 4}`" aria-hidden="true" class="bruch-erweitern-strip">
      <g transform="translate(2 2)">
        <template v-for="(c, i) in upper" :key="i">
          <rect :x="c.x" y="0" :width="c.w" :height="H" class="cell" :class="{ on: c.on }" />
          <line v-if="c.on" :x1="c.x" :y1="H" :x2="c.x + c.w" y2="0" class="mark" />
        </template>
      </g>
    </svg>
    <p class="bruch-erweitern-label">{{ text(after) }}</p>
    <svg :viewBox="`0 0 ${W + 4} ${H + 4}`" aria-hidden="true" class="bruch-erweitern-strip">
      <g transform="translate(2 2)">
        <template v-for="(c, i) in lower" :key="i">
          <rect :x="c.x" y="0" :width="c.w" :height="H" class="cell" :class="{ on: c.on }" />
          <line v-if="c.on" :x1="c.x" :y1="H" :x2="c.x + c.w" y2="0" class="mark" />
        </template>
      </g>
    </svg>
    <div class="bruch-erweitern-controls">
      <button type="button" :aria-disabled="position === 0" :aria-label="smaller" @click="move(-1)">−</button>
      <span class="bruch-erweitern-k" aria-live="polite">{{ control }}: {{ k }}</span>
      <button type="button" :aria-disabled="position >= options.length - 1" :aria-label="larger" @click="move(1)">
        +
      </button>
    </div>
    <p aria-live="polite" class="bruch-erweitern-text">
      {{ text(numerator) }}<br />
      {{ text(denominator) }}<br />
      <strong>{{ text(result) }}</strong>
    </p>
  </div>
</template>

<style scoped>
.bruch-erweitern-label {
  margin: 0.75rem 0 0.25rem;
}

.bruch-erweitern-strip {
  display: block;
  width: 100%;
  max-width: 24rem;
}

.cell {
  fill: var(--page-surface);
  stroke: var(--page-text);
  stroke-width: 1.5;
}

.cell.on {
  fill: var(--page-accent);
}

/* a diagonal line in every coloured part: the second mark besides the colour */
.mark {
  stroke: var(--page-on-accent);
  stroke-width: 1.5;
}

.bruch-erweitern-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0;
}

.bruch-erweitern-controls button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  font-size: 1.25rem;
}

.bruch-erweitern-controls button[aria-disabled="true"] {
  opacity: 0.5;
}

.bruch-erweitern-k {
  min-width: 7rem;
  text-align: center;
}
</style>
