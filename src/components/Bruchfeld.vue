<script setup lang="ts">
// A strip of n equal parts, the whole, of which the learner colours z by tapping, for the task of the number seed.
// Its logic is in Bruchfeld.ts. It is the input of the task: it emits the number of parts coloured with answer, and the
// explainer draws "Prüfen", checks the answer, gives the feedback with the message of a typical mistake, the task number
// and "Neue Aufgabe". "Zurücksetzen" makes every part white again. No count is shown: it would give the answer away.
import { computed, ref } from "vue";
import { fill, generate } from "./Bruchfeld.ts";

const props = defineProps<{
  /** The task, with {n} for the number of parts and {z} for the numerator. */
  task: string;
  /** The name of a part for screen readers, with {i} for its number and {n}. */
  cell: string;
  /** The label of the reset button. */
  reset: string;
  /** The app's message for each typical mistake, in the order of about.mistakes, with {n}, {z} and {r}. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the strip gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number | undefined] }>();

// the task of the number the explainer gives; "Neue Aufgabe" mounts the component afresh with another
const current = computed(() => generate(props.seed, props));
const coloured = ref<boolean[]>(Array.from({ length: current.value.n }, () => false));

function publish(): void {
  const count = coloured.value.filter(Boolean).length;
  emit("answer", count === 0 ? undefined : count);
}

function toggle(index: number): void {
  coloured.value[index] = !coloured.value[index];
  publish();
}

function clear(): void {
  coloured.value = coloured.value.map(() => false);
  publish();
}

const label = (index: number) => fill(props.cell, current.value).replace(/\{i\}/g, String(index + 1));
</script>

<template>
  <div class="bruchfeld">
    <p>{{ fill(task, current) }}</p>
    <div class="bruchfeld-strip" :class="{ 'bruchfeld-checked': checked }">
      <button
        v-for="(on, index) in coloured"
        :key="index"
        type="button"
        :aria-pressed="on"
        :aria-label="label(index)"
        @click="toggle(index)"
      ></button>
    </div>
    <div class="bruchfeld-actions">
      <button type="button" class="bruchfeld-reset" @click="clear">{{ reset }}</button>
    </div>
  </div>
</template>

<style scoped>
.bruchfeld-strip {
  display: flex;
  gap: 2px;
  max-width: 24rem;
}

.bruchfeld-strip button {
  flex: 1 1 0;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0;
  border: 2px solid var(--page-text);
  border-radius: 0;
  background: var(--page-background);
  color: var(--page-text);
}

/* a colouring has a second mark besides the colour: stripes */
.bruchfeld-strip button[aria-pressed="true"] {
  background-color: #2b6cb0;
  background-image: repeating-linear-gradient(45deg, transparent 0 6px, rgb(255 255 255 / 45%) 6px 9px);
}

/* the answer checked: its parts a little lighter until the learner changes it */
.bruchfeld-checked button[aria-pressed="true"] {
  background-color: #4a85c4;
}

.bruchfeld-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.bruchfeld-reset {
  min-height: 2.75rem;
  padding: 0 1rem;
}
</style>
