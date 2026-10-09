---
name: lernapps-app
description: Use when you build or change a learning app for lernapps.net. The workflow with the plan file (Explore, Plan, Code, Commit, checkpoints, retrospective) and the rules every app follows. Load it before you write code in an app repo.
license: MIT
---

# Building a lernapps app

A lernapps app is static, runs in the browser only, collects nothing and is accessible. The creator decides what it
teaches; you build it, check it and prepare its listing. Every rule below has an id: check messages, the review and
the retrospective name rules by it.

## Workflow

1. **Plan file.** Keep the plan in `.vibe/plan.md`, started from the template of `@lernapps/tooling`
   (`guidance/plan-template.md`). Its front matter holds `archetype`, `phase` and `prePushFailures`; its comments say
   what each part needs.
2. **Explore.** Ask what the app is for, for whom, and where the content comes from. Fetch the entry schema of the
   app overview (<https://lernapps.net/apps/schemas/entry.v1.schema.json>), ask what it needs to help adults find the
   app, and write the entry draft into the plan. Choose the archetype; set `archetype` and `phase: plan`.
3. **Plan.** Write the tasks of Code. Show the creator the goal, archetype, entry draft and tasks. Checkpoint:
   confirm the plan.
4. **Code.** `lernapps create --archetype <archetype>`, then load the skill of the archetype. Build task by task;
   commit after each one. Fix each failed check from its message.
5. **Commit.** Push. Checkpoint: publish. Complete the entry draft. Checkpoint: list. Fill the retrospective, then
   open the listing pull request (skill `lernapps-listing`).

## Rules

<!--
Rule declarations are placeholders until the convention for rule ids (lernapps/tooling#11) is merged; the ids stay.
Format: rule id=<id> scope=<listing|site|archetype:name> severity=<error|warning|hint> enforcement=guided
-->

### `plan-file`: Keep the plan file

<!-- rule id=plan-file scope=listing severity=error enforcement=guided -->

Keep `.vibe/plan.md` from the template, with every section and front matter key. Update `phase` when you enter a
phase. Never edit `prePushFailures`: the pre-push hook writes it.

### `explore-before-code`: No code before the plan is confirmed

<!-- rule id=explore-before-code scope=listing severity=error enforcement=guided -->

Write no code and generate nothing until the creator has confirmed the plan.

### `stop-at-checkpoints`: Stop at the creator's checkpoints

<!-- rule id=stop-at-checkpoints scope=listing severity=error enforcement=guided -->

Stop at each checkpoint (confirm the plan, publish, list) and wait for the creator's answer. Example: "Die App ist
fertig und geprüft. Soll ich sie jetzt veröffentlichen?"

### `few-turns-after-plan`: Work on your own after the plan

<!-- rule id=few-turns-after-plan scope=listing severity=hint enforcement=guided -->

After the plan is confirmed, ask the creator only what you cannot decide. Otherwise choose, mark it "(guess)" under
"Key decisions" and list it in the retrospective.

### `entry-from-schema`: Fill the entry from the published schema

<!-- rule id=entry-from-schema scope=listing severity=error enforcement=guided -->

Fetch the entry schema each time you need it; never fill the entry from memory or from another app. Take every value
from the creator's answers, the plan or the app; never invent one.

### `fix-from-message`: Fix failed checks, never bypass them

<!-- rule id=fix-from-message scope=listing severity=error enforcement=guided -->

Read the message of a failed check and fix the cause. Never bypass a hook (`--no-verify`), never delete a test to
make it pass. Suppress a warning only where it occurs, with the reason next to it.

### `retrospective-filled`: Fill the retrospective

<!-- rule id=retrospective-filled scope=listing severity=error enforcement=guided -->

At the end of Commit, fill every part of the retrospective with facts: phases reached, failed checks with rule ids,
the creator's turns after the plan, where you had to guess. No names of people.

### `no-tracking`: Collect nothing

<!-- rule id=no-tracking scope=listing severity=error enforcement=guided -->

The app is free. No cookies, no analytics, no ads, no accounts, no server that stores data. If the app stores anything, it stays on
the device (`localStorage`).

### `learners-act`: Learners do something themselves

<!-- rule id=learners-act scope=listing severity=error enforcement=guided -->

Learners try, practise or decide in the app; reading alone is not enough. Each page or screen asks them to act.

### `no-request-before-click`: No request to another server before a click

<!-- rule id=no-request-before-click scope=listing severity=error enforcement=guided -->

Bundle fonts, scripts and pictures at build time. Load anything from another server (a video, a map) only after the
learner clicks for it.

### `accessible`: Accessible and usable at 360 px

<!-- rule id=accessible scope=listing severity=error enforcement=guided -->

Meet WCAG 2.1 AA: labels, contrast, keyboard use, text alternatives. Every page works at 360 px width without
horizontal scrolling.

### `readable-without-javascript`: Readable without JavaScript

<!-- rule id=readable-without-javascript scope=site severity=error enforcement=guided -->

Every page says what it is and what the app does without JavaScript. The skill of the archetype says how much more.

### `imprint-and-privacy`: Link imprint and privacy notice

<!-- rule id=imprint-and-privacy scope=site severity=error enforcement=guided -->

Every page links to <https://lernapps.net/imprint/> and <https://lernapps.net/privacy/>.

### `learner-text-german`: German, plain language for learners

<!-- rule id=learner-text-german scope=listing severity=error enforcement=guided -->

Write every text for learners, teachers and parents in German, in plain language: short sentences, active voice, no
jargon. Keep the texts in message files, not in code.

### `third-party-licence`: Name source and licence of others' content

<!-- rule id=third-party-licence scope=listing severity=error enforcement=guided -->

Use content of others (texts, pictures, quotes) only with a licence that allows it, and name source and licence next
to it.
