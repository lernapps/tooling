---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

"Strom im Kreis": Lesebuch mit Übungen zu Stromkreis, Stromstärke und Spannung, Physik Klasse 8. Archetype `explainer`, German only, strand `physik/elektrizitaetslehre`.

## Curriculum

- Land und Schulform: Nordrhein-Westfalen, Gymnasium (G9), Klasse 8. Orientierung, nicht Bedingung.
- Kernlehrplan für die Sekundarstufe I Gymnasium NRW, Physik, Ministerium für Schule und Bildung NRW, 2019,
  https://lehrplannavigator.nrw.de/system/files/media/document/file/g9_ph_klp_3411_2019_06_23.pdf
  - Inhaltsfeld 2 „Elektrischer Strom und Magnetismus“ (bis Ende Erprobungsstufe, S. 24–26): Stromkreise,
    Spannungsquellen, Leiter und Nichtleiter, Reihen- und Parallelschaltung, Schaltsymbole, Gefahren.
  - Inhaltsfeld 9 „Elektrizität“ (bis Ende Sekundarstufe I, S. 39–40): Spannung, Stromstärke, Messen von
    Spannungen und Stromstärken, Reihen- und Parallelschaltung, Wirkung auf den Körper.
- Der Kernlehrplan ordnet Stromstärke und Spannung keiner einzelnen Klasse zu; Klasse 8 ist die Annahme des Erstellers
  (schulinterner Lehrplan). Kein eigenes Material des Erstellers.

## Competencies

Ids und Wortlaut der Lernlandkarte (https://lernapps.net/apps/map/physik.json). Eine Seite je Kompetenz,
Datei `src/<kapitel>/<seite>.yaml`.

1. Kapitel `stromkreis` „Der Stromkreis“
   - `einfacher-stromkreis`: Ich kann einen einfachen Stromkreis aus Batterie, Lampe und Kabeln aufbauen und
     erklären, warum er geschlossen sein muss. Seite `einfacher-stromkreis`.
   - `leiter-nichtleiter`: Ich kann Leiter und Nichtleiter unterscheiden und Beispiele nennen. Seite `leiter-nichtleiter`.
   - `schalter`: Ich kann erklären, wie ein Schalter einen Stromkreis öffnet und schließt. Seite `schalter`.
   - `schaltzeichen`: Ich kann einen Stromkreis als Schaltplan mit Schaltzeichen zeichnen und einen Schaltplan
     lesen. Seite `schaltplan`.
   - `spannungsquellen`: Ich kann Spannungsquellen wie Batterie, Netzgerät und Steckdose nennen und sagen, wofür
     sie sich eignen. Seite `spannungsquellen`.
2. Kapitel `stromstaerke` „Stromstärke“: `stromstaerke` (Seite `stromstaerke`), `stromstaerke-messen` (Seite `messen`).
3. Kapitel `spannung` „Spannung“: `spannung` (Seite `spannung`), `spannung-messen` (Seite `messen`).
4. Kapitel `schaltungen` „Reihen- und Parallelschaltung“: `reihenschaltung`, `parallelschaltung`
   (Seiten `reihenschaltung`, `parallelschaltung`). Nur qualitativ.
5. Kapitel `sicherheit` „Sicher mit Strom“: `gefahren-des-stroms`, `sicher-mit-strom-umgehen`
   (Seiten `gefahren`, `regeln`).

Nicht im Umfang: Widerstand, ohmsches Gesetz, Größen in Reihen- und Parallelschaltung (Karte: Klasse 9–10), Stromwirkungen, Magnetismus.

## Content structure

Jede Seite hat dieselben Sektionen in dieser Reihenfolge, mit festen Ids:

1. `warum` „Warum?“: eine Frage oder Anknüpfung an die vorige Seite, 2–3 Sätze.
2. `erklaerung` „Erklärung“: Text, Figur, `definition` der Fachbegriffe.
3. `beispiel` „Beispiel“: Kasten `example`, Schritt für Schritt hergeleitet.
4. `uebung` „Übung“: 2–3 Übungen mit Rückmeldung.

Länge: eine Seite lässt sich in etwa fünf Minuten lesen. Kein Fließtext über 6 Zeilen am Stück.

## Terminology

- Verwendet: Stromkreis, Stromstärke, Spannung, Schaltplan, Schaltzeichen, Reihenschaltung, Parallelschaltung,
  Amperemeter, Voltmeter, Spannungsquelle, Verbraucher, Leiter, Nichtleiter.
- Vermieden: „Strom verbrauchen“ (nur Energie wird umgewandelt), „Stromverbrauch“ ohne Erklärung, „Widerstand“ (außerhalb des Umfangs).
- Einheiten: Ampere (A), Milliampere (mA), Volt (V), Millivolt (mV). Dezimalkomma.
- Stromrichtung: technische Stromrichtung (von Plus nach Minus), einmal erwähnt, nicht vertieft.
- Anrede: „du“, ruhig, sachlich, kurze Sätze.
- Glossar: jede neue Fachwort-Definition als `definition`-Block (Stromkreis, Leiter, Nichtleiter, Stromstärke,
  Spannung, Reihenschaltung, Parallelschaltung).

## Exercise patterns

- Entscheiden/Begründen: `single-choice` oder `true-false`; jede falsche Option hat ein `info` mit dem Grund. Beispiel:
  `src/stromkreis/einfacher-stromkreis.yaml`, Übung `stromkreis-geschlossen`.
- Zuordnen: `matching` (Schaltzeichen ↔ Bauteil, Quelle ↔ Einsatz, Eigenschaft ↔ Schaltung); Leiter/Nichtleiter als `multiple-choice`, weil jede rechte Seite eines `matching` nur einmal vorkommen darf.
- Rechnen: `generated` Umrechnung mA ↔ A und mV ↔ V mit Einheit, 2–3 typische Fehler mit Meldung.
  Beispiel: `src/stromstaerke/stromstaerke.yaml`, Übung `ma-in-a`.
- Messgerät anschließen: `single-choice` mit Schaltplan als `material`.
- Fehlvorstellungen als Antwortoption mit begründendem `info`:
  - „Strom wird in der Lampe verbraucht“: Der Strom fließt im Kreis; nach der Lampe ist die Stromstärke gleich.
    Umgewandelt wird Energie.
  - „Strom fließt von beiden Seiten in die Lampe“: Es gibt einen Umlauf in eine Richtung.
- Jede Übung nennt `examples` mit weiteren richtigen und typischen falschen Antworten, wenn das sinnvoll ist.
- Keine Daten-Dateien und keine Vue-Komponenten (`prefer-built-in-block`). Schaltungen selbst bauen: Verweis
  auf die App „Elektrizität“ (https://lernapps.net/apps/elektrizitaet/).

## Figures

- Eigene SVG-Zeichnungen in `src/images/`, Quelle „eigene Zeichnung“, Lizenz `CC-BY-4.0`.
- Konventionen: Leitungen dunkel (#222), Strichstärke 2, Messgeräte A und V in einem Kreis, Voltmeter blau (#06c) und gestrichelte Zuleitung,
  Stromrichtung technisch (Plus nach Minus), ohne Zahlenwerte, die die Antwort verraten.
- Jede Figur hat `alt` (was sie zeigt) und `caption` (worauf man achten soll), funktioniert bei 360 px (viewBox
  höchstens 360 breit).
- Das Wassermodell ist ausdrücklich als Modell bezeichnet.

## Sources

- Kernlehrplan NRW 2019 (siehe oben), Lernlandkarte Physik (lernapps.net).
- Fakten stehen in den Übungen mit Links auf die deutsche Wikipedia (Fakten, keine Sätze übernommen).
  Jeder Link wird von `lernapps check` geprüft. HTTP 429 gilt als nicht geprüft.
- Zweitquellen (z. B. serlo.org) nicht gesichtet.

## Adding a chapter or round

1. Kompetenz-Id aus der Karte wählen, die nicht im Umfang steht; Plan-Inkrement aus der Vorlage anlegen.
2. Ordner `src/<kapitel>/` mit `chapter.yaml` (Titel, `summary`, `pages`), in `src/app.yaml` unter `chapters` eintragen.
3. Seite nach „Content structure“ schreiben, `competencies: [<id>]`, Übungen nach „Exercise patterns“.
4. Figuren nach „Figures“; `selfAssessment` im `chapter.yaml` ergänzen.
5. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt.
6. `npx --no -- lernapps check`, dann ein Commit je Aufgabe.

## Rules learned from mistakes

- `matching`: jede rechte Seite nur einmal (Leiter/Nichtleiter als `multiple-choice` gelöst).
- Tabellenzellen und Flow-Listen in YAML mit Dezimalkomma immer in Anführungszeichen setzen.
