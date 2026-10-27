# Explainer runtime

## Build

- Reads, validates, renders every page to static HTML.
- Problem → one line `file:line: place (language): what to do`, e.g.
  `src/prozent/prozentwert.yaml:12: blocks[0].blocks[1].text: a Markdown heading ("Regel"); use a section block with the title "Regel"`.
  Fix where it points.

## Pages

- No JS: complete; text, formulas as MathML, figures, tables, navigation, sources. Exercise: task + `<details>`
  "Lösung"; `generated`: three worked tasks; component: its `nojs` text.
- JS: controls, "Prüfen", feedback with focus. Solution only after an answer; wrong → why, retry or "Lösung". An
  exercise component gets "Prüfen" from the explainer too, under it.
  `generated`: live task, "Neue Aufgabe", deep link `/<chapter>/<page>/?<exercise>=<n>#<exercise>`. Components
  hydrate.
- Video: no JS and before a click, title as a link to youtube.com, channel and a note that playing sends data to
  YouTube/Google; nothing loads from another server. "Video abspielen" loads the player from youtube-nocookie.com.
- Stores on the device, per app, only the assistant the learner switched on for the tutor and, once ticked, "Videos
  immer direkt laden" (every player loads without the click until unticked).

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
  without error; a video sends no request to another server before its click, and loads its player after it.
- `lernapps check` also opens every page without JS (`explainer-readable-without-js`), bundle and deployed app.

## A runtime test fails

- Content validates (build passes) but a test fails = template bug: act as skill `lernapps-check` says; go on with
  content.
- Never change the runtime in `node_modules` (`explainer-only-content`). The fix arrives with `lernapps update`.

## Tutor

- Optional: the learner's own KI assistant helps with a page and with each exercise. The build writes a tutor page
  per page from the content; the app sends nothing.
- The tutor reads the page's blocks as text (figures by `alt` and `caption`, a video as a link with title and channel)
  and every exercise: task, answer format, solution, `hint` and typical mistakes with their messages. `generated`: template, `steps`, `mistakes` and each task
  number's values; question: options with `info`, `explanation`; component: `about`, and with `template`, `params`, `mistakes`, `show`
  the same table as `generated` (else `describe` per task number, as far as 64 kB allow).
  It neither calculates nor invents: these must be complete and right.
- `src/app.yaml`: `tutor.rules`, the app's rules for the tutor; never send it to another address.
- Task numbers 1 to N (max 67) are what learner, tutor and address (`?<id>=<n>`) share; changing a generator changes
  what a number points to. `seed`, `von`, `uebung`, `abschnitt` are no exercise ids.
