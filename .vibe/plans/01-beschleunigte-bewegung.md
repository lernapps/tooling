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
failedChecks: { checks-pass: 1 }
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

Schülerinnen und Schüler der 9. Klasse (Gesamtschule NRW, gemischte Leistungen) beschreiben Beschleunigen, Abbremsen und Richtungsänderung und lesen, verändern und zeichnen Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme. Sie lernen, indem sie an den Diagrammen selbst etwas verändern und sehen, was mit der Bewegung passiert.

## Key decisions

- Archetype `explainer`: Lernende brauchen Erklärungen mit Diagrammen, danach Übungen; Diagramme verändern geht über Vue-Komponenten (kein reines Quiz, kein Spiel).
- Umfang vom Ersteller bestätigt: Beschleunigung als Größe a = Δv/Δt bleibt draußen (kommt in der Oberstufe).
- Drei Komponenten (Bewegungsspur, Bewegungsdiagramm, DiagrammZeichnen): Lernende sollen Diagramme selbst verändern; kein Block kann das (`prefer-built-in-block`).
- Kein `scope`: keine offene Aufgabe, kein eigenes Material.
- Selbsteinschätzung: ja, in jedem Kapitel (Skill-Vorgabe); die Stufen enthalten nur anklickbare und erzeugte Aufgaben der Inhaltsseiten, Kapitel 1 hat keine erzeugte Aufgabe, deshalb ist dort das Ergebnis eher grob.
- Kurzname `beschleunigte-bewegung`: vom Ersteller zur Wahl überlassen.

## Notes

- Strand: `physik/mechanik` (Lernlandkarte https://lernapps.net/apps/map/physik.json, gelesen). Die Karte stützt sich auf die KMK-Bildungsstandards Physik MSA (Beschluss 16.12.2004 i.d.F. 13.06.2024).
- Kompetenzen der App (Karten-IDs, Wortlaut der Karte):
  - `geschwindigkeitsaenderung`: Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert. (requires `geschwindigkeit`)
  - `bewegungsdiagramme`: Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen. (requires `geschwindigkeit-berechnen`)
- Voraussetzungen, die die App nicht übt: `geschwindigkeit` und `geschwindigkeit-berechnen` (Klasse 7, die Lernenden kennen sie). Je eine Wiederholungsseite (`recap`), nur beschreibende Blöcke, vor der Seite, die sie braucht.
- Lehrplan (Orientierung, selbst gelesen): Kernlehrplan für die Gesamtschule – Sekundarstufe I in Nordrhein-Westfalen, Naturwissenschaften (Biologie, Chemie, Physik), Ministerium für Schule und Weiterbildung NRW, Heft 3108, 2. Auflage 2013, https://lehrplannavigator.nrw.de/system/files/media/document/file/klp_ge_nw.pdf. Inhaltsfeld "Bewegungen und ihre Ursachen" bzw. "Bewegung in Natur und Technik". Kompetenzbereich Kommunikation: "eine Bewegung anhand eines Zeit-Weg-Diagramms bzw. eines Zeit-Geschwindigkeits-Diagramms qualitativ beschreiben und Durchschnittsgeschwindigkeiten bestimmen (K2, E6)". Erkenntnisgewinnung: "Messwerte zur gleichförmigen Bewegung durch eine Proportionalität von Weg und Zeit modellieren und Geschwindigkeiten berechnen (E6, K3)". Seitenzahlen: not checked.
  - Folge: Der Lehrplan verlangt, Diagramme **qualitativ** zu beschreiben. Die Beschleunigung als Größe a = Δv/Δt steht dort nicht. Sie bleibt draußen (guess, siehe Umfang).
- Zweite Quellen (geöffnet): https://de.wikipedia.org/wiki/Weg-Zeit-Diagramm (Titel "Weg-Zeit-Diagramm – Wikipedia", verified; nur Fakten, keine Sätze) und https://de.wikipedia.org/wiki/Beschleunigung (verified). Leifiphysik war nicht abrufbar (HTTP 403), not checked. Ein Video: keins gefunden, ausgelassen.
- Aufbau (ein Kapitel pro Kompetenz, entlang `requires`):
  - Kapitel 1 "Wenn sich die Geschwindigkeit ändert" (`geschwindigkeitsaenderung`): Wiederholung `geschwindigkeit`; Seite "Beschleunigen und Abbremsen"; Seite "Die Richtung ändert sich".
  - Kapitel 2 "Bewegungen im Diagramm" (`bewegungsdiagramme`): Wiederholung `geschwindigkeit-berechnen`; Seite "Das Weg-Zeit-Diagramm"; Seite "Das Geschwindigkeit-Zeit-Diagramm"; Seite "Eine Bewegung im Diagramm darstellen".
- Wie Lernende zur Kompetenz kommen, und welche Fehlvorstellung das Feedback fängt (Fehlvorstellungen: eigene Annahmen aus der Fachdidaktik, der Ersteller nannte keine; (guess)):
  - Beschleunigen, Abbremsen, Richtung: Lernende leiten aus Positionen im gleichen Zeitabstand ab (Strichbild), ob die Abstände wachsen, schrumpfen oder gleich bleiben. Fehlvorstellung: "Abbremsen heißt, es bewegt sich nicht mehr"; "Richtungsänderung ist keine Änderung der Bewegung".
  - Weg-Zeit-Diagramm: Lernende verändern die Steigung des Graphen mit einem Regler und sehen die Bewegung dazu; sie leiten ab, dass die Steigung die Geschwindigkeit ist. Fehlvorstellung: "Das Diagramm ist ein Bild der Bahn"; "Waagerechte Linie heißt, der Körper fährt gleichmäßig".
  - Geschwindigkeit-Zeit-Diagramm: Lernende ziehen Punkte des v-Graphen und sehen die Bewegung dazu. Fehlvorstellung: "Steigt die Linie, steigt der Weg" statt "die Geschwindigkeit"; "Fallende Linie heißt rückwärts".
  - Eine Bewegung darstellen: Lernende bekommen eine Beschreibung und zeichnen beide Diagramme; Rückmeldung je typischem Fehler (s-t und v-t verwechselt).
- Umfang:
  - Drin: Beschleunigen, Abbremsen, gleichbleibend schnell, Stillstand, Richtungsumkehr; s-t- und v-t-Diagramm lesen, verändern, zeichnen; Durchschnittsgeschwindigkeit aus dem Diagramm; geradlinige Bewegung, Alltagszahlen (m, s, m/s, km/h).
  - Draußen: Beschleunigung als Größe a = Δv/Δt mit m/s² (nicht im Lehrplan); freier Fall; Fläche unter dem v-t-Graphen; Kräfte (Karte: `kraft-aendert-geschwindigkeit`, später); Kreisbewegung.
  - Sprache: nur Deutsch (guess).
  - Vorzeichen: Weg s = Entfernung vom Startpunkt auf einer Geraden. Das v-t-Diagramm zeigt den Betrag der Geschwindigkeit; die Richtungsumkehr sieht man im s-t-Diagramm (s nimmt wieder ab) (guess, einfacher für gemischte Leistungen).

## Explore

<!--
- Find out what the app teaches, for whom, how much and how it looks. All content questions belong here; Plan only
  maps the answers onto the archetype.
- Ask. Write no code, run no `create`.
- An answer counts only in the creator's words under "Answers". Never tick a topic you assumed.
- Skills: `lernapps-app`, `lernapps-exercise-patterns`, `lernapps-<archetype>-design`, `lernapps-content-research`.
-->

### Tasks

Alle erledigt, siehe „Completed“.

### Answers

<!-- The interview: per topic the creator's answer, in their words. Keep the topics. -->

- Goal: Die App soll beschleunigte Bewegung erklären: Beschleunigen, Abbremsen und Richtungsänderung beschreiben, und Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme zeichnen und ablesen. Erklärungen mit Übungen danach, kein reines Quiz. Die Schüler sollen an den Diagrammen selbst etwas verändern und sehen, was passiert.
- Learners: Klasse 9, Gesamtschule in NRW, gemischte Leistungen. Sie kennen Geschwindigkeit als Weg pro Zeit und können v = s/t aus Klasse 7. Diagramme von Bewegungen sind neu, viele finden Diagramme schwer.
- Model and focus: an app of the catalog (read https://lernapps.net/apps/llms.txt) as model; what matters most
  (exercises, visualisations, game feel).
- Hurdles: Der Ersteller nennt nichts Genaueres: "nimm den Lehrplan als Orientierung". Fehlvorstellungen: eigene Annahmen (guess), siehe Notes.
- Content: who writes it (creator, you, from sources); own material (worksheets, tests); how it is made (sources,
  research, a data format).
- Amount: how much content per level or chapter in the first version (e.g. "one text per school year"); what comes
  later.
- Languages: German only, or German and English (texts, code). Never English only: an app without German still has
  German pages and runtime texts, so it mixes both. The creator wants English → offer German and English,
  both complete, and say why.
- Look and feel: calm like a worksheet, or like a game (colours, praise, effects); dark mode.
- Terms: the creator's words for the main things in the app, used everywhere.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Beschleunigte Bewegung
subject: Physik
grades: [9]
summary: >-
  Du erkundest, wie sich Bewegungen beim Beschleunigen, Abbremsen und Richtungswechsel verändern. An Weg-Zeit- und
  Geschwindigkeit-Zeit-Diagrammen verschiebst du selbst Punkte und Regler, siehst die Bewegung dazu und übst
  Ablesen und Zeichnen.
strand: physik/mechanik
keywords: [Beschleunigung, Diagramme lesen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, Abbremsen]
# url, creator, source, commit, fitness: filled in Commit
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

Seitenaufbau überall gleich (Naturwissenschaften): `einstieg` (Warum/Anknüpfung), `erklaert` (anschaulich erklärt oder Regel), `ausprobieren` (nur wo Lernende etwas bedienen), `beispiel` (`example`-Box), `uebung`. Du-Form, kurze Sätze, Alltag (Fahrrad, Bus, Sprint).

**Muster (Pattern)**

| Muster | Art der Kompetenz | Form | Beispiel | Daten |
|---|---|---|---|---|
| Strobo-Spur deuten | beschreiben | `single-choice`/`true-false` mit Bild der Spur (SVG) als `material`; Grund in jeder falschen Option | Spur mit wachsenden Abständen: Wagen wird …? | Bilder `src/images/spur-*.svg` |
| Änderung benennen | unterscheiden | `matching` Situation ↔ Art der Änderung (schneller, langsamer, Richtung, gleich) | „Bus nimmt Kurve mit 30 km/h“ ↔ Richtung | `src/data/situationen.yaml` |
| Steigung ablesen | ablesen | `generated`: zwei Punkte (t, s) auf einer Geraden gegeben, v = s/t mit Einheit; Fehler „s·t“, „t/s“, „Zeit statt Weg“ | „Nach 4 s: 20 m. Wie schnell?“ | `src/data/ablesen-st.yaml` (Aufgabendatensätze) |
| Diagrammart erkennen | zuordnen | `single-choice` mit Bildern (SVG) von s-t- und v-t-Diagrammen | Fahrrad bremst: welches v-t-Diagramm? | Bilder `src/images/diagramm-*.svg` |
| Diagramm einstellen | darstellen | Übungs-Komponente `DiagrammZeichnen`: Aufgabe in Worten, Lernende stellen die Geschwindigkeit je Zeitpunkt ein | Fahrrad: anfahren, gleich, bremsen | Props je Aufgabe |

**Figuren und Komponenten** (jede mit Lernhandlung; Regeln `explainer-representation-explained`, `explainer-control-purpose`):

- **`Bewegungsspur`** (Kapitel 1, Seiten 2 und 3; Skizze `.vibe/sketches/bewegungsspur.svg`). Ganzes: eine Bahn, ein Wagen, ein Punkt je Sekunde auf einer Spur darunter (Blitzbild). Punkt = Ort des Wagens zu dieser Sekunde. Lernende wählen eine Bewegung (Props: Liste, z. B. schneller, gleich schnell, langsamer; Seite 3: Kurve/Richtung) und drücken „Start“; Wagen fährt, Punkte erscheinen. Gleich bleibt: der Zeitabstand von einer Sekunde. Daraus folgt: wachsende Abstände = schneller werden, schrumpfende = langsamer, gleiche = gleich schnell. Danach beantworten sie die Fragen darunter. Warum eine Komponente: Animation mit Wahl; kein Block kann das. `nojs`: Beschreibung der drei Spuren als Tabelle der Abstände je Sekunde.
- **`Bewegungsdiagramm`** (Kapitel 2, Seiten 2 bis 4; Skizze `.vibe/sketches/bewegungsdiagramm.svg`). Ganzes: Achsen mit festen Zahlen (t in s, s in m bzw. v in m/s), die sich beim Verstellen nicht verschieben. Bahn mit Wagen oberhalb, Zeitmarke (gestrichelte Linie, Punkt auf dem Graphen) läuft mit „Start“ mit. Prop `ansicht`: `weg` (s-t) oder `geschwindigkeit` (v-t), nie beide auf derselben Seite (eine neue Sache je Seite); Prop `art`: `abschnitte` (Geschwindigkeit je Abschnitt konstant, Graph als Geradenstücke; Seite 2), `knoten` (Geschwindigkeit an Zeitpunkten, dazwischen gleichmäßig; Seiten 3 und 4). Lernende verändern Regler (je Abschnitt bzw. je Zeitpunkt eine Geschwindigkeit; s-t: auch negativ = zurück zum Start, nie unter 0 m); sie sehen sofort den Graphen und die Fahrt. Gleich bleibt: Zeitachse und Zahlenskala. Daraus folgt: Seite 2: Steigung ist die Geschwindigkeit (steiler = schneller, waagerecht = steht, nach unten = zurück); Seite 3: Kurve, die steiler wird = schneller werdend; Seite 4: waagerechte Linie = gleich schnell, steigend = schneller, fallend = langsamer. Im v-t-Diagramm gibt es keine Richtungsregler: dort steht „Hier ändert sich nichts: Das Diagramm zeigt nur, wie schnell.“ `nojs`: Tabelle t/s bzw. t/v der Ausgangseinstellung mit Beschreibung des Graphen.
- **`DiagrammZeichnen`** (Übungs-Komponente, Kapitel 2, Seite 5; Skizze `.vibe/sketches/diagramm-zeichnen.svg`). Aufgabe in Worten (Fahrrad). Lernende stellen die Geschwindigkeit zu vier Zeitpunkten ein, der Graph verbindet sie; Zahlenskala fest. Geprüft wird die Eigenschaft (je Abschnitt: steigt, bleibt, fällt; Endwerte im Toleranzbereich ±1 m/s), nicht eine Musterlösung. Falsch: kurze Begründung je Abschnitt (zum Beispiel „Beim Bremsen muss die Linie fallen.“), keine Lösung. Gemeinsame Logik mit `Bewegungsdiagramm` in `Bewegungsmodell.ts`. Für den Tutor: `template`, `params`, `mistakes`, `show` laut Vertrag.
- Der Graph in Aufgaben zeigt nur Gegebenes, nie die Antwort (`explainer-figure-hides-answer`). Bilder: SVG, bundled, Alt-Text, eigene Zeichnung (CC BY 4.0).

**Konventionen der Figuren:** Farbe Blau = Graph und Wagen, Rosa gestrichelt = Zeitmarke; immer Achsenbeschriftung mit Einheit; s und v als Betrag auf einer Geraden; Zahlen: Zeiten 0 bis 10 s, Wege bis 100 m, Geschwindigkeiten bis 20 m/s (Alltagsbereich, Fahrrad bis Auto im Ort).

**Tutor:** keine App-eigenen Regeln. `scope` entfällt: keine offene Aufgabe, kein eigenes Material des Erstellers.

**Neues Kapitel oder neue Seite später:** Seite als YAML in `src/<kapitel>/`, in `chapter.yaml` eintragen, Abschnitt-Ids wie oben, Komponente nur wenn nötig, Kompetenz-ID der Karte, Inhalt in `.agents/skills/app-content/SKILL.md` ergänzen.

**Antworten und Rückmeldung:** Alle Fragen prüfen die Eigenschaft: z. B. „Welche Bewegung zeigt die Spur?“ eine richtige Option; jede falsche Option sagt, warum nicht („Die Abstände werden kleiner, der Wagen wird also langsamer, steht aber nicht.“). Gerechnete Aufgaben: häufige Fehler mit Meldung. Komponente: richtig/falsch plus kurzer Grund.

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
- [x] Muster-Seite (`early-preview`): Kapitel „Bewegungen im Diagramm“ (Ordner `bewegungen-im-diagramm`) mit der Seite „Das Weg-Zeit-Diagramm“ (`weg-zeit-diagramm`, Kompetenz `bewegungsdiagramme`): Abschnitte einstieg, erklaert, ausprobieren (Komponente `Bewegungsdiagramm`, `ansicht: weg`, `art: abschnitte`, mit Test und `nojs`), beispiel, uebung (`generated` Steigung ablesen, ein `single-choice` mit Grund je Option, ein `true-false`). Dazu `src/data/ablesen-st.yaml`. Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Kapitel „Wenn sich die Geschwindigkeit ändert“ (`geschwindigkeit-aendert-sich`): Wiederholungsseite `geschwindigkeit` (`recap: physik/geschwindigkeit`, nur Text, Formel und Beispiel), Seite „Beschleunigen und Abbremsen“ (Komponente `Bewegungsspur`, Übungen Strobo-Spur deuten) und Seite „Die Richtung ändert sich“ (Kompetenz `geschwindigkeitsaenderung`, Übung Änderung benennen mit `src/data/situationen.yaml`). Commit.
- [x] Wiederholungsseite `geschwindigkeit-berechnen` vor die Seite „Das Weg-Zeit-Diagramm“ (`recap: physik/geschwindigkeit-berechnen`), Seite „Kurven im Weg-Zeit-Diagramm“ (`weg-zeit-kurven`, Komponente `Bewegungsdiagramm` mit `art: knoten`, Übung `matching` Kurve ↔ Bewegung mit SVG-Bildern). Commit.
- [x] Seite „Das Geschwindigkeit-Zeit-Diagramm“ (`geschwindigkeit-zeit-diagramm`, `ansicht: geschwindigkeit`, Übung: Diagramm zuordnen, Ablesen). Commit.
- [x] Seite „Eine Bewegung im Diagramm darstellen“ (`bewegung-darstellen`) mit Übungs-Komponente `DiagrammZeichnen` samt Test, dazu eine `single-choice`-Frage mit Diagramm-Bildern (Fahrrad bremst: welches Diagramm?). Commit.
- [x] Startseite und Rahmen: `src/app.yaml` (Titel, Einleitung in Du-Form, Quellen: Kernlehrplan NRW, Wikipedia), `definition`-Blöcke für Glossar (beschleunigen, abbremsen, Geschwindigkeit, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm). Commit.
- [x] The content guide matches what was built (`app-content-matches`).
- [x] `npx --no -- lernapps check` passes.
- [ ] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px. Compare
      each with the confirmed sketches; each figure in its own image (`npx --no -- lernapps screenshots --desktop`).
      Offen: Der Assistent kann in dieser Sitzung keine Bilddateien ansehen. Die Screenshots liegen in `screenshots/`; Lernprüfung durch Messung (kein Überlauf bei 360 px, Konsole ohne Fehler), das Aussehen hat der Ersteller zu beurteilen.
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
