---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype, null until chosen in Explore. Allowed values: explainer, interactive, quiz.
archetype: explainer
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: code
# prePushFailures: written by the pre-push hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: { checks-pass: 7 }
---

# Plan: Brüche verstehen, erweitern und kürzen, erste Version

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

Schülerinnen und Schüler der Klasse 6 sehen Brüche als Anteile eines Ganzen, färben und teilen Bilder selbst und entdecken so, was ein Bruch ist und dass Erweitern und Kürzen den Wert nicht ändern. Nach jedem Teil üben sie mit 5 bis 10 Aufgaben.

## Key decisions

- Archetyp `explainer`: Erklärseiten mit Aufgaben danach und ausprobierbaren Bildern; ein Quiz allein erklärt nichts, `interactive` wäre ein eigenes Modell oder Spiel (Wunsch der Lehrkraft: Erklärungen mit Aufgaben).
- Ausprobieren über Vue-Komponenten (Anteile färben, Einteilung verfeinern oder vergröbern): kein Block kann das, weil das Bild sich durch eine Handlung ändert.
- Kurzname `brueche` (Wahl der Lehrkraft überlassen; genauer als `bruchrechnen`, weil nur Begriff, Erweitern und Kürzen). (guess)
- Strand `mathematik/arithmetik` (Lernlandkarte), Format 2.
- Kein Abschlusstest und keine Selbsteinschätzung (Wunsch der Lehrkraft, 2026-11-04). Veröffentlichen und Eintragen im Katalog später; bis dahin nur lokal mit git, kein GitHub-Repo.
- Sprache nur Deutsch.
- Kein `scope` (kein open-task, kein Material der Lehrkraft): `scope` entfällt in App und Seiten.

## Notes

- Strand: `mathematik/arithmetik` (Karte: https://lernapps.net/apps/map/mathematik.json, gelesen am 2026-11-04; Quelle der Karte: KMK-Bildungsstandards Mathematik ESA/MSA 2022).
- Lehrplan: Hessen, Gymnasium, Klasse 6. Das Kerncurriculum Mathematik Sek I des Hessischen Kultusministeriums konnte ich nicht öffnen (geratene Adresse 404, Suche ohne PDF). **Nicht geprüft**; Orientierung allein an der Karte (Jahrgangsband 5-6) und am Wunsch der Lehrkraft. Keine Einheit zitiert.
- Kompetenzen (ids der Karte):
  - Kapitel 1 „Brüche verstehen“: `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen. (Seite: Bruch als Anteil)
  - Kapitel 2 „Erweitern und Kürzen“: `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen. (Seiten: Erweitern; Kürzen; Brüche vergleichen). Auf Wunsch der Lehrkraft gehört das Vergleichen der Größe nach in diese Version.
- Vorausgesetzt, nicht geübt: `teilbarkeit` (Teiler und Vielfache) für das Kürzen, deshalb eine kurze Wiederholungsseite (`recap: mathematik/teilbarkeit`) vor „Kürzen“ (guess). `natuerliche-zahlen` wird vorausgesetzt (Link auf die Karte).
- Wie Lernende dorthin kommen: Bruch: Ein Ganzes wird in gleich große Teile geteilt, Teile werden gefärbt; Nenner = Anzahl der Teile, Zähler = gefärbte Teile. Fehlvorstellungen: Teile nicht gleich groß; Zähler und Nenner vertauscht. Erweitern: Die Einteilung wird verfeinert, das gefärbte Stück bleibt gleich groß; Zähler und Nenner werden mit derselben Zahl malgenommen. Fehlvorstellungen: nur der Nenner wird verändert; „plus“ statt „mal“. Kürzen: Umkehrung, die Einteilung wird vergröbert; Zähler und Nenner werden durch denselben Teiler geteilt. Fehlvorstellungen: nur der Zähler gekürzt; nicht vollständig gekürzt; Subtrahieren statt Teilen.
- Scope: drin: echte Brüche (Zähler kleiner als Nenner) als Anteil an Rechteck und Kreis, Erweitern, Kürzen einschließlich vollständigem Kürzen, Nenner bis 24 (guess). Vergleichen: Brüche mit gleichem Nenner, gleichem Zähler und mit verschiedenen Nennern (durch Erweitern auf einen gemeinsamen Nenner), zwei Brüche, mit <, > und =. Draußen: unechte Brüche und gemischte Zahlen, Rechnen mit Brüchen, Dezimalbrüche (spätere Erweiterungen). Sprache: nur Deutsch.
- Quellen: Zweitquellen (z. B. serlo.org) noch nicht geöffnet, nicht geprüft; es werden keine Sätze übernommen, die Texte schreibe ich selbst.
- Lehrplan: Die Lehrkraft hat keinen Link und kein eigenes Material; der Hessische Lehrplan dient als Orientierung ohne Zitat.

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

- Goal: „Die App soll erklären, was ein Bruch ist, und wie man Brüche kürzt und erweitert.“ Erklärungen mit Aufgaben danach, nicht nur ein Quiz; die Kinder sollen Anteile sehen und selbst ausprobieren können.
- Learners: Mathematik, Klasse 6, Gymnasium in Hessen (die Klasse der Lehrkraft). Vorwissen nicht genannt: natürliche Zahlen, Malnehmen und Teilen. (guess)
- Model and focus: kein Vorbild genannt; Schwerpunkt Visualisierung zum Selbstausprobieren und Aufgaben. (guess)
- Hurdles: nicht genannt; aus der Fachdidaktik angenommen (siehe Notes). (guess)
- Content: schreibe ich; kein eigenes Material der Lehrkraft genannt. (guess)
- Amount: „Fünf bis zehn Aufgaben nach jedem Teil.“ Drei Teile: Bruch, Erweitern, Kürzen. Später: nichts verlangt.
- Languages: „Auf Deutsch, bitte.“ Nur Deutsch.
- Look and feel: nicht genannt; ruhig wie ein Arbeitsblatt, die Optik gibt die Laufzeit vor. (guess)
- Terms: nicht genannt; Schulbegriffe: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Anteil, erweitern, kürzen, gemeinsamer Teiler, vollständig gekürzt. (guess)

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Brüche verstehen, erweitern und kürzen
subject: Mathematik
grades: [6]
summary: Die Lernenden färben Anteile an Bildern und erkunden, was ein Bruch ist. Sie verfeinern und vergröbern die Einteilung und sehen, wie Erweitern und Kürzen den Wert eines Bruchs nicht ändern. Nach jedem Teil üben sie mit Aufgaben.
keywords: [Bruch, Brüche, Zähler, Nenner, kürzen, erweitern, Bruchteil, Klasse 6]
strand: mathematik/arithmetik
# url, creator, source, commit, fitness: in Commit (Adresse, Repo und Commit sind noch nicht bekannt)
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

**Seiten** (Format 2, Strang `mathematik/arithmetik`, Abschnitte mit festen ids: `einstieg`, `anschaulich` bzw. `ausprobieren`, `regel`, `beispiel`, `uebung`; Du-Form, kurze Sätze, Alltag der 6. Klasse):

| Kapitel | Seite | Kompetenz | Neuer Schritt |
|---|---|---|---|
| `bruch` | `was-ist-ein-bruch` | `brueche-begriff` | Ganzes in gleich große Teile; Nenner = alle Teile, Zähler = gefärbte Teile |
| `bruch` | `bruch-darstellen` | `brueche-begriff` | Einen gegebenen Bruch selbst färben |
| `kuerzen-erweitern` | `erweitern` | `brueche-kuerzen-erweitern` | Feinere Einteilung, gleicher Wert: Zähler und Nenner mal dieselbe Zahl |
| `kuerzen-erweitern` | `teiler-wiederholen` | Recap `mathematik/teilbarkeit` | Teiler und gemeinsame Teiler (ohne Aufgaben) |
| `kuerzen-erweitern` | `kuerzen` | `brueche-kuerzen-erweitern` | Gröbere Einteilung, gleicher Wert: durch gemeinsamen Teiler; vollständig kürzen |
| `kuerzen-erweitern` | `vergleichen` | `brueche-kuerzen-erweitern` | Größe vergleichen: gleicher Nenner, gleicher Zähler, sonst auf gleichen Nenner erweitern |

Voraussetzungen, die die App nicht übt: `natuerliche-zahlen` (Link auf die Karte im Text von `was-ist-ein-bruch`), `teilbarkeit` (Recap-Seite vor `kuerzen`).

**Aufgabenmuster** (je Seite 5 bis 10 Aufgaben; die Seite `bruch-darstellen` zählt mit `was-ist-ein-bruch` als „Teil 1“, zusammen 5–10 pro Seite):
- *Ablesen* (Bruch aus Bild): `generated` mit gezeichnetem Streifen/Kreis und Eingabe von Zähler und Nenner; typische Fehler: Zähler und Nenner vertauscht (Meldung: „Der Nenner zählt alle Teile.“), nur die ungefärbten Teile gezählt, ungleich große Teile mitgezählt. Das Bild zeigt den Bruch nie als Zahl.
- *Darstellen* (Bruch färben): Übungskomponente `BruchFaerben`, prüft die Eigenschaft „genau z von n Teilen gefärbt“, kein Zähler auf dem Bild (Regel `explainer-figure-hides-answer`).
- *Erweitern* (Zahl berechnen): `generated` „Erweitere a/b mit k“, Ergebnis Zähler und Nenner; Fehler: nur der Nenner (oder nur der Zähler) mal k, a+k statt a·k. Dazu `true-false` und `single-choice` mit Begründung.
- *Kürzen*: `generated` „Kürze a/b mit d“ und „Kürze vollständig“ (Daten aus der Datei `bruch-paare` mit Zähler, Nenner, ggT); bei „vollständig“ gilt nur der ggT-gekürzte Bruch; Fehler: nur Zähler geteilt, durch verschiedene Zahlen geteilt, durch Subtraktion gekürzt, nicht vollständig gekürzt („Du kannst noch durch 3 kürzen.“).
- *Vergleichen*: `single-choice` (<, >, =) mit `generated`-Aufgaben aus der Datei `bruch-vergleiche` (zwei Brüche, gemeinsamer Nenner, erweiterte Zähler); die Schritte nennen den Grund; Fehler: größerer Nenner = größerer Bruch, Zähler und Nenner getrennt verglichen.
- Rückmeldung: jede falsche Option mit Grund; Hinweise zeigen, wo man hinschaut, nie die Lösung.

**Datendateien** (`src/data/`): `bruch-paare.yaml` (Felder `a`, `b`, `k`, `z`, `n`: Zähler, Nenner, ggT, gekürzter Zähler und Nenner, damit die Schritte alle Zahlen kennen), `bruch-vergleiche.yaml` (Felder zwei Brüche, gemeinsamer Nenner, erweiterte Zähler, Ergebnis). Nenner bis 24, Zähler kleiner als Nenner, jeder Fakt einmal.

**Figuren und Komponenten** (nur wo kein Block passt; Blöcke `figure bar` zeigen ein festes Bild eines Anteils, aber ändern sich nicht durch Handlung):
- `BruchEinteilung` (Erkundung, Seite `was-ist-ein-bruch`): Das Ganze ist ein Streifen. Die Lernenden wählen die Zahl der gleich großen Teile (2 bis 12) und tippen Teile an, um sie zu färben. Gefärbt = schraffiert + Farbe. Eine Anzeige „z von n Teilen = z/n“ steht nur hier, weil es keine Aufgabe ist. Gleich bleibt das Ganze (Streifenbreite). Sie sehen so, dass Nenner die Teile zählt, Zähler die gefärbten. Skizze 01.
- `BruchFaerben` (Übungskomponente, Seite `bruch-darstellen`): Aufgabe „Färbe a/b“, Streifen mit b Teilen, die Lernenden färben. Prüft: genau a Teile gefärbt. Meldung bei falsch: zu wenige/zu viele, ohne die Lösung zu nennen. Kann kein Ergebnis in Zahlen prüfen. Liefert `template`, `params`, `mistakes`, `show` für den Tutor.
- `Streifen` (Erkundung, Seiten `erweitern` und `kuerzen`, Prop `modus`): Zwei Streifen untereinander, beschriftet „vorher“ und „erweitert mit k“ bzw. „gekürzt mit d“, gleiche Breite = gleiches Ganzes, das gefärbte Stück gleich groß. Die Lernenden wählen den Faktor k (Knöpfe 1 bis 6, bei Kürzen nur die gemeinsamen Teiler) und sehen, wie die Einteilung feiner/gröber wird und der Anteil gleich bleibt; darunter steht die Rechnung. Start: Faktor 1, beide Streifen gleich. Skizze 02.
- eigene SVG-Streifen (`figure` mit `image`, nicht `figure bar`, das Prozent anzeigt) im Erklärteil von `vergleichen`: zwei Streifen gleicher Länge mit verschiedenen Anteilen, Beschriftung links. Skizze 03.

**Neue Seite/Kapitel später:** neue Datensätze in die Dateien, neue Seite nach dem Muster einer vorhandenen Seite, Abschnitte mit denselben ids; Inhalt im Content-Guide `app-content` ergänzen.

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
- [x] Seite `bruch/was-ist-ein-bruch` komplett (Muster, `early-preview`): Abschnitte einstieg, ausprobieren (Komponente `BruchEinteilung` mit Logikmodul, Test und `nojs`-Text), regel (definition Zähler, Nenner, Bruchstrich), beispiel, uebung (5 bis 8 Aufgaben). Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Seite `bruch/bruch-darstellen` mit Übungskomponente `BruchFaerben` (Logik, Test, Tutor-Felder) und 5 bis 8 Aufgaben. Commit.
- [x] Seite `kuerzen-erweitern/erweitern` mit Komponente `Streifen` (Modus erweitern), Datei `bruch-paare`, 5 bis 10 Aufgaben. Commit.
- [x] Seite `kuerzen-erweitern/teiler-wiederholen` (Recap `mathematik/teilbarkeit`, ohne Aufgaben) und Seite `kuerzen` (Modus kürzen, vollständig kürzen), 5 bis 10 Aufgaben. Commit.
- [x] Seite `kuerzen-erweitern/vergleichen` mit `figure bar`, Datei `bruch-vergleiche`, 5 bis 10 Aufgaben. Commit.
- [x] Start- und Kapitelseiten (Texte `intro`, `summary`), Glossar (Bruch, Zähler, Nenner, Erweitern, Kürzen), `app.yaml` mit Quellen. Commit.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [ ] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
      each with the confirmed sketches; each figure in its own image (`npx --no -- lernapps screenshots --desktop`).
- [ ] Every box of Explore, Plan and Code ticked.
- [ ] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).
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
- [ ] An explainer: load skill `lernapps-explainer-self-assessment` (missing → `npx --no -- lernapps skills --archetype
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
