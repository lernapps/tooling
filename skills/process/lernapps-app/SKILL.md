---
name: lernapps-app
description: Use in Explore, when a creator wants a learning app for lernapps.net, even if they only say "Lern-App", "Übungs-App" or "für meine Klasse". What every app on lernapps.net must be, how to choose an archetype, and where to read what each one can and cannot do.
license: MIT
---

# lernapps app

## What an app is

- A small learning app for school: static, runs in the browser, no account, no tracking, no ads, free.
- Accessible (WCAG 2.1 AA) and usable at 360 px. A deviation the idea needs (a time limit, a keyboard) is allowed; the
  catalog entry then says it in `limits`.
- Other servers (video, map) only after the learner's click. Nothing about a real learner in any text.
- Published at its creator's own address, usually `https://<owner>.github.io/<repo>/`. Once listed, lernapps.net
  serves a copy at `https://lernapps.net/apps/start/<id>/`, built from the commit the entry names; the creator stays the author.
- Licence that allows the copy (MIT or Apache 2.0 for code, CC BY 4.0 for content); files referenced relatively.

## Rules

- Each rule is a section with a rule block: `id`, `scope`, `severity`. Follow every rule in scope, checked or not.
- Scope: `listing` every listed app; `tooling` every app built with `@lernapps/tooling`; `archetype:<name>` that
  archetype.
- Severity: `error` never break; `warning` only with a reason in place; `hint` advice. At the listing, a `tooling`
  rule counts as a warning.
- Each skill holds the rules of its phase. All rules: <https://lernapps.net/tooling/rules/>.

## What each archetype can do

| Archetype | Learners … | Can and cannot (README of its template) |
|---|---|---|
| `quiz` | answer questions with options and feedback | <https://raw.githubusercontent.com/lernapps/app-templates/main/quiz/README.md> |
| `explainer` | read pages that explain, each with exercises | <https://raw.githubusercontent.com/lernapps/app-templates/main/explainer/README.md> |
| `interactive` | act in one app page, by turns or in real time | <https://raw.githubusercontent.com/lernapps/app-templates/main/interactive/README.md> |

## Choose the archetype

- Choose after the interview topics "Goal" and "Learners", from what learners do. Read the patterns of the subject
  first (skill `lernapps-exercise-patterns`): how learners practise points to the archetype.
- Before you choose, read the README of each archetype in question, in full. Tell the creator in plain words what the
  chosen one can and cannot do, before you ask about content, amount and look.
- A few background sections on the start page keep an app `interactive`.
- Explanation pages with one interactive exercise → `explainer` with a component.

## Gotchas

- A typing game or a trainer is `interactive`, never `explainer`.
- What an archetype cannot do is no plan task: tell the creator, choose another archetype or leave it out.
- The archetype decides what you may write later. Choose it from what learners do, not from what is quickest.
