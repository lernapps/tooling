---
name: lernapps-app
description: Use when you build or change a learning app for lernapps.net. The rules every app follows, each with its id; the workflow itself is in the current plan file (.vibe/plans/, from the plan or the increment template). Load it when you start work on an app.
license: MIT
---

# lernapps app

## Workflow

- `AGENTS.md`: what always holds.
- Current plan `.vibe/plans/<NN>-<short name>.md` (highest NN): phases, tasks, checkpoints, commands. Follow it.
- New plan: copy a template unchanged from `node_modules/@lernapps/tooling/guidance/`, before the app exists from
  <https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/guidance/>: `plan-template.md` (first version),
  `increment-template.md` (later changes).

## Rules

- Each rule: a section with a rule block (`id`, `scope`, `severity`). Follow every rule in scope, enforced or not.
- Scopes: `listing` every listed app; `tooling` apps with `@lernapps/tooling` in `package.json`;
  `archetype:<name>` that archetype.
- Severity: `error` never break; `warning` only with a reason in place; `hint` advice.
- A `tooling` rule is a warning at listing; in the app's repo its severity holds.
- Catalog of all rules: <https://lernapps.net/tooling/rules/>.

## Index

- [references/platform-rules.md](references/platform-rules.md): always, first. Every app, however built; the entry.
- [references/workflow-rules.md](references/workflow-rules.md): before working on a plan.
- [references/tooling-rules.md](references/tooling-rules.md): before `create`, code or config changes; when a check
  fails.
- [references/archetype-rules.md](references/archetype-rules.md): explainer or interactive app.

## Content skills

- Content guide `.agents/skills/app-content/SKILL.md` first, once filled in; it takes precedence.
- skill `lernapps-content-research`: curriculum, competencies, sources (Explore).
- skill `lernapps-exercise-patterns`: exercises (Plan).
- skill `lernapps-content-growth`: increments.
