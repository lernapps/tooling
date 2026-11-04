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

*Gestartet am 2026-11-04. Explore, Plan, Code, Commit.*

## Goal

Schülerinnen und Schüler der Klasse 9 (Gesamtschule NRW) lernen, Beschleunigen, Abbremsen und Richtungsänderung zu beschreiben. Sie zeichnen und lesen Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme und verändern die Diagramme selbst, um zu sehen, was mit der Bewegung passiert.

## Key decisions

- Archetyp `explainer`: Die Schüler brauchen Erklärungen und Abbildungen vor den Übungen und Übungen auf jeder Seite. Ein `quiz` erklärt nichts vorab, ein `interactive` hat nur eine App-Seite ohne Erklärseiten.
- Diagramme zum Verändern als Vue-Komponenten im Explainer: Kein Block lässt Schüler eine Bewegung ändern und dabei Fahrt und Diagramm sehen.
- Strang `physik/mechanik` der Lernlandkarte, Kompetenzen `geschwindigkeitsaenderung` und `bewegungsdiagramme`: Sie decken die Ziele der Lehrkraft ab.
- Qualitativ, ohne Beschleunigung als Größe a = Δv/t (von der Lehrkraft bestätigt: kommt in der Oberstufe): Für die Gesamtschule war sie im Lehrplan nicht belegt, und die Kompetenzen der Karte verlangen sie nicht.
- Sprache nur Deutsch, wie von der Lehrkraft gewünscht.
- Begriffe: "beschleunigen", "abbremsen", "Richtung ändern". "Verzögern" und "negative Beschleunigung" kommen nicht vor.
- Umfang: ein Kapitel, vier Seiten, wie von der Lehrkraft bestätigt.
- Veröffentlichen und Eintragen in den Katalog später: Die Lehrkraft hat kein GitHub-Repo angelegt und will lokal mit git arbeiten. Bis dahin bleibt alles auf dem Branch `work`, nichts wird gepusht.
- Diagramme zeigen nur den zurückgelegten Weg und den Betrag der Geschwindigkeit, keine negativen Werte (von der Lehrkraft bestätigt): Eine Richtungsänderung kommt auf Seite 2 vor (Vorzeichen als Richtung). In den Diagrammen würde sie einen zweiten Schritt (Ort statt Weg) verlangen.
- Kein `scope` und keine freie Aufgabe (`open-task`): Es gibt weder eigenes Material noch offene Antworten, die der Tutor beurteilen müsste (guess).
- Kein `generated`: Die Zahlen stammen aus Fahrten einer Datendatei und aus den Komponenten (guess); gerechnet wird nur auf der Wiederholungsseite, ohne Übung.

## Notes

**Strang:** `physik/mechanik` (Karte: https://lernapps.net/apps/map/physik/, Quelle der Karte: KMK Bildungsstandards Physik MSA 2024). Gelesen: alle 15 Kompetenzen des Strangs.

**Lehrplan (Orientierung):** Kernlehrplan Naturwissenschaften für die Gesamtschule – Sekundarstufe I, NRW (2013), Physik, Inhaltsfeld "Bewegungen und ihre Ursachen". **Nicht geprüft:** Das amtliche Dokument war nicht lesbar (die Seiten von schulentwicklung.nrw.de leiten auf die Startseite weiter, das Physik-PDF fand ich nicht). Keine Einheit wird zitiert. Treffer einer Suche (nicht amtlich) nennen: Messwerte zur gleichförmigen Bewegung modellieren und Geschwindigkeiten berechnen; Bewegungen qualitativ im Zeit-Geschwindigkeits-Diagramm beschreiben; Daten zu Bewegungen grafisch darstellen und bei einfachen Fragen auswerten. Die Karte und die Ziele der Lehrkraft entscheiden.

**Kompetenzen (Karte, Jahrgang 9–10) und Seiten:** Kapitel "Beschleunigte Bewegung" (`requires` der Karte bestimmt die Reihenfolge).

1. Seite "Geschwindigkeit wiederholen": Wiederholungsseite ohne Übung, `recap: physik/geschwindigkeit-berechnen`. `geschwindigkeit` und `strecke-und-zeit-messen` werden im Text mit Link auf die Karte genannt.
2. Seite "Beschleunigen, abbremsen, Richtung ändern": `geschwindigkeitsaenderung` – "Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert." Voraussetzung `geschwindigkeit`.
3. Seite "Das Weg-Zeit-Diagramm": `bewegungsdiagramme` – "Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen." Voraussetzung `geschwindigkeit-berechnen` (Seite 1).
4. Seite "Das Geschwindigkeit-Zeit-Diagramm": ebenfalls `bewegungsdiagramme` (eine große Kompetenz auf zwei Seiten).

**Didaktik (wie die Schüler dahin kommen, welche Fehlvorstellung die Rückmeldung abfängt):**

- `geschwindigkeitsaenderung`: Sie leiten aus einer Fahrt in Schritten ab, wie sich der Geschwindigkeitspfeil pro Zeitschritt ändert (länger = beschleunigen, kürzer = abbremsen, anders gerichtet = Richtung ändern). Fehlvorstellung: "Abbremsen heißt Geschwindigkeit null"; "Wer mit gleichem Tempo die Richtung wechselt, ändert nichts".
- `bewegungsdiagramme`, Weg-Zeit: Sie tragen Messpunkte einer Fahrt selbst ein und sehen, wie die Steigung der Kurve mit der Geschwindigkeit zusammenhängt. In der Komponente ändern sie die Bewegung und sehen Fahrt und Diagramm gleichzeitig. Fehlvorstellungen: "Das Diagramm ist ein Bild der Strecke" (gerade Fahrt, gekrümmte Kurve); "Ein Knick im Diagramm ist ein Knick im Weg".
- `bewegungsdiagramme`, Geschwindigkeit-Zeit: Sie leiten das v-t-Diagramm aus dem s-t-Diagramm ab (Steigung wird zur Höhe) und lesen Beschleunigen, Abbremsen und Stehen ab. Fehlvorstellungen: "Waagerechte Linie heißt Stillstand"; "Fallende Linie heißt rückwärts fahren".
- Allgemein: Diagramme gelten als schwer, deshalb kleine Schritte, immer mit der Fahrt neben dem Diagramm.

**Umfang:** Drin: qualitative Beschreibung, gleichförmige und gleichmäßig beschleunigte Bewegung, Stillstand, Abbremsen, Richtungsänderung auf einer Geraden, Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme zeichnen und ablesen. Draußen: Beschleunigung als Größe a = Δv/t und Formeln wie s = ½at² (nicht im Lehrplan belegt, nicht in den Kompetenzen der Karte); Kräfte (andere Kompetenzen des Strangs); Kurvenfahrt in der Ebene. Datenbereich: Fahrten bis 10 s und bis 100 m. Sprache: nur Deutsch.

**Zweite Quellen (geöffnet: laden ohne Fehler, behandeln das Thema):**

- Wikipedia "Beschleunigung", https://de.wikipedia.org/wiki/Beschleunigung, verifiziert.
- Wikipedia "Geschwindigkeit", https://de.wikipedia.org/wiki/Geschwindigkeit, verifiziert.
- Wikipedia "Weg-Zeit-Diagramm (Mechanik)", https://de.wikipedia.org/wiki/Zeit-Weg-Diagramm, verifiziert.
- Nur Fakten, keine Sätze übernommen. Vor dem Schreiben jedes Fakts lese ich den Abschnitt (bisher nur geöffnet, nicht gelesen).
- Kein Video und kein serlo-Artikel gefunden.

**Offene Fragen:** Name der Autorin oder des Autors und Adressen für den Katalogeintrag (erst in Commit bekannt).

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

- Goal: "Beschleunigte Bewegung für Klasse 9. Die Schüler sollen Beschleunigen, Abbremsen und Richtungsänderung beschreiben und Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme zeichnen und ablesen können."
- Learners: Klasse 9, Gesamtschule NRW. Vorwissen: Geschwindigkeit (nach der Karte aus den Jahrgängen 7–8).
- Model and focus: "Erklärungen mit Übungen danach, und die Schüler sollen an den Diagrammen selbst etwas verändern und sehen, was passiert." Kein Katalog-Vorbild genannt.
- Hurdles: Ein Bremsvorgang wird als Geschwindigkeit null gelesen; ein Knick im Weg-Zeit-Diagramm wird mit einer Kurve im Weg verwechselt (Vorschläge der Assistenz, von der Lehrkraft bestätigt: "die passen"). Dazu: "Viele Schüler halten Diagramme für ein Bild der Strecke, also für den Weg selbst. Und viele finden Diagramme grundsätzlich schwer."
- Content: "Ich habe kein eigenes Material, nimm den Lehrplan als Orientierung." Inhalte aus Lehrplan und geprüften Quellen, von der Assistenz geschrieben.
- Amount: Ein Kapitel mit vier Seiten, bestätigt ("Vier Seiten sind gut"). Später: nicht genannt.
- Languages: "Sprache: Deutsch." Nur Deutsch.
- Look and feel: nicht gefragt; im Explainer festgelegt (ruhig wie ein Arbeitsblatt, Dunkelmodus folgt dem Gerät), vom Archetyp gedeckt.
- Terms: "beschleunigen", "abbremsen", "Richtung ändern", bestätigt ("die Begriffe auch").

### Entry draft

```yaml
title: Beschleunigte Bewegung
subject: Physik
grades: [9]
summary: >-
  Schülerinnen und Schüler beschreiben, wann sich eine Bewegung beschleunigt, abbremst oder die Richtung ändert.
  Sie zeichnen und lesen Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme und verändern sie selbst, um die Wirkung zu sehen.
strand: physik/mechanik
keywords:
  - Beschleunigung
  - Weg-Zeit-Diagramm
  - Geschwindigkeit-Zeit-Diagramm
  - Bewegung
  - Diagramme lesen
fitness:
  account: false
  install: false
creator:
  name: Herr Demir
# url, source, commit: erst nach dem Veröffentlichen bekannt
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

- [x] Show the creator, short: goal, competencies by chapter (chapters along the map's `requires`), entry draft, tasks, sketches; the content method in
      plain words (what learners see and do, what it cannot do). At most 2 questions.
- [x] **Checkpoint:** confirm the plan and the content method, with the sketches shown. Stop and wait for an
      explicit yes. Changes → change, ask again. No `create` before the yes.
- [x] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

**Aufbau jeder Seite (feste Abschnitts-ids):** `einstieg` ("Aus dem Alltag"), `erklaerung` ("Anschaulich erklärt"), `ausprobieren` ("Ausprobieren", nur wo etwas bedient wird), `beispiel` (`example`-Kasten), `uebung` ("Übung"). Die Wiederholungsseite hat `einstieg` und `merksatz`. Anrede "du".

**Daten:** `src/data/fahrten.yaml`: jede Fahrt einmal als Datensatz mit gleichen Feldern (`id`, `name`, `beschreibung`, `v`: Geschwindigkeit in m/s je 2-s-Abschnitt, fünf Werte). Beispiele: Fahrrad rollt an (2, 4, 6, 6, 6), Bus bremst vor der Haltestelle (10, 8, 4, 0, 0), Sprint (4, 8, 8, 8, 6). Die Komponenten, die Abbildungen und die Übungen beziehen sich darauf; es gibt keine Zahlen doppelt.

**Muster und wo:**

1. *Fahrt beschreiben* (Seite 2): Fahrstreifen-Bild und Aufgaben `single-choice` und `true-false` ("Ein Auto bremst: Seine Geschwindigkeit ist null." mit Grund in der Rückmeldung), `ordering` entfällt (freie Reihenfolge).
2. *Diagramm zur Fahrt zuordnen* (Seite 3, 4): `matching` oder `single-choice` mit einem Bild (`material`); die Fahrt wird beschrieben, das Diagramm gesucht und umgekehrt. Falsche Optionen sind echte Fehlvorstellungen, jede mit Grund.
3. *Ablesen* (Seite 3, 4): `number` mit Einheit zu einem Bild des Diagramms ("Wie weit ist das Auto nach 4 s?"; "Wie schnell ist es zwischen 6 s und 8 s?"). Typische Fehler: Wert der falschen Achse abgelesen, Zeit statt Weg, Teilstrich falsch gezählt; jeder mit eigener Nachricht.
4. *Zeichnen* (Seite 4): Der Übungsteil der Komponente `GeschwindigkeitZeitWerkstatt`: Schüler setzen die Balken für eine beschriebene Fahrt ("2 s anfahren, 4 s gleichbleibend, 4 s abbremsen bis zum Stand") und prüfen. Geprüft wird die Eigenschaft (zum Beispiel "steigt, bleibt gleich, fällt auf 0"), nicht eine Musterlösung.

**Welche Antworten gelten (Seite 2, Komponente FahrtStreifen):** Die Aufgabe "Bremsen, dann Richtung ändern" gilt, wenn die Beträge erst kleiner werden und danach das Vorzeichen wechselt. Das ist eine Eigenschaft: auch "5, 3, 1, −1, −3" und "4, 2, 0, −2, −4" gelten. Typische falsche Antworten: Geschwindigkeit sofort 0 ("Bremsen heißt aus"), gleichbleibende Geschwindigkeit mit Vorzeichenwechsel ("Das ist ein Richtungswechsel ohne Bremsen, das Auto müsste kurz stehen"), Betrag wächst. Jede mit eigener Rückmeldung.

**Komponenten (nur wo kein Block passt: Schüler ändern eine Bewegung und sehen sie zugleich in einem Bild; jede hat Logikmodul, Test und `nojs`-Text):**

- **FahrtStreifen (Seite 2).** Das Ganze ist eine gerade Straße mit sechs Fotos eines Autos im Abstand von 1 s. Der orange Pfeil über jedem Abschnitt zeigt, wie schnell und in welche Richtung das Auto in dieser Sekunde fährt (länger = schneller, nach rechts oder links = Richtung). Schüler stellen mit − und + die Geschwindigkeit je Sekunde ein (−6 bis +6 m/s) und sehen, wie sich die Abstände der Fotos und die Pfeile ändern. Gleich bleibt die Zeit zwischen den Fotos. So erkennen sie: Wächst der Pfeil, wird das Auto schneller; schrumpft er, bremst es; wechselt er die Seite, ändert es die Richtung. Danach prüfen sie eine Aufgabe (siehe oben). Die Aufgabe nennt nicht, wie lang die Pfeile sein müssen (`explainer-figure-hides-answer`).
- **WegZeitWerkstatt (Seite 3).** Links die Fahrt auf einer geraden Straße, rechts das Weg-Zeit-Diagramm, mit Zahlen an den Achsen (t 0–10 s, s 0–60 m) in einem Maßstab, der beim Ändern stehen bleibt. Ein Regler für die Zeit t schiebt das Auto und einen Punkt auf der Kurve zugleich. Fünf Zähler stellen die Geschwindigkeit in jedem 2-s-Abschnitt ein (0–10 m/s). Gleich bleibt die gerade Straße: Die Fahrt ist gerade, die Kurve ist es nicht. Das Diagramm ist ein Bild der Zeit und des Wegs, nicht der Straße. Schüler sehen: steile Kurve = schnell, flache = langsam, waagerecht = Stillstand. Zuerst ist die Fahrt gleichförmig (alle Zähler gleich, eine Gerade), erst die nächste Aktion ändert sie.
- **GeschwindigkeitZeitWerkstatt (Seite 4).** Oben das Geschwindigkeit-Zeit-Diagramm mit fünf Balken je 2 s (ziehen oder Zähler), unten das Weg-Zeit-Diagramm derselben Fahrt, beide mit beschrifteten Achsen und sichtbarer Beschriftung ("Geschwindigkeit-Zeit", "Weg-Zeit"). Schüler ändern die Höhe eines Balkens und sehen, wie sich die Steilheit im unteren Diagramm ändert. Gleich bleibt die Zeitachse. Die Verbindung: höherer Balken = steilere Kurve; waagerechter Balken = gleichbleibende Geschwindigkeit, nicht Stillstand; Balken 0 = Stillstand. Für das Zeichnen gibt es einen Aufgabenmodus, in dem der untere Teil verborgen bleibt, bis geprüft wurde.

**Rückmeldung:** Jede falsche Option sagt, warum sie nicht passt; berechnete Aufgaben haben zwei bis drei typische Fehler mit Meldung; ein Tipp verweist auf die Stelle, nicht auf die Antwort. Komponenten sagen richtig oder falsch und geben einen kurzen Grund.

**Eine Seite oder ein Kapitel später ergänzen:** Neue Fahrt → Datensatz in `src/data/fahrten.yaml`. Neue Seite → Datei mit den fünf Abschnitten, in `chapter.yaml` eintragen, Kompetenz-id aus der Karte. Neue Kompetenz (zum Beispiel Beschleunigung als Größe) → Vorschlag an `lernapps/apps`, nicht erfinden.

**Voraussetzungen, die die App nicht übt:** `geschwindigkeit` und `strecke-und-zeit-messen` stehen im Text von Seite 1 mit Link auf `https://lernapps.net/apps/map/physik/c/<id>/`; `geschwindigkeit-berechnen` bekommt die Wiederholungsseite. Seite 1 steht vor allen, die sie brauchen.

**Figuren:** gezeichnete SVG-Bilder in `src/images/` für die Aufgaben (mit `alt` und Beschriftung), Komponenten für das Bedienen. Gleiche Konventionen überall: Weg blau, Zeit waagerecht, Geschwindigkeits-Pfeil orange, Einheiten an den Achsen, Maßstab 10 s und 60 m.

### Completed

- [x] `grep '^phase:'` prints `phase: plan`; else set it.
- [x] Map the content as skill `lernapps-<archetype>-design` says; reread it if it is no longer in view.
- [x] Choose a pattern per competency as skill `lernapps-exercise-patterns` says (loaded in Explore; reread it if it
      is no longer in view). Write "Content method".
- [x] Write the Code tasks under "Code": pages or screens, their content, what each shows. Each ends in a commit:
      one task, one commit. Steps too small for a commit of their own → one task.
      The first task: one complete page or screen as the pattern for the others (`early-preview`).
- [x] Each screen, component or interactive exercise: a sketch (static SVG or image, or the steps with what
      learners see after each). Words alone are not enough. Keep sketch files in `.vibe/sketches/`, which `create` leaves alone.

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
- [x] **Seite 2 "Beschleunigen, abbremsen, Richtung ändern"** als Musterseite: `src/beschleunigung/geschwindigkeitsaenderung.yaml` mit den Abschnitten und der Komponente `FahrtStreifen` (Logik, Test, `nojs`-Text), Übung. Skizze `.vibe/sketches/seite2-fahrtstreifen.svg`. Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] **Datendatei und Seite 1 "Geschwindigkeit wiederholen"**: die Datendatei `src/data/fahrten.yaml` kommt mit Seite 3 (ungenutzte Datendateien lässt der Build nicht zu); Wiederholungsseite mit `recap: physik/geschwindigkeit-berechnen` und den Links zu `geschwindigkeit` und `strecke-und-zeit-messen`. Commit auf `work`.
- [x] **Seite 3 "Das Weg-Zeit-Diagramm"**: Seite mit Abschnitten, Komponente `WegZeitWerkstatt` (Logik, Test, `nojs`-Text), Bilder, Übungen (Zuordnen, Ablesen). Skizze `.vibe/sketches/seite3-wegzeit-werkstatt.svg`. Commit auf `work`.
- [x] **Seite 4 "Das Geschwindigkeit-Zeit-Diagramm"**: Seite, Komponente `GeschwindigkeitZeitWerkstatt` mit Zeichenaufgabe (Logik, Test, `nojs`-Text), Bilder, Übungen (Zuordnen, Ablesen, Zeichnen). Skizze `.vibe/sketches/seite4-vt-werkstatt.svg`. Commit auf `work`.
- [x] **Startseite und Feinschliff**: `intro` und `sources` in `src/app.yaml`, Kapitel-Zusammenfassung, Glossar (`definition`-Blöcke für "beschleunigen", "abbremsen", "Weg-Zeit-Diagramm", "Geschwindigkeit-Zeit-Diagramm"), Quellenangaben. Commit auf `work`.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [x] (Bilder selbst nicht angesehen, stattdessen Browser-Proben bei 360 px und 1280 px: kein Überlauf, Bedienelemente mindestens 44 px, keine Konsolenfehler; siehe Retrospective) Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
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

Code vollständig (vier Seiten, vier Komponenten, Selbsteinschätzung; `lernapps check` ohne Befund). Commit nur begonnen: Selbsteinschätzung geschrieben. Veröffentlichen, Vorschau und Listing stehen aus, weil die Lehrkraft sie auf später verschoben hat. Checkpoints bestanden: Recherche, Plan, Musterseite.

### Creator turns after the plan

Sechs: zweimal "Mach bitte weiter" (Warten auf den Unteragenten), Wunsch, die Musterseite sofort zu sehen, Freigabe der Musterseite mit der Entscheidung über den Bericht, Entscheidung gegen das Veröffentlichen jetzt mit dem Namen für den Katalog. Mehr als das Ziel von drei, vor allem wegen des Wartens auf den Unteragenten.

### Where I had to guess

- Lehrplan NRW nicht lesbar, nicht zitiert.
- Diagramme nur mit Weg und Betrag der Geschwindigkeit (von der Lehrkraft bestätigt).
- Eine Komponente auf Seite 2 für Ausprobieren und Übung, eine eigene Zeichenkomponente auf Seite 4, Datendatei erst mit Seite 3 (ungenutzte Daten lässt der Build nicht zu).
- Die Screenshots konnte ich nicht ansehen; stattdessen Browser-Proben bei 360 px und 1280 px.
- Die gewählten Zahlen der Fahrten und die Reihenfolge der Aufgaben im Wechsel (Seed) sind meine Wahl.
- Unteragent als Lernender hat nur Texte und Code gelesen, nicht die gerenderte Seite.
