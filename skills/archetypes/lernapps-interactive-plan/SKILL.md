---
name: lernapps-interactive-plan
description: Use in Plan once the plan says `archetype: interactive` - to map the confirmed content of a lernapps.net interactive app (game, trainer, simulation) onto its parts - core, user interface, data, playthroughs - and to decide inputs, timing, storage, accessibility limits and look and feel, before `lernapps create`.
license: MIT
---

# Planning an interactive app

## What an interactive app is

- The learner's doing is the content: play, train, work in one app page. A static start page without script says
  what it is.
- The code is yours. The runtime renders the frame, owns state and clock, and feeds inputs to your core.
- Write in "Content method" one line per part below; the architecture in Code follows it.

## Parts

1. **Core:** pure TypeScript, no DOM; the state is plain JSON. It starts from a seed and a route, takes inputs,
   and moves on with ticks if time matters. Randomness only from the seed: same seed, route and inputs → same
   states.
2. **User interface:** Vue components show the state and turn actions into inputs. They keep no game state of
   their own. Render as DOM, SVG or canvas.
3. **Data:** the content (levels, tasks, texts) as data files the core imports. A new level is a data change.
4. **Playthroughs:** one per behaviour to keep, timing included: seed, route, inputs, ticks, the state expected. They
   are the proof that the core works; the build plays each twice, the browser once.
5. **Routes:** one per mode or level the entry may link to (`app/#<id>`).

## Decide

- Inputs: which keys, which buttons or touch actions. Every action works by keyboard.
- Timing: time limits and moving parts are ticks of the core, never the clock.
- Storage: small (at most 100 kB), the learning state only; no settings dialog.
- Libraries: bundled from `dependencies`, open licence; never a CDN.
- Accessibility: WCAG 2.1 AA and 360 px are the default. A deviation the idea needs (a time limit) goes into the
  entry's `limits`, in German.
- Look and feel: as the creator chose in Explore.
- Languages: German; each declared language complete; learner texts in message files, never in code.

## Gotchas

- "Low stimulation" means no overload, not no fun: a game may look like a game (bold colours, a real board). No
  flashing; calm motion, less with reduced motion; sound off by default. The start page stays calm.
- A timer is a tick of the core with a playthrough that tests the end of time, not `setTimeout` in a component.

## `start-page-explains`: The start page explains the app

```rule
id: start-page-explains
scope: archetype:interactive
severity: hint
```

- The static start page says what learners train, for whom, and how to begin.
