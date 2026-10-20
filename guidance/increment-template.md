---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype as in the app's first plan; set it when you start. Never changes.
archetype: null
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: explore
# prePushFailures: failed pre-push runs of this increment, written by the hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: {}
---

# Increment: <what it adds>

<!--
For you, the assistant. One increment of a published app: new competencies, chapters, pages, rounds, questions, or
a correction.
1. Path: `.vibe/plans/<NN>-<short name>.md`, NN = highest + 1. Never change an earlier plan. App with only
   `.vibe/plan.md`: that is plan 01; start this one as 02 (the update in Code moves it).
2. The first version's decisions stand: archetype, content method, content guide
   `.agents/skills/app-content/SKILL.md`. Change the guide only for a new pattern, figure type or source rule; say
   so at the checkpoints.
3. Read this plan before each step. One phase at a time, tasks in order.
4. Task done → tick `[x]` at once and move it to "Completed" of its phase. New task found → add it.
5. Each phase names its skills. Load a skill when its task comes, not before. Read it in full, from its file.
6. Checkpoint: stop, ask, wait for the creator's answer.
7. At most 2 questions per message, one topic each.
8. Work on the branch `increment/<NN>-<short name>` until the yes to publish; push only that branch.
9. Rules of the workflow, with their ids: `@lernapps/tooling/guidance/workflow-rules.md`.
10. Plan in the creator's language. Keep headings and front matter keys. Delete a comment once its part is filled.
-->

*Started <date>. Explore, Plan, Code, Commit.*

## Goal

<!-- 1–2 sentences: what learners can do after this increment. -->

## Key decisions

<!-- One line each: decision and reason. Your own choice without the creator: mark "(guess)". -->

## Notes

<!-- Curriculum orientation, new competencies by chapter, didactic approach, scope, sources and licences, open
questions. -->

## Explore

<!--
- All content questions belong here; Plan maps the answers onto the app. Ask; write no code.
- Skip what earlier answers or the app already tell. Never tick a topic you assumed.
- Skills: the content guide `app-content`, `lernapps-content-research`.
-->

### Tasks

- [ ] Set `archetype` as in the app's first plan in `.vibe/plans/`.
- [ ] Skills are in `.agents/skills/`; if missing, install them as the first task of the plan template says.
- [ ] Load the content guide `.agents/skills/app-content/SKILL.md`. Read the plans in `.vibe/plans/`: what the app
      teaches, how its content is made, what is open.
- [ ] Interview: one topic per question, the creator's words under "Answers". No answer → ask once more, then
      "(guess)". Topics: which competencies, chapters or rounds, for which school years; hurdles and examples;
      amount; any change of look and feel or terms.
- [ ] Load skill `lernapps-content-research`. Research what the guide's curriculum and sources do not cover. Under
      "Notes": curriculum orientation, new competencies by chapter as "Ich kann …", verified sources.
- [ ] Under "Notes": the didactic approach per competency and the scope (in, out, data range).
- [ ] **Checkpoint:** research. Show in plain words: curriculum orientation, new competencies by chapter, didactic
      approach, scope, every "(guess)", sources and how you checked them, what is unchecked. Stop and wait.
      Changes → change, ask again.
- [ ] Set `phase: plan`: change the value line (`grep '^phase:'` prints `phase: plan`).

### Answers

<!-- The creator's answers, in their words, one bullet each. -->

### Completed

## Plan

<!--
- Map the new content onto the app with the guide's patterns. Confirmable in one read.
- After the yes, work on your own: at most 3 creator turns until the end.
- Skills: `lernapps-content-growth`; `lernapps-<archetype>-plan` and `lernapps-exercise-patterns` only for something
  the guide does not cover.
-->

### Tasks

- [ ] Load skill `lernapps-content-growth`. Write the Code tasks as slices, one per competency, in the guide's
      order. Mark the slices sub-agents can write in parallel.
- [ ] Write "Content method": the guide's patterns, figures and components per slice. Anything new: load skill
      `lernapps-<archetype>-plan` or `lernapps-exercise-patterns`, and say why the guide's patterns do not fit.
- [ ] Each new component or interactive exercise: a sketch (static SVG or image, or the steps). Words alone are not
      enough.
- [ ] Show the creator, short: goal, new competencies by chapter, slices; in plain words what learners see and do,
      what is new. At most 2 questions.
- [ ] **Checkpoint:** confirm the plan and the content method. Stop and wait for an explicit yes. Changes → change,
      ask again.
- [ ] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

<!-- One line each: the guide's patterns, figures and components used, and where; anything new, what it does and
cannot. Something new goes into the guide in the slice that adds it. -->

### Completed

## Code

<!--
- Commit after each slice; the hooks check. A check fails → skill `lernapps-check`. Fix from the message; never
  bypass a hook.
- Undecidable → choose, mark "(guess)", go on.
- Creator asks for a change → first say your reading in one sentence; never narrow it silently.
- Skills: `lernapps-check`, `lernapps-github-setup`, `lernapps-<archetype>`, `lernapps-content-questions`, the content
  guide.
-->

### Tasks

- [ ] `git switch -c increment/<NN>-<short name>` from `main`. Commit this plan on it.
- [ ] Load skill `lernapps-check`. Update the app as it says. Commit the update alone; fix its findings before
      content. The update replaces the `lernapps-*` skills: reread those you use.
- [ ] Push the branch and open its preview pull request as skill `lernapps-github-setup` says.
- [ ] Load skill `lernapps-<archetype>` and the content guide. Questions with options and feedback: also skill
      `lernapps-content-questions`.
- [ ] <the slices written in Plan; each: competency, content, exercise, the entry's topic, check, commit, push>
      Parallel slices: send each sub-agent `@lernapps/tooling/guidance/subagent-brief.md`, filled in.
- [ ] The content guide describes the app as it is now (`app-content-matches`). `grep -c "FILL IN"
      .agents/skills/app-content/SKILL.md` prints 0.
- [ ] `npx lernapps check` passes.
- [ ] Every box of Explore, Plan and Code ticked.
- [ ] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).

### Completed

## Commit

<!--
- Publish with the creator's yes. A push to `main` publishes.
- Skills: `lernapps-github`, `lernapps-listing`.
-->

### Tasks

- [ ] Load skill `lernapps-github`. See the pull request's checks to green as it says.
- [ ] **Checkpoint:** publish. Show what the increment adds and the preview link; ask whether it may go online. Wait
      for the yes.
- [ ] Publish as skill `lernapps-github` says: the branch into `main`, the run of `Pages` watched to the end.
- [ ] Open the address the job `deploy` printed; confirm the new content. Never a derived address.
- [ ] App listed and its entry changes (topics, school years, summary) → load skill `lernapps-listing` and write the
      changed entry. Else skip the next task.
- [ ] **Checkpoint:** list. Ask before opening the pull request to the catalog; wait for the yes.
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it. A push of only `.vibe/` publishes nothing.
- [ ] Catalog pull request opened → see it to "bestanden" as the skill says.
- [ ] Plan changed since its last push → commit it on `main`, push again.

### Completed

## Retrospective

<!-- At the end of Commit. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: at most 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, content guide, messages or answers, and your choice. "None" if none. -->
