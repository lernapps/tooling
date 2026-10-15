---
name: lernapps-content-growth
description: Use when a learning app for lernapps.net grows after its first version - new competencies, chapters, pages, rounds or questions. One slice per competency (competency, content, exercise, the entry's topic, check, commit), the order to read the guidance in, and a brief for parallel sub-agents that keeps them off each other's files. For every archetype.
license: MIT
---

# Growing an app

After its first version an app grows by competencies: one at a time, each in a slice that ends green and committed.
The rules of `lernapps-app` apply.

## First, read in this order

1. The app's content guide, `.agents/skills/app-content/SKILL.md`: its curriculum, competencies, patterns, figures,
   sources and its procedure for a new chapter or round. Follow it; it takes precedence over the generic skills.
2. The skill of the archetype, for how content is written there.
3. The skill `lernapps-content-research` for a competency the guide does not have yet, and the skill
   `lernapps-exercise-patterns` for an exercise no pattern of the guide fits.

If the guide is not filled in, fill it in from the app as it is before you add anything (`app-content-guide`).

## One slice per competency

Each slice is one competency, end to end, then the next:

1. **Competency:** add it to the guide's competencies, in its chapter, as "Ich kann …", with the Lehrplan unit it
   comes from where you used one (research it as `lernapps-content-research` says).
2. **Content:** the page or section that teaches it (explainer), or its questions (quiz), in the content structure
   the guide describes.
3. **Exercise:** from a pattern of the guide, varied for this competency; or a new pattern, which you write into the
   guide with its example and data file in this same slice.
4. **The entry's topic:** add the competency's page or section to the topics of the entry draft in the plan, by its
   path (`entry-links-resolve`). For a listed app the catalog entry changes by a pull request to the catalog, as the
   skill `lernapps-listing` says, once the app with the new content is published.
5. **Check:** `npx lernapps check` passes. Fix what fails from its message.
6. **Commit:** one commit per slice, with the guide's changes in it.

A new chapter or round is a series of slices, in the order the guide's procedure names. When the procedure no longer
fits the app, correct it in the slice that shows it (`app-content-matches`).

## Parallel sub-agents

Sub-agents do not see your conversation. Split the work so that no two agents change the same file, and keep the
shared files with yourself:
- **Yours only:** the content guide, the plan with the entry draft, and the files every slice touches: an explainer's
  `src/app.yaml` and each `chapter.yaml` (the order lists), the shared data files in `src/data/`; a quiz's question
  bank `src/quiz.json`, which is one file.
- **Theirs:** one chapter each (its pages, its own data file), or, for a quiz, the drafts of the questions of one
  round, which you put into the bank.
- Each agent works in its own git worktree on its own branch, and runs its browser and server on its own port. You
  merge the branches one after another, add the shared parts and run the check.

Fill the brackets and send the whole brief:

```
Add the chapter/round "<title>" to the lernapps app in <repo>, on the branch <branch>, in your own git worktree.

Read first, in this order: .agents/skills/app-content/SKILL.md (it takes precedence), then the skills
lernapps-app and lernapps-<archetype>, and lernapps-exercise-patterns if no pattern fits.

Competencies, one slice each, in this order:
1. "Ich kann …" (Lehrplan: <document, page, unit> | none)
   - Content: <page or questions, with ids>
   - Exercise: pattern "<name from the guide>", varied as <…> | new pattern: <what it practises>
   - Second source: <address and exact title, verified> | none
2. …

Change only: <the files of this chapter or round>. Do not change: the content guide, the plan, <the shared files>.
Write what the shared files need into your report instead.

Per slice: content, exercise, `npx lernapps check` green, one commit. Never bypass a hook.

Report: branch, commits, per competency the ids of its page or questions and exercises, the patterns used or
proposed for the guide, what the shared files need, what you could not verify.
```
