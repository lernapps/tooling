# Development Plan: tooling (fix/334-text-load-reading-text branch)

*Generated on 2026-11-26 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
Issue #334: (1) `explainer-text-load` counts the reading text; (2) skill lacks the `vocabulary` block; (3) note on `lernapps-audio` and `valley_cut`.
## Key Decisions
- (1) Confirmed: every `text` block counts. The schema has no field for a reading text, so a YAML comment `# reading-text` above a block or section marks it; counted as `readingWords`, own limit 600.
- (2) Mostly stale: `references/language-tasks.md` has a Vocabulary section (when, fields, example). Added the cover behaviour from the runtime schema.
- (3) Not confirmable: `regen_audio.py` and `valley_cut` are not in this repository.
- Autonomous session: phases pass without asking.

## Notes
*Additional context and observations*

## Reproduce
### Tasks
- [x] Read the rule, the metrics and the schema; counted with a test page.

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
