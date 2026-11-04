<script setup lang="ts">
// The exercise "Stelle die Fahrt ein": the story of the task and the Bewegungslabor with both diagrams. The lab is the
// input; this component emits the four end speeds with answer, and the explainer draws "Prüfen", checks the answer and
// gives the feedback. The logic is in DiagrammEinstellen.ts.
import { computed } from "vue";
import Bewegungslabor from "./Bewegungslabor.vue";
import { fill, generate } from "./DiagrammEinstellen.ts";

const props = defineProps<{
  /** The task, with {story}. */
  task: string;
  /** The stories of the tasks. */
  stories: string[];
  /** The words for faster, steady, slower and stopped. */
  kindWords: string[];
  /** The name of a section, with {n}. */
  sectionName: string;
  /** The message when a section does not fit, with {n}. */
  sectionWrong: string;
  /** The app's message for each typical mistake. */
  mistakes: string[];
  /** The texts of the lab. */
  labor: {
    sectionTitle: string;
    endLabel: string;
    faster: string;
    steady: string;
    slower: string;
    stopped: string;
    backLabel: string;
    resetLabel: string;
    sTitle: string;
    vTitle: string;
    sAxis: string;
    vAxis: string;
    tAxis: string;
    sAlt: string;
    vAlt: string;
  };
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer the lab gives now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number[]] }>();

const current = computed(() => generate(props.seed));
const story = computed(() => fill(props.task, { story: props.stories[current.value.story] ?? "" }));
</script>

<template>
  <div class="diagramm-einstellen" :class="{ 'diagramm-einstellen-checked': checked }">
    <p>{{ story }}</p>
    <Bewegungslabor show="both" v-bind="labor" @change="emit('answer', $event)" />
  </div>
</template>
