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

- The README of the template says it: `node_modules/@lernapps/app-templates/explainer/README.md` (in the folder `init` made).
  Read it before this skill's mapping, if you have not yet.

## Map the content

- A competency (one teachable thing, one or two lessons) → a page. A large competency may take several pages.
- A chapter → competencies that build on each other. Order chapters and pages along the map's `requires`: what
  learners need first comes first.
- Prerequisites: for each page's competency, read its `requires` in the map.
  - The app practises it (a page of its own) → it orders the pages; the text may link the page that teaches it.
  - The app does not practise it → of another strand (one app, one strand), or of the app's strand outside the
    app's scope. The page names it. The app may repeat it on a recap page (`recap: <subject>/<competency>`):
    descriptive blocks only, no exercise; the runtime writes the link to its page on the map. Place the recap page
    before the page that needs it ([structure](../lernapps-explainer/references/structure.md)). Never both: a
    competency the app practises gets no recap page.
- The app has one strand of the subject's learning map (recommended, skill `lernapps-content-research`), or `none`.
  Every page names the competency of the map it practises (`competencies`, ids of the app's strand). A competency
  the map lacks is proposed to the catalog, not invented here. With `strand: none` pages name none.
- Show the creator this structure in Explore: which competency on which page, which pages in which chapter.
- Depth: chapter, page, section, subsection. Need more levels → two apps.
- The content structure → the same sections on every page, with fixed ids (e.g. `einstieg`, `beispiel`, `uebung`).
  Their titles fit what each section does on that page (`explainer-honest-headings`); a section a page does not need
  is left out.
- Each page: one new step (`explainer-one-step`), from what learners of the grade know (`explainer-learner-start`).
- Each figure, model and component: its learning action before its form (`explainer-representation-explained`):
  what is the whole, what do parts and marks mean, what do learners do, what stays the same, how does that lead to
  the statement. A slider or button only where that action needs it (`explainer-control-purpose`).
- Shared material → a data file (`src/data/<name>.yaml`), each fact once.
- A pattern → a block or an exercise with fixed parts, varied in its drawn values or the records it picks.
- One chapter only: it is hidden in the navigation; its pages keep their addresses.

## Blocks

- Text: prose (restricted Markdown), `definition` (also in the glossary), `example` and `note` boxes, `quote`,
  `code`.
- Formulas: `formula` and inline `$…$`, LaTeX subset incl. chemistry (`\ce`), rendered as MathML.
- Figures: drawn (`hundred-grid`, `bar`: both a part of a whole), an image (`images/<name>.svg`, with source and licence), a
  `labelled-figure` with numbered markers, a `table`, a `timeline`.
- Exercises: the six question types of the quiz; `generated` (a new task per seed, with drawn values, typical
  mistakes, hint and steps); a component.
- Something no block can show or check → a component: read a value off a scale, label a figure, drag into place,
  build a circuit. Logic in its own module, tested; a text for readers without JavaScript.
- Wanted, not only allowed: all that makes the content attractive - figures, drawings, labelled figures, tables,
  timelines, videos; a component where no block fits.

## Decide

- Strand: `<subject>/<strand>` from the map where one fits, or `none`. The plan records it, the competency ids of
  each page, each page's prerequisites the app does not practise and which of them get a recap page (format 2,
  [structure](../lernapps-explainer/references/structure.md)).
- Languages: German; English as a second language is supported. Each declared language complete. Never English
  only: without `languages` the page and the runtime's texts are German. English wanted → `[de, en]`.
- The tutor: the build writes it from the content. Plan only app-specific tutor rules, if any.

## `one-competency-per-page`: One page per competency

```rule
id: one-competency-per-page
scope: tooling
severity: hint
```

- Each page teaches one competency of the map: `competencies` with one id. Several pages for one large competency
  are fine.
- Several competencies on one page: allowed by the schema, not recommended. Split the page, one per competency.
- `lernapps check` gives a hint for every page of a format-2 explainer with more than one competency.

## `prerequisites-linked`: Prerequisites the app does not practise are recapped or linked

```rule
id: prerequisites-linked
scope: tooling
severity: hint
```

- A competency of a page requires one the app does not practise (`requires` in the map), of another strand or of
  the app's own: learners find it from the app.
- Either a recap page of the app repeats it (`recap: <subject>/<competency>`), or the page's text names it with a link
  to its page on the map: `https://lernapps.net/apps/map/<subject>/c/<id>/`.
- `lernapps check` gives a hint for each such prerequisite with neither, naming the page and the prerequisite. Without
  the map it finds nothing (`competencies-on-map` says it could not check).

## Gotchas

- Each component costs a module, a test and a no-JS text: plan one only where it teaches what no block can.

## Read when

- [references/rules.md](references/rules.md): before you write "Content method"; it holds the rules for pages,
  figures, numbers, mistakes and components.
