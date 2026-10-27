---
name: lernapps-content-questions
description: Use in Code whenever you write or review questions with options and feedback for a lernapps.net app - the question bank of a quiz, or the quiz-type exercises of an explainer. The fields of the six question types, and how to write one clear question, options a learner could believe, feedback that explains, further reading, numbers with unit and rounding, and how to check every fact.
license: MIT
---

# Writing questions

- Read [references/question-types.md](references/question-types.md) before you write the first question of a type:
  the fields of each type, the same in a quiz and in an explainer.
- Write all questions of a round, then check every fact against its linked page, then commit.

## Gotchas

- Read every page you link before you commit: the meant article (no "Begriffsklärung"), saying what question and
  options say.
- Never guess an address. Never fill a fact from memory.
- Link resolution is the check's job: no scraper, script or API loop over the links.

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

- Wrong options are real things of the same kind (a river for a river), with true background.
- Options alike in length and form. No "Alle genannten", "Keine davon" or jokes. Three or four options.

## `quiz-feedback-explains`: Background and explanation say why

```rule
id: quiz-feedback-explains
scope: [archetype:quiz, archetype:explainer]
severity: hint
```

- Every option has an `info` of 1–3 sentences about the option, true either way ("Der Nil fließt durch mehrere
  Länder Afrikas und mündet in Ägypten ins Mittelmeer."). A wrong option's `info` also says why it does not fit.
- `explanation`: 1–3 sentences why the answer is right; for true-false, number, ordering and matching also the
  background.
- `number`: typical wrong numbers as `mistakes` (`answer`, `message`). Any question: an optional `hint`, not the
  answer.
- A wrong answer's `message` (and an exercise component's `reason`) says what does not fit and where to look, never
  the solution itself: the solution comes after the answer, with "Lösung" or the tutor.

## `quiz-further-reading`: Every question links to further reading

```rule
id: quiz-further-reading
scope: archetype:quiz
severity: warning
```

- At least one link per question, best the German Wikipedia (`https://de.wikipedia.org/wiki/...`).
- `title` names the page ("Uluru (Wikipedia)").
- HTTP 429 → tell the creator which; mark the facts "not checked" in the plan; go on.

## `quiz-own-words`: Write in your own words

```rule
id: quiz-own-words
scope: archetype:quiz
severity: warning
```

- Take facts, never sentences: Wikipedia is CC BY-SA (copying needs attribution and relicenses).
- `info` and `explanation`: new, shorter, plainer, for the app's school year. Sources in `sources`
  (`third-party-licence`).

## `quiz-number-precision`: Numbers with unit and rounding

```rule
id: quiz-number-precision
scope: [archetype:quiz, archetype:explainer]
severity: warning
```

- The text says how exact the answer must be ("Bis zu 100 m daneben zählt noch als richtig"); `tolerance` matches
  it.
- The unit goes into `unit`, not into the answer.
- Sources differ → the tolerance covers them.

## `quiz-fitting-type`: The type that fits the question

```rule
id: quiz-fitting-type
scope: [archetype:quiz, archetype:explainer]
severity: hint
```

- One fact among things of a kind: `single-choice`; several facts: `multiple-choice`; estimate a size: `number`;
  compare sizes or dates: `ordering`; connect: `matching`; judge a statement: `true-false`.
- Mix the types. The type must accept every answer the text allows (`ordering` only for a fixed order).

## `quiz-answers-checked`: Check every fact

```rule
id: quiz-answers-checked
scope: archetype:quiz
severity: hint
```

- Check every marked option, number and `info` against the linked article before you commit.
- A source does not open → say so in the plan, mark it "not checked"; never fill it from memory.
- Learners report errors through `.github/ISSUE_TEMPLATE/inhaltsfehler.yml`.
