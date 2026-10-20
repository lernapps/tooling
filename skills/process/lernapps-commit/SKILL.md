---
name: lernapps-commit
description: Use in Commit, when you bring the branch of the first version or an increment into main - the history of main stays linear (one squash commit per piece of work, never a merge commit) and every message is a conventional commit with the sections Intent, Key changes, Dependencies and side effects.
license: MIT
---

# Commits of a lernapps app

## Linear history

Bring a branch into `main` by squash: squash-merge its pull request, or `git switch main`, `git merge --squash <branch>`,
`git commit`. One piece of work is one commit on `main`; never a merge commit. The commit message of the squash
describes the whole piece of work, not the last step. When you merge yourself, you squash and write it.

## Content from the plan

Do not invent the message: take it from the current plan (`.vibe/plans/<NN>-<short name>.md`). Intent comes from
"Goal", Key changes from "Key decisions" and the content method, Dependencies and side effects from "Notes". Write it
in the creator's terms, short.

## Message

A conventional commit: `type(scope): summary` (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`), imperative, under 72
characters. Then this body, in the language of the repo's history. Say why and what behaves differently; never list
files.

```markdown
## Intent

What problem does it solve? What was the motivation to introduce this change?

## Key changes

The conceptual overview: how does the system behave differently now?

## Dependencies and side effects

Only if applicable: effects on other parts of the system.
```
