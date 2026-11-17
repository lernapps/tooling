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
- Skills: nicht mehr Prosa. Budget: Wörter in `skills/archetypes/lernapps-explainer*` und `content/lernapps-content-questions`
  nach der Änderung <= vorher (Messung vorher/nachher im Commit).
- Widersprüche, die aufgelöst werden: (a) `info` je Option (`content-questions`) gegen `info` je falsche Option
  (`exercises.md`): richtige Option kein `info` nötig, `explanation` wiederholt nicht das `info`; (b) "same sections on
  every page" (`design/SKILL.md`, `page-structures.md`): Ids fest, Reihenfolge und Auswahl frei; (c) Zeile "Wanted"
  ohne Wirkung: durch den kurzen Abschnitt ersetzt.
- Doppelungen, die gestrichen werden: `prerequisites-in-order` (Fälle order/gap/entry/ahead nur im Rule-Block, sonst
  Verweis), `one-competency-per-page` (nur im Rule-Block), Mechanik, die `lernapps check` selbst meldet.
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
- Gemessen (scripts/measure-explainer.ts) an francais-1 (7 Seiten) und klima (9 Seiten): Lesetext 160-505 Wörter je Seite,
  Wörter in Aufgaben und Rückmeldungen 140-390 (oft mehr als der Lesetext), längste Textfolge bis 10 Blöcke, erste
  Aktivität bis Block 11, wiederholte Fünf-Wort-Phrasen bis 37. francais-1: kaum statisch, aber viel Wiederholung und
  Rückmeldungstext; klima: viele reine Auswahl-Aufgaben, lange Textfolgen.
- Schwellen (hint): Lesetext > 350, Aufgaben-/Rückmeldungstext > 350, Textfolge > 4, erste Aktivität > Block 4,
  wiederholte Phrasen im selben Teil > 10, ab 3 Aufgaben >= 75 % Auswahl ohne Komponente oder nur eine Art.
- Entscheidung: `explainer-exercise-variety` ist in `explainer-interaction` aufgegangen (drei statt vier Checks, weniger
  Regeltext).
- Entscheidung des Erstellers: Wiederholung in verschiedenen Teilen (Text, Aufgabe, Tabelle, mehrere Aufgabentypen) ist
  didaktisch gewollt und wird nicht gemeldet. Gemeldet wird nur dasselbe im selben Teil (zwei Textblöcke, zwei
  Aufgaben desselben Typs); Hint und Skill sagen, dass bewusste Wiederholung zum Vertiefen gut ist. Neu gemessen:
  höchstens 14 Phrasen je Seite, Schwelle 10.
- Wortbudget: berührte Skill-Dateien vorher 12049 Wörter, nachher 12048.
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
- [x] Skill-Änderung entschieden: kein neuer Skill, Abschnitt "Engagement" in `lernapps-explainer-design` (<= 150 Wörter:
      Hook, Handlung in den ersten Sekunden, Wechsel der Aktivität, Belohnung am Ende)
- [x] Testfälle festgelegt (siehe Code)

### Completed
- Reihenfolge und Tests der Code-Phase festgelegt.

## Code
### Tasks
- [x] **app-templates**, `runtime/shared/questions/engine.ts`: `reveal(right)`; bei `single-choice`/`multiple-choice` und
      richtiger Antwort `.question-infos` verbergen (nur `explanation`, Links); falsch oder "Lösung zeigen": alles.
      Tests: e2e in `runtime/explainer/e2e.ts`, `runtime/quiz/e2e.ts`, `test/fixtures/question-page/e2e/question.e2e.ts`
      (richtig: keine Infos; falsch: alle; Lösung zeigen: alle; ohne JS unverändert). Branch in app-templates.
- [x] **tooling**, Messskript `scripts/measure-explainer.ts`: Kennzahlen je Seite aus YAML (siehe unten); an francais-1 und
      klima laufen lassen; Ergebnis in die Notes
- [x] **tooling**, Hilfsmodul `check/explainer-pages.ts`: liest die Blöcke je Seite (Aufgabenarten, Wörter, Textfolgen)
- [x] **tooling**, Checks (je `check/rules/<id>.ts`, `hint`, Test in `test/explainer-structure.test.ts` mit
      Positiv- und Negativfall): `explainer-text-load` (Wörter je Seite/Abschnitt, längste reine Textfolge, erste
      Blöcke ohne Figur/Aufgabe), `explainer-repetition` (Wortfolgen >= 5 Wörter und Formen mehrfach auf einer Seite,
      auch Text/`info`/`explanation`/`mistakes`), `explainer-interaction` (Anteil Aufgaben mit mehr als Ankreuzen:
      `generated`, `language-task`, `speaking-task`, Komponenten, `ordering`, `matching`), `explainer-exercise-variety`
      (Zahl verschiedener Übungsarten je Seite). Schwellen aus der Messung
- [x] **tooling**, Skills: vier `rule`-Blöcke (Titel, Rule-Block, höchstens zwei Sätze); Abschnitt "Engagement";
      Widersprüche und Doppelungen wie unter Key Decisions; Wortzahl vorher/nachher messen
- [x] **tooling**, `npm test` bzw. `lernapps check` des Repos grün; Rule-Seite enthält die neuen Regeln

### Completed
*None yet*

## Commit
### Tasks
- [ ] Je Repo ein Commit (Squash) mit Intent/Key changes/Dependencies; Push nur auf `claude/focused-hawking-9sf3r1`;
      kein PR ohne Auftrag; Notes mit gemessenen Wörtern vorher/nachher und Schwellen

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
