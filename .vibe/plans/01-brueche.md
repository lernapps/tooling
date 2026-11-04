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

# Plan: Brüche verstehen, kürzen und erweitern, first version

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

Schülerinnen und Schüler der Klasse 6 lesen kurze Erklärungen zu Brüchen, probieren Anteile an Streifen selbst aus und üben nach jedem Teil. Sie lernen, was ein Bruch ist (Anteil, Zähler, Nenner, Darstellung), und wie man Brüche kürzt, erweitert und vergleicht.

## Key decisions

- Archetyp `explainer`: Erklärungen mit Übungen nach jedem Teil, kein reines Quiz; Anteile zeigt man an Figuren, Lernende probieren selbst aus (Wunsch der Lehrkraft).
- Zwei Vue-Komponenten, weil kein Block einen Streifen zeigt, den Lernende selbst färben oder dessen Teilung sich ändert (`prefer-built-in-block`).
- Nur Deutsch (guess): Klasse 6 in Hessen, keine zweite Sprache genannt.
- Look: ruhig wie ein Arbeitsblatt, Dunkelmodus nach Gerät; der Explainer erlaubt keinen eigenen Look.
- Keine Wiederholungsseite zu Teilbarkeit: die Klasse hat sie gerade gehabt, die Kürzen-Seite verlinkt die Karte (Entscheidung der Lehrkraft: „entscheide du“).
- Selbsteinschätzung: eine pro Kapitel (guess, die Lehrkraft sagte „Entscheide du"): je Seite drei Übungen, Vorrang für Aufgaben mit neuen Zahlen und den Färb-Streifen.
- Kein `scope`: die App hat keine `open-task` und folgt keinem Material der Lehrkraft (guess).
- Dateien der Komponenten liegen flach in `src/components/` (`BruchStreifen.ts/.vue/.test.ts`), Bilder in `src/images/`.
- Brüche über 1 gehören zu „Brüche darstellen"; gemischte Zahlen und Bruchrechnen sind draußen (guess), Bruchrechnen kommt später im Unterricht.

## Notes

**Strand:** `mathematik/arithmetik` (Lernlandkarte https://lernapps.net/apps/map/mathematik.json, gelesen am 2026-11-04; Quelle der Karte: KMK-Bildungsstandards Mathematik ESA/MSA 2022).

**Lehrplan (Orientierung):** Hessisches Kultusministerium, *Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, Mathematik*, 2021. https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf (heruntergeladen, Text gelesen). Kapitel 7.3, Inhaltsfeld „Zahl und Operation", Jahrgangsstufe 5/6: „Brüche als Teil eines Ganzen, als Teil mehrerer Ganzer, als Maßzahl und zur Beschreibung von Verhältnissen"; „Vergleichen, Ordnen von natürlichen und gebrochenen Zahlen (gewöhnliche Brüche, Dezimalbrüche)"; „Teilbarkeit, Teiler und Vielfache (ggT, kgV, Primzahlen)"; „Darstellungen (Zahlenstrahl, Kreisdiagramm)". Die Kompetenzerwartungen am Ende der Jahrgangsstufe 6 (Kapitel 7.1) habe ich nicht im Wortlaut geprüft: nicht geprüft.

**Kompetenzen nach Kapitel** (Wortlaut und ids der Karte):

1. Kapitel „Brüche verstehen"
   - `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen. (requires `natuerliche-zahlen`: die App übt sie nicht, Link auf die Karte im Text, `prerequisites-linked`)
   - Seiten: „Was ist ein Bruch?" (Anteil, Ganzes, Zähler, Nenner) und „Brüche darstellen" (Streifen, Kreis, Zahlenstrahl; mehr als ein Ganzes). Zwei Seiten für eine große Kompetenz.
2. Kapitel „Kürzen und erweitern"
   - `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen. (requires `brueche-begriff`: geübt; `teilbarkeit`: nicht geübt, die Klasse hat es gerade gehabt, Link auf die Karte statt Wiederholungsseite)
   - Seiten: „Brüche erweitern" (gleichwertige Brüche), „Brüche kürzen", „Brüche vergleichen" (gleichnamig machen). Drei Seiten für eine große Kompetenz.

Insgesamt 5 Seiten in 2 Kapiteln, etwa zwei Wochen Unterricht.

**Didaktik:** Von der Erfahrung (Pizza, Schokolade teilen) zum Streifen als Ganzem. Der Streifen bleibt das Hauptbild, weil Erweitern und Kürzen am selben Streifen sichtbar werden: feineres Teilen ändert die Zahlen, nicht die gefärbte Fläche. Kreis und Zahlenstrahl kommen bei „Brüche darstellen" dazu, das Kerncurriculum nennt sie.

**Quellen:** Zweite Quellen (ein Artikel pro Kompetenz, z. B. serlo.org) habe ich noch nicht geöffnet: nicht geprüft. Fakten kommen aus der Mathematik selbst, keine Sätze werden übernommen.

**Wie Lernende zur Kompetenz kommen, und welcher Fehler abgefangen wird** (eine Zeile je Seite):

- `brueche-begriff`, Seite „Was ist ein Bruch?": Lernende teilen ein Ganzes (Streifen) in gleiche Teile und färben Teile; der Nenner ist die Anzahl der gleich großen Teile, der Zähler die Anzahl der genommenen. Fehler: Nenner = Anzahl der gefärbten Teile oder der ungefärbten Teile (z/(n−z)); ungleiche Teile gelten als Bruch.
- `brueche-begriff`, Seite „Brüche darstellen": dasselbe Ganze als Streifen, Kreis und Strecke am Zahlenstrahl; ein Bruch wie 5/4 braucht mehr als ein Ganzes. Fehler: am Zahlenstrahl die Striche statt der Abstände zählen; 5/4 sei „nicht möglich".
- `brueche-kuerzen-erweitern`, Seite „Brüche erweitern": jedes Stück des Streifens feiner teilen, die gefärbte Fläche bleibt gleich, Zähler und Nenner werden mit derselben Zahl mal genommen. Fehler: zu Zähler und Nenner dieselbe Zahl addiert.
- Seite „Brüche kürzen": die Umkehrung; gröber zusammenfassen, Zähler und Nenner durch denselben gemeinsamen Teiler teilen (Teilbarkeit: Link auf die Karte). Fehler: nur Zähler oder nur Nenner geteilt; nicht vollständig gekürzt.
- Seite „Brüche vergleichen": gleichnamig machen oder bei gleichem Zähler die Größe der Teile vergleichen. Fehler: „1/8 > 1/4, weil 8 > 4" (größerer Nenner = größerer Bruch).

**Umfang:** Drin: Anteil, Zähler, Nenner, Darstellung (Streifen, Kreis, Zahlenstrahl), Brüche größer als 1, erweitern, kürzen (auch vollständig), gleichwertige Brüche, Brüche zweier Zahlen vergleichen, Beispiele mit Nennern bis 24 (gewöhnliche Brüche mit kleinen Nennern, damit der Streifen lesbar bleibt). Draußen: gemischte Zahlen, Rechnen mit Brüchen, Dezimalbrüche, Prozent (kommen später im Unterricht bzw. in anderen Apps). Sprache: Deutsch.

**Teilbarkeit (guess, auf Wunsch der Lehrkraft):** Die Klasse hat das Thema gerade gehabt, deshalb keine Wiederholungsseite: ein Link im Text der Kürzen-Seite auf `https://lernapps.net/apps/map/mathematik/c/teilbarkeit/` (`prerequisites-linked`). Dasselbe für `natuerliche-zahlen` auf der ersten Seite.

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

- Goal: „Die App soll erklären, was ein Bruch ist (Anteile, Zähler und Nenner, Brüche darstellen) und wie man Brüche kürzt und erweitert (gleichwertige Brüche, Brüche vergleichen)." Erklärungen mit Aufgaben nach jedem Teil, kein reines Quiz; Anteile zeigen, die Kinder sollen selbst ausprobieren.
- Learners: Klasse 6, Gymnasium in Hessen. Bruchrechnen kommt später im Unterricht. Teilbarkeit haben sie gerade gemacht.
- Model and focus: kein Vorbild genannt (guess: die Prozent-Seiten von `mathe-arithmetik` im Katalog als Vorbild für Streifen und Übungen). Schwerpunkt: Anschauung und selbst ausprobieren, dann Übung.
- Hurdles: (1) Beim Erweitern wird zu Zähler und Nenner dasselbe addiert statt multipliziert. (2) Beim Kürzen wird nur der Zähler oder nur der Nenner geteilt. (3) Beim Vergleichen: „1/8 ist größer als 1/4, weil 8 größer ist als 4."
- Content: Ich schreibe die Inhalte aus Lehrplan und Mathematik; eigenes Material gibt es nicht. Daten als YAML im Explainer.
- Amount: ein Chapter-Paar, 5 Seiten, etwa zwei Wochen Unterricht. Später (nicht in dieser Version): gemischte Zahlen, Bruchrechnen, Dezimalbrüche.
- Languages: nur Deutsch (guess).
- Look and feel: nicht genannt (guess): ruhig wie ein Arbeitsblatt, Dunkelmodus nach Gerät, so wie der Explainer es vorgibt.
- Terms: nicht genannt (guess): Bruch, Zähler, Nenner, Ganzes, Anteil, gleichwertige Brüche, kürzen, erweitern, gleichnamig.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Brüche verstehen, kürzen und erweitern
subject: Mathematik
grades: [6]
summary: >-
  Lernende erfahren an Streifen, Kreisen und dem Zahlenstrahl, was ein Bruch ist, und probieren selbst aus, wie man
  Brüche erweitert und kürzt. Nach jedem Teil üben sie mit Aufgaben, die auf typische Fehler eingehen.
strand: mathematik/arithmetik
keywords: [Bruch, Zähler, Nenner, Anteil, kürzen, erweitern, gleichwertige Brüche, Brüche vergleichen, gleichnamig]
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

**Seitenaufbau** (feste Abschnitt-ids auf jeder Seite, Titel passend zur Seite): `einstieg` (Alltag, was die Kinder schon kennen), `erklaerung` (der neue Schritt, mit Figur), `ausprobieren` (Komponente, wo die Seite eine hat), `uebung`. Eine Seite, ein Schritt.

**Muster** (Name; Kompetenzart; Form; Beispiel; Datei):

- **Anteil färben** (darstellen): Komponente `BruchStreifen`; ein Streifen mit n gleichen Feldern, die Lernenden färben z Felder; n und z werden pro Aufgabe gewürfelt (n 2–12, z < n, auch z/n über einem Ganzen auf Seite 2 mit zwei Streifen). Beispiel „Färbe 3/4". Nicht in Datei, Logik in `src/components/BruchStreifen/`.
- **Anteil ablesen** (deuten): `generated`; Text nennt n gleiche Teile und z gefärbte; gefragt ist Zähler oder Nenner als Zahl. Fehler: Nenner = gefärbte Teile, z/(n−z). Beispiel „Ein Streifen ist in 8 gleiche Teile geteilt, 3 sind gefärbt. Wie heißt der Nenner?"
- **Wahr oder falsch mit Grund** (beurteilen): `true-false` und `single-choice` mit Grund in der Rückmeldung. Beispiel „Ein Kreis ist in 4 Teile geteilt, ein Teil ist größer: ist ein Teil 1/4?" Fehler: ungleiche Teile.
- **Erweitern** (rechnen): `generated`, fehlender Zähler oder Nenner als Zahl. Fehler: `z + k`, `n + k`. Beispiel „Erweitere 2/3 mit 4. Wie heißt der neue Zähler?" Eine zweite Aufgabe: „2/3 = ?/12".
- **Kürzen** (rechnen): `generated`, Zähler oder Nenner des gekürzten Bruchs als Zahl. Fehler: nur ein Teil geteilt (Nenner bleibt n; Zähler bleibt z), nicht vollständig gekürzt. Beispiel „Kürze 12/18 durch 6. Wie heißt der neue Nenner?" Eine zweite Aufgabe: vollständig kürzen.
- **Vergleichen** (vergleichen, ordnen): `single-choice` und `ordering` mit Material, `generated` für „gleichnamig machen: Zähler des ersten Bruchs". Fehler: „1/8 > 1/4, weil 8 > 4" mit Rückmeldung „Je mehr Teile, desto kleiner jedes Teil". Beispiel „Ordne 1/8, 1/4, 1/2".

**Figuren:**

- `bar` (ein Teil von einem Ganzen) für die Streifen im Text der Seiten 1 und 5.
- `image` (SVG) in `images/` für den Kreis, die Streifen untereinander (erweitert/gekürzt) und den Zahlenstrahl. Jedes Bild hat Alt-Text, Quelle „eigene Arbeit" und CC BY 4.0. Wo zwei Bilder zusammen stehen, trägt jedes eine sichtbare Beschriftung („vorher", „erweitert mit 3").
- Der Streifen ist immer das Ganze, 1 Streifen = 1 Ganzes; das steht vor jeder Figur im Text.

**Komponenten** (je ein Logikmodul, ein Test, ein Text für Leser ohne JavaScript; Skizzen in `.vibe/sketches/`):

1. `BruchStreifen` (Übung, Seiten 1 und 2): Das Ganze ist ein Streifen mit n gleich großen Feldern; die Aufgabe nennt den Bruch z/n. Gefärbte Felder sind blau und tragen zusätzlich ein Muster, ungefärbte sind weiß. Lernende klicken Felder an; n und der Bruch bleiben fest. Sie prüfen, ob die gefärbte Fläche dem Bruch entspricht; so erleben sie, dass der Zähler zählt, wie viele von n Teilen genommen werden. Kein Zähler vor „Prüfen" (`explainer-figure-hides-answer`). Prüft: genau z Felder gefärbt. Prüft nicht: Reihenfolge der Felder. Rückmeldung nach „Prüfen": zu wenige/zu viele Felder, oder „Du hast n−z gefärbt: das ist der Rest". Er deklariert seine Aufgabe für den Tutor (`template`, `params`, `mistakes`, `show`).
2. `StreifenTeilen` (Modell, Seiten 3 und 4): oben ein Streifen mit n Teilen und z gefärbten („vorher"), darunter derselbe Streifen, in dem jedes Stück in k gleiche Teile geteilt ist („erweitert mit k"). Lernende wählen k von 1 bis 6; die gefärbte Fläche bleibt gleich, die Zahlen unter den Streifen (Zähler und Nenner) ändern sich. Auf der Kürzen-Seite läuft es umgekehrt: Sie wählen, wie viele Stücke zu einem zusammengefasst werden (nur Teiler von n und z). So sehen sie, dass beide Zahlen mit demselben Faktor mal oder durch genommen werden. Das Modell stellt keine Aufgabe, es zeigt die Zahlen live; danach folgt die Übung der Seite. Der Regler hat die sichtbare Aufgabe „Jedes Stück teilen in".

**Ohne JavaScript:** jede Seite steht vollständig da; Komponenten zeigen den Text („Streifen mit 3 von 4 gefärbten Feldern") und die Übungen der Seite gelten.

**Datendateien:** `src/data/brueche.yaml` mit Beispielbrüchen (z, n, Alltagsbild: Pizza, Tafel Schokolade, Kuchen) für Einstiege und Aufgaben; jede Tatsache einmal.

**Neues Kapitel oder neue Seite später:** Ordner `src/<kapitel>/` mit `chapter.yaml` und `<seite>.yaml` nach dem Muster der Seite „Brüche erweitern", gleiche Abschnitt-ids, Komponenten aus `src/components/`, eine Zeile in den Content-Guide (`app-content`) und eine Kompetenz-id aus der Karte pro Seite.

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
- [x] Seite 1 „Was ist ein Bruch?" als Muster: Einstieg, Erklärung mit `bar`, Komponente `BruchStreifen` (Logik, Test, Text ohne JavaScript), `generated` „Anteil ablesen", `true-false` zu ungleichen Teilen, Link auf `natuerliche-zahlen`; Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Seite 2 „Brüche darstellen": SVGs Kreis und Zahlenstrahl, Brüche über 1 als SVG mit zwei Streifen und am Zahlenstrahl, Übungen `matching`/`single-choice`; Commit.
- [x] Seite 3 „Brüche erweitern": Komponente `StreifenTeilen` (Logik, Test, Text ohne JavaScript, Skizze `streifen-teilen.svg`), `generated` mit Fehler „addiert statt multipliziert"; Commit.
- [x] Seite 4 „Brüche kürzen": `StreifenTeilen` in Kürzen-Richtung, `generated` mit den Fehlern „nur Zähler oder nur Nenner geteilt" und „nicht vollständig gekürzt", Link auf `teilbarkeit`; Commit.
- [x] Seite 5 „Brüche vergleichen": `single-choice`, `ordering` mit Material, `generated` „gleichnamig machen", Rückmeldung zu „1/8 > 1/4"; Commit.
- [x] Startseite, Kapiteltexte, Glossar (Bruch, Zähler, Nenner, gleichwertige Brüche), Lizenzen, Tutor-Regeln; Commit.
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
