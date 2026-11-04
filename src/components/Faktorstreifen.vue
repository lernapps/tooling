<script setup lang="ts">
// Two strips of the same length, one above the other. Above: the fraction z/n. Below: the same fraction, expanded or
// reduced by the number the learner chooses with the buttons. The whole and the coloured length stay the same; only
// the number of parts changes. Its logic is in Faktorstreifen.ts. It checks nothing: the exercises of the page do.
import { computed, ref } from "vue";
import { apply, factors, fill } from "./Faktorstreifen.ts";

const props = defineProps<{
  /** The numerator of the fraction above. */
  z: number;
  /** The denominator of the fraction above. */
  n: number;
  /** Whether the strip below has more parts (erweitern) or fewer (kuerzen). */
  direction: "erweitern" | "kuerzen";
  /** The label of the strip above, with {z} and {n}. */
  before: string;
  /** The label of the strip below, with {z}, {n} (the fraction below) and {f} (the chosen number). */
  after: string;
  /** The label above the buttons. */
  choose: string;
  /** The name of a button for screen readers, with {f}. */
  button: string;
}>();

const top = computed(() => ({ z: props.z, n: props.n }));
const options = computed(() => factors(top.value, props.direction));
const chosen = ref(1);
const bottom = computed(() => apply(top.value, props.direction, chosen.value));
</script>

<template>
  <div class="faktorstreifen">
    <p class="faktorstreifen-label">{{ fill(before, top) }}</p>
    <div class="faktorstreifen-strip" aria-hidden="true">
      <span v-for="i in top.n" :key="i" :class="{ on: i <= top.z }"></span>
    </div>
    <p class="faktorstreifen-label" aria-live="polite">{{ fill(after, bottom, chosen) }}</p>
    <div class="faktorstreifen-strip" aria-hidden="true">
      <span v-for="i in bottom.n" :key="i" :class="{ on: i <= bottom.z }"></span>
    </div>
    <p class="faktorstreifen-label">{{ choose }}</p>
    <div class="faktorstreifen-buttons">
      <button
        v-for="f in options"
        :key="f"
        type="button"
        :aria-pressed="f === chosen"
        :aria-label="fill(button, bottom, f)"
        @click="chosen = f"
      >
        {{ f }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.faktorstreifen-label {
  margin: 0.75rem 0 0.25rem;
}

.faktorstreifen-strip {
  display: flex;
  max-width: 24rem;
  height: 2.75rem;
  gap: 1px;
}

.faktorstreifen-strip span {
  flex: 1 1 0;
  min-width: 0;
  border: 1px solid var(--page-text);
  background: var(--page-background);
}

/* a coloured part has a second mark besides the colour: stripes */
.faktorstreifen-strip span.on {
  background-color: #2b6cb0;
  background-image: repeating-linear-gradient(45deg, transparent 0 6px, rgb(255 255 255 / 45%) 6px 9px);
}

.faktorstreifen-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.faktorstreifen-buttons button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 2px solid var(--page-border);
  background: var(--page-surface);
  color: var(--page-text);
}

.faktorstreifen-buttons button[aria-pressed="true"] {
  border-color: var(--page-accent);
  background: var(--page-accent);
  color: var(--page-on-accent);
}
</style>
