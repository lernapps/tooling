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

- A task's figure shows the given values, never the answer.
- In an exercise component, no counter or sentence states what is checked: "6 von 10 Teilen gefärbt" under "Färbe
  6/10" is the answer. Count only what the task does not ask, or show it after "Prüfen".
- A caption or figure of a task does not repeat an option ("Die Teile sind nicht gleich groß" under that question),
  and a comparison the figure shows at a glance (the longer strip) is an explanation, not a task.

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

- Each page starts from what learners of its grade already know: the competencies its competency `requires` in the
  map, and everyday experience. Name it, then build on it.
- A new idea gets an analogy or an everyday situation it resembles ("Pizza in vier gleiche Stücke"). Say where the
  analogy stops. Two analogies for one idea (cake and rectangle): say what they share and how they differ.
- A term is explained where it is first needed, not before and not later. No definition box only because every page
  has one.

## `explainer-representation-explained`: Each figure and model says what it means

```rule
id: explainer-representation-explained
scope: archetype:explainer
severity: hint
```

- Before learners use a figure, a diagram or a component, the text answers five questions:
  1. What is the whole or the reference (one cake, the unit square, the time axis)?
  2. What do its parts, colours, patterns and marks mean?
  3. What do learners change, and what stays the same?
  4. How does that action lead to the statement of the page?
  5. What do they enter or check afterwards?
- Marks look like nothing else: a tick or a dot in a field reads as a sign. Legend, colours, patterns and text name
  the same things.
- Two figures side by side or one above the other: a visible label says which is which ("vorher", "erweitert mit 3"),
  not only `alt` or `aria-label`. Every mark has its name in the text: a dashed line, a filled and a hollow point.
- A diagram whose task asks for values has numbers on its axes, on a scale that stays put while learners change it.
- The `nojs` text and `alt` answer the same questions.

## `explainer-control-purpose`: Every control has a visible purpose

```rule
id: explainer-control-purpose
scope: archetype:explainer
severity: hint
```

- Each slider, button or field of a component changes something learners can see, and the text says why they use it.
  A control without a purpose goes.
- The start state shows first what stays the same (factor 1, nothing coloured yet, the given fraction); only the next
  action changes it. After a change, labels, limits and positions agree.
- Each page says what its controls do, also when an earlier page has the same component. A control that replaces what
  learners compare keeps the earlier state in view (side by side), or they compare from memory.

## `explainer-text-figure-agree`: Text, figure and task tell the same

```rule
id: explainer-text-figure-agree
scope: archetype:explainer
severity: hint
```

- Text, figure and task use the same numbers and the same whole. A switch to another example is announced ("Jetzt
  eine neue Aufgabe mit anderen Zahlen").
- The text names only views, tools and controls the page has.

## `explainer-one-step`: One new step per page

```rule
id: explainer-one-step
scope: archetype:explainer
severity: hint
```

- A page adds one step to what learners know. Content of a later competency (by `requires` in the map, or a later
  page) stays out of its text, figures and exercises.
- Different methods get their own derivation and example; one example per box.
- Options and distractors stay inside the step too: no 7/4 among the options before fractions greater than one.

## `explainer-steps-explain`: A solution step explains

```rule
id: explainer-steps-explain
scope: archetype:explainer
severity: hint
```

- The steps of a solution use the numbers of the task and give the reason for each step ("6 und 48 sind beide durch
  6 teilbar, also …"). A step that only says to apply the rule ("Setze die Angaben in die Regel ein") explains
  nothing.
- Given values are shown worked out (6/48, not 6/(8 · 6)), unless computing them is the exercise.
- In `generated`, a step can name only drawn values, not one computed from them. Draw a record that holds every
  number the steps need, from a data file (`pick: 1` from `{ data: … }`): to reduce, `{ a: 6, b: 48, k: 6, z: 1, n: 8 }`;
  the step says "{{e.a}} und {{e.b}} sind beide durch {{e.k}} teilbar: {{e.a}} : {{e.k}} = {{e.z}}". To compare, a
  record with both fractions, the common denominator and the expanded numerators.

## `explainer-honest-headings`: Headings say what the section does

```rule
id: explainer-honest-headings
scope: archetype:explainer
severity: hint
```

- Section ids stay fixed across pages; their titles fit the content. "Ausprobieren" heads a section only when learners
  can operate something there; a figure to look at is e.g. "Anschaulich erklärt".

## `explainer-age-appropriate`: Address fits the age

```rule
id: explainer-age-appropriate
scope: archetype:explainer
severity: hint
```

- Tone, examples and length fit the grade of the app: a class 6 is addressed in short sentences with things from
  their day; a class 10 is not talked down to, gets situations of their world (traffic, sport, phones) and may read a
  denser text.
- The same "du" or "Sie" throughout, as the content guide says.
