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
