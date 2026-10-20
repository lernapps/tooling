---
name: lernapps-content-growth
description: Use in Plan of an increment that adds several competencies, chapters, pages, rounds or questions to a published lernapps.net app. How to cut the work into slices, one per competency, and which slices sub-agents can write in parallel without touching each other's files. For every archetype.
license: MIT
---

# Content growth

## One slice per competency

Each slice is one Code task and ends in one commit:

1. Competency: into the content guide, in its chapter, as "Ich kann …", with its Lehrplan unit where used.
2. Content: a page or section (explainer), questions (quiz), in the guide's structure.
3. Exercise: a pattern of the guide, varied. A new pattern goes into the guide in the same slice, with example and
   data file.
4. Entry topic: the page or section path into the plan's entry draft (`entry-links-resolve`).
5. Check: `npx lernapps check` passes.
6. Commit, guide changes included.

- A new chapter or round: its slices in the order of the guide's procedure.
- The procedure no longer fits → its fix is part of the slice that shows it (`app-content-matches`).

## Parallel slices

- No two agents change the same file.
- Yours alone: the content guide, the plan, the shared files (explainer `src/app.yaml`, each `chapter.yaml`,
  `src/data/`; quiz `src/quiz.json`).
- A sub-agent's: one chapter (its pages, its own data file); in a quiz, the question drafts of one round.
- Each sub-agent works in its own git worktree, branch and browser port. You merge one by one, add the shared parts
  and run the check.
- In Code, each sub-agent gets the brief `@lernapps/tooling/guidance/subagent-brief.md`, filled in. Write in Plan
  which slices go to sub-agents.
