# Core, components, data, playthroughs

## Core

- `src/core/index.ts`: pure TypeScript, no DOM; the state is plain JSON.
- Exports `start(seed, route)`, `step(state, input)`, and `tick(state, dt)` if it moves on its own.
- The runtime owns state and clock and calls `tick(state, 20)` every 20 ms.
- Randomness only from the seed; never `Math.random` or the clock.

## Inputs

- `{ kind: "key", key }` (`KeyboardEvent.key`) or `{ kind: "action", name, value? }` (pointer, touch).
- The runtime turns keydown into key inputs; the root component emits `input` (an action or a key).
- Unknown kinds and ignored keys: return the same state object (Tab keeps moving the focus).

## Components

- `src/ui/`: show the `state` prop; turn actions into inputs.
- Vue and TypeScript. The component rules apply to them and their imports: `vue-component-no-network`,
  `vue-component-no-html-injection`, `vue-component-imports`, `vue-component-browser-globals`.
- Learner texts from `src/messages/<language>.json` through `translator` (`@lernapps/tooling/i18n`), never strings
  in code (`learner-text-german`).
- Announce changes with `announce` (`@lernapps/tooling/a11y`); reduced motion with `prefersReducedMotion`.

## Data

- `src/data/`, own format, imported by the core.

## Playthroughs

- `src/playthroughs/<name>.yaml`: `seed`, `route`, `steps`.
- A step: `keys` (short form) or `inputs`, then `ticks` (20 ms each), at least one of them; it expects a part of the
  state, an announcement, or both. No time passes except the named ticks.
- The build plays each twice against the core and fails on differing plays or a wrong state. The end-to-end test
  plays the same in the browser, desktop and 360 px.
- Expect only what the steps decide.

## Storage

- `createStorage` (`storage-through-wrapper`, skill `lernapps-check`).
