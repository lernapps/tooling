# Archetype rules

How to build: skill `lernapps-explainer`, skill `lernapps-interactive`.

## Explainer

### `topic-has-exercises`: Every page has exercises (explainer)

```rule
id: topic-has-exercises
scope: archetype:explainer
severity: error
```

- Every page: at least one exercise practising what the page explains, with solution or feedback.
- The schema requires it; start, chapter and glossary pages are generated. The review judges the fit.

## Interactive

### `start-page-explains`: The start page explains the app (interactive)

```rule
id: start-page-explains
scope: archetype:interactive
severity: hint
```

- Static start page says: what learners train, for whom, how to begin.
