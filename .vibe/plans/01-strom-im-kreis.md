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
failedChecks: { checks-pass: 2 }
---

# Plan: Strom im Kreis, first version

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

Schülerinnen und Schüler der Klasse 8 lesen zu Hause in Kapiteln nach und üben nach jedem Abschnitt: Sie erklären den Stromkreis, die Stromstärke und die Spannung, messen beide richtig und unterscheiden Reihen- und Parallelschaltung.

## Key decisions

- Archetype `explainer`: Kapitel aus Erklärseiten mit Übungen nach jedem Teil; Fortschritt nur als Selbsteinschätzung pro Kapitel (letztes Ergebnis auf dem Gerät). Der Ersteller hat das bestätigt.
- Strang `physik/elektrizitaetslehre` der Lernlandkarte (guess: passt zum Thema, vom Ersteller noch zu bestätigen).
- Ruhig und sachlich, Deutsch, du-Form (Ersteller).
- Screenshots (guess): Der Assistent konnte die Bilder nicht ansehen; Stand: Seiten und Figuren gebaut, Alternativtexte und Prüflauf grün, Sichtprüfung nicht erfolgt. Der Ersteller wollte ohne Sichtprüfung weitermachen.
- Selbsteinschätzung in jedem Kapitel (guess: Standard des Skills), 2–4 Übungen je Schritt.
- Kein `scope` (guess): kein `open-task` und kein eigenes Material des Erstellers, also nicht nötig.
- Keine Daten-Dateien `bauteile.yaml`/`materialien.yaml` (guess): die Zuordnungen stehen als `matching` direkt in den Seiten; es gibt keine `generated`-Übung, die sie bräuchte.
- Reihen- und Parallelschaltung nur qualitativ (Aufbau, Ausfall eines Bauteils, Messgeräte anschließen); die Kompetenzen `reihenschaltung-groessen` und `parallelschaltung-groessen` gehören laut Karte in Klasse 9–10 und brauchen das ohmsche Gesetz (guess).

## Notes

**Strang:** physik/elektrizitaetslehre (Karte: https://lernapps.net/apps/map/physik.json, gelesen).

**Lehrplan (Orientierung):** Kernlehrplan für die Sekundarstufe I Gymnasium in Nordrhein-Westfalen, Physik, Ministerium für Schule und Bildung NRW, 2019, https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_ph_klp_3411_2019_06_23.pdf (Text selbst gelesen).
- Inhaltsfeld 2 „Elektrischer Strom und Magnetismus“ (Erprobungsstufe, S. 24–26): Stromkreise, Spannungsquellen, Leiter und Nichtleiter, Reihen- und Parallelschaltung, Schaltsymbole, Stromwirkungen, Gefahren.
- Inhaltsfeld 9 „Elektrizität“ (bis Ende Sek I, S. 39–40): Spannung, Stromstärke, Messen von Spannungen und Stromstärken, Reihen- und Parallelschaltung, Wirkung auf den Körper.
- Der Plan teilt nur zwei Stufen (Ende Erprobungsstufe, Ende Sek I). Die Zuordnung von Stromstärke und Spannung zu Klasse 8 trifft die Schule (schulinterner Lehrplan); das ist im Kernlehrplan nicht belegt.

**Kompetenzen nach Kapitel (Ids und Wortlaut der Karte):**
1. Der Stromkreis: einfacher-stromkreis, leiter-nichtleiter, schalter, schaltzeichen, spannungsquellen
2. Stromstärke: stromstaerke, stromstaerke-messen
3. Spannung: spannung, spannung-messen
4. Reihen- und Parallelschaltung: reihenschaltung, parallelschaltung
5. Sicher mit Strom: gefahren-des-stroms, sicher-mit-strom-umgehen

Eine Seite je Kompetenz, 14 Seiten. Voraussetzungen außerhalb des Strangs: keine (guess).

**Hinweis:** Die App `elektrizitaet` (mrsimpson, Klasse 5–8) übt fast alle diese Kompetenzen schon (https://lernapps.net/apps/elektrizitaet/). Von keiner App geübt: spannungsquellen.

**Didaktik:** Wassermodell als Anschauung für Stromstärke und Spannung, ausdrücklich als Modell gekennzeichnet. Fehlvorstellungen (Ersteller): „Strom wird in der Lampe verbraucht“ und „Strom fließt von beiden Seiten in die Lampe“; die Rückmeldungen greifen sie auf.

**Umfang:** Drin: 5 Kapitel, 14 Seiten, Übungen auf jeder Seite, Selbsteinschätzung pro Kapitel. Draußen: Widerstand, ohmsches Gesetz, Größen in Reihen- und Parallelschaltung (Klasse 9–10), Stromwirkungen, Magnetismus. Sprache: nur Deutsch.

**Quellen und Lizenz:** Inhalte werden selbst geschrieben; Fakten aus Lehrplan und Karte. Code MIT, Inhalte CC BY 4.0.

**Offen:** Zweitquellen je Kompetenz (z. B. serlo.org) noch nicht gesichtet.

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

- Goal: Lern-App zu Stromkreis und elektrischem Strom; Kinder lesen zu Hause nach und üben; Erklärungen in Kapiteln, Übungen nach jedem Teil, nicht nur Quiz oder Spiel.
- Learners: Physik Klasse 8, Gymnasium NRW; kennen einfache Stromkreise mit Batterie und Lampe aus der Grundschule; Stromstärke und Spannung sind neu. Lehrplan als Orientierung.
- Model and focus: (guess) Katalog-App elektrizitaet als thematischer Vergleich; Schwerpunkt Erklärungen und Übungen.
- Hurdles: „Strom wird verbraucht“, „Strom fließt von beiden Seiten in die Lampe“; keine eigenen Beispiele.
- Content: kein eigenes Material; der Assistent schreibt aus Lehrplan und Quellen.
- Amount: (guess) eine Seite je Kompetenz, 14 Seiten in 5 Kapiteln.
- Languages: Deutsch (guess: Englisch nicht gewünscht).
- Look and feel: ruhig und sachlich; Dunkelmodus folgt dem Gerät.
- Terms: (guess) Stromstärke, Spannung, Stromkreis, Schaltplan, Reihenschaltung, Parallelschaltung.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Strom im Kreis
subject: Physik
grades: [8]
summary: Du liest in kurzen Kapiteln nach, wie ein Stromkreis funktioniert, und übst danach. Du lernst, was Stromstärke und Spannung sind und wie man sie misst. Du vergleichst Reihen- und Parallelschaltung.
strand: physik/elektrizitaetslehre
keywords: [Stromkreis, Stromstärke, Spannung, Amperemeter, Voltmeter, Reihenschaltung, Parallelschaltung, Klasse 8]
fitness:
  account: false
  install: false
  storage: device
  thirdParty: none
# url, creator, source, commit: in Commit
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
      After the first task that shows real content: the task "Show the creator a first look (`early-preview`)".
- [x] Each screen, component or interactive exercise: a sketch (static SVG or image, or the steps with what
      learners see after each). Words alone are not enough. Keep sketch files in `.vibe/sketches/`, which `create` leaves alone.
- [x] Show the creator, short: goal, competencies by chapter (chapters along the map's `requires`), entry draft, tasks, sketches; the content method in
      plain words (what learners see and do, what it cannot do). At most 2 questions.
- [x] **Checkpoint:** confirm the plan and the content method, with the sketches shown. Stop and wait for an
      explicit yes. Changes → change, ask again. No `create` before the yes.
- [x] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

- Seitenaufbau (alle Seiten gleich, Sektionen mit festen Ids): `warum` (Frage/Anknüpfung), `erklaerung` (Text, Figur, `definition`), `beispiel` (`example`-Kasten, hergeleitet), `uebung` (Fragen). Skizze: `.vibe/sketches/seitenaufbau.svg`.
- Figuren: eigene SVG-Zeichnungen in `src/images/` (Schaltpläne, Wassermodell), je mit `alt`, `caption`, Quelle „eigene Zeichnung“, Lizenz CC BY 4.0. Konvention: Leitungen schwarz, Messgeräte A und V im Kreis, Stromrichtung technisch von Plus nach Minus. Skizzen: `messen-stromkreis.svg`, `reihe-parallel.svg`. Die Figur zeigt nur das Gegebene, nie die Antwort.
- Daten: Bauteile mit Schaltzeichen, Name und Funktion als `src/data/bauteile.yaml` (ein Datensatz je Bauteil); Materialien mit Leiter/Nichtleiter als `src/data/materialien.yaml`.
- Muster je Kompetenz:
  - einfacher-stromkreis, schalter: `single-choice` und `true-false` mit Begründung in der Rückmeldung (offener/geschlossener Kreis).
  - leiter-nichtleiter: `matching` Material ↔ Leiter/Nichtleiter aus `materialien.yaml`.
  - schaltzeichen: `matching` Schaltzeichen ↔ Bauteil aus `bauteile.yaml`; `single-choice` zum Lesen eines Schaltplans.
  - spannungsquellen: `matching` Quelle ↔ Eignung; `single-choice` (warum Steckdose nicht für Kinderexperimente).
  - stromstaerke: `generated` Umrechnung mA ↔ A mit Einheit, typische Fehler „Faktor 100 statt 1000“; `single-choice` zur Fehlvorstellung „Strom wird verbraucht“ (Stromstärke vor und hinter der Lampe gleich).
  - stromstaerke-messen, spannung-messen: `single-choice`/`true-false` „Wie wird das Messgerät angeschlossen“ (in Reihe/parallel) mit Schaltplan als Material; `generated` Ablesen eines Messwerts aus gegebener Zeigerstellung als Zahl mit Einheit.
  - spannung: `single-choice` Modell-Aussagen (Antrieb, nicht „Menge“); `generated` Umrechnung mV/V.
  - reihenschaltung, parallelschaltung: `single-choice` „Was passiert, wenn Lampe 1 ausfällt“ mit Schaltplan als Material; `ordering`/`matching` Eigenschaft ↔ Schaltung. Nur qualitativ.
  - gefahren-des-stroms: `true-false` mit Begründung; `single-choice` Batterie vs. Steckdose.
  - sicher-mit-strom-umgehen: `multiple-choice` Regeln anwenden auf Alltagssituationen.
- Fehlvorstellungen als Rückmeldung (`info` der falschen Option): „Strom wird in der Lampe verbraucht“ (Strom fließt im Kreis, nur Energie wird umgewandelt; Stromstärke vorher und nachher gleich); „Strom fließt von beiden Seiten in die Lampe“ (ein Umlauf, eine Richtung).
- Keine Vue-Komponenten (`prefer-built-in-block`): Schaltplan-Aufbauen wäre eine Komponente, ist aber nicht geplant; wer bauen will, findet es in der App `elektrizitaet` (Verweis auf der Startseite).
- Akzeptiert/abgelehnt: jede Übung nennt `examples` (weitere richtige Antworten) und typische falsche.
- Neues Kapitel später: Skill `lernapps-content-growth`, Seite nach dem Seitenaufbau, Kompetenz-Id aus der Karte, Übung mit Begründungen.
- Voraussetzungen ohne eigene Seite: keine; keine Wiederholungsseiten (`recap`).
- Selbsteinschätzung pro Kapitel in Commit (`lernapps-explainer-self-assessment`), Fortschritt nur davon.

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
- [x] Start und Gerüst: `src/app.yaml` (Titel, Einleitung, nur Deutsch, Strang, `scope`-Entscheidung), die fünf `chapter.yaml`, Datei `bauteile.yaml`, Glossar; Seite `stromkreis/einfacher-stromkreis` mit Figur und Übung. Danach: erster Blick (`early-preview`).
- [x] Show the creator a first look (`early-preview`) and go on.
- [x] Kapitel 1 fertig: Seiten `leiter-nichtleiter` (`materialien.yaml`), `schalter`, `schaltplan` (`schaltzeichen`), `spannungsquellen`.
- [x] Kapitel 2 „Stromstärke“: Seiten `stromstaerke` (Wassermodell, Fehlvorstellung „verbraucht“, generated mA/A) und `stromstaerke-messen` (Figur `messen-stromkreis`).
- [x] Kapitel 3 „Spannung“: Seiten `spannung` (Modell, generated mV/V) und `spannung-messen`.
- [x] Kapitel 4 „Reihen- und Parallelschaltung“: Seiten `reihenschaltung` und `parallelschaltung` (Figur `reihe-parallel`, Fehlvorstellung „von beiden Seiten“), qualitativ.
- [x] Kapitel 5 „Sicher mit Strom“: Seiten `gefahren-des-stroms` und `sicher-mit-strom-umgehen`.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [x] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
      each with the confirmed sketches; each figure in its own image (`npx --no -- lernapps screenshots --desktop`).
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
