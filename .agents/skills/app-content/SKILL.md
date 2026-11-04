---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium, Klasse 6. Strand `mathematik/arithmetik` of the learning map (https://lernapps.net/apps/map/mathematik/).
- Orientation: Kerncurriculum Mathematik Gymnasium (Sekundarstufe I), Hessisches Kultusministerium, 2021,
  https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf. Not read (no
  PDF tool when the app was built): cite no unit of it. Grade and order follow the learning map (KMK-Bildungsstandards
  Mathematik ESA und MSA, 2022).
- The creator has no material of their own. Learners know the natural numbers, the times tables and divisibility;
  fractions are new. Calculating with fractions is out of scope.

## Competencies

Chapter `brueche` (`src/brueche/`), ids of the map, wording of the map:

- `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen.
  - `anteile` (`src/brueche/anteile.yaml`): exercises `anteil-lesen`, `gleiche-teile`, `nenner-bestimmen`, `zaehler-bestimmen`.
  - `darstellen` (`darstellen.yaml`): exercises `zahlenstrahl-lesen`, `kreis-lesen`, `bruch-wort`, `striche-zaehlen`.
- `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen.
  - `erweitern` (`erweitern.yaml`): exercises `neuen-zaehler`, `neuen-nenner`, `gleichwertig-finden`, `erweitern-aendert-wert`.
  - `kuerzen` (`kuerzen.yaml`): exercises `kuerzen-zaehler`, `kuerzen-nenner`, `vollstaendig-gekuerzt`, `kuerzen-gemeinsamer-teiler`.
  - `vergleichen` (`vergleichen.yaml`): exercises `groesseren-finden`, `stammbrueche-ordnen`, `gleicher-nenner`, `groesserer-nenner`.
- Recap page `wiederholung-teilbarkeit` (`recap: mathematik/teilbarkeit`), no exercise. `natuerliche-zahlen` is only
  linked from page `anteile`.

## Content structure

- Pages in order of `src/brueche/chapter.yaml`: anteile, darstellen, erweitern, wiederholung-teilbarkeit, kuerzen,
  vergleichen. About 6 pages for two weeks of lessons.
- Every page has the sections, with these ids and in this order, a section left out when the page does not need it:
  `einstieg` (an everyday situation the learners know), `anschaulich` (figure and explanation), `ausprobieren` (the
  component `Bruchstreifen`, only where learners can operate something), `merke` (definition, rule, a box `example`),
  `uebung`. Titles fit what the section does ("Ausprobieren" only with the component).
- One new step per page. Echte Brüche only (numerator smaller than denominator); no mixed numbers, no improper
  fractions, no calculating with fractions.
- Short sentences, "du".

## Terminology

- Use: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Bruchteil, Anteil, gleichwertig, kürzen, erweitern, Bruchstreifen.
- Write a fraction in text as `$\frac{3}{4}$`, spoken "drei Viertel"; always "Zähler" above, "Nenner" below.
- Avoid "Stück" for the part of a Bruch except in everyday situations (Pizza, Schokolade); in the figures: "Teil".
- Glossary: `definition` blocks, one per term, on the page where the term first appears (Bruch, Zähler, Nenner on
  `anteile`; gleichwertig and erweitern on `erweitern`; Teiler and gemeinsamer Teiler on `wiederholung-teilbarkeit`;
  kürzen on `kuerzen`; gleichnamig on `vergleichen`).

## Exercise patterns

Every wrong answer gets a message that names the mistake and where to look, never the solution (`info` of an option,
`mistakes` of a `generated`). The pages have no extra `examples`: wrong options and mistakes already count as rejected.

- *Anteil benennen* (`generated`): n equal parts, z eaten; ask for the denominator or the numerator. Mistakes: numerator
  and denominator swapped, the rest (n − z). Example: `src/brueche/anteile.yaml`, `nenner-bestimmen`.
- *Wahr oder falsch* (`true-false`): a statement with its reason in the feedback ("Die Teile müssen gleich groß sein").
- *Bild lesen* (`single-choice` with `material` figure): an image of `src/images/` is shown, the options are real
  mistakes (swapped, empty parts counted, unequal parts, counting ticks instead of intervals) each with `info`.
- *Bruch zuordnen* (`matching`): fraction to words ("drei Viertel").
- *Erweitern* (`generated`, data `src/data/erweitern.yaml`, fields z, n, k, zNeu, nNeu): ask for the new numerator or
  denominator. Mistakes: added k, only the denominator multiplied.
- *Kürzen* (`generated`, data `src/data/kuerzen.yaml`, fields z, n, t, zNeu, nNeu): ask for the new numerator or
  denominator. Mistakes: subtracted t, only one number divided, not fully reduced. Plus `single-choice` "Welcher Bruch
  ist vollständig gekürzt?".
- *Vergleichen* (`generated` with `compare: { choice: [...] }`, data `src/data/vergleichen.yaml`, fields z1, n1, z2, n2,
  g = the right choice, d = the choice of "larger denominator", zr = the choice of "larger numerator", nGem, a1, a2 for
  the steps; every record has d and zr different from g): which fraction is larger. Mistakes: larger denominator,
  compared numerators only. Plus `ordering` of unit fractions (`stammbrueche-ordnen`) and two `true-false`.
- *Zahlenstrahl lesen* (`single-choice` with `material` figure, `darstellen.yaml`): wrong options count ticks instead
  of intervals, or count the tick at 0. *Striche zählen* (`generated`): ticks given, denominator asked (mistakes: ticks,
  ticks minus 2).
- Ranges: numerator smaller than denominator; denominators 1 to 10 on free strips (`maxNenner: 10`); reducing and expanding with denominators
  up to 100; the factor or divisor fits the task (`where`).
- A task's figure shows what is given, never the answer; no counter or caption states what is asked.

## Figures

- Own drawings (SVG) in `src/images/`, `source: eigene Zeichnung`, `licence: CC-BY-4.0`, always with `alt` and a
  caption that says what to look at.
- Conventions everywhere: coloured part = blue with a hatched pattern, empty part = white, the whole is the whole strip
  or circle, parts are separated by dark lines, the strip is 600 units wide so that equal strips can be compared.
- The component `Bruchstreifen` (`src/components/Bruchstreifen.vue`, logic in `Bruchstreifen.ts`) has four modes:
  `anteil`, `erweitern`, `kuerzen`, `vergleichen`. It checks nothing and is no exercise; the page has its own
  exercises. Every page that uses it says in the text what its controls do. `nojs` describes task and result.
- The built-in figures `bar` and `hundred-grid` are not used: they show percent.
- The SVGs in `src/images/` are written by `.vibe/gen-images.mjs` (`node .vibe/gen-images.mjs` rewrites them): add a
  figure there, run it, and use the file as `images/<name>.svg`. Strips: `streifen-*`, circles `kreis-*`, number lines
  `zahlenstrahl-*`, two labelled strips `erweitert-*`, `gekuerzt-*`, `vergleich-*` (the labels in the image name the
  fractions). Figures of an exercise never carry the answer as a label (`zahlenstrahl-3-von-5`, `kreis-5-von-6`).
- `Bruchstreifen` props: `modus` (`anteil` | `erweitern` | `kuerzen` | `vergleichen`), `maxNenner` (the pages use 10),
  `zaehler`/`nenner` (the given fraction; in `vergleichen` the upper strip at the start), `zaehler2`/`nenner2` (the
  lower strip at the start), `faktoren` (the numbers learners choose, the first is the start, always 1), `texte` (all
  labels, in the page's language). Free strips start with one part and nothing coloured; changing the division
  makes all parts white.

## Sources

- Learning map and Lehrplan as under Curriculum. One further-reading link, used in every question's `links` and in
  `sources` of `src/app.yaml`: "Bruchrechnung (Wikipedia)", https://de.wikipedia.org/wiki/Bruchrechnung, opened on
  2026-11-04 (it covers Zähler, Nenner, Erweitern, Kürzen, gleichnamig). No other second source opened or linked; none
  may be cited before its page is opened and checked. The content comes from the author's subject knowledge, not from copied sentences.
- The creator's material: none.

## Adding a chapter or round

1. New page: `src/brueche/<id>.yaml` (or a new chapter folder with `chapter.yaml`, listed in `src/app.yaml`), listed in
   `pages` of its `chapter.yaml`, ids lowercase with hyphens.
2. `competencies:` one id of the map (`https://lernapps.net/apps/map/mathematik.json`), or `recap:` for a page without
   exercise; a prerequisite the app does not practise gets a recap page or a link to
   `https://lernapps.net/apps/map/mathematik/c/<id>/`.
3. The sections of "Content structure", in that order, with their ids.
4. Exercises from "Exercise patterns"; tasks with computed steps get a record in `src/data/<name>.yaml` that holds
   every number of the steps; every wrong option and mistake has its message.
5. Figures in `src/images/` with the conventions above; `alt` and caption.
6. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt (`chapter.yaml`: ein Schritt je Seite, nur Übungen, die ohne die Seite verständlich sind; eine `generated`-Übung darf zweimal stehen).
7. `npx --no -- lernapps check`, then commit.

## Rules learned from mistakes

None yet.
