---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

Lern-App "Stromkreis und elektrischer Strom", Physik Klasse 8, nur Deutsch, Explainer im Format 2, Strang `physik/elektrizitaetslehre`.

## Curriculum

- Physik, Klasse 8, Gymnasium, Nordrhein-Westfalen. Orientierung (willkommen, nicht Bedingung): Kernlehrplan Physik NRW, Gymnasium; **nicht geprüft** (Dokument hier nicht lesbar gewesen), deshalb keine Lehrplaneinheit zitiert. Die Kompetenzen folgen der Lernlandkarte https://lernapps.net/apps/map/physik.json (Quelle der Karte: KMK, Weiterentwickelte Bildungsstandards Physik (MSA), 2024).
- Eigenes Material der Lehrkraft gibt es nicht. Wer es später bekommt, hält es lokal und committet es nicht.
- Vorwissen: einfache Stromkreise mit Batterie und Lampe aus der Grundschule; Stromstärke und Spannung sind neu.
- Nicht Teil der App: Widerstand, ohmsches Gesetz, Rechnen in Schaltungen, Leistung und Energie, Ladungsmodell, Wärme-, Licht- und Magnetwirkung.

## Competencies

Seiten-id (Kompetenz-id der Karte), jeweils `src/<kapitel>/<seite>.yaml`:

1. Kapitel `stromkreis`
   - `einfacher-stromkreis` (einfacher-stromkreis): Ich kann einen einfachen Stromkreis aus Batterie, Lampe und Kabeln aufbauen und erklären, warum er geschlossen sein muss.
   - `schalter` (schalter): Ich kann erklären, wie ein Schalter einen Stromkreis öffnet und schließt.
   - `leiter-isolator` (leiter-nichtleiter): Ich kann Leiter und Nichtleiter unterscheiden und Beispiele nennen.
   - `schaltplan` (schaltzeichen): Ich kann einen Stromkreis als Schaltplan mit Schaltzeichen zeichnen und einen Schaltplan lesen.
2. Kapitel `stromstaerke`
   - `stromstaerke` (stromstaerke): Ich kann die Stromstärke als Maß dafür erklären, wie viel Strom fließt, und sie in Ampere angeben.
   - `amperemeter` (stromstaerke-messen): Ich kann die Stromstärke mit einem Amperemeter richtig messen.
3. Kapitel `spannung`
   - `spannungsquellen` (spannungsquellen): Ich kann Spannungsquellen wie Batterie, Netzgerät und Steckdose nennen und sagen, wofür sie sich eignen.
   - `spannung` (spannung): Ich kann die Spannung als Antrieb des Stroms erklären und sie in Volt angeben.
   - `voltmeter` (spannung-messen): Ich kann die Spannung mit einem Voltmeter richtig messen.
4. Kapitel `schaltungen`
   - `reihenschaltung` (reihenschaltung): Ich kann eine Reihenschaltung aufbauen und erklären, was passiert, wenn ein Bauteil ausfällt.
   - `reihenschaltung-messen` (reihenschaltung): Stromstärke und Spannungen messen und vergleichen, ohne Rechnen mit Widerstand.
   - `parallelschaltung` (parallelschaltung): Ich kann eine Parallelschaltung aufbauen und erklären, was passiert, wenn ein Zweig ausfällt.
   - `parallelschaltung-messen` (parallelschaltung): wie oben für die Parallelschaltung.
5. Kapitel `sicherheit`
   - `gefahren` (gefahren-des-stroms): Ich kann erklären, warum Strom aus der Steckdose gefährlich ist und Strom aus einer Batterie nicht.
   - `regeln` (sicher-mit-strom-umgehen): Ich kann Regeln für den sicheren Umgang mit Strom nennen und anwenden.

Die Kompetenz-ids stehen in `competencies:` jeder Seite. Aufgaben-ids: `<seiten-id>-<nr>` (zum Beispiel `amperemeter-3`), stabil nach der Veröffentlichung. Die Karte hat für "messen in Reihen- und Parallelschaltung" in Klasse 8 keine eigene Kompetenz; die Messseiten tragen deshalb `reihenschaltung` und `parallelschaltung`, ein Vorschlag an `lernapps/apps` (`map/physik.yaml`) ist zu stellen.

## Content structure

Jede Seite hat dieselben Abschnitte in dieser Reihenfolge (nicht benötigte entfallen), mit festen ids und zur Seite passenden Titeln:

1. `einstieg`: eine Alltagssituation (Taschenlampe, Fahrradlicht, Steckdose), ein bis drei Sätze, sagt, wohin die Seite führt.
2. `erklaerung`: Text, Schaltplan (`figure`, Bild), Merkkasten als `definition` oder `note`; ein neuer Schritt pro Seite.
3. `beispiel`: `example`-Kasten, Schritt für Schritt (Wert ablesen, Messstelle wählen, Weg verfolgen).
4. `uebung`: vier bis sechs Aufgaben, vom Erkennen zum Anwenden; Aufgaben-ids `<seiten-id>-1` bis `-6`.

Umfang: eine Seite passt auf wenige Bildschirmhöhen; Sätze kurz, Fachwort bei der ersten Verwendung erklärt. Reihenfolge der Seiten und Kapitel in `src/app.yaml` und `chapter.yaml` folgt `requires` der Karte.

## Terminology

- Schreibweise: "Leiter" und "Isolator"; "Nichtleiter" nur im Glossar als anderes Wort für Isolator (Definition `Isolator`, im Text der Definition genannt).
- "Stromstärke" für die Größe $I$; "Strom" nur für das Phänomen ("der Strom fließt"). Nie "Strom" für die Größe, nie "Spannung fließt".
- Weitere feste Wörter: Stromkreis, Schaltplan, Schaltzeichen, Spannungsquelle, Verbraucher, Amperemeter, Voltmeter, Reihenschaltung, Parallelschaltung, Zweig, Messstelle.
- Größen und Einheiten: $I$ in A (Ampere) und mA; $U$ in V (Volt), mV und kV. Formelzeichen kursiv als `$I$`, `$U$`; Einheiten mit `\pu{…}` in Formeln. Zahlen mit Komma als Dezimalzeichen im Text.
- Stromrichtung: technische Stromrichtung (von Plus über den Verbraucher nach Minus) als Festlegung, so heißt sie im Text auch.
- Anrede der Lernenden: "du", kurze Sätze, keine Umgangssprache.
- Glossar (`definition`-Blöcke, jeweils einmal): Stromkreis, Leiter, Isolator, Stromstärke, Spannung, Amperemeter, Voltmeter, Reihenschaltung, Parallelschaltung, Spannungsquelle.

## Exercise patterns

Reihenfolge der Aufgaben: erkennen, zuordnen, anwenden. Jede falsche Option hat `info` mit dem Grund; Zahlen mit Einheit; erzeugte Aufgaben mit `mistakes` und `hint`.

- **Weg verfolgen / Unterbrechung finden** (einfacher-stromkreis, schalter, reihenschaltung, parallelschaltung): `figure` mit festem Schaltplan davor, danach `single-choice` "Wo ist der Kreis unterbrochen?" oder "Leuchtet die Lampe?". Beispiel: `src/stromkreis/einfacher-stromkreis.yaml`, `einfacher-stromkreis-2`.
- **Zuordnen** (leiter-nichtleiter, schaltzeichen, spannungsquellen): `table` mit den Fakten auf der Seite, danach `matching` (feste Paare, jeder rechte Eintrag nur einmal; sonst bricht der Build ab) und `true-false`. Beispiel: `src/spannung/spannungsquellen.yaml`, `spannungsquellen-1`. Datendateien (`src/data/`) gibt es in dieser Fassung nicht: Die Fakten stehen je einmal in der Tabelle der Seite, die sie erklärt.
- **Umrechnen mit Einheit** (stromstaerke: A/mA, spannung: V/mV/kV; reihenschaltung-messen und parallelschaltung-messen: Spannung ergänzen, Stromstärken addieren): `generated` mit `number`-Antwort und Einheit (`unit` im `compare`, nicht im Wert); `mistakes` "mal 100 statt mal 1000" und "falsche Richtung". Werte realistisch (Taschenlampe 0,3 A, Fahrradlicht 0,5 A, Steckdose 230 V).
- **Messgerät anschließen** (amperemeter, voltmeter): `figure` mit Bild der Messstellen A, B (und C) als `material`, danach `single-choice` "Wo schließt du das Messgerät an?". Info je falscher Option erklärt den Fehler (Amperemeter parallel, Voltmeter in Reihe).
- **Schaltzeichen zuordnen** (schaltplan): `matching` mit `pairsFrom: material` aus einer `labelled-figure` (`src/stromkreis/schaltplan.yaml`, `schaltplan-1`, Bild `schaltplan-2.svg`).
- **Skala ablesen** (amperemeter, voltmeter): festes Bild eines Zeigermessgeräts, `number` mit Einheit und Toleranz; der Messbereich steht im Bild.
- **Messwerte vergleichen** (reihenschaltung-messen, parallelschaltung-messen): `table` mit Messwerten an Stellen 1 bis 3, danach `single-choice` oder `true-false`. Entdecken statt Rechnen.
- **Situationen beurteilen** (gefahren, regeln): `true-false` mit Begründung in `explanation`, `multiple-choice` "Welche Regeln gelten?", `single-choice` mit Handlung ("Was machst du?"). Beispiel: `src/sicherheit/regeln.yaml`, `regeln-3`.
- **Erklärung wählen** (stromstaerke, spannung, parallelschaltung-messen): `single-choice` mit plausiblen falschen Erklärungen; jede falsche Option nennt in `info` die Fehlvorstellung und warum sie nicht stimmt.

Fehlvorstellungen, die die Rückmeldungen fangen: (1) "Strom wird in der Lampe verbraucht"; (2) "Das Amperemeter misst man parallel"; (3) "In der Parallelschaltung teilt sich die Spannung auf"; (4) "Strom fließt nur von Plus zu Minus und verbraucht sich auf dem Weg"; (5) "Eine Batterie liefert immer gleich viel Strom". Jede kommt auf mindestens einer Seite in einer Aufgabe als falsche Option mit `info` vor.

Komponenten: keine. Lernende bauen keine eigene Schaltung.

## Figures

- Eigene SVG-Zeichnungen in `src/images/`, `source: eigene Zeichnung`, `licence: CC-BY-4.0`. Die Bilder sind bisher nicht mit dem Auge geprüft, sondern nur über Text, Maße und Funktion im Browser.
- Eine Zeichensprache für die ganze App: Schaltzeichen nach DIN EN 60617 in einfacher Form; Leitungen schwarz, Linienstärke 3; Pfeil = technische Stromrichtung; Messgeräte als Kreis mit `A` oder `V`; Batterie mit langem Strich (Plus) und kurzem dicken Strich (Minus); Lampe als Kreis mit Kreuz; Beschriftungen auf Deutsch, Einheiten immer dabei; Information nie nur durch Farbe.
- Jedes Bild: `alt` beschreibt Zustand und Stromweg in Worten, `caption` sagt, worauf man achtet. Bilder zeigen das Gegebene, nie die Antwort. Lesbar bei 360 px: `viewBox`, Schrift nicht unter 12 px.
- Dateinamen: `<seiten-id>-<nr>.svg`, zum Beispiel `einfacher-stromkreis-1.svg`; die Schaltungen der Messseiten tragen den Namen ihrer Seite (`reihenschaltung-3.svg`), Skalen heißen `amperemeter-2.svg`, `amperemeter-3.svg`, `voltmeter-3.svg`. Alle SVGs sind von Hand schreibbar (Rechteck-Stromkreis, Batterie links, Verbraucher rechts oder oben, Linienstärke 3, Messstellen als weiße Kreise mit Ziffer oder Buchstabe, gestrichelte Kästen für mögliche Messgeräte). Neue Bilder von einem vorhandenen kopieren und ändern.
- Die Zeigerinstrumente haben einen Messbereich und beschriftete große Striche; kleine Striche liegen genau in der Mitte, damit sich der Wert ablesen lässt (Toleranz in der Aufgabe beachten).
- Lernhandlung: Schaltplan = Weg mit dem Pfeil verfolgen und Lücken finden; Messstellenbild = die Stelle wählen, an der das Gerät im Stromweg liegt (Amperemeter) oder daneben (Voltmeter); Skala = Zeigerstand mal Skalenteil mit Bereich; Schaltung mit Messstellen 1 bis 3 und Messwerttabelle = Werte den Stellen zuordnen und vergleichen.
- Skizzen der Planung: `.vibe/sketches/` (bleiben im Repo, gehören nicht zur App).

## Sources

- Lernlandkarte der Physik (Kompetenzen, Reihenfolge): https://lernapps.net/apps/map/physik.json, gelesen 2026-11-04.
- Zweite Quellen, geöffnet 2026-11-04 (Fakten, keine Sätze; CC BY-SA, nichts kopiert): Wikipedia "Stromkreis", "Leiter (Physik)", "Schaltzeichen", "Elektrische Stromstärke", "Elektrische Spannung", "Reihenschaltung", "Parallelschaltung" (die beiden letzten: Seite lädt, Inhalt noch nicht gegengelesen).
- Sicherheit (Kapitel 5): Wikipedia "Stromunfall" https://de.wikipedia.org/wiki/Stromunfall, geöffnet und gelesen 2026-11-04. Daraus (Fakten, eigene Worte): Gefahr hängt von Stromstärke und Einwirkdauer ab; Wahrnehmung bei wenigen mA, Loslassschwelle etwa 10 mA, Herzrhythmusstörungen ab etwa 25 mA, etwa 50 mA lebensgefährlich (Wechselstrom); häufige Ursachen: Wasser, fehlerhafte Verkabelung, Selbstreparatur, Kabel ohne Isolierung, beschädigte Stecker; Kinderfalle Steckdose; Sicherheitsabstand zu Freileitungen. Nicht aus der Quelle, sondern allgemeine Erste-Hilfe-Regel: der Hinweis zu Notruf 112 und Ausschalten des Stroms auf der Seite `regeln`; vom Ersteller bestätigt. Keine weiteren Zahlen zu Körperströmen ohne Quelle.
- Wikipedia "Reihenschaltung" und "Parallelschaltung": Seiten laden, der Inhalt der Artikel wurde nicht Satz für Satz gegen die Aussagen der App geprüft (die Aussagen sind Schulstoff: Reihe = ein Weg, parallel = mehrere Wege).
- Kernlehrplan NRW: nicht geprüft. Keine Videos.
- Die Aussagen einer Seite stehen im Text der Seite; Fakten, die auf einer Quelle beruhen, verlinkt die Aufgabe in `links:`.

## Adding a chapter or round

1. Kompetenz in der Karte `https://lernapps.net/apps/map/physik.json` suchen (Strang `elektrizitaetslehre`); fehlt sie, dem Katalog vorschlagen (`lernapps/apps`, `map/physik.yaml`), nicht erfinden. Voraussetzungen (`requires`) beachten.
2. Neuer Ordner `src/<kapitel>/` mit `chapter.yaml` (`title`, `summary`, `pages`), in `src/app.yaml` unter `chapters` an der richtigen Stelle eintragen.
3. Pro Kompetenz eine Seite `src/<kapitel>/<seiten-id>.yaml` mit `competencies: [<id>]` und den Abschnitten aus "Content structure"; in `pages` der `chapter.yaml` eintragen.
4. Bilder in `src/images/` in der Zeichensprache aus "Figures"; Fakten einmal in `src/data/<name>.yaml`.
5. Aufgaben nach den Mustern oben; jede falsche Option mit `info`; die fünf Fehlvorstellungen nicht verlieren.
6. Begriffe nach "Terminology", neue Fachwörter als `definition`.
7. 1 bis 3 ihrer Übungen in `selfAssessment` (`chapter.yaml`) aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt: nur Übungen, die ohne ihre Seite verständlich sind (Bild in `material`), bevorzugt `generated`, `number`, `ordering`, `matching`.
8. `npx --no -- lernapps check`, dann einen Commit pro Seite oder Kapitel.
9. Diese Datei in demselben Commit aktualisieren (Kompetenzen, Muster, Quellen).

## Rules learned from mistakes

None yet.
