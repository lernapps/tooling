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
failedChecks: { checks-pass: 3 }
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

*Started 2026-11-04. Explore, Plan, Code, Commit.*

## Goal

Schülerinnen und Schüler der Klasse 6 lernen, was ein Bruch ist (Anteil eines Ganzen, Zähler und Nenner, Darstellung am Streifen, Kreis und Zahlenstrahl), und wie man Brüche kürzt, erweitert und der Größe nach vergleicht. Sie sehen Anteile und probieren sie selbst aus; nach jedem Teil üben sie.

## Key decisions

- Archetyp `explainer`: Brüche sind neu, Kinder brauchen erst Bild und Erklärung und üben dann; das Quiz erklärt nichts, `interactive` ist für Spiel und Trainer.
- Ein Kapitel, 5 Seiten und 1 Wiederholungsseite, für etwa zwei Wochen Unterricht (Wunsch der Lehrkraft: nicht zu groß).
- Selbst ausprobieren: eine Komponente `bruchstreifen` (Streifen mit wählbarer Teilung und Färbung), weil kein Block das kann; mit Text für Lesende ohne JavaScript. (guess: nur diese eine Komponente)
- Strand `mathematik/arithmetik`; nur die zwei Bausteine `brueche-begriff` und `brueche-kuerzen-erweitern`. Das Rechnen mit Brüchen gehört nicht dazu (Wunsch der Lehrkraft).
- Fehlvorstellungen und Rückmeldungen wählt die Assistenz aus Lehrplan und Erfahrung (Auftrag der Lehrkraft, kein eigenes Material).
- Sprache: nur Deutsch. (guess)
- Aussehen: ruhig wie ein Arbeitsblatt, Dunkelmodus nach Gerät; beim Erklärstück fest. (guess: nichts Eigenes)
- Begriffe: Bruch, Zähler, Nenner, Ganzes, Bruchteil, Anteil, gleichwertig, kürzen, erweitern, Bruchstreifen. (guess)
- `scope`: keiner, weder in `src/app.yaml` noch auf den Seiten: es gibt keine `open-task` und kein Material der Lehrkraft (`explainer-scope-matches`).  (guess)
- Höchste Teilung am Streifen: 10 Teile statt 12, weil die Teile am Handy sonst zu schmal zum Antippen sind (Entscheidung auf Wunsch der Lehrkraft).
- Weiterführender Link bei jeder Frage: Wikipedia "Bruchrechnung" (geöffnet am 2026-11-04); keine weiteren zweiten Quellen. (guess)
- Gleichnamig machen: als gemeinsamer Nenner wird das Produkt der Nenner genannt, kleinerer nur als Hinweis (kein kgV in Klasse 6 an dieser Stelle). (guess)

## Notes

**Strand:** `mathematik/arithmetik` (Lernlandkarte https://lernapps.net/apps/map/mathematik/, gelesen am 2026-11-04). Beide Bausteine: Klassenstufe 5-6, bisher von keiner App geübt.

**Lehrplan:** Kerncurriculum Mathematik Gymnasium (Sekundarstufe I), Hessisches Kultusministerium, 2021, https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf. **Nicht geprüft:** die PDF wurde geladen, konnte hier aber nicht gelesen werden (kein PDF-Werkzeug). Es wird keine Einheit zitiert. Reihenfolge und Klassenstufe folgen der Lernlandkarte (KMK-Bildungsstandards Mathematik ESA und MSA, 2022) und der Angabe der Lehrkraft (Klasse 6).

**Kompetenzen nach Kapitel** (Wortlaut der Karte):

Kapitel `brueche` — Brüche
- `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen. (Seiten 1 und 2)
- `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen. (Seiten 3, 5, 6)

**Seiten (Reihenfolge nach `requires`):**
1. `anteile` — Ein Bruch ist ein Teil eines Ganzen: gleiche Teile, Zähler und Nenner (`brueche-begriff`)
2. `darstellen` — Brüche darstellen: Streifen, Kreis, Zahlenstrahl (`brueche-begriff`)
3. `erweitern` — Gleichwertige Brüche: erweitern (`brueche-kuerzen-erweitern`)
4. `wiederholung-teilbarkeit` — Wiederholung ohne Übung (`recap: mathematik/teilbarkeit`)
5. `kuerzen` — Brüche kürzen (`brueche-kuerzen-erweitern`)
6. `vergleichen` — Brüche vergleichen (`brueche-kuerzen-erweitern`)

Der Baustein `brueche-kuerzen-erweitern` ist groß und steht auf drei Seiten; das ist erlaubt.

**Voraussetzungen, die die App nicht übt:** `natuerliche-zahlen` (für `brueche-begriff`): Link zur Karte im Text von Seite 1, keine Wiederholungsseite. `teilbarkeit` (für `brueche-kuerzen-erweitern`): eigene Wiederholungsseite vor dem Kürzen, weil das Kürzen auf gemeinsamen Teilern beruht.

**Didaktik:** vom Bild zur Regel. Zuerst am Streifen sehen und selbst färben, dann Zähler und Nenner benennen, dann die Regel aus dem Bild ableiten (Erweitern = feiner einteilen, der gefärbte Anteil bleibt gleich; Kürzen = umgekehrt). Brüche vergleichen über gleichen Nenner oder gleichwertige Brüche.

**Pro Seite: Weg und abgefangene Fehlvorstellung**
- Seite 1 (Anteile): Die Kinder teilen und färben Ganze in gleiche Teile, benennen Zähler und Nenner und erkennen, wann Teile nicht gleich groß sind. Fehler: ungleiche Teile werden mitgezählt; Zähler und Nenner vertauscht ("3 von 4 gefärbt" als 4/3).
- Seite 2 (Darstellen): Derselbe Bruch am Streifen, am Kreis und am Zahlenstrahl; vom Bruch zum Bild und vom Bild zum Bruch. Fehler: auf dem Zahlenstrahl werden Striche statt Abschnitte gezählt (die 0 mitgezählt).
- Seite 3 (Erweitern): Teile am Streifen weiter unterteilen und die gefärbten Teile mitzählen; die Regel (Zähler und Nenner mit derselben Zahl multiplizieren) wird daraus abgeleitet. Fehler: nur den Nenner multiplizieren; dieselbe Zahl addieren statt multiplizieren (2/3 zu 4/5); "Erweitern verändert den Wert".
- Seite 5 (Kürzen): Gemeinsame Teiler von Zähler und Nenner bestimmen, Teile zusammenfassen. Fehler: Zähler und Nenner durch verschiedene Zahlen teilen; Differenz statt Quotient (4/6 zu 2/4); nicht vollständig gekürzt.
- Seite 6 (Vergleichen): Gleicher Nenner → Zähler vergleichen; sonst gleichnamig machen oder gleichwertige Brüche am Streifen und Zahlenstrahl. Fehler: "größerer Nenner heißt größerer Bruch" (1/8 größer als 1/4); nur Zähler oder nur Nenner verglichen.

**Umfang:**
- Drin: echte Brüche (Zähler kleiner als Nenner, Wert zwischen 0 und 1), Nenner am Streifen bis 12; Kürzen und Erweitern mit Zahlen bis 100; zwei Brüche vergleichen.
- Draußen: Rechnen mit Brüchen (Wunsch der Lehrkraft), unechte Brüche und gemischte Zahlen (kommen mit dem Rechnen; guess), Dezimalbrüche und Prozent (eigene Bausteine der Karte), Bruchteil einer Größe berechnen (`bruchrechnung-grundaufgaben`).
- Sprachen: Deutsch.

**Quellen:** Zweite Quellen (Artikel oder Video je Kompetenz) wurden nicht gesucht und nicht geöffnet; es steht keine in der App, bis eine geöffnet und geprüft ist. Inhalte stammen aus dem Fachwissen der Assistenz, keine Sätze aus fremden Texten. Eigenes Material der Lehrkraft: keines.

**Offene Fragen:** Stichwörter für die Auffindbarkeit (siehe Eintragsentwurf).

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
- [ ] Load skill `lernapps-app`. Tell the creator in two sentences what a lernapps app is and where it will live: at
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

- Goal: "Die App soll erklären, was ein Bruch ist (Anteile, Zähler und Nenner, Brüche darstellen) und wie man Brüche kürzt und erweitert (gleichwertige Brüche, Brüche vergleichen). Das Rechnen mit Brüchen kommt später, das gehört nicht dazu." Und: "Die Kinder sollen Anteile sehen und selbst ausprobieren können."
- Learners: "meine Klasse 6 am Gymnasium in Hessen. Sie kennen die natürlichen Zahlen, das Einmaleins und die Teilbarkeit, Brüche sind neu."
- Model and focus: kein Vorbild genannt. Schwerpunkt: Anteile sehen und selbst ausprobieren, Übungen nach jedem Teil ("ein Erklärstück mit Übungen nach jedem Teil ist genau richtig"). (guess: kein Vorbild aus dem Katalog)
- Hurdles: "Bei den typischen Fehlern entscheide du, nimm den Lehrplan und deine Erfahrung als Orientierung." Gewählt, siehe Notes. (guess)
- Content: "ich habe kein eigenes Material": die Assistenz schreibt die Inhalte aus Lehrplan-Orientierung und Fachwissen.
- Amount: "nicht zu groß, ein Kapitel mit ein paar Seiten, etwa für zwei Wochen Unterricht."
- Languages: nicht gefragt. (guess: nur Deutsch)
- Look and feel: nicht gefragt. (guess: ruhig wie ein Arbeitsblatt, bei diesem Archetyp fest)
- Terms: nicht gefragt. (guess: Bruch, Zähler, Nenner, Ganzes, Bruchteil, Anteil, gleichwertig, kürzen, erweitern)

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Brüche verstehen, kürzen und erweitern
subject: Mathematik
grades: [6]
summary: >-
  Du lernst, was ein Bruch ist, und siehst Anteile an Streifen, Kreisen und am Zahlenstrahl. Du probierst selbst aus,
  wie man Brüche erweitert und kürzt und welcher von zwei Brüchen größer ist. Nach jedem Teil übst du mit Rückmeldung.
strand: mathematik/arithmetik
keywords: [Bruch, Zähler, Nenner, Kürzen, Erweitern, gleichwertige Brüche, Brüche vergleichen, Bruchteil, Anteil]
# url, creator, source and commit are filled in Commit (address, owner, repo are not known yet).
# fitness (guess): account false, install true, storage none, thirdParty none.
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

**Seitenaufbau** (feste Abschnitts-ids, Titel passen zur Seite): `einstieg` (Alltagssituation, knüpft an Vorwissen an), `anschaulich` (Bild und Erklärung), `ausprobieren` (Komponente, nur wo es etwas zu bedienen gibt), `merke` (Definition, Regel, Beispiel-Kasten), `uebung`. Anrede "du", kurze Sätze (Klasse 6). Skizzen: `.vibe/sketches/seite-anteile.svg`, `.vibe/sketches/bruchstreifen.svg`.

**Abbildungen:** Eigene SVG-Zeichnungen in `src/images/` (Bruchstreifen, Kreis, Zahlenstrahl; `source: eigene Zeichnung`, `licence: CC-BY-4.0`), mit `alt` und Bildunterschrift. Immer dieselben Konventionen (steht im Inhaltsleitfaden, "Figures"): gefärbt = Blau mit Muster, leer = weiß, das Ganze ist der ganze Streifen oder Kreis, Teile mit dunkler Linie getrennt. Bei Übungen zeigt das Bild nur Gegebenes, nie die Antwort. Das eingebaute `bar` und `hundred-grid` taugen nicht (sie zeigen Prozent).

**Komponente `Bruchstreifen`** (`prefer-built-in-block`: kein eingebauter Block lässt Kinder die Teilung wählen und Teile färben). Vier Modi, ein Streifen oder zwei Streifen untereinander. Sie prüft nichts und ist keine Übung; die Seite hat zusätzlich eigene Aufgaben. Mit `nojs`-Text (Aufgabe und Ergebnis beschrieben).
- `anteil` (Seite 1, 2): Ein Streifen, das Ganze. Start: ein Teil, nichts gefärbt. Knöpfe − und + stellen den Nenner ein (1 bis 12), der Streifen wird in so viele gleiche Teile geteilt. Tippen auf ein Teil färbt es oder macht es leer. Darunter steht, wie viele von wie vielen Teilen gefärbt sind (nur beim Ausprobieren, nie in einer Aufgabe). Bleibt gleich: das Ganze. Ändert sich: Teilung und Färbung. Das führt zur Aussage: Nenner = Anzahl gleicher Teile, Zähler = gefärbte Teile.
- `erweitern` (Seite 3): Oben der gegebene Bruch (Beschriftung "vorher"), unten derselbe Streifen feiner geteilt (Beschriftung "erweitert mit k"). Knöpfe 2, 3, 4, 5 wählen k. Bleibt gleich: die gefärbte Länge. Ändert sich: die Zahl der Teile. Führt zur Regel: Zähler und Nenner mal k.
- `kuerzen` (Seite 5): Oben der gegebene feine Bruch ("vorher"), unten der gröbere ("gekürzt mit t"). Der Knopf "Zusammenfassen" wählt t aus den gemeinsamen Teilern von Zähler und Nenner; ein t, das nicht beide teilt, ist abgeschaltet und sagt warum. Bleibt gleich: die gefärbte Länge.
- `vergleichen` (Seite 6): Zwei Streifen untereinander, je mit eigenem Nenner und eigener Färbung, beide bleiben stehen (kein Vergleich aus dem Gedächtnis). Beschriftet "links"/"rechts" mit Bruch. Wer vergleicht, sieht, welcher Streifen länger gefärbt ist und warum der größere Nenner nicht den größeren Bruch macht.
- Logik rein in `Bruchstreifen.ts`, Tests in `Bruchstreifen.test.ts`; nur CSS-Variablen der Seite, zweites Merkmal neben der Farbe (Muster), alle Knöpfe 44 px, Tastatur.

**Übungsmuster** (alle mit `examples` accepted/rejected, Fehlermeldungen benennen den Fehler und den Weg):
- *Anteil benennen* (Seite 1, `generated`): "Eine Tafel hat {{n}} gleich große Stücke, du isst {{z}}. Welchen Nenner hat der Bruch?" / Zähler. Fehler: Zähler und Nenner vertauscht ("Das ist der Zähler: so viele hast du gegessen"), Rest statt Anteil (n − z).
- *Wahr/falsch mit Begründung* (Seite 1, `true-false`): "Die Teile müssen gleich groß sein." / "Bei 1/4 sind 4 Teile gefärbt." Begründung steht in der Rückmeldung.
- *Bild lesen* (Seiten 1, 2, `single-choice` mit `material`-Bild): "Welcher Bruch ist gefärbt?" Falsche Optionen sind echte Fehler (Zähler und Nenner vertauscht; leere statt gefärbte Teile; ungleiche Teile) mit `info`. Auf dem Zahlenstrahl: Striche statt Abschnitte gezählt, 0 mitgezählt.
- *Bruch zuordnen* (Seite 2, `matching`): Bruch ↔ Wortbeschreibung ("drei Viertel").
- *Erweitern* (Seite 3, `generated` mit Datenfile `src/data/erweitern.yaml`, Felder z, n, k, zNeu, nNeu): "Erweitere {{e.z}}/{{e.n}} mit {{e.k}}. Wie heißt der neue Zähler?" Fehler: z + k (addiert), z (nur Nenner erweitert), n·k. Schritte mit den Zahlen der Aufgabe. Zusätzlich `true-false`: "Erweitern ändert den Wert des Bruchs."
- *Kürzen* (Seite 5, `generated`, Datenfile `src/data/kuerzen.yaml`, Felder z, n, t, zNeu, nNeu): "Kürze {{e.z}}/{{e.n}} mit {{e.t}}. Wie heißt der neue Nenner?" Fehler: n − t (subtrahiert), n (nur Zähler gekürzt), mit der Hälfte. Dazu `single-choice`: "Welcher Bruch ist vollständig gekürzt?" (Fehler: noch durch 2 teilbar, mit angeben).
- *Vergleichen* (Seite 6, `generated` mit `choice`, Datenfile `src/data/vergleichen.yaml`: zwei Brüche, gemeinsamer Nenner, erweiterte Zähler): "Welcher Bruch ist größer?" Fehler: "größerer Nenner" (1/8 gegen 1/4), nur Zähler. Dazu `ordering` mit Stammbrüchen oder Brüchen gleichen Nenners (1/2, 1/4, 1/8 …) von klein nach groß, nur wo die Reihenfolge eindeutig ist.
- Zahlenbereich: echte Brüche (Zähler < Nenner), Nenner 2 bis 12 am Streifen, Kürzen und Erweitern mit Nenner bis 100; ein Faktor oder Teiler passt zur Aufgabe (Vorbedingungen in `where`).

**Wiederholungsseite** (`recap: mathematik/teilbarkeit`, ohne Übung): `text`, `definition` Teiler und Vielfaches, `table` der Teilbarkeitsregeln für 2, 3, 5, 9, 10; Hinweis, warum das Kürzen sie braucht.

**Neue Seite oder neue Runde später:** (1) Seite `<name>.yaml` in `src/brueche/`, in `chapter.yaml` eintragen; (2) `competencies` aus der Karte; (3) feste Abschnitts-ids; (4) Aufgaben in `src/data/<name>.yaml`, ein Eintrag je Aufgabe mit allen Zahlen der Schritte; (5) Abbildungen in `src/images/` nach den Konventionen. Wird zum Inhaltsleitfaden `app-content`.

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
- [x] **Musterseite `anteile`** mit Komponente `Bruchstreifen` (Modus `anteil`), Abbildungen, Aufgaben nach dem Muster der Skizze `.vibe/sketches/seite-anteile.svg`; `src/app.yaml` (Titel, Einführung, `format: 2`, `strand: mathematik/arithmetik`, `languages: [de]`), Kapitel `brueche` mit `chapter.yaml`. Commit.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Seite `darstellen`: Streifen, Kreis, Zahlenstrahl (SVG), Bild-lesen-Aufgaben, Zuordnen. Commit.
- [x] Seite `erweitern`: `Bruchstreifen` Modus `erweitern`, Datenfile `erweitern.yaml`, Aufgaben. Commit.
- [x] Seite `wiederholung-teilbarkeit` (Wiederholung ohne Übung). Commit.
- [x] Seite `kuerzen`: Modus `kuerzen`, Datenfile `kuerzen.yaml`, Aufgaben. Commit.
- [x] Seite `vergleichen`: Modus `vergleichen`, Datenfile `vergleichen.yaml`, Aufgaben. Commit.
- [x] Startseite (Einführung für Kinder, Lehrkräfte), Glossar-Definitionen vollständig, Verlinkung `natuerliche-zahlen` auf Seite 1 prüfen. Commit.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [ ] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
      each with the confirmed sketches; each figure in its own image (`npx --no -- lernapps screenshots --desktop`).
      Offen: Die Screenshots sind erzeugt (screenshots/), aber nicht angesehen: die Assistenz konnte in dieser Sitzung keine Bilder ansehen, und die Lehrkraft hat gesagt, dass sie sie nicht ansieht.
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
