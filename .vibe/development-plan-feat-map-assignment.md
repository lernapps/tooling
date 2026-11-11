# Development Plan: tooling (feat/map-assignment branch)

*Generated on 2026-11-11 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Ein Skill, der methodisch erklärt, wie ein Agent aus der Lernlandkarte eines Fachs einen sinnvollen **Auftrag für
eine App** ableitet, für eine Lehrkraft: welcher Strang (oder welche Einheit), welche Klasse, welche Bausteine in der
Reihenfolge der Kette, welche Voraussetzungen als Wiederholung, und warum gerade diese Lücke. Owner, 2026-11-11.
Der Skill liegt in lernapps/tooling (Owner).

## Key Decisions
### KD-01: Ergebnis ist ein Auftrag, kein fertiger Erklärer (Owner, 2026-11-11)
Der Skill führt bis zum Auftrag. Das Bauen danach folgt den vorhandenen Skills (content-research, explainer …).

### KD-02: Ort lernapps/tooling (Owner, 2026-11-11)
Dort liegen die Skills, die die Agenten der Lehrkräfte mit der Vorlage bekommen. Die Karte kommt aus lernapps/apps
(`/apps/map/<fach>.json`).

## Notes
- Einordnung (pdt, lernapps/docs): Service `s-gap-finding` „Seeing which app is still missing“ (D6, x-phase
  explore) und Annahme `a-gaps-guide-creators` (D8, MVP first draft): „Creators build an app for a gap they see on the
  map“. Der Skill macht diesen Service für den Agenten nutzbar; Plattform-Design bleibt unverändert.
- Architektur (arc42 dieses Repos, Kap. 5): Skills sind Bausteine unter `bb-skills-explore`; ein neuer Skill braucht
  einen Eintrag dort, einen Export in `package.json` und ggf. eine Erwartung in `test/evals.test.ts`.
- Vorhanden: `lernapps-content-research` Abschnitt 2 „The learning map“ (Strang empfehlen, Ids übernehmen,
  Voraussetzungen als Wiederholung, fehlende Bausteine an apps vorschlagen). Es fehlt: **welche Lücke** zuerst, wie
  groß, in welcher Reihenfolge.
- Die Karten-JSON trägt `requires`, `gradeBand`, `practisedBy`, aber nicht Klasse/Schritt (Vertrag Abschnitt 5). Der
  Skill muss die Regel „Ort = Richtstufe + Schritt in ihr“ (lernapps/apps#235, KD-17) selbst anwenden oder die JSON
  bekommt sie (Änderung in apps).
- Im apps-Repo: Die Seiten eines Bausteins und Strangs verlinken „Baue eine App“ auf `/build/` ohne Auftrag.

## Explore
### Entrance Criteria
- Auftrag des Owners liegt vor.

### Tasks
- [ ] Owner: Name, Zuschnitt und offene Fragen (siehe Abschluss Explore)

### Completed
- [x] Branch `feat/map-assignment` von main (cd063c4)
- [x] Einordnung mit pdt: `s-gap-finding`, `a-gaps-guide-creators`
- [x] Vorhandene Skills und Registrierung gesichtet (package.json exports, arc42 Kap. 5, evals)

## Plan
### Entrance Criteria
- Name, Zuschnitt und Abgrenzung zu `lernapps-content-research` sind mit dem Owner geklärt.

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Code
### Entrance Criteria
- Gliederung des Skills und Änderungen an Registrierung/Doku sind geplant und bestätigt.

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Commit
### Entrance Criteria
- Skill geschrieben, registriert, Checks und Tests grün.

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
