# Development Plan: tooling-286 (fix/plan-after-assignment-286 branch)

*Workflow: [minor](https://codemcp.github.io/workflows/workflows/minor)*

## Goal
Issue #286, Punkte 1–5: `init`/`skills` ersetzen von Hand kopierte `lernapps-*`-Skills; Archetyp-READMEs auch per URL;
weniger Interview-Runden nach einem bestätigten Auftrag; keine Lehrplan-Orientierung bei Inhalt aus der Lernlandkarte;
ein Auftrag, der vor Commit endet. Punkt 6 erledigt lernapps/app-templates#151.

## Key Decisions
- Punkt 1: Vor dem Sync löscht `init`/`skills` Ordner `lernapps-*` in `.<agent>/skills/`, deren Name ein Skill der
  Pakete ist und die `skills-lock.json` nicht als Sync-Installation kennt; die Ausgabe nennt sie. Der Plan bleibt („kept“).
  Von `skills add` installierte Skills (Eintrag im Lock) bleiben unberührt.
- Punkt 2: README-URL über unpkg (`https://unpkg.com/@lernapps/app-templates/<archetype>/README.md`), die Datei liegt im Paket.
- Punkt 4: Lehrplan bleibt irrelevant, wenn der Inhalt aus der Lernlandkarte kommt (Entscheidung des Owners).
- Plan-Template bleibt kompakt und imperativ; höchstens 2 Fragen pro Nachricht.

## Explore
### Completed
- [x] Issue gelesen, Code von `init`/`skills` und `skills experimental_sync` (Grund für „not installed by sync“) gelesen

## Implement
### Completed
- [x] Punkt 1: `removeHandCopies`/`packageSkills` in generator/init.ts, Ausgabe nennt ersetzte Skills; Tests in
  test/init.test.ts und test/init.e2e.test.ts (Plan „kept“, Skill ersetzt); arc42 05 ergänzt
- [x] Punkt 2: unpkg-URLs in skills/process/lernapps-app/SKILL.md (geprüft: HTTP 200)
- [x] Punkte 3–5: guidance/plan-template.md (Interview-Themen, die Auftrag/Archetyp abdecken; kein Lehrplan bei
  Inhalt aus der Karte; Stopp vor Commit bei Probelauf)

## Finalize
### Completed
- [x] vitest (init, init.e2e, guidance, cli, conventions, rules, evals) grün; `vp check` auf geänderten Dateien grün
