---
name: lernapps-quiz
description: Use when you build or change a quiz for lernapps.net (archetype quiz), or write the quiz-type exercises of an explainer. How the generated quiz works, what you write (only the question bank src/quiz.json), its languages, how content patterns are expressed in it, and how to write good questions, options, background knowledge and links. Load it together with lernapps-app before you write questions.
license: MIT
---

# Quiz

- You write only `src/quiz.json`; no code. Engine, six question types, feedback, scoring, order, accessibility,
  no-JS page: runtime `@lernapps/app-templates`.
- Schema: <https://lernapps.net/tooling/schemas/quiz.v1.schema.json>.
- Generated with the example bank "Naturwunder der Welt": replace it with the creator's questions.
- Explainer exercises use the same six types; the question rules apply there.

## Index

- [references/runtime.md](references/runtime.md): how the quiz runs, storage, tests, languages, failing runtime
  tests.
- [references/question-types.md](references/question-types.md): the six types, fields, `examples`, a full question.
- [references/rules.md](references/rules.md): the rules, before writing questions.

## Content in a quiz

- Load `.agents/skills/app-content/SKILL.md` first.
- Competency → one or more questions. Round → the questions of one chapter, adjacent in the bank.
- Bank = shared material: each fact in one question.
- Pattern → a question type with a fixed form of text, options, `info`, varied over a round's facts.
- Not expressible → no code; note under "Where I had to guess" (`quiz-only-data`); issue at
  <https://github.com/lernapps/app-templates/issues> if other quizzes need it.
