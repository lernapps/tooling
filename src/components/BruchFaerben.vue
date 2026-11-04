<script setup lang="ts">
// A strip of n equal parts, of which the learner colours z by tapping, for the task of the number seed. Its logic is
// in BruchFaerben.ts. It is the input of the task: it emits the number of parts coloured with answer, and the
// explainer draws "Prüfen", checks the answer and gives the feedback. It shows no count: the count would be the answer.
import { computed, ref } from "vue";
import { fill, generate } from "./BruchFaerben.ts";

const props = defineProps<{
  /** The task, with {n} for the number of parts and {z} for the numerator. */
  task: string;
  /** The name of a part for screen readers, with {c} for its number. */
  cell: string;
  /** The app's message for each typical mistake, in the order of about.mistakes, with {n}, {z} and {c}. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the strip gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number] }>();

const current = computed(() => generate(props.seed, props));
const coloured = ref<boolean[]>(Array.from({ length: current.value.n }, () => false));

function toggle(index: number): void {
  coloured.value[index] = !coloured.value[index];
  emit("answer", coloured.value.filter(Boolean).length);
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
        :class="{ 'bruch-faerben-on': on }"
        @click="toggle(index)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.bruch-faerben-strip {
  display: flex;
  width: 100%;
  max-width: 32rem;
  border: 2px solid var(--page-text);
}

.bruch-faerben-strip button {
  flex: 1 1 0;
  min-width: 0;
  min-height: 3.5rem;
  padding: 0;
  border: 0;
  border-right: 2px solid var(--page-text);
  border-radius: 0;
  background: var(--page-background);
}

.bruch-faerben-strip button:last-child {
  border-right: 0;
}

.bruch-faerben-strip button.bruch-faerben-on {
  background-color: var(--page-accent);
  background-image: repeating-linear-gradient(45deg, transparent 0 4px, var(--page-on-accent) 4px 6px);
}

.bruch-faerben-strip button:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: -3px;
}

/* the answer checked: the colour a little lighter until the learner changes it */
.bruch-faerben-checked button.bruch-faerben-on {
  opacity: 0.8;
}
</style>
