<script setup lang="ts">
// Exercise: the learner sets the fraction of the task in a picture, with buttons for the number of parts (denominator)
// and the number of coloured parts (numerator). Its logic is in BruchEinstellen.ts. It is the input of the task: it
// emits what the learner set with answer, and the explainer draws "Prüfen", checks the answer and gives the feedback.
// Before "Prüfen" it shows nothing that gives the solution away: the picture is only what the learner has set.
import { computed, ref } from "vue";
import BruchBild from "./BruchBild.vue";
import { clampNenner, clampZaehler, MAX_NENNER, MIN_NENNER } from "./BruchBild.ts";
import { fill, generate, type Answer } from "./BruchEinstellen.ts";

const props = defineProps<{
  /** The task, with {z} for the numerator and {n} for the denominator. */
  task: string;
  /** The labels of the two controls. */
  nennerLabel: string;
  zaehlerLabel: string;
  /** The names of the buttons for one more and one less. */
  mehr: string;
  weniger: string;
  /** The app's message for each typical mistake, in the order of about.mistakes, with {z} and {n}. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the controls give now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [Answer] }>();

// the task of the number the explainer gives; "Neue Aufgabe" mounts the component afresh with another
const current = computed(() => generate(props.seed, props));
const nenner = ref(MIN_NENNER);
const zaehler = ref(0);

function change(): void {
  emit("answer", { nenner: nenner.value, zaehler: zaehler.value });
}

function setNenner(value: number): void {
  nenner.value = clampNenner(value);
  zaehler.value = clampZaehler(zaehler.value, nenner.value);
  change();
}

function setZaehler(value: number): void {
  zaehler.value = clampZaehler(value, nenner.value);
  change();
}
</script>

<template>
  <div class="bruch-einstellen">
    <p>{{ fill(task, current) }}</p>
    <div class="bruch-einstellen-gruppe" role="group" :aria-label="nennerLabel">
      <span class="bruch-einstellen-name">{{ nennerLabel }}</span>
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
    <div class="bruch-einstellen-gruppe" role="group" :aria-label="zaehlerLabel">
      <span class="bruch-einstellen-name">{{ zaehlerLabel }}</span>
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
    <BruchBild :id="`einstellen-${seed}`" :form="current.form" :nenner="nenner" :zaehler="zaehler" />
  </div>
</template>

<style scoped>
.bruch-einstellen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bruch-einstellen-gruppe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.bruch-einstellen-name {
  min-width: 11rem;
}

.bruch-einstellen output {
  min-width: 2rem;
  text-align: center;
  font-weight: bold;
}

.bruch-einstellen button {
  min-width: 44px;
  min-height: 44px;
  padding: 0 0.75rem;
  border: 1px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
}

.bruch-einstellen button:disabled {
  opacity: 0.5;
}
</style>
