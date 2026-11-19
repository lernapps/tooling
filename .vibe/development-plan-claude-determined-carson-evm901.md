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
- Owner (18.11., Leitidee): AGENTS.md trägt den allgemeinen Prozess (Phasen, Plan-Datei). Die Plan-Datei legt bei ihrer Instanziierung die konkrete Methodik fest. Skills erklären bedarfsgerecht Konventionen, die Review oder Check auch prüfen. O1 damit entschieden: Schemata nicht früh lesen.
- D6 Sortierregel für jeden Satz der Anleitung: Prozess (wer, wann, wo notieren, Checkpoint) → AGENTS.md oder Plan-Vorlage; Konvention → Skill, als Regelabschnitt mit Id, Grund und Beispiel, geprüft durch Check oder Rubrik; Notation → Schema und ein vollständiges Beispiel; Beschreibung des Systems → README oder streichen; was das Modell ohnehin weiß → streichen.
- D7 Best Practices (platform.claude.com "Skill authoring best practices", agentskills.io, gelesen 18.11.): nur ergänzen, was das Modell nicht weiß; Freiheitsgrad nach Fragilität (Notation: genaues Beispiel; Didaktik: Grundsatz mit Grund); Beispiele vor Beschreibung; Referenz über 100 Zeilen mit Inhaltsverzeichnis; nichts Veraltetes (Format 1, "old contract"); deterministische Schritte als Skript; Prüfen, Beheben, Wiederholen statt Vorab-Wissen über die Prüfung.
- D8 Kürzen heißt Themen streichen, nicht Sätze zu Stichworten verdichten: der Telegrammstil spart Wörter, ist aber nicht instruktiv. Das Budget zählt deshalb den Lesepfad, nicht die einzelne Datei.
- Owner (18.11.): O2 Skills ans Schema angleichen. O3 Plan je Archetyp. Skills dürfen neu geschnitten werden, auch die Sub-Agent-Briefs.
- D9 Plan je Archetyp: `guidance/plan-template.md` reicht bis zur Wahl des Archetyps. `lernapps skills --archetype <name>` installiert wie bisher die Skills, setzt `archetype:` und fügt aus `guidance/plan-<archetype>.md` die Aufgaben des Archetyps in die Plan-Datei ein (Rest von Explore, Plan, Code, Commit, "Content method"). Keine Verzweigung "An explainer: …" und kein `lernapps-<archetype>` mehr im Plan. Der Befehlsname bleibt (bestehende Apps, Tests, llms.txt). Der Fallback ohne npx kopiert die Teildatei von Hand.
- D10 Neuer Schnitt: Skill `lernapps-learner-check` (Code) aus dem Verfahren von `early-preview` und den Briefs "Learner check" und "Whole-app check" (je eine Datei, gelesen bei ihrer Plan-Aufgabe). Der Brief für Kapitel-Scheiben geht als Referenz zu `lernapps-content-growth`. `guidance/subagent-brief.md` entfällt. Komponenten und Sprachaufgaben bleiben Referenzen von `lernapps-explainer` (weniger Einträge in der Skill-Liste).

- Owner (19.11.): Plan-Datei bleibt Markdown und Medium zum Creator; Befehle erzeugen sie und lesen vor. Geteilte Regel bestätigt. Danach Eval mit einem manuellen Explainer; die Session startet aus `lernapps/start`, das die Claude-Berechtigung für `npx … @lernapps/tooling` und `npx --no -- lernapps` bekommt. Sorge des Owners: Agenten nutzen die Freitext-Abschnitte für alles → im Eval beobachten.
- D11 `lernapps plan`: `new` (erste Fassung, Erweiterung, Teil des Archetyps; ersetzt das Einfügen über `skills --archetype`, das den Teil weiter mit einfügt), `next` (nächste offene Aufgabe mit Hinweisen der Phase), `done` (abhaken, nach der letzten die Phase setzen), `add` (neue Aufgabe). Aufgaben, Phase und Kopfdaten ändert nur der Befehl; Freitext von Hand nur in "Answers", "Notes", "Key decisions", "Content method", "Entry draft", "Retrospective". AGENTS.md sagt das in einem Satz. Der Commit-Hook meldet umformulierte oder gelöschte Aufgabenzeilen.

- Folge von D11: Die Aufgaben im Plan bleiben englisch (sie sind Anweisungen an den Assistenten und werden nicht mehr umgeschrieben); die freien Abschnitte stehen in der Sprache des Creators.
- Im Eval zu beachten: `npx --yes @lernapps/tooling init` holt die veröffentlichte Version. Für den unveröffentlichten Stand braucht die Session `--tooling github:lernapps/tooling#<commit>`; dafür fehlt im Start-Repository eine Berechtigungsregel.

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
- [x] Owner: O1, O2, O3 entschieden; neuer Schnitt erlaubt
- [x] Owner: Aufgabenliste bestätigt (19.11.), mit `lernapps plan` und geteilter Regel

### Risiken
- Kürzen entfernt still eine Anweisung, die Fehler verhindert hat → Eval vergleicht; jede gestrichene Regel hat weiter ihren Abschnitt mit Id.
- Tests prüfen Wortlaute in Skills und Vorlagen → vor jedem Schritt `grep` in `test/`, Tests nach jedem Schritt.
- Vorlagen sind für alle Archetypen: Änderungen an Plan-Vorlage und cli dürfen Quiz und Interactive nicht verschlechtern → deren Lesepfad vorher und nachher messen.
- README liegt in `lernapps/app-templates`: eigener Pull Request, wirkt erst nach Release und Bump.

### Completed
*None yet*

## Code
### Tasks
- [ ] 13 `lernapps/app-templates`: README des Explainers auf das, was die Wahl des Archetyps braucht; Beschreibung von `info` im Fragen-Schema ("After an answer it shows for every option") an #169 angleichen. Eigener Commit dort.
- [ ] 17 Offen aus dem Eval: Freitext wird per Skript in die Plan-Datei geschrieben (11-mal, 1 Fehlschlag) und "Content method" veraltet → Vorschlag des Owners: zwei Dateien (Aufgaben, Notizen); noch nicht entschieden. Hördateien ungehört committet: nicht verbieten (Owner). Berechtigungsregel im Start-Repository griff im Auto-Modus nicht: Ursache unbekannt.
- [ ] 16 Offen für den Owner: `lernapps-exercise-patterns`, `lernapps-map-assignment`, `lernapps-github`, `lernapps-explainer-self-assessment`, `blocks.md` und `language-tasks.md` sind nur an den Verweisen berührt, nicht nach D6 sortiert; Konventionen ohne Prüfer (Aufgabe 10) sind nicht aufgelistet.

### Completed
- [x] 14 Manueller Eval "explainer 3" (Französisch, à l'école, Sonnet 5.5, aus `lernapps/start`): 34 min, 6,55 USD, rund 130.000 Zeichen Anleitung gelesen (Referenz 167.000), 9 Läufe `lernapps check` ohne Fehler (Referenz 17, 2 mit Fehlern), `plan done` 33-mal, kein Handeingriff an Aufgaben. Auswertung durch Subagent, nicht einzeln nachgeprüft.
- [x] 15 Aus dem Eval umgesetzt: `init` und `plan new` füllen Titel und Datum; `plan done` als eigener Befehl (Ausgabe, `plan-file`); jedes offene Interview-Thema wird einmal gefragt; die Landkarte wird immer gelesen (Aufgabe lädt `lernapps-map-assignment` ohne Bedingung; Auftrag, wenn der Creator keinen Inhalt mitbringt); Schritte der Selbsteinschätzung stehen vorn; AGENTS.md: Dateien bis zur letzten Zeile lesen.
- [x] 1 Test "the reading path of an explainer stays within its budget": 113.000 Zeichen; vorher rund 144.500 auf demselben Pfad (mit Eintragsschema), jetzt rund 111.500 (−23 %).
- [x] 2 Widersprüche: `info` und `links` nach Schema (jede Option hat `info`, jede Frage mindestens einen Link; `quiz-further-reading` gilt auch für Fragen im Explainer); Datendatei nur für `timeline` und `generated`; Bildlesen und Sub-Agent bedingt formuliert; `init` schreibt `.gitignore` mit `node_modules/`, `create` nimmt sie und `.claude/settings.json` hin.
- [x] 3 Plan je Archetyp: `guidance/plan-explainer.md`, `plan-quiz.md`, `plan-interactive.md`; `skills --archetype` setzt `archetype:`, fügt die Aufgaben ein und ersetzt `<archetype>`.
- [x] 3a `lernapps plan next|done|skip|add|new` (`src/plan.ts`, `src/plan-command.ts`), 21 Tests. `done` verlangt an einem Checkpoint `--answer` und hält die Antwort im Plan; eine leere Stelle `<!-- tasks: … -->` hält den Plan an.
- [x] 3b Geteilte Regel in `AGENTS.md` (350 Wörter) und `workflow-rules.md` (`plan-file`); der Commit-Hook meldet umformulierte oder gelöschte Aufgaben (in der Probe-App geprüft).
- [x] 4 Prozess in den Plan: Eintragsschema erst in Commit (Skill `lernapps-listing`); "move to Completed", `grep '^phase:'` und "Set phase" entfallen; Increment-Vorlage ebenso.
- [x] 5 `lernapps-explainer`: `SKILL.md` mit Seitengerüst und "Before the first page" (Gerüst und Wiederholungsseite in einer Probe-App gebaut: `vp build` grün); `rules.md` mit Inhaltsliste, ohne Komponenten- und Landkarten-Regeln; `structure.md`, `runtime.md` neu; `components.md` mit den `vue-component-*`-Regeln.
- [x] 6 `lernapps-explainer-design`: "Map the content" in acht Schritten; Regeln in `references/rules.md` (gruppiert) und `references/map-rules.md` (nur bei Befund).
- [x] 7 `lernapps-content-research`: Landkarte zuerst, Lehrplan nur bei `strand: none`; `lernapps-listing` gekürzt.
- [x] 8 `lernapps-cli`: Code-Regeln in `references/code-rules.md`; Maintainer-Schritt im internen Skill `manual-eval`.
- [x] 9 Skill `lernapps-learner-check` mit zwei Briefs; Brief für Kapitel-Scheiben bei `lernapps-content-growth`; `guidance/subagent-brief.md` entfernt.
- [x] 11 arc42: Entscheidung `dec-plan-commands`, Konzept "ein Ort je Thema", Baustein `bb-skill-learner-check`; `arc42 validate` ohne Fehler.
- [x] 12 Alle Tests grün (697); Eval-Auswertung erkennt die Phase aus der Ausgabe von `lernapps plan`.
- [x] 13a `lernapps/start`, Branch `claude/determined-carson-evm901`: `.claude/settings.json` mit den Berechtigungen.

## Commit
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
