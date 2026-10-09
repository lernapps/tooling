---
name: lernapps-quiz
description: Use when you build or change a quiz for lernapps.net (archetype quiz). How the generated quiz works, what you write (only the question bank src/quiz.json), and how to write good questions, options and feedback. Load it together with lernapps-app before you write questions.
license: MIT
---

# Building a quiz

A quiz from the archetype `quiz` is a deep scaffold: the engine, the six types of questions, feedback, scoring, the
order, accessibility and the page without JavaScript are built in (`@lernapps/tooling/quiz`). You write the
questions and their options as data in `src/quiz.json`; you write no code. The rules of `lernapps-app` apply too.

## How the quiz works

- `lernapps create --archetype quiz` writes the app with an example bank. Replace the example in `src/quiz.json`
  with the creator's questions. The schema (`"$schema"` in the file) describes every field:
  <https://lernapps.net/tooling/schemas/quiz.v1.schema.json>.
- The build reads the bank, validates it and renders every question into `index.html`. Without JavaScript the page
  is a worksheet: all questions, then the solutions with explanations. With JavaScript the learner answers one
  question at a time, sees right or wrong and the feedback of the chosen options, and at the end the score and the
  solutions.
- The order is shuffled by the seed in the address (`?seed=42`): the same link gives the same order. A deep link
  opens one question: `#frage-<id>`.
- The quiz stores nothing. With `"rememberLastResult": true` it keeps the last score on the device and shows it at
  the end; then the entry's `fitness.storage` is `device`.
- Your end-to-end tests are generated (`e2e/quiz.e2e.ts`): for every question of your bank, its deep link, a right
  and a wrong answer, the full score, and the page without JavaScript. `lernapps check` runs them.

## Types of questions

| `type` | The learner | You write |
|---|---|---|
| `single-choice` | chooses one option | `options`: exactly one with `"correct": true`; `feedback` for each |
| `multiple-choice` | chooses every correct option | `options`: at least one correct; `feedback` for each |
| `true-false` | judges a statement | `answer` (true or false); `feedback` for `true` and `false` |
| `number` | types a number (comma or point) | `answer`, `tolerance` (0 for exact), `unit` if any |
| `ordering` | gives each item its place | `items` in the right order; the page mixes them |
| `matching` | matches each left entry with a right one | `pairs` as they belong; the page mixes the right entries |

Every question has an `id`, its `text` and an `explanation` of the right answer.

## Rules

Each rule is a section headed by its rule block. All rules: <https://lernapps.net/tooling/rules/>.

### `quiz-only-data`: Write only the question bank

```rule
id: quiz-only-data
scope: archetype:quiz
severity: error
```

Change `src/quiz.json` and nothing of the quiz's code: keep `index.html`, `src/main.ts`, `e2e/quiz.e2e.ts` and the
configuration as generated (`keep-the-preset`). If the quiz needs something the bank cannot say, write it under
"Where I had to guess" in the retrospective instead of coding around the engine.

### `quiz-bank-valid`: The question bank validates

```rule
id: quiz-bank-valid
scope: archetype:quiz
severity: error
```

The bank validates against its schema, and the build checks what the schema cannot: exactly one correct option in a
single choice, at least one in a multiple choice, ids and options that appear only once. A broken bank fails the
build with one line per problem, naming the question by its position and id. Fix each one in `src/quiz.json`.

### `quiz-clear-question`: One clear question at a time

```rule
id: quiz-clear-question
scope: archetype:quiz
severity: warning
```

Ask one thing per question, complete in itself: the learner knows what to answer before reading the options. Ask
positively; avoid "nicht" in the question, and never two negations. No trick questions: test what the app teaches,
not careful reading. Plain German, short sentences (`learner-text-german`).

### `quiz-plausible-options`: Wrong options a learner could believe

```rule
id: quiz-plausible-options
scope: archetype:quiz
severity: warning
```

Take every wrong option from a real mistake: a typical misconception, a common slip in calculating, a confusion of
terms. Make all options alike in length, form and detail, so that the right one does not stand out. No "Alle
genannten" or "Keine davon", no joke options. Three or four options are enough.

### `quiz-feedback-explains`: Feedback says why

```rule
id: quiz-feedback-explains
scope: archetype:quiz
severity: error
```

Every option's feedback says why the option is right or wrong; "Falsch" alone is not feedback. For a wrong option,
name the mistake behind it and point the way, e.g. "Du hast nur den Nenner geteilt. Beim Kürzen teilst du Zähler
und Nenner durch dieselbe Zahl." The `explanation` shows how to reach the right answer, in one to three sentences.

### `quiz-number-precision`: Numbers with unit and rounding

```rule
id: quiz-number-precision
scope: archetype:quiz
severity: warning
```

A `number` question says in its text how exactly to answer ("Runde auf eine Stelle nach dem Komma") and names the unit
in `unit`, not in the learner's answer. Match `tolerance` to that rounding: half of the last place asked for (0.05
for one decimal place), 0 for whole numbers that must be exact.

### `quiz-fitting-type`: The type that fits the question

```rule
id: quiz-fitting-type
scope: archetype:quiz
severity: hint
```

Choose the type from what the learner should do: compute (`number`, not options to guess from), put steps or sizes
in order (`ordering`), connect terms (`matching`), decide about a statement (`true-false`). Mix types across the quiz.

### `quiz-answers-checked`: Check every answer

```rule
id: quiz-answers-checked
scope: archetype:quiz
severity: hint
```

Compute every number and check every marked option before you commit; for facts, note the source in the plan
(`third-party-licence` when you take content from others). Learners report errors through the issue form the
generator wrote (`.github/ISSUE_TEMPLATE/inhaltsfehler.yml`).

### `quiz-stable-ids`: Keep the ids

```rule
id: quiz-stable-ids
scope: archetype:quiz
severity: warning
```

Give each question a short, telling `id` ("brueche-kuerzen") and keep it when you change the text: teachers share
links to single questions (`#frage-<id>`). Give a new question a new id; never reuse the id of a removed one.
