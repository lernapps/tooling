# Development Plan: tooling (claude/bump-app-templates branch)

*Generated on 2026-11-22 by Vibe Feature MCP*
*Workflow: [minor](https://codemcp.github.io/workflows/workflows/minor)*

## Goal
`@lernapps/app-templates` von 0.11.0 auf die aktuelle Version heben, die den Vokabel-Block (`type: vocabulary`,
lernapps/app-templates#181) enthält.

## Key Decisions
- Der Nutzer hat Merge von lernapps/app-templates#181 und den Bump ausdrücklich beauftragt und arbeitet autonom bis zum PR.
- Wie beim Bump auf 0.11.0: Lockfile von Hand nur im Eintrag von app-templates ändern (Version, `resolved`, `integrity`),
  damit das lokale npm die Lockfile nicht in einem anderen Format umschreibt.

## Notes
- Einzige Stelle mit der Version: `package.json` (dependencies).
- 0.12.0 bis 0.14.0 bringen: eigene Antwort beim Vergleich einer offenen Aufgabe (#179), Feedback-Modus für Lehrkräfte
  und Eltern (#180), Vokabel-Block (#181).
- Der Workflows-Server ist in dieser Session nicht mehr erreichbar (mehrere Repositories); der Plan wird von Hand geführt.
- Entrance criteria:
  - Implement: neue Version auf npm veröffentlicht, Stellen der Version bekannt.
  - Finalize: Version und Lockfile gehoben, `npm ci` und Tests laufen.

## Explore
### Tasks

### Completed
- [x] Created development plan file
- [x] 0.14.0 veröffentlicht (Tag v0.14.0 = Merge-Commit 26bc73a von #181)
- [x] Abhängigkeiten von 0.14.0 gleich wie bei 0.11.0

## Implement
### Tasks

### Completed
- [x] `package.json` und `package-lock.json` auf 0.14.0; `npm ci` läuft durch

## Finalize
### Tasks

### Completed
- [x] `npm run lernapps -- check` grün (4 Regeln, keine Befunde) und Pre-Push-Hook grün
- [x] PR angelegt: lernapps/tooling#322



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
