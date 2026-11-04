<script setup lang="ts">
// A strip of n equal fields, together one whole, of which the learner colours z by tapping, for the task of the number
// seed. Its logic is in BruchStreifen.ts. It is the input of the task: it emits the number of fields coloured with
// answer, and the explainer draws "Prüfen", checks the answer, gives the feedback with the message of a typical
// mistake, the task number and "Neue Aufgabe". It shows no count: the count would be the answer.
import { computed, ref } from "vue";
import { fill, generate } from "./BruchStreifen.ts";

const props = defineProps<{
  /** The task, with {n} for the number of fields and {z} for the number to colour. */
  task: string;
  /** The name of a field for screen readers, with {k} for its number. */
  cell: string;
  /** The app's message for each typical mistake, in the order of about.mistakes, with {n}, {z} and {k}. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the strip gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number] }>();

// the task of the number the explainer gives; "Neue Aufgabe" mounts the component afresh with another
const current = computed(() => generate(props.seed, props));
const coloured = ref<boolean[]>(Array.from({ length: current.value.n }, () => false));

function toggle(index: number): void {
  coloured.value[index] = !coloured.value[index];
  emit("answer", coloured.value.filter(Boolean).length);
}
</script>

<template>
  <div class="bruch-streifen">
    <p>{{ fill(task, current) }}</p>
    <div class="bruch-streifen-row" :class="{ 'bruch-streifen-checked': checked }">
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
.bruch-streifen-row {
  display: flex;
  flex-wrap: nowrap;
  max-width: 32rem;
  border: 2px solid var(--page-text);
}

.bruch-streifen-row button {
  flex: 1 1 0;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0;
  border: 0;
  border-right: 2px solid var(--page-text);
  border-radius: 0;
  background: var(--page-surface);
  color: var(--page-text);
}

.bruch-streifen-row button:last-child {
  border-right: 0;
}

/* a coloured field: the accent colour and diagonal stripes, so that the colour is not the only mark */
.bruch-streifen-row button[aria-pressed="true"] {
  background-color: var(--page-accent);
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0,
    transparent 6px,
    var(--page-on-accent) 6px,
    var(--page-on-accent) 8px
  );
}

.bruch-streifen-row button:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: -5px;
}

/* the answer checked: stays as it is until the learner changes it */
.bruch-streifen-checked button[aria-pressed="true"] {
  opacity: 0.85;
}
</style>
