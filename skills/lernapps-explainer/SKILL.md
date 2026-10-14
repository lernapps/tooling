---
name: lernapps-explainer
description: Use when you build or change an explainer for lernapps.net (archetype explainer). How the generated explainer works, what you write (the content as YAML in src/, Vue components only where no block fits), its structure, blocks, formulas, languages, exercises and components, and the rules the build checks. Load it together with lernapps-app before you write content; for questions of the quiz's types also load lernapps-quiz.
license: MIT
---

# Building an explainer

An explainer from the archetype `explainer` explains a topic on pages and lets learners practise it on every page.
The archetype is a deep scaffold. Rendering, navigation, formulas, figures, the exercises with their feedback,
accessibility, the languages and the page without JavaScript are built in. They come from the runtime
`@lernapps/app-templates`, which the app depends on. You write the content as YAML in `src/`, and code only as a Vue
component where no block can say what the page needs. The rules of `lernapps-app` apply too.

## How the explainer works

- The generator writes the app with an example chapter, "Prozent" (the plan's Code tasks name the command). Replace
  it with the creator's content. The schema describes every field and every block:
  <https://lernapps.net/tooling/schemas/explainer.v1.schema.json>. Start every YAML file with the comment that names
  it, as the generated files do, so the editor checks the file while you write:
  `# yaml-language-server: $schema=../../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v1.schema.json`
  (one `../` less in `src/app.yaml`).
- The build reads every file, validates it and renders every page to static HTML. A problem fails the build with one
  line: `file:line: place (language): what to do`, e.g.
  `src/prozent/prozentwert.yaml:12: blocks[0].blocks[1].text: a Markdown heading ("Regel"); use a section block with the title "Regel"`.
  Fix each line where it points.
- Without JavaScript every page is complete: all text, every formula as MathML, figures, tables, the navigation and
  the sources. Each exercise shows its task with the solution in a `<details>` "Lösung"; a `generated` exercise
  shows three worked tasks; a component shows its `nojs` text.
- With JavaScript the exercises come alive: controls, "Prüfen", and the feedback in view with the focus. A
  `generated` exercise also gets a live task, "Neue Aufgabe" and a deep link to its task:
  `/<chapter>/<page>/?seed=<n>#<exercise>`. A component hydrates in place.
- Addresses: a page is `/<chapter>/<page>/`, a section `#<section>`, a section inside it `#<section>/<sub>`, an
  exercise `#<exercise>`. The glossary is `/glossar/`. Every other language has the same tree below `/<language>/`.
  Each tree has an `llms.txt` with its pages and deep links.
- The explainer stores nothing.
- Your end-to-end tests come with the runtime (`e2e/explainer.e2e.ts`, `explainerTests()`), from your content, for
  every page in every language. Without JavaScript they check the headings against the nesting, the sections,
  formulas, figures and anchors, the navigation chain, the languages, every exercise's solution and each component's
  `nojs` text. With JavaScript (German, 360 px) one exercise per type and page takes its right answer and rejects a
  wrong one, and each component hydrates without an error. `lernapps check` runs them, and on its own opens every
  page once more without JavaScript (`explainer-readable-without-js`), on the bundle and on the deployed app.

## When a test of the runtime fails

The end-to-end tests and the build's checks come from the runtime, not from your app. If a test fails while your
content validates (the build passes), the bug is in the template, not in your content: do what the skill
`lernapps-app` says for a failing test of the runtime (`checks-pass`), and go on with the content. Never change the
runtime in `node_modules` (`explainer-only-content`). A fix reaches the app with a newer `@lernapps/app-templates`:
`npx --yes github:lernapps/tooling#main update` moves the app to it.

## Structure

Four levels, no deeper:

| Level | File | Holds |
|---|---|---|
| App | `src/app.yaml` | `title`, `intro`, `languages`, the order of the `chapters`, `sources` |
| Chapter | `src/<chapter>/chapter.yaml` | `title`, `summary`, the order of its `pages` |
| Page | `src/<chapter>/<page>.yaml` | `title`, `description`, `blocks` |
| Section | a `section` block in a page | `id`, `title`, `blocks`; one more level of sections inside |

- **Chapters are mandatory.** An app with one chapter hides it: the navigation and the start page skip the level,
  and the addresses keep it (`/<chapter>/<page>/`), so a second chapter later breaks no link.
- **The order lists are complete.** `chapters` in `app.yaml` and `pages` in each `chapter.yaml` list every folder or
  file exactly once. Nothing is sorted by file name.
- **Ids are paths.** Chapter, page, section and exercise ids are lowercase letters, digits and hyphens, unique on
  their level, and stay once published: the entry's topics and teachers' links use them. `data`, `images`,
  `glossar`, `components` and `assets` are no chapter ids.
- **Depth:** page, section, subsection; the heading levels follow from the nesting (h1, h2, h3). A box (`example`,
  `note`) takes the next level below its place and holds no sections. Content that needs more levels is two apps.
- The navigation is generated: contents on the start page and each chapter page, breadcrumbs, previous and next
  across chapters in the order of the lists, contents at the top of a page with three or more sections, the
  glossary from the `definition` blocks.

## Blocks

A page is a list of blocks from a closed set. Every text field takes a text or a language map (see Languages).
Prose fields take restricted Markdown: paragraphs, `**bold**`, `*italics*`, lists, links, line breaks and formulas
as `$…$`. No headings: make a `section` block with that title. No HTML, no images, no code, no quotes, no tables in
Markdown: each has its block. A link to a page of the app starts with `/` from the app's root
(`/prozent/grundwert/#regel`); the build checks that it leads to a page or section.

| `type` | Fields | Shows |
|---|---|---|
| `section` | `id`, `title`, `blocks` | a heading and its blocks |
| `text` | `text` | prose |
| `formula` | `formula` (LaTeX subset, without `$`) | one formula on its own line, as MathML |
| `figure` | `draw` (`hundred-grid` with `filled`, `bar` with `part` and `whole`) or `image` (`images/<name>.svg`, with `source`, `licence`); `alt`, `caption` | an inline SVG or the bundled image |
| `labelled-figure` | `image`, `alt`, `caption`, `labels` (`x`, `y` in percent, `text`), `source`, `licence` | the image with numbered markers and their legend |
| `table` | `caption`, `header`, `rowHeaders`, `rows` | a table with its caption |
| `timeline` | `events` (`date`, `title`, `label`, `text`) or `data` (a data file) | dated events, the earliest first |
| `definition` | `term`, `explanation` | the term in place, collected into the glossary |
| `quote` | `text`, `origin` (`author`, `work`, `year`), `source`, `licence` | the quotation with its origin |
| `code` | `language` (bash, c, css, html, java, javascript, json, plaintext, python, sql, typescript), `code`, `caption` | highlighted code |
| `example`, `note` | `title`, `blocks` | a box: a worked example, a hint to remember |
| exercises | the quiz's six types, `generated` | see Exercises |
| `vue-component` | `component`, `props`, `nojs` | see Components |

```yaml
- type: section
  id: regel
  title: Regel
  blocks:
    - type: formula
      formula: 'W = \frac{G \cdot p}{100}'
    - type: definition
      term: Prozentwert
      explanation: Der Prozentwert $W$ ist der Anteil am Ganzen, in der Einheit des Grundwerts.
    - type: figure
      draw: { kind: hundred-grid, filled: 12 }
      alt: Ein Hunderterfeld mit 100 Kästchen, 12 davon sind gefärbt.
      caption: Die 12 gefärbten Kästchen sind 12 % des Ganzen.
    - type: note
      title: Merkhilfe
      blocks:
        - type: text
          text: Erst 1 % ausrechnen ($G$ geteilt durch 100), dann mal $p$ nehmen.
```

Bundled images go into `src/images/`; name their `source` (a URL or a citation) and `licence` (an SPDX id such as
`CC-BY-SA-4.0`, or `gemeinfrei`).

## Formulas

One notation, a LaTeX subset, rendered at build to MathML: in a `formula` block, or inline as `$…$` in prose. The
command list: `\frac`, `\cdot`, `\times`, `\div`, `\%`, `\text`, `^`, `_`, `\sqrt`, `\approx`, `\pm`, `\le`, `\ge`,
`\neq`, `\,` (thin space), parentheses and braces (`\{`, `\}`). For chemistry, `\ce{…}` writes equations and `\pu{…}`
units (mhchem): `\ce{2H2 + O2 -> 2H2O}`, `\ce{CO2 + H2O <=> H2CO3}`, `\pu{123 kJ/mol}`. A command outside the list
or a formula that does not parse fails the build with its place. Write YAML formulas in single quotes, so that a
backslash stays a backslash. A formula is the same in every language, unless its `\text{…}` differs: then it is a
language map.

## Languages

- `languages` in `src/app.yaml` lists the app's languages, German first: `[de]` or `[de, en]`. The runtime has its
  own texts in German and English.
- Every learner text is a string or a language map. A string is German, and enough only while German is the only
  language. With more languages, every text is a map with each of them:

  ```yaml
  title:
    de: Die drei Stände
    en: The three estates
  ```

- The build fails on a missing translation (`the translation is missing; write the text as a map: { de: …, en: … }`)
  and on a language that `languages` does not declare. Ids, addresses, numbers, formulas and drawn figures are the
  same in every language.
- Each language gets its own page tree: German at the root, the others below `/<language>/`, each page with `lang`,
  `hreflang` and a language switch of plain links.

## Data files

`src/data/<name>.yaml` holds a list of records with the same fields (lowercase names): events with `date` and
`title`, elements with their properties, organs with their function. A field is a number, true or false, or a text
(a language map in several languages). A `timeline` draws its events from one (`data: ereignisse`), and a
`generated` exercise picks from one (`from: { data: elemente }`). Write each fact once, there, instead of on several
pages.

## Exercises

Every page has at least one exercise, best in a last section "Übung". Two kinds.

**The quiz's question types** (`single-choice`, `multiple-choice`, `true-false`, `number`, `ordering`, `matching`)
are blocks with the same fields as the questions of a quiz: `id`, `type`, `text`, `explanation`, `links`, and the
fields of the type. They are validated, checked and given feedback as in the quiz. How to write good questions,
options, background and links: the skill `lernapps-quiz`; its rules for questions apply here.

```yaml
- type: ordering
  id: staende-ordnen
  text: Bringe die Stände in ihre Rangfolge, den ersten Stand zuerst.
  items: [die Geistlichen, der Adel, alle anderen]
  explanation: Der erste Stand waren die Geistlichen, der zweite der Adel, der dritte alle anderen.
  links:
    - { title: Ständegesellschaft (Wikipedia), url: "https://de.wikipedia.org/wiki/Ständegesellschaft" }
```

**`generated`** draws a new task from a seed, in a property-based notation:
- `given`: the variables and how each is drawn: `int: [min, max]` with a `step`, `decimal: [min, max]` with a
  `step`, `oneOf: [...]`, `pick: <n>` `from:` a list or `{ data: <name> }` (with `distinct: true` for no repeats;
  `pick: 1` gives one record), `shuffle:` a list or a data file;
- `where`: preconditions, each an expression that is true or false; a draw that fails one is drawn again;
- `task`: the `text`, and an optional `figure` (`hundred-grid` with `filled`, `bar` with `part` and `whole`, as
  numbers or expressions, and its `alt`);
- `answer`: the `value` (an expression) and `compare`, which decides the learner's controls: `number` or
  `{ number: { format: integer|decimal|money|percent, decimals, tolerance, unit } }`, `{ choice: <options> }`
  (single choice), `order`, `{ set: <options> }` (multiple choice), `pairs` or `{ pairs: { left, right } }`;
- `mistakes`: typical wrong answers, each a `value` and a `message` that says what went wrong;
- `hint` and `steps`: help, and the way to the solution.

The expressions are a small language without eval: numbers as exact fractions, `+ - * /`, parentheses,
`== != < <= > >=`, `and`, `or`, `not`, strings in quotes, fields (`e.year`), list index (`xs[0]`), lists, and
`round(x, n)`, `abs`, `decimals`, `len`, `map(xs, field)`, `sortBy(xs, field)`, `reverse`, `minBy`, `maxBy`,
`contains(xs, x)`, `distinct(xs)`.

**Placeholders** are always two braces around a declared name or its field, nothing else inside, in prose and in
formulas alike: `{{G}}`, `{{e.name}}`, and `{{answer}}` in the steps. One brace is never a placeholder: in a formula
`G`, `{G}` and `\frac{W}{G}` are the letter. Where a formula needs a group around a value, the group stays:
`$\frac{{{W}}}{{{G}}} \cdot 100 = {{answer}}$`. The build fails on a placeholder whose name `given` does not declare,
on one brace or spaces where a placeholder was meant in prose (`{G}`, `{{ G }}`), on a variable of `given` that
nothing uses (no placeholder, no expression of the figure, answer or mistakes; `where` does not count), and on a
placeholder left after filling in.

```yaml
- type: generated
  id: prozentwert-ueben
  given:
    G: { int: [150, 1500], step: 5 }
    p: { oneOf: [5, 10, 12, 15, 20, 25, 30, 40] }
  where: ["decimals(G * p / 100) <= 2"]
  task:
    text: "Ein Fahrrad kostet {{G}} €. Im Angebot gibt es {{p}} % Rabatt. Wie viel Euro sparst du?"
    figure: { kind: hundred-grid, filled: p }
  answer: { value: "G * p / 100", compare: { number: { format: money } } }
  mistakes:
    - { value: "G * p", message: "Du hast vergessen, durch 100 zu teilen: {{p}} % sind {{p}} Hundertstel." }
    - { value: "G - G * p / 100", message: "Das ist der neue Preis, nicht der Rabatt." }
  hint: "Rechne erst 1 % aus: {{G}} € geteilt durch 100."
  steps:
    - '$W = \frac{G \cdot p}{100}$'
    - '$W = \frac{{{G}} \cdot {{p}}}{100} = {{answer}}$, also {{answer}} € Rabatt.'
```

```yaml
- type: generated
  id: ereignisse-ordnen
  given:
    events: { pick: 3, distinct: true, from: { data: ereignisse } }
  where: ["distinct(map(events, date))"]
  task: { text: "Bringe die Ereignisse in die richtige Reihenfolge, das früheste zuerst." }
  answer: { value: "map(sortBy(events, date), title)", compare: order }
  mistakes:
    - { value: "map(reverse(sortBy(events, date)), title)", message: "Umgekehrt: Das früheste Ereignis kommt zuerst." }
```

The build tests every `generated` exercise over 200 fixed seeds and fails with the first problem and its seed:
- `where` holds in at least 1 of 10 draws (`where holds in 3 of 200 draws; it must hold in at least 1 of 10, so loosen it or narrow given`);
- the answer is defined, in its format, and passes its own comparator;
- no mistake equals the answer (`for seed 17 the mistake equals the answer (20); a mistake is a wrong answer, so change its value or remove it`),
  and the learner can give each mistake;
- the task is the same for the same seed and keeps no placeholder;
- the figure does not show the answer before it is solved.

A mistake that equals the answer for some values is a sign of a range that is too wide: `G - G * p / 100` equals
`G * p / 100` at 50 %, so the example draws `p` up to 40.

## Components

A component is for what no block and no `generated` exercise can express: a figure the learner labels, something to
drag into place. Prefer a built-in block; it is readable without JavaScript, accessible and tested by construction.

- **Files:** `src/components/<Name>.vue`, a single-file component with `<script setup lang="ts">`, next to it its
  test `src/components/<Name>.test.ts`, which `lernapps check` runs, and for an exercise its logic module
  `src/components/<Name>.ts`. `lernapps check` type-checks `.vue` files with `vue-tsc`.
- **The block:** `type: vue-component`, `component: <Name>`, `props`, and `nojs`.
- **Props:** declared with their types, `defineProps<{ … }>()`: `string`, `number`, `boolean`, literal types, and
  unions, arrays and object types of them. The build checks each block's `props` against them. A `string` prop is a
  learner text: a language map in an app with several languages, checked in each.
- **`nojs`:** restricted Markdown that says what the component shows and gives its content, for readers without
  JavaScript: the labelled diagram described, or the task with its solution. It must carry the meaning on its own.
  The component replaces it once it runs; with `defineOptions({ nojs: "caption" })` it keeps it as its caption.
- **Exercise contract:** a component that emits `answered` with `{ correct }` is an exercise; the page shows the
  feedback below it. Its logic lives in `<Name>.ts` as pure functions: `generate(seed, props)` gives the task,
  `check(task, answer)` says whether an answer is right, `solution(task)` gives the right answer and `wrong(task)` a
  wrong one. The build tests them over 50 fixed seeds per block: the task is the same for the same seed, the solution
  passes, the wrong answer fails, nothing throws.
- **Rendering:** the build renders the component on the server into the page, hidden until it hydrates. The first
  render must be the same on the server and in the browser: draw it from a fixed seed (`generate(1, props)`), and
  draw anything random only in `onMounted`.
- **What a component may do:**
  - no network: no `fetch`, XMLHttpRequest, WebSocket, EventSource or `sendBeacon`, no import from a URL;
  - no `eval`, `new Function`, `innerHTML` or `v-html`;
  - imports only from `vue`, `@lernapps/app-templates`, `@lernapps/tooling/storage`, `i18n` and `a11y`, and its own
    folder (`./<file>`);
  - browser globals (`window`, `document`, `localStorage`, …) only inside `onMounted`, or the unmount hooks after it;
  - storage only through `createStorage` (`storage-through-wrapper`);
  - at most 20 kB gzip of its own code; Vue is loaded once per page and not counted. A component that needs more is
    split, or asks for a new block.

  The build checks these on the compiled component, script and template alike; the lint rules of the same ids
  report them in the editor and on commit.
- **No headings** in the component's markup, also not in its hidden part: the page's headings come from its sections,
  and the tests compare them with the nesting. Its texts come through its props from the content, not from strings
  in its code.

## Page structures by subject

Recommended, not required; choose the sections that fit the topic and keep them alike across pages:
- **Maths and the sciences:** Warum, Regel, Beispiel, Übung: why it matters, the rule with its formula and a
  figure, a worked example in an `example` box, then the exercise.
- **History:** Quelle, Einordnung, Zeitleiste, Übung: a `quote` from a source, its context, a `timeline` from a data
  file, then an ordering or `generated` events exercise.
- **Biology and geography:** Überblick, Aufbau, Funktion, Übung: a `labelled-figure` of the parts, a `table` of what
  each does, then a matching exercise.
- **Computer science:** Idee, Beispiel, Code, Übung: the idea in prose, a worked example, a `code` block, then an
  exercise on what the code gives.

## The entry's topics

Each topic of the entry draft is the path of a page or a section, relative to the app's `url`: `prozent/prozentwert/`
or `prozent/prozentwert/#regel` (`entry-links-resolve`; `lernapps check --entry` checks that the page has the section).
Take the paths from the ids, which stay (`explainer-stable-ids`).

## Rules

Each rule is a section headed by its rule block. The quiz's rules for questions (`quiz-bank-valid`,
`quiz-clear-question`, `quiz-plausible-options`, `quiz-feedback-explains`, `quiz-fitting-type`,
`quiz-number-precision`) apply to the quiz-type exercises too; they are in `lernapps-quiz`. All rules:
<https://lernapps.net/tooling/rules/>.

### `explainer-only-content`: Write only the content

```rule
id: explainer-only-content
scope: archetype:explainer
severity: error
```

Write the YAML of the app, its chapters, pages and data, the bundled images in `src/images/`, and components with
their logic and tests in `src/components/`. Keep `src/main.ts`, `index.html`, `e2e/explainer.e2e.ts` and the
configuration as generated (`keep-the-preset`). The build fails on any other file in `src/`. If the content needs
something no block or component can say, write it under "Where I had to guess" in the retrospective instead of coding
around the runtime.

### `explainer-content-valid`: The content validates

```rule
id: explainer-content-valid
scope: archetype:explainer
severity: error
```

Every file validates against the schema, every id is unique on its level, every reference (a data file, an image, a
component, a link to a page or section) exists, every placeholder is declared and every formula uses only the
command list. The build names each problem in one line with file, line and block path; fix it there.

### `explainer-structure-complete`: Every chapter and page listed once

```rule
id: explainer-structure-complete
scope: archetype:explainer
severity: error
```

Give the app at least one chapter. List every chapter folder in `chapters` of `src/app.yaml` and every page file in
`pages` of its `chapter.yaml`, each exactly once, in the order learners read them.

### `explainer-structure-depth`: Chapter, page, two section levels

```rule
id: explainer-structure-depth
scope: archetype:explainer
severity: error
```

Nest sections at most two deep: a section, and sections inside it. Set no heading levels: they follow from the
nesting. Content that needs more levels is two apps.

### `explainer-structure-by-sections`: Structure only by sections

```rule
id: explainer-structure-by-sections
scope: archetype:explainer
severity: error
```

Make every heading a `section` block with its `id` and `title`. A Markdown heading (`#`, `##`, an underlined line) in
a text field fails the build, with the title it found.

### `explainer-stable-ids`: Keep the ids

```rule
id: explainer-stable-ids
scope: archetype:explainer
severity: warning
```

Give chapters, pages, sections and exercises short, telling ids ("prozentwert", "regel") and keep them when the texts
change: they are the addresses that the entry's topics and teachers' links use. Give new content new ids; never
reuse the id of something removed.

### `explainer-navigation`: Every page in one chain

```rule
id: explainer-navigation
scope: archetype:explainer
severity: error
```

Leave the navigation to the runtime: contents, breadcrumbs and previous and next follow from the order lists, so every
page is in one chain and reachable from the start page. Link from prose with paths that start at the app's root.
`lernapps check` finds a page no link from the start page reaches (`pages-reachable`), and a topic of the entry whose
`#<section>` is no section of its page (`entry-links-resolve`).

### `explainer-languages`: German first, every language complete

```rule
id: explainer-languages
scope: archetype:explainer
severity: error
```

List the languages in `languages`, German first. Write every learner text, in content, data files and component
props, in each of them, and in no other. The build fails on a missing translation and on an undeclared language.

### `explainer-readable-without-js`: Every page readable without JavaScript

```rule
id: explainer-readable-without-js
scope: archetype:explainer
severity: error
```

Put every fact into a block, where it is on the page without JavaScript. Keep no meaning only inside an exercise or a
component: give every component a `nojs` text that says what it shows and gives its content. `lernapps check` opens
every page the runtime marks as an explainer page a second time, with JavaScript off, on the bundle and on the
deployed app alike (so the listing and the review check it too): each heading, formula and figure must be visible, a
figure with its name, every exercise's "Lösung" and every component's `nojs` text not empty.

### `explainer-formulas-static`: Formulas as formulas

```rule
id: explainer-formulas-static
scope: archetype:explainer
severity: error
```

Write every formula in a `formula` block or as `$…$`, never as plain text (`W = G * p / 100`) or as a picture: the
build renders it to MathML, which screen readers read.

### `explainer-generated-sound`: The property test passes

```rule
id: explainer-generated-sound
scope: archetype:explainer
severity: error
```

Write `given` and `where` so that `where` holds often, the answer is defined and in its format for every draw, and no
mistake can equal it. When the property test fails, it names the seed: narrow `given` or change the mistake, never
the comparator to make it pass.

### `explainer-figure-hides-answer`: The figure does not give the answer away

```rule
id: explainer-figure-hides-answer
scope: archetype:explainer
severity: error
```

Draw a task's figure from the given values, never from the answer: it shows what the task gives, and the learner works
out the rest.

### `explainer-plausible-numbers`: Numbers that fit the story

```rule
id: explainer-plausible-numbers
scope: archetype:explainer
severity: warning
```

Choose ranges that fit the thing in the text: prices in whole cents, people in whole numbers, a bicycle for 150 to
1500 €. Use `where` to rule out values that do not fit, such as 90.91 people.

### `explainer-mistakes-diagnosed`: Typical mistakes with their message

```rule
id: explainer-mistakes-diagnosed
scope: archetype:explainer
severity: hint
```

Give a `generated` exercise the mistakes learners really make, each with a message that says what went wrong and how
to get it right: "Du hast vergessen, durch 100 zu teilen", not "Falsch".

### `explainer-figure-explains`: The figure shows what the text says

```rule
id: explainer-figure-explains
scope: archetype:explainer
severity: hint
```

Show in each figure what the text next to it explains, and say in the caption what to look at. The `alt` text says
what the figure shows, for those who cannot see it.

### `explainer-quote-sourced`: Quotes exact, with their origin

```rule
id: explainer-quote-sourced
scope: archetype:explainer
severity: warning
```

Quote exactly, as the source has it, and name the origin (`author`, `work`, `year`), the `source` and its `licence`.

### `prefer-built-in-block`: A component only where no block fits

```rule
id: prefer-built-in-block
scope: archetype:explainer
severity: hint
```

Build a page from the built-in blocks and exercises first. Write a component only for what none of them can express,
and say in the plan why.

### `vue-component-props-valid`: Props as the component declares them

```rule
id: vue-component-props-valid
scope: archetype:explainer
severity: error
```

Declare the props with their types (`defineProps<{ … }>()`), and give each block exactly the props the component
declares, of their types.

### `vue-component-nojs`: Every component block has its `nojs` text

```rule
id: vue-component-nojs
scope: archetype:explainer
severity: error
```

Give every `vue-component` block a `nojs` text in every language: what the component shows and does, with its
content, so that the page means the same without JavaScript. The schema requires it; `lernapps check` finds one that
is empty or hidden without JavaScript (`explainer-readable-without-js`).

### `vue-component-exercise-contract`: An exercise component has its logic module

```rule
id: vue-component-exercise-contract
scope: archetype:explainer
severity: error
```

When a component emits `answered`, put its logic into `src/components/<Name>.ts` with `generate(seed, props)`,
`check(task, answer)`, `solution(task)` and `wrong(task)`, pure and deterministic, so that the build's property test
passes.

### `vue-component-tested`: A test per component

```rule
id: vue-component-tested
scope: archetype:explainer
severity: error
```

Write `src/components/<Name>.test.ts` next to each component, testing its logic: a right and a wrong answer, and the
cases at the edges. `lernapps check` runs it.

### `vue-component-no-network`: No network

```rule
id: vue-component-no-network
scope: archetype:explainer
severity: error
```

Make no request from a component and import nothing from a URL: give it what it needs through its props, or bundle
it.

### `vue-component-no-html-injection`: No code or HTML from strings

```rule
id: vue-component-no-html-injection
scope: archetype:explainer
severity: error
```

Use no `eval`, `new Function`, `innerHTML` or `v-html` in a component: let its template render the content.

### `vue-component-imports`: Imports only from the allowed packages

```rule
id: vue-component-imports
scope: archetype:explainer
severity: error
```

Import only from `vue`, `@lernapps/app-templates`, `@lernapps/tooling/storage`, `i18n` and `a11y`, and the
component's own folder. Types may come from anywhere.

### `vue-component-browser-globals`: Browser globals only once mounted

```rule
id: vue-component-browser-globals
scope: archetype:explainer
severity: error
```

Use `window`, `document`, `localStorage` and the other browser globals only inside `onMounted`, or the unmount hooks
after it: the build renders the component where they do not exist.

### `vue-component-size`: Within 20 kB

```rule
id: vue-component-size
scope: archetype:explainer
severity: error
```

Keep a component's own code within 20 kB gzip. A component that needs more is split, or is a case for a new block:
write it into the retrospective.
