# Development Plan: tooling (fix/333-explainer-links-migration branch)

*Generated on 2026-11-26 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
Issue #333: (1) no migration for question links to the learning map; (2) `update` says "unchanged"; (3) `vp staged` fails after the skill links.
## Key Decisions
- (1) Codemod `removeMapLinks` in `lernapps update`, text-based (the YAML library reformats files, checked): drops map links of block-style `links` lists, keeps a question whose only link is one to the map and names file:line. The rule itself lives in the runtime, not in this repo; the installed runtime 0.20.0 does not reject map links (could not confirm), the codemod acts on the URL only.
- (2) Not changed: run as the app's own tooling `update` knows only its own versions and already prints the hint to run `npx --yes @lernapps/tooling@latest update`; #163 and #215 are about git pins.
- (3) Reproduced with lint-staged: `git stash create` fails with "beyond a symbolic link" when a commit deletes files below a folder that is a link. The pre-commit hook now runs `vp staged --no-stash` in exactly that case.
- Autonomous session: phases pass without asking.

## Notes
*Additional context and observations*

## Reproduce
### Tasks
- [x] Reproduced (3) with a throwaway repository and `vp staged`.
- [x] (1) and (2) read in code.

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
