---
# Read by the git hooks, the review and the evals.
# Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json. Keep all four keys.
# archetype: the kind of app, as in the app's first plan: set it when you start this plan. It never changes.
archetype: null
# phase: the phase you work in now: explore, plan, code or commit. Change it when you enter the next phase.
phase: explore
# prePushFailures: failed runs of the pre-push hook during this increment. The hook counts them. Never change it.
prePushFailures: 0
# failedChecks: the rules that failed in a run of lernapps check (hooks included), with the number of runs. The check
# writes it. Never change it.
failedChecks: {}
---

# Increment: <what this increment adds>

<!--
This file guides you, the assistant, through one increment of an app that is already published: new competencies,
chapters, pages, rounds or questions, or a correction. It shows the creator where you are.
- Keep it at .vibe/plans/<NN>-<short name>.md, NN one more than the highest number there (02 after 01). The plan with
  the highest number is the current one; the others record earlier increments: never change them. In an app made
  before plans per piece of work, `.vibe/plan.md` is plan 01: start this one as 02; the update in Code moves it.
- Read each skill and page this plan names in full, from its file: a skill from the app's `.agents/skills/`, a page
  downloaded unchanged. Never work from the summary of a fetch tool: it loses tasks and rules.
- The decisions of the first version stand: the archetype, the content method and the content guide
  `.agents/skills/app-content/SKILL.md`. Follow the guide; change it only where this increment needs a new pattern,
  figure type or source rule, and say so at the checkpoints.
- Work through one phase at a time: Explore, Plan, Code, Commit. Do the tasks of the current phase in order.
- Tick a task when it is done and move it to "Completed" of its phase. Add tasks as you find them.
- A task marked as a checkpoint means: stop, show the creator what they need to decide, and wait for their answer.
- A push to `main` publishes the app. Work on the branch `increment/<NN>-<short name>` until the creator says yes to
  publishing; if your environment asks you to push, push that branch only. While a check fails, tell the creator
  instead of pushing.
- Write the plan in the language you talk to the creator in. Keep the headings and the front matter keys as they
  are: the review reads them.
- Delete these comments only where you have filled the part they explain.
-->

*Started on <date>. Workflow: Explore, Plan, Code, Commit.*

## Goal

<!-- One or two sentences: what learners can do after this increment that they could not before. Fill it in Explore. -->

## Key decisions

<!--
One line each: the decision and why. Add decisions in any phase.
Mark a choice you made without asking the creator with "(guess)", and list it in the retrospective.
-->

## Notes

<!-- What you need later: sources and licences of content, links, open questions. -->

## Explore

<!--
Find out what this increment adds, and research it. Ask the creator; write no code. Ask one or two questions per
turn, in plain words. Do not ask what you can derive from earlier answers or from the app. Write each answer under
"Answers".
-->

### Tasks

- [ ] Set `archetype` as in the app's first plan in `.vibe/plans/`.
- [ ] The skills are in the app's repo, in `.agents/skills/`. Only if they are missing, install them:
      `npx skills add lernapps/tooling`.
- [ ] Load the content guide `.agents/skills/app-content/SKILL.md` and the skill `lernapps-content-growth`, and read
      the plans in `.vibe/plans/`: what the app teaches, how its content is made, and what earlier increments left
      open.
- [ ] Ask what this increment adds or changes: which competencies, chapters or rounds, for which school years.
- [ ] Research the new content: follow the guide's curriculum and sources, and the skill `lernapps-content-research`
      for what the guide does not cover yet. Write the curriculum orientation (the Lehrplan, cited where you used
      one), the new competencies by chapter and the verified sources under "Notes".
- [ ] **Checkpoint:** research. Explain to the creator, in plain words, what you found and how: the curriculum
      orientation, the new competencies by chapter, the sources and how you checked them, and what you could not check.
      Stop and wait for the creator. Change it if they ask, then ask again.
- [ ] Set `phase: plan`.

### Answers

<!-- The creator's answers, in their words, one bullet per question. -->

### Completed

## Plan

<!--
Turn the answers into tasks the creator can confirm in one read. After the confirmation you work on your own: the
creator's turns from here to the end are counted in the retrospective (target: at most 3).
-->

### Tasks

- [ ] Write the tasks of Code under "Code": one slice per competency, as the skill `lernapps-content-growth` says, in
      the order the guide's procedure names. Each slice ends in a commit.
- [ ] Write the content method under "Content method": which patterns, figures and components of the guide each
      slice uses, and anything new, with the reason the guide's patterns do not fit.
- [ ] Show the creator the goal, the new competencies by chapter and the slices, short. Explain in plain words what
      learners will see and do, and anything new in how the content is made.
- [ ] For every new component and interactive exercise, show a sketch: a static SVG or image of what learners see,
      or the steps (what they do, what they see after each). A description in words alone is not enough.
- [ ] **Checkpoint:** confirm the plan and the content method. Stop and wait for the creator. Change the plan if they
      ask, then ask again.
- [ ] Set `phase: code`.

### Content method

<!--
One line each: the guide's patterns, figures and components this increment uses, and where; anything new (a pattern,
a figure type, a component, a source rule), what it does and what it cannot do. New things go into the guide in
the slice that adds them.
-->

### Completed

## Code

<!--
Build the increment slice by slice. Load the skill lernapps-app, the skill of the archetype and the content guide
before you write content. Commit after each slice: the git hooks run the checks. The pre-commit hook is quiet: when
it fails, it prints one line naming the step and its log, `node_modules/.cache/lernapps/pre-commit.log`; read that
log for the messages. Fix every failed check from its message; never bypass a hook. When you cannot decide
something, choose, mark it "(guess)" under "Key decisions" and go on.
-->

### Tasks

- [ ] Switch to a new branch from `main`: `git switch -c increment/<NN>-<short name>`. Commit this plan on it.
- [ ] Update the app to the newest tooling and runtime: `npx --yes github:lernapps/tooling#main update`, then
      `npm install`. It also replaces the `lernapps-*` skills: read the ones you use again. Commit the update on its
      own, and fix what its checks report before you add content.
- [ ] <the slices written in Plan, each: competency, content, exercise, the entry's topic, check, commit>
- [ ] The content guide describes the app as it is now: its competencies, chapters and patterns, and its procedure
      for the next increment (`app-content-matches`).
- [ ] `npx lernapps check` passes.
- [ ] Set `phase: commit`.

### Completed

## Commit

<!--
Publish the increment only after the creator says yes; open the pull requests (to `main`, to the catalog) without
asking: they publish nothing, and their preview and result are what the creator decides on. Then fill the
retrospective.
A push to `main` publishes the app: the workflow `Pages` checks it and, in its job `deploy`, publishes the checked
bundle. A pull request to `main` runs the same checks without publishing.
-->

### Tasks

- [ ] Push the branch and open a pull request to `main` in the app's repo. The pre-push hook runs the heavy checks;
      fix what fails. See the checks of the pull request through to green. When a GitHub step fails or is refused,
      load the skill `lernapps-github`.
- [ ] **Checkpoint:** publish. Show the creator what the increment adds and the link to its preview from the comment
      "Vorschau der App" on the pull request, and ask whether it may go online. Wait for their yes.
- [ ] Merge the pull request into `main` (or, without a pull request, merge the branch into `main` and push `main`).
      Watch the run of the workflow `Pages` for that commit until it ends. If it fails, read the message of the
      failed step, fix what you can and push again.
- [ ] Open the address the job `deploy` printed ("published at ...", also in the run's summary) and confirm that it
      shows the new content. Take that address, never one you derive; follow its redirects.
- [ ] If the app is listed and the increment changes what its entry says (topics, school years, summary): load the
      skill `lernapps-listing` and write the changed entry. Otherwise skip the next task.
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it. A push that changes only `.vibe/` publishes nothing again.
- [ ] **Checkpoint:** list. If you wrote a changed entry, open the pull request to the catalog without asking first:
      the pull request is the review. See it through to "bestanden" as the skill says, then show the creator the
      pull request and its result.
- [ ] If this plan changed since its last push, commit it on `main` and push it again.

### Completed

## Retrospective

<!--
Fill it at the end of Commit: facts, short, no names of people. The review reads it; the evals compare it across
runs and increments. It stays in the creator's repo.
-->

### Phases reached

<!-- The last phase you completed and the checkpoints the creator passed. Example: "commit; confirmed, published". -->

### Creator turns after the plan

<!-- How many messages the creator sent after confirming the plan, and what each was about. Target: at most 3. -->

### Where I had to guess

<!--
Each place where this plan, a skill, the content guide, a message or the creator's answers did not tell you what to
do, and what you chose. Write "None" if there was none.
-->
