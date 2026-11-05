# Development Plan: tooling (fix/github-skill-orphan-push branch)

*Generated on 2026-11-05 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
Fix lernapps-github skill section 1 steps 4-6 (#257 item 7): `git switch --orphan` empties the worktree, so the app's pre-push hook finds no package. Reproduce in a temp app, fix, adjust test/guidance.test.ts, PR to main. Autonomous.
## Key Decisions
*Important decisions will be documented here as they are made*

## Notes
*Additional context and observations*

## Reproduce
### Tasks
- [x] Temp app via lernapps init/create, bare origin; show orphan push fails, commit-tree push works

### Completed
- [x] Created development plan file

## Analyze
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Fix
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Verify
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Finalize
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*

## Result
- Reproduced: `git switch --orphan gh-pages` + push fails in pre-push hook (vp pack / vp test fail, no package). `main` orphan push passed (hook: nothing to check).
- New way (`git commit-tree <empty tree>` pushed from `work`) ran full checks, passed; rebase `--root --onto origin/main` works.
- Skill, test/guidance.test.ts changed; docs/arc42 has no mention.
