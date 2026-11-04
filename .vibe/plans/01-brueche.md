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
failedChecks: { checks-pass: 4 }
---

# Plan: Brüche verstehen, kürzen und erweitern, erste Fassung

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

*Begonnen am 2026-11-04. Explore, Plan, Code, Commit.*

## Goal

Schülerinnen und Schüler der Klasse 6 (Gymnasium, Hessen) erkunden, was ein Bruch ist, färben Anteile selbst ein und üben anschließend das Kürzen, Erweitern und Vergleichen von Brüchen. Nach jeder Seite folgen Übungen mit Rückmeldung zu typischen Fehlern.

## Key decisions

- Archetyp `explainer`: Die Kinder brauchen Erklärungen, Figuren und eigenes Ausprobieren, dazu Übungen nach jedem Teil; ein reines Quiz reicht laut Ersteller:in nicht, ein Spiel oder Zeitdruck ist nicht gewünscht.
- Ein Kapitel mit etwa sechs Seiten, für ungefähr zwei Wochen Unterricht (Ersteller:in).
- Strang `mathematik/arithmetik`, nur die Bausteine `brueche-begriff` und `brueche-kuerzen-erweitern`; Vergleichen gehört zu Kürzen und Erweitern (Ersteller:in).
- Teilbarkeit (`teilbarkeit`) wird nicht geübt, nur kurz wiederholt: eine Wiederholungsseite ohne Übungen (Ersteller:in: "nur eine kurze Erinnerung").
- Typische Fehler wählt der Assistent (Ersteller:in: "nimm die üblichen"), siehe Notes.
- Nur Deutsch (Ersteller:in).
- Ruhiges Arbeitsblatt-Aussehen der Vorlage, Dunkelmodus folgt dem Gerät (guess).
- Kein `scope`: kein `open-task`, kein eigenes Material der Ersteller:in (guess; wird in Code festgehalten).

## Notes

**Strang:** `mathematik/arithmetik` der Lernlandkarte (https://lernapps.net/apps/map/mathematik.json, gelesen am 2026-11-04). Quelle der Karte: KMK-Bildungsstandards Mathematik ESA und MSA (2022).

**Lehrplan:** Hessen, Gymnasium, Klasse 6 (Ersteller:in). Das Kerncurriculum Mathematik des Hessischen Kultusministeriums konnte nicht abgerufen werden (die versuchten Seiten auf kultusministerium.hessen.de lieferten 404). Status: **nicht geprüft**; keine Einheit wird zitiert. Orientierung sind die Bausteine der Lernlandkarte; das Kerncurriculum wird nachgetragen, sobald die Ersteller:in es liefert oder der Link gefunden ist.

**Kompetenzen nach Kapitel** (Kapitel `brueche`, Wortlaut der Karte):

| Id | Ich kann … | Seiten |
|---|---|---|
| `brueche-begriff` | Ich kann Brüche als Teil eines Ganzen deuten und darstellen. | `anteile-erkennen`, `anteile-darstellen` |
| `brueche-kuerzen-erweitern` | Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen. | `erweitern`, `kuerzen`, `vergleichen` |

Voraussetzungen (`requires`): `brueche-begriff` braucht `natuerliche-zahlen` (Vorwissen, nur Link im Text, guess); `brueche-kuerzen-erweitern` braucht `brueche-begriff` (geübt) und `teilbarkeit` (nicht geübt: Wiederholungsseite `recap: mathematik/teilbarkeit` vor `erweitern`).

**Reihenfolge der Seiten:** `anteile-erkennen`, `anteile-darstellen`, Wiederholung Teilbarkeit, `erweitern`, `kuerzen`, `vergleichen`.

**Wie die Kinder dorthin kommen (herleiten) und welche Fehlvorstellung die Rückmeldung auffängt:**

- `anteile-erkennen`: Ein Ganzes (Rechteck, Kreis) wird in gleich große Teile geteilt; Nenner = Anzahl der gleichen Teile, Zähler = Anzahl der gefärbten Teile. Fehler: ungleich große Teile mitgezählt; Zähler und Nenner vertauscht.
- `anteile-darstellen`: Kinder färben selbst einen Bruch ein und lesen einen Bruch am Zahlenstrahl zwischen 0 und 1 ab. Fehler: Bruch größer, wenn der Nenner größer ist (1/8 gegen 1/4).
- `erweitern`: Jedes Teil wird in gleich viele kleinere Teile geteilt; die gefärbte Fläche bleibt gleich, Zähler und Nenner werden mit derselben Zahl multipliziert. Fehler: nur den Nenner (oder nur den Zähler) multipliziert; addiert statt multipliziert; Glaube, der Bruch werde größer.
- `kuerzen`: Umkehrung: gleich viele Teile zu größeren zusammenfassen, geteilt durch eine gemeinsame Teilerzahl (Teilbarkeitsregeln aus der Wiederholung). Fehler: Zähler und Nenner verschieden geteilt; subtrahiert; nicht vollständig gekürzt.
- `vergleichen`: Zwei Brüche mit gleichem Nenner vergleichen, sonst vorher auf einen gemeinsamen Nenner erweitern, an Streifen und Zahlenstrahl. Fehler: nur Zähler oder nur Nenner vergleichen; größerer Nenner heißt größerer Bruch.

**Fachbegriffe der App:** Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Anteil, erweitern, kürzen, gleichnamig, vollständig gekürzt (guess; die Ersteller:in nannte keine eigenen Wörter).

**Umfang:** drin sind die Bausteine `brueche-begriff` und `brueche-kuerzen-erweitern` mit Brüchen zwischen 0 und 1 und Nennern bis 24; unechte Brüche, gemischte Zahlen, Addieren und Dezimalbrüche sind draußen (eigene Bausteine der Karte, für spätere Fassungen). Die Grenze "bis 24" ist eine Annahme (guess). Sprache: nur Deutsch.

**Quellen:** Es wurde keine zweite Quelle (serlo.org o. ä.) geöffnet; der Fachinhalt ist Schulstoff Klasse 6 und wird nicht aus Quellen übernommen. Status: **nicht geprüft**. Das KMK-PDF der Bildungsstandards wurde nicht gelesen.

**Offene Fragen:** Name der Ersteller:in für den Eintrag; Kerncurriculum Hessen.

## Explore

<!--
- Find out what the app teaches, for whom, how much and how it looks. All content questions belong here; Plan only
  maps the answers onto the archetype.
- Ask. Write no code, run no `create`.
- An answer counts only in the creator's words under "Answers". Never tick a topic you assumed.
- Skills: `lernapps-app`, `lernapps-exercise-patterns`, `lernapps-<archetype>-design`, `lernapps-content-research`.
-->

### Tasks

### Answers

- Goal: "Die App soll erklären, was ein Bruch ist, und wie man Brüche kürzt und erweitert. Nach jedem Teil sollen Übungen kommen. Die Kinder sollen Anteile sehen und selbst ausprobieren können. Nur ein Quiz wäre mir zu wenig, ich möchte Erklärungen mit Übungen."
- Learners: "für meine Klasse 6 (Gymnasium, Hessen)". "Teilbarkeit haben wir gerade gemacht."
- Model and focus: keine Angabe; Fokus laut Ersteller:in: Erklärungen, Anteile sehen, selbst ausprobieren, Übungen nach jedem Teil. Kein Katalog-Vorbild genannt (guess).
- Hurdles: "Bei den typischen Fehlern entscheide du, nimm die üblichen." Gewählt: siehe Notes (guess).
- Content: keine Angabe zu eigenem Material; der Assistent schreibt die Inhalte (guess).
- Amount: "nur die zwei Bausteine, ein Kapitel mit ein paar Seiten, etwa für zwei Wochen Unterricht. Vergleichen gehört zum Kürzen und Erweitern dazu. Teilbarkeit haben wir gerade gemacht, da reicht eine kurze Erinnerung."
- Languages: "Sprache: Deutsch." Nur Deutsch.
- Look and feel: keine Angabe (guess: ruhig wie ein Arbeitsblatt; Dunkelmodus folgt dem Gerät).
- Terms: keine Angabe (guess: Bruch, Zähler, Nenner, Ganzes, Anteil, erweitern, kürzen).
- Entry: "Ersteller: Frau Keller. Die Suchwörter passen. Einen Link zum Kerncurriculum habe ich nicht, ohne geht es."

### Entry draft

```yaml
title: Brüche verstehen, kürzen und erweitern
subject: Mathematik
grades: [6]
summary: >-
  Die Kinder lernen, was ein Bruch ist, färben Anteile selbst ein und üben das Erweitern, Kürzen und Vergleichen
  von Brüchen. Nach jeder Erklärung folgen Übungen mit Rückmeldung zu typischen Fehlern.
keywords: [Bruch, Brüche, Bruchteil, Zähler, Nenner, kürzen, erweitern, Bruchrechnung, Klasse 6]
strand: mathematik/arithmetik
creator: Frau Keller
```

Noch offen im Eintrag: `url`, `source`, `commit`, `fitness` (Name der Ersteller:in bzw. Commit-Phase).

### Completed

- [x] The skills of the phases are in `.agents/skills/`; Branch `work`.
- [x] Load skill `lernapps-app`; erklärt: kostenlos, öffentlich, eigene Adresse, später Kopie auf lernapps.net.
- [x] Interview: "Goal" und "Learners".
- [x] Load skill `lernapps-exercise-patterns`, Muster Mathematik gelesen.
- [x] Archetype gewählt: `explainer`, Grund unter "Key decisions"; `archetype: explainer` gesetzt.
- [x] Skills des Archetyps installiert; `lernapps-explainer-design` geladen.
- [x] Interview: übrige Themen; Antworten oder "(guess)" eingetragen.
- [x] Load skill `lernapps-content-research`; Lernlandkarte gelesen, Strang und Kompetenz-Ids in "Notes". Lehrplan Hessen: nicht geprüft.
- [x] Pro Kompetenz: Herleitung und Fehlvorstellung in "Notes".
- [x] Umfang in "Notes".
- [x] Entry-Schema gelesen; "Entry draft" gefüllt, Suchwörter und Ersteller:in ("Frau Keller") bestätigt.
- [x] **Checkpoint:** research bestätigt ("Ja, passt so"); Kerncurriculum Hessen bleibt nicht geprüft, kein Link vorhanden.
- [x] `phase: plan` gesetzt.

## Plan

<!--
- Map the confirmed content onto the archetype: structure, screens or pages, exercise patterns, data files,
  components.
- No new content questions. A content gap → back to Explore; say so.
- Confirmable in one read. After the yes, work on your own: at most 3 creator turns until the listing.
- Skills: `lernapps-<archetype>-design` and `lernapps-exercise-patterns`, both loaded in Explore.
-->

### Tasks

- [ ] **Checkpoint:** confirm the plan and the content method, with the sketches shown. Stop and wait for an
      explicit yes. Changes → change, ask again. No `create` before the yes.
- [ ] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

**Aufbau:** Ein Kapitel `brueche` mit sechs Seiten, jede mit den Abschnitten `einstieg` (Vorwissen, Alltag), `erklaerung` (Figur und Regel, als "Anschaulich erklärt" betitelt, wo es nur eine Figur ist), `beispiel` (ein `example`-Kasten) und `uebung`. Anrede "du", kurze Sätze.

**Muster (Übungen):**

- *Anteil ablesen* (benennen, deuten): Figur gegeben (Streifen oder Kreis, `image` SVG je Aufgabe aus Datei `src/data/anteile.yaml`), Frage "Welcher Bruch ist gefärbt?" als `single-choice`; falsche Optionen sind echte Fehler (Zähler und Nenner vertauscht; ungleiche Teile mitgezählt), je mit Begründung.
- *Bruch einfärben* (darstellen): Komponente `bruchfeld`, siehe unten.
- *Bruch am Zahlenstrahl* (ablesen): `image` SVG mit 0 und 1 beschriftet, `number`-Frage nach Zähler; Beispiele aus der Datei.
- *Erweitern, Kürzen* (rechnen): `generated`, Aufgabe zieht einen Datensatz aus `src/data/bruchpaare.yaml` (`pick: 1`), der jede Zahl der Schritte enthält (a, b, k, Ergebnis). Antwort als zwei Eingaben (Zähler, Nenner) oder ein Bruch; Fehlermeldungen (`mistakes`): nur Nenner multipliziert, addiert statt multipliziert, Zähler und Nenner durch verschiedene Zahlen geteilt, nicht vollständig gekürzt ("6/12 durch 2 ist 3/6: geht noch weiter, beide durch 3 teilbar"). Schritte nennen den Grund ("6 und 48 sind beide durch 6 teilbar").
- *Vergleichen* (ordnen/vergleichen): `generated` mit Datensatz aus `src/data/vergleiche.yaml` (beide Brüche, gemeinsamer Nenner, erweiterte Zähler); Antwort "<", ">" oder "=" als `single-choice` der Aufgabe; typischer Fehler: größerer Nenner heißt größerer Bruch, nur Zähler vergleichen.
- *Wahr oder falsch mit Grund* (urteilen): `true-false` nach "Erweitern ändert den Wert" und ähnlich.

**Daten:** `src/data/anteile.yaml` (Ganzes, Teile, gefärbt), `bruchpaare.yaml` (Brüche mit Erweiterungs- oder Kürzungszahl, Nenner bis 24), `vergleiche.yaml`. Jede Tatsache einmal.

**Figuren:** Alle Streifen und Rechtecke als SVG-`image`, vom Assistenten gezeichnet (eigene Arbeit, Lizenz CC BY 4.0), mit `alt` und Beschriftung. Einheitliche Farbe für gefärbte Teile, Streifen immer gleich lang (gleiches Ganzes), Beschriftungen "vorher" und "erweitert mit 2". Das `hundred-grid` wird nicht benutzt (nur für Hundertstel). Kein Bild verrät die Antwort einer Aufgabe.

**Komponenten (nur wo kein Block passt, `prefer-built-in-block`):**

1. `bruchfeld` (Seite `anteile-darstellen`, Übung): Das Ganze ist ein Streifen mit n gleich großen Teilen (n aus der Aufgabe, 2 bis 12). Ein Klick färbt ein Teil, noch ein Klick macht es wieder weiß; "Prüfen" vergleicht die Zahl der gefärbten Teile mit dem Zähler. Es ändert sich nur die Färbung; der Streifen und n bleiben gleich. Unter dem Streifen steht kein Zähler (`explainer-figure-hides-answer`); nach "Prüfen" zeigt die Rückmeldung den Bruch. Fehler: zu viele oder zu wenige gefärbt (Rückmeldung nennt, ob zu wenig oder zu viel). Es kann nicht: Kreise, mehrere Ganze, Brüche größer als 1. Logik-Modul, Test, `nojs`-Text, Tutor-Deklaration (`template`, `params`, `mistakes`, `show`).
2. `faktorstreifen` (Seiten `erweitern` und `kuerzen`, zum Ausprobieren, keine Aufgabe): Zwei Streifen untereinander, oben der gegebene Bruch (z. B. 3/4), unten derselbe Streifen feiner (Regler "Erweiterungszahl" 1 bis 6, auf `kuerzen` "Kürzungszahl" und der Streifen wird gröber). Das Ganze, die Länge und die gefärbte Länge bleiben gleich; Zähler und Nenner unten ändern sich. Daran sehen die Kinder: Der Wert bleibt, nur die Teile ändern sich. Start: Faktor 1, beide Streifen gleich. Die Kürzungszahl bietet nur Teiler an, die beide Zahlen teilen. Es kann nicht: Aufgaben prüfen (das tun die `generated`-Übungen). Logik-Modul, Test, `nojs`-Text (als Tabelle 3/4 = 6/8 = 9/12).

**Wie ein späterer Assistent ein Kapitel ergänzt:** neue Seite `src/brueche/<seite>.yaml` mit denselben Abschnittsids, in `chapter.yaml` eintragen; Datensätze in die Datei, Muster aus dem Inhaltsleitfaden `app-content`.

**Voraussetzungen der Seiten:** `anteile-erkennen` braucht `natuerliche-zahlen` (nicht geübt: Link im Text auf https://lernapps.net/apps/map/mathematik/c/natuerliche-zahlen/); `erweitern` braucht `teilbarkeit` (nicht geübt: Wiederholungsseite `recap: mathematik/teilbarkeit` davor).

**Selbsteinschätzung:** In Commit entscheiden (Kapitel mit 5 geübten Seiten; wird voraussichtlich hinzugefügt).

### Completed

- [x] `phase: plan` gesetzt.
- [x] Inhalt auf den Archetyp abgebildet (Kapitel `brueche`, sechs Seiten).
- [x] Muster pro Kompetenz gewählt, "Content method" geschrieben.
- [x] Code-Aufgaben unter "Code" geschrieben, erste Aufgabe = Musterseite.
- [x] Skizzen in `.vibe/sketches/` (`anteile-erkennen-figur.svg`, `bruchfeld-komponente.svg`, `faktorstreifen-komponente.svg`) und Schritte unten.
- [x] Der Ersteller:in kurz gezeigt (Ziel, Kompetenzen, Eintrag, Aufgaben, Skizzen, Methode).

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


### Completed

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
- [x] Muster: Seite `anteile-erkennen` komplett (Kapitel `brueche`, `src/app.yaml`, `chapter.yaml`): Einstieg mit Pizza und Schokolade, Figur "Das Ganze, gleich große Teile, gefärbte Teile" (Skizze `anteile-erkennen-figur.svg`), Definition Zähler und Nenner, ein Beispiel, Übung mit `single-choice` und Zahlenaufgaben. Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Komponente `bruchfeld` (Logik, Test, `nojs`-Text, Tutor-Deklaration; Skizze `bruchfeld-komponente.svg`) und Seite `anteile-darstellen` mit Zahlenstrahl-Bild. Commit.
- [x] Wiederholungsseite `teilbarkeit-wiederholt` (`recap: mathematik/teilbarkeit`, ohne Übung). Commit.
- [x] Komponente `faktorstreifen` (Logik, Test, `nojs`-Text; Skizze `faktorstreifen-komponente.svg`) und Seite `erweitern` mit `generated`-Übungen aus `bruchpaare.yaml`. Commit.
- [x] Seite `kuerzen` (nutzt `faktorstreifen`, `generated` mit Fehlermeldungen). Commit.
- [x] Seite `vergleichen` (`generated` aus `vergleiche.yaml`). Commit.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [x] Look at a screenshot (NICHT visuell geprüft: der Assistent kann Bilder nicht ansehen, die Ersteller:in verzichtet auf die Sichtung; ersetzt durch Browsertest bei 360 px ohne Überlauf, Bedienung der Bauteile geprüft). Compare
      each with the confirmed sketches; each figure in its own image (`npx --no -- lernapps screenshots --desktop`).
- [x] Every box of Explore, Plan and Code ticked.
- [x] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).
      No checkpoint here: set it before you ask or report anything, then start Commit in the same message.

## Commit

<!--
- Put the app on GitHub, publish it with the creator's yes, then list it. A push to `main` publishes.
- Open the pull requests (to `main`, to the catalog) without asking: they publish nothing; their preview and result
  are what the creator decides on.
- Skills: `lernapps-explainer-self-assessment` (an explainer), `lernapps-github`, `lernapps-commit`,
  `lernapps-listing`.
-->

### Tasks

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

- [x] An explainer: load skill `lernapps-explainer-self-assessment` (missing → `npx --no -- lernapps skills --archetype
      explainer`). Add the self-assessment as it says, or
      write under "Key decisions" why the app has none. Commit; the hooks check. (Selbsteinschätzung im Kapitel `brueche` hinzugefügt: 4 Schritte, 10 Übungen.)
- [x] `grep '^phase:'` prints `phase: commit`; else set it.
## Retrospective

<!-- At the end of Commit, before the listing pull request. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: at most 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, messages or answers, and your choice. "None" if none. -->
