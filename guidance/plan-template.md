---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype, null until chosen in Explore. Allowed values: explainer, interactive, quiz.
archetype: null
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: explore
# prePushFailures: written by the pre-push hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: {}
---

# Plan: <app name>, first version

<!--
For you, the assistant.
1. Path: `.vibe/plans/01-<short name>.md`. Every later change gets its own plan from the increment template.
2. Read this plan before each step. One phase at a time, tasks in order.
3. Task done → tick `[x]` at once and move it to "Completed" of its phase. An unticked box counts as not done.
4. New task found → add it.
5. Each phase names its skills. Load a skill when its task comes, not before. Read it in full, from its file.
6. Checkpoint: stop, ask, wait for the creator's answer. A message sent before the question is no yes.
   Only a checkpoint waits. A phase's last box → set the next phase and go on in the same message.
7. At most 2 questions per message, one topic each. No questions inside drafts or lists.
8. Work on the branch `work`, locally: push nothing before Commit. Commit puts the app on GitHub and brings `work`
   into `main`.
9. Plan in the creator's language. Keep headings and front matter keys. Delete a comment once its part is filled.
10. Begin each reply to the creator with the phase in `phase:`, and at a checkpoint the word checkpoint:
    "**Plan · Checkpoint**", "**Code**". The creator always knows where you are.
-->

*Started <date>. Explore, Plan, Code, Commit.*

## Goal

<!-- 1–2 sentences: what learners do, what they learn. -->

## Key decisions

<!-- One line each: decision and reason. Archetype first. Your own choice without the creator: mark "(guess)". -->

## Notes

<!-- Curriculum orientation, competencies by chapter, didactic approach, scope, sources and licences, open
questions. -->

## Explore

<!--
- Find out what the app teaches, for whom, how much and how it looks. All content questions belong here; Plan only
  maps the answers onto the archetype.
- Ask. Write no code, run no `create`.
- An answer counts only in the creator's words under "Answers". Never tick a topic you assumed.
- Skills: `lernapps-app`, `lernapps-exercise-patterns`, `lernapps-<archetype>-design`, `lernapps-content-research`.
-->

### Tasks

- [ ] Install the skills, if missing (the app commits them): `npx --yes skills add
      lernapps/tooling -y -s lernapps-app lernapps-content-research lernapps-exercise-patterns
      lernapps-content-growth lernapps-check lernapps-content-questions lernapps-github lernapps-commit
      lernapps-listing`.
- [ ] Load skill `lernapps-app`. Tell the creator in two sentences what a lernapps app is and where it will live: at
      their own address, free, public, and once listed as a copy on lernapps.net. The technical part (GitHub) comes at the end, and you do it.
- [ ] Interview: ask the topics "Goal" and "Learners" of "Answers".
- [ ] Load skill `lernapps-exercise-patterns` and read the patterns of the subject: how will learners practise what
      the goal names? The kind of practice points to the archetype, as the skill says.
- [ ] Choose the archetype as skill `lernapps-app` says, from the kind of practice: read the README of each
      archetype in question, tell the creator what the chosen one can and cannot do. Write it and its reason under
      "Key decisions". Set `archetype`.
- [ ] Install the archetype's skills: `npx --yes skills add lernapps/tooling -y -s
      lernapps-<archetype>-design lernapps-<archetype>`. Load skill `lernapps-<archetype>-design`.
- [ ] Interview: ask the other topics of "Answers" in order. Skip a topic only when an earlier answer covers it; note
      which. No answer → ask once more; still none → write your assumption with "(guess)". Done when every topic
      has an answer or a guess.
- [ ] Load skill `lernapps-content-research`. Research as it says. Under "Notes": curriculum orientation,
      competencies by chapter as "Ich kann …", verified sources. No competencies → not done.
- [ ] Under "Notes", one line per competency: how learners get there (derive, not only read off; e.g. a tree diagram
      shows how a probability comes about), which misconception the feedback catches.
- [ ] Under "Notes", the scope: what is in, what is out and why, the data range (e.g. "all main-group elements",
      never a silent "1–20"), the languages.
- [ ] Fetch https://lernapps.net/apps/schemas/entry.v1.schema.json and read each property's description. Ask what
      helps teachers and parents find the app. Fill "Entry draft". Search words: one or two words each, as people
      type them.
- [ ] **Checkpoint:** research. Show in plain words: curriculum orientation, competencies by chapter, didactic
      approach, scope, every "(guess)", sources and how you checked them, what is unchecked, archetype and reason.
      Stop and wait. Changes → change, ask again.
- [ ] Set `phase: plan`: change the value line (`grep '^phase:'` prints `phase: plan`).

### Answers

<!-- The interview: per topic the creator's answer, in their words. Keep the topics. -->

- Goal: what learners do in the app, what they learn.
- Learners: subject, school year, prior knowledge. Land and Schulform only if the creator names a school or class,
  at most once; none → KMK-Bildungsstandards.
- Model and focus: an app of the catalog (read https://lernapps.net/apps/llms.txt) as model; what matters most
  (exercises, visualisations, game feel).
- Hurdles: misconceptions and mistakes of the learners; the creator's examples and experiments.
- Content: who writes it (creator, you, from sources); own material (worksheets, tests); how it is made (sources,
  research, a data format).
- Amount: how much content per level or chapter in the first version (e.g. "one text per school year"); what comes
  later.
- Languages: German only, or more (texts, code).
- Look and feel: calm like a worksheet, or like a game (colours, praise, effects); dark mode.
- Terms: the creator's words for the main things in the app, used everywhere.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
```

### Completed

## Plan

<!--
- Map the confirmed content onto the archetype: structure, screens or pages, exercise patterns, data files,
  components.
- No new content questions. A content gap → back to Explore; say so.
- Confirmable in one read. After the yes, work on your own: at most 3 creator turns until the listing.
- Skills: `lernapps-<archetype>-design` and `lernapps-exercise-patterns`, both loaded in Explore.
-->

### Tasks

- [ ] `grep '^phase:'` prints `phase: plan`; else set it.
- [ ] Map the content as skill `lernapps-<archetype>-design` says; reread it if it is no longer in view.
- [ ] Choose a pattern per competency as skill `lernapps-exercise-patterns` says (loaded in Explore; reread it if it
      is no longer in view). Write "Content method".
- [ ] Write the Code tasks under "Code": pages or screens, their content, what each shows. Each ends in a commit.
- [ ] Each screen, component or interactive exercise: a sketch (static SVG or image, or the steps with what
      learners see after each). Words alone are not enough.
- [ ] Show the creator, short: goal, competencies by chapter, entry draft, tasks, sketches; the content method in
      plain words (what learners see and do, what it cannot do). At most 2 questions.
- [ ] **Checkpoint:** confirm the plan and the content method, with the sketches shown. Stop and wait for an
      explicit yes. Changes → change, ask again. No `create` before the yes.
- [ ] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

<!-- One line each: exercise patterns and where; figures and how they are made; data files; each component, what it
checks and cannot; how a later agent adds a chapter. Becomes the content guide in Code. -->

### Completed

## Code

<!--
- Build the app from the archetype and the confirmed plan, locally on `work`. Work on your own.
- Commit after each task; the hooks check. A check fails → skill `lernapps-check`. Fix from the message; never
  bypass a hook.
- Undecidable → choose, mark "(guess)" under "Key decisions", go on.
- Creator asks for a change → first say your reading in one sentence ("Ich nehme alle 44 Hauptgruppenelemente
  auf."); never narrow it silently. Content change → update "Notes" too.
- Skills: `lernapps-check`, `lernapps-<archetype>`, `lernapps-content-questions`, and the app's content guide
  `app-content`.
-->

### Tasks

- [ ] `grep '^phase:'` prints `phase: code`; else set it.
- [ ] Load skill `lernapps-check`. Create the app in this plan's folder as it says. `create` keeps this plan. Never
      write the app by hand.
- [ ] Fill the content guide `.agents/skills/app-content/SKILL.md` from "Notes" and "Content method"
      (`app-content-guide`). `grep -c "FILL IN" .agents/skills/app-content/SKILL.md` prints 0. Commit it before
      any content.
- [ ] Load skill `lernapps-<archetype>` and the content guide. Questions with options and feedback: also skill
      `lernapps-content-questions`.
- [ ] <the tasks written in Plan; after each, commit on `work`>
- [ ] The content guide matches what was built (`app-content-matches`).
- [ ] `npx lernapps check` passes.
- [ ] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
      each with the confirmed sketches.
- [ ] Every box of Explore, Plan and Code ticked.
- [ ] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).
      No checkpoint here: set it before you ask or report anything, then start Commit in the same message.

### Completed

## Commit

<!--
- Put the app on GitHub, publish it with the creator's yes, then list it. A push to `main` publishes.
- Open the pull requests (to `main`, to the catalog) without asking: they publish nothing; their preview and result
  are what the creator decides on.
- Skills: `lernapps-github`, `lernapps-commit`, `lernapps-listing`.
-->

### Tasks

- [ ] `grep '^phase:'` prints `phase: commit`; else set it.
- [ ] Load skill `lernapps-github`. Repo and Pages as it says: ask the repo name and every click only the creator can
      make in one message.
- [ ] Push `work`, open the preview pull request, see its checks to green as the skill says.
- [ ] **Checkpoint:** publish. Show what the app does and the preview link from the comment "Vorschau der App"; ask
      whether it may go online; put any open click into the same question. Wait for the yes.
- [ ] Load skill `lernapps-commit`. Publish as skill `lernapps-github` says: `work` into `main` as one squash commit
      with the message from this plan, the run of `Pages` watched to the end.
- [ ] Open the address the job `deploy` printed; confirm the app shows. Use that address, never a derived one.
- [ ] Load skill `lernapps-listing`. Complete the entry draft (e.g. the address).
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it: the listing check and the review read it there.
- [ ] **Checkpoint:** list. Open the listing pull request as the skill says, without asking first: the pull request
      is the review. See it to "bestanden", then show the creator the pull request and its result; change nothing in
      it without their word.
- [ ] Plan changed since its last push → commit it on `main`, push again.

### Completed

## Retrospective

<!-- At the end of Commit, before the listing pull request. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: at most 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, messages or answers, and your choice. "None" if none. -->
