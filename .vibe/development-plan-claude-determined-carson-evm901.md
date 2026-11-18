# Development Plan: tooling (claude/determined-carson-evm901 branch)

*Generated on 2026-11-18 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Die Anleitung, die ein Agent beim Erstellen eines Explainers liest, effizienter machen: weniger Text, ein Ort je Regel, keine Widersprüche, genauere Verweise. Die Wirkung (Qualität der Apps) bleibt mindestens gleich.

## Key Decisions
- Workflow epcc, Branch `claude/determined-carson-evm901` (von der Sitzung vorgegeben).
- Entscheidungen des Owners aus der Planungssitzung (`session_016NmpwZmab2sBK7nUXFhokD`) gelten weiter: kein neuer Skill; berührte Skill-Dateien wachsen nicht (Grenze 12.049 Wörter); Messbares als `hint`-Prüfung statt Prosa; Sprachdidaktik in `foreign-languages.md`; Geschichte in `lernapps-map-assignment`; Tabelle in `AGENTS.md` erzeugt.
- Offen (Owner fragen): Umfang (nur die drei Explainer-Skills oder der ganze Lesepfad), Umbau oder nur Straffen, Nachweis durch neuen manuellen Eval.

## Notes
### Quellen
- Drei Eval-Läufe, alle Sonnet 5.5, je von einem Subagenten ausgewertet (Zitate nicht einzeln nachgeprüft): Französisch 1 (`…ZTPD1paFZnQeMarm2`), Französisch 2 (`…bKCtYGqUSwXGQZmfa`), Stochastik (`…dXT9NePwQQPmHJpAM`).
- Eigene Lektüre: `guidance/AGENTS.md`, `plan-template.md`, `lernapps-app`, die drei Explainer-Skills mit `rules.md`, `structure.md`, `blocks.md`, `exercises.md`, `runtime.md`, README des Explainers.
- Die Läufe liefen auf dem Branch vor #311; einzelne Befunde (Grundwortschatz) sind dort schon behoben.

### Messung
- Anleitung gesamt rund 35.000 Wörter. Ein Lauf liest 148.000 bis 175.000 Zeichen (37.000–45.000 Tokens) in 19–25 Dateien, jede einmal. Davon die drei Explainer-Skills mit Referenzen rund 74.000 Zeichen (etwa 45 %).
- Anteil am Endkontext rund 11 %, aber in jedem Schritt aus dem Cache neu gelesen (39–68 Mio. Cache-Tokens je Lauf; Kosten 7–24 USD).
- Lesen: 10–28 % der Aufrufe. Prüf- und Korrekturschleifen: 13–28 %. Stochastik: 21 von 50 `lernapps check` rot, 17 davon Notation (YAML-Anführung, Formelbefehle, `generated`, Textmenge, Barrierefreiheit).

### Befunde
1. Widersprüche
   - `info`: `exercises.md` und `lernapps-content-questions` „keins für die richtige Option"; `question-types.md` „each"; Schema `question.v1.schema.json` verlangt es (selbst geprüft). Zwei Läufe scheiterten daran am Build.
   - Lehrplan: Plan-Vorlage und `lernapps-map-assignment` „keine Suche bei Strang/Auftrag"; `lernapps-content-research` beginnt mit „## 1. Lehrplan", Interview-Thema „none → KMK". Zwei Läufe suchten trotzdem (84-Seiten-PDF; 12 Aufrufe).
   - Datendatei: Design-Skill „Shared material → a data file"; `blocks.md`: nur `timeline` und `generated` lesen sie.
   - Im Harness falsch oder unsicher: „Your tools cannot show an image"; Sub-Agent „in the foreground"; „the app commits them" führt mit `git add -A` zu eingechecktem `node_modules` (zwei Läufe).
2. Wiederholung
   - `recap` in 12 Dateien, `explainerFocus` in 8, `requires`-Reihenfolge in 11; `prerequisites-in-order` dreimal im Design-Skill; Wiederholungsseite zweimal in `structure.md` und erneut im Design-Skill.
   - `early-preview`: AGENTS-Tabelle, zwei Plan-Aufgaben, `subagent-brief.md`. „Übungen auf jeder Seite": README, Design-Skill, `rules.md`, `exercises.md`.
   - Plan-Vorlage paraphrasiert Skills (Strang/Einheit, eine Seite je Kompetenz, Engagement).
3. Zur falschen Zeit oder ohne Nutzen gelesen
   - Eintragsschema (10.000 Zeichen) in Explore für einen Entwurf von 20 Zeilen.
   - `lernapps-cli` (7.800): genutzt nur `create`, `check`, `screenshots`.
   - `runtime.md`, `rules.md` des Explainers (12.000): beschreiben, was Build und Prüfung ohnehin melden; meist gar nicht oder nur per `grep`/`head` gelesen.
   - `lernapps-content-questions` und `rules.md` kamen in zwei Läufen erst nach Seite 1.
4. Regeln ohne Prüfung und ohne Plan-Aufgabe werden übersehen (Grundwortschatz, gezeichnete Figuren, Rückverweise zwischen Seiten); Regeln mit Prüfung werden befolgt.
5. Ungenaue Verweise: „`lernapps-<archetype>`", „as `references/structure.md` says"; Agent riet Dateinamen. „Read in full" und „move to Completed" wurden ohne Folgen ignoriert.
6. Die 13.000 Zeichen direkt vor Seite 1 enthalten die Notationsregeln, die danach am häufigsten gebrochen wurden: sie gehen in der Menge unter.

### Richtung (Vorschlag, in Plan auszuarbeiten)
- Ein Ort je Thema; andere Stellen verweisen mit einem Halbsatz. Für Felder ist das Schema die Wahrheit.
- `lernapps-explainer/SKILL.md` als Schreibseite: Seitengerüst und die häufigsten Notationsfehler zuerst; Referenzen zum Nachschlagen, ausgelöst durch die Meldung der Prüfung.
- Aus den Referenzen streichen, was Laufzeit, Tutor und Tests tun, soweit es das Schreiben nicht ändert.
- Plan-Vorlage: nennt je Aufgabe die genauen Dateien, wiederholt keinen Skill-Inhalt.
- Nachweis: Zeichen je Lesepfad vorher/nachher, danach ein manueller Eval.

## Explore
### Tasks
- [ ] Owner: Umfang, Umbau oder Straffen, Nachweis klären

### Completed
- [x] Created development plan file
- [x] Die drei Eval-Sitzungen und die Planungssitzung ausgewertet
- [x] Explainer-Skills, Plan-Vorlage und Referenzen gelesen und gemessen
- [x] Gemeldete Widersprüche am aktuellen Stand geprüft (`info`, Lehrplan, Grundwortschatz)

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
