# Introduction and Goals

This architecture describes the tooling with which a creator builds a learning app together with their AI agent,
so that it comes out static, frontend-only, collecting nothing, accessible and ready to list on lernapps.net. It
serves the platform design's service for creators, D6 `s-building-guidance` ("Agent guidance and starter templates"
in D1, <https://lernapps.net/docs/platform-design/>). The plan and the key decisions behind it are in
[`.vibe/development-plan-agentic-app-creation.md`](../../.vibe/development-plan-agentic-app-creation.md).

The tooling also holds what this repo already provides for every lernapps.net site (the site actions and the
Renovate preset). This document covers the app-creation tooling; the site actions appear only where the apps use them.

## 1.1 Requirements Overview

A creator, typically a teacher or a parent, has an idea for a small learning app and an AI agent that writes the code.
The creator is usually not a professional developer. The tooling has to carry the platform's rules into the agent's
work, so that the creator does not need to know them, and has to show before listing that the app keeps them.

| # | Use case | What the tooling does |
|---|---|---|
| UC-1 | Start an app | The agent follows a phased plan (Explore, Plan, Code, Commit) in a Markdown file the creator can read, and asks the creator what the app is for, for whom, and what the catalog needs to know |
| UC-2 | Get a starting point | The agent generates a scaffold for the kind of app (archetype), with toolchain, strict conventions, git hooks, i18n and a11y in place |
| UC-3 | Build by the rules | The agent loads conventions as skills: general rules for every app and guidance for the archetype and topic (e.g. third-party content in content-heavy apps) |
| UC-4 | Check while building | The agent and the git hooks run deterministic checks: the toolchain's lint, format, type and test checks plus our own checks of the platform rules (e.g. no requests to other servers before a click) |
| UC-5 | Validate for listing | A review agent in a fresh context runs the same deterministic checks on the built or deployed app, then judges what they cannot decide, and reports the result bound to one commit |
| UC-6 | List the app | The agent fetches the entry schema of the app overview, fills it from the plan and the validation report, and opens a pull request to lernapps/apps |

Two kinds of apps (archetypes) shape every use case from the start: content-heavy apps inspired by the
Mathe-Karte (pages of explanation, pictures and exercises, readable without JavaScript) and interactive apps like a
ten-finger typing trainer (a classic single-page app). A quiz archetype (a question bank as data and a generic
engine) is foreseen but not built yet. All are written in TypeScript, strictly enforced.

Out of scope for now: showing a catalog entry as a fact sheet of an app deployed elsewhere, with a guarantee that
the deployed app comes from the commit the entry refers to; re-validating listed apps over time. Both are planned
for a later increment and must stay possible.

## 1.2 Quality Goals

Grounded in the platform design: building is simple with the guidance, and listing takes minutes; what an app
sends is checked, not declared; nothing is collected in secret, neither by the apps nor by the tooling. Fewer
iterations for the assistant (cost), working through any assistant, and guidance that evolves with creators'
practices follow with medium priority.

See [10-quality-requirements.arc42.md](10-quality-requirements.arc42.md) for the complete
quality catalog with priorities and measurable scenarios.

## 1.3 Stakeholders

| Role | Contact | Expectations |
|---|---|---|
| Creator | teachers, parents, students who build an app; first the 5–10 creators the owner knows (D8) | Gets from an idea to a listed app in little time, without knowing the platform's rules or the toolchain; stays in control at a few clear decisions |
| Creator's AI agent | Claude Code, Codex, Cursor and others; claude.ai without a shell | Reaches a working, listable app in few iterations: clear next step, fast feedback, error messages that say how to fix a problem (D2 portrait of AI assistants) |
| Platform owner | Oliver Jägle ([@mrsimpson](https://github.com/mrsimpson)) | Decides whether an app is listed; needs a validation he can trust without reading every app; guidance that improves from what the reviews find |
| Review agent | agent run by the platform in a fresh context | A defined procedure, the deterministic checks as a starting point, a rubric per archetype |
| Adopting adults | teachers and parents who use the app overview | Can trust the fitness signal of an entry: measured, not self-declared |
| Learners | students, indirectly | Apps that run at once, collect nothing, and work with assistive technology and on a phone |
| Mathe-Karte author | Ralf D. Müller ([@raifdmueller](https://github.com/raifdmueller)) | His app, skill, checks and review prompt are the inspiration for the content archetype; whether the Mathe-Karte itself follows the tooling is out of scope for now |
| Maintainers of the shared repos | `@lernapps/maintainers` | Few moving parts; one place per rule; Renovate carries changes to every repo |
