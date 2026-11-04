---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

Physik, Klasse 8, Gymnasium NRW. Strand `physik/elektrizitaetslehre` of the learning map (https://lernapps.net/apps/map/physik.json). Kernlehrplan NRW: not checked, no unit cited (the official PDF was not reachable). Not taught: Ohmsches Gesetz und Widerstand, Wirkungen des Stroms, Spannungsquellen, rechnerische Größen in Reihen- und Parallelschaltung.

## Competencies

Pages carry one competency id of the map each (`competencies`). Chapter folder `src/<chapter>/`, page `<page>.yaml`.

- `stromkreis`: einfacher-stromkreis, schalter, schaltzeichen
- `leiter`: leiter-nichtleiter
- `strom-spannung`: stromstaerke, spannung, stromstaerke-messen, spannung-messen
- `schaltungen`: reihenschaltung, parallelschaltung (qualitativ, ohne Rechnen)
- `sicherheit`: gefahren-des-stroms, sicher-mit-strom-umgehen

All five chapters are written and listed in `src/app.yaml`.

## Content structure

Each page: sections in order, a explanation section or two (ids by topic, e.g. `aufbau`, `geschlossen`), then the last section `uebung` ("Übung") with 3 to 4 exercises. A `note` box for a typical misconception. Short sentences, Klasse 8, 2 to 4 sections per page.

## Terminology

Address the learner with "du". Terms: Stromkreis (geschlossen/offen), Spannungsquelle, Verbraucher, Leitung, Schalter, Schaltzeichen, Schaltplan, Stromstärke I in Ampere (A), Spannung U in Volt (V), Strommesser/Amperemeter, Spannungsmesser/Voltmeter. Never "Strom verbrauchen": say the lamp wandelt Energie um. Do not mix up Stromstärke and Spannung.

## Exercise patterns

Types of the explainer: single-choice, multiple-choice, true-false, matching, ordering, number. There is no cloze type: a "Lückentext" is a `single-choice` whose text contains `___` (example: `luecke-geschlossen` in `stromkreis/einfacher-stromkreis`).

- Zuordnen (matching): Größe, Einheit, Messgerät; Bauteil und Aufgabe. A pair's text with a comma must be quoted. With a `labelled-figure` and `legend: false`, `alt` must name every marker (example: `zeichen-bauteile`).
- Ablesen/Interpretieren: a drawn circuit as `material`, question about value or statement.
- Beurteilen (true-false): reason in `explanation`.
- Sortieren: Stoffe in Leiter/Nichtleiter (matching or ordering).
- Wrong options are real misconceptions: Strom wird verbraucht; Stromstärke vor der Lampe größer als danach; Spannung und Stromstärke verwechselt. Each wrong option's `info` says why.

## Figures

Own SVG drawings in `src/images/`, 400x200 viewBox, black lines 3 px, source "eigene Zeichnung", licence CC-BY-4.0, `alt` and `caption` always. Battery: long plate = plus pole. Schaltzeichen as in `images/schaltzeichen.svg`. Circuits are rectangles; a gap means open.

## Sources

Wikipedia (de) pages as further reading, each opened and checked on 2026-11-04 (no disambiguation pages): Stromkreis, Elektrischer_Strom, Elektrische_Stromstärke, Elektrische_Spannung, Elektrischer_Leiter, Isolator_(Elektrotechnik), Schalter_(Elektrotechnik) (not Schalter: disambiguation), Schaltplan, Strommessgerät, Spannungsmessgerät, Reihenschaltung, Parallelschaltung, Stromunfall (not Elektrischer_Schlag: redirects). Facts in own words; safety figures (muscle cramps from about 10 mA, rhythm problems from about 25 mA) follow Stromunfall. Not checked: Kernlehrplan NRW. No material of the creator.

## Adding a chapter or round

1. Pick the competencies (ids from the map) and the chapter id.
2. Create `src/<chapter>/chapter.yaml` and one `<page>.yaml` per competency, with `competencies`.
3. List the chapter in `src/app.yaml` and the pages in `chapter.yaml`.
4. Write sections and an `uebung` section from the patterns above; add figures to `src/images/`.
5. Update this guide, run `npx --no -- lernapps check`, commit (one task, one commit).

## Rules learned from mistakes

- A flow-style pair like `{ left: a, right: b, c }` breaks on the comma: quote the text.
- With `legend: false` the `alt` of a labelled figure must name every marker.
