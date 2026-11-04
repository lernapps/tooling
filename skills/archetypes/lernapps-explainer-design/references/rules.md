# Explainer rules for planning

## `topic-has-exercises`: Every page has exercises

```rule
id: topic-has-exercises
scope: archetype:explainer
severity: error
```

- Every page has at least one exercise that practises what the page explains, with solution or feedback; best in a
  last section "Übung".
- The schema requires it; start, chapter and glossary pages are generated. The review judges the fit.
- Except a recap page (`recap`, format 2): it repeats a prerequisite the app does not practise and has no exercise.

## `prefer-built-in-block`: A component only where no block fits

```rule
id: prefer-built-in-block
scope: archetype:explainer
severity: hint
```

- Built-in blocks and exercises first. A component only for what none can express; say why in the plan.

## `explainer-figure-hides-answer`: The figure does not give the answer away

```rule
id: explainer-figure-hides-answer
scope: archetype:explainer
severity: error
```

An exercise that can be solved by looking teaches looking. Learners stop thinking as soon as the page tells them.

- A task's figure shows what is given, never the answer. Its caption and `alt` name what is given, not the value
  to find.
- An exercise component shows nothing before "Prüfen" that answers the task: no counter or live sentence that states
  what is checked, no mark on the right spot. What learners need while they work (how many they marked) is fine
  when the task asks something else.
- Neither the task's text nor its caption repeats an option.

## `explainer-figure-explains`: The figure shows what the text says

```rule
id: explainer-figure-explains
scope: archetype:explainer
severity: hint
```

- Each figure shows what the text next to it explains. The caption says what to look at; `alt` says what it shows.

## `explainer-plausible-numbers`: Numbers that fit the story

```rule
id: explainer-plausible-numbers
scope: archetype:explainer
severity: warning
```

- Ranges fit the thing: prices in whole cents, people whole, a bicycle 150–1500 €.
- Preconditions rule out misfits (90.91 people).

## `explainer-mistakes-diagnosed`: Typical mistakes with their message

```rule
id: explainer-mistakes-diagnosed
scope: archetype:explainer
severity: hint
```

- Computed tasks list real mistakes. Each message says what went wrong and how to fix it ("Du hast vergessen, durch
  100 zu teilen", not "Falsch").

## `explainer-quote-sourced`: Quotes exact, with their origin

```rule
id: explainer-quote-sourced
scope: archetype:explainer
severity: warning
```

- Quote exactly. Name its origin (author, work, year), source and licence.

## `explainer-learner-start`: Start where learners stand

```rule
id: explainer-learner-start
scope: archetype:explainer
severity: hint
```

A new idea sticks when it hangs on something learners already know. A page that starts with a rule or a definition
starts where they are not.

- Start each page from what learners of the grade know: the competencies its competency `requires` in the map, and
  their everyday life.
- Link the new idea to it with an analogy or a situation. Say where the analogy stops; two analogies for one idea:
  say what they share and where they differ.
- Explain a term where it is first needed. A definition box only where the page needs one.

## `explainer-representation-explained`: Each figure and model says what it means

```rule
id: explainer-representation-explained
scope: archetype:explainer
severity: hint
```

Experts read a figure at a glance; learners see shapes, colours and lines. What a figure means is part of what the
page teaches.

- Before learners use a figure, diagram or component, the text answers five questions: What is the whole or the
  reference? What do its parts, colours and marks mean? What do learners change, and what stays the same? How does
  that lead to the statement of the page? What do they enter or check afterwards?
- Legend, colours, marks and text name the same things; a mark does not look like a sign it is not. Several figures:
  a visible label says which is which. A figure to read values from has a scale.
- `nojs` and `alt` answer the same questions.

## `explainer-control-purpose`: Every control has a visible purpose

```rule
id: explainer-control-purpose
scope: archetype:explainer
severity: hint
```

A control without a purpose makes learners search for one. A start state that is already changed hides what the
change does.

- Each control changes something learners can see, and the page says why they use it, on every page that has it.
  A control that changes nothing in one view on purpose says so there.
- The start state shows what stays the same; the next action changes it. After each change, labels, limits and
  positions agree. What learners compare stays in view.

## `explainer-text-figure-agree`: Text, figure and task tell the same

```rule
id: explainer-text-figure-agree
scope: archetype:explainer
severity: hint
```

Learners take the text at its word. When it names another number or a tool that is not there, they doubt
themselves, not the page.

- Text, figure and task use the same numbers and the same whole. A switch to another example is announced.
- The text names only views, tools and controls the page has.

## `explainer-one-step`: One new step per page

```rule
id: explainer-one-step
scope: archetype:explainer
severity: hint
```

Each new idea costs attention. Two new ideas on one page, or a glimpse of a later one, and learners keep neither.

- A page adds one new idea to what learners know. Count them: a figure with several readings brings several ideas.
- Nothing of a later competency (`requires` in the map) or page, also not among the options of an exercise.
- Different methods get their own derivation and example; one example per box.

## `explainer-steps-explain`: A solution step explains

```rule
id: explainer-steps-explain
scope: archetype:explainer
severity: hint
```

The steps are the explanation learners turn to when they are stuck. A step that only names the rule repeats what
they did not understand.

- Each step uses the numbers of the task and gives its reason. "Setze die Angaben in die Regel ein" explains nothing.
- Given values are shown worked out, unless working them out is the exercise.

## `explainer-honest-headings`: Headings say what the section does

```rule
id: explainer-honest-headings
scope: archetype:explainer
severity: hint
```

A heading is a promise. "Ausprobieren" over a figure to look at sends learners looking for a control.

- Section ids stay fixed across pages; titles fit what the section does on that page. "Ausprobieren" only where
  learners operate something.

## `explainer-age-appropriate`: Address fits the age

```rule
id: explainer-age-appropriate
scope: archetype:explainer
severity: hint
```

Learners judge in the first lines whether a page is for them. Too childish loses older learners as surely as too
hard loses younger ones.

- Tone, examples and length fit the grade: younger learners get short sentences and things from their day; older
  learners are not talked down to and get situations of their own world.
- The same "du" or "Sie" throughout, as the content guide says.
