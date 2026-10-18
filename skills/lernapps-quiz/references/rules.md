# Quiz rules

- Rules marked `archetype:explainer` too apply to the explainer's quiz-type exercises.

## `quiz-only-data`: Write only the question bank

```rule
id: quiz-only-data
scope: archetype:quiz
severity: error
```

- Change only `src/quiz.json`. `index.html`, `src/main.ts`, `e2e/quiz.e2e.ts`, config as generated
  (`keep-the-preset`).
- Bank cannot say it → "Where I had to guess", never code around the runtime.

## `quiz-bank-valid`: The question bank validates

```rule
id: quiz-bank-valid
scope: [archetype:quiz, archetype:explainer]
severity: error
```

- Valid against the schema. Build also checks: exactly one correct in single choice, at least one in multiple
  choice; unique ids and options.
- Broken bank: one line per problem (position, id); fix in `src/quiz.json`. Explainer exercise: named by file and
  block path.

## `quiz-clear-question`: One clear question at a time

```rule
id: quiz-clear-question
scope: [archetype:quiz, archetype:explainer]
severity: warning
```

- One thing per question, answerable before reading the options.
- Positive; avoid "nicht", never two negations. No trick questions.
- Plain, short sentences in every language (`learner-text-german`).

## `quiz-plausible-options`: Options a learner could believe

```rule
id: quiz-plausible-options
scope: [archetype:quiz, archetype:explainer]
severity: warning
```

- Wrong options: real things of the same kind (river for river), with true background.
- Alike in length and form. No "Alle genannten", "Keine davon", jokes. Three or four options.

## `quiz-feedback-explains`: Background and explanation say why

```rule
id: quiz-feedback-explains
scope: [archetype:quiz, archetype:explainer]
severity: hint
```

- Every option: `info`, 1–3 sentences about the option, true either way ("Der Nil fließt durch mehrere Länder
  Afrikas und mündet in Ägypten ins Mittelmeer."). Wrong option: also why it does not fit.
- `explanation`: 1–3 sentences why the answer is right; for true/false, number, ordering, matching also the
  background.
- `number`: typical wrong numbers as `mistakes` (`answer`, `message`). Any question: optional `hint`, not the answer.

## `quiz-further-reading`: Every question links to further reading

```rule
id: quiz-further-reading
scope: archetype:quiz
severity: warning
```

- At least one link per question, best German Wikipedia (`https://de.wikipedia.org/wiki/...`).
- Read every linked page before committing: the meant article (no "Begriffsklärung"); says what question and
  options say.
- Link resolution: leave to `lernapps check`. No scraper, script or API loop.
- HTTP 429 → tell the creator which, mark facts "not checked" in the plan, go on.
- `title` names the page ("Uluru (Wikipedia)"). Never guess an address.

## `quiz-own-words`: Write in your own words

```rule
id: quiz-own-words
scope: archetype:quiz
severity: warning
```

- Facts, never sentences: Wikipedia is CC BY-SA (copying needs attribution and relicenses).
- `info`, `explanation`: new, shorter, plainer, for the app's school year. Sources in `sources`
  (`third-party-licence`).

## `quiz-number-precision`: Numbers with unit and rounding

```rule
id: quiz-number-precision
scope: [archetype:quiz, archetype:explainer]
severity: warning
```

- The text says how exact ("Bis zu 100 m daneben zählt noch als richtig"); `tolerance` matches it.
- Unit in `unit`, not in the answer.
- Sources differ → tolerance covers them.

## `quiz-fitting-type`: The type that fits the question

```rule
id: quiz-fitting-type
scope: [archetype:quiz, archetype:explainer]
severity: hint
```

- One fact among things of a kind: `single-choice`; several facts: `multiple-choice`; estimate a size: `number`;
  compare sizes or dates: `ordering`; connect: `matching`; judge a statement: `true-false`.
- Mix types. Type must accept every answer the text allows (`ordering` only for a fixed order; skill
  `lernapps-exercise-patterns`, `references/success.md`).

## `quiz-answers-checked`: Check every fact

```rule
id: quiz-answers-checked
scope: archetype:quiz
severity: hint
```

- Check every marked option, number and `info` against the linked article before committing.
- Source not openable → say so in the plan, mark "not checked"; never fill from memory.
- Learners report errors via `.github/ISSUE_TEMPLATE/inhaltsfehler.yml`.

## `quiz-stable-ids`: Keep the ids

```rule
id: quiz-stable-ids
scope: archetype:quiz
severity: warning
```

- Short, telling `id` ("grand-canyon"); keep it when the text changes (shared links `#frage-<id>`).
- New question, new id; never reuse a removed one.
