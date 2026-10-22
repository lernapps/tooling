---
name: lernapps-explainer-design
description: Use in Explore right after choosing the `explainer` archetype - how the content of a lernapps.net explainer maps onto chapters, pages, blocks and exercises, which the plan then applies.
license: MIT
---

# Designing an explainer

## What an explainer is

- Chapters of pages that explain a topic, with exercises on every page. Every page is complete without JavaScript;
  with it, exercises check answers and give feedback.
- Generated around your content: navigation, contents, glossary, a tutor prompt per page, other languages.
- You will write the content as YAML; a Vue component only where no block fits.

## Can and cannot

- The README of the template says it: <https://raw.githubusercontent.com/lernapps/app-templates/main/explainer/README.md>.
  Read it before this skill's mapping, if you have not yet.

## Map the content

- A chapter of competencies → an app chapter. A competency → a page or a section.
- Depth: chapter, page, section, subsection. Need more levels → two apps.
- The content structure → the same sections on every page, with fixed ids and titles (e.g. "Regel", "Beispiel",
  "Übung").
- Shared material → a data file (`src/data/<name>.yaml`), each fact once.
- A pattern → a block or an exercise with fixed parts, varied in its drawn values or the records it picks.
- One chapter only: it is hidden in the navigation; its pages keep their addresses.

## Blocks

- Text: prose (restricted Markdown), `definition` (also in the glossary), `example` and `note` boxes, `quote`,
  `code`.
- Formulas: `formula` and inline `$…$`, LaTeX subset incl. chemistry (`\ce`), rendered as MathML.
- Figures: drawn (`hundred-grid`, `bar`), an image (`images/<name>.svg`, with source and licence), a
  `labelled-figure` with numbered markers, a `table`, a `timeline`.
- Exercises: the six question types of the quiz; `generated` (a new task per seed, with drawn values, typical
  mistakes, hint and steps); a component.
- Something no block can show or check → a component: read a value off a scale, label a figure, drag into place,
  build a circuit. Logic in its own module, tested; a text for readers without JavaScript.

## Decide

- Languages: German; English as a second language is supported. Each declared language complete.
- The tutor: the build writes it from the content. Plan only app-specific tutor rules, if any.

## Gotchas

- Each component costs a module, a test and a no-JS text: plan one only where it teaches what no block can.

## Read when

- [references/rules.md](references/rules.md): before you write "Content method"; it holds the rules for pages,
  figures, numbers, mistakes and components.
