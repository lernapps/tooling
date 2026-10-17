# Archetype rules

The rules that hold only for apps of one archetype. How such an app is built is in the skill of its archetype
(`lernapps-explainer`, `lernapps-interactive`). Each rule is a section headed by its rule block (`id`, `scope`,
`severity`).

## Explainer

### `topic-has-exercises`: Every page has exercises (explainer)

```rule
id: topic-has-exercises
scope: archetype:explainer
severity: error
```

Give every page of an explainer at least one exercise that practises what the page explains, with a solution or
feedback learners can check; the schema requires one on every page (the start page, the chapter pages and the
glossary are generated). The review judges whether it practises what the page explains.

## Interactive

### `start-page-explains`: The start page explains the app (interactive)

```rule
id: start-page-explains
scope: archetype:interactive
severity: hint
```

Say on the static start page what learners train, for whom, and how to begin.
