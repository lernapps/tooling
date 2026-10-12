# AGENTS.md

This repo is a learning app for lernapps.net: static, in the browser only, collecting nothing, accessible. You build
it with its creator. The plan file `.vibe/plan.md` holds the workflow: the phases, their tasks and the creator's
checkpoints.

## Always

1. Keep the plan in `.vibe/plan.md`. If it does not exist, create it from the template:
   `node_modules/@lernapps/tooling/guidance/plan-template.md`, or, before the app exists,
   <https://raw.githubusercontent.com/lernapps/tooling/main/guidance/plan-template.md>. Then follow the plan exactly:
   read it before each step, and do what its tasks and comments say.
2. Load the skill `lernapps-app` before you start: it holds the rules every app follows. Load the skills it names
   when a task needs them. Not installed: `npx skills add lernapps/tooling`.
3. Never bypass a git hook (`--no-verify`). Never edit `prePushFailures`.

## Language

- Texts for learners, teachers and parents: German, in plain language.
- Talk to the creator in their language.
