# Development Plan: tooling (fix/254-pre-push-scope branch)

*Generated on 2026-11-26 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
Issue #254: heavy e2e tests take minutes before a push. Do the cheap part (C: tests per path); propose the rest in the issue.
## Key Decisions
- Comment of 26.11 (plan-only push): already covered. `classifyPush` gives scope `none` for `.vibe/` only, in this repo's hook and in `lernapps check --pre-push` of apps (changes/changes.ts, src/cli.ts hookScope). Not changed.
- C implemented conservatively: `ONLY_TESTS` (src/screenshots.ts → screenshots.e2e) and a changed heavy test file runs itself; any other heavy path runs all. `LERNAPPS_HEAVY_TESTS` selects; it is a LERNAPPS_* variable, so the check cache key differs.
- A, B, D, E left as a proposal: they restructure the e2e tests and need timing under load.
- Autonomous session: phases pass without asking.

## Notes
*Additional context and observations*

## Reproduce
### Tasks
- [x] Read scripts/pre-push.ts, vite.config.ts, changes/changes.ts; checked the selection with `vp test list`.

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
