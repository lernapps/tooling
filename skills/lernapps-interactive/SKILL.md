---
name: lernapps-interactive
description: Use when you build or change an interactive app for lernapps.net (archetype interactive), or decide whether an app should be one. What an interactive app is and when to choose it, the principles its code follows (a pure deterministic core under a runtime that owns state and clock, typed inputs, components that only show the state, data apart, playthroughs with inputs and ticks as proof, libraries, storage, accessibility with declared limits, the frame and a full-screen game, low stimulation as advice, its architecture in arc42 with the app's own sections), and what is not built yet. Load it together with lernapps-app.
license: MIT
---

# Building an interactive app

In an interactive app the learner's doing is the content: they play, train or work, with no explanation pages. Its
code is free, unlike the quiz and the explainer, whose notation fixes it. So this skill gives principles, not a
notation. The rules of `lernapps-app` apply too.

The runtime is in `@lernapps/app-templates` (`runtime/interactive/`, with a small template app in `interactive/`).
`lernapps create --archetype interactive` makes the app from it.

## Not built yet

Do not rely on these. Tell the creator when the app needs one of them.
- The core's property tests over fixed seeds: decided, not built. Until then the build checks determinism by playing
  every playthrough twice.
- An IndexedDB wrapper for more than the small storage: built only when an app needs it.
- A full-screen mode of the app page: the runtime always renders its frame. See "The frame and a full-screen game".

## When to choose it

- **Interactive:** the learner acts in one app page, by turns or in real time. A few background sections on the
  start page, or an info view, stay interactive.
- **Explainer:** the app needs explanation pages. Then it is an explainer, with a Vue component for the interactive
  part (skill `lernapps-explainer`).
- **Quiz:** questions with options and feedback are enough (skill `lernapps-quiz`).

There is one interactive archetype for every kind of app; the principles below hold for all of them.

## How an interactive app works

- `src/app.yaml` describes the app (schema `interactive.v1.schema.json` of the runtime): what it does, how to play,
  the competencies, the languages, the routes and optional background sections. The runtime renders the static start
  page from it, readable without JavaScript, and the app page `app/`.
- Modes and levels are hash routes, `app/#<id>`, declared in `src/app.yaml`. The entry's topics point to them
  (`entry-links-resolve`).
- The seed comes from the address, `app/?seed=<n>#<route>`, else at random. The same address plays the same.
- What you write: `src/core/` (the logic), `src/ui/` (Vue components, with the root component), `src/data/` (the
  content as data), `src/messages/` (learner texts by language), `src/playthroughs/`, and `src/main.ts`, which calls
  `startInteractive(core, App)`; and the app's own part of its architecture in `docs/arc42/`. Leave the runtime as it
  is.

## Principles

### A pure, deterministic core under the runtime

The core in `src/core/index.ts` is pure TypeScript without DOM. Its state is plain JSON data. It exports
`start(seed, route)`, `step(state, input)` and, when the app moves on its own, `tick(state, dt)`. The runtime owns the
state and the clock: it starts the core, gives it every input and calls `tick(state, 20)` every 20 ms. Draw anything
random from the seed, never from `Math.random` or the clock. Then the same seed, route and inputs give the same
states, in Node at build and in the browser.

### Inputs

`step(state, input)` takes a typed input: `{ kind: "key", key }` with the key as the browser names it
(`KeyboardEvent.key`), or `{ kind: "action", name, value? }` for what the learner does with the pointer or by touch.
The runtime turns keydown into key inputs; the root component emits `input` with an action (or a key). Handle the
kinds you know and return the same state object for any other input and for a key you ignore: new kinds may come,
and an ignored key keeps its default (Tab moves the focus).

### The frame and a full-screen game

What the runtime gives the app page: a header (the app's name, linked to the start page, and the language switch),
`<main>` with the title, a `<noscript>` note, the routes as links and the element `.interactive-app` the root
component is mounted into, and a footer with imprint and privacy notice; at most 44rem wide. The start page is a page
of its own, static and without script; nothing you do on the app page changes it.

- **Hide the frame only while playing, with an overlay of the app's own.** Give the root element a class from the
  state, for example while `state.phase === "playing"`, and style it `position: fixed; inset: 0` with the page's
  background: it covers the header and footer without changing them. Leave the runtime's markup and CSS as they are.
- **Keep a way out.** In the overlay, show a visible button (for example "Pause") and let Escape end the overlay as
  an input of the core; then the frame, its links and the routes are back. Declare a time limit or anything else the
  overlay takes away in the entry's `limits` field.
- **Keep the keys in the game.** The runtime gives a key to the core only when the focus is not on a link, button or
  form field, which keep their keys. After a click on a route link or a start button, the focus stays there: make
  the play area focusable (`tabindex="0"`, an `aria-label`) and move the focus to it with a template ref
  (`area.value?.focus()`) when play starts. Keep focus visible.
- **Space and arrows do not scroll.** The runtime prevents the default only for a key that changes the state. Let the
  core take the keys of play while playing, or add `@keydown.space.prevent` (and the arrows) on the play area: the
  key still reaches the runtime.
- **The browser's full screen** (`element.requestFullscreen()`) is optional, only after a click, through a template
  ref; the overlay must work without it. Browser globals only inside `onMounted` (`vue-component-browser-globals`).

### Components only show the state

The components in `src/ui/` show the state they get as a prop and turn the learner's actions into inputs. They keep
no game state of their own. How they render is free: DOM, SVG or canvas. They are Vue with TypeScript, and the
component rules of `lernapps-explainer` apply to them and to the modules they import: `vue-component-no-network`,
`vue-component-no-html-injection`, `vue-component-imports` and `vue-component-browser-globals`. The build checks them.
Learner texts come from the message files through `translator`, never from strings in code (`learner-text-german`).

### Data apart from code

Keep the content as data in `src/data/`, in a format of the app's own, and import it into the core. A new level or
text is then a change of data.

### Playthroughs as proof

A playthrough in `src/playthroughs/<name>.yaml` is a seed, a route and steps. A step has `keys` (the short form of key
inputs) or `inputs`, then `ticks` (how many 20 ms ticks pass after them), at least one of them, and expects the state
(a part of it), the announcement, or both. No time passes but the ticks a step names, at build and in the browser. The
build plays each one against the core twice; it fails when the plays differ or a state is not the expected one. The
end-to-end tests play the same steps in the browser, at desktop width and at 360 px. Write a playthrough for every
behaviour you want to keep, logic over time included, and expect only what the steps decide.

### Vue and libraries

Vue with TypeScript is fixed. A library is allowed: add it to `dependencies`, and the components and the core may
import it; the build bundles it, never from a CDN, and its licence must be one the licence check accepts
(`dependency-licence`). There is no size limit for interactive apps.

### Storage

Keep only small data, through `createStorage` (`storage-through-wrapper`). All apps share the origin's `localStorage`,
so an app keeps at most 100 kB: `save` returns false beyond it, as when storage is blocked, and the app keeps working
without remembering. There is no settings dialog; do not build one.

### No request before a click

Bundle everything. Load from another server only after the learner clicks for it (`no-request-before-click`).

### Accessibility: the default, limits declared

WCAG 2.1 AA and 360 px are the default (`accessible`, `usable-at-360px`). Announce changes through `announce` of
`@lernapps/tooling/a11y`, and make every action possible by keyboard. An app may deviate where its idea needs it,
for example a time limit that a screen reader cannot follow. Then it declares in its entry's `limits` field, in
German, what it does not offer; with it, the findings of `accessible` and `usable-at-360px` are warnings for the app.
The start page, which the runtime renders, meets both rules in any case.

### Low stimulation: advice

This is advice, not a rule or a check:
- no flashing;
- calm motion, and less of it when the learner's system asks for reduced motion (`prefersReducedMotion` of
  `@lernapps/tooling/a11y`);
- sound off by default.

Why: the learners are children. Flashing and fast motion draw their attention away from what they learn, and flashing
can trigger seizures.

### The architecture in arc42

The app's architecture lives in `docs/arc42/` in the arc42 DSL (`@doctc/arc42`), in English and minimal.
`lernapps create` copies the generic part and the interactive extension of app-templates there, with the app's paths;
`lernapps update` replaces them. Write the app's own part only between the markers `<!-- app: begin … -->` and
`<!-- app: end … -->`, which `update` keeps as they are; never change anything outside them. In chapter 5, a part of the
core, the UI or the data goes into the section named after it (`core`, `ui`, `data`) as a level-3 heading with
`parent` and `path`, together with a diagram of that block and its parts; place each new leaf block on a deployment
node in chapter 7. Write the concepts each part implements, the app's decisions (for example canvas or DOM) and its
declared accessibility with the reasons into the sections at the end of the chapters. Per block and decision one or
two sentences of responsibility and reason, nothing the code says.

Update it with every change, in the same commit as the code. Before a commit that stages architecture or code,
`arc42 diff --staged --strict` runs: a block changed without its prose, or new code under `src/` that no block claims,
fails it; it reads what is staged, so `git add` the new files that belong to the commit. `lernapps check` runs
`arc42 validate --strict` on the working tree, files not added to git included: any error, warning or hint fails.
This is your work, not the creator's: there is no checkpoint for the architecture.

## Rules

Each rule is a section headed by its rule block. The runtime's build checks them, and its messages name them. All
rules: <https://lernapps.net/tooling/rules/>.

### `interactive-app-valid`: The description and the playthroughs validate

```rule
id: interactive-app-valid
scope: archetype:interactive
severity: error
```

`src/app.yaml` and every playthrough validate against their schemas. German comes first and every declared language
is complete. Ids are unique, there is at least one playthrough, each step expects a state or an announcement, and a
playthrough's route is one of the app's. The build names each problem in one line with file and line; fix it there.

### `interactive-core-contract`: The core keeps its contract

```rule
id: interactive-core-contract
scope: archetype:interactive
severity: error
```

`src/core/index.ts` exports `start(seed, route)` and `step(state, input)`, and `tick(state, dt)` as a function when
the app moves on its own. Every route starts, nothing throws, and the same seed, route, inputs and ticks give the same
states.

### `interactive-playthroughs-pass`: Every playthrough plays as written

```rule
id: interactive-playthroughs-pass
scope: archetype:interactive
severity: error
```

After each step of a playthrough, the core's state has the fields the step expects. The browser shows the
announcement it expects. When one fails, fix the core or the playthrough, whichever is wrong; never delete a
playthrough to make the build pass.

### `interactive-architecture-current`: The architecture is valid and current

```rule
id: interactive-architecture-current
scope: archetype:interactive
severity: error
```

`docs/arc42/` holds the generic part and the interactive extension as `lernapps create` or `lernapps update` wrote
them, unchanged outside the app sections, and the app's own part inside them describes the code as it is: every part
of `src/` has its block, every block its code. `arc42 validate --strict` in `lernapps check` and `arc42 diff --staged
--strict` before a commit pass; the review reads whether the architecture still says what the code does.
