<script setup lang="ts">
// A strip as the whole, divided in equal pieces. The learner sets the number of pieces (the denominator) and colours
// pieces by tapping (the numerator); the fraction below follows. Its logic is in BruchStreifen.ts. It checks nothing.
import { computed, ref } from "vue";
import { MAX_PARTS, MIN_PARTS, count, fill, resize, toggle } from "./BruchStreifen.ts";

const props = defineProps<{
  /** The number of pieces at the start. */
  start: number;
  /** The sentence about the strip, with {z} for the coloured and {n} for all pieces. */
  summary: string;
  /** The label of the button for fewer pieces. */
  fewer: string;
  /** The label of the button for more pieces. */
  more: string;
  /** The name of a piece for screen readers, with {n} for its number. */
  cell: string;
}>();

const pieces = ref<boolean[]>(resize([], props.start));
const numerator = computed(() => count(pieces.value));
const denominator = computed(() => pieces.value.length);

function setParts(n: number): void {
  pieces.value = resize(pieces.value, n);
}
function flip(index: number): void {
  pieces.value = toggle(pieces.value, index);
}
</script>

<template>
  <div class="bruch-streifen">
    <div class="bruch-streifen-controls">
      <button type="button" :disabled="denominator <= MIN_PARTS" @click="setParts(denominator - 1)">{{ fewer }}</button>
      <button type="button" :disabled="denominator >= MAX_PARTS" @click="setParts(denominator + 1)">{{ more }}</button>
    </div>
    <div class="bruch-streifen-strip">
      <button
        v-for="(on, index) in pieces"
        :key="index"
        type="button"
        :aria-pressed="on"
        :aria-label="cell.replace('{n}', String(index + 1))"
        @click="flip(index)"
      ></button>
    </div>
    <p aria-live="polite">{{ fill(summary, pieces) }}</p>
    <p class="bruch-streifen-fraction" aria-hidden="true">
      <span class="bruch-streifen-num">{{ numerator }}</span>
      <span class="bruch-streifen-den">{{ denominator }}</span>
    </p>
  </div>
</template>

<style scoped>
.bruch-streifen-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.bruch-streifen-controls button {
  min-height: 2.75rem;
  padding: 0 1rem;
}

.bruch-streifen-strip {
  display: flex;
  max-width: 30rem;
  border: 2px solid var(--page-text);
}

.bruch-streifen-strip button {
  flex: 1 1 0;
  min-width: 1.75rem;
  min-height: 2.75rem;
  padding: 0;
  border: 0;
  border-right: 1px solid var(--page-text);
  border-radius: 0;
  background: var(--page-surface);
}

.bruch-streifen-strip button:last-child {
  border-right: 0;
}

/* a coloured piece: blue and, as a second mark besides the colour, a diagonal hatching */
.bruch-streifen-strip button[aria-pressed="true"] {
  background: repeating-linear-gradient(45deg, #2f5fb3 0 6px, #7f9fd6 6px 9px);
}

.bruch-streifen-fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  line-height: 1.2;
}

.bruch-streifen-num {
  padding: 0 0.5rem;
  border-bottom: 2px solid var(--page-text);
}
</style>
