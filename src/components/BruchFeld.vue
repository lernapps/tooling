<script setup lang="ts">
// A rectangle of N equal fields, the whole, of which the learner colours Z by tapping, so that Z/N of it is coloured,
// for the task of the number seed. Its logic is in BruchFeld.ts. It is the input of the task: it emits the number of
// fields coloured with answer, and the explainer draws "Prüfen", checks the answer, gives the feedback with the
// message of a typical mistake, the task number and "Neue Aufgabe". The field shows no count before "Prüfen": the
// count would be the answer.
import { computed, ref } from "vue";
import { fill, generate } from "./BruchFeld.ts";

const props = defineProps<{
  /** The task, with {Z} for the numerator and {N} for the number of fields. */
  task: string;
  /** The name of a field for screen readers, with {n} for its number. */
  cell: string;
  /** The app's message for each typical mistake, in the order of about.mistakes, with {Z}, {N} and {n}. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the field gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number] }>();

// the task of the number the explainer gives; "Neue Aufgabe" mounts the component afresh with another
const current = computed(() => generate(props.seed, props));
const coloured = ref<boolean[]>(Array.from({ length: current.value.N }, () => false));
// up to six fields in one row, more in two equal rows
const columns = computed(() => (current.value.N <= 6 ? current.value.N : current.value.N / 2));

function toggle(index: number): void {
  coloured.value[index] = !coloured.value[index];
  emit("answer", coloured.value.filter(Boolean).length);
}
</script>

<template>
  <div class="bruch-feld">
    <p>{{ fill(task, current) }}</p>
    <div
      class="bruch-feld-grid"
      :class="{ 'bruch-feld-checked': checked }"
      :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }"
    >
      <button
        v-for="(on, index) in coloured"
        :key="index"
        type="button"
        :aria-pressed="on"
        :aria-label="fill(cell, current, index + 1)"
        @click="toggle(index)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.bruch-feld-grid {
  display: grid;
  gap: 0;
  max-width: 24rem;
  border: 2px solid var(--page-text);
}

.bruch-feld-grid button {
  aspect-ratio: 1;
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0;
  border: 1px solid var(--page-text);
  border-radius: 0;
  background: var(--page-surface);
}

/* a coloured field: the colour and a stripe pattern, so the colour is not the only mark */
.bruch-feld-grid button[aria-pressed="true"] {
  background: repeating-linear-gradient(45deg, #2f5fb3 0 6px, #7ea0dc 6px 9px);
}

/* the answer checked: its fields stay as they are until the learner changes them */
.bruch-feld-checked button[aria-pressed="true"] {
  opacity: 0.85;
}
</style>
