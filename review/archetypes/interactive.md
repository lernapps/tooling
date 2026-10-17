# Review rubric: archetype interactive

One client-rendered app page and a static start page. Judge these items after those of `review/rubric.md`.

## The start page explains the app

```rubric
id: start-page-explains
```

Read the start page. A finding: the start page does not say what learners train, for whom, and how to begin.

## The architecture says what the code does

```rubric
id: interactive-architecture-current
```

The validation report says whether the architecture validates. Read the app's own sections of `docs/arc42/` (between
`<!-- app: begin … -->` and `<!-- app: end … -->`) next to `src/`. A finding: `docs/arc42/` is missing, its text outside
the app sections differs from what `lernapps update` writes, or a block's responsibility or decision no longer matches
the code (a part of `src/` the architecture does not name, a block whose code is gone). Name the block or the folder.
