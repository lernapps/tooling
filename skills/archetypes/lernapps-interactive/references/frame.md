# Frame and full-screen game

## Frame

- App page: header (language switch only; none with one language), `<main>` (heading line: the title as h1 and a
  slot beside it; `<noscript>` note, route links, `.interactive-app` mount), footer (imprint, privacy). At most
  `--interactive-max-width` wide, 44rem by default.
- A control in the heading line: `startInteractive(core, App, { title: Controls })`. The runtime mounts it into the
  slot, with the root component's props (`state`, `lang`) and `input` event. Never hide or rebuild the h1. Without
  `title` the slot stays hidden.
- A wider frame: `--interactive-max-width` (e.g. `60rem`) in the app's own `:root` rule; it widens header, page and
  footer. Never override the runtime's selectors.
- Start page: own static page, no script; the app page never changes it.

## Full-screen while playing

- Own overlay only: root element class from state (e.g. `state.phase === "playing"`), `position: fixed; inset: 0`,
  page background. Leave runtime markup and CSS.
- Way out: visible button ("Pause"); Escape ends the overlay as a core input. Time limit or other loss → entry
  `limits`.
- Browser full screen (`element.requestFullscreen()`): optional, only after a click, via template ref; overlay works
  without it. Browser globals only in `onMounted` (`vue-component-browser-globals`).

## Keys and focus

- Runtime gives keys to the core only when focus is not on a link, button, form field.
- Play area focusable (`tabindex="0"`, `aria-label`); focus it via template ref (`area.value?.focus()`) when play
  starts. Focus visible.
- Space and arrows: runtime prevents default only for state-changing keys. Let the core take them while playing, or
  `@keydown.space.prevent` (and arrows) on the play area.
