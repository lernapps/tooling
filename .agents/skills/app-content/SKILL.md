---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium (G9), Klasse 6, Mathematik. Strand `mathematik/arithmetik` of the learning map
  (`https://lernapps.net/apps/map/mathematik.json`); the map places the competencies in Einheit 6.1.
- Lehrplan: Kerncurriculum Mathematik Gymnasium Sekundarstufe I, Hessisches Kultusministerium,
  `https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf`. Not read
  (no PDF reader here): "not checked"; grade and unit come from the map.
- The creator named no material of their own; the app follows the map's competencies.
- Scope: Brüche als Anteile, Erweitern, Kürzen, Vergleichen; Nenner 2 bis 20, nur echte Brüche. Not in it: Rechnen mit
  Brüchen, Dezimalbrüche, Prozent, gemischte Zahlen.

## Competencies

Chapter `brueche` (`src/brueche/`), wording of the map, unchanged:

- `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen.
  - Page `anteile` (`src/brueche/anteile.yaml`). Exercises: `bruch-faerben` (component), `bild-zu-bruch`,
    `pizza-stuecke`.
- `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen.
  - Page `erweitern`. Exercises: `erweitern-ueben`, `wert-gleich`, `faktor-finden`.
  - Page `teilbarkeit-wiederholung`: recap of `mathematik/teilbarkeit`, no exercise, no `competencies`.
  - Page `kuerzen`. Exercises: `kuerzen-ueben`, `vollstaendig-gekuerzt`, `groesster-teiler`.
  - Page `vergleichen`. Exercises: `groesser-bruch`, `vergleichen-ueben`, `brueche-ordnen`.
  - The map has one competency for the pages 2 to 4, so all three carry the same id.

## Content structure

- Page order in `src/brueche/chapter.yaml`: `anteile`, `erweitern`, `teilbarkeit-wiederholung`, `kuerzen`,
  `vergleichen`.
- Every page has the sections in this order, ids fixed (a section a page does not need is left out):
  `einstieg` (Ziel in one sentence "Danach kannst du …", how it builds on the page before, an everyday picture),
  `erklaerung` (the idea with a figure or the component, a `definition` for a new term, the misreading named),
  `ausprobieren` (only where learners operate a component (`BruchStreifen` or `BruchUmteilen`)), `beispiel` (an `example` box with
  numbers, each step with its reason), `uebung` (last).
- Exercises in `uebung` go from recognising to applying to a new situation (a story or the reverse question).
- Length: a page reads in about five minutes; three to four exercises.
- One new idea per page; nothing of a later page, also not in wrong options.

## Terminology

- Used: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Anteil, gleich große Stücke, erweitern, kürzen, gleichwertige
  Brüche, gleichnamig, vollständig gekürzt. Addressing: "du". Plain, short sentences.
- Avoided: "Kuchenstück" for the formal definition (the Ganze is an Streifen); "Bruchzahl" and gemischte Zahlen
  (later); "ggT" as a term (only "größte Zahl, durch die beide teilbar sind").
- Notation: `\frac{a}{b}` in formulas; "3/4" in running text is written `$\frac{3}{4}$`. Fractions equal in value are
  joined with "=".
- Glossary: a `definition` block for Bruch, Zähler, Nenner (page `anteile`), erweitern (page `erweitern`), kürzen
  (page `kuerzen`), gleichnamig (page `vergleichen`).

## Exercise patterns

- Teil eines Ganzen (assign/represent): component `BruchFaerben` (`src/components/BruchFaerben.vue`), id `bruch-faerben`
  on `anteile`. Fixed: a strip of b equal pieces; varies: seed draws b (3 to 12) and a (1 to b-1, never a = b-a).
  Answer: number of coloured pieces. Mistakes with reasons: b-a coloured, b coloured.
- Bruch zum Bild (recognise): `single-choice` with the strip image as `material`; wrong options are typical mistakes
  (white pieces counted, numerator and denominator swapped). Example: `bild-zu-bruch`.
- Situation → Bruch (apply): `generated` with a story from `src/data/situationen.yaml` (records `ding`, `teile`, `verb`),
  answer the numerator of the rest. Example: `pizza-stuecke`.
- Erweitern (compute): `generated` `erweitern-ueben` (a/b with factor k in 2 to 5, answer the new numerator; mistakes:
  k added, numerator unchanged, denominator given). Reverse question: `number` `faktor-finden`. Judge: `true-false`
  `wert-gleich`.
- Kürzen (compute): `generated` `kuerzen-ueben` from `src/data/kuerzen.yaml` (records `zaehler`, `nenner`, `faktor`; answer
  `zaehler / faktor`; mistakes: factor subtracted, numerator unchanged, denominator given). Judge: `true-false`
  `vollstaendig-gekuerzt`. Largest divisor: `number` `groesster-teiler` with the mistakes 2 and 3 explained.
- Vergleichen (judge/order): `single-choice` `groesser-bruch` (typical mistake "größerer Nenner = größerer Bruch" in
  `info`), `generated` `vergleichen-ueben` from `src/data/bruchpaare.yaml` (records `a`, `b`, `c`, `d`, `n`, `gross`, `klein`:
  the two numerators at the common denominator n; the answer is `gross`), `ordering` `brueche-ordnen`.
- Recap (`teilbarkeit-wiederholung`): a `recap` page of definition, text and table, no exercise.
- Rule for numbers: tasks must not make a mistake equal the answer (build tests 200 seeds). A new record in a data file
  is checked by hand: mistakes differ from the answer.

## Figures

- Streifen: a rectangle is the Ganze, divided in equal pieces; coloured pieces (blue, `#2f5fb3`, with a diagonal
  hatching as second mark, white is not coloured) are the Zähler, all pieces the Nenner. Static figures are SVG files in
  `src/images/` (own drawing, source `eigene Zeichnung`, licence `CC-BY-4.0`; `streifen-drei-von-acht.svg` explains,
  `streifen-fuenf-von-acht.svg` is the task of `bild-zu-bruch`), viewBox 600 px wide, readable at 360 px.
- Component `BruchStreifen` (`src/components/BruchStreifen.vue`): the explorer of page `anteile`; learners set the number of
  pieces (2 to 12) and colour pieces; the fraction follows.
- Component `BruchUmteilen` (`src/components/BruchUmteilen.vue`): the explorer of pages `erweitern`, `kuerzen`,
  `vergleichen`, with `mode`: two strips of the same length, the same coloured length in a finer division
  (erweitern, factors 2 to 5), a coarser one (kürzen, only factors that divide both numbers; the others are grey), or two
  fractions in the common denominator (vergleichen). The text on the page names each button and what to look at.
- `alt` names what is given, never the answer; the caption says what to look at.
- A figure in an exercise shows only what is given (`explainer-figure-hides-answer`).

## Sources

- Learning map `https://lernapps.net/apps/map/mathematik.json` (competency wording, Einheit).
- Wikipedia "Bruchrechnung", `https://de.wikipedia.org/wiki/Bruchrechnung` (CC BY-SA): opened and used for facts only,
  never for sentences. Listed in `sources` of `src/app.yaml`.
- Not verified (no 200): Serlo pages, other Wikipedia articles. Do not link them.
- Figures and texts are own work.

## Adding a chapter or round

1. Find the competency in the map (`https://lernapps.net/apps/map/mathematik.json`, strand `arithmetik`); use its id
   and wording, never a new one. Prerequisites the app does not practise: a recap page (`recap:`) or a link
   `https://lernapps.net/apps/map/mathematik/c/<id>/`.
2. New folder `src/<chapter>/` with `chapter.yaml`; list it in `src/app.yaml` `chapters`.
3. New page `src/<chapter>/<page>.yaml` after the pattern of `src/brueche/anteile.yaml`: sections as above.
4. Exercises from the patterns above; draw numbers from data files in `src/data/`.
5. Figures as SVG in `src/images/` or the components `BruchStreifen` and `BruchUmteilen`; update this guide when a pattern is new.
   1 bis 3 ihrer Übungen in `selfAssessment` (`src/brueche/chapter.yaml`) aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt.
6. `npx --no -- lernapps check`, then commit on the branch the plan names.

## Rules learned from mistakes

None yet.
