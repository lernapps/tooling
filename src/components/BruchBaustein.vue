<script setup lang="ts">
// A building block to try out: the learner sets the denominator and the numerator and sees the whole in that many
// equal parts with that many coloured, as a rectangle or a circle. It checks nothing. The start state shows 1/4; each
// control changes what the picture shows, and the whole stays the same size.
import { computed, ref } from "vue";
import BruchBild from "./BruchBild.vue";
import { clampNenner, clampZaehler, MAX_NENNER, MIN_NENNER, type Form } from "./BruchBild.ts";

const props = defineProps<{
  /** The id of the picture, unique on the page. */
  id: string;
  /** The label of the denominator group, e.g. "Nenner (Anzahl der Teile)". */
  nennerLabel: string;
  /** The label of the numerator group. */
  zaehlerLabel: string;
  /** The names of the two forms. */
  rechteck: string;
  kreis: string;
  /** The names of the buttons for one more and one less. */
  mehr: string;
  weniger: string;
  /** The sentence under the picture, with {z} for the numerator and {n} for the denominator. */
  satz: string;
}>();

const nenner = ref(4);
const zaehler = ref(1);
const form = ref<Form>("rechteck");
const satz = computed(() =>
  props.satz.replace(/\{z\}/g, String(zaehler.value)).replace(/\{n\}/g, String(nenner.value)),
);

function setNenner(value: number): void {
  nenner.value = clampNenner(value);
  zaehler.value = clampZaehler(zaehler.value, nenner.value);
}

function setZaehler(value: number): void {
  zaehler.value = clampZaehler(value, nenner.value);
}
</script>

<template>
  <div class="bruch-baustein">
    <div class="bruch-baustein-gruppe" role="group" :aria-label="nennerLabel">
      <span class="bruch-baustein-name">{{ nennerLabel }}</span>
      <button
        type="button"
        :disabled="nenner <= MIN_NENNER"
        :aria-label="`${nennerLabel}: ${weniger}`"
        @click="setNenner(nenner - 1)"
      >
        −
      </button>
      <output>{{ nenner }}</output>
      <button
        type="button"
        :disabled="nenner >= MAX_NENNER"
        :aria-label="`${nennerLabel}: ${mehr}`"
        @click="setNenner(nenner + 1)"
      >
        +
      </button>
    </div>
    <div class="bruch-baustein-gruppe" role="group" :aria-label="zaehlerLabel">
      <span class="bruch-baustein-name">{{ zaehlerLabel }}</span>
      <button
        type="button"
        :disabled="zaehler <= 0"
        :aria-label="`${zaehlerLabel}: ${weniger}`"
        @click="setZaehler(zaehler - 1)"
      >
        −
      </button>
      <output>{{ zaehler }}</output>
      <button
        type="button"
        :disabled="zaehler >= nenner"
        :aria-label="`${zaehlerLabel}: ${mehr}`"
        @click="setZaehler(zaehler + 1)"
      >
        +
      </button>
    </div>
    <div class="bruch-baustein-gruppe" role="group">
      <button type="button" :aria-pressed="form === 'rechteck'" @click="form = 'rechteck'">{{ rechteck }}</button>
      <button type="button" :aria-pressed="form === 'kreis'" @click="form = 'kreis'">{{ kreis }}</button>
    </div>
    <BruchBild :id="id" :form="form" :nenner="nenner" :zaehler="zaehler" />
    <p aria-live="polite">{{ satz }}</p>
  </div>
</template>

<style scoped>
.bruch-baustein {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bruch-baustein-gruppe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.bruch-baustein-name {
  min-width: 11rem;
}

.bruch-baustein output {
  min-width: 2rem;
  text-align: center;
  font-weight: bold;
}

.bruch-baustein button {
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.75rem;
  border: 1px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
}

.bruch-baustein button[aria-pressed="true"] {
  background: var(--page-accent);
  color: var(--page-on-accent);
}

.bruch-baustein button:disabled {
  opacity: 0.5;
}
</style>
