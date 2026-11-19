# Components

- Only for what no block or `generated` can express (label a figure, drag into place). Blocks are readable without
  JS, accessible, tested by construction.
- Contents: Files · Block and props · `nojs` · Exercise contract · Look and layout · Rendering · Rules.

## Files (`src/components/`)

- Only `<Name>.vue`, `<Name>.ts`, `<Name>.test.ts`; PascalCase; no subfolders, no other files.
- Every `.vue`: `<script setup lang="ts">` and its `<Name>.test.ts` (run by `lernapps check`; `.vue` type-checked
  with `vue-tsc`).
- Exercise: logic in `<Name>.ts`. Shared helpers: a `<Name>.ts` here, imported with extension (`./Circuit.ts`).

## Block and props

- `type: vue-component`, `component: <Name>`, `props`, `nojs` (not for an exercise).
- `defineProps<{ … }>()`: `string`, `number`, `boolean`, literals, unions, arrays, object types of them; declared in
  the component or a local type alias. No `null`, no `undefined` union (make it optional), no imported alias.
- The build checks each block's `props`. A `string` prop is a learner text: a map with several languages.
- A list prop may be `{ data: <name> }`: the records of `src/data/<name>.yaml`, cut to the fields the item type declares
  (`events: { title: string }[]`). Each record needs them; a missing file or field fails the build. One data file,
  many blocks: never copy records into `props`. A field of a record may be a list or a record of values
  (`compounds: [{ formula, text }]`) for this; exercises and timelines use the flat fields.

## `nojs`

- Restricted Markdown: what it shows plus its content (diagram described, or task with solution); carries the
  meaning alone.
- Replaced once the component runs; `defineOptions({ nojs: "caption" })` keeps it folded as a description.
- Never in an exercise component (it would give the solution; build fails). Its text comes from `describe` for task 1.

## Exercise contract

- Emits `answer` → exercise. It is only the input: emit the learner's answer on every change (`undefined` while
  none). No own "Prüfen", no own `<form>`, no call of `check`: the explainer draws "Prüfen" under it (Enter in a field
  checks), calls `check`, `reason` and `show`, shows the feedback. Own controls ("Zurücksetzen", tools) stay, as
  `type="button"`. Optional prop `checked: boolean`: true once the current answer is checked.
- `answered` is gone: the build fails on it.
- Does not count as the page's required exercise: the page also needs a question or a `generated` exercise.
- `<Name>.ts`, pure: `generate(seed, props)`, `check(task, answer)` (boolean), `solution(task)`, `wrong(task)`,
  `reason(task, answer, props, lang)` (the app's message for a wrong answer from the props' texts, `undefined` for
  none; what does not fit, never the solution). A component shows nothing after "Prüfen" that gives the solution away. Check the asked property, not equality with `solution`.
- Build tests 50 fixed seeds per block: same task per seed, solution passes, wrong fails, nothing throws.
- `about.mistakes` from the same wrong answers as `examples.rejected`; `describe` states the task exactly as shown
  for that task number (no-JS text).
- For the tutor: `template(props, lang)` (task with `{name}`), `params(task, props, lang)` (inputs by name),
  `mistakes(task, props)` (per `about.mistakes` its one fixed answer, else `undefined`: never an invented example),
  `show(answer, task, props, lang)` (answer as text). An input of `params` that is no placeholder shows as
  "(verdeckt)": the tutor knows it, the child does not. One `template` per block: prefer one kind of task per block;
  else give the sentence that changes as an input (`{Aufgabe}`). `about.answer` names what the child does and "Prüfen". The build checks them against `check` for every number; rule `vue-component-tutor-table`. Model:
  `ProzentFeld` of the template, in `node_modules/@lernapps/app-templates/explainer/src/components/`.
- More: rule `vue-component-exercise-contract`, below.

## Look and layout

- The page's look comes from the explainer's variables; a component uses only them, never own colours for surfaces
  and text and never a fallback like `#fff`: `--page-text`, `--page-muted`, `--page-background`, `--page-surface`,
  `--page-border`, `--page-accent` and `--page-on-accent` (a control's colour and its text), `--page-right` and
  `--page-right-background`, `--page-wrong` and `--page-wrong-background`. They switch with the dark mode by themselves.
- Colours of the subject (two factors, a selected part) are the component's own: each with a text colour of enough
  contrast in light and dark, and a second mark besides the colour (a pattern, a label).
- The explainer's classes are not a layout kit: `.question-actions` and the classes of the explainer's forms mark
  behaviour the explainer and its tests rely on. Give the component its own classes: spacing of `0.5rem` between
  controls of a group, a wrapping row (`display: flex; flex-wrap: wrap; gap: 0.5rem`), a label above or beside its
  field with space between them, a reset on a row of its own.
- Each field is inside its `<label>` or named by one; each control works with the keyboard; a tap target is at least
  44 px high.
- The start state is part of the teaching: it shows first what stays the same (all pieces still there), the next
  action changes it (rule `explainer-control-purpose`).

## Rendering

- Server-rendered into the page, hidden until hydrated. First render identical on server and browser:
  `generate(1, props)`; randomness only in `onMounted`.
- No headings in its markup (also hidden parts). Texts via props, not strings in code.

## Rules

The build and the lint check these; a finding names the rule.

### `vue-component-props-valid`: Props as the component declares them

```rule
id: vue-component-props-valid
scope: archetype:explainer
severity: error
```

- `defineProps<{ … }>()` with types; each block passes exactly the declared props, of their types.

### `vue-component-nojs`: Every component block has its `nojs` text

```rule
id: vue-component-nojs
scope: archetype:explainer
severity: error
```

- Every non-exercise `vue-component` block: `nojs` in every language (exercise: from `describe`): what it shows
  and does, with content; same meaning without JS.
- Schema requires it; `lernapps check` finds empty or hidden ones (`explainer-readable-without-js`).

### `vue-component-exercise-contract`: An exercise component has its logic module

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

### `vue-component-tutor-table`: An exercise component declares its exercise for the tutor

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
- Example: `node_modules/@lernapps/app-templates/explainer/src/components/ProzentFeld.ts`, the template's.

### `vue-component-tested`: A test per component

```rule
id: vue-component-tested
scope: archetype:explainer
severity: error
```

- `src/components/<Name>.test.ts` per component, testing its logic: other right answers the text allows, typical
  wrong ones with reasons, edge cases. Run by `lernapps check`.

### `vue-component-no-network`: No network

```rule
id: vue-component-no-network
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- No request, no URL import: props or bundle.

### `vue-component-no-html-injection`: No code or HTML from strings

```rule
id: vue-component-no-html-injection
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- No `eval`, `new Function`, `innerHTML`, `v-html`: the template renders.

### `vue-component-imports`: Imports only from the allowed packages

```rule
id: vue-component-imports
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- Only `vue`, `@lernapps/app-templates`, `@lernapps/tooling/storage`, `i18n`, `a11y`, own folder. Types from
  anywhere.
- Interactive: also the app's `src/` files and its `dependencies`.

### `vue-component-browser-globals`: Browser globals only once mounted

```rule
id: vue-component-browser-globals
scope: [archetype:explainer, archetype:interactive]
severity: error
```

- `window`, `document`, `localStorage` etc. only in `onMounted` or later unmount hooks (server render has none).

### `vue-component-size`: Within 20 kB

```rule
id: vue-component-size
scope: archetype:explainer
severity: error
```

- Own code max 20 kB gzip. More → split, or a new block: write it into the retrospective.
