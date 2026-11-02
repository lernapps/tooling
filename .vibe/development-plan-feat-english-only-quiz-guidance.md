# Development Plan: tooling (feat/english-only-quiz-guidance branch)

*Generated on 2026-11-02 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Die Anweisungen für Agenten sollen ein rein englisches Quiz oder einen rein englischen Explainer verhindern. Sie sagen klar:
- Nur Englisch geht nicht. Ohne `languages` sind Seite und Oberfläche deutsch (`lang="de"`, „Frage 1 von 5“).
- Wer Englisch will, bekommt `languages: [de, en]`, beide Sprachen vollständig.
- Die Planung erkennt den Wunsch „nur Englisch“ und klärt ihn spätestens am Checkpoint mit dem Creator.

Anlass: Die App `d-koppenhagen/lernapp-html-elements` hat 215 englische Fragen ohne `languages`. Das Quiz zeigt eine deutsche Oberfläche mit englischen Fragen.

## Key Decisions
- Variante B aus dem Gespräch: nur Anweisungen ändern (Skills, Planvorlage, Regel). Kein neues Verhalten der Runtime, keine Unterstützung für `languages: [en]` (Variante C, verworfen: widerspricht „Deutsch zuerst“).
- Workflow epcc, Branch `feat/english-only-quiz-guidance`.
- Die Plattform ändert sich nicht, nur ihre Anweisungen. Die Vorgabe `con-language-licence` (arc42 Kap. 2: Texte für
  Lernende sind deutsch) bleibt. arc42 braucht daher keine Änderung.
- Der wirksamste Ort ist die Planung: Dort wird die Sprache festgelegt (Interview-Thema „Languages“). Fängt die Vorlage
  „nur Englisch“ dort ab, schreibt der Agent im Code keine englischen Einzeltexte.
- Alle drei Archetypen bekommen denselben Satz: Explainer und Quiz (Laufzeit-Texte deutsch ohne `languages`) und
  Interactive (`src/app.yaml` verlangt „German first“).
- Kein neuer Test. Die Tests prüfen Regel-Blöcke, Links und die Länge von AGENTS.md. Der Inhalt einer Zeile in einem
  Skill lässt sich nicht sinnvoll testen. Simpler: keiner nötig.

## Notes
- Fundstellen:
  - `guidance/plan-template.md` Z. 104: Interview „Languages: German only, or more (texts, code).“ Z. 81: Notes nennen
    „the languages“. Nirgends steht, dass „nur Englisch“ nicht geht.
  - `skills/archetypes/lernapps-quiz/SKILL.md` Z. 48–60, Abschnitt „Languages“: „Without `languages`: German strings.“
  - `skills/archetypes/lernapps-quiz-design/SKILL.md` Z. 45 und `lernapps-explainer-design/SKILL.md` Z. 47:
    „Languages: German; English as a second language is supported.“
  - `skills/archetypes/lernapps-interactive-design/SKILL.md` Z. 42: „Languages: German; each declared language complete …“
  - `skills/archetypes/lernapps-explainer/references/blocks.md` Z. 69–77, Abschnitt „Languages“.
  - `skills/archetypes/lernapps-explainer/references/rules.md` Z. 90–99, Regel `explainer-languages`.
  - `skills/tooling/lernapps-cli/references/platform-rules.md` Z. 141–152, Regel `learner-text-german`.
- Die Prüfung `review/rubric.md` (`learner-text-german`) findet „a text that is not German“. Sie greift aber erst beim
  Listing, nach dem Code. Die App `lernapp-html-elements` wäre dort aufgefallen, zu spät.
- Tests, die Skill-Texte lesen (`test/guidance.test.ts`, `test/rules.e2e.test.ts`): Regel-Blöcke (id, scope,
  severity), Links, Gruppen der Skills, Länge von `guidance/AGENTS.md` (≤ 350 Wörter). Die Änderung berührt nichts davon,
  solange die Regel-Blöcke bleiben.
- Evals (`evals/tasks/*-fresh`) prüfen keine Sprachen.
- Der Text im Schema des Quiz liegt in `app-templates` (`runtime/quiz/quiz.v1.schema.json`), nicht in diesem Repo.
  Er sagt schon „German“; außerhalb des Umfangs.

## Explore
Entrance: Branch angelegt, Plan vorhanden, Ziel mit dem Nutzer geklärt (Variante B).
### Tasks

### Completed
- [x] Created development plan file
- [x] Alle Stellen in `tooling` gefunden, die Sprachen für Lernende beschreiben (siehe Notes).
- [x] Tests und Prüfungen geprüft, die Skill-Texte lesen (siehe Notes).
- [x] Interactive geprüft: dasselbe Problem möglich, gleiche Ergänzung.

## Plan
Entrance: Alle Fundstellen bekannt; klar, welche Prüfungen Skill-Texte lesen.

Kernsatz, in jeder Datei im knappen Stil der Skills (Englisch): „Never English only: without `languages` the page and
the runtime's texts are German. English wanted → `[de, en]`, both complete.“

Änderungen pro Datei:
1. `guidance/plan-template.md`, Interview-Thema „Languages“: German only, or German and English. Kein „English only“;
   wünscht der Creator nur Englisch, das im Interview sagen und `[de, en]` anbieten.
2. `skills/archetypes/lernapps-quiz-design/SKILL.md` und `lernapps-explainer-design/SKILL.md`, „Decide“: Zeile
   „Languages“ um den Kernsatz ergänzen.
3. `skills/archetypes/lernapps-interactive-design/SKILL.md`, „Languages“: dasselbe (German first in `src/app.yaml`).
4. `skills/archetypes/lernapps-quiz/SKILL.md`, „Languages“: „Without `languages`“ um die Folge ergänzen (Seite
   `lang="de"`, deutsche Oberfläche; englische Strings ergeben eine gemischte Seite).
5. `skills/archetypes/lernapps-explainer/references/blocks.md`, „Languages“: dasselbe für den Explainer.
6. `skills/tooling/lernapps-cli/references/platform-rules.md`, Regel `learner-text-german`: ein Punkt „Never English
   only“. Der Regel-Block bleibt unverändert.

Nicht geändert: Regel `explainer-languages` (verweist schon auf „German first“; die Plattform-Regel deckt den Rest),
`review/rubric.md` (findet nicht-deutsche Texte schon), arc42.

Risiken: keine für Tests; Regel-Blöcke und Links bleiben gleich. Prüfung: `npm run check` und die schnellen Tests zu
Guidance und Regeln.

### Tasks

### Completed
- [x] Änderungen pro Datei und Kernsatz festgelegt.

## Code
Entrance: Plan mit Liste der Änderungen pro Datei steht (Nutzer hat autonomes Arbeiten erlaubt).
### Tasks

### Completed
- [x] 1. Planvorlage: Interview-Thema „Languages“ schließt „nur Englisch“ aus und bietet `[de, en]` an.
- [x] 2. Design-Skills Quiz und Explainer: Kernsatz ergänzt.
- [x] 3. Design-Skill Interactive: Kernsatz ergänzt.
- [x] 4. Skill Quiz: Folge von „ohne `languages`“ beschrieben (deutsche Seite, gemischte Seite bei englischen Texten).
- [x] 5. Explainer `blocks.md`: eigener Punkt, damit „Else every text a map“ seinen Bezug behält.
- [x] 6. Plattform-Regel `learner-text-german`: Punkt „Never English only“; Regel-Block unverändert.
- [x] Geprüft: `npm run check` ok; `test/guidance.test.ts` 118 grün; `test/app-content-guide.test.ts`,
      `test/evals.test.ts` 36 grün; `npm run rules` ok. Markdown wird von `vp check` nicht formatiert.

## Commit
Entrance: Änderungen gemacht, Prüfungen grün.
### Tasks

### Completed
- [x] Kein Debug-Code, keine TODOs (nur Markdown geändert).
- [x] Doku geprüft: arc42 bleibt (Vorgabe `con-language-licence` unverändert).
- [x] Branch zu einem Commit zusammengefasst und gepusht.
- [x] Pull Request angelegt: lernapps/tooling#246.
- [x] Issue für `d-koppenhagen/lernapp-html-elements` als Text vorbereitet (Deutsch ist Pflicht, `[de, en]`).
      Die Sitzung hat dort keine Schreibrechte; der Nutzer legt es an.



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
