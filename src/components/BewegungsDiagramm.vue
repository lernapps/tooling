<script setup lang="ts">
// A drive of 6 seconds, shown as a wagon on a track, as a speed-time diagram and as a distance-time diagram.
// Learners set the speed at each second with the buttons (or one speed for the whole drive in the mode `konstant`)
// and see at once what changes. The logic is in BewegungsDiagramm.ts. It checks nothing: it is no exercise.
import { computed, ref } from "vue";
import {
  DAUER,
  TEMPO_MAX,
  aendere,
  alsPunkte,
  bahnProzent,
  bereich,
  FLAECHE,
  findeFahrt,
  fuelle,
  geschwindigkeitsPunkte,
  setzeKonstant,
  tempoMin,
  wegNachSekunden,
  wegPunkte,
  xVon,
  yVon,
  zahl,
  type Fahrt,
} from "./BewegungsDiagramm.ts";

const props = defineProps<{
  /** All drives of the data file `fahrten`. */
  fahrten: Fahrt[];
  /** The id of the drive the component starts with. */
  start: string;
  /** Which diagrams are shown: the distance-time diagram, the speed-time diagram, or both. */
  ansicht: "weg" | "geschwindigkeit" | "beide";
  /** The speed may be negative: the wagon goes backwards. */
  rueckwaerts?: boolean;
  /** One speed for the whole drive instead of one per second. */
  konstant?: boolean;
  /** Learner texts. {t}, {v} and {s} are filled in. */
  bahnTitel: string;
  geschwindigkeitTitel: string;
  wegTitel: string;
  tempoTitel: string;
  tempoLabel: string;
  tempoKonstantLabel: string;
  mehr: string;
  weniger: string;
  zuruecksetzen: string;
  achseZeit: string;
  achseGeschwindigkeit: string;
  achseWeg: string;
  bildBahn: string;
  bildGeschwindigkeit: string;
  bildWeg: string;
  tabelleTitel: string;
  spalteZeit: string;
  spalteGeschwindigkeit: string;
  spalteWeg: string;
}>();

const rueckwaerts = computed(() => props.rueckwaerts === true);
const fahrt = computed(() => findeFahrt(props.fahrten, props.start));
const tempo = ref<number[]>(fahrt.value.tempo.slice());
const bereichen = computed(() => bereich(rueckwaerts.value));
const weg = computed(() => wegNachSekunden(tempo.value));
const zeigeGeschwindigkeit = computed(() => props.ansicht !== "weg");
const zeigeWeg = computed(() => props.ansicht !== "geschwindigkeit");
const sekunden = Array.from({ length: DAUER }, (_, i) => i + 1);
const zeiten = Array.from({ length: DAUER + 1 }, (_, i) => i);

const vLinie = computed(() => alsPunkte(geschwindigkeitsPunkte(tempo.value, rueckwaerts.value)));
const vPunkte = computed(() => geschwindigkeitsPunkte(tempo.value, rueckwaerts.value));
const sLinie = computed(() => alsPunkte(wegPunkte(tempo.value, rueckwaerts.value)));
const bahn = computed(() => bahnProzent(tempo.value, rueckwaerts.value));

const vTicks = computed(() => {
  const liste: number[] = [];
  for (let v = tempoMin(rueckwaerts.value); v <= TEMPO_MAX; v += 2) liste.push(v);
  return liste;
});
const sTicks = computed(() => {
  const liste: number[] = [];
  for (let s = bereichen.value.sMin; s <= bereichen.value.sMax; s += 6) liste.push(s);
  return liste;
});

const orte = computed(() => weg.value.map((s) => zahl(s)).join(", "));
const altBahn = computed(() => fuelle(props.bildBahn, { s: orte.value }));
const altGeschwindigkeit = computed(() =>
  fuelle(props.bildGeschwindigkeit, { v: tempo.value.map((v) => zahl(v)).join(", ") }),
);
const altWeg = computed(() => fuelle(props.bildWeg, { s: orte.value }));

const aktuelleKonstante = computed(() => tempo.value[1] ?? 0);

function aendern(sekunde: number, schritt: number): void {
  tempo.value = aendere(tempo.value, sekunde, schritt, rueckwaerts.value);
}
function aendernKonstant(schritt: number): void {
  tempo.value = setzeKonstant(tempo.value, aktuelleKonstante.value + schritt, rueckwaerts.value);
}
function ruecksetzen(): void {
  tempo.value = fahrt.value.tempo.slice();
}
const unten = FLAECHE.hoehe - FLAECHE.unten;
</script>

<template>
  <div class="bewegung">
    <p>
      <strong>{{ fahrt.titel }}</strong
      >: {{ fahrt.beschreibung }}
    </p>

    <p class="bw-titel">{{ bahnTitel }}</p>
    <div class="bw-bahn" role="img" :aria-label="altBahn">
      <div class="bw-schiene"></div>
      <span
        v-for="(prozent, i) in bahn"
        :key="i"
        class="bw-punkt"
        :class="{ 'bw-start': i === 0 }"
        :style="{ left: `${Math.round((prozent * 0.96 + 2) * 10) / 10}%` }"
      ></span>
    </div>

    <template v-if="zeigeGeschwindigkeit">
      <p class="bw-titel">{{ geschwindigkeitTitel }}</p>
      <svg
        class="bw-diagramm"
        :viewBox="`0 0 ${FLAECHE.breite} ${FLAECHE.hoehe}`"
        role="img"
        :aria-label="altGeschwindigkeit"
      >
        <line class="bw-achse" :x1="FLAECHE.links" :y1="FLAECHE.oben" :x2="FLAECHE.links" :y2="unten" />
        <line class="bw-achse" :x1="FLAECHE.links" :y1="unten" :x2="FLAECHE.breite - FLAECHE.rechts" :y2="unten" />
        <g v-for="v in vTicks" :key="`vt${v}`">
          <line
            class="bw-raster"
            :x1="FLAECHE.links"
            :x2="FLAECHE.breite - FLAECHE.rechts"
            :y1="yVon(v, bereichen.vMin, bereichen.vMax)"
            :y2="yVon(v, bereichen.vMin, bereichen.vMax)"
          />
          <text
            class="bw-zahl"
            :x="FLAECHE.links - 6"
            :y="yVon(v, bereichen.vMin, bereichen.vMax) + 4"
            text-anchor="end"
          >
            {{ v }}
          </text>
        </g>
        <g v-for="t in zeiten" :key="`vx${t}`">
          <line class="bw-achse" :x1="xVon(t)" :x2="xVon(t)" :y1="unten" :y2="unten + 4" />
          <text class="bw-zahl" :x="xVon(t)" :y="unten + 16" text-anchor="middle">{{ t }}</text>
        </g>
        <text class="bw-beschriftung" :x="FLAECHE.links + 4" :y="10">{{ achseGeschwindigkeit }}</text>
        <text class="bw-beschriftung" :x="FLAECHE.breite - FLAECHE.rechts" :y="FLAECHE.hoehe - 2" text-anchor="end">
          {{ achseZeit }}
        </text>
        <polyline class="bw-linie bw-linie-v" :points="vLinie" />
        <circle v-for="(p, i) in vPunkte" :key="`vp${i}`" class="bw-marke-v" :cx="p.x" :cy="p.y" r="3.5" />
      </svg>
    </template>

    <template v-if="zeigeWeg">
      <p class="bw-titel">{{ wegTitel }}</p>
      <svg class="bw-diagramm" :viewBox="`0 0 ${FLAECHE.breite} ${FLAECHE.hoehe}`" role="img" :aria-label="altWeg">
        <line class="bw-achse" :x1="FLAECHE.links" :y1="FLAECHE.oben" :x2="FLAECHE.links" :y2="unten" />
        <line class="bw-achse" :x1="FLAECHE.links" :y1="unten" :x2="FLAECHE.breite - FLAECHE.rechts" :y2="unten" />
        <g v-for="s in sTicks" :key="`st${s}`">
          <line
            class="bw-raster"
            :x1="FLAECHE.links"
            :x2="FLAECHE.breite - FLAECHE.rechts"
            :y1="yVon(s, bereichen.sMin, bereichen.sMax)"
            :y2="yVon(s, bereichen.sMin, bereichen.sMax)"
          />
          <text
            class="bw-zahl"
            :x="FLAECHE.links - 6"
            :y="yVon(s, bereichen.sMin, bereichen.sMax) + 4"
            text-anchor="end"
          >
            {{ s }}
          </text>
        </g>
        <g v-for="t in zeiten" :key="`sx${t}`">
          <line class="bw-achse" :x1="xVon(t)" :x2="xVon(t)" :y1="unten" :y2="unten + 4" />
          <text class="bw-zahl" :x="xVon(t)" :y="unten + 16" text-anchor="middle">{{ t }}</text>
        </g>
        <text class="bw-beschriftung" :x="FLAECHE.links + 4" :y="10">{{ achseWeg }}</text>
        <text class="bw-beschriftung" :x="FLAECHE.breite - FLAECHE.rechts" :y="FLAECHE.hoehe - 2" text-anchor="end">
          {{ achseZeit }}
        </text>
        <polyline class="bw-linie bw-linie-s" :points="sLinie" />
      </svg>
    </template>

    <p class="bw-titel">{{ tempoTitel }}</p>
    <div v-if="konstant" class="bw-steller">
      <button type="button" :aria-label="weniger" @click="aendernKonstant(-1)">−</button>
      <span class="bw-wert" aria-live="polite">{{ fuelle(tempoKonstantLabel, { v: zahl(aktuelleKonstante) }) }}</span>
      <button type="button" :aria-label="mehr" @click="aendernKonstant(1)">+</button>
    </div>
    <div v-else class="bw-reihe">
      <div v-for="t in sekunden" :key="t" class="bw-steller bw-steller-schmal">
        <span class="bw-wert">{{ fuelle(tempoLabel, { t: String(t) }) }}</span>
        <span class="bw-knoepfe">
          <button type="button" :aria-label="fuelle(weniger, { t: String(t) })" @click="aendern(t, -1)">−</button>
          <output :aria-label="fuelle(tempoLabel, { t: String(t) })">{{ tempo[t] }}</output>
          <button type="button" :aria-label="fuelle(mehr, { t: String(t) })" @click="aendern(t, 1)">+</button>
        </span>
      </div>
    </div>
    <p>
      <button type="button" class="bw-zurueck" @click="ruecksetzen">{{ zuruecksetzen }}</button>
    </p>

    <details>
      <summary>{{ tabelleTitel }}</summary>
      <table>
        <thead>
          <tr>
            <th scope="col">{{ spalteZeit }}</th>
            <th scope="col">{{ spalteGeschwindigkeit }}</th>
            <th scope="col">{{ spalteWeg }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in zeiten" :key="t">
            <th scope="row">{{ t }}</th>
            <td>{{ zahl(tempo[t] ?? 0) }}</td>
            <td>{{ zahl(weg[t] ?? 0) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>

<style scoped>
.bewegung {
  --bw-v: #a14a00;
  --bw-s: #1d4f9c;
}

@media (prefers-color-scheme: dark) {
  .bewegung {
    --bw-v: #ffa45c;
    --bw-s: #8ab4ff;
  }
}

.bw-titel {
  margin-block: 0.75rem 0.25rem;
  font-weight: 600;
}

.bw-bahn {
  position: relative;
  height: 2.5rem;
  max-width: 28rem;
}

.bw-schiene {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.4rem;
  border-bottom: 3px solid var(--page-text);
}

.bw-punkt {
  position: absolute;
  bottom: 0.6rem;
  width: 0.9rem;
  height: 0.9rem;
  margin-left: -0.45rem;
  border-radius: 50%;
  background: var(--bw-s);
  border: 2px solid var(--page-background);
}

.bw-start {
  border-radius: 0;
  outline: 2px solid var(--page-text);
}

.bw-diagramm {
  display: block;
  width: 100%;
  max-width: 28rem;
  height: auto;
}

.bw-achse {
  stroke: var(--page-text);
  stroke-width: 1.5;
}

.bw-raster {
  stroke: var(--page-border);
  stroke-width: 1;
}

.bw-zahl {
  fill: var(--page-text);
  font-size: 10px;
}

.bw-beschriftung {
  fill: var(--page-text);
  font-size: 11px;
  font-weight: 600;
}

.bw-linie {
  fill: none;
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.bw-linie-v {
  stroke: var(--bw-v);
}

.bw-linie-s {
  stroke: var(--bw-s);
}

.bw-marke-v {
  fill: var(--bw-v);
  stroke: var(--page-background);
  stroke-width: 1;
}

.bw-reihe {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bw-steller {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.bw-steller-schmal {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  min-width: 6.5rem;
}

.bw-knoepfe {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.bw-knoepfe output {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.bewegung button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0 0.5rem;
  border: 1px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-surface);
  color: var(--page-text);
  cursor: pointer;
}

.bewegung button:focus-visible {
  outline: 3px solid var(--page-accent);
  outline-offset: 2px;
}

.bw-wert {
  font-size: 0.9rem;
}

details {
  margin-top: 0.5rem;
}

table {
  margin-top: 0.5rem;
  border-collapse: collapse;
}

th,
td {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--page-border);
  text-align: right;
}
</style>
