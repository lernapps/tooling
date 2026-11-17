# Development Plan: tooling (claude/focused-hawking-9sf3r1 branch)

*Generated on 2026-11-17 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Explainer, die Kinder ansprechen: weniger Textlast, weniger Wiederholung, mehr Interaktion, nicht nur statische Übungen.
Drei Teile:
1. **CLI-Checks** (lernapps/tooling, `check/rules/`), deterministisch aus dem YAML, zuerst `hint`:
   `explainer-text-load`, `explainer-repetition`, `explainer-interaction`, `explainer-exercise-variety`.
2. **Skills** (lernapps/tooling, `skills/archetypes/`): neuer Skill `lernapps-explainer-engagement` (Explore, vor dem
   Design), Regeln `rule`-Blöcke zu den vier Checks, `explainer-age-appropriate` konkretisiert, Brief des Lerner-Checks
   erweitert, `page-structures.md` mit variablen Seitenmustern.
3. **Runtime** (lernapps/app-templates, `runtime/shared/questions/engine.ts`): bei `single-choice` und
   `multiple-choice` zeigt "Prüfen" bei **richtiger** Antwort nicht mehr alle Options-`info`s, nur die `explanation`
   (und Links); bei **falscher** Antwort wie bisher alle. "Lösung zeigen" ohne Antwort: alle.

## Key Decisions
- Annahme: Checks starten als `hint` (nie `error`); Schwellen nach Klassenstufe aus `app.yaml`/Katalog, wenn bekannt,
  sonst Standard; erst an francais-1 und klima messen (Kalibrierung), dann festlegen. (guess)
- Metriken je Seite aus dem YAML: Wörter (text, definition, note, example, `info`, `explanation`, `mistakes`),
  Textanteil gegen Figuren/Tabellen/Übungen, längste Folge reiner Textblöcke, erste 2 Blöcke ohne Figur/Aufgabe,
  Anzahl und Arten der Übungstypen, Anteil `generated`/`language-task`/`speaking-task`/Komponenten/`ordering`/`matching`
  gegen `single-choice`/`true-false`, Wiederholung: Wortfolgen (>= 5 Wörter) und Formen, die auf einer Seite mehrfach
  vorkommen, insbesondere Text <-> `info` <-> `explanation` <-> `mistakes`.
- MC-Änderung betrifft auch das Quiz (gemeinsame Engine). Das ist gewollt. Ohne JavaScript bleibt die Lösung wie bisher.
- Reihenfolge: zuerst Runtime-Änderung (klein, klar), dann Messskript, dann Checks, dann Skills.

## Notes
- Quellen: tooling `check/rules/*.ts` (Typ `Check`, `readExplainer` in `check/explainer-map.ts`), Tests `test/*.test.ts`;
  Regeln mit Seite `https://lernapps.net/tooling/rules/#<id>` kommen aus `rule`-Blöcken in Skills (scope `tooling`).
- Runtime: `runtime/shared/questions/engine.ts` `reveal()` zeigt `.question-reveal` immer ganz; `render.ts`
  `optionInfo` rendert die Liste. e2e: `runtime/explainer/e2e.ts`, `runtime/quiz/e2e.ts`,
  `test/fixtures/question-page/e2e/question.e2e.ts`.
- `workflows`-MCP war nicht geladen; der Server wird mit dem Skript aus dem Gist über die Shell aufgerufen.
- Zwei Repos betroffen: Branch `claude/focused-hawking-9sf3r1` in tooling und app-templates; kein PR ohne Auftrag.

## Explore
### Tasks
- [x] Checks, Regelblöcke und Runtime-Stellen gelesen
- [ ] Schwellen an francais-1 und klima messen (Phase Plan/Code, Messskript)

### Completed
- [x] Created development plan file

## Plan
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Code
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Commit
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
