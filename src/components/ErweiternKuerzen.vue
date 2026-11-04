<script setup lang="ts">
// A building block to try out: a fraction z/n in a strip, and below it the same fraction after expanding by a factor
// (or reducing with a common divisor). Both strips are equally long and equally much is coloured. It checks nothing.
// The start state is factor 1: both strips alike. Its logic is in ErweiternKuerzen.ts.
import { computed, ref } from "vue";
import BruchBild from "./BruchBild.vue";
import { ergebnis, faktoren, fuelle } from "./ErweiternKuerzen.ts";

const props = defineProps<{
  /** The id of the pictures, unique on the page. */
  id: string;
  /** "erweitern" or "kuerzen". */
  modus: "erweitern" | "kuerzen";
  /** The numerator and denominator of the fraction to start from. */
  zaehler: number;
  nenner: number;
  /** The label of the factor control, e.g. "Erweitern mit". */
  faktorLabel: string;
  /** The names of the buttons for the next and the previous factor. */
  mehr: string;
  weniger: string;
  /** The labels above the two pictures, with {z}, {n}, {z2} and {n2}. */
  oben: string;
  unten: string;
  /** The sentence under the pictures, with {z}, {n}, {f}, {z2} and {n2}. */
  satz: string;
  /** For reducing: the note which factors are offered, with {liste}. Empty for expanding. */
  hinweis: string;
}>();

const liste = computed(() => faktoren(props.modus, props.zaehler, props.nenner));
const index = ref(0);
const faktor = computed(() => liste.value[index.value] ?? 1);
const neu = computed(() => ergebnis(props.modus, props.zaehler, props.nenner, faktor.value));
const text = (t: string) => fuelle(t, props.modus, props.zaehler, props.nenner, faktor.value);
</script>

<template>
  <div class="ek">
    <div class="ek-gruppe" role="group" :aria-label="faktorLabel">
      <span class="ek-name">{{ faktorLabel }}</span>
      <button type="button" :disabled="index <= 0" :aria-label="`${faktorLabel}: ${weniger}`" @click="index--">
        −
      </button>
      <output>{{ faktor }}</output>
      <button
        type="button"
        :disabled="index >= liste.length - 1"
        :aria-label="`${faktorLabel}: ${mehr}`"
        @click="index++"
      >
        +
      </button>
    </div>
    <p v-if="hinweis">{{ text(hinweis) }}</p>
    <p class="ek-label">{{ text(oben) }}</p>
    <BruchBild :id="`${id}-oben`" form="rechteck" :nenner="nenner" :zaehler="zaehler" />
    <p class="ek-label">{{ text(unten) }}</p>
    <BruchBild :id="`${id}-unten`" form="rechteck" :nenner="neu.nenner" :zaehler="neu.zaehler" />
    <p aria-live="polite">{{ text(satz) }}</p>
  </div>
</template>

<style scoped>
.ek {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ek-gruppe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.ek-name {
  min-width: 8rem;
}

.ek-label {
  margin: 0.5rem 0 0;
  font-weight: bold;
}

.ek output {
  min-width: 2rem;
  text-align: center;
  font-weight: bold;
}

.ek button {
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.75rem;
  border: 1px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
}

.ek button:disabled {
  opacity: 0.5;
}
</style>
