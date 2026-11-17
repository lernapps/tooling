# Development Plan: tooling (feat/recap-several branch)

*Generated on 2026-11-17 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Eine Recap-Seite eines Explainers (Format 2) darf mehrere Bausteine wiederholen: `recap: [physik/x, physik/y]`
neben `recap: physik/x` (eine Sammel-Wiederholung „Das brauchst du hier“ am Anfang eines Kapitels). tooling liest
beides, prüft jeden Baustein und warnt, wenn der Text der Seite einen wiederholten Baustein nicht nennt. Die Skills
leiten zur Sammel-Wiederholung an. Teil 2 des Features; der Plan führt in lernapps/app-templates
(`.vibe/development-plan-feat-recap-several.md`, KD-01 bis KD-05), dort gemergt als 0.9.0 (#166).

## Key Decisions
- KD-01 (lead plan): `recap` ist ein Baustein oder eine Liste. `ExplainerPage.recap` ist hier immer eine Liste.
- KD-03 (lead plan): `lernapps-pages.json` bleibt Format 1; tooling liest die Seitenliste nicht, nur `src/`.
- KD-04 (lead plan): neue Prüfung `recap-names-competencies` (Warnung), eigene Regel neben `competencies-on-map`:
  `name.de` oder `iCan` jedes wiederholten Bausteins steht im YAML der Seite (ohne Groß-/Kleinschreibung,
  Zeilenumbrüche gleich Leerzeichen, ohne Schlusspunkt). Karte nicht ladbar oder Baustein nicht auf der Karte:
  kein Befund hier, `competencies-on-map` meldet es. Prüft auch bei `strand: none`, denn sie lädt die Karte des
  wiederholten Bausteins.
- Eigene Regel statt Teil von `competencies-on-map`: anderer Gegenstand (Text der Seite, nicht die Ids), eigene
  Begründung im Regelkatalog.

## Notes
- Fundstellen: `check/explainer-map.ts`, `check/rules/competencies-on-map.ts`, `check/rules/prerequisites-in-order.ts`,
  Tests `test/explainer-map.test.ts` (Kartenfixture `test/fixtures/map/mathematik.json` bekommt `name` für zwei
  Bausteine), Skills `lernapps-explainer` (structure, rules), `lernapps-explainer-design` (SKILL, rules),
  `lernapps-map-assignment`, `lernapps-listing`, Review `review/archetypes/explainer.md`.
- Andere Repos pinnen tooling per Commit (apps: `@lernapps/tooling` in package.json).

## Explore
### Tasks

### Completed
- [x] Created development plan file
- [x] Fundstellen gesucht, Kartenformat (`name`, `iCan` als Text oder je Sprache) geprüft

## Plan
### Tasks

### Completed
- [x] Lesen als Liste, Regeln je Baustein, neue Regel, Tests, Skills, app-templates 0.9.0

## Code
### Tasks
- [ ] PR, grüne Prüfungen, squash, merge

### Completed
- [x] `explainer-map.ts`: `recap` als Liste; Typ `MapCompetency` mit `name`, `iCan`; `germanOf`
- [x] `competencies-on-map`, `prerequisites-in-order`: jeder Baustein der Liste
- [x] neue Regel `recap-names-competencies` mit Eintrag im Regelkatalog (skill `lernapps-explainer`, rules.md)
- [x] Tests; Skills und Review zur Sammel-Wiederholung
- [x] `@lernapps/app-templates` 0.9.0

## Commit
### Tasks

### Completed



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
