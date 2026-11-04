<script setup lang="ts">
// A fraction as a picture: a whole (rectangle or circle) in `nenner` equal parts, `zaehler` coloured. Only displays;
// the logic is in BruchBild.ts. The coloured parts have a second mark besides the colour: a stripe pattern.
import { computed } from "vue";
import { describeBild, sectorPath, stripPart } from "./BruchBild.ts";

const props = defineProps<{
  /** "rechteck" or "kreis". */
  form: "rechteck" | "kreis";
  /** The number of equal parts, the denominator. */
  nenner: number;
  /** The number of coloured parts, the numerator. */
  zaehler: number;
  /** A name for the picture, so that two pictures on a page can be told apart. */
  id: string;
}>();

const parts = computed(() => Array.from({ length: props.nenner }, (_, index) => index));
const label = computed(() => describeBild(props.form, props.nenner, props.zaehler));
const pattern = computed(() => `${props.id}-streifen`);
</script>

<template>
  <svg
    :viewBox="form === 'kreis' ? '0 0 100 100' : '0 0 100 30'"
    class="bruch-bild"
    :class="form === 'kreis' ? 'bruch-bild-kreis' : 'bruch-bild-rechteck'"
    role="img"
    :aria-label="label"
  >
    <defs>
      <pattern :id="pattern" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="4" height="4" class="bruch-bild-fuellung" />
        <rect width="1.5" height="4" class="bruch-bild-streifen" />
      </pattern>
    </defs>
    <template v-if="form === 'kreis'">
      <path
        v-for="index in parts"
        :key="index"
        :d="sectorPath(index, nenner)"
        :fill="index < zaehler ? `url(#${pattern})` : 'transparent'"
        class="bruch-bild-teil"
      />
    </template>
    <template v-else>
      <rect
        v-for="index in parts"
        :key="index"
        :x="stripPart(index, nenner).x"
        y="0"
        :width="stripPart(index, nenner).width"
        height="30"
        :fill="index < zaehler ? `url(#${pattern})` : 'transparent'"
        class="bruch-bild-teil"
      />
    </template>
  </svg>
</template>

<style scoped>
.bruch-bild {
  display: block;
  width: 100%;
  max-width: 18rem;
  height: auto;
}

.bruch-bild-kreis {
  max-width: 12rem;
}

.bruch-bild-teil {
  stroke: var(--page-text);
  stroke-width: 0.8;
}

.bruch-bild-fuellung {
  fill: var(--page-accent);
}

.bruch-bild-streifen {
  fill: var(--page-on-accent);
  opacity: 0.45;
}
</style>
