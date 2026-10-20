---
name: lernapps-interactive
description: Use in Code of a lernapps.net interactive app whenever you write or change its core, inputs, user interface, data, playthroughs, frame or arc42 architecture, or a build, playthrough or architecture check fails. What you write, the core's contract, the playthrough format, the frame and full-screen play, the architecture, and the technical rules.
license: MIT
---

# Interactive app

- Runtime: `@lernapps/app-templates` (`runtime/interactive/`); leave it untouched.
- `create` writes a small example app: replace it with the planned parts.

## What you write

- `src/app.yaml` (schema `interactive.v1.schema.json`): what it does, how to play, competencies, languages, routes,
  optional background sections. Rendered as the static start page and the app page `app/`.
- Routes: `app/#<id>`; a seed: `app/?seed=<n>#<route>`, else random.
- `src/core/`, `src/ui/` (root component), `src/data/`, `src/messages/`, `src/playthroughs/`, `src/main.ts`
  (`startInteractive(core, App)`), and the app's part of `docs/arc42/`.

## Read when

- [references/frame.md](references/frame.md): before you build full-screen play, keys or focus.

## Gotchas

- The generated `src/core/index.ts`, `src/ui/App.vue` and playthroughs follow the contract below: read them before you
  replace them. The types are exported by `@lernapps/app-templates/interactive`.
- Test a timer by ticks in a playthrough; never wait real time.
- The arc42 hook fails on new code without a block: `git add` the new files and describe them. Never take back
  architecture to get past the hook.
- A check names an `interactive-*` rule: read its section under "Rules" below before you fix.

## Core, components, data, playthroughs

### Core

- `src/core/index.ts`: pure TypeScript, no DOM; the state is plain JSON.
- Exports `start(seed, route)`, `step(state, input)`, and `tick(state, dt)` if it moves on its own.
- The runtime owns state and clock and calls `tick(state, 20)` every 20 ms.
- Randomness only from the seed; never `Math.random` or the clock.

### Inputs

- `{ kind: "key", key }` (`KeyboardEvent.key`) or `{ kind: "action", name, value? }` (pointer, touch).
- The runtime turns keydown into key inputs; the root component emits `input` (an action or a key).
- Unknown kinds and ignored keys: return the same state object (Tab keeps moving the focus).

### Components

- `src/ui/`: show the `state` prop; turn actions into inputs.
- Vue and TypeScript. The component rules apply to them and their imports: `vue-component-no-network`,
  `vue-component-no-html-injection`, `vue-component-imports`, `vue-component-browser-globals`.
- Learner texts from `src/messages/<language>.json` through `translator` (`@lernapps/tooling/i18n`), never strings
  in code (`learner-text-german`).
- Announce changes with `announce` (`@lernapps/tooling/a11y`); reduced motion with `prefersReducedMotion`.

### Data

- `src/data/`, own format, imported by the core.

### Playthroughs

- `src/playthroughs/<name>.yaml`: `seed`, `route`, `steps`.
- A step: `keys` (short form) or `inputs`, then `ticks` (20 ms each), at least one of them; it expects a part of the
  state, an announcement, or both. No time passes except the named ticks.
- The build plays each twice against the core and fails on differing plays or a wrong state. The end-to-end test
  plays the same in the browser, desktop and 360 px.
- Expect only what the steps decide.

### Storage

- `createStorage` (`storage-through-wrapper`, skill `lernapps-check`).

## Architecture (arc42)

- `docs/arc42/`, arc42 DSL (`@doctc/arc42`), English, minimal.
- `create` copies the generic part and the interactive extension; `update` replaces them.
- Write only between `<!-- app: begin … -->` and `<!-- app: end … -->`; nothing outside.
- Chapter 5: each part of core, UI, data as a level-3 heading in section `core`, `ui` or `data`, with `parent`,
  `path` and a diagram of the block and its parts. Each new leaf block on a deployment node in chapter 7.
- Concepts, decisions (canvas or DOM), declared accessibility with reasons: in the sections at the chapter ends.
- 1–2 sentences per block or decision: responsibility, reason; nothing the code says.
- Update with every change, same commit as the code.
- Pre-commit `arc42 diff --staged` fails on: block changed without prose (or the reverse); new `src/` code no block
  claims and not in `.arc42ignore`. It reads staged files: `git add` new files.
- Review hint (code under an interface's path changed): warning; read and update if needed.
- Accept a finding with `ARC42_CONSISTENT` only for a shown consistency finding judged intended, with a note in the
  plan. Never preset it (e.g. `$(git rev-parse HEAD)`): a bypass like `--no-verify`.
- Unclaimed new code is never accepted: give it a block, or list config in `.arc42ignore`.
- `lernapps check` runs `arc42 validate --strict` on the working tree: any error, warning or hint fails.
- Your work; no creator checkpoint.

## Rules

### `interactive-app-valid`: The description and the playthroughs validate

```rule
id: interactive-app-valid
scope: archetype:interactive
severity: error
```

- `src/app.yaml` and every playthrough valid against their schemas; German first, every language complete.
- Unique ids; at least one playthrough; each step expects a state or an announcement; playthrough routes exist.
- Build names each problem with file and line.

### `interactive-core-contract`: The core keeps its contract

```rule
id: interactive-core-contract
scope: archetype:interactive
severity: error
```

- `src/core/index.ts` exports `start(seed, route)`, `step(state, input)`; `tick(state, dt)` as a function if it
  moves on its own.
- Every route starts; nothing throws; same seed, route, inputs, ticks → same states.

### `interactive-playthroughs-pass`: Every playthrough plays as written

```rule
id: interactive-playthroughs-pass
scope: archetype:interactive
severity: error
```

- After each step the state has the expected fields; the browser shows the expected announcement.
- Failure → fix core or playthrough, whichever is wrong; never delete a playthrough.

### `interactive-architecture-current`: The architecture is valid and current

```rule
id: interactive-architecture-current
scope: archetype:interactive
severity: error
```

- `docs/arc42/`: generic part and extension as `create`/`update` wrote them, unchanged outside the app sections.
- App part describes the code: every part of `src/` has its block, every block its code.
- `arc42 validate --strict` and `arc42 diff --staged` pass; the review checks it says what the code does.
