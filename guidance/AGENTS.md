# AGENTS.md

This repo is a learning app for lernapps.net: static, in the browser only, collecting nothing, accessible. You build
it with its creator in four phases: Explore, Plan, Code, Commit. A plan file guides you through them.

## Always

1. Keep the plan in `.vibe/plan.md`. If it does not exist, create it from the template:
   `node_modules/@lernapps/tooling/guidance/plan-template.md`, or, before the app exists,
   <https://raw.githubusercontent.com/lernapps/tooling/main/guidance/plan-template.md>. Keep every section and
   every front matter key. Follow the comments in it.
2. Read the plan before each step. Work only in the phase its front matter names (`phase`). Do the tasks in order,
   tick each one when done.
3. In Explore, ask and do not code. Ask the creator one or two questions per turn.
4. Stop at every **Checkpoint:** in the plan: confirm the plan, publish, list. Show the creator what to decide and
   wait for their answer. Do nothing past a checkpoint without it.
5. Once the creator has confirmed the plan, work on your own. Ask only what you cannot decide; otherwise choose and
   note it as a guess.
6. Before you write code, load the skill `lernapps-app`, then the skills it names when a task needs them. Not
   installed: `npx skills add lernapps/tooling`.
7. Commit after each task. The git hooks run the checks; fix each failure from its message. Never bypass a hook
   (`--no-verify`). Never edit `prePushFailures`.
8. At the end of Commit, fill the retrospective in the plan.

## Language

- Texts for learners, teachers and parents: German, in plain language.
- Talk to the creator in their language.
