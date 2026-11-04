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

# Plan: Beschleunigte Bewegung, first version

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

Schülerinnen und Schüler der Klasse 9 lesen und zeichnen Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme und verändern sie selbst, um zu sehen, wie sich eine Bewegung beim Beschleunigen, Abbremsen und bei Richtungsänderung ändert. Rein qualitativ: keine Beschleunigungsformeln, keine Kräfte.

## Key decisions

- Archetype explainer: the creator wants explanations with exercises after each part and diagrams learners change themselves (components).
- Strand physik/mechanik of the learning map: it has exactly the competencies geschwindigkeitsaenderung and bewegungsdiagramme.
- Qualitative only (creator): no a = Δv/Δt, no s = ½·a·t², no forces (Oberstufe).
- Terms (guess, creator: "entscheide du"): beschleunigen, abbremsen, Richtung ändern; Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm (wording of the map).
- Languages: not asked (guess: German only).
- Look: calm like a worksheet, the runtime's look (the only option of the explainer).
- Scope: none (no open-task, no creator material) (guess).
- Controls: + and − buttons rather than dragging (creator: decide; keyboard and 360 px).
- Own material: none; the Lehrplan is orientation only (creator).

## Notes

- Strand: physik/mechanik (https://lernapps.net/apps/map/physik.json, read in full).
- Curriculum orientation: NRW, Gesamtschule, Kernlehrplan Naturwissenschaften (Biologie, Chemie, Physik), QUA-LiS NRW,
  https://lehrplannavigator.nrw.de/system/files/media/document/file/klp_ge_nw.pdf (listed at
  https://lehrplannavigator.nrw.de/sekundarstufe-i/gesamtschule/naturwissenschaften-gesamtschule). NOT CHECKED: the PDF was downloaded but could not be
  read here (no PDF tool); no Inhaltsfeld or Kompetenz is cited. The structure follows the learning map.
- Competencies (ids of the map, wording unchanged):
  - geschwindigkeitsaenderung: Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert.
  - bewegungsdiagramme: Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen.
- Prerequisites the app does not practise: geschwindigkeit and geschwindigkeit-berechnen (Klasse 7, v = s/t), via it strecke-und-zeit-messen.
  One recap page for geschwindigkeit-berechnen (descriptive only); the others are linked from its text.
- Chapter 1 "Beschleunigte Bewegung" (order along requires):
  1. Recap: v = s/t (recap physik/geschwindigkeit-berechnen, no exercise)
  2. Schneller, langsamer, andere Richtung (geschwindigkeitsaenderung)
  3. Das Weg-Zeit-Diagramm lesen (bewegungsdiagramme)
  4. Das Geschwindigkeit-Zeit-Diagramm (bewegungsdiagramme)
  5. Hin und zurück: Richtungsänderung im Diagramm (bewegungsdiagramme)
  6. Beide Diagramme zeichnen und verbinden (bewegungsdiagramme)
  Pages 3 to 6 split a large competency, so they share one id (allowed).
- How learners get there and the misconception caught, per page (draft, refined in Plan):
  - 2: sort everyday situations by what changes (Tempo or Richtung); misconception "beschleunigen = nur schneller werden".
  - 3: read the diagram as the story of a drive; a component changes the curve and shows the motion; misconceptions "Diagramm = Bild der Strecke" and "steile Linie = bergauf".
  - 4: a component draws a v-t line and shows the matching drive; misconception "fallende v-t-Linie = zurückfahren" (it is slowing down).
  - 5: turning point in a drive there and back; the sign of the velocity only as an idea (guess).
  - 6: assign and draw both diagrams of one drive (Anfahren, Fahren, Bremsen, Halt).
- Scope: in: qualitative description, reading, drawing and changing the two diagrams, small round numbers. Out: a = Δv/Δt, s = ½·a·t², forces, free fall as a formula (creator: Oberstufe).
  Languages: German. About two weeks of lessons (creator).
- Second sources: none. Checked: de.wikipedia.org/wiki/Weg-Zeit-Diagramm is only a disambiguation page (not used); "Zeit-Geschwindigkeits-Diagramm" and "Bewegungsdiagramm" do not exist (404); "Beschleunigung" opens but covers formulas and forces, not this competency (not used). Nothing fits, so none is cited.
- Creator hurdle: many learners find diagrams hard; no examples given. So page 3 starts with axes and one point, in small steps.

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

- Goal: "Beschleunigte Bewegung für Klasse 9, Physik": beschleunigen, abbremsen, Richtungsänderung; Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme zeichnen und ablesen; Diagramme selbst verändern und sehen, was passiert. Erklärungen mit Übungen nach jedem Teil, kein reines Quiz.
- Learners: Physik, Klasse 9, Gesamtschule NRW, gemischte Leistungsstärke; kennen v = s/t aus Klasse 7; Diagramme sind neu.
- Model and focus: not asked (guess: no model app; focus on the diagram exercises).
- Hurdles: "Viele finden Diagramme einfach schwer, mehr kann ich dazu nicht sagen." No examples or experiments given.
- Content: "Ich habe kein eigenes Material, nimm den Lehrplan als Orientierung." (written by the assistant from the learning map and verified sources)
- Amount: "nicht zu groß, ein Kapitel mit ein paar Seiten, etwa für zwei Wochen Unterricht". Assistant decided, creator agreed: 5 pages with exercises plus one recap page.
- Languages: German only, or German and English (texts, code). Never English only: an app without German still has
  German pages and runtime texts, so it mixes both. The creator wants English → offer German and English,
  both complete, and say why.
- Look and feel: not asked (guess: calm like a worksheet).
- Terms: "Entscheide du." See Key decisions.

### Entry draft

<!-- Filled so far with the known values; url, source, commit, creator and fitness come in Commit. -->

```yaml
title: Beschleunigte Bewegung
subject: Physik
grades: [9]
summary: >-
  Du lernst, wie sich eine Bewegung beim Beschleunigen, Abbremsen und bei einer Richtungsänderung verändert.
  Du liest Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme, zeichnest sie selbst und siehst sofort, was du verändert hast.
keywords: [Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, v-t-Diagramm, s-t-Diagramm, Beschleunigung, Abbremsen, Bewegung, Mechanik, Diagramme lesen, Diagramme zeichnen]
strand: physik/mechanik
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

- Gemeinsame Seitenstruktur (Physik, `page-structures`): `einstieg` (Anknüpfung an Bekanntes), `erklaerung` (anschaulich erklärt), `ausprobieren` (nur wo Lernende etwas bedienen), `beispiel` (`example`-Box), `uebung`. Überschriften passen zum Inhalt (`explainer-honest-headings`). Ansprache: "du".
- Muster "Diagramm ablesen": ein Diagramm gegeben, eine Aussage oder ein Wert gefragt. `single-choice` und `true-false` mit Begründung in `info`; Bild als SVG in `src/images/` (eigene Zeichnung, CC-BY-4.0) mit Achsenzahlen.
- Muster "Zuordnen": Alltagssituation oder Fahrtbeschreibung ↔ Kurve, `matching`; Reihenfolge von Fahrabschnitten, `ordering`.
- Muster "Diagramm einstellen": Übungskomponente `DiagrammZeichnen` (Seite 6 und je eine Aufgabe auf Seite 4 und 5).
- Zwei Stufen je Seite (gemischte Leistung): Basisaufgabe zuerst, dann eine Aufgabe "Knobeln" mit Tipp zum Aufklappen. Rückmeldung nennt den typischen Fehler und wie man ihn behebt (`explainer-mistakes-diagnosed`).
- Daten: Fahrbeispiele (Fahrrad, Bus, Aufzug, Hin-und-zurück) als `src/data/fahrten.yaml`, jede Fahrt einmal: `id`, `titel`, `beschreibung`, `tempo` (Tempo bei t = 0 bis 6 s, ganze m/s). Die Seiten und Aufgaben lesen sie von dort.
- Komponente 1, `BewegungsDiagramm` (Skizze `.vibe/sketches/bewegungsdiagramm.svg`, kein Prüf-Exercise): Lernaktion. Das Ganze ist eine Fahrt von 0 bis 6 s. Die Zeitachse steht fest, die Skala bleibt beim Ändern gleich. Punkte auf der Bahn sind der Ort des Wagens nach jeder Sekunde, weite Abstände heißen schnell. Die Lernenden stellen mit + und - das Tempo des Wagens zu jeder Sekunde ein (Schritt 1 m/s, 0 bis 4 m/s, auf Seite 5 auch rückwärts). Zwischen zwei Sekunden verbindet eine gerade Linie die Werte. Das Geschwindigkeit-Zeit-Diagramm zeigt diese Linie, das Weg-Zeit-Diagramm den zurückgelegten Weg dazu; der Weg wird nur gezeichnet, nicht von den Lernenden gerechnet. Prop `ansicht` (`weg`, `geschwindigkeit` oder `beide`) zeigt je Seite nur, was die Seite braucht (`explainer-one-step`), `start` wählt eine Fahrt aus `fahrten`. Daraus lesen sie: gerade, steil, flach, fallend. Bedienelemente: nur die Tempo-Tasten und "Zurücksetzen"; jede Seite sagt, was sie ändern (`explainer-control-purpose`). Grenze: kein Zeichnen mit der Maus (Tasten sind barrierefrei und auf 360 px bedienbar). `nojs`: Beschreibung der Fahrt und beider Diagramme als Tabelle mit Wertepaaren.
- Komponente 2, `DiagrammZeichnen` (Skizze `.vibe/sketches/diagramm-zeichnen-uebung.svg`, Übung): Aufgabe in Worten (z. B. Bus fährt an, fährt gleichmäßig, bremst bis zum Halt). Start: alle Punkte auf 0. Die Lernenden stellen das Geschwindigkeit-Zeit-Diagramm ein; `check` prüft die gefragte Eigenschaft (z. B. wo steigt, bleibt, fällt die Linie), nicht Gleichheit mit der Lösung. Keine Anzeige der Lösung vor "Prüfen" (`explainer-figure-hides-answer`). Rückmeldung nennt den Fehler ("Beim Abbremsen muss die Linie fallen"). Tutor: `template`, `params`, `mistakes`, `show` wie im Modell `ProzentFeld`.
- Warum Komponenten (`prefer-built-in-block`): Kein Block lässt Lernende ein Diagramm verändern und die Bewegung dazu sehen; das ist der Kern des Wunsches der Lehrkraft.
- Spätere Kapitel: neue Fahrt in `fahrten.yaml`, neue Seite nach der Seitenstruktur, Muster aus dem Inhaltsleitfaden `app-content`.
- Voraussetzungen ohne eigene Übung: `geschwindigkeit-berechnen` bekommt die Wiederholungsseite (Seite 1); `geschwindigkeit` und `strecke-und-zeit-messen` werden dort mit Link auf die Karte genannt.
- Kein Umgang mit Formeln für Beschleunigung, keine Kräfte, kein freier Fall als Formel.

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
- [x] Muster-Seite: Komponente `BewegungsDiagramm` (.vue, .ts, Test, nojs) und Seite 3 "Das Weg-Zeit-Diagramm lesen" mit allen Abschnitten und Übungen; Datei `fahrten.yaml`. Ein Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Seite 2 "Schneller, langsamer, andere Richtung" (geschwindigkeitsaenderung): Alltagssituationen zuordnen, Fehlvorstellung "beschleunigen = nur schneller werden". Ein Commit.
- [x] Seite 1 Wiederholung "v = s/t" (recap `physik/geschwindigkeit-berechnen`) mit Links auf die Karte. Ein Commit.
- [x] Seite 4 "Das Geschwindigkeit-Zeit-Diagramm" (Beschleunigen = steigende, Abbremsen = fallende Linie) mit `BewegungsDiagramm` (Ansicht `geschwindigkeit`). Ein Commit.
- [x] Übungskomponente `DiagrammZeichnen` (.vue, .ts, Test) mit eigenem Commit; Seite 4 bekommt eine Aufgabe damit.
- [x] Seite 5 "Hin und zurück: Richtungsänderung im Diagramm" (Tempo auch rückwärts, Vorzeichen nur als Idee). Ein Commit.
- [x] Seite 6 "Beide Diagramme zeichnen und verbinden" (Zuordnen und Zeichnen einer ganzen Fahrt). Ein Commit.
- [x] Startseite, Kapitelzusammenfassung, Glossar (`definition`-Blöcke für Beschleunigen, Abbremsen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm). Ein Commit.
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
