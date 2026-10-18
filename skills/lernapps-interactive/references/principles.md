# Principles

## Core

- `src/core/index.ts`: pure TypeScript, no DOM; state is plain JSON.
- Exports `start(seed, route)`, `step(state, input)`, and `tick(state, dt)` if it moves on its own.
- Runtime owns state and clock; calls `tick(state, 20)` every 20 ms.
- Randomness only from the seed; never `Math.random` or the clock. Same seed, route, inputs → same states (Node and
  browser).

## Inputs

- `{ kind: "key", key }` (`KeyboardEvent.key`) or `{ kind: "action", name, value? }` (pointer, touch).
- Runtime turns keydown into key inputs; the root component emits `input` (action or key).
- Unknown kinds and ignored keys: return the same state object (Tab keeps moving focus).

## Components

- `src/ui/`: show the state prop, turn actions into inputs; no own game state. Render freely (DOM, SVG, canvas).
- Vue + TypeScript; component rules apply to them and their imports: `vue-component-no-network`,
  `vue-component-no-html-injection`, `vue-component-imports`, `vue-component-browser-globals` (build checks).
- Learner texts from message files via `translator`, never strings in code (`learner-text-german`).

## Data

- Content as data in `src/data/`, own format, imported by the core. New level or text = data change.

## Playthroughs

- `src/playthroughs/<name>.yaml`: seed, route, steps.
- Step: `keys` (short form) or `inputs`, then `ticks` (20 ms each), at least one; expects state (part), announcement,
  or both. No time passes except the named ticks.
- Build plays each twice against the core; fails on differing plays or wrong state. E2E plays the same in the
  browser, desktop and 360 px.
- One per behaviour to keep, incl. logic over time; expect only what the steps decide.

## Libraries

- Vue + TypeScript fixed. Libraries in `dependencies`, bundled, never CDN; licence per `dependency-licence`.
  No size limit.

## Storage

- Small data via `createStorage` (`storage-through-wrapper`); max 100 kB, `save` false beyond, app keeps working.
- No settings dialog.

## Requests

- Bundle everything; other servers only after a click (`no-request-before-click`).

## Accessibility

- Default WCAG 2.1 AA and 360 px (`accessible`, `usable-at-360px`).
- Announce changes with `announce` (`@lernapps/tooling/a11y`); every action by keyboard.
- Deviation where the idea needs it (time limit) → declare in entry `limits`, German; findings become warnings.
- The start page meets both always.

## Low stimulation (advice)

- No flashing.
- Calm motion; less with reduced motion (`prefersReducedMotion`, `@lernapps/tooling/a11y`).
- Sound off by default.
