# Introduction and Goals

This architecture describes the tooling with which a creator builds a learning app together with their AI agent,
so that it comes out static, frontend-only, collecting nothing, accessible and ready to list on lernapps.net. It
realises the platform's [guidance for building apps](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-building-guidance), the "agent guidance and starter templates"
of the [platform](https://lernapps.net/docs/platform-design/#2-design/d1-ecosystem.pdt42.md:el-platform-lernapps).

The tooling also holds what this repo already provides for every lernapps.net site (the site actions and the
Renovate preset). This document covers the app-creation tooling; the site actions appear only where the apps use them.

## 1.1 Requirements Overview

A creator, typically a teacher or a parent, has an idea for a small learning app and an AI assistant that writes
the code. The creator is usually not a professional developer. The tooling carries the rules in scope for the app
(chapter 8, rule model) into the assistant's work, so that the creator does not need to know them, and shows before
listing that the app keeps them.

The creator's journey has five steps. Process guidance runs through all of them: the assistant follows the phases of
a plan file (Explore, Plan, Code, Commit) that the creator can read, and stops at the creator's checkpoints.

| # | Step | Phase | What the tooling does |
|---|---|---|---|
| UC-1 | Clarify the app | Explore | The assistant asks what the app is for, for whom and what the catalog needs to know, and chooses the archetype. No code yet |
| UC-2 | Set up | Plan → Code | Once the creator confirms the plan, the assistant generates the scaffold of the archetype: toolchain, strict TypeScript, git hooks, i18n and a11y in place |
| UC-3 | Build | Code | The assistant follows the skills (general, per archetype, per topic) and gets fast feedback from the git hooks and our checks of the rules in scope |
| UC-4 | Validate | Commit | The same deterministic checks run on the built or deployed app; a review agent in a fresh context judges what they cannot decide; the report is bound to one commit |
| UC-5 | List | Commit | The assistant fetches the entry schema of the app overview, fills it from the plan and the validation report, and opens a pull request to lernapps/apps |

Three kinds of apps (archetypes) shape every use case from the start:

- `explainer`: content-heavy apps with pages of explanation, pictures and exercises, readable without JavaScript;
- `interactive`: apps like a ten-finger typing trainer, a classic single-page app;
- `quiz`: a complete quiz built into the scaffold, so that the creator supplies only the questions and their options.

All are written in TypeScript, strictly enforced.

Not part of the tooling: showing a catalog entry as a fact sheet of an app deployed elsewhere, and re-validating
listed apps over time. Both belong to the app overview; the tooling makes them possible by binding every validation
report to a commit.

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
| Creator | teachers, parents, students who build an app | Gets from an idea to a listed app in little time, without knowing the platform's rules or the toolchain; stays in control at a few clear decisions |
| Creator's AI agent | Claude Code, Codex, Gemini CLI and others; chat assistants without a shell | Reaches a working, listable app in few iterations: clear next step, fast feedback, error messages that say how to fix a problem ([AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants)) |
| Platform owner | Oliver Jägle ([@mrsimpson](https://github.com/mrsimpson)) | Decides whether an app is listed; needs a validation to trust without reading every app; guidance that improves from what the reviews find |
| Review agent | agent run by the platform in a fresh context | A defined procedure, the deterministic checks as a starting point, a rubric per archetype |
| Adopting adults | teachers and parents who use the app overview | Can trust the fitness signal of an entry: measured, not self-declared |
| Learners | students, indirectly | Apps that run at once, collect nothing, and work with assistive technology and on a phone |
| Maintainers of the shared repos | `@lernapps/maintainers` | Few moving parts; one place per rule; Renovate carries changes to every repo |
