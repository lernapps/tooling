<script setup lang="ts">
// Strips of the same size that show the same part of the whole in a finer division (erweitern), a coarser one
// (kürzen), or two fractions in the same division (vergleichen). Its logic is in BruchUmteilen.ts. It checks nothing.
import { computed, ref } from "vue";
import { after, common, fill, usable, type Strip } from "./BruchUmteilen.ts";

const props = defineProps<{
  /** erweitern, kuerzen or vergleichen. */
  mode: "erweitern" | "kuerzen" | "vergleichen";
  /** The first fraction: a/b. */
  a: number;
  b: number;
  /** The second fraction c/d, only for vergleichen. */
  c?: number;
  d?: number;
  /** The factors of the buttons, for erweitern and kuerzen. */
  factors?: number[];
  /** The label of a factor button, with {k}. */
  button: string;
  /** The label of the button back to the start. */
  reset: string;
  /** The sentence at the start, with {a}, {b} (and {c}, {d}). */
  startText: string;
  /** The sentence after a step, with {a}, {b}, {a2}, {b2}, {k} (and {c}, {d}, {c2}, {n}). */
  stepText: string;
  /** The names of the strips for screen readers and the labels above them, with {a} and {b}. */
  stripLabel: string;
}>();

const step = ref(0);

const first = computed<Strip>(() => ({ a: props.a, b: props.b }));
const second = computed<Strip>(() => ({ a: props.c ?? 0, b: props.d ?? 1 }));

const strips = computed<Strip[]>(() => {
  if (props.mode === "vergleichen") {
    return step.value === 0 ? [first.value, second.value] : common(first.value, second.value);
  }
  return step.value === 0 ? [first.value] : [first.value, after(props.mode, first.value, step.value)];
});

const values = computed<Record<string, number>>(() => {
  const [one, two] = strips.value;
  if (props.mode === "vergleichen") {
    return {
      a: props.a,
      b: props.b,
      c: props.c ?? 0,
      d: props.d ?? 1,
      a2: one?.a ?? 0,
      c2: two?.a ?? 0,
      n: one?.b ?? 0,
    };
  }
  return { a: props.a, b: props.b, a2: two?.a ?? 0, b2: two?.b ?? 0, k: step.value };
});

const text = computed(() => fill(step.value === 0 ? props.startText : props.stepText, values.value));
const factors = computed(() => (props.mode === "vergleichen" ? [] : (props.factors ?? [])));
const label = (strip: Strip) => fill(props.stripLabel, { a: strip.a, b: strip.b });
</script>

<template>
  <div class="bruch-umteilen">
    <div class="bruch-umteilen-controls">
      <template v-if="mode === 'vergleichen'">
        <button type="button" :disabled="step === 1" @click="step = 1">{{ fill(button, { k: 1 }) }}</button>
      </template>
      <template v-else>
        <button
          v-for="k in factors"
          :key="k"
          type="button"
          :disabled="!usable(mode, a, b, k)"
          :aria-pressed="step === k"
          @click="step = k"
        >
          {{ fill(button, { k }) }}
        </button>
      </template>
      <button type="button" :disabled="step === 0" @click="step = 0">{{ reset }}</button>
    </div>
    <div v-for="(strip, i) in strips" :key="`${step}-${i}`" class="bruch-umteilen-row">
      <p class="bruch-umteilen-label">{{ label(strip) }}</p>
      <div class="bruch-umteilen-strip" role="img" :aria-label="label(strip)">
        <span v-for="n in strip.b" :key="n" :class="{ on: n <= strip.a }"></span>
      </div>
    </div>
    <p aria-live="polite">{{ text }}</p>
  </div>
</template>

<style scoped>
.bruch-umteilen-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.bruch-umteilen-controls button {
  min-height: 2.75rem;
  padding: 0 1rem;
}

.bruch-umteilen-controls button[aria-pressed="true"] {
  background: var(--page-accent);
  color: var(--page-on-accent);
}

.bruch-umteilen-label {
  margin: 0.5rem 0 0.25rem;
}

.bruch-umteilen-strip {
  display: flex;
  max-width: 30rem;
  height: 2.75rem;
  border: 2px solid var(--page-text);
}

.bruch-umteilen-strip span {
  flex: 1 1 0;
  border-right: 1px solid var(--page-text);
  background: var(--page-surface);
}

.bruch-umteilen-strip span:last-child {
  border-right: 0;
}

/* a coloured piece: blue and, as a second mark besides the colour, a diagonal hatching */
.bruch-umteilen-strip span.on {
  background: repeating-linear-gradient(45deg, #2f5fb3 0 6px, #7f9fd6 6px 9px);
}
</style>
