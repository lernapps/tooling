<script setup lang="ts">
// A strip of n equal parts, the whole, of which the learner colours z parts by tapping, for the task of the number
// seed. Its logic is in BruchFeld.ts. It is the input of the task: it emits the number of parts coloured with
// answer, and the explainer draws "Prüfen", checks the answer, gives the feedback and "Neue Aufgabe". No count is
// shown: it would state what the task asks.
import { computed, ref } from "vue";
import { fill, generate } from "./BruchFeld.ts";

const props = defineProps<{
  /** The task, with {n} for the number of parts and {z} for the parts to colour. */
  task: string;
  /** The name of a part for screen readers, with {k} for its number and {n}. */
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
  <div class="bruch-feld">
    <p>{{ fill(task, current) }}</p>
    <div class="bruch-feld-strip" :class="{ 'bruch-feld-checked': checked }">
      <button
        v-for="(on, index) in coloured"
        :key="index"
        type="button"
        :aria-pressed="on"
        :aria-label="fill(cell, current, index + 1)"
        @click="toggle(index)"
      >
        <span aria-hidden="true">{{ on ? "✓" : "" }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.bruch-feld-strip {
  display: flex;
  max-width: 24rem;
  border: 2px solid var(--page-text);
}

.bruch-feld-strip button {
  flex: 1 1 0;
  min-width: 1.5rem;
  min-height: 3rem;
  padding: 0;
  border: 0;
  border-right: 2px solid var(--page-text);
  border-radius: 0;
  background: var(--page-surface);
  color: var(--page-on-accent);
  font-size: 1.25rem;
  line-height: 1;
}

.bruch-feld-strip button:last-child {
  border-right: 0;
}

/* a coloured part: the accent colour and a tick as a second mark */
.bruch-feld-strip button[aria-pressed="true"] {
  background: var(--page-accent);
}

/* the answer checked: its parts a little lighter until the learner changes it */
.bruch-feld-checked button[aria-pressed="true"] {
  opacity: 0.8;
}
</style>
