<script setup lang="ts">
// Two strips of the same length, the same whole. Above: the given fraction z/n. Below: the same fraction expanded
// with the factor k (mode erweitern) or reduced with a common divisor k (mode kuerzen), which the learner chooses with
// the buttons. The coloured piece stays the same size; only the parts get finer or coarser. Its logic is in Streifen.ts.
// The start is the factor 1: both strips are alike.
import { computed, ref } from "vue";
import { factors, fill, pairFor, parts } from "./Streifen.ts";

const props = defineProps<{
  /** erweitern or kuerzen. */
  mode: "erweitern" | "kuerzen";
  /** The numerator of the given fraction. */
  z: number;
  /** The denominator of the given fraction. */
  n: number;
  /** The label above the buttons. */
  factorLabel: string;
  /** The label of the strip above, with {z} and {n}. */
  before: string;
  /** The label of the strip below, with {k}, {z2} and {n2}. */
  after: string;
  /** The name of a strip for screen readers, with {z} and {n} (above) or {z2} and {n2} (below). */
  stripLabel: string;
  /** The sentence below that says what stays the same, with {z}, {n}, {z2} and {n2}. */
  same: string;
}>();

const k = ref(1);
const choices = computed(() => factors(props.mode, props.z, props.n));
const pair = computed(() => pairFor(props.mode, props.z, props.n, k.value));
const sign = computed(() => (props.mode === "erweitern" ? "·" : ":"));
const topLabel = computed(() => fill(props.stripLabel, pair.value, k.value));
const bottomLabel = computed(() =>
  fill(props.stripLabel, { ...pair.value, z: pair.value.z2, n: pair.value.n2 }, k.value),
);
</script>

<template>
  <div class="streifen">
    <p id="streifen-factor">{{ factorLabel }}</p>
    <div class="streifen-choices" role="group" aria-labelledby="streifen-factor">
      <button
        v-for="f in choices"
        :key="f"
        type="button"
        :aria-pressed="f === k"
        :class="{ 'streifen-chosen': f === k }"
        @click="k = f"
      >
        {{ f }}
      </button>
    </div>

    <p class="streifen-label">{{ fill(before, pair, k) }}</p>
    <div class="streifen-strip" role="img" :aria-label="topLabel">
      <span
        v-for="(on, index) in parts(pair.z, pair.n)"
        :key="`a${pair.n}-${index}`"
        :class="{ 'streifen-on': on }"
      ></span>
    </div>

    <p class="streifen-label">{{ fill(after, pair, k) }}</p>
    <div class="streifen-strip" role="img" :aria-label="bottomLabel">
      <span
        v-for="(on, index) in parts(pair.z2, pair.n2)"
        :key="`b${pair.n2}-${index}`"
        :class="{ 'streifen-on': on }"
      ></span>
    </div>

    <p class="streifen-calc" aria-hidden="true">
      <span class="streifen-frac"
        ><span class="streifen-top">{{ pair.z }}</span
        ><span>{{ pair.n }}</span></span
      >
      =
      <span class="streifen-frac"
        ><span class="streifen-top">{{ pair.z }} {{ sign }} {{ k }}</span
        ><span>{{ pair.n }} {{ sign }} {{ k }}</span></span
      >
      =
      <span class="streifen-frac"
        ><span class="streifen-top">{{ pair.z2 }}</span
        ><span>{{ pair.n2 }}</span></span
      >
    </p>
    <p aria-live="polite">{{ fill(same, pair, k) }}</p>
  </div>
</template>

<style scoped>
.streifen-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.streifen-choices button {
  min-width: 44px;
  min-height: 44px;
  border: 2px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
  font: inherit;
}

.streifen-choices button.streifen-chosen {
  border-color: var(--page-accent);
  background: var(--page-accent);
  color: var(--page-on-accent);
  font-weight: bold;
}

.streifen-label {
  margin: 0.75rem 0 0.25rem;
  font-weight: bold;
}

.streifen-strip {
  display: flex;
  width: 100%;
  max-width: 32rem;
  height: 3rem;
  border: 2px solid var(--page-text);
}

.streifen-strip span {
  flex: 1 1 0;
  min-width: 0;
  border-right: 2px solid var(--page-text);
  background: var(--page-background);
}

.streifen-strip span:last-child {
  border-right: 0;
}

.streifen-strip span.streifen-on {
  background-color: var(--page-accent);
  background-image: repeating-linear-gradient(45deg, transparent 0 4px, var(--page-on-accent) 4px 6px);
}

.streifen-calc {
  margin-top: 1rem;
}

.streifen-frac {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.4rem;
  vertical-align: middle;
  font-weight: bold;
  line-height: 1.2;
}

.streifen-top {
  padding: 0 0.4rem;
  border-bottom: 2px solid var(--page-text);
}
</style>
