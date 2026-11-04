<script setup lang="ts">
// A rectangle of n equal parts with z coloured, shown twice side by side: "vorher" stays, "nachher" changes with the
// factor the learner chooses. erweitern: each part is cut into k smaller ones, so the numbers z and n grow by k.
// kuerzen: k parts are put together, so z and n are divided by k. The coloured area stays the same. Its logic is in
// BruchVerfeinern.ts. The start state is the factor 1: nothing has changed yet.
import { computed, ref } from "vue";
import { fill, nachher, options, vorher } from "./BruchVerfeinern.ts";

const props = defineProps<{
  /** erweitern or kuerzen. */
  modus: "erweitern" | "kuerzen";
  /** The numerator of the fraction. */
  z: number;
  /** The denominator of the fraction. */
  n: number;
  /** The label above the left picture, with {z} and {n}. */
  vorherLabel: string;
  /** The label above the right picture, with {z}, {n}, {k}, {zz} and {nn}. */
  nachherLabel: string;
  /** The label of the row of buttons. */
  faktorLabel: string;
  /** The name of a button, with {k}. */
  knopfLabel: string;
  /** The sentence under the pictures, with {z}, {n}, {k}, {zz} and {nn}. */
  rechnung: string;
  /** The description of a picture for screen readers, with {z} and {n} for what it shows. */
  bildLabel: string;
}>();

const k = ref(1);
const choices = computed(() => options(props.modus, props.z, props.n));
const before = computed(() => vorher(props.z, props.n));
const after = computed(() => nachher(props.modus, props.z, props.n, k.value));
const text = (template: string) => fill(template, props.z, props.n, k.value, after.value);
const label = (bild: { z: number; n: number }) =>
  props.bildLabel.replace(/\{z\}/g, String(bild.z)).replace(/\{n\}/g, String(bild.n));
const fields = (bild: { cols: number; rows: number; coloured: number }) =>
  Array.from({ length: bild.cols * bild.rows }, (_, i) => i % bild.cols < bild.coloured);
</script>

<template>
  <div class="bruch-verfeinern">
    <div class="bruch-verfeinern-row" role="group" :aria-label="faktorLabel">
      <span class="bruch-verfeinern-label">{{ faktorLabel }}</span>
      <button
        v-for="c in choices"
        :key="c"
        type="button"
        :aria-pressed="c === k"
        :aria-label="knopfLabel.replace(/\{k\}/g, String(c))"
        @click="k = c"
      >
        {{ c }}
      </button>
    </div>
    <div class="bruch-verfeinern-pictures">
      <figure>
        <figcaption>{{ text(vorherLabel) }}</figcaption>
        <div
          class="bruch-verfeinern-grid"
          role="img"
          :aria-label="label(before)"
          :style="{
            gridTemplateColumns: `repeat(${before.cols}, 1fr)`,
            gridTemplateRows: `repeat(${before.rows}, 1fr)`,
          }"
        >
          <span v-for="(on, i) in fields(before)" :key="i" :class="{ on }"></span>
        </div>
      </figure>
      <figure>
        <figcaption>{{ text(nachherLabel) }}</figcaption>
        <div
          class="bruch-verfeinern-grid"
          role="img"
          :aria-label="label(after)"
          :style="{
            gridTemplateColumns: `repeat(${after.cols}, 1fr)`,
            gridTemplateRows: `repeat(${after.rows}, 1fr)`,
          }"
        >
          <span v-for="(on, i) in fields(after)" :key="i" :class="{ on }"></span>
        </div>
      </figure>
    </div>
    <p aria-live="polite">{{ text(rechnung) }}</p>
  </div>
</template>

<style scoped>
.bruch-verfeinern-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.bruch-verfeinern-row button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 1px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
}

.bruch-verfeinern-row button[aria-pressed="true"] {
  background: var(--page-accent);
  color: var(--page-on-accent);
}

.bruch-verfeinern-pictures {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.bruch-verfeinern-pictures figure {
  flex: 1 1 12rem;
  max-width: 18rem;
  margin: 0;
}

.bruch-verfeinern-pictures figcaption {
  margin-bottom: 0.25rem;
  color: var(--page-muted);
}

.bruch-verfeinern-grid {
  display: grid;
  height: 5rem;
  border: 2px solid var(--page-text);
}

.bruch-verfeinern-grid span {
  border: 1px solid var(--page-text);
  background: var(--page-surface);
}

/* a coloured field: the colour and a stripe pattern, so the colour is not the only mark */
.bruch-verfeinern-grid span.on {
  background: repeating-linear-gradient(45deg, #2f5fb3 0 6px, #7ea0dc 6px 9px);
}
</style>
