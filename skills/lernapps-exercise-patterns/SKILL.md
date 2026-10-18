---
name: lernapps-exercise-patterns
description: Use when you design the exercises of a learning app for lernapps.net, or add one that no pattern of the app fits. Reusable exercise concepts in three levels - shared data files, patterns written down once in the app's content guide and varied per use, and a component or an issue for what the content notation cannot express - with a catalogue of patterns that worked, by subject (references/patterns.md). For every archetype.
license: MIT
---

# Exercise patterns

- Learners act on every page or round (`learners-act`).
- Learners derive, not only read off: show how a value comes about (tree diagram, step, model), then let them do it.
- Content guide `.agents/skills/app-content/SKILL.md` names the app's patterns; it takes precedence.
- Three levels; next level only when the previous cannot express the competency.

## 1. Data files

- Each fact once, as a record with the same fields as its neighbours (elements, circuit parts, events, organs).
- Explainer: `src/data/<name>.yaml`, used by `generated` exercises and timelines.
- Quiz: the bank is the material; one fact in one question; same kind of fact, same question form.

## 2. Patterns

- Pattern = a kind of exercise for one kind of competency.
- Write each into the guide, part "Exercise patterns": name, competency kind, archetype form (block or question
  type, fixed parts, what varies), one example from the app (file, id), data file.
- Vary per use: values, records, context.
- Choose by the competency's verb:

| The learner can … | Pattern |
|---|---|
| compute, convert, estimate | computed task with unit, typical mistakes diagnosed; numbers drawn where possible |
| assign, name, recognise | match pairs, or pick one of things of the same kind |
| order, compare | put items in order by size, date or step |
| judge, decide | true or false with the reason in the feedback, or pick the right statement |
| read off, interpret | figure or table given, value or statement asked |
| explain | pick the right explanation among plausible wrong ones, each with background |

- Catalogue by subject: [references/patterns.md](references/patterns.md). Learnings go into the app's guide, not
  the catalogue.

## 3. Component or issue

- Explainer: a component (skill `lernapps-explainer`), with `nojs` text and logic module; say in the plan why no
  block fits (`prefer-built-in-block`).
- Need other apps share (figure kind, block, question type) → issue at
  <https://github.com/lernapps/app-templates/issues> with an example; tell the creator; use the nearest pattern.
- Never code beyond the archetype: quiz only its bank (`quiz-only-data`), explainer only content and components
  (`explainer-only-content`). Note the gap under "Where I had to guess".

## Checking answers

- Before writing an exercise: [references/success.md](references/success.md).

## Every pattern

- Works without seeing the figure: the figure explains, the check checks.
- Figure shows the given, never the answer (`explainer-figure-hides-answer`).
- Numbers fit the story, units named, rounding said (`explainer-plausible-numbers`, `quiz-number-precision`).
- Wrong options and mistakes are real ones, each with a reason (`quiz-plausible-options`,
  `explainer-mistakes-diagnosed`).
- Every figure works at 360 px, has a text alternative (`usable-at-360px`, `accessible`).
