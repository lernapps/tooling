---
name: lernapps-quiz
description: Use in Code of a lernapps.net quiz whenever you write or change the question bank src/quiz.json, add a language, or a build or runtime test of the quiz fails. What you write, how the runtime shows and tests the bank, languages, and the quiz's technical rules. The question types and how to write good questions are in lernapps-content-questions.
license: MIT
---

# Quiz

- You write only `src/quiz.json`. Engine, question types, feedback, scoring, order, accessibility and the no-JS page
  come from the runtime `@lernapps/app-templates`.
- Schema: <https://lernapps.net/tooling/schemas/quiz.v1.schema.json>.
- `create` writes the example bank "Naturwunder der Welt": replace it with the planned questions.
- The fields of each question type and how to write good questions: skill `lernapps-content-questions`.

## Read when

- [references/runtime.md](references/runtime.md): before you add a language, and when a runtime test fails.
- [references/rules.md](references/rules.md): when a check names `quiz-only-data` or `quiz-stable-ids`.

## Gotchas

- The build validates the bank; the runtime's tests then answer every question in the browser. A runtime test that
  fails while the bank validates is a template bug (skill `lernapps-check`).
- Keep an `id` when its text changes: shared links use `#frage-<id>`.
