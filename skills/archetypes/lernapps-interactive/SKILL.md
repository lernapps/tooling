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

- [references/core.md](references/core.md): before you write the core, the components or a playthrough.
- [references/frame.md](references/frame.md): before you build full-screen play, keys or focus.
- [references/architecture.md](references/architecture.md): before each commit that changes code.
- [references/rules.md](references/rules.md): when a check names an `interactive-*` or `vue-component-*` rule.

## Gotchas

- Test a timer by ticks in a playthrough; never wait real time.
- New code in `src/` without a block in the architecture fails the pre-commit hook: `git add` new files, then
  describe them.
