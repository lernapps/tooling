<script setup lang="ts">
// A strip of b equal pieces, the whole, of which the learner colours the fraction a/b by tapping, for the task of the
// number seed. Its logic is in BruchFaerben.ts. It is the input of the task: it emits the number of pieces coloured
// with answer, and the explainer draws "Prüfen", checks the answer and gives the feedback.
import { computed, ref } from "vue";
import { fill, generate } from "./BruchFaerben.ts";

const props = defineProps<{
  /** The task, with {a} for the numerator and {b} for the denominator. */
  task: string;
  /** The count below the strip, with {n} for the pieces coloured. */
  counter: string;
  /** The name of a piece for screen readers, with {n} for its number. */
  cell: string;
  /** The app's message for each typical mistake, in the order of about.mistakes, with {a}, {b} and {n}. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the strip gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number] }>();

// the task of the number the explainer gives; "Neue Aufgabe" mounts the component afresh with another
const current = computed(() => generate(props.seed, props));
const coloured = ref<boolean[]>(Array.from({ length: current.value.b }, () => false));
const count = computed(() => coloured.value.filter(Boolean).length);

function toggle(index: number): void {
  coloured.value[index] = !coloured.value[index];
  emit("answer", count.value);
}
</script>

<template>
  <div class="bruch-faerben">
    <p>{{ fill(task, current) }}</p>
    <div class="bruch-faerben-strip" :class="{ 'bruch-faerben-checked': checked }">
      <button
        v-for="(on, index) in coloured"
        :key="index"
        type="button"
        :aria-pressed="on"
        :aria-label="fill(cell, current, index + 1)"
        @click="toggle(index)"
      ></button>
    </div>
    <p aria-live="polite">{{ fill(counter, current, count) }}</p>
  </div>
</template>

<style scoped>
.bruch-faerben-strip {
  display: flex;
  max-width: 30rem;
  border: 2px solid var(--page-text);
}

.bruch-faerben-strip button {
  flex: 1 1 0;
  min-width: 1.75rem;
  min-height: 2.75rem;
  padding: 0;
  border: 0;
  border-right: 1px solid var(--page-text);
  border-radius: 0;
  background: var(--page-surface);
}

.bruch-faerben-strip button:last-child {
  border-right: 0;
}

/* a coloured piece: blue and, as a second mark besides the colour, a diagonal hatching */
.bruch-faerben-strip button[aria-pressed="true"] {
  background: repeating-linear-gradient(45deg, #2f5fb3 0 6px, #7f9fd6 6px 9px);
}

.bruch-faerben-checked button[aria-pressed="true"] {
  opacity: 0.8;
}
</style>
