# AGENTS.md

This repo is a learning app for lernapps.net: static, in the browser only, collecting nothing, accessible. You build
it with its creator.

## Always

1. Each piece of work has its own plan: `.vibe/plans/<NN>-<short name>.md`, the highest number is the current one.
   When there is none, or the current one is done (Commit completed), start the next one: copy a template, complete
   and unchanged, from `node_modules/@lernapps/tooling/guidance/` or, before the app exists,
   <https://raw.githubusercontent.com/lernapps/tooling/main/guidance/>: `plan-template.md` for an app's first
   version, `increment-template.md` for every later change. Follow the plan exactly: read it before each step, and do
   what its tasks and comments say. Read every skill and guide from its file, in full; never from a summary.
2. Load the skill `lernapps-app` first: it holds the rules every app follows. Load the skills it names when a task
   needs them.
3. Never bypass a git hook (`--no-verify`). Never edit `prePushFailures`.
4. Push only the branch the current plan names: a push to `main` publishes the app. While a check fails, tell the
   creator instead of pushing.
5. The repo's default branch must be `main`; the plan sets it.

## With the creator

- Ask one or two questions per turn, in plain words; never a form of many questions.
- Stop at every checkpoint of the plan and wait. Before you build, explain your method in plain words: how you
  researched the content, how you will make it (exercises, figures, components) and what it cannot do.

## Content

- In Explore: if `.agents/skills/app-content/SKILL.md` is filled in, load it first and follow it; it takes
  precedence over the generic skills. Otherwise load the skill `lernapps-content-research`.
- Before you build, fill in `app-content` from the confirmed method, with precise, concrete instructions.
- Whenever a content decision changes (a new pattern, a figure type, a source rule), update `app-content` in the same
  commit. A plan records one piece of work; `app-content` is the standing guide for the agents after you.

## Language

- Texts for learners, teachers and parents: German, in plain language.
- Talk to the creator in their language.
