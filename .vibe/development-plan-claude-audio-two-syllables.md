# Development Plan: tooling (claude/audio-two-syllables branch)

*Generated on 2026-11-21 by Vibe Feature MCP*
*Workflow: [minor](https://codemcp.github.io/workflows/workflows/minor)*

## Goal
Der Skill `lernapps-audio` sagt unter „Writing the text“: Namen generell und das letzte Wort eines kurzen Satzes nach Möglichkeit zweisilbig, damit die Stimme am Ende keinen falschen Laut bildet.

## Key Decisions
- Nur eine Zeile in `skills/content/lernapps-audio/SKILL.md`; kein Test prüft den Wortlaut des Skills.
- Kein einsilbiger Name als schlechtes Beispiel: „Paul“ hat im Beispiel Französisch funktioniert. Die Regel ist eine Empfehlung („wherever you can“), kein Verbot.
- Der Nutzer hat für diese Änderung bis zum PR freigegeben (aus der Sitzung zu lernapps/app-templates#175).

## Notes
- Gefunden: Der Skill liegt nur hier; die Referenzen der Archetypen (`language-tasks.md`, `foreign-languages.md`) sagen nichts zur Aussprache von Namen.

## Explore
### Tasks
### Completed
- [x] Created development plan file
- [x] Stelle im Skill gefunden

## Implement
### Tasks

### Completed
- [x] Punkt „Two syllables where a file ends“ unter „Writing the text“ ergänzt

## Finalize
### Tasks

### Completed
- [x] Commit mit Plan, PR



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
