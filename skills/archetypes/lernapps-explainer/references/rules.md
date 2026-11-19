# Explainer rules

The rules a finding of the build or of `lernapps check` may name. Read the section of the rule the finding names.
The rules for planning pages, figures and the place on the learning map are in skill `lernapps-explainer-design`
(`references/rules.md`); those for questions in skill `lernapps-content-questions`; those for components in
[components.md](components.md).

## Contents

- `explainer-only-content`: Write only the content
- `explainer-content-valid`: The content validates
- `explainer-structure-complete`: Every chapter and page listed once
- `explainer-structure-depth`: Chapter, page, two section levels
- `explainer-structure-by-sections`: Structure only by sections
- `explainer-stable-ids`: Keep the ids
- `explainer-navigation`: Every page in one chain
- `explainer-languages`: German first, every language complete
- `explainer-readable-without-js`: Every page readable without JavaScript
- `explainer-formulas-static`: Formulas as formulas
- `explainer-generated-sound`: The property test passes
- `explainer-open-points`: An open task checks what the material teaches
- `explainer-scope-matches`: The scope says what the pages teach

## `explainer-only-content`: Write only the content

```rule
id: explainer-only-content
scope: archetype:explainer
severity: error
```

The runtime owns rendering, so that every explainer stays accessible, readable without JavaScript and up to date with
`lernapps update`.

- You write the YAML of app, chapters, pages and data, images in `src/images/`, and components with their logic and
  tests in `src/components/`. Any other file in `src/` fails the build.
- `src/main.ts`, `index.html`, `e2e/explainer.e2e.ts` and the configuration stay as generated (`keep-the-preset`).
- What the notation cannot express goes under "Where I had to guess" in the plan. Never code around the runtime, and
  never change it in `node_modules`.

## `explainer-content-valid`: The content validates

```rule
id: explainer-content-valid
scope: archetype:explainer
severity: error
```

- The content is valid against the schema; ids are unique per level; every reference exists (data file, image,
  component, link to a page or section); every placeholder is declared; formulas use only the listed commands.
- The build names each problem with file, line and block path. Fix it there.

## `explainer-structure-complete`: Every chapter and page listed once

```rule
id: explainer-structure-complete
scope: archetype:explainer
severity: error
```

- The app has at least one chapter.
- Every chapter folder is in `chapters` of `src/app.yaml`, every page file in `pages` of its `chapter.yaml`, exactly
  once, in reading order. The order of the lists is the order of the navigation; nothing is sorted by name.

## `explainer-structure-depth`: Chapter, page, two section levels

```rule
id: explainer-structure-depth
scope: archetype:explainer
severity: error
```

- Sections nest at most two deep. Heading levels follow from the nesting; you set none.
- Content that needs more levels is two apps.

## `explainer-structure-by-sections`: Structure only by sections

```rule
id: explainer-structure-by-sections
scope: archetype:explainer
severity: error
```

The contents of a page, its anchors and the entry links of the catalog are made from sections.

- Every heading is a `section` block with `id` and `title`.
- A Markdown heading (`#`, `##`, an underlined line) in a text fails the build.

## `explainer-stable-ids`: Keep the ids

```rule
id: explainer-stable-ids
scope: archetype:explainer
severity: warning
```

Teachers link to pages and sections, and the catalog lists them by their ids.

- Give chapters, pages, sections and exercises short, telling ids ("prozentwert", "regel"), and keep them when the
  text changes.
- New content gets new ids. Never reuse a removed one.

## `explainer-navigation`: Every page in one chain

```rule
id: explainer-navigation
scope: archetype:explainer
severity: error
```

- The runtime builds the navigation from the order lists: every page is in one chain and reachable from the start
  page.
- A link in a text is a path from the app's root (`/prozent/grundwert/#regel`).

## `explainer-languages`: German first, every language complete

```rule
id: explainer-languages
scope: archetype:explainer
severity: error
```

- `languages` in `src/app.yaml` starts with German.
- Every text a learner reads (content, data files, props of components) is there in each declared language, and in
  no other. A missing translation fails the build.

## `explainer-readable-without-js`: Every page readable without JavaScript

```rule
id: explainer-readable-without-js
scope: archetype:explainer
severity: error
```

A page must teach the same on a school computer that blocks scripts and for a screen reader.

- Every fact stands in a block that shows without JavaScript. Nothing a learner needs is only inside an exercise or
  a component.
- Every component that is no exercise has a `nojs` text that says what it shows, with its content.

## `explainer-formulas-static`: Formulas as formulas

```rule
id: explainer-formulas-static
scope: archetype:explainer
severity: error
```

- Every formula is a `formula` block or inline `$…$`, never plain text (`W = G * p / 100`) and never a picture.
  The runtime renders it as MathML, which a screen reader reads.

## `explainer-generated-sound`: The property test passes

```rule
id: explainer-generated-sound
scope: archetype:explainer
severity: error
```

The build draws 200 tasks of each `generated` exercise and stops at the first that is wrong, naming its seed.

- `where` holds in at least one of ten draws; the answer is defined and fits its format for every draw; no mistake
  gives the same value as the answer.
- A failure for a seed: narrow `given` or change the mistake. Never loosen the comparison.

## `explainer-open-points`: An open task checks what the material teaches

```rule
id: explainer-open-points
scope: archetype:explainer
severity: warning
```

- An `open-task` has 2 to 5 points, each one sentence a learner can check with yes or no; together they are what a
  good answer needs.
- A point of the content names the section that teaches it (`source`). A point of form has `kind: form`.
- The model answer has every point, in the words of the class.

## `explainer-scope-matches`: The scope says what the pages teach

```rule
id: explainer-scope-matches
scope: archetype:explainer
severity: warning
```

The tutor judges open answers by the scope and stays within it.

- Write the `scope` of each page in your own words, never copied from the material: what the page teaches, no more
  and no less.
- `scope` in `src/app.yaml` also names what does not belong to the app and a learner or tutor might expect.
