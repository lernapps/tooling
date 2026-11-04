---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Physik, Klasse 9, kein Bundesland, keine Schulform. Orientierung: Lernlandkarte `physik`, Strang `physik/mechanik`
  (https://lernapps.net/apps/map/physik/), die sich auf die KMK-Bildungsstandards Physik MSA (Beschluss 16.12.2004
  i.d.F. vom 13.06.2024) stützt. Das KMK-PDF war beim Schreiben nicht lesbar: keine Lehrplaneinheit zitiert,
  "nicht geprüft".
- Der Ersteller hat kein eigenes Material; die App folgt der Karte. Vorwissen: v = s/t aus Klasse 7, Diagramme sind neu.

## Competencies

Kapitel `beschleunigte-bewegung` ("Beschleunigte Bewegung"), Dateien in `src/beschleunigte-bewegung/`:

| Seite (Datei) | Kompetenz (Id der Karte) | Ich kann … |
|---|---|---|
| `wiederholung-geschwindigkeit` | recap `physik/geschwindigkeit-berechnen` | (Wiederholung, keine Aufgabe) |
| `beschleunigen-bremsen` | `geschwindigkeitsaenderung` | beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert. |
| `weg-zeit-diagramm` | `bewegungsdiagramme` | eine Bewegung in einem Weg-Zeit-Diagramm darstellen und ablesen. |
| `geschwindigkeit-zeit-diagramm` | `bewegungsdiagramme` | eine Bewegung in einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen. |
| `diagramme-zeichnen` | `bewegungsdiagramme` | aus einer erzählten Bewegung ein Diagramm zeichnen. |
| `diagramme-zusammen` | `bewegungsdiagramme` | beide Diagramme verbinden, auch bei Richtungswechsel. |

Übungs-Ids stehen auf der Seite (`id:` je Aufgabe), Schema `<seite-kurz>-<art>`, z. B. `wzd-ablesen`.

## Content structure

- Jede Seite: Abschnitte mit festen Ids in dieser Reihenfolge, nicht benötigte entfallen: `einstieg` (was die
  Lernenden schon wissen), `erklaert` (Achsen, Begriffe), `ausprobieren` (nur wo ein Baustein bedient wird), `beispiel`
  (ein `example`-Kasten), `uebung` (mindestens eine Frage oder `generated`). Wiederholungsseite: nur `einstieg`, `erklaert`, `beispiel`.
- Eine neue Idee je Seite. Länge: etwa eine Bildschirmseite Text, kurze Sätze.
- `competencies: [<id>]` auf jeder Seite außer der Wiederholungsseite (`recap: physik/geschwindigkeit-berechnen`).
- Kein `scope` (kein `open-task`, kein Material des Erstellers). Nur Deutsch (`languages: [de]`).

## Terminology

- Anrede "du". Geschwindigkeit in m/s, Weg in m, Zeit in s; Zahlen mit Komma. Werte: Zeit 0 bis 12 s,
  Geschwindigkeit bis 20 m/s, Weg bis 150 m. Im Bewegungslabor stehen die Regler auf 0 bis 12 m/s, damit der Weg
  (höchstens 144 m) in die Achse bis 150 m passt; mit Richtungswechsel −12 bis 12 m/s.
- Begriffe: Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm (Kurzform s-t- und v-t-Diagramm erst nach der
  Einführung), beschleunigen, abbremsen, Richtung ändern. "Negative Geschwindigkeit" heißt: entgegen der gewählten
  Richtung. Nicht: "Beschleunigung" als Größe a und m/s² (nur ein Ausblick-Satz auf Seite 2, nicht geübt).
- Glossar (`definition`): Geschwindigkeit, Beschleunigen, Abbremsen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm.

## Exercise patterns

- **Zuordnen** (`matching`): Alltagsvorgang ↔ "beschleunigt", "bremst", "ändert die Richtung". Seite `beschleunigen-bremsen`.
- **Beurteilen** (`true-false`): Aussage mit Begründung im Feedback, z. B. "Eine waagerechte Linie im Weg-Zeit-Diagramm
  bedeutet: Das Auto fährt gleichmäßig." (falsch: es steht).
- **Ablesen** (`single-choice`, Diagramm als `material` oder davor): jede falsche Option mit `info`.
- **Berechnen** (`generated`, `number` mit Einheit): s = v · t, v = s / t, Weg als Fläche; `mistakes` mit Meldung.
- **Verändern und Zielwert** (Baustein `Bewegungslabor`, danach eine `number`-Frage): Die Lernenden stellen im Labor eine Bedingung ein ("nach 4 s genau 20 m") und tragen den eingestellten Wert ein; das Labor selbst prüft nichts. Beispiele: `wzd-zielwert` in `weg-zeit-diagramm.yaml`, `dz2-zielwert` in `diagramme-zusammen.yaml`.
- **Zeichnen** (Übungsbaustein `DiagrammZeichnen`, Seite `diagramme-zeichnen`): Geschichte aus `src/data/bewegungen.yaml` (Felder `geschichte`, `v0` bis `v3` = Geschwindigkeit bei 0, 4, 8, 12 s); vier Regler; genau richtig oder falsch, drei typische Fehler mit Meldung (Bremsen vergessen, Anfahren vergessen, Fahrt von hinten gelesen). Neue Geschichte = neuer Datensatz.
- Daten: `src/data/bewegungen.yaml`, eine Bewegung je Datensatz (id, Geschichte, Abschnitte, erwartete Punkte), jede nur einmal.

## Figures

- Feste Achsen und Farben auf allen Seiten: Weg blau, Geschwindigkeit orange, Fläche schraffiert; Zeitachse
  immer waagerecht, 0 bis 12 s. Achsen mit Zahlen, die sich beim Bedienen nicht ändern.
- Jedes Bild mit `alt` (was es zeigt) und Beschriftung (worauf achten). Bilder in `src/images/` als eigene SVG,
  `source: eigene Zeichnung`, `licence: CC-BY-4.0`.
- Bilder: `wzd-fahrt.svg` (s-t, Seite 3), `vzd-fahrt.svg` (v-t, Seiten 4 und 5), `beide-fahrt.svg` (v-t oben, s-t unten, Seite 6); Achsen mit Zahlen, Abschnitte A bis C beschriftet.
- Bausteine in `src/components/`: `Bewegungslabor` (Erkundung, Modi `st`, `vt`, `beide`), `DiagrammZeichnen`
  (Übung), gemeinsame Logik in `Bewegungslabor.ts` (auch für `DiagrammZeichnen` importiert).

## Sources

- Wikipedia "Weg-Zeit-Diagramm" und "Geschwindigkeit" (geöffnet, als Links in den Aufgaben und in `sources` der App). Lernlandkarte `physik` (gelesen 2026-11-04). Wikipedia "Beschleunigung" und "Gleichmäßig beschleunigte Bewegung"
  (geöffnet, nur Fakten, keine Sätze übernommen). KMK-PDF: nicht geprüft. Kein Video.

## Adding a chapter or round

1. Neue Kompetenz aus `https://lernapps.net/apps/map/physik.json` (Strang `mechanik`) wählen, ihre `requires`
   prüfen; nicht Geübtes bekommt eine Wiederholungsseite oder einen Link.
2. Ordner `src/<kapitel>/` mit `chapter.yaml` (`pages` vollständig), je Seite eine YAML-Datei mit den Abschnitten oben;
   Kapitel in `src/app.yaml` unter `chapters` eintragen.
3. Bewegungen für `generated`/Bausteine in `src/data/bewegungen.yaml` ergänzen (neue Datensätze, gleiche Felder).
4. Übungen aus den Mustern oben; Begriffe als `definition`; diese Datei in demselben Commit anpassen.
5. `npx --no -- lernapps check`, Screenshots ansehen, Commit auf `work`.

## Rules learned from mistakes

None yet.
