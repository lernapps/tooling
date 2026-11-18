# Development Plan: tooling (claude/determined-carson-evm901 branch)

*Generated on 2026-11-18 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Die Anleitung, die ein Agent beim Erstellen eines Explainers liest, effizienter machen: weniger Text, ein Ort je Regel, keine Widersprüche, genauere Verweise. Die Wirkung (Qualität der Apps) bleibt mindestens gleich.

## Key Decisions
- Workflow epcc, Branch `claude/determined-carson-evm901` (von der Sitzung vorgegeben).
- Entscheidungen des Owners aus der Planungssitzung (`session_016NmpwZmab2sBK7nUXFhokD`) gelten weiter: kein neuer Skill; berührte Skill-Dateien wachsen nicht (Grenze 12.049 Wörter); Messbares als `hint`-Prüfung statt Prosa; Sprachdidaktik in `foreign-languages.md`; Geschichte in `lernapps-map-assignment`; Tabelle in `AGENTS.md` erzeugt.
- Owner (18.11.): Umfang, Tiefe und Nachweis werden in der Plan-Phase festgelegt. Annahme, bis er widerspricht: ganzer Lesepfad, Umbau erlaubt, ein manueller Eval am Ende.
- D1 Ein Ort je Thema (Tabelle unter "Plan"). Andere Stellen verweisen mit einem Halbsatz und der Regel-Id.
- D2 `lernapps-explainer` folgt dem Moment des Schreibens: Gerüst und häufigste Fehler in `SKILL.md`, Referenzen zum Nachschlagen.
- D3 Regelabschnitte sagen, was zu tun ist. Wie die Prüfung arbeitet, sagt ihre Meldung, nicht der Skill.
- D4 Für Felder gilt das Schema (`dec-schema-explains-itself`); Skills nennen Felder nur, wo das Schema nichts über das gute Schreiben sagt.
- D5 Passt in die Architektur: `dec-one-skill-one-phase` ("A reference is linked with the moment to read it") und `dec-rules-in-artifacts`. Kein neuer Baustein. Neu: ein Budget für den Lesepfad als Test (`qg-checked-not-declared`).
- Offen (Owner): Eintragsschema erst in Commit lesen (O1); `info` der richtigen Option: Text ans Schema angleichen oder Schema lockern (O2).

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

### Completed
- [x] Created development plan file
- [x] Die drei Eval-Sitzungen und die Planungssitzung ausgewertet
- [x] Explainer-Skills, Plan-Vorlage und Referenzen gelesen und gemessen
- [x] Owner: Umfang, Tiefe, Nachweis in der Plan-Phase
- [x] Gemeldete Widersprüche am aktuellen Stand geprüft (`info`, Lehrplan, Grundwortschatz)

## Plan
### Ziel und Maß
- Lesepfad eines Strang-Explainers ohne Komponente und ohne Fremdsprache, heute rund 176.000 Zeichen:
  llms.txt 4,9 · AGENTS 4,3 · Plan 16,8 · app 3,5 · README 6,9 · patterns 4,5 + Fach 4,4 + 3 Referenzen 3,0 · map-assignment 7,8 · design 10,5 + rules 7,9 · research 6,1 + sources 0,8 · Eintragsschema 10,7 · explainer 3,6 + structure 6,8 + blocks 5,7 + exercises 7,0 + rules 12,1 + runtime 5,5 · cli 7,8 · questions 5,4 + 3,7 · brief 4,4 · self-assessment 5,8 · github 6,6 · commit 1,9 · listing 4,7.
- Ziel: höchstens 140.000 Zeichen (etwa −20 %; mit O1). Ehrlich: mehr geht nur, wenn Inhalte entfallen, die der Owner erst kürzlich wollte.
- Wichtiger als die Menge: beim ersten Schreiben richtig. Maß im Eval: rote `lernapps check` wegen Notation im Stochastik-Lauf von 17 auf höchstens 8; kein Build-Fehler aus einem Widerspruch.

### Ein Ort je Thema (D1)
| Thema | Ort | Nur noch Verweis in |
|---|---|---|
| Strang oder Einheit, Kompetenz je Seite, Reihenfolge, Wiederholungsseite, `ahead`: die Entscheidung | `lernapps-explainer-design/SKILL.md`, "Map the content", einmal | content-research, Plan-Vorlage, map-assignment, foreign-languages, listing, explainer-Gotchas |
| dasselbe: die Notation (YAML) | `lernapps-explainer/references/structure.md`, einmal | design, README |
| Regeln zur Landkarte (`prerequisites-in-order`, `one-competency-per-page`, `competencies-on-map`, `recap-names-competencies`, `content-matches-competencies`) | ein Abschnitt je Regel in `lernapps-explainer-design/references/rules.md` | `structure.md`, explainer `rules.md` |
| Felder der Fragetypen | Schema, `question-types.md` | `exercises.md` |
| Regeln für Komponenten (`vue-component-*`) | `components.md` (nur gelesen, wenn der Plan eine Komponente nennt) | explainer `rules.md` |
| Regeln für TypeScript, Speicher, Preset, Lockfile, Unterdrücken | `lernapps-cli/references/code-rules.md` (neu als Referenz, kein neuer Skill) | `lernapps-cli/SKILL.md` |
| `early-preview` | `workflow-rules.md`; der Auftrag in `subagent-brief.md` | Plan-Aufgaben nennen nur die Regel |
| Lehrplan | `lernapps-content-research`, nach der Landkarte, nur ohne Strang und ohne Auftrag | Plan-Vorlage, Interview-Thema |
| Was Laufzeit, Tutor, Tests tun | README (kann/kann nicht) | `runtime.md` behält nur, was das Schreiben ändert |

### Aufbau `lernapps-explainer/SKILL.md` (D2)
1. Was du schreibst (3 Zeilen), Schema-Zeile.
2. Eine Seite als Gerüst: ein kurzes, gültiges YAML mit Abschnitt, Text, Abbildung, einer Frage mit allen Pflichtfeldern, einer `generated`-Aufgabe.
3. "Vor der ersten Seite": die Fehler aus den Läufen, je eine Zeile: Text mit `: ` oder Komma in Anführung; nur Formelbefehle der Liste; jede Option mit den Pflichtfeldern des Schemas; `generated`: kein Fehler gleich der Antwort, Dezimalstellen; Grenzen von `explainer-text-load`; Tabelle bei 360 px; Formel in `matching`.
4. "Read when": je Zeile Auslöser und Datei; `rules.md` nur, wenn eine Meldung eine Regel nennt.

### Tasks
- [x] Lesepfad und Einschränkungen geklärt: Beschreibung beginnt mit "Use … in <Phase>"; Regelblöcke werden aus `skills/**/*.md` gelesen (`scripts/rules.ts`), Verschieben zwischen Dateien ist erlaubt; AGENTS.md höchstens 350 Wörter.
- [x] Einordnung in arc42 (D5)
- [ ] Owner: Plan bestätigen, O1 und O2 entscheiden

### Risiken
- Kürzen entfernt still eine Anweisung, die Fehler verhindert hat → Eval vergleicht; jede gestrichene Regel hat weiter ihren Abschnitt mit Id.
- Tests prüfen Wortlaute in Skills und Vorlagen → vor jedem Schritt `grep` in `test/`, Tests nach jedem Schritt.
- Vorlagen sind für alle Archetypen: Änderungen an Plan-Vorlage und cli dürfen Quiz und Interactive nicht verschlechtern → deren Lesepfad vorher und nachher messen.
- README liegt in `lernapps/app-templates`: eigener Pull Request, wirkt erst nach Release und Bump.

### Completed
*None yet*

## Code
### Tasks
Je Aufgabe ein Commit; nach jeder `npm test` für die betroffenen Tests.
- [ ] 1 Ausgangsmessung: Test "Lesepfad des Explainers bleibt im Budget" (`test/guidance.test.ts`), der die Dateien des Pfads aus Plan-Vorlage und "Read when" zählt; Budget zunächst auf den heutigen Wert.
- [ ] 2 Widersprüche beheben: `info` (nach O2; vorher `runtime/shared/questions/engine.ts` und Schema lesen, auch `links` im Explainer); Datendatei im Design-Skill; "cannot show an image" und "in the foreground" bedingt formulieren; `git add -A` erst mit `.gitignore` (prüfen, was `init` schreibt; Fehler im Generator als Issue, nicht hier).
- [ ] 3 `lernapps-explainer`: `SKILL.md` wie oben; `rules.md` ohne Komponenten- und Landkarten-Regeln und ohne Beschreibung der Prüfung; `components.md` nimmt `vue-component-*`; `runtime.md` auf Build-Meldung, Adressen, Tutor-Eingaben, `scope`; `structure.md` Wiederholungsseite einmal, Format 1 eine Zeile; `exercises.md` ohne Feldlisten der Fragetypen.
- [ ] 4 `lernapps-explainer-design`: "Map the content" einmal und geordnet (Entscheidung → Verweis auf Regel); "Blocks" bis auf den Weg zur Komponente streichen (README); "Decide" zusammenführen; Regeln zur Landkarte nach `references/rules.md`.
- [ ] 5 `lernapps-content-research`: Landkarte zuerst, Lehrplan nur ohne Strang und Auftrag; Strukturaussagen als Verweis. Verweise in map-assignment, foreign-languages, listing kürzen.
- [ ] 6 Plan-Vorlage und Increment-Vorlage: Aufgaben nennen genaue Dateien; nacherzählter Skill-Inhalt raus; "move to Completed" raus, falls nichts es prüft; Eintragsschema nach O1.
- [ ] 7 `lernapps-cli`: Code-Regeln in die Referenz; Schritt für Maintainer in den internen Skill `manual-eval`.
- [ ] 8 arc42: Konzept "ein Ort je Thema" und Budget des Lesepfads (Kapitel 8, 10); `arc42 validate`.
- [ ] 9 Budget im Test auf den erreichten Wert senken; `npm run rules` und Skill `rules-review` (Drift, Überschneidung); alle Tests.
- [ ] 10 `lernapps/app-templates`: README des Explainers straffen (Selbsteinschätzung, Tutor, Audio je auf das, was die Wahl des Archetyps braucht); eigener Branch-Commit.
- [ ] 11 Manueller Eval nach Skill `manual-eval`: ein Lauf Stochastik, Sonnet 5.5, gleicher Auftrag wie Lauf 3. Vergleich: gelesene Zeichen, rote Prüfungen nach Art, Kosten, Urteil der Lern-Prüfung. Vorher den Owner fragen (Kosten 7–24 USD).
- [ ] 12 Befunde des Evals einarbeiten oder als offen notieren.

### Completed
*None yet*

## Commit
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
