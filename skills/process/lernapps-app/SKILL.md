---
name: lernapps-app
description: Use in Explore, when a creator wants a learning app for lernapps.net, even if they only say "Lern-App", "Übungs-App" or "für meine Klasse". What every app on lernapps.net must be, how its rules work, and which archetype fits which goal.
license: MIT
---

# lernapps app

## What an app is

- A small learning app for school: static, runs in the browser, no account, no tracking, free, accessible.
- Lives at its creator's own address, usually `https://<owner>.github.io/<repo>/`. The catalog on lernapps.net
  links to it.
- Built from an archetype of this tooling, with the plan as workflow and checks in the hooks and CI.

## Rules

- Each rule is a section with a rule block: `id`, `scope`, `severity`. Follow every rule in scope, checked or not.
- Scope: `listing` every listed app; `tooling` every app built with `@lernapps/tooling`; `archetype:<name>` that
  archetype.
- Severity: `error` never break; `warning` only with a reason in place; `hint` advice. At the listing, a `tooling`
  rule counts as a warning.
- Each skill holds the rules of its phase. All rules: <https://lernapps.net/tooling/rules/>.
- Read [references/platform-rules.md](references/platform-rules.md) before you decide what the app does and how it
  reaches learners.

## Choose the archetype

| Archetype | Choose it when learners … | Example |
|---|---|---|
| `quiz` | answer questions with options and feedback, one round per chapter | facts about rivers |
| `explainer` | read pages that explain, each with exercises | percentages, one page per competency |
| `interactive` | act in one app page, by turns or in real time | typing game, mental arithmetic with a timer |

- A few background sections on the start page keep an app `interactive`.
- Explanation pages with one interactive exercise → `explainer` with a component.
- Interactive, not built yet. Tell the creator when the app needs one:
  - property tests of the core over fixed seeds (until then each playthrough runs twice);
  - storage beyond 100 kB (IndexedDB);
  - a full-screen app page (the runtime always renders its frame; an overlay works).

## Gotchas

- A typing game or a trainer is `interactive`, never `explainer`.
- The archetype decides what you may write later. Choose it from what learners do, not from what is quickest.
