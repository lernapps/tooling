# Sub-agent brief

Fill the brackets; send the whole brief.

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
