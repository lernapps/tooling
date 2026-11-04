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

# Plan: Stromkreis und elektrischer Strom (Klasse 8), erste Fassung

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

*Started 2026-11-04. Explore, Plan, Code, Commit.*

## Goal

Schülerinnen und Schüler der Klasse 8 lesen kurze Erklärungen mit Schaltplänen und üben danach: Sie bauen den geschlossenen Stromkreis gedanklich auf, unterscheiden Leiter und Isolatoren, erklären und messen Stromstärke (A) und Spannung (V), vergleichen Reihen- und Parallelschaltung und kennen die Regeln für den sicheren Umgang mit Strom.

## Key decisions

- Archetype `explainer`: Kapitel mit Seiten, die erklären, und Übungen auf jeder Seite; passt zu "Erklärungen in Kapiteln, Übungen nach jedem Teil, zum Nachlesen und Üben zu Hause". Kein Zeitdruck, keine Simulation zum freien Schaltungsbau.
- Strang `physik/elektrizitaetslehre` der Lernlandkarte; Format 2.
- Nur Deutsch. Ruhig wie ein Arbeitsblatt (Look der Runtime), viele Übungen und gezeichnete Schaltpläne.
- Begriffe: "Leiter" und "Isolator" ("Nichtleiter" im Glossar als anderes Wort); "Stromstärke" für die Größe, "Strom" nur für das Phänomen.
- Umfang: Klasse-7/8-Kompetenzen der Karte (Stromstärke, Spannung, Messen) plus die Grundlagen aus 5/6, weil die Seiten sie üben sollen. Nicht dabei: Widerstand, ohmsches Gesetz, Rechnen in Schaltungen, Leistung/Energie (Klasse 9/10 der Karte).
- Selbsteinschätzung: in jedem Kapitel (2 Schritte mit 3 bis 4 Übungen, zusammen 32 Aufgaben für die App; mehr als die üblichen 15 bis 20, weil jede Seite abgefragt wird).
- Reihen- und Parallelschaltung: die Karte hat für Klasse 8 nur den Aufbau (reihenschaltung, parallelschaltung). Das Messen von Stromstärke und Spannung in diesen Schaltungen kommt auf eigene Seiten, die dieselbe Kompetenz tragen (eine große Kompetenz darf mehrere Seiten haben). Die fehlende Karten-Kompetenz "Stromstärke und Spannung in Reihen- und Parallelschaltung messen und vergleichen" (Klasse 7-8) wird dem Katalog vorgeschlagen (lernapps/apps, map/physik.yaml). (guess)
- Stromrichtung: technische Stromrichtung (Plus nach Minus) als Festlegung erklärt. (guess: Deutung der Fehlvorstellung "Strom fließt nur von Plus zu Minus")
- `scope` wird nicht gesetzt (keine offene Aufgabe, kein Material der Lehrkraft).

## Notes

**Strang:** `physik/elektrizitaetslehre` (https://lernapps.net/apps/map/physik.json, geöffnet und gelesen am 2026-11-04). Quelle der Karte: KMK, Weiterentwickelte Bildungsstandards Physik (MSA), 2024.

**Lehrplan:** Kernlehrplan Physik NRW, Gymnasium: nicht geprüft (die Seite von QUA-LiS lieferte keinen lesbaren Zugang). Die KMK-PDF ist erreichbar (HTTP 200), aber hier nicht gelesen: nicht geprüft. Orientierung bis zur Prüfung: die Lernlandkarte.

**Kapitel und Seiten** (Reihenfolge nach `requires`; Seiten-id (Kompetenz-id)):

1. Der Stromkreis (`stromkreis`)
   - `einfacher-stromkreis` (einfacher-stromkreis): Ich kann einen einfachen Stromkreis aus Batterie, Lampe und Kabeln aufbauen und erklären, warum er geschlossen sein muss.
   - `schalter` (schalter): Ich kann erklären, wie ein Schalter einen Stromkreis öffnet und schließt.
   - `leiter-isolator` (leiter-nichtleiter): Ich kann Leiter und Nichtleiter unterscheiden und Beispiele nennen.
   - `schaltplan` (schaltzeichen): Ich kann einen Stromkreis als Schaltplan mit Schaltzeichen zeichnen und einen Schaltplan lesen.
2. Stromstärke (`stromstaerke`)
   - `stromstaerke` (stromstaerke): Ich kann die Stromstärke als Maß dafür erklären, wie viel Strom fließt, und sie in Ampere angeben.
   - `amperemeter` (stromstaerke-messen): Ich kann die Stromstärke mit einem Amperemeter richtig messen.
3. Spannung (`spannung`)
   - `spannungsquellen` (spannungsquellen): Ich kann Spannungsquellen wie Batterie, Netzgerät und Steckdose nennen und sagen, wofür sie sich eignen.
   - `spannung` (spannung): Ich kann die Spannung als Antrieb des Stroms erklären und sie in Volt angeben.
   - `voltmeter` (spannung-messen): Ich kann die Spannung mit einem Voltmeter richtig messen.
4. Reihen- und Parallelschaltung (`schaltungen`)
   - `reihenschaltung` (reihenschaltung): Ich kann eine Reihenschaltung aufbauen und erklären, was passiert, wenn ein Bauteil ausfällt.
   - `reihenschaltung-messen` (reihenschaltung): Stromstärke und Spannungen in der Reihenschaltung messen und vergleichen (ablesen und vergleichen, kein Rechnen mit Widerstand).
   - `parallelschaltung` (parallelschaltung): Ich kann eine Parallelschaltung aufbauen und erklären, was passiert, wenn ein Zweig ausfällt.
   - `parallelschaltung-messen` (parallelschaltung): dasselbe für die Parallelschaltung.
5. Sicherheit (`sicherheit`)
   - `gefahren` (gefahren-des-stroms): Ich kann erklären, warum Strom aus der Steckdose gefährlich ist und Strom aus einer Batterie nicht.
   - `regeln` (sicher-mit-strom-umgehen): Ich kann Regeln für den sicheren Umgang mit Strom nennen und anwenden.

Alle `requires` der Seiten liegen in der App (keine Recap-Seiten nötig).

**Wie Lernende zur Kompetenz kommen / welche Fehlvorstellung die Rückmeldung fängt** (Nummern wie unter "Hurdles"):
- einfacher-stromkreis: Schaltplan mit Stromweg; Lernende verfolgen den Weg Batterie-Lampe-Batterie und finden die Unterbrechung. Fängt "Ein Kabel zur Lampe reicht".
- schalter: Zustände offen/geschlossen am Schaltplan; Lernende sagen vorher, ob die Lampe leuchtet.
- leiter-nichtleiter: Tabelle von Stoffen aus einer Datei; Zuordnen mit Begründung (kein Atommodell, das ist Klasse 9/10). Fängt "Wasser leitet nie", "Nur glänzende Stoffe leiten".
- schaltzeichen: Zuordnen Zeichen-Bauteil; Schaltplan lesen und den Zustand der Lampen vorhersagen.
- stromstaerke: Einheit A und mA, Umrechnung als erzeugte Aufgabe. Fängt (1) und (4): im unverzweigten Kreis ist die Stromstärke an jeder Stelle gleich; die Richtung ist eine Festlegung.
- amperemeter: Schaltplan mit zwei Messstellen; Lernende wählen die richtige (in Reihe, Kreis auftrennen); Skala ablesen. Fängt (2).
- spannungsquellen: Tabelle typischer Spannungen aus einer Datei; Zuordnen. Fängt (5): die Quelle liefert Spannung, die Stromstärke folgt aus dem Verbraucher.
- spannung: Wasserkreislauf-Vergleich als Bild mit Grenzen; V, mV, kV als erzeugte Aufgabe. Fängt "Spannung fließt" und (5).
- voltmeter: Schaltplan, Anschluss parallel, Skala ablesen. Fängt "Voltmeter in Reihe" (Umkehrung von 2).
- reihenschaltung: Aufbau, Ausfall eines Bauteils. Fängt "Nur die defekte Lampe geht aus".
- reihenschaltung-messen: Messwert-Tabelle: Stromstärke überall gleich, Spannungen verteilen sich. Fängt (1), (4).
- parallelschaltung: Aufbau, Ausfall eines Zweigs. Fängt "Alle Lampen gehen aus".
- parallelschaltung-messen: Messwert-Tabelle: an jedem Zweig dieselbe Spannung, Zweigströme ergeben die Gesamtstromstärke. Fängt (3), (5).
- gefahren-des-stroms: Vergleich Batterie (1,5 V) und Steckdose (230 V) als Tabelle; Wirkung auf den Körper nur qualitativ, keine Zahlen ohne geprüfte Quelle.
- sicher-mit-strom-umgehen: Situationen beurteilen (Wahr/Falsch mit Begründung). Fängt "Ausgeschaltet heißt immer sicher".

**Umfang:** In: Stromkreis, Leiter/Isolator, Schaltplan, Stromstärke, Spannung, Messgeräte, Reihen- und Parallelschaltung (Aufbau und Messen), Sicherheit. Aus: Widerstand und Rechnen (Klasse 9/10 der Karte, braucht das ohmsche Gesetz), Wärme-/Licht-/Magnetwirkung, Ladungsmodell (Klasse 9/10), Leistung/Energie. Wertebereich: Stromstärken von mA bis wenige A, Spannungen von 1,5 V bis 230 V. Sprache: Deutsch.

**Zweite Quellen** (am 2026-11-04 geöffnet; Fakten, keine Sätze; CC BY-SA, daher nichts kopieren):
- Wikipedia "Stromkreis" https://de.wikipedia.org/wiki/Elektrischer_Stromkreis: verifiziert (lädt, Artikel selbst)
- Wikipedia "Leiter (Physik)" https://de.wikipedia.org/wiki/Elektrischer_Leiter: verifiziert
- Wikipedia "Schaltzeichen" https://de.wikipedia.org/wiki/Schaltzeichen: verifiziert
- Wikipedia "Elektrische Stromstärke" https://de.wikipedia.org/wiki/Elektrische_Stromst%C3%A4rke: verifiziert
- Wikipedia "Elektrische Spannung" https://de.wikipedia.org/wiki/Elektrische_Spannung: verifiziert
- Wikipedia "Reihenschaltung" und "Parallelschaltung": die Seiten laden; Inhalt noch nicht gegen die Seiten gelesen: nicht geprüft
- Sicherheit: Quelle noch offen (der erste Versuch, 404); bis dahin keine Zahlen zu Körperströmen.
- Videos: keine ausgewählt.
- Sicherheit (Kapitel 5): Wikipedia "Stromunfall" https://de.wikipedia.org/wiki/Stromunfall, am 2026-11-04 geöffnet und gelesen: verifiziert. Daraus die Richtwerte (Loslassschwelle etwa 10 mA, Herzrhythmusstörungen ab etwa 25 mA, etwa 50 mA lebensgefährlich), die häufigen Ursachen und die Freileitungen. Nicht aus der Quelle: "Notruf 112 und Strom ausschalten" (allgemeine Erste-Hilfe-Regel); vom Ersteller bestätigt.

**Prüfung der Bildschirme (Code):** Meine Werkzeuge können kein Bild anzeigen. Statt der Bilder habe ich jede der 15 Seiten, die Startseite, die Kapitelseiten, das Glossar und eine Tutorseite im Browser (Playwright) bei 1280 px und 360 px geprüft: Text, Alt-Texte, Größe der Elemente, kein waagrechter Überlauf, alle Bilder geladen, keine Konsolenfehler. Zwei Unteragenten haben vier Seiten als Lernende durchgespielt (ohne Bilder zu sehen); ihre Funde sind eingearbeitet. Die gezeichneten Abbildungen (SVG) sind **nicht mit dem Auge geprüft**. Das muss die Lehrkraft vor der Veröffentlichung tun.

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

- Goal: Stromkreis und elektrischer Strom: geschlossener Stromkreis, Leiter und Isolatoren, Stromstärke und Spannung (mit Einheiten und Messgeräten), Reihen- und Parallelschaltung, Sicherheit im Umgang mit Strom. Erklärungen in Kapiteln, Übungen nach jedem Teil, zum Nachlesen und Üben zu Hause.
- Learners: Physik, Klasse 8, Gymnasium in NRW. Einfache Stromkreise mit Batterie und Lampe kennen sie aus der Grundschule; Stromstärke und Spannung sind neu.
- Model and focus: kein Vorbild genannt; Schwerpunkt: Übungen und Abbildungen (Schaltpläne).
- Hurdles: (1) "Strom wird in der Lampe verbraucht"; (2) "Das Amperemeter misst man parallel"; (3) "In der Parallelschaltung teilt sich die Spannung auf"; (4) "Strom fließt nur von Plus zu Minus und verbraucht sich auf dem Weg"; (5) "Eine Batterie liefert immer gleich viel Strom". Keine eigenen Versuche genannt.
- Content: Kein eigenes Material; der Lehrplan dient als Orientierung.
- Amount: (guess) 15 Seiten in 5 Kapiteln, je Seite eine Kompetenz, 4 bis 6 Aufgaben (Auswahl, Wahr/Falsch, Zuordnen, Reihenfolge, Zahl mit Einheit, erzeugte Aufgaben wo Zahlen passen). Später: Widerstand und ohmsches Gesetz, Rechnen in Schaltungen.
- Languages: Nur Deutsch.
- Look and feel: Ruhig wie ein Arbeitsblatt, aber mit genug Übungen und Abbildungen (Schaltpläne).
- Terms: "Leiter" und "Isolator" (Nichtleiter im Glossar), "Stromstärke" (nie nur "Strom" für die Größe), "Spannung", "Stromkreis", "Schaltplan", "Reihenschaltung", "Parallelschaltung".

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Stromkreis und elektrischer Strom
subject: Physik
grades: [8]
summary: >-
  Lernende der Klasse 8 lesen kurze Erklärungen mit Schaltplänen und üben danach: Stromkreis, Leiter und Isolator,
  Stromstärke und Spannung mit ihren Messgeräten, Reihen- und Parallelschaltung und Sicherheit im Umgang mit Strom.
strand: physik/elektrizitaetslehre
keywords: [Stromkreis, Stromstärke, Spannung, Reihenschaltung, Parallelschaltung, Schaltplan, Amperemeter, Voltmeter, Elektrizitätslehre]
creator:
  name: Frau Brandt
# offen: url, source, commit, fitness (kommen in Commit)
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

**Seitenaufbau** (gleich auf jeder Seite, Abschnitts-ids fest, Titel passend zur Seite): `einstieg` (Alltagssituation, ein Satz zum Ziel), `erklaerung` (Text, Schaltplan, Merkkasten als `definition`), `beispiel` (`example`-Kasten, Schritt für Schritt), `uebung` (4 bis 6 Aufgaben, vom Erkennen zum Anwenden). Skizze: `.vibe/sketches/seitenaufbau.svg`.

**Aufgabenmuster:**
- *Weg verfolgen / Unterbrechung finden* (einfacher-stromkreis, schalter, reihenschaltung, parallelschaltung): Schaltplan als Bild (feste Datei je Aufgabe), `single-choice` "Wo ist der Kreis unterbrochen?" oder "Leuchtet die Lampe?"; jede falsche Option mit `info` und dem Grund.
- *Zuordnen aus Datensatz* (leiter-nichtleiter, schaltzeichen, spannungsquellen): `matching` und `true-false`; Fakten einmal in `src/data/stoffe.yaml`, `bauteile.yaml`, `spannungsquellen.yaml`, als `table` gezeigt und in Aufgaben benutzt.
- *Umrechnen mit Einheit* (stromstaerke: A/mA, spannung: V/mV/kV): `generated`, Zahl mit Einheit, `mistakes` "mal 100 statt mal 1000", "falsche Richtung", `hint`, `steps`; Werte realistisch (Taschenlampe 0,3 A, Steckdose 230 V).
- *Messgerät richtig anschließen* (amperemeter, voltmeter): Bild mit zwei oder drei beschrifteten Messstellen (`labelled-figure` mit Markern A, B, C), `single-choice` "Wo schließt du das Messgerät an?"; Info je falscher Option: Amperemeter parallel = Kurzschluss/falsche Messung, Voltmeter in Reihe.
- *Skala ablesen* (amperemeter, voltmeter): feste Bilder von Zeigermessgeräten (Zeiger gezeichnet), `number` mit Einheit und Toleranz; Skala mit Bereich im Bild.
- *Messwerte vergleichen* (reihenschaltung-messen, parallelschaltung-messen): `table` mit Messwerten; `single-choice`/`true-false`: "Wie groß ist I an Stelle 3?", "Was fällt auf?"; Entdecken statt Rechnen, ohne Widerstand.
- *Situationen beurteilen* (gefahren, regeln): `true-false` mit Begründung in der `explanation`, `multiple-choice` "Welche Regeln gelten?".
- *Erklären* (stromstaerke, spannung, parallelschaltung-messen): `single-choice` mit plausiblen falschen Erklärungen, je mit Hintergrund (Fehlvorstellungen 1 bis 5).

**Abbildungen:** eigene SVG-Zeichnungen in `src/images/`, Quelle "eigene Zeichnung", Lizenz CC-BY-4.0, eine Zeichensprache für die ganze App: Schaltzeichen nach DIN EN 60617 in einfacher Form, Leitungen schwarz, Pfeil = technische Stromrichtung, Messgeräte als Kreis mit A beziehungsweise V, Beschriftungen auf Deutsch, Einheiten immer dabei; kein Farbcode als einzige Information. Jedes Bild hat `alt` (Zustand und Stromweg in Worten) und `caption` (worauf man achtet). Bilder zeigen das Gegebene, nie die Antwort. Wirken bei 360 px (Viewbox, keine Schrift unter 12 px).

**Lernhandlung je Abbildung** (Regel `explainer-representation-explained`):
- *Schaltplan des einfachen Stromkreises* (`stromkreis-schaltplan.svg`): Das Ganze ist ein geschlossenes Rechteck aus Batterie, Lampe und Leitungen. Das Plus-/Minus-Zeichen der Batterie und der Pfeil zeigen die festgelegte Stromrichtung. Lernende verfolgen den Pfeil mit dem Finger einmal rundherum und finden dabei jede Stelle, an der der Weg enden könnte. Gleich bleibt: der Weg ist ohne Lücke; so folgt "der Kreis muss geschlossen sein".
- *Schaltplan mit Messstellen* (`messstellen.svg`): Das Ganze ist der Stromkreis; die gestrichelten Kästen A und B sind mögliche Stellen für das Messgerät. Lernende wählen die Stelle, an der das Gerät im Stromweg liegt (Amperemeter) oder daneben (Voltmeter). Gleich bleibt: der Stromkreis; so folgt, dass das Amperemeter "in Reihe" in den Weg gehört.
- *Zeigermessgerät mit Skala*: Das Ganze ist die Skala mit Bereich; die Striche und Zahlen zeigen die Stufen, der Zeiger den Wert. Lernende lesen Zeigerstand und Einheit ab und beachten den Bereich. Gleich bleibt: die Skala; so folgt "Wert = Strich mal Skalenteil".
- *Schaltplan Reihen-/Parallelschaltung mit Messstellen 1 bis 3*: Das Ganze ist die Schaltung, die Zahlen sind Messstellen, die Tabelle daneben hat die Messwerte. Lernende ordnen Messwerte den Stellen zu und vergleichen. Gleich bleibt: die Schaltung; so folgt die Regel (Reihe: I gleich; parallel: U gleich).
- Kein Bauteil ohne Wirkung: Bedienelemente (Regler, Knöpfe) gibt es in der ersten Fassung nicht.

**Datendateien:** keine in der ersten Fassung (die Fakten stehen je einmal in der Tabelle der Seite, die sie erklärt; `matching` und `generated` brauchen keine Datei). Geändert in Code, weil `table` keine Datendatei liest.

**Komponenten:** keine in der ersten Fassung (Skala ablesen und Messstelle wählen laufen über feste Bilder und Auswahl/Zahl). Grenze: Lernende bauen keine eigene Schaltung; nicht möglich ohne Komponente (später als Erweiterung, Hinweis an die Vorlagen, falls gewünscht).

**Erzeugte Aufgaben:** mA↔A, mV/kV↔V, Messwert ablesen in Reihenschaltung (aus Datensatz mit den Werten). Rest feste Fragen.

**Neues Kapitel oder neue Seite später:** Ordner in `src/`, `chapter.yaml`, in `src/app.yaml` eintragen, Seite nach dem Aufbau oben, Kompetenz-id aus der Karte, eigene Bilder in der Zeichensprache oben, Aufgaben nach den Mustern oben; steht in `.agents/skills/app-content/SKILL.md`.

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
- [x] Das Muster: Seite `stromkreis/einfacher-stromkreis` vollständig (Einstieg, Erklärung mit Schaltplan `stromkreis-schaltplan.svg`, Merkkasten, Beispiel, 5 Aufgaben), dazu `src/app.yaml` (Titel, Einleitung, Quellen) und `chapter.yaml` des ersten Kapitels; Skizze `.vibe/sketches/seitenaufbau.svg`; commit on `work`
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Kapitel 1 fertig: Seiten `schalter`, `leiter-isolator` (mit `stoffe.yaml`), `schaltplan` (mit `bauteile.yaml`); commit
- [x] Kapitel 2: Seiten `stromstaerke` (erzeugte Aufgaben A/mA) und `amperemeter` (Bild `messstellen.svg`, Skalen ablesen); commit
- [x] Kapitel 3: Seiten `spannungsquellen` (mit `spannungsquellen.yaml`), `spannung` (erzeugte Aufgaben V/mV/kV), `voltmeter`; commit
- [x] Kapitel 4: Seiten `reihenschaltung`, `reihenschaltung-messen`, `parallelschaltung`, `parallelschaltung-messen`; commit
- [x] Kapitel 5: Seiten `gefahren` und `regeln`, erst nachdem eine geprüfte Quelle für die Sicherheitsaussagen geöffnet und in "Notes" eingetragen ist; commit
- [x] Glossar und Querverweise (Begriffe, "Nichtleiter" als anderes Wort), Lesbarkeit und Rückmeldungen zu den Fehlvorstellungen 1 bis 5 auf allen Seiten gegengeprüft; commit
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
