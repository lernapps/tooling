---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Physik, Klasse 8, Gymnasium in NRW. Learners know einfache Stromkreise mit Batterie und Lampe aus der Grundschule; Stromstärke und Spannung sind neu.
- Orientation: the learning map `physik/elektrizitaetslehre` (https://lernapps.net/apps/map/physik/), whose source is KMK, Weiterentwickelte Bildungsstandards Physik (MSA), Beschluss vom 16.12.2004 i.d.F. vom 13.06.2024. The Kernlehrplan Physik Sek I Gymnasium NRW (QUA-LiS) was not readable and is "not checked": cite no unit of it.
- The creator has no own material. If they give some later, it stays local and takes precedence over this guide's order.

## Competencies

One page per competency, ids of the map in `competencies` on the page. Chapter folder / page file / "Ich kann …":

- `stromkreis/` (Kapitel 1, Der Stromkreis)
  - `einfacher-stromkreis`: einen einfachen Stromkreis aus Batterie, Lampe und Kabeln aufbauen und erklären, warum er geschlossen sein muss.
  - `leiter-nichtleiter`: Leiter und Nichtleiter unterscheiden und Beispiele nennen.
  - `schalter`: erklären, wie ein Schalter einen Stromkreis öffnet und schließt.
  - `schaltzeichen`: einen Stromkreis als Schaltplan mit Schaltzeichen zeichnen und einen Schaltplan lesen.
- `stromstaerke-spannung/` (Kapitel 2)
  - `stromstaerke`: die Stromstärke als Maß dafür erklären, wie viel Strom fließt, und sie in Ampere angeben.
  - `stromstaerke-messen`: die Stromstärke mit einem Amperemeter richtig messen.
  - `spannung`: die Spannung als Antrieb des Stroms erklären und sie in Volt angeben.
  - `spannung-messen`: die Spannung mit einem Voltmeter richtig messen.
- `schaltungen/` (Kapitel 3)
  - `reihenschaltung`: eine Reihenschaltung aufbauen und erklären, was passiert, wenn ein Bauteil ausfällt.
  - `parallelschaltung`: eine Parallelschaltung aufbauen und erklären, was passiert, wenn ein Zweig ausfällt.
- `sicherheit/` (Kapitel 4)
  - `gefahren-des-stroms`: erklären, warum Strom aus der Steckdose gefährlich ist und Strom aus einer Batterie nicht.
  - `sicher-mit-strom-umgehen`: Regeln für den sicheren Umgang mit Strom nennen und anwenden.

Exercise ids: `<seitenkürzel>-<nummer>`, e.g. `stromkreis-1`, `stromkreis-2`; stable once published.
Out of scope (map: Klasse 9–10): Widerstand, ohmsches Gesetz, Rechnen in Schaltungen, Gesamtwiderstand, Ladung und Elektronenmodell, Wirkungen des Stroms, Hausinstallation und Sicherungen.

## Content structure

Every page has the same sections in this order, fixed ids, titles that say what the section does on that page; a section a page does not need is left out:

1. `einstieg`: the goal in the learner's words ("Danach kannst du …"), how it builds on the page before or on what they know (Grundschule, Alltag). 3–5 sentences.
2. `erklaerung`: one new idea, with a drawn figure or `labelled-figure`; the text answers before the figure what it shows, what its marks mean and how it leads to the statement; names the common misreading (see Terminology and the plan's Notes).
3. `beispiel`: one `example` box, step by step with the numbers or parts of the figure.
4. `uebung`: 3–5 exercises, going from recognising to applying to a new situation.

Length: a page reads in about 5 minutes. Address: "du". Plain German, short sentences. One new idea per page; nothing of a later page, also not among options.

## Terminology

- Use: Stromkreis, Stromstärke (Formelzeichen $I$, Einheit Ampere, A; Milliampere, mA), Spannung ($U$, Volt, V), Amperemeter, Voltmeter, Leiter, Nichtleiter (Isolator), Reihenschaltung, Parallelschaltung, Schaltplan, Schaltzeichen.
- Say "Isolator" only in the brackets after "Nichtleiter" and where the learners know the word.
- Avoid: "Strom verbrauchen" (Strom wird nicht verbraucht; Energie wird umgewandelt, but energy is not taught here), "Spannung fließt", "Stromspannung".
- Direction: technische Stromrichtung (von + nach −); arrows in figures show it. Do not mention Elektronen.
- Glossary: a `definition` block on the page where the term is first needed, for Stromkreis, Leiter, Nichtleiter, Stromstärke, Spannung, Amperemeter, Voltmeter, Reihenschaltung, Parallelschaltung; wording one sentence, plain.

## Exercise patterns

All in the page's `uebung`; types of the quiz (`single-choice`, `multiple-choice`, `true-false`, `number`, `ordering`, `matching`) and `generated`. Every wrong option says why it does not fit; correct answers other than the author's are accepted (checks the property, not a model solution).

- **Weg verfolgen / Vorhersage:** `single-choice` with a circuit figure in `material`; reason in each option's `info`. Example: "Welche der drei Schaltungen lässt die Lampe leuchten?" Pages: einfacher-stromkreis, schalter, reihenschaltung, parallelschaltung.
- **Beispiele nennen:** `multiple-choice` of things of one kind, a reason on every option (page `leiter-nichtleiter`, `leiter-1`: which objects conduct; page `gefahren-des-stroms`, `gefahren-3`: which situations can cause an accident).
- **Wahr oder falsch mit Grund:** `true-false`, reason in the feedback; one statement targets one misconception from the plan (e.g. "Ein Schalter wirkt nur auf die Lampe direkt dahinter.").
- **Zuordnen:** `matching` with the pairs in the exercise itself (page `schaltzeichen`: described shape ↔ Bauteil; example `schaltzeichen-1`). No `pairsFrom: material`: the runtime then requires the `alt` to name every marker, which gives the answer away.
- **Umrechnen:** `generated` for mA ↔ A on page `stromstaerke`, values with sensible ranges (a lamp 50–500 mA), typical mistakes with messages ("Du hast mit 100 statt mit 1000 gerechnet").
- **Skala ablesen:** `number` with a drawn scale as `material`, tolerance, wrong values with a hint (Messbereich beachten); the figure does not name the value. Pages stromstaerke-messen, spannung-messen.
- **Messgerät anschließen:** `single-choice` with two circuit figures; feedback names the consequence (Amperemeter parallel: Kurzschluss; Voltmeter in Reihe: Lampe bleibt dunkel).
- **Messwerte ablesen und ableiten:** a `table` of example values (Messstelle, Messwert) on pages `stromstaerke-messen`, `reihenschaltung`, `parallelschaltung`; the page derives the rule from the table (equal current in series, voltage divides, voltage equal in parallel, current divides) and exercises ask for the rule in a new situation (`single-choice`).
- Not used: `ordering` (no step order with a fixed, sourced sequence; first-aid steps are not taught because no source was read).
- **Situation beurteilen:** `multiple-choice` on everyday situations (Sicherheit), a reason on each option.

## Figures

- Own SVG drawings in `src/images/<seite>-<nummer>.svg`; `source: eigene Zeichnung`, `licence: CC-BY-4.0`. Every figure has `alt` (what it shows) and `caption` (what to look at).
- Conventions in all figures: Batterie on the left, Schaltzeichen nach DIN (Batterie, Lampe, Schalter, Leitung, Amperemeter A, Voltmeter V), arrow = technische Stromrichtung, components labelled visibly (L1, L2, A, V), lines in black, markers numbered. Works at 360 px: portrait layouts, no wide figures.
- A figure shows what is given, never the answer (`explainer-figure-hides-answer`): no measured values in a task's figure or caption that the task asks for.
- Circuit figures use `labelled-figure` where the parts are explained; plain `figure` with `image` otherwise. Comparisons (Reihe/Parallel) are two figures with visible labels "Reihenschaltung" / "Parallelschaltung".
- Measured values appear in `table` blocks (caption, header), never in the image. Table cells are quoted strings when they contain a comma ("0,25 A").
- Files: `leiter-1`, `schalter-1/-2` (explanation), `schalter-3a/b/c` (exercises, also reused on `schaltzeichen`), `schaltzeichen-1`, `schaltzeichen-3`, `strom-1..5`, `spannung-1..4`, `reihe-1/-2`, `parallel-1/-2`, `stromkreis-1`, `stromkreis-2a/b/c`. Dials (`strom-3/-4`, `spannung-3/-4`) are drawn with long strokes every 0.2 A or 2 V and a short stroke between; the example dial and the exercise dial show different values.
- The `alt` of an exercise figure describes the drawing (which wire is in two pieces), because the exercise must be solvable without seeing it.

## Sources

- Learning map `physik/elektrizitaetslehre` and its source, KMK Bildungsstandards Physik MSA 2024 (address opened, content not read).
- Second explanations (facts, never sentences): de.wikipedia.org Stromkreis, Elektrische_Stromstärke, Elektrische_Spannung, Reihenschaltung, Parallelschaltung, Elektrischer_Leiter, Amperemeter, Voltmeter (introductory paragraphs read), Elektrischer_Schlag (read for the safety chapter: causes of accidents, severity depends on current and duration, 50 V / 12 V statements, moisture).
- Not from a source, standard values: 1,5 V (Mignon), 9 V (Block), 230 V (Steckdose), handy charging current about 2 A is from Elektrische_Stromstärke; the example measurements in the tables of the series and parallel pages are made-up round values for equal lamps on a 6 V battery.
- Safety rules in the last page are derived from the causes named in Elektrischer_Schlag and from the page `leiter-nichtleiter`; no first-aid steps are given.
- Left out: videos, serlo.org (not checked), the Kernlehrplan NRW (not readable).
- The creator's material: none.

## Adding a chapter or round

1. Pick the competency ids in the map `physik/elektrizitaetslehre` that build on the existing pages (`requires`).
2. New folder `src/<kapitel>/` with `chapter.yaml` (`title`, `summary`, `pages` complete and ordered); list the folder in `chapters` of `src/app.yaml`.
3. One file `src/<kapitel>/<seite>.yaml` per competency, `competencies: [<id>]`, sections `einstieg`, `erklaerung`, `beispiel`, `uebung`.
4. Draw figures into `src/images/` following Figures; exercises from Exercise patterns.
5. Update Competencies and Sources here.
6. Put 1 to 3 of its exercises into `selfAssessment` of the chapter (`chapter.yaml`), as skill `lernapps-explainer-self-assessment` says: steps of 2 to 5 exercises, each exercise clear without its page, figures in `material`.
7. `npx --no -- lernapps check`, then commit on `work`.

## Rules learned from mistakes

None yet.
