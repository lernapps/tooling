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
failedChecks: { accessible: 1, checks-pass: 6 }
---

# Plan: Brüche verstehen, erweitern, kürzen und vergleichen, erste Version

*Begonnen 2026-11-04. Explore, Plan, Code, Commit. Arbeit lokal auf dem Branch `work`; vor Commit wird nichts gepusht.*

## Goal

Schülerinnen und Schüler der Klasse 6 erkunden Anteile an Rechteck und Streifen, färben selbst Teile und sehen, dass Erweitern und Kürzen die Größe eines Bruchs nicht ändern. Sie lernen, was ein Bruch ist, gleichwertige Brüche zu erzeugen (erweitern, kürzen) und Brüche der Größe nach zu vergleichen. Rechnen mit Brüchen ist nicht Teil dieser Version.

## Key decisions

- Archetyp `explainer`: erst erklären, dann üben, auf jeder Seite. Ein Quiz erklärt nichts, `interactive` ist ein Spiel und nicht gewünscht.
- Strang `mathematik/arithmetik`: passt zu Klasse 6; die Karte setzt Einheit 6.1 (Hessen, Gymnasium G9).
- Kurzname `brueche` (guess): "Bruchrechnen" wäre irreführend, die App rechnet nicht.
- Die Karten-Kompetenz `brueche-kuerzen-erweitern` liegt auf drei Seiten (erweitern, kürzen, vergleichen), weil die Lehrkraft Erweitern, Kürzen und Vergleichen getrennt üben lassen will (guess).
- Voraussetzung `teilbarkeit` (die App übt sie nicht): eine Wiederholungsseite ohne Übung vor "Kürzen" (guess).
- Zwei Komponenten, sonst eingebaute Blöcke: `bruch-feld` (Teile färben) und `bruch-verfeinern` (Teile verfeinern und zusammenfassen). Kein Block zeigt Färben und Verfeinern bei gleich bleibender Fläche.
- Sprache nur Deutsch. Aussehen ruhig wie ein Arbeitsblatt (Vorgabe des Archetyps).
- Selbsteinschätzung: in Commit entscheiden (`lernapps-explainer-self-assessment`).
- Kein `scope` nötig: weder `open-task` noch eigenes Material (guess, in Code bestätigen).

## Notes

- Strang: `mathematik/arithmetik`. Lehrplan-Orientierung: Hessisches Kultusministerium, Kerncurriculum Mathematik Gymnasium Sekundarstufe I, https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf, Einheit 6.1 (Lehrplan G9, 2016). **Nicht geprüft:** das PDF ließ sich laden, aber hier nicht lesen; Einheit und Jahrgang stammen aus der Lernlandkarte.
- Kompetenzen (Wortlaut und Ids der Karte):
  - Kapitel `brueche-verstehen`, Seite `anteile`: `brueche-begriff`: "Ich kann Brüche als Teil eines Ganzen deuten und darstellen."
  - Kapitel `gleichwertige-brueche`, Seiten `erweitern`, `kuerzen`, `vergleichen`: `brueche-kuerzen-erweitern`: "Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen." Dazu die Wiederholungsseite `teilbarkeit-wiederholen` (`recap: mathematik/teilbarkeit`, ohne Übung) vor `kuerzen`.
  - `requires`: `brueche-begriff` ← `natuerliche-zahlen` (Klasse 5, nicht geübt, Verweis auf die Karte); `brueche-kuerzen-erweitern` ← `brueche-begriff` (geübt), `teilbarkeit` (Wiederholungsseite).
- Weg und aufgefangene Fehler:
  - `anteile`: Kinder färben selbst und lesen den Bruch ab. Fehler: Zähler und Nenner vertauscht; gefärbt zu ungefärbt statt gefärbt zu gesamt (3 von 8 → 3/5); ungleich große Teile als Bruch gelesen.
  - `erweitern`: Kinder verfeinern die Teilung und sehen die gleiche Fläche; Zähler und Nenner wachsen mit demselben Faktor. Fehler: nur der Nenner (oder nur der Zähler) mal Faktor; Faktor addiert statt multipliziert.
  - `kuerzen`: Kinder fassen Teile zusammen, solange es aufgeht, dann die Zahlenregel mit gemeinsamem Teiler. Fehler: Teiler abgezogen statt geteilt (6/8 → 4/6); nur Zähler oder nur Nenner geteilt; nicht vollständig gekürzt (12/18 → 6/9).
  - `vergleichen`: gleichnamige Brüche am Streifen, ungleichnamige durch Erweitern auf den gleichen Nenner. Fehler: größerer Nenner = größerer Bruch; nur Zähler verglichen.
- Umfang: drin sind Begriff, gleichwertige Brüche, Erweitern, Kürzen, Vergleichen (Nenner bis 24, echte Brüche). Draußen sind Rechnen mit Brüchen, gemischte Zahlen, Dezimalbrüche und Prozent (spätere Versionen). Sprache: Deutsch.
- Quellen: Text selbst aus Karte und Sachwissen; je Kompetenz ein zweiter Artikel (serlo.org) wird in Code geöffnet und geprüft, Fakten, keine Sätze. Eigenes Material der Lehrkraft: keins.

## Explore

### Tasks

- [x] Alle Explore-Aufgaben des Vordrucks erledigt (Skills, Interview, Archetyp, Recherche, Entry draft, Checkpoint "Recherche" bestätigt mit "Ja, passt so", Erweiterung um Vergleichen). `phase: plan` wurde gesetzt.

### Answers

- Goal: "erklären, was ein Bruch ist, und wie man Brüche kürzt und erweitert", dazu "gleichwertige Brüche und Vergleichen"; "Rechnen mit Brüchen nicht". "Erklärungen mit Übungen nach jedem Teil. Anteile kann man ja gut zeigen, und die Kinder sollen selbst ausprobieren können."
- Learners: "meine Klasse 6", "Hessen, Gymnasium".
- Model and focus: kein Vorbild genannt; Schwerpunkt Visualisierung und Ausprobieren (guess).
- Hurdles: "Die typischen Fehler such du dir selbst aus" (Auswahl siehe Notes).
- Content: "Eigenes Material habe ich nicht"; Inhalte schreibt der Assistent aus Karte und Quellen.
- Amount: Begriff, Erweitern, Kürzen und Vergleichen (bestätigt: "Ja, passt so").
- Languages: "Nur Deutsch."
- Look and feel: ruhig wie ein Arbeitsblatt (Vorgabe des Archetyps, guess).
- Terms: Zähler, Nenner, Bruchstrich, gleichwertig, erweitern, kürzen (guess).

### Entry draft

```yaml
title: Brüche verstehen, erweitern, kürzen und vergleichen
subject: Mathematik
grades: [6]
strand: mathematik/arithmetik
summary: >-
  Die Kinder färben Teile eines Rechtecks und lesen den Bruch ab. Sie verfeinern und
  fassen Teile zusammen, sehen, dass Erweitern und Kürzen die Größe nicht ändern,
  und vergleichen Brüche der Größe nach. Zu jedem Teil gibt es Übungen mit Rückmeldung.
keywords: [Brüche, Bruchteil, Anteile, erweitern, kürzen, gleichwertige Brüche, Brüche vergleichen, Zähler, Nenner]
# url, creator, source, commit, fitness: erst in Commit, wenn bekannt.
```

### Completed

## Plan

### Tasks

- [x] Inhalt auf den Archetyp abgebildet, Muster gewählt, "Content method" und Code-Aufgaben geschrieben, Skizzen in `.vibe/sketches/` (`bruch-feld.svg`, `bruch-verfeinern.svg`), der Lehrkraft gezeigt.
- [x] **Checkpoint:** Plan und Inhaltsmethode mit den Skizzen bestätigt ("Ja, passt so"; Suchwörter bestätigt).
- [x] `phase: code` gesetzt.

### Content method

- Aufbau je Seite: `einstieg` (Alltag, z. B. Schokoladentafel), `erklaerung` (Figur, Begriffe), `beispiel`, `uebung`.
- Ganzes ist immer ein Rechteck oder Streifen aus gleich großen Teilen: `figure` oder `image` (SVG) für feste Bilder, jedes mit Alt-Text, der sagt, was gezeigt wird.
- **`bruch-feld`** (Komponente, Seite `anteile`): Das Ganze ist ein Rechteck aus gleich großen Feldern (z. B. 8). Gefärbte Felder tragen Farbe und Schraffur, ungefärbte sind weiß. Kinder klicken Felder, um einen genannten Bruch zu färben, und nennen in einer zweiten Aufgabenart den Bruch eines gefärbten Bildes. Gleich bleibt das Ganze. Das führt zur Aussage: Nenner = Zahl der gleichen Teile, Zähler = gefärbte Teile. Vor "Prüfen" zeigt die Figur keinen Zählerstand (`explainer-figure-hides-answer`). Prüft: Zahl der gefärbten Felder gleich Zähler. Prüft nicht: freie Formen, ungleiche Teile. Ohne JavaScript: feste Bilder mit Text. Die Komponente zählt nicht als Pflichtübung; die Seite hat zusätzlich normale Fragen. Skizze `bruch-feld.svg`.
- **`bruch-verfeinern`** (Komponente zum Erkunden, Seiten `erweitern` und `kuerzen`): Links das Ausgangsbild, beschriftet "vorher", rechts dasselbe Rechteck mit feinerer Teilung, beschriftet "erweitert mit 3". Kinder stellen den Faktor ein; jeder Teil wird in so viele kleinere Teile geteilt, die gefärbte Fläche bleibt gleich groß, Zähler und Nenner zeigen beide mal Faktor. Das führt zur Regel: Erweitern ändert die Größe nicht. Auf `kuerzen` läuft derselbe Baustein rückwärts ("Teile zusammenfassen", solange es aufgeht). Der Faktor ist das einzige Bedienelement, weil er die Teilung ändert. Ohne JavaScript eine feste Bildfolge mit Text. Skizze `bruch-verfeinern.svg`.
- **`generated`-Aufgaben** (Muster "umwandeln, typische Fehler diagnostiziert"): auf `erweitern` "3/5 = ?/20" mit den Fehlern Zähler unverändert und Faktor addiert; auf `kuerzen` "Kürze 12/18 vollständig" mit den Fehlern nur einmal gekürzt und Teiler abgezogen; auf `vergleichen` Paare ungleichnamiger Brüche mit dem Fehler "größerer Nenner = größerer Bruch". Jede Fehlermeldung sagt, was schiefging und wie es richtig geht.
- Weitere Fragetypen: `single-choice` mit Streifenbild (gleichnamige Brüche vergleichen), `ordering` (Brüche der Größe nach), `true-false` mit Begründung ("2/4 und 3/6 sind gleich groß").
- Datendatei `src/data/bruchpaare.yaml`: Paare gleichwertiger Brüche, Nenner bis 24, jede Tatsache einmal.
- Neue Seite später: Struktur der Musterseite kopieren, Fehlerliste im Inhalts-Guide ergänzen.

### Completed

## Code

### Tasks

- [x] `phase: code` steht.
- [x] Skill `lernapps-cli` laden; App im Ordner dieses Plans mit `create` anlegen (Strang `mathematik/arithmetik`, Sprache de). Nie von Hand.
- [x] Inhalts-Guide `.agents/skills/app-content/SKILL.md` aus Notes und Content method füllen; Commit vor jedem Inhalt.
- [x] Skills `lernapps-explainer` und `lernapps-content-questions` laden; `scope`-Entscheidung in Key decisions festhalten (kein `scope`).
- [x] Musterseite `anteile` (Kapitel `brueche-verstehen`) mit Komponente `bruch-feld` (`early-preview`); Commit.
- [x] **Checkpoint:** Musterseite geprüft und von der Lehrkraft bestätigt ("Ja, passt so"; Ton mit du gut).
- [x] Seite `erweitern` (Kapitel `gleichwertige-brueche`) mit `bruch-verfeinern`; Commit.
- [x] Wiederholungsseite `teilbarkeit-wiederholen` (`recap`, ohne Übung); Commit.
- [x] Seite `kuerzen`; Commit.
- [x] Seite `vergleichen`; Commit.
- [x] Inhalts-Guide passt zum Gebauten (`app-content-matches`); `npx --no -- lernapps check` besteht.
- [ ] Screenshots aller Seiten und Zustände, Desktop und 360 px, mit den Skizzen verglichen.
- [ ] Alle Kästchen von Explore, Plan und Code abgehakt; `phase: commit` setzen und in derselben Nachricht mit Commit beginnen.

### Completed

## Commit

### Tasks

- [x] `phase: commit` steht.
- [x] Selbsteinschätzung (`lernapps-explainer-self-assessment`) ergänzen oder Verzicht begründen; Commit.
- [ ] Skill `lernapps-github`: Repo und Pages; Repo-Namen und nötige Klicks in einer Nachricht erfragen.
- [ ] `work` pushen, Vorschau-Pull-Request öffnen, Checks grün.
- [ ] **Checkpoint:** Veröffentlichen. Vorschau zeigen, Ja abwarten.
- [ ] Skill `lernapps-commit`: `work` per Squash nach `main`, Lauf `Pages` bis zum Ende; Adresse aus dem Job `deploy` öffnen, App prüfen.
- [ ] Skill `lernapps-listing`: Entry draft vervollständigen; Rückblick füllen; Plan auf `main` committen und pushen.
- [ ] **Checkpoint:** Listing-Pull-Request öffnen, bis "bestanden" abwarten, der Lehrkraft zeigen.
- [ ] Plan geändert → committen, erneut pushen.

### Completed

## Retrospective

### Phases reached

### Creator turns after the plan

### Where I had to guess
