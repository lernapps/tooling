# Explainer runtime

## Build

- Reads, validates, renders every page to static HTML.
- Problem → one line `file:line: place (language): what to do`, e.g.
  `src/prozent/prozentwert.yaml:12: blocks[0].blocks[1].text: a Markdown heading ("Regel"); use a section block with the title "Regel"`.
  Fix where it points.

## Pages

- No JS: complete; text, formulas as MathML, figures, tables, navigation, sources. Exercise: task + `<details>`
  "Lösung"; `generated`: three worked tasks; component: its `nojs` text.
- JS: controls, "Prüfen", feedback with focus. Solution only after an answer; wrong → why, retry or "Lösung zeigen".
  `generated`: live task, "Neue Aufgabe", deep link `/<chapter>/<page>/?seed=<n>#<exercise>`. Components hydrate.
- Stores nothing.

## Addresses

- Page `/<chapter>/<page>/`; section `#<section>`, subsection `#<section>/<sub>`; exercise `#<exercise>`.
- Glossary `/glossar/`. Other languages: same tree under `/<language>/`. Each tree has an `llms.txt`.
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

- Build writes from the content: tutor notes in `llms.txt`, a `tutor.md` per page (each exercise: task, answer
  format, solution, `hint`, mistakes, numbered tasks with links), a tutor prompt. Start page: "Mit einem KI-Tutor
  lernen".
- Numbered tasks: distinct tasks of an exercise, max 67, "Aufgabe Nr. 1" to N, link `?<id>=<n>#<id>`.
- `src/app.yaml`: `tutor.rules` (app rules), `tutor.providers` (assistants). The app sends nothing.
- Page address holds each seeded exercise's task number (`?<id1>=3&<id2>=12`), written on load and on "Neue
  Aufgabe". `seed`, `von` are no exercise ids; `?seed=<n>#<id>` still works.
- Changing a generator changes what shared numbers point to.
- Every page ends with the tutor button + select (providers, Claude first, "Prompt kopieren"); the choice is kept
  on the device.
- The page prompt holds its address and the solved tasks of its numbers; no fetch needed.
- Assistants fetch only addresses the user wrote: the short prompt lists every fetchable address (`llms.txt`, each
  tutor file). `tutor.rules` must not send the tutor anywhere else.
