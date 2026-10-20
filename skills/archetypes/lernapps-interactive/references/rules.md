# Interactive rules

- The runtime's build checks them; its messages name them.

## `interactive-app-valid`: The description and the playthroughs validate

```rule
id: interactive-app-valid
scope: archetype:interactive
severity: error
```

- `src/app.yaml` and every playthrough valid against their schemas; German first, every language complete.
- Unique ids; at least one playthrough; each step expects a state or an announcement; playthrough routes exist.
- Build names each problem with file and line.

## `interactive-core-contract`: The core keeps its contract

```rule
id: interactive-core-contract
scope: archetype:interactive
severity: error
```

- `src/core/index.ts` exports `start(seed, route)`, `step(state, input)`; `tick(state, dt)` as a function if it
  moves on its own.
- Every route starts; nothing throws; same seed, route, inputs, ticks → same states.

## `interactive-playthroughs-pass`: Every playthrough plays as written

```rule
id: interactive-playthroughs-pass
scope: archetype:interactive
severity: error
```

- After each step the state has the expected fields; the browser shows the expected announcement.
- Failure → fix core or playthrough, whichever is wrong; never delete a playthrough.

## `interactive-architecture-current`: The architecture is valid and current

```rule
id: interactive-architecture-current
scope: archetype:interactive
severity: error
```

- `docs/arc42/`: generic part and extension as `create`/`update` wrote them, unchanged outside the app sections.
- App part describes the code: every part of `src/` has its block, every block its code.
- `arc42 validate --strict` and `arc42 diff --staged` pass; the review checks it says what the code does.
