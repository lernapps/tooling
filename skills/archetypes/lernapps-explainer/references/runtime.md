# Explainer runtime

## Build

- Reads, validates, renders every page to static HTML.
- Problem → one line `file:line: place (language): what to do`, e.g.
  `src/prozent/prozentwert.yaml:12: blocks[0].blocks[1].text: a Markdown heading ("Regel"); use a section block with the title "Regel"`.
  Fix where it points.

## Pages

- No JS: complete; text, formulas as MathML, figures, tables, navigation, sources. Exercise: task + `<details>`
  "Lösung"; `generated`: three worked tasks; component: its `nojs` text.
- JS: controls, "Prüfen", feedback with focus. Solution only after an answer; wrong → why, retry or "Lösung".
  `generated`: live task, "Neue Aufgabe", deep link `/<chapter>/<page>/?<exercise>=<n>#<exercise>`. Components
  hydrate.
- Stores only the assistant the learner switched on for the tutor, on the device, per app.

## Addresses

- Page `/<chapter>/<page>/`; section `#<section>`, subsection `#<section>/<sub>`; exercise `#<exercise>`.
- Glossary `/glossar/`. Other languages: same tree under `/<language>/`.
- Tutor page of a page: `/<chapter>/<page>/tutor/`, its Markdown beside it (`index.md`).
- Unknown address → 404 page to the start page. Moving or removing a page: change the entry topics in the same
  increment.

## Tests

- From the runtime (`e2e/explainer.e2e.ts`, `explainerTests()`), every page, every language, run by
  `lernapps check`.
- No JS: headings vs nesting, sections, formulas, figures, anchors, navigation chain, languages, every solution,
  every `nojs` text.
- JS (German, 360 px): one exercise per type and page accepts its answer, rejects a wrong one; components hydrate
  without error.
- `lernapps check` also opens every page without JS (`explainer-readable-without-js`), bundle and deployed app.

## A runtime test fails

- Content validates (build passes) but a test fails = template bug: act as skill `lernapps-check` says; go on with
  content.
- Never change the runtime in `node_modules` (`explainer-only-content`). The fix arrives with `lernapps update`.

## Tutor

- The learner's own assistant, after a click; the app sends nothing. The learner switches one on once (start page or
  beside a page's title; `tutor.providers`, else Claude, ChatGPT, Le Chat, or copying the text), kept on the device.
- Way A, "Mit <name> lernen" beside the title: one sentence naming the page's tutor page with the page's task
  numbers. Way B, "Hilfe" ("Warum?" after a wrong answer) in every exercise: the task, the input and the app's
  message. "Zurück" copies a result line back into the chat.
- The tutor page is the one source of what the tutor gets, written by the build from the content: guide, the page's
  content, every task of every exercise (`generated`: template and a table of each number's values, solution and
  mistakes; component: `describe` per number, as far as 64 kB allow, `about`). No `tutor.md`, no task files, no
  `llms.txt`.
- Assistants fetch only addresses the user wrote: the tutor page is the one address. `tutor.rules` (in `src/app.yaml`)
  adds the app's rules there and must not send the tutor anywhere else.
- Numbered tasks: distinct tasks of an exercise, max 67, "Aufgabe Nr. 1" to N, link `?<id>=<n>#<id>`.
- Page address holds each seeded exercise's task number (`?<id1>=3&<id2>=12`), written on load and on "Neue
  Aufgabe". `seed`, `von`, `uebung`, `abschnitt` are no exercise ids; `?seed=<n>#<id>` still works.
- Changing a generator changes what shared numbers point to.
