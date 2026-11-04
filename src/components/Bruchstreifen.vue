<script setup lang="ts">
// The strip is the whole. Four modes: "anteil" (learners choose the parts and colour them), "erweitern" and "kuerzen"
// (the given fraction above, the expanded or reduced one below, same coloured length), "vergleichen" (two strips,
// each with its own parts, one below the other). It checks nothing: the exercises of the page do. Logic: Bruchstreifen.ts.
import { computed, ref } from "vue";
import {
  begrenzen,
  bruchStreifen,
  erweitern,
  fuellen,
  kuerzen,
  MAX_NENNER,
  neueTeilung,
  umschalten,
  vergleichen,
  zaehler,
} from "./Bruchstreifen.ts";

// the props are typed here, not imported: a block can only give types the component itself declares
type Texte = {
  nennerLabel: string;
  weniger: string;
  mehr: string;
  teilGefaerbt: string;
  teilLeer: string;
  anzeige: string;
  streifen: string;
  /** "erweitern" and "kuerzen": the label above the given strip, with {z} and {n}. */
  vorher?: string;
  /** The label above the result strip, with {k}, {z} and {n}. */
  nachher?: string;
  /** The label of the factor buttons. */
  faktorLabel?: string;
  /** "kuerzen": the message when the divisor does not divide both numbers, with {k}, {z} and {n}. */
  nichtMoeglich?: string;
  /** A strip that cannot be tapped, for screen readers, with {z} and {n}. */
  streifenBeschreibung?: string;
  /** "vergleichen": the label above the upper and the lower strip. */
  oben?: string;
  unten?: string;
  /** "vergleichen": the sentence about the result. */
  groesser?: string;
  gleich?: string;
  kleiner?: string;
};

const props = defineProps<{
  modus: "anteil" | "erweitern" | "kuerzen" | "vergleichen";
  /** The most parts of a strip, at most 12. */
  maxNenner?: number;
  /** "erweitern", "kuerzen": the given fraction. "vergleichen": the upper fraction at the start. */
  zaehler?: number;
  nenner?: number;
  /** "vergleichen": the lower fraction at the start. */
  zaehler2?: number;
  nenner2?: number;
  /** "erweitern", "kuerzen": the numbers learners can choose to expand or reduce by, the first one is the start. */
  faktoren?: number[];
  texte: Texte;
}>();

const grenze = computed(() => begrenzen(props.maxNenner ?? MAX_NENNER));
const frei = computed(() => props.modus === "anteil" || props.modus === "vergleichen");

// the free strips: one for "anteil", two for "vergleichen"; the start state is the whole strip, or the given fractions
const streifen = ref<boolean[][]>(
  props.modus === "vergleichen"
    ? [bruchStreifen(props.zaehler ?? 0, props.nenner ?? 1), bruchStreifen(props.zaehler2 ?? 0, props.nenner2 ?? 1)]
    : [neueTeilung(1)],
);

function setzeNenner(welcher: number, n: number): void {
  streifen.value = streifen.value.map((teile, i) =>
    i === welcher ? neueTeilung(begrenzen(n, grenze.value), grenze.value) : teile,
  );
}

function tippe(welcher: number, index: number): void {
  streifen.value = streifen.value.map((teile, i) => (i === welcher ? umschalten(teile, index) : teile));
}

// "erweitern" and "kuerzen": the given fraction and the chosen number
const gegeben = computed(() => ({ z: props.zaehler ?? 0, n: props.nenner ?? 1 }));
const faktor = ref(props.faktoren?.[0] ?? 1);
const meldung = ref("");
const ergebnis = computed(() => {
  if (props.modus === "erweitern") return erweitern(gegeben.value, faktor.value);
  if (props.modus === "kuerzen") return kuerzen(gegeben.value, faktor.value) ?? gegeben.value;
  return gegeben.value;
});

function waehle(k: number): void {
  if (props.modus === "kuerzen" && !kuerzen(gegeben.value, k)) {
    meldung.value = fuellen(props.texte.nichtMoeglich ?? "", { k, z: gegeben.value.z, n: gegeben.value.n });
    return;
  }
  meldung.value = "";
  faktor.value = k;
}

const vergleich = computed(() => {
  const [oben, unten] = streifen.value;
  if (props.modus !== "vergleichen" || !oben || !unten) return "";
  const ergebnisVergleich = vergleichen({ z: zaehler(oben), n: oben.length }, { z: zaehler(unten), n: unten.length });
  return ergebnisVergleich > 0
    ? props.texte.groesser
    : ergebnisVergleich < 0
      ? props.texte.kleiner
      : props.texte.gleich;
});

function beschreibung(z: number, n: number): string {
  return fuellen(props.texte.streifenBeschreibung ?? "", { z, n });
}
</script>

<template>
  <div class="bruchstreifen" :data-modus="modus">
    <template v-if="frei">
      <div v-for="(teile, welcher) in streifen" :key="welcher" class="bruchstreifen-block">
        <p v-if="modus === 'vergleichen'" class="bruchstreifen-titel">
          {{ welcher === 0 ? texte.oben : texte.unten }}
        </p>
        <div class="bruchstreifen-steuerung">
          <span class="bruchstreifen-label">{{ texte.nennerLabel }}</span>
          <button
            type="button"
            :aria-label="texte.weniger"
            :disabled="teile.length <= 1"
            @click="setzeNenner(welcher, teile.length - 1)"
          >
            −
          </button>
          <output class="bruchstreifen-zahl" :aria-label="texte.nennerLabel">{{ teile.length }}</output>
          <button
            type="button"
            :aria-label="texte.mehr"
            :disabled="teile.length >= grenze"
            @click="setzeNenner(welcher, teile.length + 1)"
          >
            +
          </button>
        </div>
        <div class="bruchstreifen-streifen" role="group" :aria-label="texte.streifen">
          <button
            v-for="(an, index) in teile"
            :key="index"
            type="button"
            class="bruchstreifen-teil"
            :aria-pressed="an"
            :aria-label="fuellen(an ? texte.teilGefaerbt : texte.teilLeer, { i: index + 1, n: teile.length })"
            @click="tippe(welcher, index)"
          ></button>
        </div>
        <p class="bruchstreifen-anzeige" aria-live="polite">
          {{ fuellen(texte.anzeige, { z: zaehler(teile), n: teile.length }) }}
        </p>
      </div>
      <p v-if="modus === 'vergleichen'" class="bruchstreifen-vergleich" aria-live="polite">{{ vergleich }}</p>
    </template>

    <template v-else>
      <p class="bruchstreifen-titel">{{ fuellen(texte.vorher ?? "", { z: gegeben.z, n: gegeben.n }) }}</p>
      <div class="bruchstreifen-streifen" role="img" :aria-label="beschreibung(gegeben.z, gegeben.n)">
        <span
          v-for="(an, index) in bruchStreifen(gegeben.z, gegeben.n)"
          :key="index"
          class="bruchstreifen-teil"
          :class="{ 'bruchstreifen-an': an }"
        ></span>
      </div>
      <div class="bruchstreifen-steuerung bruchstreifen-faktoren" role="group" :aria-label="texte.faktorLabel">
        <span class="bruchstreifen-label">{{ texte.faktorLabel }}</span>
        <button v-for="k in faktoren ?? []" :key="k" type="button" :aria-pressed="k === faktor" @click="waehle(k)">
          {{ k }}
        </button>
      </div>
      <p class="bruchstreifen-titel">
        {{ fuellen(texte.nachher ?? "", { k: faktor, z: ergebnis.z, n: ergebnis.n }) }}
      </p>
      <div class="bruchstreifen-streifen" role="img" :aria-label="beschreibung(ergebnis.z, ergebnis.n)">
        <span
          v-for="(an, index) in bruchStreifen(ergebnis.z, ergebnis.n)"
          :key="index"
          class="bruchstreifen-teil"
          :class="{ 'bruchstreifen-an': an }"
        ></span>
      </div>
      <p class="bruchstreifen-anzeige" aria-live="polite">{{ meldung }}</p>
    </template>
  </div>
</template>

<style scoped>
.bruchstreifen {
  max-width: 40rem;
}

.bruchstreifen-block {
  margin-bottom: 1rem;
}

.bruchstreifen-titel {
  margin: 0.5rem 0 0.25rem;
  font-weight: bold;
}

.bruchstreifen-steuerung {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0.75rem;
}

.bruchstreifen-steuerung button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border: 1px solid var(--page-border);
  border-radius: 0.25rem;
  background: var(--page-surface);
  color: var(--page-text);
  font-size: 1.25rem;
}

.bruchstreifen-steuerung button:disabled {
  opacity: 0.5;
}

/* the chosen number: the accent colour and a thick border, so that colour is not the only mark */
.bruchstreifen-faktoren button[aria-pressed="true"] {
  background: var(--page-accent);
  color: var(--page-on-accent);
  border: 3px solid var(--page-text);
  font-weight: bold;
}

.bruchstreifen-label {
  margin-right: 0.25rem;
}

.bruchstreifen-zahl {
  min-width: 2rem;
  text-align: center;
  font-weight: bold;
  font-size: 1.25rem;
}

.bruchstreifen-streifen {
  display: flex;
  border: 3px solid var(--page-text);
}

.bruchstreifen-teil {
  flex: 1 1 0;
  min-width: 0;
  min-height: 3rem;
  margin: 0;
  padding: 0;
  border: 0;
  border-right: 3px solid var(--page-text);
  border-radius: 0;
  background: var(--page-surface);
}

button.bruchstreifen-teil {
  cursor: pointer;
}

.bruchstreifen-teil:last-child {
  border-right: 0;
}

/* many thin parts: a thinner line, so that the parts stay visible */
.bruchstreifen-streifen:has(.bruchstreifen-teil:nth-child(13)) .bruchstreifen-teil {
  border-right-width: 1px;
}

/* coloured: the accent colour with a hatching, so that colour is not the only mark */
.bruchstreifen-teil[aria-pressed="true"],
.bruchstreifen-an {
  background: repeating-linear-gradient(
    45deg,
    var(--page-accent) 0,
    var(--page-accent) 6px,
    var(--page-on-accent) 6px,
    var(--page-on-accent) 8px
  );
}

.bruchstreifen-anzeige,
.bruchstreifen-vergleich {
  margin: 0.5rem 0 0;
}

.bruchstreifen-vergleich {
  font-weight: bold;
}
</style>
