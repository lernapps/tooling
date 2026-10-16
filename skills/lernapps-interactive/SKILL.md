---
name: lernapps-interactive
description: Use when you build or change an interactive app for lernapps.net (archetype interactive), or decide whether an app should be one. What an interactive app is and when to choose it, the principles its code follows (a pure deterministic core under a runtime that owns state and clock, inputs, components that only show the state, data apart, playthroughs as proof, storage, accessibility with declared limits, low stimulation as advice, its architecture in arc42), and what is not built yet. Load it together with lernapps-app.
license: MIT
---

# Building an interactive app

In an interactive app the learner's doing is the content: they play, train or work, with no explanation pages. Its
code is free, unlike the quiz and the explainer, whose notation fixes it. So this skill gives principles, not a
notation. The rules of `lernapps-app` apply too.

The runtime is in `@lernapps/app-templates` (`runtime/interactive/`, with a small template app in `interactive/`). Its
architecture is there in arc42: the generic part in `docs/arc42/`, the archetype's extension in
`interactive/docs/arc42/`. The tooling does not have the archetype yet. Read "Not built yet" before you rely on a
command or a check.

## Not built yet

Do not rely on these. Tell the creator when the app needs one of them.
- The archetype `interactive` in the tooling: no preset for it, no plan template checkpoint "architecture", and
  `lernapps create --archetype interactive` does not exist.
- The storage quota of 100 kB per app: decided, but `createStorage` has no limit today.
- Time steps in playthroughs (a step that lets a number of ticks pass): decided, not built. The build never calls
  `tick`, and in the browser the clock runs in real time between keys.
- Typed inputs beyond keys: decided, but the runtime passes only keys to the core.
- The core's property tests over fixed seeds: decided, not built.
- The entry's fields for the app's size and for its declared limits: not in the entry schema yet. Until they are,
  `accessible` and `usable-at-360px` stay errors for every app.
- `arc42 diff --staged --strict` before a commit and `arc42 validate` in `lernapps check`: decided, not wired into an
  app, and nothing copies the architecture into an app yet.
- No size limit is decided for interactive apps, but the runtime's build still fails above 100 kB gzip of the app's
  own code (`interactive-size`), until that check is removed.
- Libraries are allowed, but the build's component rules still accept imports only from `vue`, the runtime,
  `@lernapps/tooling/storage`, `i18n`, `a11y` and the app's own files in `src/`. A library import there fails the
  build today.

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
  `startInteractive(core, App)`. Leave the runtime as it is.

## Principles

### A pure, deterministic core under the runtime

The core in `src/core/index.ts` is pure TypeScript without DOM. Its state is plain JSON data. It exports
`start(seed, route)`, `step(state, input)` and, when the app moves on its own, `tick(state, dt)`. The runtime owns the
state and the clock: it starts the core, gives it every input and calls `tick(state, 20)` every 20 ms. Draw anything
random from the seed, never from `Math.random` or the clock. Then the same seed, route and inputs give the same
states, in Node at build and in the browser.

### Inputs

An app's input is more than keys and mouse: touch, gestures and other input later. The decided contract is a typed
input. Today the runtime passes only keys, as the browser names them (`KeyboardEvent.key`). A component turns a
click or a touch into a key it emits as `input`. `step` returns the same state object for a key it ignores, so the
key keeps its default (Tab moves the focus).

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

A playthrough in `src/playthroughs/<name>.yaml` is a seed, a route and steps: keys, and the state (a part of it) or
the announcement expected after them. The build plays each one against the core twice; it fails when the plays differ
or a state is not the expected one. The end-to-end tests play the same keys in the browser, at desktop width and at
360 px. Write a playthrough for every behaviour you want to keep, and expect only what the keys decide. Logic over
time (`tick`) needs the app's own unit tests until time steps exist.

### Vue, libraries and size

Vue with TypeScript is fixed. A library is allowed: bundled, never from a CDN, with a licence the licence check
accepts (`dependency-licence`). No size limit is decided for interactive apps; the size goes into the entry.

### Storage

Keep only small data, through `createStorage` (`storage-through-wrapper`). All apps share the origin's `localStorage`,
so the quota will be 100 kB per app. Blocked or full storage means the app remembers nothing and keeps working. There
is no settings dialog; do not build one.

### No request before a click

Bundle everything. Load from another server only after the learner clicks for it (`no-request-before-click`).

### Accessibility: the default, limits declared

WCAG 2.1 AA and 360 px are the default (`accessible`, `usable-at-360px`). Announce changes through `announce` of
`@lernapps/tooling/a11y`, and make every action possible by keyboard. An app may deviate where its idea needs it,
for example a time limit that a screen reader cannot follow. Then it declares in its entry what it does not offer.
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

The app's architecture lives in `docs/arc42/` in the arc42 DSL (`@doctc/arc42`), in English and minimal. The generic
part and the archetype's extension come from the frame. The app's own part is yours: its building blocks under the
basic ones (core, UI, data), with `parent` and `path`, the concepts each implements, its decisions (for example
canvas or DOM) and its declared accessibility with the reasons. Per block and decision one or two sentences of
responsibility and reason, nothing the code says. Keep it current in every increment, in the same commit as the code.

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

`src/core/index.ts` exports `start(seed, route)` and `step(state, key)`, and `tick(state, dt)` as a function when the
app moves on its own. Every route starts, nothing throws, and the same seed, route and keys give the same states.

### `interactive-playthroughs-pass`: Every playthrough plays as written

```rule
id: interactive-playthroughs-pass
scope: archetype:interactive
severity: error
```

After each step of a playthrough, the core's state has the fields the step expects. The browser shows the
announcement it expects. When one fails, fix the core or the playthrough, whichever is wrong; never delete a
playthrough to make the build pass.
