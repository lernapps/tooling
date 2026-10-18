# Quiz runtime

## Build and page

- Build reads, validates, renders every question into `index.html`.
- No JS: a worksheet; all questions, then solutions with background and links.
- JS: one question at a time, right or wrong shown; then each option's `info` (right ones and the choice marked),
  the explanation, the links. Score and solutions at the end.
- Order shuffled by `?seed=42` (same link, same order). Deep link to a question: `#frage-<id>`.

## Storage

- Stores nothing. `"rememberLastResult": true` keeps the last score on the device → entry `fitness.storage: device`.

## Tests

- From the runtime (`e2e/quiz.e2e.ts`), run by `lernapps check`. Per question: deep link, a right and a wrong answer,
  every `info`, explanation and links shown. Also full score and the no-JS page.
- Each further language: its no-JS page (questions, solutions, switch) and one answered question in that language.
- New runtime features or fixes: `lernapps update` (`checks-pass`).

## A runtime test fails

- Bank validates (build passes) but a runtime test fails = template bug: act as `checks-pass` says.
- Never change the runtime in `node_modules` (`quiz-only-data`). Go on with the questions.

## Languages

- German; more with `"languages": ["de", "en"]`, German first (runtime texts: de, en).
- Then every learner text is a map with each language: title, intro, source titles; per question text, options,
  `info`, items, pairs, unit, explanation, link titles.
- Without `languages`: German strings.
- Link `url`: one address, or a map per language (own Wikipedia).
- Build errors, one line each, e.g.
  `questions[1].explanation (en) (question "totes-meer"): the translation is missing; write the text as a map: { de: …, en: … }`;
  undeclared language: `… is not a language of the app; declare it in languages in src/quiz.json, or remove it`;
  `languages[0]: German comes first`.
- Pages: German `index.html`, others `<language>/index.html`, with `lang`, `hreflang`, a no-JS language switch.

```json
{
  "id": "totes-meer",
  "type": "true-false",
  "text": { "de": "Im Toten Meer kann man nicht untergehen.", "en": "You cannot sink in the Dead Sea." },
  "answer": true,
  "explanation": {
    "de": "Das Wasser ist so salzig, dass ein Mensch an der Oberfläche treibt.",
    "en": "The water is so salty that a person floats on the surface."
  },
  "links": [
    { "title": { "de": "Totes Meer (Wikipedia)", "en": "Dead Sea (Wikipedia)" }, "url": "https://de.wikipedia.org/wiki/Totes_Meer" }
  ]
}
```
