---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Nordrhein-Westfalen, Gesamtschule, Jahrgang 9, Fach Physik.
- Orientierung: Kernlehrplan Naturwissenschaften für die Gesamtschule, Sekundarstufe I, NRW (2013), Inhaltsfeld
  "Bewegungen und ihre Ursachen". **Nicht geprüft:** Das amtliche Dokument war nicht lesbar; keine Einheit wird zitiert.
- Maßgeblich sind die Lernlandkarte `physik/mechanik` (https://lernapps.net/apps/map/physik/) und die Ziele der
  Lehrkraft. Kein eigenes Material der Lehrkraft.
- Bewusst nicht enthalten: Beschleunigung als Größe $a = \Delta v / \Delta t$ und Formeln wie $s = \tfrac12 a t^2$ (Oberstufe),
  Kräfte, negative Werte in den Diagrammen.

## Competencies

Strang `physik/mechanik`, Kapitel `beschleunigte-bewegung`:

- `geschwindigkeit-berechnen` (Wiederholung, Seite `geschwindigkeit-wiederholen`, `recap`, keine Übung).
  `geschwindigkeit` und `strecke-und-zeit-messen` stehen als Links im Text dieser Seite.
- `geschwindigkeitsaenderung`: "Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die
  Richtung ändert." Seite `geschwindigkeitsaenderung`.
- `bewegungsdiagramme`: "Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm
  darstellen und ablesen." Zwei Seiten: `weg-zeit-diagramm` und `geschwindigkeit-zeit-diagramm`.

## Content structure

- Anrede "du", kurze Sätze, Alltagsbeispiele (Fahrrad, Bus, Sprint).
- Jede Seite hat feste Abschnitts-ids: `einstieg` ("Aus dem Alltag"), `erklaerung` ("Anschaulich erklärt"),
  `ausprobieren` ("Ausprobieren", nur wo etwas bedient wird), `beispiel` (Kasten `example`), `uebung` ("Übung").
  Die Wiederholungsseite hat `einstieg` und `merksatz`.
- Eine Seite = ein neuer Schritt. Inhalte späterer Seiten bleiben draußen.

## Terminology

- Verwendet: "beschleunigen", "abbremsen", "Richtung ändern", "Geschwindigkeit", "Weg-Zeit-Diagramm",
  "Geschwindigkeit-Zeit-Diagramm", "gleichbleibende Geschwindigkeit", "Stillstand".
- Vermieden: "verzögern", "negative Beschleunigung", "Beschleunigung" als Größe.
- Einheiten: s in m, t in s, v in m/s. Zeit waagerecht, Weg oder Geschwindigkeit senkrecht. "Weg" heißt der
  zurückgelegte Weg (nie negativ), "Geschwindigkeit" in den Diagrammen ihr Betrag.
- Glossar: `definition`-Blöcke für beschleunigen, abbremsen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm.

## Exercise patterns

1. *Fahrt beschreiben* (Seite `geschwindigkeitsaenderung`): `single-choice` und `true-false` mit dem Grund in `info`.
   Beispiel: "Ein Auto bremst: seine Geschwindigkeit ist null" ist falsch, weil Bremsen langsamer werden heißt.
2. *Diagramm zur Fahrt zuordnen* (Seiten 3, 4): `single-choice` oder `matching` mit einem Bild (`material`). Falsche
   Optionen sind echte Fehlvorstellungen, jede mit Grund.
3. *Ablesen* (Seiten 3, 4): `number` mit Einheit zu einem Bild. Typische Fehler: Wert der falschen Achse, Zeit statt
   Weg, Teilstrich falsch gezählt, jeder mit eigener Nachricht.
4. *Zeichnen* (Seite 4): Übungskomponente `VtZeichnen` (`src/components/VtZeichnen.ts`): fünf Säulen von 0 bis 10 m/s. Drei
   Aufgaben im Wechsel: stehen, dann in jeder Stufe schneller; gleichmäßig, dann in jeder Stufe langsamer bis zum Stand;
   gegebene Werte. Geprüft wird die Eigenschaft (die ersten beiden Aufgaben), nicht eine Musterlösung.
5. *Fahrt einstellen* (Seite 2): Übungskomponente `FahrtStreifen`, ein Ausprobier-Werkzeug und eine Übung in einem. Drei
   Aufgaben im Wechsel: erst abbremsen, dann die Richtung ändern; erst schneller werden, dann abbremsen und stehen;
   gleichbleibend nach links fahren. Bremsen zählt nur, wenn das Auto dabei noch fährt (kein Sprung auf 0).

Datendatei: `src/data/fahrten.yaml`, Fahrten mit `id`, `name`, `beschreibung` und `v1` bis `v5` (m/s je 2-s-Abschnitt, zusammen 10 s). Die erste Fahrt (`gleichmaessig`) ist der Startzustand der Werkstätten. Die Werkstätten der Seiten 3 und 4 beziehen sie als `fahrten: { data: fahrten }`.
Kein `generated`: die Zahlen kommen aus den Fahrten und den Komponenten. Neue Fahrt: Datensatz mit denselben Feldern anhängen.

## Figures

- Gezeichnete SVG-Bilder in `src/images/` (eigene Zeichnung, CC-BY-4.0) für die Aufgaben, mit `alt` und Beschriftung:
  `fahrtstreifen-erklaerung.svg`, `wz-*.svg` (Weg-Zeit), `vt-*.svg` (Geschwindigkeit-Zeit). Die Weg-Zeit- und Geschwindigkeit-Zeit-Bilder
  werden mit demselben Maßstab wie die Komponenten gezeichnet.
- Komponenten dort, wo Schüler eine Bewegung ändern: `FahrtStreifen` (Seite 2, Übung), `WegZeitWerkstatt` (Seite 3,
  Ausprobieren: Fahrt, Zeitregler und Weg-Zeit-Diagramm), `GeschwindigkeitZeitWerkstatt` (Seite 4, Ausprobieren: Säulen
  und darunter das Weg-Zeit-Diagramm derselben Fahrt), `VtZeichnen` (Seite 4, Übung). Gemeinsame Logik: `Bewegung.ts`. Jede erklärt vor der Benutzung das Ganze, die Marken, was sich ändert und was gleich
  bleibt (`explainer-representation-explained`).
- Konventionen: Weg blau, Geschwindigkeitspfeil und -balken orange beziehungsweise blau gefüllt mit Muster, Achsen mit
  Zahlen und Einheit, Maßstab t 0–10 s in 2-s-Stufen, s 0–100 m, v 0–10 m/s. Farben nie allein: dazu
  Beschriftung oder Muster.
- Bilder bündeln, nichts von fremden Servern.

## Sources

- Lernlandkarte: https://lernapps.net/apps/map/physik/ (Strang `mechanik`).
- Zweite Quellen, geöffnet: Wikipedia "Beschleunigung", "Geschwindigkeit", "Weg-Zeit-Diagramm (Mechanik)". Nur
  Fakten, keine Sätze übernommen. Vor einem Fakt den Abschnitt lesen.
- Der Lehrplan ist nicht geprüft (siehe Curriculum). Kein Video, kein serlo-Artikel gefunden.

## Adding a chapter or round

1. Kompetenz aus der Karte wählen (`https://lernapps.net/apps/map/physik.json`); fehlt sie, an `lernapps/apps`
   vorschlagen, nicht erfinden.
2. Neuen Ordner `src/<kapitel>/` mit `chapter.yaml` anlegen und in `src/app.yaml` unter `chapters` eintragen.
3. Seite mit den fünf Abschnitten schreiben, in `pages` von `chapter.yaml` eintragen, `competencies` setzen.
4. Neue Fahrt: Datensatz in `src/data/fahrten.yaml`. Übungen nach den Mustern oben.
5. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt.
6. `npx --no -- lernapps check`, dann committen.

## Rules learned from mistakes

None yet.
