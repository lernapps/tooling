<script setup lang="ts">
// Two strips under each other: the given one of n equal fields, z coloured, and the same strip cut finer (erweitern)
// or put together coarser (kuerzen) by the factor k that the learner chooses. It starts with k = 1: both strips are the
// same. The coloured part of the whole stays the same; the numbers under the strips change. Its logic is in
// StreifenTeilen.ts. It is a model, no exercise: it asks nothing and checks nothing.
import { computed, ref } from "vue";
import { faktoren, ergebnis, fill } from "./StreifenTeilen.ts";

const props = defineProps<{
  /** The number of fields of the given strip. */
  n: number;
  /** The number of coloured fields of the given strip. */
  z: number;
  /** "erweitern": cut every field into k parts. "kuerzen": put k fields together. */
  richtung: "erweitern" | "kuerzen";
  /** The label above the given strip, with {z} and {n}. */
  vorher: string;
  /** The label above the changed strip, with {z2}, {n2} and {k}. */
  nachher: string;
  /** The question above the choice of the factor k, e.g. "Jedes Feld teilen in … Teile". */
  frage: string;
  /** The sentence under the strips, with {z}, {n}, {z2}, {n2} and {k}. */
  satz: string;
  /** The name of a field for screen readers. */
  feld: string;
}>();

const k = ref(1);
const optionen = computed(() => faktoren(props.n, props.z, props.richtung));
const neu = computed(() => ergebnis(props.n, props.z, k.value, props.richtung));
const text = (t: string) => fill(t, props.n, props.z, k.value, props.richtung);
</script>

<template>
  <div class="streifen-teilen">
    <p class="streifen-teilen-label">{{ text(vorher) }}</p>
    <div class="streifen-teilen-row" role="img" :aria-label="`${feld}: ${z} / ${n}`">
      <span v-for="i in n" :key="i" :class="{ on: i <= z }"></span>
    </div>
    <p class="streifen-teilen-label">{{ text(nachher) }}</p>
    <div class="streifen-teilen-row" role="img" :aria-label="`${feld}: ${neu.z} / ${neu.n}`">
      <span v-for="i in neu.n" :key="i" :class="{ on: i <= neu.z }"></span>
    </div>
    <p id="streifen-teilen-frage" class="streifen-teilen-label">{{ text(frage) }}</p>
    <div class="streifen-teilen-choice" role="group" aria-labelledby="streifen-teilen-frage">
      <button v-for="option in optionen" :key="option" type="button" :aria-pressed="option === k" @click="k = option">
        {{ option }}
      </button>
    </div>
    <p aria-live="polite">{{ text(satz) }}</p>
  </div>
</template>

<style scoped>
.streifen-teilen-label {
  margin-block: 0.75rem 0.25rem;
}

.streifen-teilen-row {
  display: flex;
  max-width: 32rem;
  min-height: 2.5rem;
  border: 2px solid var(--page-text);
}

.streifen-teilen-row span {
  flex: 1 1 0;
  min-width: 0;
  border-right: 2px solid var(--page-text);
  background: var(--page-surface);
}

.streifen-teilen-row span:last-child {
  border-right: 0;
}

/* a coloured field: the accent colour and diagonal stripes, so that the colour is not the only mark */
.streifen-teilen-row span.on {
  background-color: var(--page-accent);
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0,
    transparent 6px,
    var(--page-on-accent) 6px,
    var(--page-on-accent) 8px
  );
}

.streifen-teilen-choice {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.streifen-teilen-choice button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 2px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
}

.streifen-teilen-choice button[aria-pressed="true"] {
  border-color: var(--page-accent);
  background: var(--page-accent);
  color: var(--page-on-accent);
  font-weight: bold;
}

.streifen-teilen-choice button:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}
</style>
