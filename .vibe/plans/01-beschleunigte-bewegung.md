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

# Plan: Beschleunigte Bewegung, erste Fassung

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

Schülerinnen und Schüler der Klasse 9 beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert, und zeichnen und lesen Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme. Sie verändern Diagramme selbst und sehen, was mit der Bewegung passiert.

## Key decisions

- Archetyp `explainer`: Erklärseiten mit Aufgaben nach jedem Teil zum Nachlesen und Üben zu Hause. Diagramme verändern geht mit Komponenten. `quiz` hat keine Erklärungen; `interactive` ist eine einzige App-Seite statt eines Lesekapitels.
- Kurzname `beschleunigte-bewegung` (guess).
- Sprache nur Deutsch.
- Nur Beschreibung der Bewegung: keine Kräfte, kein a = Δv/Δt (Oberstufe).
- Diagramme zum Verändern als Komponenten, jede mit statischer Form und Text ohne JavaScript.
- Look: ruhig wie ein Arbeitsblatt, so gibt es die Runtime vor (guess).
- Kein `scope`: kein `open-task`, kein eigenes Material der Lehrkraft.
- Repo-Name `beschleunigte-bewegung` (guess, vom Ersteller freigestellt). Kein GitHub-Zugang: Herr Demir arbeitet vorerst lokal mit git. Veröffentlichen und Eintragen in den Katalog folgen später; bis dahin bleibt die Commit-Phase ab "Load skill `lernapps-github`" offen.

## Notes

**Strand:** `physik/mechanik` (Lernlandkarte https://lernapps.net/apps/map/physik.json, gelesen).

**Lehrplan:** NRW, Gesamtschule, Klasse 9. Der Kernlehrplan Naturwissenschaften (QUA-LiS NRW) war hier nicht als Dokument zu lesen: nicht geprüft, keine Einheit zitiert. Orientierung nur über die Karte: KMK, Weiterentwickelte Bildungsstandards Physik (MSA), Beschluss 16.12.2004 i.d.F. 13.06.2024 (nicht selbst gelesen).

**Kompetenzen nach Kapitel (Ids und Wortlaut der Karte):**
- Kapitel `beschleunigte-bewegung`, Teil 1 "Bewegung beschreiben":
  - Seite `geschwindigkeit-wiederholen` (Rückblick, `recap: physik/geschwindigkeit-berechnen`, ohne Aufgaben): v = s/t aus Klasse 7; Voraussetzung von `bewegungsdiagramme`, die App übt es nicht.
  - Seite `geschwindigkeitsaenderung`: "Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert."
- Teil 2 "Bewegungsdiagramme", `bewegungsdiagramme`: "Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen." Große Kompetenz, daher mehrere Seiten: Weg-Zeit-Diagramm lesen, Geschwindigkeit-Zeit-Diagramm lesen, beide zusammen (zeichnen und zuordnen).
- Die Karte verlangt `geschwindigkeitsaenderung` nicht für `bewegungsdiagramme`; ich ordne sie davor, weil die Diagramme Beschleunigen und Abbremsen zeigen (guess).

**Didaktik:** Erst die Bewegung in Alltagssprache (Auto, Fahrrad, Bremsen, Kurve), dann dieselbe Bewegung als Weg-Zeit- und Geschwindigkeit-Zeit-Diagramm nebeneinander. Konstante Geschwindigkeit ist bekannt (Gerade im s-t-Diagramm); ändert sich die Geschwindigkeit, wird die Gerade zur Kurve. Schüler ändern Abschnitte einer Bewegung und sehen beide Diagramme sich ändern. Gemischte Leistung: kleine Schritte, Hilfen, gestufte Aufgaben.

**Pro Kompetenz, Weg und Fehlvorstellung:**
- `geschwindigkeitsaenderung`: Schüler leiten aus Tacho-Werten zu Zeitpunkten ab, ob die Bewegung schneller, langsamer oder gleich bleibt; die Richtungsänderung ist ein eigener Fall. Fehlvorstellungen: "Abbremsen heißt negative Geschwindigkeit"; "Richtungsänderung ist keine Änderung, wenn der Tacho gleich bleibt"; "Beschleunigen heißt nur schneller werden" (guess).
- `bewegungsdiagramme`: Schüler verändern die Geschwindigkeit je Zeitabschnitt und sehen, wie der s-t-Graph steiler oder flacher wird und wie die v-t-Linie liegt; sie lesen Werte ab und ordnen Paare zu. Fehlvorstellungen: Diagramm als Bild der Bahn ("Berg im Diagramm = Berg auf der Strecke"); waagerechte Linie im s-t-Diagramm heißt "fährt gleichmäßig" statt "steht"; Steigung und Höhe verwechseln (guess).

**Umfang:** Drin: Beschleunigen, Abbremsen, Richtungsänderung beschreiben; s-t- und v-t-Diagramme zeichnen, lesen und ineinander übersetzen, für Bewegungen mit abschnittsweise konstanter Geschwindigkeit und mit gleichmäßig wachsender oder fallender Geschwindigkeit (qualitativ). Draußen: Kräfte, a = Δv/Δt, s = ½·a·t² (Oberstufe, Wunsch der Lehrkraft); Fläche unter dem v-t-Graphen als Weg (guess, nur wenn die Lehrkraft es will). Sprache: nur Deutsch. Etwa zwei Wochen Unterricht: um 5 bis 6 Seiten, ein Kapitel.

**Quellen:** Lernlandkarte (geöffnet). KMK-Standard nur über die Karte. Kernlehrplan NRW nicht geprüft. Die Inhalte schreibe ich selbst; Zweitquellen je Kompetenz sind noch nicht gesucht (nicht geprüft).

## Explore

### Tasks

### Answers

<!-- The interview: per topic the creator's answer, in their words. Keep the topics. -->

- Goal: "beschleunigte Bewegung in Physik. Beschleunigen, Abbremsen und Richtungsänderung beschreiben; Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme zeichnen und ablesen. Nicht Kräfte und nicht a = Δv/Δt, das kommt in der Oberstufe."
- Learners: "Klasse 9, Gesamtschule, NRW, gemischte Leistung. Sie kennen v = s/t aus Klasse 7. Diagramme sind neu, viele finden sie schwer."
- Learners (Vorlage): subject, school year, prior knowledge. Land and Schulform only if the creator names a school or class,
  at most once; none → KMK-Bildungsstandards.
- Model and focus: "Erklärungen mit Aufgaben nach jedem Teil, zum Nachlesen und Üben zu Hause. Die Schüler sollen an den Diagrammen selbst etwas verändern und sehen, was passiert." Kein Katalogvorbild genannt.
- Model and focus (Vorlage): an app of the catalog (read https://lernapps.net/apps/llms.txt) as model; what matters most
  (exercises, visualisations, game feel).
- Hurdles: "Diagramme sind neu, viele finden sie schwer." Weitere Fehlvorstellungen von mir (guess), siehe Notes.
- Hurdles (Vorlage): misconceptions and mistakes of the learners; the creator's examples and experiments.
- Content: ich schreibe es; kein eigenes Material genannt (guess).
- Content (Vorlage): who writes it (creator, you, from sources); own material (worksheets, tests); how it is made (sources,
  research, a data format).
- Amount: "nicht zu groß, ein Kapitel mit ein paar Seiten, etwa für zwei Wochen Unterricht."
- Amount (Vorlage): how much content per level or chapter in the first version (e.g. "one text per school year"); what comes
  later.
- Languages: "Deutsch."
- Languages (Vorlage): German only, or German and English (texts, code). Never English only: an app without German still has
  German pages and runtime texts, so it mixes both. The creator wants English → offer German and English,
  both complete, and say why.
- Look and feel: nicht beantwortet; ruhig wie ein Arbeitsblatt (guess).
- Look and feel (Vorlage): calm like a worksheet, or like a game (colours, praise, effects); dark mode.
- Terms: nicht beantwortet; ich nehme Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, beschleunigen, abbremsen (guess).
- Terms (Vorlage): the creator's words for the main things in the app, used everywhere.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Beschleunigte Bewegung
subject: Physik
grades: [9]
summary: >-
  Schülerinnen und Schüler beschreiben, wann eine Bewegung schneller, langsamer
  wird oder die Richtung ändert. Sie verändern Weg-Zeit- und
  Geschwindigkeit-Zeit-Diagramme selbst, lesen sie ab und üben mit Aufgaben.
strand: physik/mechanik
keywords: [Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, Beschleunigung]
creator:
  name: Herr Demir
fitness:
  account: false
  install: false
  storage: device
  thirdParty: none
# url, source, commit: in Commit, from the published address and the repo.
```

### Completed

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

**Seiten** (ein Kapitel `beschleunigte-bewegung`, Anrede "du", Sektionen `einstieg`, `erklaerung`, `ausprobieren` nur wo bedient wird, `uebung`):
1. `geschwindigkeit-wiederholen`: Rückblick `recap: physik/geschwindigkeit-berechnen`, keine Aufgaben.
2. `beschleunigen-abbremsen`: `geschwindigkeitsaenderung`. Tacho-Werte zu Zeitpunkten: größer = beschleunigen, kleiner = abbremsen.
3. `richtung-aendern`: `geschwindigkeitsaenderung`. Auch bei gleichem Tacho ändert sich die Bewegung, wenn die Richtung wechselt.
4. `weg-zeit-diagramm`: `bewegungsdiagramme`. Muster-Seite. Nur das Weg-Zeit-Diagramm.
5. `geschwindigkeit-zeit-diagramm`: `bewegungsdiagramme`. Nur das Geschwindigkeit-Zeit-Diagramm.
6. `diagramme-zusammen`: `bewegungsdiagramme`. Beide Diagramme einer Bewegung zuordnen und zeichnen.
- Voraussetzungen: `geschwindigkeit-berechnen` (Karte) wird von der App nicht geübt, Seite 1 wiederholt es. `geschwindigkeit` und `strecke-und-zeit-messen` liegen darunter und werden in Seite 1 verlinkt (https://lernapps.net/apps/map/physik/c/geschwindigkeit/).

**Übungsmuster** (Physik, Lineare Bewegung):
- *Ablesen*: Diagramm als Bild/Tabelle gegeben, Wert oder Aussage gefragt. `number` und `single-choice` mit Begründung in `info`. Auf Seiten 4 bis 6.
- *Beschreiben*: Tacho-Werte in einer `table` zu Zeitpunkten; `single-choice` "beschleunigt / bremst / gleich"; `true-false` mit Grund für Fehlvorstellungen. Seiten 2 und 3.
- *Zuordnen*: `matching` Geschichte ↔ Diagramm und Weg-Zeit ↔ Geschwindigkeit-Zeit. Seite 6.
- *Berechnen*: `generated` Geschwindigkeit aus Weg und Zeit eines Diagrammabschnitts (v = s/t mit `\pu{m/s}`), mit Fehlern "Weg und Zeit vertauscht", "Einheit nicht umgerechnet". Seite 4.
- *Einstellen*: Übungskomponente `geschichte-einstellen` (Seite 6).

**Abbildungen:** SVG-Bilder in `src/<chapter>/images/` (Alltagsszenen, Tacho), `table` aus Datei `src/data/` für Tacho-Messreihen (je Bewegung eine Zeile je Zeitpunkt, jede Zahl einmal).

**Komponente `bewegungslabor`** (Skizze `.vibe/sketches/bewegungslabor.svg`, Seiten 4 bis 6, Parameter `view`: `st`, `vt` oder `both`):
- Das Ganze: eine Fahrt von 30 s in drei Abschnitten zu je 10 s; die Zeitachse (0 bis 30 s) und die Skalen bleiben fest, auch wenn die Regler bewegt werden.
- Teile und Marken: die blaue Linie ist der Weg s (Weg-Zeit-Diagramm), die orange Linie die Geschwindigkeit v (Geschwindigkeit-Zeit-Diagramm); Punkte an den Abschnittsgrenzen; beide Achsen mit Zahlen und Einheit.
- Schüler stellen pro Abschnitt die Geschwindigkeit mit einem Regler ein (0 bis 10 m/s). Gleich bleibt: die Dauer der Abschnitte und die Skala.
- Zum Satz der Seite: eine größere Geschwindigkeit macht die Weg-Linie steiler; Stillstand macht sie waagerecht; wird die Geschwindigkeit im nächsten Abschnitt größer, knickt die Weg-Linie nach oben ab.
- Seite 4 zeigt nur `st`, Seite 5 nur `vt`, Seite 6 `both`. Jede Seite sagt, was die Regler dort tun. Auf Seite 5 sagt sie: Die Richtung gibt es hier nicht, das Diagramm zeigt nur, wie schnell.
- Kann nicht: Rückwärtsfahren (alle v ≥ 0), gekrümmte Linien im Abschnitt; das Anwachsen der Geschwindigkeit zeigt sich nur als Stufen. Ohne JavaScript: Text und Tabelle der drei Stufen mit fest gewählten Werten.
- Logik in einem eigenen Modul mit Test (Wert je Zeitpunkt; Weg als Summe).

**Komponente `geschichte-einstellen`** (Skizze `.vibe/sketches/geschichte-einstellen.svg`, Seite 6):
- Eine kurze Geschichte ("Anna fährt los, rollt gleichmäßig, bremst vor der Ampel") ist gegeben. Schüler wählen für jeden der drei Abschnitte "schneller / gleich / langsamer"; das Geschwindigkeit-Zeit-Diagramm zeichnet sich nach der Wahl (feste Skala, Zahlen auf den Achsen).
- Nach "Prüfen" gibt es Rückmeldung je Abschnitt mit dem Grund. Die Figur zeigt die Wahl, nie die Lösung; kein Satz unter dem Regler wiederholt die Aufgabe.
- Mehrere Geschichten aus einer Datendatei; der Tutor bekommt `template`, `params`, `mistakes`, `show`.
- Kann nicht: freies Zeichnen. Ohne JavaScript: Text mit der Geschichte und eine Tabelle zum Ankreuzen.

**Warum Komponenten:** kein Block lässt Werte ändern und zwei Diagramme zugleich anpassen (`prefer-built-in-block`). Alles andere ist Block und `generated`.

**Nächstes Kapitel / neue Seite später:** Kopiere die Struktur einer bestehenden Seite, trage die Kompetenz-Id ein, Tacho-Daten kommen in `src/data/`, Aufgaben nach den Mustern oben. Der Plan der Erweiterung nutzt die Vorlage für Increments.

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
- [x] Muster-Seite `weg-zeit-diagramm` mit Komponente `bewegungslabor` (`view: st`), Tabelle, Ablese-Aufgaben und einer `generated`-Aufgabe, Glossar-Definitionen "Weg-Zeit-Diagramm" und "Geschwindigkeit"; commit auf `work` (`early-preview`).
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Start- und Kapitelseite: `src/app.yaml` (Titel, Einleitung "du", Quellen, Karte), `chapter.yaml` mit Seitenfolge; commit.
- [x] Seite `geschwindigkeit-wiederholen` (recap) mit Link zur Karte; commit.
- [x] Seite `beschleunigen-abbremsen` mit Tacho-Tabelle (Datei), Beschreiben-Aufgaben, `true-false` zu "Abbremsen = negative Geschwindigkeit"; commit.
- [x] Seite `richtung-aendern` mit Kreisbahn/Kurve-Bild, Aufgaben; commit.
- [x] Seite `geschwindigkeit-zeit-diagramm` mit `bewegungslabor` (`view: vt`), Ablese-Aufgaben; commit.
- [x] Seite `diagramme-zusammen` mit `bewegungslabor` (`view: both`), Komponente `geschichte-einstellen`, `matching`-Aufgaben; commit.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [x] Screenshots erzeugt (desktop und 360 px, `screenshots/`). Gesehen hat Herr Demir "Beide Diagramme zusammen" bei 360 px. Für alle sieben Seiten bei 360 und 1280 px habe ich mit Playwright gemessen, dass nichts über den Rand ragt; angesehen habe ich die Bilder nicht.
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
- [ ] Load skill `lernapps-github`. (Skill gelesen; Repo und Pages offen, weil kein GitHub-Zugang. Später.) Repo and Pages as it says: ask the repo name and every click only the creator can
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
