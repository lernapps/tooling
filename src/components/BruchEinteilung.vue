<script setup lang="ts">
// A strip that is the whole. The learner chooses into how many equal parts it is divided (2 to 12) and taps parts to
// colour them; the count below says "z von n Teilen". Its logic is in BruchEinteilung.ts. The start is 4 parts and
// nothing coloured; a change of the number of parts keeps the whole (the strip) and clears the colour.
import { computed, ref } from "vue";
import { choices, count, empty, fill, START_PARTS, toggle } from "./BruchEinteilung.ts";

defineProps<{
  /** The label of the buttons that choose the number of parts. */
  partsLabel: string;
  /** The label of the strip's parts for screen readers, with {i} for the number of the part. */
  cell: string;
  /** The count below the strip, with {z} for the coloured parts and {n} for all parts. */
  counter: string;
}>();

const coloured = ref<boolean[]>(empty(START_PARTS));
const parts = computed(() => coloured.value.length);

function choose(n: number): void {
  coloured.value = empty(n);
}

function tap(index: number): void {
  coloured.value = toggle(coloured.value, index);
}
</script>

<template>
  <div class="bruch-einteilung">
    <p class="bruch-einteilung-label" id="bruch-einteilung-parts">{{ partsLabel }}</p>
    <div class="bruch-einteilung-choices" role="group" aria-labelledby="bruch-einteilung-parts">
      <button
        v-for="n in choices()"
        :key="n"
        type="button"
        :aria-pressed="n === parts"
        :class="{ 'bruch-einteilung-chosen': n === parts }"
        @click="choose(n)"
      >
        {{ n }}
      </button>
    </div>
    <div class="bruch-einteilung-strip">
      <button
        v-for="(on, index) in coloured"
        :key="`${parts}-${index}`"
        type="button"
        :aria-pressed="on"
        :aria-label="fill(cell, coloured, index + 1)"
        :class="{ 'bruch-einteilung-on': on }"
        @click="tap(index)"
      ></button>
    </div>
    <p aria-live="polite" class="bruch-einteilung-count">
      {{ fill(counter, coloured) }}
      <span v-if="count(coloured) > 0" class="bruch-einteilung-fraction" aria-hidden="true">
        <span class="bruch-einteilung-top">{{ count(coloured) }}</span>
        <span class="bruch-einteilung-bottom">{{ parts }}</span>
      </span>
    </p>
  </div>
</template>

<style scoped>
.bruch-einteilung-label {
  margin-bottom: 0.25rem;
}

.bruch-einteilung-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.bruch-einteilung-choices button {
  min-width: 44px;
  min-height: 44px;
  border: 2px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
  font: inherit;
}

.bruch-einteilung-choices button.bruch-einteilung-chosen {
  border-color: var(--page-accent);
  background: var(--page-accent);
  color: var(--page-on-accent);
  font-weight: bold;
}

.bruch-einteilung-strip {
  display: flex;
  width: 100%;
  max-width: 32rem;
  border: 2px solid var(--page-text);
}

.bruch-einteilung-strip button {
  flex: 1 1 0;
  min-width: 0;
  min-height: 3.5rem;
  padding: 0;
  border: 0;
  border-right: 2px solid var(--page-text);
  border-radius: 0;
  background: var(--page-background);
}

.bruch-einteilung-strip button:last-child {
  border-right: 0;
}

.bruch-einteilung-strip button.bruch-einteilung-on {
  background-color: var(--page-accent);
  background-image: repeating-linear-gradient(45deg, transparent 0 4px, var(--page-on-accent) 4px 6px);
}

.bruch-einteilung-strip button:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: -3px;
}

.bruch-einteilung-count {
  margin-top: 0.75rem;
}

.bruch-einteilung-fraction {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-left: 0.5rem;
  vertical-align: middle;
  font-weight: bold;
  line-height: 1.2;
}

.bruch-einteilung-top {
  padding: 0 0.4rem;
  border-bottom: 2px solid var(--page-text);
}
</style>
