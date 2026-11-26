# Development Plan: tooling (fix/332-plan-skip-plan-file branch)

*Generated on 2026-11-26 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
Issue #332: `plan skip` prefixes the task with `(skipped: <reason>)`; the commit rule `plan-file` must accept that and any reason. Second point: a checkpoint `list` of an increment plan for an already listed app cannot be ticked.
## Key Decisions
- Fix 1: compare a task with `(skipped: …)` by its end (`endsWith(" "+task)`), not by stripping the note with a regex; works for any reason.
- Plain reasons already pass (not reproduced). Second point: since #315 the increment template names the unchanged-entry case, but the checkpoint cannot be ticked without the creator's words. Split: a skippable task opens the listing PR; the checkpoint only reports the result.
- Session is delegated and autonomous: phase boundaries pass without asking.

## Notes
*Additional context and observations*

## Reproduce
### Tasks
- [x] Reproduce with a throwaway test: a reason with `)` makes `changedTasks` report the first task as reworded; a plain reason does not (not reproduced; `vp fmt` leaves the line alone).
- [x] Read the checkpoint code: `planDone` refuses `skip` at any checkpoint.

### Completed
- [x] Created development plan file

## Analyze
### Tasks
- [ ] Cause: `stable()` in src/plan.ts strips `^\(skipped: [^)]*\) `, so a `)` in the reason leaves a rest and the text differs. Look at the `list` checkpoint in guidance/plan-*.md

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
