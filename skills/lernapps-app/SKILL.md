---
name: lernapps-app
description: Use when you build or change a learning app for lernapps.net. What a lernapps app is, where its workflow is (AGENTS.md and the current plan file in .vibe/plans/), and the rules every app follows, each with its id, in files under references/ that it links. Load it when you start work on an app.
license: MIT
---

# Building a lernapps app

A lernapps app is static, runs in the browser only, collects nothing and is accessible. The creator decides what it
teaches; you build it, check it and prepare its listing. Every rule has an id: check messages, the review and the
retrospective name rules by it. All rules: <https://lernapps.net/tooling/rules/>.

## Workflow

`AGENTS.md` says what always holds in the app's repo. The workflow of a piece of work is its plan, the one with the
highest number in `.vibe/plans/<NN>-<short name>.md`: its phases, tasks and checkpoints, and the commands. Follow it
exactly. Each piece of work gets its own plan, copied complete and unchanged from a template in
`node_modules/@lernapps/tooling/guidance/` or, before the app exists, downloaded from
<https://raw.githubusercontent.com/lernapps/tooling/main/guidance/>: `plan-template.md` for the first version,
`increment-template.md` for every later change. Read the plan, this skill, the rule files below and every skill
they name from their files, in full; never from a summary.

## Rules

Each file holds the rules of one concern. Each rule is a section headed by its rule block (`id`, `scope`,
`severity`). Follow every rule in scope, whether or not a lint rule, check or the review also enforces it under the
same id; their messages link to the rule. `listing` applies to every listed app, wherever it is hosted;
`archetype:<name>` to apps of that archetype.

- [references/platform-rules.md](references/platform-rules.md): read it first, always. What every app keeps to,
  however it is built (nothing collected, no account, accessible, German, licences, links, pages), and the rules of
  its catalog entry.
- [references/workflow-rules.md](references/workflow-rules.md): read it before you work on a plan. The plan file, no
  code before the plan is confirmed, the creator's checkpoints, the content guide, the retrospective.
- [references/tooling-rules.md](references/tooling-rules.md): read it before you generate the app or change its code
  or configuration, and when a check or a test of the runtime fails. `lernapps check`, failed checks, suppressions,
  the preset, strict TypeScript, storage, publishing from `gh-pages`.
- [references/archetype-rules.md](references/archetype-rules.md): read it when the app is an explainer or an
  interactive app. The rules of one archetype alone.

## Content

What the app teaches, and how its content is built, is the app's own: its content guide
`.agents/skills/app-content/SKILL.md`, which the generator writes as a skeleton. Once it is filled in, it comes first
and takes precedence over the generic skills. These are archetype-neutral, and the skill of the archetype says how
each step is expressed there:
- the skill `lernapps-content-research`: the curriculum, the competencies and the verified sources, before the plan;
- the skill `lernapps-exercise-patterns`: exercises from shared data, patterns and, where needed, a component;
- the skill `lernapps-content-growth`: how the app grows after its first version, one competency at a time.
