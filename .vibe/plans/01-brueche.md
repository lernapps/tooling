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
failedChecks: { checks-pass: 5 }
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

*Gestartet 2026-11-04. Explore, Plan, Code, Commit.*

## Goal

Schülerinnen und Schüler der 6. Klasse erkunden an Rechtecken, Kreisen und Pizzen, was ein Bruch ist, und probieren selbst aus, wie sich Brüche beim Erweitern und Kürzen verändern, ohne ihren Wert zu ändern. Nach jedem Teil üben sie mit Aufgaben, die typische Fehler erklären.

## Key decisions

- Archetyp `explainer`: Die Lernenden brauchen Erklärung, Bilder und eigenes Ausprobieren vor den Übungen; ein Quiz allein reicht der Lehrkraft nicht, ein Spiel (`interactive`) ist nicht gewollt.
- Strang `mathematik/arithmetik`, Format 2: die Karte hat beide Kompetenzen, die Lehrkraft will Vergleichen ausdrücklich dabei.
- Vergleichen von Brüchen gehört zum Umfang (Antwort der Lehrkraft); es steht in der Kompetenz `brueche-kuerzen-erweitern`.
- Nur Deutsch (guess): Klasse 6 in Hessen; Englisch nicht erbeten.
- Aussehen: ruhig wie ein Arbeitsblatt (guess); das Aussehen der Vorlage ist fest, kein Spiel.
- Inhalt schreibe ich aus Lehrplan, Karte und geprüften Quellen, ohne eigenes Material der Lehrkraft (guess).
- Begriffe (guess): Bruch, Zähler, Nenner, Bruchstrich, Ganzes, erweitern, kürzen, gleichnamig, Pizza als Alltagsbeispiel.
- Wiederholungsseite für `teilbarkeit`; `natuerliche-zahlen` nur als Link auf die Karte (guess).
- Selbsteinschätzung bleibt (Frau Keller, ausdrücklich).
- Kein `scope` in der App (guess): es gibt keine offene Aufgabe (`open-task`) und kein eigenes Material der Lehrkraft, also ist `scope` nicht nötig.
- Zwei Bausteine statt einem für „Bruch einstellen“ (guess): ein Übungsbaustein darf keinen Text ohne JavaScript haben, ein Baustein zum Ausprobieren braucht ihn; beide zeichnen mit `BruchBild`. Die Datei `src/data/bruchbilder.yaml` entfällt auf der Muster-Seite; „Ablesen“ ist eine `number`-Frage mit Bild, weil eine erzeugte Aufgabe kein wechselndes Bild zeigen kann.

## Notes

**Strang:** `mathematik/arithmetik` (Karte https://lernapps.net/apps/map/mathematik.json, geöffnet und gelesen).

**Lehrplan:** Kerncurriculum Mathematik Hessen, Sekundarstufe I (Gymnasium): *nicht geprüft*. Die Seite des Hessischen Kultusministeriums war nicht abrufbar (404); keine Einheit wird zitiert. Als Orientierung dient die Karte (Quelle der Karte: KMK-Bildungsstandards Mathematik ESA/MSA 2022). Die Lehrkraft hat keinen Link; die Karte dient als Orientierung.

**Kompetenzen nach Kapitel (Ids der Karte):**
- Kapitel 1 „Was ist ein Bruch?“: `brueche-begriff` – Ich kann Brüche als Teil eines Ganzen deuten und darstellen.
- Kapitel 2 „Erweitern, kürzen, vergleichen“: `brueche-kuerzen-erweitern` – Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen. (verlangt `brueche-begriff` und `teilbarkeit`)

**Voraussetzungen, die die App nicht übt:** `teilbarkeit` (Wiederholungsseite vor „Kürzen“, `recap: mathematik/teilbarkeit`); `natuerliche-zahlen` (Link https://lernapps.net/apps/map/mathematik/c/natuerliche-zahlen/ im Text).

**Seiten (Entwurf):** Kap. 1: „Ganzes und Teile“, „Zähler und Nenner“. Kap. 2: Wiederholung Teilbarkeit, „Erweitern“, „Kürzen“, „Brüche vergleichen“. Kompetenz 2 ist groß und hat deshalb mehrere Seiten.

**Didaktik:** Rechteck, Kreis und Pizza als Darstellung, wie im Unterricht der Lehrkraft. Erst sehen und selbst verstellen (Baustein), dann Aufgaben. Ableiten statt nur ablesen.

**Kompetenz → Weg → abgefangener Fehler:**
- Brüche deuten: Ganzes in gleich große Teile teilen, Teile ausmalen, Bruch ablesen und aufschreiben → Zähler und Nenner vertauscht; ungleich große Teile werden mitgezählt.
- Erweitern: dasselbe Bild feiner einteilen, Zähler und Nenner wachsen gemeinsam, die ausgemalte Fläche bleibt → nur der Nenner wird malgenommen.
- Kürzen: Teile zu größeren zusammenfassen, gemeinsamer Teiler → nur Zähler oder nur Nenner geteilt; nicht vollständig gekürzt.
- Vergleichen: gleiche Bilder nebeneinander, dann gleichnamig machen → „1/8 ist größer als 1/4, weil 8 größer als 4 ist.“

**Umfang:** drin: Brüche als Teil eines Ganzen (echte Brüche; unechte nur am Rand, guess), Erweitern, Kürzen, Vergleichen von Brüchen mit kleinen Nennern; Deutsch. Draußen: Rechnen mit Brüchen, gemischte Zahlen, Dezimalbrüche, Prozent (eigene Kompetenzen der Karte, spätere Erweiterung).

**Quellen:** noch keine zweite Quelle je Kompetenz geöffnet und geprüft (nicht geprüft).

**Offene Fragen:** keine.

**Bildschirmprüfung (Code):** Die Bildschirmfotos aller Seiten (1280 px und 360 px) wurden erzeugt, aber nicht angesehen: die Werkzeuge zeigen kein Bild. Stattdessen wurden alle Seiten im Browser nach Text, Größe der Elemente, seitlichem Scrollen, Tippflächen (mindestens 44 px) und Konsolenfehlern geprüft, die Bausteine bedient und die Selbsteinschätzungen geladen. Muster-Seite zusätzlich von einem Unteragenten als Lernender der 6. Klasse durchgespielt; die Funde sind eingearbeitet.

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

- Goal: App soll erklären, was ein Bruch ist, und wie man Brüche kürzt und erweitert; Anteile sehen und selbst ausprobieren, Übungen nach jedem Teil. „Nur ein Quiz wäre mir zu wenig.“
- Learners: Mathematik, Klasse 6, Gymnasium in Hessen.
- Model and focus: Anteile sehen und selbst ausprobieren, dann Übungen (Aussage der Lehrkraft); kein Katalogvorbild genannt (guess: keines nötig).
- Hurdles: Zähler und Nenner vertauschen; beim Erweitern nur den Nenner malnehmen; „1/8 ist größer als 1/4, weil 8 größer als 4 ist“. Im Unterricht: Rechtecke, Kreise, Pizza-Beispiele. Vergleichen soll dazu.
- Content: (guess) ich schreibe ihn aus Karte, Lehrplan und geprüften Quellen; kein eigenes Material genannt.
- Amount: (guess) 2 Kapitel, 5 Seiten und 1 Wiederholungsseite; je Seite 1 bis 2 Übungen. Später: Rechnen mit Brüchen.
- Languages: (guess) nur Deutsch.
- Look and feel: (guess) ruhig wie ein Arbeitsblatt; Dunkelmodus folgt dem Gerät.
- Terms: (guess) Bruch, Zähler, Nenner, Bruchstrich, Ganzes, erweitern, kürzen, gleichnamig.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Brüche verstehen, kürzen und erweitern
subject: Mathematik
grades: [6]
summary: >-
  Du siehst an Rechtecken, Kreisen und Pizzen, was ein Bruch ist, und probierst selbst aus, wie man Brüche erweitert,
  kürzt und vergleicht. Nach jedem Teil übst du mit Aufgaben, die dir bei typischen Fehlern helfen.
strand: mathematik/arithmetik
keywords: [Bruch, Brüche, Zähler, Nenner, kürzen, erweitern, Brüche vergleichen, Bruchrechnen]
creator: { name: Frau Keller }
# url, source, commit, fitness: erst in Commit, wenn Adresse und Repository feststehen
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

**Sprache und Anrede:** Deutsch, „du“, kurze Sätze, Pizza und Schokolade als Alltag der 6. Klasse. Ein Bruch wird immer „Zähler durch Nenner“ geschrieben, Begriffe wie unter „Terms“.

**Seitenaufbau (feste Abschnitts-Ids):** `einstieg` (Ziel in einem Satz, Anknüpfung an Bekanntes), `erklaerung` (Bild/Baustein mit Erklärung), `beispiel`, `uebung`. Titel passen zur Seite; ein Abschnitt heißt nur „Ausprobieren“, wenn man dort etwas bedient.

**Daten:** `src/data/bruchbilder.yaml` – je Datensatz Form (rechteck, kreis), Nenner, Zähler, Alltagsbeispiel (Pizza, Schokolade, Kuchen); die erzeugten Aufgaben ziehen daraus.

**Muster je Kompetenz**
- *Deuten* (`brueche-begriff`):
  - „Ablesen“: Bild gegeben (ausgemalt), Zähler oder Nenner erfragen → `generated`/`number`, Fehler „vertauscht“ („Der Nenner sagt, in wie viele gleiche Teile das Ganze geteilt ist.“).
  - „Darstellen“: Bruch gegeben, Bild mit dem Baustein einstellen → Übungsbaustein `bruch-einstellen`.
  - „Urteilen“: `true-false`/`single-choice`: „Ist das ein Drittel?“ mit ungleichen Teilen, jede falsche Option mit Begründung.
- *Erweitern*: Zahlen: `generated` „Erweitere a/b mit k. Wie heißt der neue Nenner? / Zähler?“; Fehler „nur den Nenner mal k“ (Zähler = a). Verstehen: Baustein `erweitern-kuerzen`.
- *Kürzen*: `generated` „Kürze a/b so weit wie möglich“ (Zähler und Nenner als zwei Aufgaben); Fehler „nur Zähler geteilt“, „nur einmal mit einem kleineren Teiler gekürzt“. Ableitung: Teile zusammenfassen im Baustein.
- *Vergleichen*: `single-choice` „Welcher Bruch ist größer?“ mit Bildern; Fehler „1/8 > 1/4, weil 8 > 4“ mit Rückmeldung am Bild („Je mehr Teile, desto kleiner jedes Teil.“); `generated` „Mache gleichnamig und vergleiche“; `ordering` von 3 Brüchen.

**Figuren (drawn as `image` SVG und Baustein)**
- *Bruchbild* (Rechteck, Kreis, Pizza): Ganzes ist die ganze Form; gleich große Teile; ausgemalt = Zähler, alle Teile = Nenner. Gelernt wird: Der Nenner sagt, wie fein geteilt ist, der Zähler, wie viele Teile genommen werden. Bleibt gleich: das Ganze.
- *Baustein `bruch-einstellen`* (Component, Tasten „Nenner −/+“, „Zähler −/+“, Wechsel Rechteck/Kreis): Lernende stellen Nenner und Zähler ein und sehen sofort Teile und ausgemalte Fläche. Was sich ändert: Teile und Fläche. Was gleich bleibt: das Ganze. Warum Baustein: kein Block ändert sich mit der Eingabe (`prefer-built-in-block`). Prüft nichts; als Übung gibt es `bruch-einstellen` mit Auftrag und „Prüfen“. Text ohne JavaScript: das gezeigte Bruchbild als Bild und Tabelle. Kann nicht: Brüche größer als 1 darstellen.
- *Baustein `erweitern-kuerzen`* (Component, Tasten „feiner teilen ×k“ / „gröber zusammenfassen ÷k“): zwei gleich große Bilder untereinander, oben der Bruch, unten derselbe Bruch feiner oder gröber geteilt; die ausgemalte Fläche bleibt gleich, Zähler und Nenner zeigen beide den Faktor. Lernende sehen: Fläche bleibt, Zahlen ändern sich um denselben Faktor. Erweitern nur mit Faktoren 2 bis 6; Kürzen nur, wenn der Faktor beide Zahlen teilt (sonst Taste gesperrt, mit Grund). Text ohne JavaScript: zwei Bilder und die Rechnung als Formel.
- *Vergleichsbild* (`image` SVG): zwei gleich große Streifen untereinander, 1/4 und 1/8; die Beschriftung nennt, was gegeben ist, nicht das Ergebnis.

**Wiederholungsseite** `recap: mathematik/teilbarkeit` vor „Kürzen“: Teiler und Teilbarkeitsregeln (2, 3, 5, 10) in Kürze, ohne Übung.

**Neues Kapitel oder neue Seite später:** neue Datei `src/<kapitel>/<seite>.yaml` mit den Abschnitten oben, Eintrag in `chapter.yaml`, Kompetenz-Id aus der Karte, mindestens eine Übung, Datensätze in `src/data/bruchbilder.yaml`; Inhaltsleitfaden `app-content` aktualisieren.

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
- [x] Muster-Seite „Zähler und Nenner“ (Kapitel 1, `brueche-begriff`): Einstieg, Bild mit Erklärung, Bausteine `BruchBaustein` (Ausprobieren) und `BruchEinstellen` (Übung), beide mit `BruchBild` (je mit Test, `BruchBaustein` mit Text ohne JavaScript), Beispiel, Übung (Ablesen, Darstellen, Urteilen). Skizze: `.vibe/sketches/01-zaehler-nenner.svg`, `.vibe/sketches/02-baustein-bruch-einstellen.svg`. Dazu `src/app.yaml`, `chapter.yaml` Kapitel 1. Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Seite „Ganzes und Teile“ (Kapitel 1): Pizza, Rechteck, Kreis; gleich große Teile; Übung „Ist das ein Drittel?“ mit Begründung je Option. Commit.
- [x] Kapitel 2 „Erweitern, kürzen, vergleichen“ anlegen und Wiederholungsseite Teilbarkeit (`recap`). Commit.
- [x] Seite „Erweitern“: Baustein `erweitern-kuerzen` (Test, Text ohne JavaScript), Beispiel, Übung (erzeugte Aufgaben mit Fehler „nur den Nenner“). Skizze: `.vibe/sketches/03-baustein-erweitern-kuerzen.svg`. Commit.
- [x] Seite „Kürzen“: Baustein wiederverwendet, Beispiel, Übung (erzeugte Aufgaben, Fehler „nur den Zähler“, „nicht vollständig“). Commit.
- [x] Seite „Brüche vergleichen“: Vergleichsbild, Beispiel, Übung (Fehler „8 ist größer als 4“, gleichnamig machen, ordnen). Commit.
- [x] Startseite, Kapiteltexte, Glossar (`definition` für Bruch, Zähler, Nenner, erweitern, kürzen) und Selbsteinschätzung nach `lernapps-explainer-self-assessment` (oder Begründung); Entscheidung `scope` (nein, kein `open-task`, kein eigenes Material; `guess`). Commit.
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

- [ ] `grep '^phase:'` prints `phase: commit`; else set it.
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
