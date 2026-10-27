# Components

- Only for what no block or `generated` can express (label a figure, drag into place). Blocks are readable without
  JS, accessible, tested by construction.

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
  `ProzentFeld` of the template.
- More: rule `vue-component-exercise-contract`.

## Rendering

- Server-rendered into the page, hidden until hydrated. First render identical on server and browser:
  `generate(1, props)`; randomness only in `onMounted`.
- No headings in its markup (also hidden parts). Texts via props, not strings in code.

## Limits (build and lint check, same ids)

- No network: no `fetch`, XMLHttpRequest, WebSocket, EventSource, `sendBeacon`, URL imports.
- No `eval`, `new Function`, `innerHTML`, `v-html`.
- Imports: `vue`, `@lernapps/app-templates`, `@lernapps/tooling/storage`, `i18n`, `a11y`, own folder.
- Browser globals only in `onMounted` or later unmount hooks.
- Storage only via `createStorage`.
- Max 20 kB gzip own code (Vue not counted); more → split, or ask for a block.
