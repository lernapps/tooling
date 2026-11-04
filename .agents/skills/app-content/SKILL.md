---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium (G9), Klasse 6, Mathematik. Orientation: Kerncurriculum Mathematik Gymnasium Sekundarstufe I, Hessisches Kultusministerium (2011), and Lehrplan Mathematik G9 (2016), Einheit 6.1, as the learning map places it (`he-gymnasium`). Address: https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf. The PDF was not read; the unit comes from the map ("not checked").
- The app has no material of the creator. Strand `mathematik/arithmetik` of the learning map.

## Competencies

One chapter `brueche` (`src/brueche/`), five pages, in the order of the map's `requires`:

- `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen.
  - `anteile` (page 1): exercises `teile-gleich` (single-choice), `drittel-erkennen` (single-choice), `gleiche-teile` (true-false).
  - `zaehler-nenner` (page 2): exercises `bruch-ablesen` (single-choice), `bruch-ausmalen` (exercise component BruchFeld), `zaehler-nenner-wahl` (true-false).
- `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen.
  - `erweitern` (page 3): `gleichwertig-waehlen` (single-choice), `erweitern-zaehler` and `erweitern-nenner` (generated, `src/data/erweitern.yaml`).
  - `kuerzen` (page 4): `ganz-gekuerzt` (single-choice), `kuerzen-schritt` and `kuerzen-ganz` (generated, `src/data/kuerzen.yaml`).
  - `vergleichen` (page 5): `reihenfolge` (ordering), `vergleichen-ueben` (generated, `src/data/vergleichen.yaml`).

Prerequisites the app does not practise: `natuerliche-zahlen`, `teilbarkeit`. The text links `https://lernapps.net/apps/map/mathematik/c/<id>/`; no recap page.

## Content structure

- Every page has the section ids `einstieg`, `erklaerung`, `beispiel`, `uebung`; pages with a component also `ausprobieren` (after `erklaerung`). Titles say what the section does ("Anschaulich erklärt", "Beispiel", "Übung"). A section a page does not need is left out.
- `einstieg`: an everyday situation (Pizza, Schokolade, Bus) in 2 to 4 short sentences, then what learners know. `erklaerung`: the new idea, one figure, at most one `definition`. `beispiel`: one `example` box. `uebung`: two to four exercises.
- One new step per page. Page 1 and 2 only fractions with parts of one whole; page 3 only expanding; page 4 only reducing; page 5 only comparing. Numerators and denominators up to 24, proper fractions only (numerator smaller than denominator); an improper fraction is at most named in one sentence on page 2.
- Length: a page reads in about 5 minutes.

## Terminology

- Addressed with "du". Terms: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Anteil, gleichwertig, kürzen, erweitern, gemeinsamer Teiler. "Gleichwertig" for fractions with the same value (not "gleich").
- Fractions in running text as `$\frac{3}{8}$`; spoken forms ("ein Drittel", "drei Achtel") at first use. Words "Teiler" and "teilbar" as in Klasse 5.
- Glossary (`definition` blocks): Bruch (page 1), Zähler and Nenner (page 2), gleichwertige Brüche (page 3), kürzen (page 4).
- Avoid "oben/unten" alone for Zähler/Nenner; always name the term as well.

## Exercise patterns

- *Bild zuordnen / beurteilen* (page 1, 2): `single-choice` with images or a described strip in the question `material`; every wrong option has an `info` that names the mistake (unequal parts, wrong number of parts counted, Zähler and Nenner swapped). Example: page `anteile`, `drittel-erkennen`.
- *Bruch ausmalen* (page 2): exercise component `BruchFeld`, "Färbe z/n"; checks only the number of coloured parts.
- *Lückenbruch* (page 3): `generated` from `src/data/erweitern.yaml`: `erweitern-nenner` "a/b wird mit k erweitert. Wie lautet der neue Nenner?" and `erweitern-zaehler` "a/b = ?/n" (new numerator). Mistakes: factor only on the denominator, addition of the difference. Fields: `a`, `b`, `k`, `z` (new numerator), `n` (new denominator).
- *Kürzen* (page 4): `generated` from `src/data/kuerzen.yaml` (fields `a`, `b`, `t` greatest common divisor, `z`/`n` fully reduced, `s` a smaller common divisor, `zs`/`ns` reduced by `s`): one step with a given divisor, and fully reduced. Mistakes: subtracted instead of divided, divided only one part, stopped too early.
- *Größer-kleiner* (page 5): `ordering` of fractions with the same denominator, `generated` from `src/data/vergleichen.yaml` (fields `a`/`b` and `c`/`d`, common denominator `n`, expanded numerators `x`/`y`, answer `r`, answer `m` of the larger-denominator mistake; the answer is a `choice` of three texts). Mistake: larger denominator = larger fraction.
- Every generated task has `hint` and `steps` that use the task's numbers and say why (`explainer-steps-explain`).

## Figures

- Strip pictures as SVG in `src/images/`: one rectangle (360 px wide viewBox scaled), the whole; equal parts divided by thin lines; coloured parts blue (`#9ecae1`-like, with a dark outline and a hatch pattern as second mark); label (e.g. "Ganzes") above the strip. Same look on every page. A component uses the CSS variables of the explainer, never fixed surface colours.
- Two strips compared (expand / reduce) are stacked, same length, each with a visible label ("vorher", "erweitert mit 3").
- Every figure has `alt` (what is drawn) and `caption` (what to look at). Origin `eigene Zeichnung`, licence `CC-BY-4.0`.
- Components: `BruchFeld` (exercise, Färbe z/n), `BruchErweitern` (explore, factor or divisor). Both have a text for readers without JavaScript; they never show the solution of a task.

## Sources

- The mathematics is standard school content of Klasse 6; no sentence is copied from a source. Second sources (for example serlo.org) were not opened and are not cited. Curriculum: see above, not checked.
- No videos. Nothing from the creator's material.

## Adding a chapter or round

1. Pick the competency on the learning map (`https://lernapps.net/apps/map/mathematik/`), check its `requires`.
2. Add a folder `src/<chapter>/` with `chapter.yaml` and pages; add the chapter to `chapters` in `src/app.yaml`.
3. Pages with sections as in "Content structure"; competency ids on each page; figures as in "Figures".
   1 bis 3 ihrer Übungen in `selfAssessment` (`src/brueche/chapter.yaml`) aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt.
4. Exercises from the patterns above; new data in `src/data/<name>.yaml`.
5. Update this guide and the plan, `npx --no -- lernapps check`, commit.

## Rules learned from mistakes

None yet.
