# Explainer rules

- Quiz-type exercises: the rules of skill `lernapps-content-questions`.
- The rules for planning pages, figures and numbers: skill `lernapps-explainer-design`.

## `explainer-only-content`: Write only the content

```rule
id: explainer-only-content
scope: archetype:explainer
severity: error
```

- Write: YAML of app, chapters, pages, data; images in `src/images/`; components with logic and tests in
  `src/components/`.
- `src/main.ts`, `index.html`, `e2e/explainer.e2e.ts`, config as generated (`keep-the-preset`). Any other file in
  `src/` fails the build.
- Not expressible → "Where I had to guess", never code around the runtime.

## `explainer-content-valid`: The content validates

```rule
id: explainer-content-valid
scope: archetype:explainer
severity: error
```

- Schema-valid; ids unique per level; references exist (data file, image, component, page or section link);
  placeholders declared; formulas only from the command list.
- Build names each problem with file, line, block path.

## `explainer-structure-complete`: Every chapter and page listed once

```rule
id: explainer-structure-complete
scope: archetype:explainer
severity: error
```

- At least one chapter.
- Every chapter folder in `chapters` of `src/app.yaml`, every page file in `pages` of its `chapter.yaml`, exactly
  once, in reading order.

## `explainer-structure-depth`: Chapter, page, two section levels

```rule
id: explainer-structure-depth
scope: archetype:explainer
severity: error
```

- Sections at most two deep. No heading levels set: they follow from nesting. More levels = two apps.

## `explainer-structure-by-sections`: Structure only by sections

```rule
id: explainer-structure-by-sections
scope: archetype:explainer
severity: error
```

- Every heading = a `section` block with `id`, `title`.
- A Markdown heading (`#`, `##`, underlined) in a text fails the build.

## `explainer-stable-ids`: Keep the ids

```rule
id: explainer-stable-ids
scope: archetype:explainer
severity: warning
```

- Short, telling ids ("prozentwert", "regel") for chapters, pages, sections, exercises; keep them when texts
  change (entry topics, teachers' links).
- New content, new ids; never reuse a removed one.

## `explainer-navigation`: Every page in one chain

```rule
id: explainer-navigation
scope: archetype:explainer
severity: error
```

- Navigation is the runtime's: from the order lists; every page in one chain, reachable from the start page.
- Prose links: paths from the app root.
- `lernapps check` finds unreachable pages (`pages-reachable`) and entry topics with a missing `#<section>`
  (`entry-links-resolve`).

## `explainer-languages`: German first, every language complete

```rule
id: explainer-languages
scope: archetype:explainer
severity: error
```

- `languages`, German first.
- Every learner text (content, data files, component props) in each, no other. Build fails otherwise.

## `explainer-readable-without-js`: Every page readable without JavaScript

```rule
id: explainer-readable-without-js
scope: archetype:explainer
severity: error
```

- Every fact in a block, visible without JS. No meaning only inside an exercise or component.
- Every component a `nojs` text: what it shows, its content.
- `lernapps check` opens every explainer page again with JS off, bundle and deployed (listing and review too):
  headings, formulas, figures visible, figures named; every "Lösung" and `nojs` text not empty.

## `explainer-formulas-static`: Formulas as formulas

```rule
id: explainer-formulas-static
scope: archetype:explainer
severity: error
```

- Every formula in a `formula` block or `$…$`; never plain text (`W = G * p / 100`) or a picture. MathML for
  screen readers.

## `explainer-generated-sound`: The property test passes

```rule
id: explainer-generated-sound
scope: archetype:explainer
severity: error
```

- `given`, `where`: `where` holds often; answer defined and in format for every draw; no mistake can equal it.
- Failure names the seed: narrow `given` or change the mistake; never the comparator.

## `vue-component-props-valid`: Props as the component declares them

```rule
id: vue-component-props-valid
scope: archetype:explainer
severity: error
```

- `defineProps<{ … }>()` with types; each block passes exactly the declared props, of their types.

## `vue-component-nojs`: Every component block has its `nojs` text

```rule
id: vue-component-nojs
scope: archetype:explainer
severity: error
```

- Every non-exercise `vue-component` block: `nojs` in every language (exercise: from `describe`): what it shows
  and does, with content; same meaning without JS.
- Schema requires it; `lernapps check` finds empty or hidden ones (`explainer-readable-without-js`).

## `vue-component-exercise-contract`: An exercise component has its logic module

```rule
id: vue-component-exercise-contract
scope: archetype:explainer
severity: error
```

- Emits `answer` → `src/components/<Name>.ts` with pure, deterministic `generate(seed, props)`,
  `check(task, answer)`, `solution(task)`, `wrong(task)`, `reason(task, answer, props, lang)`; property test passes.
- Emits no `answered` (the old contract): the explainer draws "Prüfen" and checks; a component draws none.
- Block lists `examples` with at least one `accepted` and one `rejected`, `{ answer, seed? }` in the shape of
  `check` (no seed: seeds 1–50), incl. another correct answer where the text allows.
- Declares prop `seed: number`, shows `generate(seed, props)`. The explainer gives the seed, shows "Aufgabe Nr.",
  "Neue Aufgabe", keeps `?<id>=<n>`: never draw a seed or offer "next" inside.
- Also exports `describe(task, props, lang)` → `{ task, solution }` (restricted Markdown, task exactly as shown) and
  `about = { task, answer, correct, mistakes }` (texts by language). The tutor reads only these (the tutor page, no-JS
  text).
- Any exercise may carry `examples: { accepted, rejected }`; `generated`: expressions of `given` and `answer`, per
  seed (e.g. `reverse(answer)`).
- With `template`, `params`, `mistakes` and `show` (all four or none, rule `vue-component-tutor-table`): `check`
  accepts the solution and rejects each mistake's answer, `params` gives the same names for every task, each
  placeholder of `template` is one of them.

## `vue-component-tutor-table`: An exercise component declares its exercise for the tutor

```rule
id: vue-component-tutor-table
scope: archetype:explainer
severity: hint
```

- The logic module also exports `template(props, lang)`: the task once, `{name}` for each input;
  `params(task, props, lang)`: the inputs by name (`{ G: 1260, p: 15 }`), numbers or texts, the same names for every
  task; `mistakes(task, props)`: per `about.mistakes`, in order, the answer it gives, `undefined` where none;
  `show(answer, task, props, lang)`: an answer as text, short ("C", "3 Kästchen").
- The tutor page then has the task once, the mistakes as F1, F2 … and a table of every number (inputs, solution,
  each mistake), like `generated`. Without them: each number's `describe` as far as 64 kB allow, and the build's hint
  names the block.
- Example: `src/components/ProzentFeld.ts` of the template.

## `vue-component-tested`: A test per component

```rule
id: vue-component-tested
scope: archetype:explainer
severity: error
```

- `src/components/<Name>.test.ts` per component, testing its logic: other right answers the text allows, typical
  wrong ones with reasons, edge cases. Run by `lernapps check`.

## `vue-component-no-network`: No network

```rule
id: vue-component-no-network
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- No request, no URL import: props or bundle.

## `vue-component-no-html-injection`: No code or HTML from strings

```rule
id: vue-component-no-html-injection
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- No `eval`, `new Function`, `innerHTML`, `v-html`: the template renders.

## `vue-component-imports`: Imports only from the allowed packages

```rule
id: vue-component-imports
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- Only `vue`, `@lernapps/app-templates`, `@lernapps/tooling/storage`, `i18n`, `a11y`, own folder. Types from
  anywhere.
- Interactive: also the app's `src/` files and its `dependencies`.

## `vue-component-browser-globals`: Browser globals only once mounted

```rule
id: vue-component-browser-globals
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- `window`, `document`, `localStorage` etc. only in `onMounted` or later unmount hooks (server render has none).

## `vue-component-size`: Within 20 kB

```rule
id: vue-component-size
scope: archetype:explainer
severity: error
```

- Own code max 20 kB gzip. More → split, or a new block: write it into the retrospective.
