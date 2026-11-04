---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype, null until chosen in Explore. Allowed values: explainer, interactive, quiz.
archetype: explainer
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: commit
# prePushFailures: written by the pre-push hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: { checks-pass: 9 }
---

# Plan: Stromkreis und elektrischer Strom, first version

<!--
For you, the assistant.
1. Path: `.vibe/plans/01-<short name>.md`. Every later change gets its own plan from the increment template.
2. Read this plan before each step. One phase at a time, tasks in order.
3. Task done → tick `[x]` at once and move it to "Completed" of its phase. An unticked box counts as not done.
4. New task found → add it.
5. Each phase names its skills. Load a skill when its task comes, not before. Read it in full, from its file.
6. Checkpoint: stop, ask, wait for the creator's answer. A message sent before the question is no yes.
   Only a checkpoint waits. A phase's last box → set the next phase and go on in the same message.
7. At most 2 questions per message, one topic each. No questions inside drafts or lists.
8. Work on the branch `work`, locally: push nothing before Commit. Commit puts the app on GitHub and brings `work`
   into `main`.
9. Plan in the creator's language. Keep headings and front matter keys. Delete a comment once its part is filled.
10. Begin each reply to the creator with the phase in `phase:`, and at a checkpoint the word checkpoint:
    "**Plan · Checkpoint**", "**Code**". The creator always knows where you are.
-->

*Gestartet 2026-11-04. Explore, Plan, Code, Commit.*

## Goal

Schülerinnen und Schüler der Klasse 8 lesen Kapitel zum Stromkreis und üben nach jedem Teil, auch zu Hause. Sie lernen, was einen Stromkreis schließt, wie Stromstärke und Spannung gemessen werden, wie sich Reihen- und Parallelschaltung unterscheiden und wie man sicher mit Strom umgeht.

## Key decisions

- Archetyp `explainer`: Erklärseiten in Kapiteln mit Übungen je Seite, zum Nachlesen und Üben; kein Spiel, keine Simulation nötig.
- Strang `physik/elektrizitaetslehre` der Lernlandkarte; Seiten nach den Kompetenz-ids der Karte.
- Nur Deutsch (Antwort des Erstellers).
- 3 bis 5 Übungen je Seite, vom Erkennen zum Anwenden (guess; „entscheide du“).
- Aussehen: das ruhige Arbeitsblatt-Design der Laufzeit, Dunkelmodus folgt dem Gerät (guess; „entscheide du“).
- Fehlvorstellungen aus der Fachdidaktik (Antwort des Erstellers: „nimm die bekannten“).
- Schaltpläne und Messgeräte als eigene SVG-Zeichnungen, keine Vue-Komponente in der ersten Version (guess).
- Reihen- und Parallelschaltung auch mit den Regeln zu Stromstärke und Spannung, qualitativ und im Ablesen von Messwerten, ohne Widerstand und ohne Rechnen (guess; die Karte legt das Rechnen auf Klasse 9–10).
- Keine eigene Seite zu Spannungsquellen (`spannungsquellen`); die Batterie kommt in den Texten vor, wird aber nicht geübt (guess).
- Kein `scope` (kein offener Aufgabentyp, kein Material des Erstellers).
- Keine Videos (guess).
- Selbsteinschätzung je Kapitel ergänzt (guess; „entscheide du“): 2 bis 3 Aufgaben je Seite in Schritten zu 2 bis 3; die der App hat 24 Aufgaben, etwas über dem Richtwert von 15 bis 20.

## Notes

**Strang:** `physik/elektrizitaetslehre` (Karte: https://lernapps.net/apps/map/physik/, Quelle der Karte: KMK, Weiterentwickelte Bildungsstandards Physik MSA, Beschluss 16.12.2004 i.d.F. vom 13.06.2024, https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2024/2024_06_13-WeBiS_Physik_MSA.pdf; Adresse geöffnet, HTTP 200, Inhalt von mir nicht gelesen).

**Lehrplan-Orientierung:** Kernlehrplan Physik Sekundarstufe I Gymnasium NRW (QUA-LiS NRW): **nicht geprüft**. Die Seite lieferte mir keinen lesbaren Lehrplantext, daher keine Inhaltsfeld- oder Kompetenzangabe. Aufbau und Reihenfolge folgen der Lernlandkarte (`requires`) und den Wünschen des Erstellers.

**Kompetenzen nach Kapitel** (Wortlaut der Karte, ids in Klammern; eine Seite je Kompetenz):

Kapitel 1 · Der Stromkreis
- `einfacher-stromkreis`: Ich kann einen einfachen Stromkreis aus Batterie, Lampe und Kabeln aufbauen und erklären, warum er geschlossen sein muss.
- `leiter-nichtleiter`: Ich kann Leiter und Nichtleiter unterscheiden und Beispiele nennen.
- `schalter`: Ich kann erklären, wie ein Schalter einen Stromkreis öffnet und schließt.
- `schaltzeichen`: Ich kann einen Stromkreis als Schaltplan mit Schaltzeichen zeichnen und einen Schaltplan lesen.

Kapitel 2 · Stromstärke und Spannung
- `stromstaerke`: Ich kann die Stromstärke als Maß dafür erklären, wie viel Strom fließt, und sie in Ampere angeben.
- `stromstaerke-messen`: Ich kann die Stromstärke mit einem Amperemeter richtig messen.
- `spannung`: Ich kann die Spannung als Antrieb des Stroms erklären und sie in Volt angeben.
- `spannung-messen`: Ich kann die Spannung mit einem Voltmeter richtig messen.

Kapitel 3 · Reihen- und Parallelschaltung
- `reihenschaltung`: Ich kann eine Reihenschaltung aufbauen und erklären, was passiert, wenn ein Bauteil ausfällt.
- `parallelschaltung`: Ich kann eine Parallelschaltung aufbauen und erklären, was passiert, wenn ein Zweig ausfällt.

Kapitel 4 · Sicherheit
- `gefahren-des-stroms`: Ich kann erklären, warum Strom aus der Steckdose gefährlich ist und Strom aus einer Batterie nicht.
- `sicher-mit-strom-umgehen`: Ich kann Regeln für den sicheren Umgang mit Strom nennen und anwenden.

Die Reihenfolge der Seiten folgt `requires`. Alle Voraussetzungen liegen im Strang und werden in der App geübt, daher keine Wiederholungsseite (`recap`). Die Karte ordnet viele Bausteine den Klassen 5–6 zu; für Klasse 8 sind sie Wiederholung und Vertiefung (Hinweis, kein Widerspruch).

**Wie Lernende dorthin kommen, und welche Fehlvorstellung die Rückmeldung abfängt** (bekannte aus der Fachdidaktik, noch ohne Quellenbeleg; in Code gegen Quellen prüfen):
- `einfacher-stromkreis`: Lernende verfolgen den Weg des Stroms und finden, wo ein Kreis offen ist. Fehlvorstellung: Ein Kabel vom Pluspol zur Lampe genügt (Verbrauchsmodell).
- `leiter-nichtleiter`: sortieren Stoffe nach Prüfergebnis. Fehlvorstellung: alle Metalle leiten, alles andere isoliert; Wasser leitet nie.
- `schalter`: verfolgen den Weg bei offenem und geschlossenem Schalter. Fehlvorstellung: Ein Schalter wirkt nur auf die Lampe direkt dahinter.
- `schaltzeichen`: übersetzen Aufbau und Schaltplan. Fehlvorstellung: Der Schaltplan sei ein Foto der räumlichen Anordnung.
- `stromstaerke`: leiten aus Helligkeitsvergleich und Messwerten ab, rechnen mA ↔ A um. Fehlvorstellung: Strom wird in der Lampe verbraucht, ist also dahinter kleiner; Stromstärke und Spannung verwechselt; mA nicht umgerechnet.
- `stromstaerke-messen`: lesen Skalen ab und ordnen den Anschluss. Fehlvorstellung: Amperemeter parallel anschließen; falscher Messbereich.
- `spannung`: Vergleich mit einem Antrieb. Fehlvorstellung: Spannung „fließt“ durch den Draht; die Batterie speichert Strom; Spannung gebe es nur bei fließendem Strom.
- `spannung-messen`: wie oben. Fehlvorstellung: Voltmeter in Reihe schalten.
- `reihenschaltung`: sagen das Ausfallverhalten voraus und lesen Messwerte. Fehlvorstellung: Die erste Lampe verbraucht Strom, die zweite bekommt weniger.
- `parallelschaltung`: wie oben. Fehlvorstellung: Fällt ein Zweig aus, gehen alle aus.
- `gefahren-des-stroms`: ordnen Quellen nach Spannung und Folgen. Fehlvorstellung: nur die Spannung zähle, die Stromstärke nicht; Batterien seien immer harmlos.
- `sicher-mit-strom-umgehen`: wenden Regeln auf Alltagssituationen an. Fehlvorstellung: Vögel auf der Leitung zeigten, dass Strom ungefährlich sei.

**Umfang:**
- Drin: die zwölf Kompetenzen oben; Einheiten Ampere (A, mA) und Volt (V); Amperemeter und Voltmeter; Schaltzeichen für Batterie, Lampe, Schalter, Leitung, Amperemeter, Voltmeter; Reihen- und Parallelschaltung qualitativ (guess).
- Draußen: Widerstand, ohmsches Gesetz, Rechnen in Schaltungen, Gesamtwiderstand (Karte: Klasse 9–10); Ladung und Elektronenmodell (9–10); Wirkungen des Stroms; Spannungsquellen als eigene Seite; Hausinstallation und Sicherungen. Später als Erweiterung möglich.
- Datendateien: Schaltzeichen und Messgeräte; Stoffe für Leiter/Nichtleiter.
- Sprache: nur Deutsch.

**Quellen** (nur geöffnet, nicht gelesen; Fakten daraus, keine Sätze):
- https://de.wikipedia.org/wiki/Elektrische_Stromst%C3%A4rke (HTTP 200)
- https://de.wikipedia.org/wiki/Elektrische_Spannung (HTTP 200)
- https://de.wikipedia.org/wiki/Reihenschaltung (HTTP 200)
- https://de.wikipedia.org/wiki/Parallelschaltung (HTTP 200)
- https://de.wikipedia.org/wiki/Elektrischer_Leiter (HTTP 200)
- Sicherheit: noch keine Quelle (versuchter Wikipedia-Titel: 404); wird in Code gesucht und geprüft, sonst weggelassen.
- Nicht geprüft: Inhalt aller Seiten, serlo.org, Videos (keine vorgesehen).

**Prüfung der Seiten in Code:** Meine Werkzeuge können keine Bilder ansehen. Statt der Screenshots habe ich jede der 14 Seiten (Start, Glossar, 12 Lernseiten) im Browser bei 1280 und 360 px geöffnet und Seitenüberlauf und Elementgrenzen geprüft (ein Überlauf einer Tabelle auf der Gefahren-Seite ist behoben); die Muster-Seite hat zusätzlich ein unabhängiger Lerner-Check mit Wiederholung nach den Korrekturen durchgespielt. Wie die Zeichnungen aussehen, hat noch niemand mit Augen beurteilt.

**Struktur:** 4 Kapitel, 12 Seiten, 3–5 Aufgaben je Seite; Selbsteinschätzung je Kapitel wird in Commit entschieden.

## Explore

<!--
- Find out what the app teaches, for whom, how much and how it looks. All content questions belong here; Plan only
  maps the answers onto the archetype.
- Ask. Write no code, run no `create`.
- An answer counts only in the creator's words under "Answers". Never tick a topic you assumed.
- Skills: `lernapps-app`, `lernapps-exercise-patterns`, `lernapps-<archetype>-design`, `lernapps-content-research`.
-->

### Tasks

- [x] The skills of the phases are in `.agents/skills/` (`npx --yes @lernapps/tooling init <short name>` put them there
      and wrote this plan; the app commits them). `.agents/skills/lernapps-app` missing → stop and tell the creator
      the folder was not started with `init`. `git branch --show-current` prints `work`; else `git switch -c work`.
- [x] Load skill `lernapps-app`. Tell the creator in two sentences what a lernapps app is and where it will live: at
      their own address, free, public, and once listed as a copy on lernapps.net. The technical part (GitHub) comes at the end, and you do it.
- [x] Interview: ask the topics "Goal" and "Learners" of "Answers".
- [x] Load skill `lernapps-exercise-patterns` and read the patterns of the subject: how will learners practise what
      the goal names? The kind of practice points to the archetype, as the skill says.
- [x] Choose the archetype as skill `lernapps-app` says, from the kind of practice: read the README of each
      archetype in question, tell the creator what the chosen one can and cannot do. Write it and its reason under
      "Key decisions". Set `archetype`.
- [x] Install the archetype's skills: `npx --no -- lernapps skills --archetype <archetype>`. Load skill
      `lernapps-<archetype>-design`.
- [x] Interview: ask the other topics of "Answers" in order. Skip a topic only when an earlier answer covers it; note
      which. No answer → ask once more; still none → write your assumption with "(guess)". Done when every topic
      has an answer or a guess.
- [x] Load skill `lernapps-content-research`. Research as it says. Under "Notes": curriculum orientation,
      competencies by chapter as "Ich kann …", verified sources. No competencies → not done. First the learning map as
      skill `lernapps-content-research` says: recommend a strand that fits (`<subject>/<strand>`), else `none`; with a
      strand, only its competencies, by their ids from the map. Write both under "Notes", and how they map onto
      chapters and pages (an explainer: as a rule one page per competency; competencies that build on each other, by
      the map's `requires`, share a chapter, in that order).
- [x] Under "Notes", one line per competency: how learners get there (derive, not only read off; e.g. a tree diagram
      shows how a probability comes about), which misconception the feedback catches.
- [x] Under "Notes", the scope: what is in, what is out and why, the data range (e.g. "all main-group elements",
      never a silent "1–20"), the languages.
- [x] Fetch https://lernapps.net/apps/schemas/entry.v1.schema.json and read each property's description. Ask what
      helps teachers and parents find the app. Fill "Entry draft". Search words: one or two words each, as people
      type them.
- [x] **Checkpoint:** research. Show in plain words: the strand or why none, curriculum orientation, competencies by
      chapter (with their ids) and their pages, didactic approach, scope, every "(guess)", sources and how you
      checked them, what is unchecked, archetype and reason. With a strand, the map decides the structure: competencies
      that build on each other (its `requires`) share a chapter, in that order; no curriculum search is needed for it.
      Stop and wait. Changes → change, ask again.
- [x] Set `phase: plan`: change the value line (`grep '^phase:'` prints `phase: plan`).

### Answers

<!-- The interview: per topic the creator's answer, in their words. Keep the topics. -->

- Goal: Stromkreis und elektrischer Strom (Klasse 8): geschlossener Stromkreis, Leiter und Isolatoren, Stromstärke und Spannung (mit Einheiten und Messgeräten), Reihen- und Parallelschaltung, Sicherheit im Umgang mit Strom. Erklärungen in Kapiteln mit Übungen nach jedem Teil, zum Nachlesen und Üben zu Hause.
- Learners: Physik, Klasse 8, Gymnasium in NRW. Vorwissen: einfache Stromkreise mit Batterie und Lampe aus der Grundschule; Stromstärke und Spannung sind neu.
- Model and focus: Kein Vorbild genannt; Schwerpunkt: Erklärungen in Kapiteln mit Übungen nach jedem Teil (guess).
- Hurdles: „Nimm die bekannten aus der Fachdidaktik.“
- Content: Kein eigenes Material; „nimm den Lehrplan als Orientierung“. Der Assistent schreibt den Inhalt aus Quellen.
- Amount: „Entscheide du.“ → 4 Kapitel, 12 Seiten, 3–5 Aufgaben je Seite (guess). Später: Widerstand, ohmsches Gesetz, Wirkungen des Stroms.
- Languages: „Nur Deutsch.“
- Look and feel: „Entscheide du.“ → ruhig wie ein Arbeitsblatt, Dunkelmodus folgt dem Gerät (guess).
- Terms: Stromkreis, Leiter und Isolatoren, Stromstärke, Spannung, Reihenschaltung, Parallelschaltung (Wörter des Erstellers); dazu Amperemeter, Voltmeter. Im Text „Nichtleiter (Isolator)“ (guess).

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Stromkreis und elektrischer Strom
subject: Physik
grades: [8]
summary: Du liest Erklärungen zum Stromkreis, zu Stromstärke und Spannung, zu Reihen- und Parallelschaltung und zur Sicherheit im Umgang mit Strom. Nach jedem Teil übst du mit Aufgaben und bekommst zu jeder Antwort eine Rückmeldung.
strand: physik/elektrizitaetslehre
keywords: [Stromkreis, Strom, Spannung, Stromstärke, Reihenschaltung, Parallelschaltung, Amperemeter, Voltmeter, Elektrizitätslehre]
# url, source, commit, creator: in Commit
```

### Completed

## Plan

<!--
- Map the confirmed content onto the archetype: structure, screens or pages, exercise patterns, data files,
  components.
- No new content questions. A content gap → back to Explore; say so.
- Confirmable in one read. After the yes, work on your own: at most 3 creator turns until the listing.
- Skills: `lernapps-<archetype>-design` and `lernapps-exercise-patterns`, both loaded in Explore.
-->

### Tasks

- [x] `grep '^phase:'` prints `phase: plan`; else set it.
- [x] Map the content as skill `lernapps-<archetype>-design` says; reread it if it is no longer in view.
- [x] Choose a pattern per competency as skill `lernapps-exercise-patterns` says (loaded in Explore; reread it if it
      is no longer in view). Write "Content method".
- [x] Write the Code tasks under "Code": pages or screens, their content, what each shows. Each ends in a commit:
      one task, one commit. Steps too small for a commit of their own → one task.
      The first task: one complete page or screen as the pattern for the others (`early-preview`).
- [x] Each screen, component or interactive exercise: a sketch (static SVG or image, or the steps with what
      learners see after each). Words alone are not enough. Keep sketch files in `.vibe/sketches/`, which `create` leaves alone.
- [x] Show the creator, short: goal, competencies by chapter (chapters along the map's `requires`), entry draft, tasks, sketches; the content method in
      plain words (what learners see and do, what it cannot do). At most 2 questions.
- [x] **Checkpoint:** confirm the plan and the content method, with the sketches shown. Stop and wait for an
      explicit yes. Changes → change, ask again. No `create` before the yes.
- [x] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

- **Seitenaufbau (gleich auf jeder Seite, feste Abschnitts-ids):** `einstieg` (Ziel in Schülersprache und Anknüpfung an Bekanntes), `erklaerung` (Zeichnung mit Text), `beispiel` (Beispiel-Kasten, Schritt für Schritt), `uebung` (3–5 Aufgaben). Ein Abschnitt, den eine Seite nicht braucht, entfällt; die Titel nennen, was der Abschnitt auf dieser Seite tut. Anrede „du“.
- **Übungsmuster** (Name · Kompetenzart · Form · Daten):
  - *Weg verfolgen* · erklären/beurteilen · `single-choice` mit Bild der Schaltung (`material`), Begründung in jeder Option · Beispiel: Welche der drei Schaltungen lässt die Lampe leuchten? · Seiten Stromkreis, Schalter, Reihen-/Parallelschaltung.
  - *Wahr oder falsch mit Grund* · beurteilen · `true-false`, Grund in der Rückmeldung · gezielt auf je eine Fehlvorstellung (siehe Notes).
  - *Zuordnen* · zuordnen/benennen · `matching` · Bauteil ↔ Schaltzeichen ↔ Aufgabe; Stoff ↔ Leiter/Nichtleiter; die Paare stehen in der Aufgabe selbst.
  - *Umrechnen mit Einheit* · berechnen · `generated`, nur mA ↔ A; Fehlermeldungen „Du hast mit 100 statt 1000 gerechnet“, „Du hast in die falsche Richtung umgerechnet“ · Seite Stromstärke.
  - *Skala ablesen* · ablesen · `number` mit Bild einer Skala (ohne Antwort in Bild oder Unterschrift), Toleranz, typische falsche Werte mit Hinweis (Bereich nicht beachtet) · Seiten Stromstärke/Spannung messen. Die Skalen sind eigene Zeichnungen.
  - *Messgerät anschließen* · beurteilen · `single-choice`/`true-false` mit zwei Schaltplänen: Welcher Anschluss ist richtig? Rückmeldung nennt den Folgefehler (Kurzschluss, Gerät zeigt nichts).
  - *Vorhersage und Begründung* · erklären · `single-choice`: „Lampe 1 fällt aus. Was geschieht mit Lampe 2?“, Begründung in jeder Option.
  - *Reihenfolge* · ordnen · nicht verwendet (keine belegte feste Reihenfolge; Erste-Hilfe-Schritte nicht ohne Quelle).
  - *Situation beurteilen* · beurteilen · `multiple-choice` zu Alltagsbildern („Welche Situationen sind gefährlich?“), jede Option mit Grund.
- **Erwartete richtige und falsche Antworten** stehen je Aufgabe in `examples`/`mistakes` (Beispiele als Tests, `success.md`); Aufgaben prüfen die Eigenschaft („ein Leiter“ nimmt jeden Leiter an), nicht eine Musterlösung.
- **Zeichnungen:** eigene SVG in `src/images/` (Lizenz CC BY 4.0, Quelle: eigene Zeichnung), einheitliche Konventionen: Batterie links, Schaltzeichen nach DIN, Pfeil = technische Stromrichtung, Bauteile sichtbar beschriftet. Als `labelled-figure` mit Nummern, wo die Teile erklärt werden.
  - *Schaltplan eines Stromkreises:* Ganzes = der geschlossene Kreis; Nummern = Bauteile; Pfeil = Weg des Stroms; Lernende folgen dem Weg mit dem Finger und finden Lücken; gleich bleibt die Batterie, anders ist die Lage des Schalters. Daraus folgt: Strom fließt nur im geschlossenen Kreis. Die Zeichnung zeigt nicht, ob die Lampe brennt, wenn danach gefragt wird.
  - *Messgerät im Schaltplan:* Ganzes = der Kreis mit Messgerät; Amperemeter im Weg (Reihe), Voltmeter neben dem Bauteil (parallel); Lernende vergleichen zwei Pläne; gleich bleibt der Kreis. Daraus: Amperemeter in Reihe, Voltmeter parallel. Typische Fehllesung: Das Voltmeter „misst, was durchfließt“; der Text nennt sie.
  - *Reihen- und Parallelschaltung:* zwei Zeichnungen mit denselben Teilen nebeneinander; sichtbares Etikett sagt, welche welche ist; Lernende zählen die Wege; daraus: ein Weg → Ausfall unterbricht alles; zwei Wege → Zweige unabhängig. Messwerte (Tabelle `table`) für Stromstärke und Spannung zum Ablesen; Regel wird aus den Werten abgeleitet, nicht vorgegeben.
- **Datendateien:** keine in der ersten Version (Datendateien nutzen nur `generated` und `timeline`; die Umrechnung zieht ihre Werte aus `given`). Schaltzeichen stehen einmal in einer `table` auf der Seite `schaltzeichen`.
- **Komponenten:** keine in der ersten Version (`prefer-built-in-block`): Zeichnungen, Tabellen und Aufgaben der Laufzeit reichen für Lesen und Üben. Eine Schaltungsbaukasten-Komponente wäre eine spätere Erweiterung.
- **Begriffe:** Definitionsblöcke (`definition`) nur für Stromkreis, Leiter, Nichtleiter (Isolator), Stromstärke, Spannung, Amperemeter, Voltmeter, Reihenschaltung, Parallelschaltung; sie erscheinen im Glossar.
- **Neues Kapitel oder neue Seite später:** gleicher Seitenaufbau, Kompetenz-id aus der Karte, Datendatei erweitern, Muster aus dieser Liste wählen; steht dann im Inhaltsleitfaden `app-content`.
- **Voraussetzungen ohne Wiederholungsseite:** keine; alle liegen im Strang und sind eigene Seiten.
- **Scope:** keiner (kein offener Aufgabentyp, kein Material des Erstellers).

### Completed

## Code

<!--
- Build the app from the archetype and the confirmed plan, locally on `work`. Work on your own.
- Commit after each task, literally: one task, one commit, its box ticked in it; the hooks check. Never one commit
  for several tasks: join them into one task in the plan first. A check fails → skill `lernapps-cli`. Fix from the message; never
  bypass a hook.
- Undecidable → choose, mark "(guess)" under "Key decisions", go on.
- Creator asks for a change → first say your reading in one sentence ("Ich nehme alle 44 Hauptgruppenelemente
  auf."); never narrow it silently. Content change → update "Notes" too.
- Skills: `lernapps-cli`, `lernapps-<archetype>`, `lernapps-content-questions`, and the app's content guide
  `app-content`.
-->

### Tasks

- [x] `grep '^phase:'` prints `phase: code`; else set it.
- [x] Load skill `lernapps-cli`. Create the app in this plan's folder as it says. `create` keeps this plan. Never
      write the app by hand.
- [x] Fill the content guide `.agents/skills/app-content/SKILL.md` from "Notes" and "Content method"
      (`app-content-guide`). Keep its nine headings and fill each: Curriculum, Competencies, Content structure,
      Terminology, Exercise patterns, Figures, Sources, Adding a chapter or round, Rules learned from mistakes
      ("None yet." until the first). `grep -c "FILL IN" .agents/skills/app-content/SKILL.md` prints 0. Commit it
      before any content.
- [x] Load skill `lernapps-<archetype>` and the content guide. Questions with options and feedback: also skill
      `lernapps-content-questions`.
- [x] An explainer: decide on `scope` as `references/structure.md` of skill `lernapps-explainer` says. Needed with an
      `open-task` or the creator's material: then `scope` in `src/app.yaml` and on every page
      (`explainer-scope-matches`). Write the choice under "Key decisions".
- [x] Seiten der Muster-Seite: **Kapitel 1, Seite `einfacher-stromkreis`** vollständig (Einstieg, Erklärung mit Schaltplan-Zeichnung, Beispiel, 3–5 Aufgaben), dazu `src/app.yaml` mit `format: 2`, `strand: physik/elektrizitaetslehre`, Kapitel 1; Skizze `.vibe/sketches/01-musterseite-einfacher-stromkreis.svg`. Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Kapitel 1 weiter: Seiten `leiter-nichtleiter`, `schalter`, `schaltzeichen`, `chapter.yaml`. Commit auf `work`.
- [x] Kapitel 2, erster Teil: Seiten `stromstaerke` (mit `generated` mA ↔ A) und `stromstaerke-messen` (Skala ablesen, Anschluss beurteilen). Commit auf `work`.
- [x] Kapitel 2, zweiter Teil: Seiten `spannung` und `spannung-messen`, `chapter.yaml`. Commit auf `work`.
- [x] Kapitel 3: Seiten `reihenschaltung` und `parallelschaltung` mit Vergleichszeichnungen und Messtabellen, `chapter.yaml`. Commit auf `work`.
- [x] Kapitel 4: Seiten `gefahren-des-stroms` und `sicher-mit-strom-umgehen` (Quelle für Sicherheitsaussagen suchen und öffnen), `chapter.yaml`. Commit auf `work`.
- [x] Startseite (`intro`), Glossar aus den Definitionen und Quellenangaben prüfen. Commit auf `work`.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [x] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
      each with the confirmed sketches; each figure in its own image (`npx --no -- lernapps screenshots --desktop`).
      Your tools cannot show an image: check each screen in the browser instead (text, element boxes at both widths),
      write that under "Notes" and tick the box.
- [x] Every box of Explore, Plan and Code ticked.
- [x] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).
      No checkpoint here: set it before you ask or report anything, then start Commit in the same message.

### Completed

## Commit

<!--
- Put the app on GitHub, publish it with the creator's yes, then list it. A push to `main` publishes.
- Open the pull requests (to `main`, to the catalog) without asking: they publish nothing; their preview and result
  are what the creator decides on.
- Skills: `lernapps-explainer-self-assessment` (an explainer), `lernapps-github`, `lernapps-commit`,
  `lernapps-listing`.
-->

### Tasks

- [x] `grep '^phase:'` prints `phase: commit`; else set it.
- [x] An explainer: load skill `lernapps-explainer-self-assessment` (missing → `npx --no -- lernapps skills --archetype
      explainer`). Add the self-assessment as it says, or
      write under "Key decisions" why the app has none. Commit; the hooks check.
- [ ] Load skill `lernapps-github`. Repo and Pages as it says: ask the repo name and every click only the creator can
      make in one message.
- [ ] Push `work`, open the preview pull request, see its checks to green as the skill says.
- [ ] **Checkpoint:** publish. Show what the app does and the preview link from the comment "Vorschau der App"; ask
      whether it may go online; put any open click into the same question. Wait for the yes.
- [ ] Load skill `lernapps-commit`. Publish as skill `lernapps-github` says: `work` into `main` as one squash commit
      with the message from this plan, the run of `Pages` watched to the end.
- [ ] Open the address the job `deploy` printed; confirm the app shows. Use that address, never a derived one.
- [ ] Load skill `lernapps-listing`. Complete the entry draft (e.g. the address).
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it: the listing check and the review read it there.
- [ ] **Checkpoint:** list. Open the listing pull request as the skill says, without asking first: the pull request
      is the review. See it to "bestanden", then show the creator the pull request and its result; change nothing in
      it without their word.
- [ ] Plan changed since its last push → commit it on `main`, push again.

### Completed

## Retrospective

<!-- At the end of Commit, before the listing pull request. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: at most 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, messages or answers, and your choice. "None" if none. -->
