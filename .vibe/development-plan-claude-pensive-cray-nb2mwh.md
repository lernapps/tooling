# Development Plan: Skill-Referenzen für Fremdsprachen (claude/pensive-cray-nb2mwh branch)

*Begonnen am 2026-11-08, Workflow [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Creator und ihre Assistenten erfahren, wie sie Explainer-Inhalte für Fremdsprachen schreiben: Grundsätze, Muster je
Art von Baustein, Aufbau einer Seite, Prüfen, und die Notation der Sprachaufgabe `language-task`. Teil des Features
„Fremdsprachen im Explainer“; Plan und Entscheidungen: lernapps/app-templates,
`.vibe/development-plan-claude-pensive-cray-nb2mwh.md` (Skizze „Content-Skill für Fremdsprachen“, KD-01 bis KD-14);
Grundwortschatz: lernapps/apps, gleicher Branch.

## Key Decisions

- KD-01 (Owner, 2026-11-08): Kein eigener Skill, sondern je eine Referenz in den vorhandenen Skills:
  `lernapps-exercise-patterns/references/foreign-languages.md` und `lernapps-explainer/references/language-tasks.md`.
- KD-02 (Owner, 2026-11-08): Grundsätze: Einheiten bauen auf dem Alltag von Kindern auf; Wörter nicht zu früh zu
  komplex; kein Lehrwerk vorausgesetzt; Wörter nach GER-Stufe (A1, A2) aus dem Grundwortschatz, ohne Richtstufe;
  Bedeutungen gibt die Seite, die den Baustein übt.

## Notes

- Die Referenzen setzen die Version von @lernapps/app-templates mit `language-task` voraus (noch nicht
  veröffentlicht); der Link auf den Grundwortschatz der Karte wird erst mit dem Pull Request in lernapps/apps gültig.
- `test/guidance.test.ts` prüft: jede Datei eines Skills von SKILL.md verlinkt und in package.json exportiert.

## Explore

### Completed

- [x] Created development plan file
- [x] Aufbau der Skills gelesen (je Fach eine Referenz in `lernapps-exercise-patterns`)

## Plan

### Completed

- [x] Ort und Inhalt mit dem Owner abgestimmt (KD-01, KD-02)

## Code

### Tasks

- [x] app-templates 0.4.0 (mit `language-task` und dem Beispiel) veröffentlicht; Abhängigkeit in diesem PR auf 0.4.0
      gehoben (Owner, 2026-11-09); 46 Testdateien, 560 Tests grün
- [ ] Nach Veröffentlichung von apps#224: Link auf den Grundwortschatz prüfen

### Completed

- [x] `foreign-languages.md` und `language-tasks.md` geschrieben, in beiden SKILL.md verlinkt, in package.json
      exportiert
- [x] `test/guidance.test.ts` (122 Tests) und `vp check` grün

## Commit

### Completed

- [x] Aufräumen geprüft: keine Debug-Ausgaben, keine TODO/FIXME (die Ausgabe eines Skripts ist gewollt)
- [x] Doku aktuell (README, arc42, Vertrag bzw. Skills)
- [x] Pull Request angelegt (Owner, 2026-11-08); Zusammenfassen beim Merge mit „Squash and merge“ (Force-Push war in
      der Session nicht erlaubt)

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
