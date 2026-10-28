---
name: lernapps-quiz
description: Use in Code of a lernapps.net quiz whenever you write or change the question bank src/quiz.json, add a language, or a build or runtime test of the quiz fails. What you write, how the runtime shows and tests the bank, languages, and the quiz's technical rules. The question types and how to write good questions are in lernapps-content-questions.
license: MIT
---

# Quiz

- You write `src/quiz.json` and, for the content of its questions, the image files in `src/images/`. Engine, question
  types, feedback, scoring, order, accessibility and the no-JS page come from the runtime `@lernapps/app-templates`.
- Schema: `node_modules/@lernapps/app-templates/runtime/quiz/quiz.v1.schema.json`.
- `create` writes the example bank "Naturwunder der Welt": replace it with the planned questions.
- The fields of each question type and how to write good questions: skill `lernapps-content-questions`.

## Gotchas

- The build validates the bank; the runtime's tests then answer every question in the browser. A runtime test that
  fails while the bank validates is a template bug (skill `lernapps-cli`).

## Runtime

### Build and page

- Build reads, validates, renders every question into `index.html`, with the content it shows (`material`), and
  carries the images of `src/images/` to `images/`.
- No JS: a worksheet; all questions, then solutions with background and links.
- JS: one question at a time, right or wrong shown; then each option's `info` (right ones and the choice marked),
  the explanation, the links. Score and solutions at the end.
- Order shuffled by `?seed=42` (same link, same order). Deep link to a question: `#frage-<id>`.

### Storage

- Stores nothing, unless `"rememberLastResult": true`: then the last score stays on the device.

### Tests

- From the runtime (`e2e/quiz.e2e.ts`), run by `lernapps check`. Per question: deep link, a right and a wrong answer,
  every `info`, explanation and links shown. Also full score and the no-JS page.
- Each further language: its no-JS page (questions, solutions, switch) and one answered question in that language.
- New runtime features or fixes: `lernapps update` (skill `lernapps-cli`).

### A runtime test fails

- Bank validates (build passes) but a runtime test fails = template bug: act as skill `lernapps-cli` says.
- Never change the runtime in `node_modules` (`quiz-only-data`). Go on with the questions.
- A question shows an image or a table with `material`: skill `lernapps-content-questions`, its reference question-types.

### Languages

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

## Rules

### `quiz-only-data`: Write only the question bank and its images

```rule
id: quiz-only-data
scope: archetype:quiz
severity: error
```

- Change only `src/quiz.json` and add image files to `src/images/`. `index.html`, `src/main.ts`, `e2e/quiz.e2e.ts`,
  config as generated (`keep-the-preset`).
- Bank cannot say it → "Where I had to guess", never code around the runtime.

### `quiz-stable-ids`: Keep the ids

```rule
id: quiz-stable-ids
scope: archetype:quiz
severity: warning
```

- Short, telling `id` ("grand-canyon"); keep it when the text changes (shared links `#frage-<id>`).
- New question, new id; never reuse a removed one.
