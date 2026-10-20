# Frame and full-screen game

## Frame

- App page: header (name → start page, language switch), `<main>` (title, `<noscript>` note, route links,
  `.interactive-app` mount), footer (imprint, privacy). Max 44rem.
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
