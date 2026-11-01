---
name: lernapps-quiz-design
description: Use in Explore right after choosing the `quiz` archetype - how the content of a lernapps.net quiz maps onto rounds, question types and patterns, which the plan then applies.
license: MIT
---

# Designing a quiz

## What a quiz is

- One page of questions with options and feedback. The runtime shows one question at a time, then each option's
  background, the explanation and links; the score at the end. Without JavaScript: a worksheet with solutions.
- You will write the question bank `src/quiz.json` and, for what a question shows, image files in `src/images/`;
  no code (`quiz-only-data`).

## Can and cannot

- The README of the template says it: `node_modules/@lernapps/app-templates/quiz/README.md` (in the folder `init` made).
  Read it before this skill's mapping, if you have not yet.

## Map the content

- A chapter → a round: the questions of one chapter, next to each other in the bank.
- A competency → one or more questions.
- The bank is the shared material: each fact in one question.
- A pattern → one question type with a fixed form of text, options and background, varied over a round's facts.
- Not expressible as a question → no code: note it under "Where I had to guess"; an issue at
  <https://github.com/lernapps/app-templates/issues> if other quizzes need it.

## Question types

| `type` | The learner |
|---|---|
| `single-choice` | chooses one option |
| `multiple-choice` | chooses every correct option |
| `true-false` | judges a statement |
| `number` | types a number, within a tolerance |
| `ordering` | puts items in their fixed order |
| `matching` | matches left to right |

- Which pattern fits which competency: skill `lernapps-exercise-patterns`.

## Decide

- Languages: German; English as a second language is supported. Each declared language complete.
- Keep the last score on the device (`rememberLastResult`) or nothing. Keeping it → the entry says
  `fitness.storage: device`.
- Order: shuffled per seed; a link with `?seed=42` gives every learner the same order.
