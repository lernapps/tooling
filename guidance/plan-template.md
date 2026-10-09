---
# Read by the git hooks, the review and the evals.
# Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json. Keep all three keys.
# archetype: the kind of app, chosen at the end of Explore: explainer, interactive or quiz. null until then.
archetype: null
# phase: the phase you work in now: explore, plan, code or commit. Change it when you enter the next phase.
phase: explore
# prePushFailures: failed runs of the pre-push hook. The hook counts them. Never change this value.
prePushFailures: 0
---

# Plan: <name of the app>

<!--
This file guides you, the assistant, and shows the creator where you are.
- Keep it at .vibe/plan.md. Read it before each step.
- Work through one phase at a time: Explore, Plan, Code, Commit. Do the tasks of the current phase in order.
- Tick a task when it is done and move it to "Completed" of its phase. Add tasks as you find them.
- A task marked as a checkpoint means: stop, show the creator what they need to decide, and wait for their answer.
- Write the plan in the language you talk to the creator in. Keep the headings and the front matter keys as they
  are: the review reads them.
- Delete these comments only where you have filled the part they explain.
-->

*Started on <date>. Workflow: Explore, Plan, Code, Commit.*

## Goal

<!-- One or two sentences: what learners do in the app, and what they learn or train by it. Fill it in Explore. -->

## Key decisions

<!--
One line each: the decision and why. The archetype is the first one. Add decisions in any phase.
Mark a choice you made without asking the creator with "(guess)", and list it in the retrospective.
-->

## Notes

<!-- What you need later: sources and licences of content, links, open questions. -->

## Explore

<!--
Find out what the app is for, for whom, and what the app overview needs to help adults find it.
Ask the creator; write no code. Ask one or two questions per turn, in plain words. Do not ask what you can derive
from earlier answers. Write each answer under "Answers".
-->

### Tasks

- [ ] Ask what the app is for: what do learners do in it, and what do they learn or train?
- [ ] Ask who the learners are: subject, school year, what they know already.
- [ ] Ask where the content comes from: written by the creator, or taken from others (with source and licence)?
- [ ] Fetch the entry schema of the app overview: https://lernapps.net/apps/schemas/entry.v1.schema.json. Read the
      description of every property. Ask the creator what it needs to help adults (teachers, parents) find the app.
      Fill the "Entry draft" from the answers.
- [ ] Choose the archetype from the answers: `explainer` (many pages of explanation and exercises, every page readable
      without JavaScript), `interactive` (one app page in the browser, plus a static start page) or `quiz`
      (questions with options and feedback). Write it under "Key decisions" with the reason; set `archetype`.
- [ ] Set `phase: plan`.

### Answers

<!-- The creator's answers, in their words, one bullet per question. -->

### Entry draft

<!--
The entry of the app in the app overview, as YAML that validates against the entry schema. Use the schema's
property names; its descriptions say what each one needs. Fill it from the answers; never invent a value. Leave out
what is not known yet, such as the app's address before it is published. The listing completes it.
-->

```yaml
```

### Completed

## Plan

<!--
Turn the answers into tasks the creator can confirm in one read. After the confirmation you work on your own: the
creator's turns from here to the listing are counted in the retrospective (target: at most 3).
-->

### Tasks

- [ ] Write the tasks of Code under "Code": the pages or screens, the content, and what each must show. Each task
      ends in a commit.
- [ ] Show the creator the goal, the archetype, the entry draft and the tasks, short.
- [ ] **Checkpoint:** confirm the plan. Stop and wait for the creator. Change the plan if they ask, then ask again.
- [ ] Set `phase: code`.

### Completed

## Code

<!--
Generate the app, then build it task by task. Load the skill lernapps-app and the skill of the archetype before you
write code. Commit after each task: the git hooks run the checks. Fix every failed check from its message; never
bypass a hook. When you cannot decide something, choose, mark it "(guess)" under "Key decisions" and go on.
-->

### Tasks

- [ ] Generate the app from the archetype: `lernapps create --archetype <archetype>`. Keep this plan at
      `.vibe/plan.md` in the new app.
- [ ] Load the skill `lernapps-app` and the skill of the archetype.
- [ ] <the tasks written in Plan>
- [ ] `npx lernapps check` passes.
- [ ] Set `phase: commit`.

### Completed

## Commit

<!--
Publish the app and list it, each only after the creator says yes. Then fill the retrospective.
-->

### Tasks

- [ ] Push. The pre-push hook runs the heavy checks; fix what fails.
- [ ] **Checkpoint:** publish. Ask the creator before the app goes online, and wait for their yes.
- [ ] Complete the entry draft with what is known now, such as the app's address.
- [ ] **Checkpoint:** list. Ask the creator before you open the listing pull request, and wait for their yes.
- [ ] Fill the retrospective.
- [ ] Open the listing pull request (skill `lernapps-listing`).

### Completed

## Retrospective

<!--
Fill it at the end of Commit, before the listing pull request: facts, short, no names of people. The review reads
it with the listing; the evals compare it across runs. It stays in the creator's repo.
-->

### Phases reached

<!-- The last phase you completed and the checkpoints the creator passed. Example: "commit; confirmed, published". -->

### Failed checks

<!--
Each check that failed, with its rule id and how often. Example: "`no-request-before-click`: 2".
Leave out the failed pre-push runs: the hook counts them in the front matter.
-->

### Creator turns after the plan

<!-- How many messages the creator sent after confirming the plan, and what each was about. Target: at most 3. -->

### Where I had to guess

<!--
Each place where this plan, a skill, a message or the creator's answers did not tell you what to do, and what you
chose. Write "None" if there was none.
-->
