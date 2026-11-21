# Development Plan: tooling (claude/bump-app-templates-0.11.0 branch)

*Generated on 2026-11-21 by Vibe Feature MCP*
*Workflow: [minor](https://codemcp.github.io/workflows/workflows/minor)*

## Goal
`@lernapps/app-templates` von 0.10.1 auf 0.11.0 heben. 0.11.0 bringt: „Aufgabe“ statt „Übung“, optionale Links als „i“ neben der Rückmeldung, Lücken in der Textzeile (lernapps/app-templates#175, veröffentlicht mit #177).

## Key Decisions
- Eigener PR: lernapps/tooling#320 (Audio-Skill) war schon gemergt.
- Lockfile von Hand nur im Eintrag von app-templates geändert (Version, `resolved`, `integrity`). Das lokale npm schreibt die Lockfile sonst in einem anderen Format um. Die Abhängigkeiten von 0.11.0 und 0.10.1 sind gleich; `npm ci` läuft durch.
- Der Nutzer hat Bump und Squash-Merge ausdrücklich beauftragt.

## Notes
- Einzige Stelle mit der Version: `package.json` (dependencies).

## Explore
### Tasks
### Completed
- [x] Created development plan file
- [x] Version und Lockfile aktualisiert

## Implement
### Tasks

### Completed
*None yet*

## Finalize
### Tasks

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
