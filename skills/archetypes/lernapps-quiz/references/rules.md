# Quiz rules

- The rules for questions, `quiz-bank-valid` included: skill `lernapps-content-questions`.

## `quiz-only-data`: Write only the question bank

```rule
id: quiz-only-data
scope: archetype:quiz
severity: error
```

- Change only `src/quiz.json`. `index.html`, `src/main.ts`, `e2e/quiz.e2e.ts`, config as generated
  (`keep-the-preset`).
- Bank cannot say it → "Where I had to guess", never code around the runtime.

## `quiz-stable-ids`: Keep the ids

```rule
id: quiz-stable-ids
scope: archetype:quiz
severity: warning
```

- Short, telling `id` ("grand-canyon"); keep it when the text changes (shared links `#frage-<id>`).
- New question, new id; never reuse a removed one.
