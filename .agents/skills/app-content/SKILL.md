---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- NRW, Gesamtschule, Physik, Klasse 9. Orientation: Kernlehrplan Naturwissenschaften (Biologie, Chemie, Physik) für die Gesamtschule, QUA-LiS NRW, https://lehrplannavigator.nrw.de/system/files/media/document/file/klp_ge_nw.pdf. Nicht geprüft: das PDF konnte nicht gelesen werden, deshalb wird keine Einheit zitiert. Die Struktur folgt der Lernlandkarte, Strang `physik/mechanik` (https://lernapps.net/apps/map/physik.json).
- Kein eigenes Material der Lehrkraft. Qualitativ gearbeitet: keine Beschleunigungsformeln (a = Δv/Δt), kein s = ½·a·t², keine Kräfte, kein freier Fall als Formel. Das kommt erst in der Oberstufe.

## Competencies

Chapter `bewegung` ("Beschleunigte Bewegung"), Wortlaut der Karte unverändert.

- `geschwindigkeitsaenderung`: Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert. Seite `bewegung/aenderung`.
- `bewegungsdiagramme`: Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen. Seiten `bewegung/weg-zeit`, `bewegung/geschwindigkeit-zeit`, `bewegung/richtung`, `bewegung/zusammen`.
- Wiederholung ohne Übung: `physik/geschwindigkeit-berechnen` auf `bewegung/wiederholung` (recap). `geschwindigkeit` und `strecke-und-zeit-messen` werden dort mit Link auf die Karte genannt.

## Content structure

- Seitenreihenfolge: `wiederholung`, `aenderung`, `weg-zeit`, `geschwindigkeit-zeit`, `richtung`, `zusammen`.
- Jede Seite mit Übung hat die Abschnitte (ids fest, Titel passen zum Inhalt): `einstieg` (Anknüpfung an Bekanntes), `erklaerung` (anschaulich erklärt), `ausprobieren` (nur wo etwas bedient wird), `beispiel` (`example`-Box, ein Beispiel), `uebung` (Basisaufgabe, dann eine "Knobeln"-Aufgabe mit Tipp). Nicht benötigte Abschnitte entfallen.
- Eine neue Idee pro Seite (`explainer-one-step`). Seite 3 beginnt mit Achsen und einem Punkt.
- Die Wiederholungsseite hat nur beschreibende Blöcke, keine Übung.

## Terminology

- Verwendet: beschleunigen, abbremsen (auch "langsamer werden"), Richtung ändern, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, Tempo (für den Betrag der Geschwindigkeit, Alltagswort), Geschwindigkeit in m/s.
- Vermieden: "Verzögerung", "negative Beschleunigung", Formelzeichen a, Δv, "Kraft".
- Ansprache: "du", kurze Sätze, Fachwörter bei der ersten Verwendung erklärt. Glossar aus `definition`-Blöcken: Beschleunigen, Abbremsen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm.

## Exercise patterns

- "Diagramm ablesen": Diagramm gegeben (SVG in `src/images/`, Achsenzahlen), `single-choice` oder `true-false`, Begründung in `info`. Beispiel: `bewegung/weg-zeit`, Abschnitt `uebung`.
- "Zuordnen": Alltagssituation oder Fahrt ↔ Kurve oder Aussage, `matching`; Fahrabschnitte in Reihenfolge, `ordering`.
- "Diagramm einstellen": Übungskomponente `DiagrammZeichnen` (Tempo-Tasten, `check` prüft die gefragte Eigenschaft, nicht Gleichheit mit der Lösung). Seiten `geschwindigkeit-zeit`, `richtung`, `zusammen`, Abschnitt `uebung`. Jede Aufgabe steht in `aufgaben` mit `text`, `verlauf` (ein Zeichen je Sekunde: `+` steigt, `-` fällt, `0` bleibt gleich, immer in Anführungszeichen), `start` (Tempo bei 0 s) und optional `ende`. Seed n wählt die n-te Aufgabe, danach von vorn. Pro Block eine Art Aufgabe; `examples` mit mindestens einer richtigen und einer falschen Linie je Aufgabe. Meldungen: `mistakes` (waagerechte Linie, Auf und Ab vertauscht), `abschnitt`, `endeFalsch`; sie verraten die Lösung nicht. `rueckwaerts: true` erlaubt Tempo bis -2 m/s (Seite `richtung`).
- "Diagramm verändern und beobachten": Komponente `BewegungsDiagramm` (kein Prüf-Exercise) im Abschnitt `ausprobieren`, Prop `ansicht` (`weg`, `geschwindigkeit`, `beide`).
- Datendatei `src/data/fahrten.yaml`: jede Fahrt einmal (`id`, `titel`, `beschreibung`, `tempo` bei t = 0 bis 6 s, ganze m/s). Fahrten: `gleichmaessig`, `bus`, `fahrrad`, `hin-zurueck`. `BewegungsDiagramm` bekommt sie mit `fahrten: { data: fahrten }` und wählt mit `start`. Prop `konstant: true` stellt ein Tempo für die ganze Fahrt ein (Seite `weg-zeit`).
- Aufgabenarten mit Bildern: `single-choice` und `number` mit `material` (SVG, Gitter 1 s breit; Alt-Text beschreibt, verrät nie die Antwort), `true-false` zu typischen Fehlvorstellungen (waagerecht heißt hier steht, fallende Linie heißt rückwärts, Minus heißt langsamer), `matching` und `multiple-choice` in `aenderung` und `zusammen`. Am Ende jedes Übungsabschnitts steht die Zeile "Knobeln" mit einer schwereren Aufgabe.

## Figures

- Zeit immer waagerecht, 0 bis 6 s, Skala bleibt beim Verändern fest. Geschwindigkeit in m/s (0 bis 4, auf Seite 5 auch rückwärts), Weg in m. Achsen tragen Zahlen und Einheiten.
- Farben: Geschwindigkeit-Zeit orange, Weg-Zeit blau, zusätzlich Beschriftung am Diagramm, nie nur Farbe.
- Jede Abbildung hat `alt` und Bildunterschrift (was ansehen). Eigene Zeichnungen: Quelle "eigene Zeichnung", Lizenz CC-BY-4.0.
- Die Lösung steht nie in der Abbildung einer Aufgabe.
- Bilder in `src/images/` (eigene SVG, weißer Hintergrund, Gitter und Zahlen an den Achsen): `weg-zeit-punkt`, `weg-zeit-drei-wagen`, `weg-zeit-ablesen`, `geschw-zeit-bus`, `geschw-zeit-ablesen`, `geschw-zeit-rueckwaerts`. Die Komponenten zeichnen mit fester Skala: Zeit 0 bis 6 s, Tempo 0 bis 4 m/s (mit `rueckwaerts` -2 bis 4), Weg 0 bis 24 m (mit `rueckwaerts` -12 bis 24).

## Sources

- Lernlandkarte `physik/mechanik` (gelesen), Kernlehrplan NRW (nicht geprüft, siehe oben).
- Keine zweite Quelle zitiert: de.wikipedia "Weg-Zeit-Diagramm" ist eine Begriffsklärung, "Beschleunigung" behandelt Formeln und Kräfte.

## Adding a chapter or round

1. Kompetenzen aus der Karte wählen (`https://lernapps.net/apps/map/physik.json`), nichts erfinden; fehlt eine, im Katalog vorschlagen.
2. Ordner `src/<kapitel>/` mit `chapter.yaml`, in `src/app.yaml` unter `chapters` und die Seiten in `chapter.yaml` eintragen.
3. Seiten mit den Abschnitten oben schreiben, Übungen nach den Mustern, neue Fahrten in `src/data/fahrten.yaml`.
   1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt (`src/bewegung/chapter.yaml`; jede Übung muss ohne ihre Seite verständlich sein, die Wiederholungsseite fehlt).
4. Glossar-Begriffe als `definition`; diesen Leitfaden ergänzen.
5. `npx --no -- lernapps check`, dann Commit auf `work`.

## Rules learned from mistakes

None yet.
