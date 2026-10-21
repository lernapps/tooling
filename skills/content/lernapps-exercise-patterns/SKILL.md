---
name: lernapps-exercise-patterns
description: Use in Explore, after the goal and the learners are known and before you choose the archetype - how learners of a lernapps.net app practise each kind of competency, which points to the archetype - and again in Plan to choose a pattern per competency, share material as data and say what a wrong answer is told. In an increment, for a kind of exercise the app's content guide lacks. For every archetype.
license: MIT
---

# Exercise patterns

- Learners act on every page or screen (`learners-act`).
- Learners derive, not only read off: show how a value comes about (tree diagram, step, model), then let them do it.
- The content guide `.agents/skills/app-content/SKILL.md` names the app's patterns. It takes precedence.
- Three levels. Take the next level only when the one before cannot express the competency.

## The kind of practice and the archetype

- In Explore, read the patterns of the subject before the archetype is chosen. How learners practise points to the
  archetype; the README of each template decides:
  - every competency fits a question with options or an input and feedback per answer, no page needs to explain
    first → `quiz`;
  - learners need explanations, figures or derivations on pages before they practise, with exercises in between →
    `explainer`;
  - learners act in a model of their own: a game, a simulation, a timed drill, something they move or build →
    `interactive`.
- Mixed: the kind most competencies need decides; tell the creator what the others become.

## 1. Data files

- Each fact once, as a record with the same fields as its neighbours (elements, circuit parts, events, organs).
- The skill `lernapps-<archetype>-design` says where data lives in the archetype.

## 2. Patterns

- A pattern is a kind of exercise for one kind of competency, written down once and varied per use (values,
  records, context).
- Choose by the competency's verb:

| The learner can … | Pattern |
|---|---|
| compute, convert, estimate | a computed task with unit; typical mistakes diagnosed; numbers drawn where possible |
| assign, name, recognise | match pairs, or pick one of things of the same kind |
| order, compare | put items in order by size, date or step |
| judge, decide | true or false with the reason in the feedback, or pick the right statement |
| read off, interpret | a figure or table given, a value or statement asked |
| explain | pick the right explanation among plausible wrong ones, each with background |

- Read the patterns of your subject before you choose: [mathematics](references/mathematics.md),
  [physics](references/physics.md), [chemistry](references/chemistry.md),
  [biology and geography](references/biology-geography.md), [history](references/history.md),
  [computer science](references/computer-science.md). Another subject: the one closest to it.
- Explainer: read [references/page-structures.md](references/page-structures.md) when you plan the sections of a
  page; any archetype with figures: [references/figures.md](references/figures.md).
- Write each pattern into "Content method": name, kind of competency, form in the archetype (what is fixed, what
  varies), one example, data file. In Code it goes into the content guide.

## 3. Beyond the notation

- What the archetype's notation cannot express: the skill `lernapps-<archetype>-design` says the way out (a component
  of the explainer; code of an interactive app). Say in the plan why no pattern fits.
- A need other apps share (figure kind, block, question type) → an issue at
  <https://github.com/lernapps/app-templates/issues> with an example. Tell the creator; use the nearest pattern.
- Never code beyond the archetype; note the gap under "Where I had to guess".

## Checking answers

- Read [references/success.md](references/success.md) when you decide how an exercise checks an answer and what each
  wrong answer is told.

## Every pattern

- Works without seeing the figure: the figure explains, the check checks.
- The figure shows what is given, never the answer.
- Numbers fit the story; units are named; rounding is said.
- Wrong options and mistakes are real ones, each with a reason.
- Every figure works at 360 px and has a text alternative (`usable-at-360px`, `accessible`).
