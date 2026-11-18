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

- The template's README says it: `node_modules/@lernapps/app-templates/explainer/README.md`. Read it first.

## Map the content

- A competency (one teachable thing, one or two lessons) → a page. A large competency may take several pages.
- A chapter → competencies that build on each other. Order chapters and pages along the map's `requires`: what
  learners need first comes first.
- Prerequisites: for each page's competency, read its `requires` in the map. Each comes before the page that needs
  it (`prerequisites-in-order`).
  - The app practises it (a page of its own) → that page comes first; the text may link it.
  - The app does not practise it → of another strand, or outside the app's scope. The page names it. The app may
    repeat it on a recap page (`recap: <subject>/<competency>`): descriptive blocks only, no exercise; the runtime
    writes the link to its page on the map. Place the recap page before the page that needs it
    ([structure](../lernapps-explainer/references/structure.md)). Never both: a competency the app practises gets no
    recap page.
  - A chapter needs several of them → one collective recap at its start, not a page each: `recap: [<subject>/<id>,
    …]`, titled e.g. "Das brauchst du hier". Very compact, no new content, no exercise; a short self-check written by
    hand that names each competency with its "Ich kann …" sentence from the map (`recap-names-competencies`). Read
    the competencies off the map: the `requires` of the chapter's competencies that the app does not practise.
  - Where the app starts, its first competencies need what learners bring: a recap page there. Inside the app no
    step is missing: a prerequisite between two competencies of the app is practised too (else a gap).
  - A page must come first on purpose, e.g. greetings as fixed phrases before the grammar behind them → the page
    names that prerequisite in `ahead: [<id>]`, and the app practises it on another page.
- Strand app or unit app: the subject's map decides (`explainerFocus` in
  `https://lernapps.net/apps/map/<subject>.json`).
  - `strand` (most subjects): the app has one strand of the map (recommended, skill `lernapps-content-research`),
    `<subject>/<strand>`, or `none`. Every page practises competencies of that strand.
  - `competency` (foreign languages, German): the strands only illustrate. The app may be a unit app
    (`subject: <subject>` instead of `strand`) and practise competencies of every strand, e.g. words, grammar and
    communication of one situation. One strand per page: each page practises competencies of one strand.
  - Every page names the competency of the map it practises (`competencies`). A competency the map lacks is proposed
    to the catalog, not invented here. With `strand: none` pages name none.
- Show the creator this structure in Explore: which competency on which page, which pages in which chapter.
- Depth: chapter, page, section, subsection. Need more levels → two apps.
- The content structure → section ids fixed across pages (e.g. `einstieg`, `beispiel`, `uebung`); which sections a page
  has and in which order follows what it teaches, not a template. Titles fit what each section does on that page
  (`explainer-honest-headings`).
- Each page: one new step (`explainer-one-step`), from what learners of the grade know (`explainer-learner-start`); it
  says where it leads (`explainer-page-goal`), and its exercises go from recognising to applying
  (`explainer-exercise-progression`).
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

## Engagement

Per page, one line under "Content method" in the plan:

1. Opening: a first, easy task learners act on in the first blocks, before the explanation, with the reason for its answer.
2. Change: which activities alternate (look, do, read); never a long text run.
3. Reward: what learners made or can do now, not only "Richtig"; a chapter ends with a look back.
4. Story: how the concern shows on this page (a scene, messages, a case) and what comes next; none, none.
5. Repeat on purpose only: a fact met again in another form deepens it, the same words twice do not.
   `explainer-text-load`, `explainer-repetition` and `explainer-interaction` of `lernapps check` hint at the rest.

## Decide

- Strand: `<subject>/<strand>` from the map where one fits, or `none`; in a subject with `explainerFocus:
  competency` also `subject: <subject>` for a unit app. The plan records it, the competency ids of each page in the
  app's order, each page's prerequisites the app does not practise and which of them get a recap page (format 2,
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

- Each page teaches one competency of the map: `competencies` with one id; several pages for one large competency are
  fine. `lernapps check` hints at every page with more than one.

## `explainer-text-load`: A page is not mostly text

```rule
id: explainer-text-load
scope: tooling
severity: hint
```

- At most 350 words to read and 350 in tasks and feedback on a page, at most 4 text blocks in a row, and a figure,
  table or exercise within the first 4 blocks. `lernapps check` counts them.

## `explainer-repetition`: Each thing once

```rule
id: explainer-repetition
scope: tooling
severity: hint
```

- Not more than 10 phrases of five words said by two text blocks of a page, or by two exercises of one type.
  Repeating in another part (text, then task, then table) is a way to teach: do it on purpose, to deepen it differently.

## `explainer-interaction`: Learners do more than tick

```rule
id: explainer-interaction
scope: tooling
severity: hint
```

- At least four exercises on a page (a component counts), not three quarters or more guessable choices (single choice,
  multiple choice, true or false) without a component, and not all of one kind.

## `explainer-page-variety`: Pages do not all practise alike

```rule
id: explainer-page-variety
scope: tooling
severity: hint
```

- From four pages on, no one set of exercise kinds on half of the pages or more.

## `explainer-visual`: Something to look at

```rule
id: explainer-visual
scope: tooling
severity: hint
```

- At least half of the pages have something to look at besides tables and text: a figure, formula, code, quote, timeline,
  video or component.

## `prerequisites-in-order`: Prerequisites come before the page that needs them

```rule
id: prerequisites-in-order
scope: tooling
severity: warning
```

- Each direct prerequisite (`requires` in the map) of a page's competency is practised on that page or an earlier one,
  repeated on a recap page before it (`recap: <subject>/<competency>`, or in its list), or named in the page's text with a link to its
  page on the map: `https://lernapps.net/apps/map/<subject>/c/<id>/`. A recapped competency's own prerequisites do
  not count.
- `lernapps check` names the page and the prerequisite, once, at the first page that needs it:
  - order: the app practises or repeats it, but only later. Move the pages.
  - gap: the app does not have it, but practises something it builds on. Practise it in between, or recap or link it.
  - entry: nothing of its chain is in the app. The app starts here: a recap page before the page, or a link.
  - ahead: the page names it in `ahead`, but no page of the app practises it. Practise it, or remove it from `ahead`.
  - ahead not needed: no competency of the page requires it, or the app has it on this page or before. Remove it.
- A page may come before a prerequisite on purpose: it names it in `ahead: [<id>]`, and the app practises it on
  another page, earlier or later. A recap page or a link does not count.
- Severity by the subject's map: `explainerFocus: competency` a warning, `strand` a hint; at the listing order and gap
  are errors with `competency`, else warnings.

## Gotchas

- A component costs a module, a test and a no-JS text: only where no block can teach it.

## Read when

- [references/rules.md](references/rules.md): before you write "Content method"; it holds the rules for pages,
  figures, numbers, mistakes and components.
