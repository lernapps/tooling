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
failedChecks: { checks-pass: 1 }
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

Schüler der Klasse 9 beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert, und lesen, zeichnen und verändern Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme. Kein Rechnen mit der Beschleunigung, keine Kräfte.

## Key decisions

- Archetyp `explainer`: Erklärseiten mit Übungen nach jedem Teil; Diagramme verändern per Komponente; kein Quiz, kein Spiel (Wunsch der Lehrkraft).
- Strang `physik/mechanik` der Lernlandkarte; Kompetenzen `geschwindigkeitsaenderung`, `bewegungsdiagramme` (Karte, Klasse 9–10).
- Sprache nur Deutsch (Wunsch).
- `scope`: keins (kein `open-task`, kein eigenes Material der Lehrkraft).
- Aussehen: ruhig wie ein Arbeitsblatt, freundliche Rückmeldungen (guess; die Lehrkraft überlässt es mir, das Layout gibt die Laufzeit vor).
- Geschwindigkeit in den Diagrammen als Betrag (nur v ≥ 0); die Richtungsänderung zeigt das Weg-Zeit-Diagramm (Linie fällt = zurück zum Start) (guess).
- „Beschleunigen“ nur als Wort für „Geschwindigkeit wird größer“; kein a = Δv/Δt (Wunsch).

## Notes

**Strang:** `physik/mechanik` (Karte https://lernapps.net/apps/map/physik.json, gelesen). Die Karte hat genau zwei passende Kompetenzen, beide Klasse 9–10:
- `geschwindigkeitsaenderung` – Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert. (requires: `geschwindigkeit`)
- `bewegungsdiagramme` – Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen. (requires: `geschwindigkeit-berechnen`)

Voraussetzung `geschwindigkeit-berechnen` (und damit `geschwindigkeit`) übt die App nicht (Klasse 7): eine Wiederholungsseite `recap: physik/geschwindigkeit-berechnen`, ohne Übung, vor der ersten Seite, die sie braucht.

**Lehrplan:** Der NRW-Kernlehrplan der Gesamtschule (Lehrplannavigator, https://lehrplannavigator.nrw.de/) wurde hier nicht gelesen: *nicht geprüft*, keine Einheit zitiert. Orientierung: KMK, Weiterentwickelte Bildungsstandards Physik (MSA), Beschluss 16.12.2004 i.d.F. vom 13.06.2024, über die Karte; die Karte wurde geöffnet.

**Aufbau (Entwurf):**
- Kapitel 1 „Bewegung beschreiben“: Seite 0 Wiederholung v = s/t (recap); Seite 1 „Schneller, langsamer, andere Richtung“ (`geschwindigkeitsaenderung`).
- Kapitel 2 „Bewegungsdiagramme“ (alle `bewegungsdiagramme`, ein großes Thema, mehrere Seiten): Seite 2 Weg-Zeit-Diagramm lesen; Seite 3 Geschwindigkeit-Zeit-Diagramm lesen; Seite 4 beide Diagramme verbinden und selbst zeichnen.
- Umfang: etwa 5 Seiten, zwei Wochen Unterricht.

**Didaktik:** Von der Alltagsbewegung zum Diagramm, in kleinen Schritten, mit Übung auf jeder Seite. Eine Komponente lässt die Schüler eine Bewegung in Abschnitten einstellen (schneller, gleich, langsamer, Pause, zurück); beide Diagramme entstehen dabei gleichzeitig, so sehen sie, was sich ändert.

**Kompetenzen, Weg und Fehlvorstellung:**
- `geschwindigkeitsaenderung`: Schüler leiten aus Orts-Zeit-Tabellen ab, ob die Abstände wachsen, schrumpfen oder gleich bleiben, statt es nur zu lesen. Fehlvorstellung: „Bremsen heißt, die Geschwindigkeit ist negativ“ und „Richtungsänderung ist keine Änderung der Geschwindigkeit“; die Rückmeldung nennt beide.
- `bewegungsdiagramme`: Schüler stellen eine Bewegung ein und sehen beide Diagramme entstehen, lesen dann Werte ab und ordnen Bewegungen Diagrammen zu. Fehlvorstellungen: „Berg im Diagramm = Berg auf dem Weg“ (der Fehler, den die Lehrkraft oft sieht); „steigende Linie im v-t-Diagramm = Fahrzeug fährt weiter weg“; „waagerechte Linie im s-t-Diagramm = gleichmäßig schnell“ statt Stillstand. Die Rückmeldung zu jeder Falschantwort benennt den Verwechslungsfehler.

**Umfang:**
- Drin: Beschleunigen, Abbremsen, Richtungsänderung beschreiben; s-t- und v-t-Diagramme lesen, zeichnen, verändern; gleichförmige und gleichmäßig beschleunigte Abschnitte, Stillstand.
- Draußen: Rechnen mit der Beschleunigung (a = Δv/Δt), Kräfte, Trägheit, Reibung, freier Fall, Fläche unter dem v-t-Graphen (Wunsch der Lehrkraft; Kräfte sind andere Kompetenzen der Karte).
- Wertebereich: Geschwindigkeiten 0–30 m/s, Zeiten bis 20 s, ganze Zahlen (guess).
- Sprache: Deutsch.

**Quellen:** Kartenquelle KMK (oben, über die Karte). Wikipedia „Geschwindigkeit“ (https://de.wikipedia.org/wiki/Geschwindigkeit) geöffnet, nur Hintergrund für das Klasse-7-Wissen, keine Sätze übernommen. Für die Diagramme keine passende Zweitquelle gefunden („Weg-Zeit-Diagramm“ bei Wikipedia ist eine Begriffsklärung): weggelassen. Inhalt aus eigenem Fachwissen, Sätze selbst formuliert. Eigenes Material der Lehrkraft: keines.

**Offene Fragen:** Name der Lehrkraft/des Erstellers für den Katalogeintrag (erst in Commit).

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

- Goal: „Thema: beschleunigte Bewegung. Die Schüler sollen Beschleunigen, Abbremsen und Richtungsänderung beschreiben und Weg-Zeit- und Geschwindigkeit-Zeit-Diagramme zeichnen und ablesen können. Kein Rechnen mit der Beschleunigung und keine Kräfte.“
- Learners: „Klasse 9, Gesamtschule in NRW, gemischte Leistung. Sie kennen v = s/t aus Klasse 7, Diagramme sind neu, viele finden sie schwer. Für Schule und zu Hause.“
- Model and focus: „Erklärungen mit Übungen nach jedem Teil, kein reines Quiz und kein Spiel. Die Schüler sollen an den Diagrammen selbst etwas verändern und sehen, was passiert.“ Kein Katalog-Vorbild genannt; Schwerpunkt Visualisierung und Übung.
- Hurdles: „Ja, genau das mit dem Berg im Diagramm sehe ich oft. Eigene Beispiele oder Versuche habe ich nicht, nimm den Lehrplan als Orientierung.“
- Content: „nimm den Lehrplan als Orientierung“, kein eigenes Material; ich schreibe den Inhalt aus Fachwissen und Karte (guess).
- Amount: „nicht zu groß, ein Kapitel mit ein paar Seiten, etwa für zwei Wochen Unterricht.“ Meine Gliederung: zwei Kapitel, fünf Seiten (guess; ein Kapitel würde Wiederholung und Diagramme mischen).
- Languages: „Deutsch.“
- Look and feel: „Entscheide du.“ → ruhig wie ein Arbeitsblatt, freundliche Rückmeldungen (guess); Dunkelmodus folgt dem Gerät.
- Terms: nicht genannt (guess): „Geschwindigkeit“, „Weg-Zeit-Diagramm“, „Geschwindigkeit-Zeit-Diagramm“, „beschleunigen“, „abbremsen“, „Richtung ändern“; Du-Anrede.

### Entry draft

<!-- YAML valid against the entry schema, with its property names. Only known values, never invented. -->

```yaml
title: Beschleunigte Bewegung
subject: Physik
grades: [9]
summary: >-
  Schüler beschreiben, wann eine Bewegung schneller, langsamer wird oder die
  Richtung ändert. Sie lesen, zeichnen und verändern Weg-Zeit- und
  Geschwindigkeit-Zeit-Diagramme und üben auf jeder Seite.
strand: physik/mechanik
keywords: [Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, Bewegung, Beschleunigung, Diagramme lesen, Mechanik]
# url, source, commit, creator: ergänzt in Commit
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

Muster nach `lernapps-exercise-patterns` (Physik, „Linear motion“): Diagramme nebeneinander ablesen, Regler für Bewegung.

**Seitenaufbau (gleiche Abschnitts-ids auf jeder Seite, Titel passen zum Inhalt):** `einstieg`, `erklaert` (Anschaulich erklärt), `ausprobieren` (nur wo das Labor steht), `beispiel`, `uebung`.

**Übungsmuster:**
- *Zuordnen/Erkennen*: `single-choice` mit drei bis vier kleinen Diagrammbildern (`material`), Rückmeldung je Option („Das ist Stillstand, nicht gleichmäßig schnell: Der Weg wächst nicht“).
- *Ablesen*: `number` mit Diagramm als Material, Einheit im Text. Typische Fehler mit Meldung: Zeit statt Weg abgelesen (x- und y-Achse vertauscht), Skalenschritt falsch gezählt.
- *Urteilen*: `true-false` mit Begründung in der Rückmeldung; Hauptfall „Berg im Diagramm = Berg auf dem Weg“, außerdem „Bremsen heißt negative Geschwindigkeit“, „Kreisbahn mit gleichem Tempo = keine Änderung“.
- *Ordnen*: `ordering` der Abschnitte nach Tempo, nur wo die Reihenfolge eindeutig ist.
- *Zeichnen (Seite 4)*: Übungskomponente `DiagrammEinstellen`: Geschichte vorgegeben, Schüler stellen die vier Abschnitte so ein, dass sie passt; geprüft wird die Eigenschaft (Abschnittsverlauf: schneller/gleich/langsamer/steht), nicht ein einziger Satz von Werten.

**Daten:** `src/data/bewegungen.yaml`: Alltagsbewegungen (Name, Abschnitte mit Endtempo, Beschreibung); Wiederholungs-Tabelle und Beispiele ziehen daraus. Jeder Fakt einmal.

**Bilder:** Eigene SVG in `src/images/`, erzeugt mit einem Skript außerhalb von `src/`, Quelle „eigene Zeichnung“, Lizenz CC BY 4.0, Alternativtext; Farben und Beschriftungen überall gleich (s-t grün mit Strich, v-t blau, Achsen mit Zahlen und Einheit); 360 px lesbar. Bilder zeigen das Gegebene, nie die Antwort (`explainer-figure-hides-answer`).

**Komponente 1: `Bewegungslabor`** (Seiten 2, 3, 4; Prop `show`: `s`, `v` oder `both`). Keine Prüfübung, daher kein eigener Prüfablauf. Das Ganze ist eine Fahrt von 20 s in vier Abschnitten zu je 5 s, mit festem Anfang (v = 0 am Start, Start bei s = 0). Pro Abschnitt ein Regler für das Tempo am Ende (0 bis 20 m/s, in 5er-Schritten); das Tempo am Anfang des Abschnitts ist das Ende des vorigen. Die Beschriftung über dem Regler nennt, was passiert: „schneller“, „gleichbleibend“, „langsamer“ oder „steht“. Ein Kästchen „rückwärts“ pro Abschnitt kehrt die Richtung um; das Weg-Zeit-Diagramm fällt dann, das Geschwindigkeit-Zeit-Diagramm bleibt gleich, weil dort nur die Größe der Geschwindigkeit steht. Die Skala beider Diagramme bleibt fest (s: −100 bis 250 m, v: 0 bis 30 m/s, t: 0 bis 20 s). Startzustand: alle Abschnitte 10 m/s, was zwei Geraden ergibt. Der Text auf der Seite sagt, was die Regler tun und was gleich bleibt (Startpunkt, Zeitachse). Lernaktion: Schüler ändern ein Stück und sehen, wie sich nur dieses Stück der Linie ändert, und lesen dann die Bedeutung (Steigung = Tempo im Weg-Zeit-Diagramm; Höhe der Linie = Tempo im Geschwindigkeit-Zeit-Diagramm). Logik in `Bewegungslabor.ts` (Weg als Fläche aus Tempo, in Funktionen getestet), Test `Bewegungslabor.test.ts`, `nojs`-Text mit einer Beispielfahrt als Tabelle. Kann nicht: Abschnitte frei verlängern, Tempo über 20 m/s, Beschleunigung ausrechnen (kein Zahlenwert für a).

**Komponente 2: `DiagrammEinstellen`** (Seite 4, Übung mit Prüfen): gleiche Regler, aber ein Text beschreibt die Fahrt, ein Diagramm ist nicht vorgegeben; nach „Prüfen“ zeigt es richtig oder falsch mit kurzer Begründung (welcher Abschnitt passt nicht). Vertrag: `generate`, `check`, `solution`, `wrong`, `reason`, `template`, `params`, `mistakes`, `show`. Vorsicht: sie zählt nicht als die verlangte Übung der Seite; die Seite hat zusätzlich Fragen. (guess: Fällt der Vertrag zu aufwendig aus, ersetze ich sie durch eine Fragenfolge mit Bildern und halte das unter „Where I had to guess“ fest.)

**Begründung für Komponenten (`prefer-built-in-block`):** Kein eingebauter Block lässt Schüler eine Bewegung einstellen und das Diagramm dabei verändern; genau das wünscht die Lehrkraft. Alles andere sind eingebaute Blöcke.

**Wiederholungsseite:** `recap: physik/geschwindigkeit-berechnen`, nur Text, Formel, ein Beispielkasten, keine Übung. In Seite 1 steht ein Link auf die Karte für `geschwindigkeit`.

**Erweiterung später:** Ein neues Kapitel bekommt Ordner, `chapter.yaml`, Seiten mit denselben Abschnitts-ids; Muster stehen im Inhaltsleitfaden.

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
- [x] **Musterseite** (`early-preview`): App-Gerüst (`src/app.yaml` mit `format: 2`, `strand: physik/mechanik`, `languages`-Standard Deutsch, Kapitel 2 „Bewegungsdiagramme“ mit nur dieser Seite) und die Seite „Das Weg-Zeit-Diagramm lesen“ (`weg-zeit`, `competencies: [bewegungsdiagramme]`) vollständig: Einstieg, Anschaulich erklärt mit Marker-Bild, Kasten „Berg im Diagramm“, Ausprobieren mit `Bewegungslabor` (`show: s`, Logik, Test, `nojs`), Beispiel, Übung a–d. SVGs mit Skript erzeugen. Skizzen: `.vibe/sketches/01-labor-komponente.svg`, `02-seite-weg-zeit.svg`. Commit auf `work`.
- [x] **Checkpoint:** the pattern page (`early-preview`): check it against the design rules, let a sub-agent check
      it as a learner, show it to the creator, wait for the answer. A change → change the pattern first.
- [x] Übrige Seiten in einem Commit (die Seiten hängen über `chapter.yaml` und `app.yaml` zusammen und der Check läuft nur für die ganze App): Seite 1 „Schneller, langsamer, andere Richtung“ (`aenderung`) mit Streifenbild und Tabelle, Wiederholungsseite `wiederholung`, Seite 3 `geschwindigkeit-zeit` mit `Bewegungslabor` (`show: v`), Seite 4 `verbinden` mit `Bewegungslabor` (`show: both`) und `DiagrammEinstellen`, Einleitung in `app.yaml`, Glossar (`definition`-Blöcke). Änderung gegenüber dem Plan: keine Datendatei `bewegungen.yaml`; Rückmeldungen der Musterseite überarbeitet (Funde des Lerner-Checks). Commit.
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
