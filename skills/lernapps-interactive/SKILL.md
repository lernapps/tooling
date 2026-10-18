---
name: lernapps-interactive
description: Use when you build or change an interactive app for lernapps.net (archetype interactive), or decide whether an app should be one. What an interactive app is and when to choose it, the principles its code follows (a pure deterministic core under a runtime that owns state and clock, typed inputs, components that only show the state, data apart, playthroughs with inputs and ticks as proof, libraries, storage, accessibility with declared limits, the frame and a full-screen game, low stimulation as advice, its architecture in arc42 with the app's own sections), and what is not built yet. Load it together with lernapps-app.
license: MIT
---

# Interactive app

- The learner's doing is the content: play, train, work; no explanation pages. Code is free; principles, no notation.
- Runtime: `@lernapps/app-templates` (`runtime/interactive/`, template `interactive/`). `lernapps create --archetype
  interactive`.

## Choose it when

- Learners act in one app page, by turns or in real time: game, trainer, simulation. A typing game or trainer is
  `interactive`, never `explainer`.
- A few background sections on the start page or an info view: still interactive.
- Needs explanation pages → `explainer` with a Vue component (skill `lernapps-explainer`).
- Questions with options and feedback suffice → `quiz` (skill `lernapps-quiz`).

## Not built yet

- Tell the creator when the app needs one:
  - property tests of the core over fixed seeds (until then: each playthrough played twice);
  - IndexedDB wrapper beyond small storage;
  - full-screen mode of the app page (the runtime always renders its frame; see frame).

## What you write

- `src/app.yaml` (schema `interactive.v1.schema.json`): what it does, how to play, competencies, languages, routes,
  optional background sections. Rendered: static start page (no JS) and app page `app/`.
- Routes: `app/#<id>` (entry topics point there, `entry-links-resolve`). Seed: `app/?seed=<n>#<route>`, else random.
- `src/core/`, `src/ui/` (root component), `src/data/`, `src/messages/`, `src/playthroughs/`, `src/main.ts`
  (`startInteractive(core, App)`), the app part of `docs/arc42/`. Runtime untouched.

## Index

- [references/principles.md](references/principles.md): core, inputs, components, data, playthroughs, libraries,
  storage, accessibility, low stimulation. Before code.
- [references/frame.md](references/frame.md): the page frame, full-screen game, keys and focus.
- [references/architecture.md](references/architecture.md): arc42, before each commit with code.
- [references/rules.md](references/rules.md): the rules the build checks.
