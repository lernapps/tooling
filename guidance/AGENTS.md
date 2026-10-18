# AGENTS.md

Learning app for lernapps.net: static, browser only, collects nothing, accessible. Built with its creator.

## Plan

- One plan per piece of work: `.vibe/plans/<NN>-<short name>.md`; highest number = current.
- None, or current one done (Commit completed): start the next from a template, complete and unchanged:
  - source: `node_modules/@lernapps/tooling/guidance/`; before the app exists:
    <https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/guidance/>
  - `plan-template.md`: first version; `increment-template.md`: every later change.
- Read the plan before each step. Do its tasks in order. Tick each box when done.
- Read skills and guides from the file, in full (curl, cat). Never a summarising fetch tool.

## Always

- Load skill `lernapps-app` first.
- No `lernapps create` and no code before the creator confirmed the plan.
- Never `--no-verify`. Never edit `prePushFailures`.
- Push only the branch the current plan names. Push to `main` = publish.
- A check fails: fix it or tell the creator; never push past it.
- Default branch: `main` (the plan sets it up).

## Creator

- At most 2 questions per message. Count the `?`. No questions inside drafts or lists.
- Plain words, no forms.
- Checkpoint: stop, ask, wait for the answer. An earlier message is no yes.
- Before Code: explain the method in plain words (research, exercises, figures, components, limits).

## Content

- App's own skills (`app-content`, `app-*`) take precedence.
- Never edit `lernapps-*` skills (`lernapps update` replaces them). App rules go into the app's skills.
- Explore: `.agents/skills/app-content/SKILL.md` filled in → load it first; else load skill
  `lernapps-content-research`.
- After the plan is confirmed, before content: replace every placeholder in `app-content`. None may remain.
- Content decision changes → update `app-content` in the same commit.

## Language

- Learners, teachers, parents: German, plain language.
- Creator: their language.
