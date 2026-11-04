---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium, Jahrgang 6, Mathematik. Orientierung: Lernlandkarte `mathematik/arithmetik` (Jahrgangsband 5-6, Quelle der Karte: KMK-Bildungsstandards Mathematik ESA/MSA 2022).
- Das Hessische Kerncurriculum Mathematik Sek I wurde nicht geöffnet und ist **nicht geprüft**; es wird nicht zitiert. Die Lehrkraft hat kein eigenes Material; die App folgt der Karte und den Wünschen der Lehrkraft.

## Competencies

Strang `mathematik/arithmetik`. Ids der Karte, nicht umformulieren:

- Kapitel `bruch` („Brüche verstehen“)
  - `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen.
    Seiten `bruch/was-ist-ein-bruch` und `bruch/bruch-darstellen`.
- Kapitel `kuerzen-erweitern` („Erweitern und Kürzen“)
  - `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen.
    Seiten `kuerzen-erweitern/erweitern`, `kuerzen-erweitern/kuerzen`, `kuerzen-erweitern/vergleichen`.
  - Recap ohne Aufgaben: `kuerzen-erweitern/teiler-wiederholen` (`recap: mathematik/teilbarkeit`), vor `kuerzen`.
- Vorausgesetzt, nicht geübt: `natuerliche-zahlen` (Link im Text von `was-ist-ein-bruch`: https://lernapps.net/apps/map/mathematik/c/natuerliche-zahlen/).

Exercise-ids stehen im YAML der Seite (Präfix = Seite, z. B. `ablesen-1`); neue Aufgaben bekommen stabile ids.

## Content structure

- Jede Seite hat Abschnitte mit festen ids in dieser Reihenfolge, nicht benötigte entfallen: `einstieg` (Alltag, Vorwissen), `anschaulich` (Bild, ohne Bedienung) oder `ausprobieren` (nur wenn etwas bedient wird), `regel` (Merksatz, `definition`), `beispiel` (eine `example`-Box je Methode), `uebung` (5 bis 10 Aufgaben).
- Eine Seite = ein neuer Schritt. Kurze Sätze, Du-Form, Alltag der 6. Klasse (Pizza, Schokolade, Fußballfeld).
- Das Ganze ist immer ein Rechteck (Streifen) gleicher Breite; ein Kreis nur im Einstieg als Alltagsbild. Echte Brüche (Zähler kleiner als Nenner), Nenner bis 24.
- Nicht vorkommen: unechte Brüche, gemischte Zahlen, Rechnen mit Brüchen, Dezimalbrüche.
- Kein Abschlusstest. Nur Deutsch.

## Terminology

- Verwendet: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Anteil, gleich große Teile, erweitern, kürzen, gemeinsamer Teiler, vollständig gekürzt, gleichnamig (nur in `vergleichen`, dort erklärt).
- Vermieden: „Kuchenstück“ als Fachwort, „Zähler/Nenner“ vertauschen in Erklärungen, „Bruch“ ohne Bild beim ersten Mal.
- Schreibweise: Brüche als $\frac{3}{4}$ bzw. im Fließtext $3/4$ einheitlich als Formel; <, >, = mit Leerzeichen.
- Anrede „du“ durchgehend.
- Glossar (`definition`-Blöcke): Bruch, Zähler, Nenner, erweitern, kürzen, gemeinsamer Teiler.

## Exercise patterns

- *Ablesen*: `single-choice` mit festem Streifenbild (`material`), Datei `src/images/streifen-*.svg`; Fehler: Zähler und Nenner vertauscht, ungefärbte Teile gezählt. Dazu `generated` mit Zahlen („Wie viele Teile hat das Ganze?“, „Wie viele sind nicht gefärbt?“). Das Bild zeigt nie die Zahl. Seite `bruch/was-ist-ein-bruch`.
- *Darstellen*: Übungskomponente `BruchFaerben` (`src/components/`), prüft „genau z von n Teilen gefärbt“, kein Zähler im Bild; dazu `generated` (Schokolade, Pizza). Seite `bruch/bruch-darstellen`.
- *Erweitern*: `generated` „Erweitere a/b mit k“; Fehler: nur Nenner, nur Zähler, plus statt mal. Daten: `src/data/bruch-paare.yaml`.
- *Kürzen*: `generated` „Kürze a/b mit d“ und „Kürze vollständig“ aus `bruch-paare.yaml` (Felder `a`, `b`, `k`, `z`, `n`); Fehler: nur Zähler, ungleich geteilt, Differenz, nicht vollständig.
- *Vergleichen*: `single-choice` (<, >, =, wer hat mehr) und `generated` aus `src/data/bruch-vergleiche.yaml` (Felder `a`, `b`, `c`, `d`, `nn` gemeinsamer Nenner, `p`, `q` erweiterte Zähler, `m` Erweiterungszahl); Schritte mit Grund; Fehler: nur ersten Nenner genommen, Zähler gleich gelassen, addiert statt malgenommen.
- *Urteilen*: `true-false` und `single-choice` mit Grund für jede Option.
- Jede falsche Antwort sagt, was falsch war und wie man es richtig macht; Hinweise zeigen, wo man hinschaut.

## Figures

- `BruchEinteilung` (Erkundung, Seite 1), `BruchFaerben` (Übung, Seite 2), `Streifen` (Erkundung, Seiten `erweitern` und `kuerzen`, Prop `mode`): Komponenten, nur die Variablen des Explainers (`--page-*`), gefärbt = Farbe + Schraffur, Tippflächen mindestens 44 px, Tastatur (Pfeile, Leertaste).
- Feste Bilder eines Anteils: eigene SVG-Streifen in `src/images/` (`streifen-<z>-von-<n>.svg`, erzeugt gleichartig: weiß = nicht gefärbt, gefärbt = Farbe + Schraffur), als `figure` mit `image`, `alt` (nennt Teile und gefärbte Teile), `caption` (worauf man achten soll), `source: eigene Zeichnung`, `licence: CC-BY-4.0`. Der Block `figure bar` wird nicht benutzt, weil er Prozent anzeigt.
- Vergleich: Bild `vergleich-3-4-5-8.svg` (zwei gleich lange Streifen untereinander, Beschriftung im Bild).
- Skizzen: `.vibe/sketches/01-einteilung.svg`, `02-erweitern-kuerzen.svg`, `03-vergleichen.svg`.
- Eigene Bilder: keine; alles selbst gezeichnet. Lizenz: wie die App (MIT für Code, CC BY 4.0 für Inhalt).

## Sources

- Lernlandkarte Mathematik, https://lernapps.net/apps/map/mathematik.json (gelesen 2026-11-04).
- Hessisches Kerncurriculum: nicht geprüft, nicht zitiert. Zweitquellen nicht geöffnet; keine Sätze fremder Texte übernommen, alle Texte selbst geschrieben.
- Kein Material der Lehrkraft.

## Adding a chapter or round

1. Kompetenz mit id aus der Karte wählen, ihre `requires` prüfen (Recap-Seite oder Link).
2. Ordner `src/<kapitel>/` mit `chapter.yaml` anlegen und in `src/app.yaml` unter `chapters` eintragen; Seiten in `pages` vollständig auflisten.
3. Seite nach dem Muster einer vorhandenen schreiben (gleiche Abschnitts-ids), `competencies: [<id>]`.
4. Aufgaben aus den Mustern oben; neue Daten als Datensatz in `src/data/*.yaml`, jeder Fakt einmal.
5. Diesen Leitfaden und den Plan (Notes) in demselben Commit anpassen.
6. `npx --no -- lernapps check`, dann committen.

## Rules learned from mistakes

None yet.
