---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

Erklär-App „Beschleunigte Bewegung“ (Physik, Klasse 9). Deutsch, Du-Form. Format 2, Strang `physik/mechanik`.

## Curriculum

- Nordrhein-Westfalen, Gesamtschule, Klasse 9, gemischte Leistungen; Lernende kennen v = s/t aus Klasse 7, Diagramme von Bewegungen sind neu.
- Orientierung: Kernlehrplan für die Gesamtschule – Sekundarstufe I in Nordrhein-Westfalen, Naturwissenschaften (Biologie, Chemie, Physik), Ministerium für Schule und Weiterbildung NRW, Heft 3108, 2. Auflage 2013, https://lehrplannavigator.nrw.de/system/files/media/document/file/klp_ge_nw.pdf. Inhaltsfeld „Bewegungen und ihre Ursachen“ bzw. „Bewegung in Natur und Technik“, Kompetenzbereich Kommunikation: Bewegung anhand eines Zeit-Weg- bzw. Zeit-Geschwindigkeits-Diagramms qualitativ beschreiben und Durchschnittsgeschwindigkeiten bestimmen. Seitenzahlen nicht geprüft.
- Der Lehrplan verlangt die qualitative Beschreibung: Die Beschleunigung als Größe a = Δv/Δt (m/s²) gehört nicht in die App (Entscheidung des Erstellers: kommt in der Oberstufe).

## Competencies

Ids der Lernlandkarte `physik/mechanik` (https://lernapps.net/apps/map/physik.json), Wortlaut der Karte. Eine Seite je Kompetenz, große Kompetenzen mehrere Seiten.

**Kapitel `geschwindigkeit-aendert-sich`** – Wenn sich die Geschwindigkeit ändert
- `geschwindigkeitsaenderung`: Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert.
  - `beschleunigen-abbremsen` (Übungen `spur-deuten`, `abbremsen-stillstand`, `bremsen-wahr-falsch`)
  - `richtung-aendert-sich` (Übungen `situation-zuordnen`, `richtung-wahl`, `umkehr-erkennen`)
- Wiederholung (`recap: physik/geschwindigkeit`): `geschwindigkeit-wiederholt`, ohne Übung.

**Kapitel `bewegungen-im-diagramm`** – Bewegungen im Diagramm
- `bewegungsdiagramme`: Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen.
  - `weg-zeit-diagramm` (Übungen `steigung-ablesen`, `schnellster-abschnitt`, `waagerecht-wahr-falsch`)
  - `weg-zeit-kurven` (Übungen `kurve-zuordnen`, `kurve-bewegung`; Komponente `Bewegungsdiagramm` mit `art: knoten`, Bilder `kurve-steiler.svg`, `kurve-flacher.svg`)
  - `geschwindigkeit-zeit-diagramm` (Übungen `vt-ablesen`, `vt-deuten`, `vt-zuordnen`; Bilder `vt-anfahren.svg`, `vt-fahrt.svg`)
  - `bewegung-darstellen` (Übungen `fahrrad-diagramm`, `diagramm-zuordnen`, `durchschnitt-ablesen`; Bilder `fahrt-st.svg`, `fahrt-vt.svg`, `vt-auswahl.svg`)
- Wiederholung (`recap: physik/geschwindigkeit-berechnen`): `geschwindigkeit-berechnen-wiederholt`, ohne Übung.

## Content structure

- Dateien: `src/app.yaml`, `src/<kapitel>/chapter.yaml`, `src/<kapitel>/<seite>.yaml`, Daten `src/data/*.yaml`, Bilder `src/images/*.svg`, Komponenten `src/components/`.
- Jede Seite mit `competencies: [<id>]` hat diese Abschnitte in dieser Reihenfolge, fest benannte Ids: `einstieg` (knüpft an Bekanntes an, ein bis zwei Absätze), `erklaert` (die neue Sache, Zeichnung oder Formel), `ausprobieren` (nur wenn dort etwas bedient wird: genau eine Komponente und der Text, was die Regler tun), `durchschnitt` (nur auf `bewegung-darstellen`: Definition und Rechnung der Durchschnittsgeschwindigkeit), `beispiel` (eine `example`-Box mit einem Zahlenbeispiel oder einer Alltagssituation), `uebung` (Aufgaben, mindestens eine Frage oder `generated`). Überschriften sagen, was im Abschnitt passiert.
- Wiederholungsseiten: nur `einstieg`/`erklaert`/`beispiel`, keine Übung, kein `competencies`.
- Länge: eine Seite hat höchstens eine neue Idee (`explainer-one-step`), 150–300 Wörter Text, zwei bis vier Aufgaben.
- Zahlenbereiche: Zeiten 0 bis 8 s (Blitzbild bis 6 s, `DiagrammZeichnen` bis 9 s), Wege bis 100 m (Blitzbahn bis 40 m), Geschwindigkeiten 0 bis 12 m/s (Fahrrad, Scooter). Geradlinige Bewegung; der Weg s ist die Entfernung vom Start und wird nie negativ.
- Das Geschwindigkeit-Zeit-Diagramm zeigt nur den Betrag der Geschwindigkeit; Rückwärtsfahren (Richtungsumkehr) wird nur im Weg-Zeit-Diagramm gezeigt (s nimmt ab).

## Terminology

- Du-Form, kurze Sätze, Beispiele aus dem Alltag der Jugendlichen (Fahrrad, Bus, Sprint, Scooter).
- Begriffe: „schneller werden“ / „beschleunigen“, „langsamer werden“ / „abbremsen“, „Richtung ändern“, „gleich schnell“; **Weg-Zeit-Diagramm** (s-t) und **Geschwindigkeit-Zeit-Diagramm** (v-t) – nie „Zeit-Weg-Diagramm“ im Text. „Steigung“ des Graphen = wie steil er ist.
- Vermieden: „Beschleunigung“ als Größe mit m/s² (draußen); „negative Beschleunigung“; „Bahnkurve“.
- Einheiten: m, s, m/s, km/h; Schreibweise mit `\pu{…}` bzw. „m/s“ im Text; Dezimalkomma im Text, Punkt nur in Formeln der Daten.
- Glossar (`definition`-Blöcke): beschleunigen, abbremsen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm; Wortlaut je ein Satz, der die Seite nicht wiederholt.

## Exercise patterns

| Muster | Kompetenz-Seite | Form | Beispiel | Daten |
|---|---|---|---|---|
| Spur deuten | `beschleunigen-abbremsen` | `single-choice`/`true-false` mit Bild der Spur als `material`; Grund in jeder falschen Option | `spur-deuten` | `src/images/spur-*.svg` |
| Änderung benennen | `richtung-aendert-sich` | `matching` Situation ↔ Art der Änderung (schneller, langsamer, Richtung, nichts) mit vier Paaren im Block, dazu `multiple-choice` `richtung-wahl` | `situation-zuordnen` | Paare im Block |
| Steigung ablesen | `weg-zeit-diagramm` | `generated`: zwei Punkte (t, s) einer Geraden, v = s/t mit Einheit; Fehler s·t, t/s | `steigung-ablesen` | `src/data/ablesen-st.yaml` |
| Diagramm erkennen | `weg-zeit-kurven`, `geschwindigkeit-zeit-diagramm`, `bewegung-darstellen` | `single-choice`/`matching` mit Bildern von s-t- und v-t-Diagrammen | `kurve-zuordnen`, `diagramm-zuordnen` | `src/images/diagramm-*.svg` |
| Linie ↔ Bewegung zuordnen | `weg-zeit-kurven`, `geschwindigkeit-zeit-diagramm` | `matching`: Aussage über den Verlauf der Linie (steigt, fällt, waagerecht, steiler, flacher) ↔ Aussage über die Bewegung, vier Paare im Block | `kurve-bewegung`, `vt-zuordnen` | Paare im Block |
| Wert ablesen | `geschwindigkeit-zeit-diagramm`, `bewegung-darstellen` | `number` mit Diagramm als `material`, Toleranz 0, Einheit m/s | `vt-ablesen`, `durchschnitt-ablesen` | Bilder `vt-fahrt.svg`, `kurve-flacher.svg` |
| Diagramm einstellen | `bewegung-darstellen` | Übungs-Komponente `DiagrammZeichnen`: Aufgabe in Worten, Geschwindigkeit zu vier Zeitpunkten einstellen; geprüft wird die Form (steigt, bleibt, fällt, Endwerte ±1 m/s) | `fahrrad-diagramm` | Props der Komponente |

- Jede falsche Option nennt ihren Grund; gerechnete Aufgaben haben zwei bis drei typische Fehler mit Meldung und einen Hinweis.
- Neue Aufgaben nach diesen Mustern, bevor ein neues Muster entsteht.

## Figures

- Komponenten (alle in `src/components/`, Logik in `Bewegungsmodell.ts`): `Bewegungsspur` (Props `bewegungen`: Name und Orte des Wagens bei 0, 1, 2 … s in m, höchstens 7 Werte, Bahn 0 bis 40 m; Wagen, ein Punkt je Sekunde, Rückweg in einer zweiten Reihe; Logik in `Bewegungsspur.ts`), `Bewegungsdiagramm` (Props `ansicht`: `weg` oder `geschwindigkeit`, `art`: `abschnitte` oder `knoten`; Regler, Graph, Wagen, Zeitmarke), `DiagrammZeichnen` (Übungs-Komponente: Props `szenarien` (drei Geschichten mit {v} und {h}), `mistakes`, `fehlerAbschnitt`, `fehlerWert`; vier Regler für die Geschwindigkeit bei 0, 3, 6, 9 s; geprüft wird die Form jedes Abschnitts und je Wert ±1 m/s; Logik in `DiagrammZeichnen.ts`, neue Szenarien dort in `solution` und in den Props ergänzen).
- Konventionen überall: Graph und Wagen blau, Zeitmarke rosa gestrichelt; Achsen mit Einheit (`t in s`, `s in m`, `v in m/s`) und festen Zahlen, die sich beim Verstellen nicht verschieben; ein Diagramm je Ansicht (nie s-t und v-t im selben Bild einer Seite, außer die Seite vergleicht sie ausdrücklich).
- Blöcke der Komponenten (Ids): `spur-ausprobieren`, `spur-umkehr` (Bewegungsspur); `weg-zeit-regler` (`art: abschnitte`), `weg-zeit-kurve`, `geschwindigkeit-zeit-regler` (Bewegungsdiagramm, `art: knoten`); `fahrrad-diagramm` (DiagrammZeichnen). Auf einer Seite mit `ausprobieren` steht genau eine Komponente.
- Jede Komponente hat `nojs` (Tabelle der Werte und Beschreibung des Graphen).
- Bilder als SVG in `src/images/` (`wz-*.svg` Weg-Zeit-Diagramme, `spur-*.svg` Blitzbilder, weiß hinterlegt, Schrift 16–17 Einheiten im viewBox von 400 Breite, damit sie bei 360 px lesbar bleibt; Punkte blau mit Sekundenangabe, die Beschriftungen abwechselnd in zwei Höhen), eigene Zeichnung, `source: eigene Zeichnung`, `licence: CC-BY-4.0`; `alt` sagt, was zu sehen ist, `caption` was man ansehen soll. Bilder in Aufgaben zeigen nur Gegebenes, nie die Antwort.

## Sources

- Lehrplan siehe Curriculum (selbst gelesen).
- Wikipedia „Weg-Zeit-Diagramm“ (https://de.wikipedia.org/wiki/Weg-Zeit-Diagramm) und „Beschleunigung“ (https://de.wikipedia.org/wiki/Beschleunigung), geöffnet und geprüft; nur Fakten übernommen, keine Sätze.
- Leifiphysik war nicht abrufbar (HTTP 403), nicht geprüft und nicht verwendet. Kein Video.
- Fehlvorstellungen (Abbremsen = Stillstand, Diagramm = Bild der Bahn, waagerechte Linie = gleichmäßig schnell fahren, ansteigender v-Graph = Weg wächst): Annahmen des Autors aus der Fachdidaktik, nicht aus einer geöffneten Quelle.

## Adding a chapter or round

1. Kompetenz-ID aus der Karte `physik/mechanik` wählen (Voraussetzungen `requires` prüfen; was die App nicht übt, bekommt eine Wiederholungsseite oder einen Link `https://lernapps.net/apps/map/physik/c/<id>/`).
2. Ordner `src/<kapitel>/` mit `chapter.yaml` (Titel, Zusammenfassung, `pages` vollständig), Kapitel in `src/app.yaml` unter `chapters` eintragen.
3. Seite `src/<kapitel>/<seite>.yaml` mit `competencies`, den Abschnitten aus „Content structure“ und einer Übung nach den Mustern oben anlegen. Zahlen aus `src/data/*.yaml`, Bilder nach „Figures“.
4. Komponente nur, wenn kein Block reicht: Dateien `<Name>.vue`, `<Name>.ts`, `<Name>.test.ts`, `nojs`.
5. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt (Kapitel `chapter.yaml`, eine Stufe je Inhaltsseite; Wiederholungsseiten kommen nicht vor).
6. Diesen Leitfaden ergänzen (Competencies, Exercise patterns, Figures), `npx --no -- lernapps check` laufen lassen, committen (eine Aufgabe, ein Commit).

## Rules learned from mistakes

None yet.
