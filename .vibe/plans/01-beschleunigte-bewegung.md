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
failedChecks: { accessible: 2, checks-pass: 4 }
---

# Plan: Beschleunigte Bewegung, erste Version

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

Schülerinnen und Schüler der Klasse 9 beschreiben Beschleunigen, Abbremsen und Richtungsänderung und lesen und zeichnen
Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme. Sie verändern die Diagramme selbst (Regler) und sehen, was mit der Bewegung passiert.

## Key decisions

- Archetyp `explainer`: Lernende brauchen erst Erklärungen zu Diagrammen und üben danach; das Verändern der Diagramme geht über Vue-Bausteine (Regler), die der Explainer als Komponente erlaubt. Ein Quiz passt nicht (erst erklären), `interactive` passt nicht (eine Spielseite, keine erklärenden Kapitel).
- Strang `physik/mechanik` der Lernlandkarte; Kompetenzen `geschwindigkeitsaenderung` und `bewegungsdiagramme` (siehe Notes).
- Nur Deutsch (Wunsch des Erstellers).
- Ein Kapitel, 6 Seiten, für etwa zwei Wochen Unterricht (Wunsch des Erstellers; die genaue Seitenzahl ist (guess)).
- Look: ruhig wie ein Arbeitsblatt, sachliches Lob im Feedback, Dunkelmodus nach Gerät (Ersteller: "entscheide du"; (guess)).
- Bewegung nur geradlinig; Richtungsänderung als Vorzeichen der Geschwindigkeit auf einer Geraden (guess).
- `scope`: keins (kein `open-task`, kein Material des Erstellers); (guess).
- Zielwert-Aufgaben im Bewegungslabor: das Labor prüft nichts, die Antwort kommt in eine `number`-Frage darunter; geplant war eine Prüfung im Baustein (guess, kleiner gehalten).
- Beschleunigung als Größe a = Δv/Δt mit m/s² nur als Ausblick, nicht geübt: die Karte verlangt nur Beschreiben und Diagramme (guess).

## Notes

**Strang:** `physik/mechanik` (Lernlandkarte https://lernapps.net/apps/map/physik/, gelesen am 2026-11-04). Die Karte stützt sich auf die KMK-Bildungsstandards Physik MSA (Beschluss 16.12.2004 i.d.F. vom 13.06.2024).

**Lehrplan:** Kein Land genannt, daher KMK-Bildungsstandards als Orientierung. Das PDF (https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2024/2024_06_13-WeBiS_Physik_MSA.pdf) ließ sich laden, aber hier nicht lesen (kein PDF-Werkzeug): **nicht geprüft**, keine Einheit zitiert. Die Klassenstufe 9–10 stammt aus dem `gradeBand` der Karte.

**Kompetenzen (ids und Wortlaut der Karte):**
- `geschwindigkeitsaenderung`: Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert. (requires: geschwindigkeit)
- `bewegungsdiagramme`: Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen. (requires: geschwindigkeit-berechnen)

**Voraussetzung, die die App nicht übt:** `geschwindigkeit-berechnen` (und `geschwindigkeit`), Klasse 7. Eine Wiederholungsseite (`recap: physik/geschwindigkeit-berechnen`, nur beschreibende Blöcke, keine Aufgabe) steht vor den anderen Seiten.

**Kapitel und Seiten** (eine Seite je Kompetenz; die große Kompetenz `bewegungsdiagramme` bekommt vier Seiten). Kapitel 1 "Beschleunigte Bewegung":
1. Wiederholung: Geschwindigkeit v = s/t (recap)
2. Beschleunigen, Abbremsen, Richtung ändern (`geschwindigkeitsaenderung`)
3. Das Weg-Zeit-Diagramm lesen (`bewegungsdiagramme`)
4. Das Geschwindigkeit-Zeit-Diagramm lesen (`bewegungsdiagramme`)
5. Diagramme zeichnen: aus einer Bewegung wird ein Diagramm (`bewegungsdiagramme`)
6. Beide Diagramme zusammen, auch bei Richtungswechsel (`bewegungsdiagramme`)

**Wie Lernende dorthin kommen und welche Fehlvorstellung das Feedback abfängt** (Fehlvorstellungen aus der Fachdidaktik, nicht aus Material des Erstellers; (guess), bis bestätigt):
- Geschwindigkeitsänderung: Lernende ordnen Alltagsvorgänge zu und leiten ab, dass sich Tempo und Richtung unabhängig ändern können. Fehler: "Kurvenfahrt mit gleichem Tempo ist keine Änderung"; "Abbremsen heißt negative Geschwindigkeit".
- Weg-Zeit-Diagramm: Lernende ziehen mit einem Regler die Geschwindigkeit und sehen, wie die Steigung der Linie wechselt; sie leiten v = s/t aus der Steigung her, statt nur abzulesen. Fehler: Diagramm als Bild der Bahn lesen ("Berg" = Hügel); Höhe der Linie mit Geschwindigkeit verwechseln; waagerechte Linie = "fährt gleichmäßig" statt "steht".
- Geschwindigkeit-Zeit-Diagramm: Regler für Start- und Endgeschwindigkeit eines Abschnitts; die Fläche unter der Linie ist der Weg (nur Rechteck und Dreieck). Fehler: waagerechte Linie = Stillstand; fallende Linie = rückwärts fahren.
- Zeichnen: aus einer erzählten Bewegung Punkte im Diagramm setzen, Prüfung mit Rückmeldung. Fehler: Achsen vertauscht; Gerade statt Knick; Abschnitte nicht an der Zeitachse ausgerichtet.
- Beide zusammen: die Diagramme sind verknüpft (eine Änderung im einen zeigt sich im anderen); Richtungswechsel als Vorzeichen von v und als Umkehr der Steigung im s-t-Diagramm. Fehler: "Der Weg wird kleiner" statt "die Entfernung vom Start wird kleiner".

**Umfang:**
- In: geradlinige Bewegung; Abschnitte mit konstanter und mit gleichmäßig wechselnder Geschwindigkeit; Richtungswechsel mit Vorzeichen; m, s, m/s; Zeit 0 bis 12 s, Geschwindigkeit bis 20 m/s, Weg bis 150 m; nur Deutsch.
- Out: Beschleunigungsformel und m/s² (nur ein Ausblick-Satz); freier Fall; Kräfte; Kreisbewegung; s = ½at². Grund: nicht Teil der beiden Karten-Kompetenzen, und der Umfang soll zwei Wochen bleiben.

**Quellen** (geöffnet; nur Fakten, keine Sätze übernommen):
- https://de.wikipedia.org/wiki/Beschleunigung, Titel "Beschleunigung – Wikipedia": geladen, richtiger Artikel, geprüft.
- https://de.wikipedia.org/wiki/Gleichm%C3%A4%C3%9Fig_beschleunigte_Bewegung, Titel "Gleichmäßig beschleunigte Bewegung – Wikipedia": geladen, richtiger Artikel, geprüft.
- serlo.org: kein passender Einzelartikel gefunden (nur die Physik-Übersicht), nicht aufgenommen. Kein Video.
- Nicht geprüft: KMK-PDF (siehe oben). Eigenes Material des Erstellers: keines.

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

- Goal: "Die Lernenden sollen Beschleunigen, Abbremsen und Richtungsänderung beschreiben und Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme zeichnen und ablesen können. Kein Quiz, sondern Erklärungen mit Aufgaben nach jedem Teil. Die Schüler sollen an den Diagrammen selbst etwas verändern und sehen, was passiert."
- Learners: "beschleunigte Bewegung, Physik Klasse 9"; sie kennen v = s/t aus Klasse 7, Diagramme sind neu. Kein Land genannt, daher KMK-Bildungsstandards.
- Model and focus: kein Vorbild genannt (guess: keins nötig). Schwerpunkt laut Ersteller: Diagramme selbst verändern.
- Hurdles: "Viele finden Diagramme einfach schwer." Keine eigenen Beispiele oder Versuche; "nimm den Lehrplan als Orientierung". Konkrete Fehlvorstellungen: Vermutung aus der Fachdidaktik (guess), siehe Notes.
- Content: kein eigenes Material des Erstellers; ich schreibe aus Lehrplan und Quellen, der Ersteller prüft im Plan.
- Amount: "nicht zu groß, ein Kapitel mit ein paar Seiten, etwa für zwei Wochen Unterricht." Daraus 1 Kapitel mit 6 Seiten (genaue Zahl: guess).
- Languages: "Nur Deutsch."
- Look and feel: "ruhig mit sachlichem Lob ist gut, entscheide du." Dunkelmodus nach Gerät (fest im Explainer).
- Terms: nicht gefragt (guess): Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm (s-t- und v-t-Diagramm erst nach der Einführung), beschleunigen, abbremsen, Richtung ändern; die Wörter stammen vom Ersteller.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Beschleunigte Bewegung
subject: Physik
grades: [9]
summary: >-
  Du lernst, wie sich eine Bewegung beim Beschleunigen, Abbremsen und bei einer Richtungsänderung verändert.
  Du liest und zeichnest Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme und verändest sie selbst mit Reglern.
strand: physik/mechanik
keywords: [Diagramm, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, Beschleunigung, Bremsen]
# url, creator, source, commit, fitness: ergänzt in Commit, sobald sie bekannt sind
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

Muster (Name; Art der Kompetenz; Form; Beispiel):
- **Zuordnen** (`matching`): Alltagsvorgang ↔ "beschleunigt / bremst / ändert die Richtung". Beispiel: "Ein Auto fährt mit 50 km/h durch eine Kurve." Seite 2.
- **Beurteilen** (`true-false` mit Begründung im Feedback): Aussagen zu Bewegung und Diagramm. Beispiel: "Eine waagerechte Linie im Weg-Zeit-Diagramm bedeutet: Das Auto fährt gleichmäßig." (falsch: es steht). Seiten 2 bis 6.
- **Ablesen** (`single-choice` mit Diagramm als `material`): ein gezeigtes Diagramm, gefragt ist ein Wert oder eine Aussage; jede falsche Option mit Begründung. Seiten 3, 4, 6.
- **Berechnen** (`generated`, Zahl mit Einheit): s aus v und t, v aus s und t, Weg als Fläche (Rechteck, Dreieck) mit gezogenen Zahlen; Fehler: "Einheit vergessen", "t statt Zeitabschnitt", "Dreieck ohne Halbieren". Seiten 3, 4.
- **Verändern und Zielwert treffen** (Baustein `Bewegungslabor`, Übung per Frage unter dem Baustein): Regler so einstellen, dass eine Bedingung erfüllt ist; geprüft wird die Bedingung, nicht ein fester Wert. Seiten 3, 4, 6.
- **Zeichnen** (Übungsbaustein `DiagrammZeichnen`): aus einer erzählten Bewegung Punkte im v-t-Diagramm setzen (Tasten und Maus); Rückmeldung nennt den Fehler. Seite 5.

Daten: `src/data/bewegungen.yaml`: eine Bewegung je Datensatz (id, Geschichte, Abschnitte mit Dauer, Start- und Endgeschwindigkeit, erwartete Punkte); Seiten 5 und 6 und `generated` ziehen daraus, jede Bewegung nur einmal.

Bausteine (je Baustein: Zweck, nojs, was er prüft und nicht kann):
- **`Bewegungslabor`** (Erkundung, keine Aufgabe; Props: `modus` s-t / v-t / beide, Abschnitte, Achsenbereiche). Lernaktion: Das Ganze ist eine Fahrt von 12 s in drei Abschnitten; die x-Achse ist die Zeit, die y-Achse Weg (s-t) oder Geschwindigkeit (v-t). Marken: blaue Linie = die Bewegung, schraffierte Fläche (v-t) = Weg, Messmarke = ein Zeitpunkt. Lernende ziehen die Regler eines Abschnitts; Achsen und Abschnittsgrenzen bleiben. Daraus folgt die Aussage der Seite (Steigung ist Geschwindigkeit; Fläche ist Weg). Danach: eine Frage unter dem Baustein. `nojs`: Beschreibung des Diagramms in drei Beispielfahrten mit Tabelle. Kann nicht: Kurven; nur gerade Abschnitte.
- **`DiagrammZeichnen`** (Übungsbaustein, Vertrag: `answer`, `check`, `solution`, `wrong`, `reason`, `template`, `params`, `mistakes`, `show`). Lernaktion: Vier Punkte im v-t-Diagramm bei t = 0, 4, 8, 12 s (wie im Labor); Lernende stellen sie mit je einem Regler ein (Tastatur und Zeigen), kein Ziehen im Diagramm (so gebaut, (guess)). Das Diagramm zeigt die Zeitachse und die Aufgabengeschichte, nie die Lösung. Geprüft wird jeder Punkt genau (ganze m/s); die Rückmeldung nennt den Fehlertyp (Achsen vertauscht, Abbremsen als Sprung, Rückwärtsfahrt vergessen). Kann nicht: freies Zeichnen oder Ziehen der Punkte im Diagramm. Kein `nojs` (Übungsbaustein).
- Begründung (`prefer-built-in-block`): Kein Block zeigt ein Diagramm, das auf Regler reagiert, und keine Frage kann Punkte in einem Diagramm setzen lassen.
- Eine Bewegungs-Logik (Abschnitte → Linie → Weg) in `Bewegung.ts`, geteilt von beiden Bausteinen, mit Tests.

Figuren: feste Achsen und Farben auf allen Seiten (Weg blau, Geschwindigkeit orange, Fläche schraffiert); jedes Bild mit `alt` und Beschriftung.

Nächstes Kapitel / nächste Seite: Datei `src/beschleunigte-bewegung/<seite>.yaml`, in `chapter.yaml` in der Reihenfolge eintragen; Abschnitte `einstieg`, `erklaert`, `ausprobieren`, `beispiel`, `uebung`; Bewegungen in `bewegungen.yaml` ergänzen.

Wiederholungsseite 1 und Rückblick: `recap: physik/geschwindigkeit-berechnen`, nur Text, Formel `v = s/t`, ein Beispielkasten, kein Übungsteil.

Tutor: nur die Voreinstellung (keine eigenen Tutorregeln). `scope` nicht nötig (kein `open-task`, kein Material des Erstellers; guess).


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

- [ ] `grep '^phase:'` prints `phase: code`; else set it.
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
- [x] Seite 3 "Das Weg-Zeit-Diagramm lesen" als Musterseite: Abschnitte `einstieg` (Alltagsbild: gleichmäßig fahrendes Auto, Anknüpfung an v = s/t), `erklaert` (Achsen, Linie, Messmarke), `ausprobieren` (Baustein `Bewegungslabor` im Modus s-t, Skizze `.vibe/sketches/bewegungslabor-st.svg`), `beispiel` (Steigung als Weg pro Zeit), `uebung` (`single-choice` ablesen, `true-false` Fehlvorstellung "Berg", `generated` v aus s und t). Dazu `Bewegung.ts`, `Bewegungslabor.vue/.ts/.test.ts`, `src/app.yaml`, `chapter.yaml`; Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Seite 1 "Wiederholung: Geschwindigkeit" (`recap: physik/geschwindigkeit-berechnen`, nur Text, Formel und Beispiel, keine Übung); Commit auf `work`.
- [x] Seite 2 "Beschleunigen, Abbremsen, Richtung ändern" (`geschwindigkeitsaenderung`): `matching` Vorgang ↔ Änderung, `true-false` zu "Abbremsen ist negative Geschwindigkeit" und "Kurve ohne Tempoänderung", `single-choice` zu zwei gleichzeitigen Änderungen; Commit auf `work`.
- [x] Seite 4 "Das Geschwindigkeit-Zeit-Diagramm lesen": `Bewegungslabor` im Modus v-t (Skizze `bewegungslabor-vt.svg`), Fläche als Weg, `generated` Weg als Rechteck und Dreieck, `true-false` zu "waagerecht = Stillstand"; Commit auf `work`.
- [x] Seite 5 "Diagramme zeichnen": Baustein `DiagrammZeichnen` mit Test und Datei `src/data/bewegungen.yaml` (Skizze `diagramm-zeichnen.svg`), dazu `single-choice` zur Erzählung der Bewegung; Commit auf `work`.
- [x] Seite 6 "Beide Diagramme zusammen": `Bewegungslabor` im Modus beide (s-t und v-t untereinander, Richtungswechsel mit Vorzeichen), Zielwert-Frage, `single-choice` "Entfernung vom Start"; Commit auf `work`.
- [x] Startseite und Glossar: `intro` der App, `definition`-Blöcke für Geschwindigkeit, Beschleunigen, Abbremsen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm; Commit auf `work`.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [ ] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
      each with the confirmed sketches; each figure in its own image (`npx --no -- lernapps screenshots --desktop`).
      Offen: Der Assistent konnte die PNG-Bilder nicht ansehen (nur Binärdaten); geprüft wurde per Browser-Skript (kein Überlauf bei 360 px, keine Konsolenfehler). Der Ersteller hat die Seiten gesehen und bestätigt.
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
