---
name: lernapps-content-growth
description: Use when a learning app for lernapps.net grows after its first version - new competencies, chapters, pages, rounds or questions. One slice per competency (competency, content, exercise, the entry's topic, check, commit), the order to read the guidance in, and a brief for parallel sub-agents that keeps them off each other's files. For every archetype.
license: MIT
---

# Content growth

## Read first, in order

1. `.agents/skills/app-content/SKILL.md`: curriculum, competencies, patterns, figures, sources, procedure. Takes
   precedence. Not filled in → fill it from the app as it is, before adding anything (`app-content-guide`).
2. The archetype's skill.
3. skill `lernapps-content-research` (new competency), skill `lernapps-exercise-patterns` (no pattern fits).

## One slice per competency

1. Competency: into the guide, in its chapter, as "Ich kann …", with its Lehrplan unit where used.
2. Content: page or section (explainer), questions (quiz), in the guide's structure.
3. Exercise: a guide pattern, varied; or a new pattern → into the guide with example and data file, same slice.
4. Entry topic: the page or section path into the plan's entry draft (`entry-links-resolve`). Listed app: catalog
   pull request after publishing (skill `lernapps-listing`).
5. Check: `npx lernapps check` passes.
6. Commit: one per slice, guide changes included.

- New chapter or round = slices in the guide's procedure order.
- Procedure no longer fits → fix it in that slice (`app-content-matches`).

## Parallel sub-agents

- No two agents change the same file.
- Yours only: content guide, plan, shared files (explainer `src/app.yaml`, each `chapter.yaml`, `src/data/`; quiz
  `src/quiz.json`).
- Theirs: one chapter each (pages, own data file); quiz: question drafts of one round.
- Each in its own git worktree, branch, browser port. You merge one by one, add shared parts, run the check.
- Brief to send, brackets filled: [references/subagent-brief.md](references/subagent-brief.md).
