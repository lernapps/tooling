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
4. Until the first publish, work on the branch `work`: if your environment asks you to push, push `work` only. The
   first publish, in the plan's Commit phase, creates `main` (a push to `main` publishes the app); then push `main`
   as the plan's tasks say. While a check fails, tell the creator instead of pushing.
5. The repo's default branch must be `main`, or update pull requests miss what is published. Once `main` is pushed,
   set it: `gh repo edit --default-branch main`, or a repository admin clicks Settings → General → Default branch.

## Content

- In Explore: if `.agents/skills/app-content/SKILL.md` is filled in, load it first and follow it; it takes
  precedence over the generic skills. Otherwise load the skill `lernapps-content-research`.
- Once the creator has confirmed the plan, fill in `app-content` with precise, concrete instructions before you build.
- Whenever a content decision changes (a new pattern, a figure type, a source rule), update `app-content` in the same
  commit. The plan records one run; `app-content` is the standing guide for the agents after you.

## Language

- Texts for learners, teachers and parents: German, in plain language.
- Talk to the creator in their language.
