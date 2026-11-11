# Development Plan: tooling (feat/page-ahead branch)

*Generated on 2026-11-11 by Vibe Feature MCP*
*Workflow: [minor](https://codemcp.github.io/workflows/workflows/minor)*

## Goal
`lernapps check` (`prerequisites-in-order`) lässt eine Seite bewusst vor einer Voraussetzung stehen, wenn sie diese in
`ahead` nennt und die App sie auf einer anderen Seite übt (Owner, 2026-11-11). Gegenstück zu lernapps/apps#261
(Katalog) und lernapps/app-templates#150 (Schema, Seitenliste).

## Key Decisions
- In `ahead` genannt und auf irgendeiner Seite geübt (früher oder später): kein Befund. Nicht geübt: Befund `ahead`.
- Wiederholungsseite oder Link zählen für `ahead` nicht: Der Owner verlangt, dass die App den Baustein übt.
- Schwere wie die übrigen Befunde der Regel (nach `explainerFocus`).
- Einordnung: keine Änderung an Plattform-Design oder Architektur; eine Ausnahme in einer bestehenden Regel.

## Explore
### Completed
- [x] Regel und Leser: check/rules/prerequisites-in-order.ts, check/explainer-map.ts

## Implement
### Completed
- [x] Leser liest `ahead`; Regel mit Befund `ahead`
- [x] Test in test/explainer-map.test.ts; alle 588 Tests grün
- [x] Doku: lernapps-explainer-design (Regel), lernapps-explainer/references/structure.md

## Finalize
### Tasks
- [ ] PR; Merge nach app-templates#150
