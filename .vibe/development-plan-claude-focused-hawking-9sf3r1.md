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
- [x] Schwellen an francais-1 und klima messen (Phase Plan/Code, Messskript); Endstand siehe Nachtrag 5

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

## Nachtrag nach dem manuellen Eval (Sonnet-Session, App "Dans ma classe")
- Entscheidung des Erstellers: (1) Engagement je Seite als eine Zeile im Plan unter "Content method", nummeriert und knapp;
  (2) richtige Option ohne `info` in `exercises.md`; (3) Wiederholung `recap` mit mehreren Kompetenzen kommt über das
  Update von app-templates, keine Änderung hier; (4) `llms.txt` bleibt, dafür im Skill `manual-eval`: bei Berechtigungsproblemen
  fragt die Session den Owner direkt.
- Wortbudget der berührten Skill-Dateien: 12021 (Vorgabe 12049).
- Nach Durchsicht der App durch den Owner: Grundwortschatz wurde nicht verwendet (Wortliste im Feld `vocabulary` der Karte war vom Orchestrator gekürzt, die Seite nicht angefordert); Audio fehlte, weil die Persona es ausgeschlossen hatte. Umgesetzt nur das Vokabular: `foreign-languages.md` macht die Seite zur Quelle in "Content method" (nummeriert), der Auftrag hat die Zeile "Wörter". Audio als Vorschlag im Auftrag ist noch offen.

## Nachtrag 2: Vergleich der autonom gebauten App mit francais-1 (Owner)
- Befund: Die autonome App ist didaktisch viel schwächer (2 einfache SVGs für 8 Seiten, kein Ton, 2-5 Aufgaben, überall
  Auswahl/Lücke/Schreiben, Geschichte nur als Satz); die drei ersten Checks haben nicht gemeldet (Tabelle gilt als
  Aktivität, Lücke/Schreiben als aktiv).
- Umgesetzt (Hints): `explainer-page-variety` (ab 4 Seiten kein Satz Aufgabenarten auf >= der Hälfte der Seiten),
  `explainer-visual` (mindestens die Hälfte der Seiten mit Figur, Zeitleiste, Video oder Komponente; Tabelle zählt
  nicht), und in `explainer-interaction` mindestens vier Aufgaben je Seite (Komponenten zählen, Wiederholungsseite
  ausgenommen). Gegen die Zahlen des Tests: Seiten 5/8 mit demselben Satz, 2/8 mit Bild, 7/8 unter vier Aufgaben:
  alle drei hätten gemeldet; francais-1 und klima melden bei page-variety und visual nichts.
- Offen: Ort der Sprachmuster (francais-1-Muster: Kurz geübt, Nachsprechen, Ordnen, Rückmeldung mit Regel, Szene je
  Seite) in den Skills; Owner klärt.
- Wortbudget: 12039 (Vorgabe 12049).

## Nachtrag 3: Geschichte nach Stufe, Sprachmuster, Rules und Review
- Entscheidung des Erstellers: Die Geschichte trägt als Mechanismus (Anliegen, Schritt je Seite, Weitergabe an die nächste
  Seite), die Form folgt dem Alter (bis Klasse 6 gezeichnete sprechende Figuren, 7-9 Nachrichten/Dialog, ab 10 ein
  realer Fall; Stufen sind ein Vorschlag, `(guess)`). `explainer-visual` zählt auch Formel, Code und Zitat als etwas zum
  Ansehen (Tabelle nicht).
- Ort: `map-assignment` §4 (entsteht), "Engagement" Punkt 4 (wird geplant), `figures.md` (Szenen für Jüngere).
- Sprachmuster in `foreign-languages.md` als vier Zeilen für "Content method" (Ton, Wörter mit Artikel und Quelle,
  wechselnde Aufgabenarten, typische Fehler); sie tragen die Regel `explainer-language-practice`.
- Neue Rules mit Review-Rubrik (`review/archetypes/explainer.md`): `explainer-story-carries`,
  `explainer-language-practice`; bestehende Regeln um je einen Halbsatz erweitert (`explainer-page-goal`: sagt, was
  folgt; `explainer-representation-explained`: Merke-Kasten; Engagement 1 und 3: erste leichte Aufgabe mit Begründung,
  Rückblick am Kapitelende).
- Mindestzahl Aufgaben gilt erst ab vier Seiten (der Platzhalter von `create` wird nicht beurteilt, sonst bestand
  `create.e2e` nicht).
- Wortbudget: 12010 (Vorgabe 12049); sieben Begründungsabsätze in den Regeln gestrichen.

## Nachtrag 4: Zweiter Test, Review, Figuren
- Zweiter autonomer Lauf: App deutlich reicher als der erste (7-8 Aufgaben je Seite, 4-6 Arten, Audio auf allen Seiten),
  aber in keiner der 7 Zeichnungen sind Léa und Noé gezeichnet; der Leitfaden behauptet es trotzdem. Lokaler Review
  durch einen Sub-Agenten: pass, 0 Fehler, 2 Warnungen (Scope, `node_modules` im Commit), 6 Hinweise; hat die fehlenden
  Figuren nicht bemerkt. Lerner-Check mit Browser nur für die Musterseite (so steht es im Plan); der Review spielte die
  Seiten nicht durch.
- Entscheidung des Erstellers: Die Regeln zum Zeichnen von Personen werden gelockert: eine Geschichte braucht keine Person,
  gerade in höheren Stufen; die Zeichenregel gilt nur, wo die Geschichte gezeichnete Kinder hat. Ein Beispiel-SVG mit
  zwei Figuren liegt als Vorlage in `exercise-patterns/references/story-characters.svg`.
- Entscheidung des Erstellers: Am Ende der Code-Phase einmal die ganze App komplett durchspielen und den Zusammenhang der
  Seiten prüfen (nicht ein Lerner-Check je Seite). Umgesetzt: Abschnitt "Whole-app check" in
  `guidance/subagent-brief.md`, ein Plan-Schritt am Ende von Code, derselbe Lauf im Review (`review/prompt.md`, wo der
  Agent Befehle ausführen kann). Außerdem Check `no-committed-dependencies` (Regel in `lernapps-commit`, Scope listing,
  Warnung) gegen verfolgte Dateien unter `node_modules/`.
- Die Figuren der Vorlage haben bereits einen Körper (Kopf und weicher Rumpf wie in francais-1).

## Nachtrag 5: Dritter Test (Strang Wahrscheinlichkeit, Mathe), Messung, Regeln kürzen
- Dritter autonomer Lauf (Mathematik, Wahrscheinlichkeiten, 14 Seiten in 2 Kapiteln): 5-7 Aufgaben je Seite in 6-7
  Arten, Prosa knapp (etwa 100-230 Wörter je Seite), Geschichte mit Chat auf jeder Seite, Gesamtdurchlauf fand echte
  Mängel (Rückverweise, nicht eingeführte Personen, Begriffe vor Einführung) und wurde danach nicht wiederholt. Mängel:
  Anmerkung der Lehrerin (Ereignis = Menge von Ergebnissen) nur auf der Musterseite umgesetzt, Antwortinfo der Übung
  blieb; einzelne Zuordnungen wiederholen die Tabelle davor ("zu leicht"); Laufzeit zeigt bei wahr/falsch, Ordnen,
  Zuordnen, Zahl nur eine allgemeine Meldung.
- Entscheidung des Erstellers: Die Prozessregeln sind zu ausführlich und stehen doppelt. Die Tabelle in
  `guidance/AGENTS.md` gibt je Regel den ersten Punkt (ein Satz, der sagt, was zu tun ist) und die Zeilen der Regel in
  `workflow-rules.md`; `scripts/agents-md.ts` schreibt beides. `feedback-applied-everywhere` gilt auch für Tatsachen
  und Begriffe (ganzes `src/` durchsuchen).
- Messung mit den endgültigen Checks: francais-1 meldet Wiederholungen bei `artikel` (14) und `avoir` (12); klima
  meldet Textlast (mehr als 350 Wörter) bei fünf Seiten und weniger als vier Aufgaben bei sechs von neun. Alles Hints,
  keine Fehler.
- Offen, bewusst nicht in diesem Merge: Prüfungen für "zu leicht" (Antwort steht im Text, Zuordnung wiederholt
  Tabelle), Blindtest im Lerner-Check, Wiederholung des Durchlaufs nach Korrekturen, Hinweis bei Selbsteinschätzung
  über 20 Aufgaben, Rückmeldung der Laufzeit bei den vier Aufgabenarten (app-templates), Anhebung der Version von
  `@lernapps/app-templates` in `tooling` nach deren Freigabe.

## Commit
### Tasks
- [x] Aufräumen: keine Debug-Ausgaben, keine TODOs; `console.log` in `scripts/measure-explainer.ts` ist die Ausgabe des Skripts
- [x] Squash-Merge über einen Pull Request nach `main` (Auftrag des Erstellers); Push nur auf
      `claude/focused-hawking-9sf3r1`; kein Force-Push des gepushten Branches
- [ ] Offen: `app-templates` (Commit `b3ed0be`, Antwortinfo bei richtiger Antwort ausgeblendet) mit dem Text für die
      Rückmeldung nachliefern; danach `lernapps update` in francais-1 und klima

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
