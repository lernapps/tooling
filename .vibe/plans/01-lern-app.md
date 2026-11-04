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
failedChecks: { checks-pass: 3 }
---

# Plan: Brüche verstehen, erweitern und kürzen, first version

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

Kinder der Klasse 6 (Gymnasium Hessen) lesen zuhause nach und üben: Sie deuten Brüche als Anteile eines Ganzen, probieren Anteile selbst aus, erweitern und kürzen Brüche und vergleichen sie.

<!-- 1–2 sentences: what learners do, what they learn. -->

## Key decisions

- Selbsteinschätzung: ein Schritt je Inhaltsseite (3, 4, 3 Aufgaben), gewürfelte Aufgaben und die Komponente bevorzugt (guess: Aufgabenauswahl).
- Archetype `explainer`: Kinder brauchen erst Erklärungen und Bilder (Anteile), dann Übungen auf jeder Seite; zum Selbstausprobieren eine Komponente. Kein `quiz` (erklärt nichts), kein `interactive` (kein Spiel/Training).

## Notes

- Strand: `mathematik/arithmetik` (Lernlandkarte https://lernapps.net/apps/map/mathematik.json, gelesen). Orientierung: Hessen Gymnasium G9, Einheit 6.1 laut Karte.
- Lehrplan: Kerncurriculum Mathematik Gymnasium Sekundarstufe I, Hessisches Kultusministerium, https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf. Datei geladen, hier aber nicht lesbar (PDF, kein Lesewerkzeug): **nicht geprüft**; die Einheit 6.1 stammt aus der Karte.
- Kompetenzen (ids der Karte, Wortlaut unverändert):
  - `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen. (requires: natuerliche-zahlen)
  - `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen. (requires: brueche-begriff, teilbarkeit)
- Kapitel „Brüche“: Seite 1 `brueche-begriff` (Anteile, Zähler/Nenner, darstellen); Seite 2 Erweitern; Seite 3 Kürzen; Seite 4 Brüche vergleichen. Seiten 2–4 tragen dieselbe Kompetenz-id `brueche-kuerzen-erweitern`, die Karte hat nur eine (guess).
- Voraussetzung `teilbarkeit` übt die App nicht (Klasse hat es gerade gemacht): Wiederholungsseite `recap: mathematik/teilbarkeit` vor der Kürzen-Seite, ohne Übungen (guess).
- Wie Lernende dahin kommen: Anteil selbst färben und Nenner ändern (so ergibt sich, was Zähler und Nenner bedeuten); Erweitern als feinere Unterteilung desselben Bildes (gleiche Fläche, mehr Teile); Kürzen als Zusammenfassen von Teilen, begrenzt durch gemeinsame Teiler; Vergleichen durch gleiche Unterteilung. Die Rückmeldung fängt die Fehlvorstellungen aus „Hurdles“ ab.
- Umfang: drin Bruch als Anteil, Zähler/Nenner, Darstellung, Erweitern, Kürzen, Vergleichen. Draußen: Rechnen mit Brüchen, Dezimalbrüche, Prozent, gemischte Zahlen (guess). Zahlenbereich: Nenner bis 20 (guess). Sprache: Deutsch.
- Zweite Quelle: https://de.wikipedia.org/wiki/Bruchrechnung (geöffnet, Status 200, Titel „Bruchrechnung – Wikipedia“; nur Fakten, keine Sätze). Serlo-Adresse und zwei weitere Wikipedia-Adressen lieferten 404: nicht verwendet.

<!-- Strand (<subject>/<strand> or none), curriculum orientation, competencies by chapter (ids), didactic approach, scope, sources and licences, open
questions. -->

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

- Goal: Die App erklärt, was ein Bruch ist, und wie man Brüche kürzt und erweitert. Nach jedem Teil Übungen, damit die Kinder zuhause nachlesen und üben können. Anteile sollen gezeigt werden, die Kinder sollen selbst ausprobieren können.
- Learners: Mathematik, Klasse 6, Gymnasium in Hessen. Teilbarkeit ist gerade durchgenommen, Brüche sind neu.
- Model and focus: kein Vorbild genannt (guess); Schwerpunkt: Erklärung mit Anteilsbildern, Selbstausprobieren, Übungen.
- (Vorlage) Model and focus: an app of the catalog (read https://lernapps.net/apps/llms.txt) as model; what matters most
  (exercises, visualisations, game feel).
- Hurdles: Die Ersteller:in überlässt die Auswahl mir („Entscheide du“). Gewählt (guess): Zähler und Nenner als zwei getrennte Zahlen sehen; Teile müssen gleich groß sein; „größerer Nenner = größerer Bruch“; beim Erweitern/Kürzen addieren/subtrahieren statt multiplizieren/dividieren oder nur Zähler bzw. Nenner ändern; „schon fertig gekürzt“ nicht erkennen (nur einmal gekürzt).
- Content: ich schreibe es aus geprüften Quellen und der Lernlandkarte (guess); kein eigenes Material genannt.
- (Vorlage) Content: who writes it (creator, you, from sources); own material (worksheets, tests); how it is made (sources,
  research, a data format).
- Amount: Ein Kapitel mit ein paar Seiten, Stoff für etwa zwei Wochen Unterricht. Drin: was ein Bruch ist (Anteile, Zähler und Nenner, Brüche darstellen), Kürzen und Erweitern (gleichwertige Brüche), Brüche vergleichen. Rechnen mit Brüchen kommt später, nicht in dieser App.
- (Vorlage) Amount: how much content per level or chapter in the first version (e.g. "one text per school year"); what comes
  later.
- Languages: nur Deutsch (guess; Englisch nicht gewünscht).
- (Vorlage) Languages: German only, or German and English (texts, code). Never English only: an app without German still has
  German pages and runtime texts, so it mixes both. The creator wants English → offer German and English,
  both complete, and say why.
- Look and feel: ruhig wie ein Arbeitsblatt (guess; der Explainer erlaubt nur das), Dunkelmodus folgt dem Gerät.
- (Vorlage) Look and feel: calm like a worksheet, or like a game (colours, praise, effects); dark mode.
- Terms: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Anteil, erweitern, kürzen, gleichwertige Brüche (guess; gängige Schulbegriffe).
- (Vorlage) Terms: the creator's words for the main things in the app, used everywhere.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Brüche verstehen, erweitern und kürzen
subject: Mathematik
grades: [6]
summary: Die Kinder lernen, was ein Bruch ist, und probieren Anteile selbst aus. Sie erweitern und kürzen Brüche und vergleichen sie. Nach jedem Teil gibt es Übungen mit Rückmeldung.
keywords: [Brüche, kürzen, erweitern, Bruchteile]
# url: im Commit, nach der Veröffentlichung
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

<!-- One line each: exercise patterns and where; figures and how they are made; data files; each component, what it
checks and cannot; how a later agent adds a chapter. Each figure, model and component: its learning action in two to
four sentences: the whole, what its parts and marks mean, what learners do and what stays the same, how that leads to
the statement (an explainer: rule `explainer-representation-explained`). A control without a part in it goes. An explainer on the map: per page its prerequisites (`requires`)
the app does not practise, and which get a recap page, which a link. Becomes the content guide in Code. -->

- Kapitel `brueche`, vier Seiten + eine Wiederholungsseite, Reihenfolge: `anteile`, `erweitern`, `teilbarkeit-wiederholung` (recap `mathematik/teilbarkeit`, ohne Übung), `kuerzen`, `vergleichen`. Gleiche Abschnitt-ids auf jeder Seite: `einstieg` (Ziel + Alltagsbild), `erklaerung`, `ausprobieren` (nur wo Lernende etwas bedienen), `beispiel`, `uebung`.
- Muster „Teil eines Ganzen“ (Mathematik-Patterns): feste SVG-Bilder (`images/*.svg`, mit Alt-Text, Quelle „eigene Zeichnung“, CC BY 4.0) für die Regel; die Komponente für das Selbstausprobieren.
- Komponente 1 `BruchStreifen` (Anzeige, keine Übung): ein Streifen als das Ganze, n gleich große Stücke, Tippen färbt ein Stück. Lernaktion: Auf Seite 1 stellen Lernende die Stückzahl (Nenner) ein und färben Stücke; Zähler = gefärbt, Nenner = alle gleich großen Stücke, beides steht als Bruch darunter. Auf Seite 2/3 zeigt sie zwei Streifen untereinander, derselbe gefärbte Anteil; ein Knopf teilt jedes Stück in 2, 3, 4 oder 5 Teile (erweitern) bzw. fasst sie wieder zusammen (kürzen, nur wenn es aufgeht). Gleich bleibt die gefärbte Fläche; es ändern sich Zähler und Nenner, beide mit demselben Faktor. Seite 4: zwei Streifen mit gleicher Unterteilung, Stücke zählen. Kann nicht: Bruch eingeben, Prüfen. Kein JS: Beschreibung + feste Bilder (`nojs`).
- Komponente 2 `BruchFaerben` (Übungskomponente, zeichnet eigene Aufgaben): „Färbe a/b“ auf einem Streifen mit b Stücken; Prüfen prüft die Anzahl gefärbter Stücke. Falsche Antworten mit Grund: zu viele/zu wenige gefärbt, „Zähler und Nenner vertauscht“ (b−a gefärbt). Vorab kein Hinweis auf die Lösung (`explainer-figure-hides-answer`). Zusätzlich Tutor-Felder `template`, `params`, `mistakes`, `show`; Modell `ProzentFeld`.
- Übungen je Seite (steigend: erkennen, anwenden, neue Situation), mit `single-choice`, `true-false` mit Begründung, `number`, `generated`:
  - anteile: BruchFaerben; `single-choice` „Welcher Bruch gehört zum Bild?“ (Bild zeigt Gegebenes, Fehler: Ungleiche Stücke gezählt, Nenner = gefärbte Stücke); `generated` Nenner/Zähler aus einer Situation (z. B. Pizza in b Stücke, a gegessen: Wie viele Stücke bleiben?).
  - erweitern: `generated` „3/4 = ?/12“ (Fehler: addiert statt multipliziert, Zähler unverändert); `true-false` „Wer erweitert, ändert den Wert“ mit Begründung; `generated` Faktor finden.
  - kuerzen: `generated` „12/18 = ?/6“ (Fehler: nur den Nenner gekürzt, subtrahiert); `true-false` „8/12 ist vollständig gekürzt?“; `number` „Durch welche Zahl kannst du 18/24 am größten kürzen?“ (mit Hinweis auf gemeinsame Teiler).
  - vergleichen: `generated` „Welcher Bruch ist größer?“ als `single-choice`-Aufgabe über gemeinsamen Nenner (Fehler: größerer Nenner = größerer Bruch); `ordering` von drei Brüchen.
- Zahlen: Nenner 2 bis 20, Zähler < Nenner, nur echte Brüche (`explainer-plausible-numbers`); Faktoren 2 bis 5.
- Daten: Situationen (Pizza, Schokolade, Wasserflasche) einmal in `src/data/situationen.yaml` (guess).
- Skizzen: `.vibe/sketches/seite-1-bruchstreifen.svg` (Seite 1), `.vibe/sketches/seite-2-erweitern.svg` (Seiten 2 bis 4 nach demselben Muster).
- Kein `scope`: kein `open-task`, kein eigenes Material (Key decision).
- Neues Kapitel/Seite später: Seitenvorlage kopieren (gleiche Abschnitt-ids), Kompetenz-id aus der Karte, Übungsmuster aus dieser Liste; steht im Inhaltsleitfaden `app-content`.
- Erklärung der Darstellung (`explainer-representation-explained`): Das Ganze ist der ganze Streifen; jedes Stück ist gleich groß; gefärbt = Zähler, alle Stücke = Nenner; beim Erweitern bleibt die gefärbte Fläche, nur die Einteilung wird feiner; Missverständnis benannt: „Ein Streifen mit mehr Stücken ist nicht größer.“

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
- [x] Erste Seite `anteile` vollständig: Abschnitte, Bild, Komponente `BruchStreifen` und `BruchFaerben` mit Test und nojs, Übungen, Wiederholung der Fehlvorstellungen. Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Seite `erweitern` (BruchStreifen in Zweier-Ansicht, generated-Übungen). Commit.
- [x] Seite `teilbarkeit-wiederholung` (recap, ohne Übung) und Seite `kuerzen`. Commit.
- [x] Seite `vergleichen` und Kapitelzusammenfassung (`chapter.yaml`, `app.yaml` Einleitung, Quellen: Wikipedia Bruchrechnung). Commit.
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

<!-- Hinweis Code (Muster-Seite): Bildschirmfotos liegen in screenshots/ (Desktop und 360 px). Meine Werkzeuge zeigen keine Bilder; die Seite habe ich im Browser geprüft (Text, Boxen der Elemente, kein Seitenüberlauf bei 360 und 1280 px; Streifenstücke 36–40 px breit, 44 px hoch). Der Lerner-Check durch einen Sub-Agent war unvollständig (Dev-Server brach ab); seine Befunde sind eingearbeitet. -->
