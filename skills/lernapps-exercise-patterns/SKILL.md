---
name: lernapps-exercise-patterns
description: Use when you design the exercises of a learning app for lernapps.net, or add one that no pattern of the app fits. Reusable exercise concepts in three levels - shared data files, patterns written down once in the app's content guide and varied per use, and a component or an issue for what the content notation cannot express - with a catalogue of patterns that worked, by subject (references/patterns.md). For every archetype.
license: MIT
---

# Exercise patterns

Learners act on every page or in every round (`learners-act`). Good exercises are not invented one by one: they
come from a few patterns that fit the subject, filled from shared material. Build them in three levels, and go to
the next level only when the one before cannot say what the competency needs. The skill of the archetype says how
each level is written there; the app's content guide `.agents/skills/app-content/SKILL.md` names the patterns this
app uses, and takes precedence.

## 1. Data files: the material, once

Write each fact once, as a record with the same fields as its neighbours, and let the exercises draw from it:
elements with their properties, parts of a circuit with symbol and function, events with their date, organs with
their function.

- In an explainer: `src/data/<name>.yaml`, which `generated` exercises and timelines draw from.
- In a quiz: the bank is the material. Keep a fact in one question, and the same kind of fact in questions of the
  same form.

A correction then happens in one place, and a new exercise costs a few lines.

## 2. Patterns: written down once, varied per use

A pattern is a kind of exercise that practises one kind of competency: "read a value off a diagram", "match symbol
and part", "compute a quantity with its unit, with the typical mistakes". Write each pattern the app uses into the
content guide, part "Exercise patterns":
- its name and the kind of competency it practises;
- how it is expressed in the archetype: the block or question type, its fixed parts, and what varies;
- one concrete example as it is in the app (file and id), and its data file.

Then vary it per use: other values, other records of the data file, another context. Choose the pattern from the
competency's verb:

| The learner can … | Pattern |
|---|---|
| compute, convert, estimate | a computed task with its unit, the typical mistakes diagnosed; numbers drawn where the archetype can |
| assign, name, recognise | match pairs, or pick one of things of the same kind |
| order, compare | put items in order by size, date or step |
| judge, decide | true or false with the reason in the feedback, or pick the right statement |
| read off, interpret | a figure or table given, a value or statement asked |
| explain | pick the right explanation among plausible wrong ones, each with background |

The catalogue [references/patterns.md](references/patterns.md) lists patterns that worked, by subject, with how
each is expressed. Start from it, and add what you learn to the app's guide, not to the catalogue.

## 3. A component or an issue: what the notation cannot express

When no block, question type or `generated` exercise can say what the competency needs (something to drag into
place, a value to change and watch the idea respond):
- **in an explainer**, write a component as the skill `lernapps-explainer` says, with its `nojs` text and its
  logic module, and say in the plan why no block fits (`prefer-built-in-block`);
- **when the need is general** (a figure kind, a block, a question type that other apps would use too), open an
  issue at <https://github.com/lernapps/app-templates/issues> that describes it with an example, and tell the
  creator; until it exists, use the nearest pattern.

Never write app code beyond what the archetype allows: a quiz has only its question bank (`quiz-only-data`), an
explainer its content and components (`explainer-only-content`). Write what you missed under "Where I had to guess".

## What every pattern keeps

- The exercise works without the figure being visible: the figure explains, the check checks.
- A figure shows what the task gives, never its answer (`explainer-figure-hides-answer`).
- Numbers fit the story, units are named, and the rounding is said (`explainer-plausible-numbers`,
  `quiz-number-precision`).
- Wrong options and mistakes are the ones learners really make, each with a message that says why
  (`quiz-plausible-options`, `explainer-mistakes-diagnosed`).
- Every figure works at 360 px and has its text alternative (`usable-at-360px`, `accessible`).
