---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

Die App "Brüche verstehen, kürzen und erweitern" ist eine Erklär-App (`explainer`, Format 2) für Klasse 6, Strang `mathematik/arithmetik`, nur Deutsch. Ersteller:in: Frau Keller.

## Curriculum

- Hessen, Gymnasium, Klasse 6 (Angabe der Ersteller:in). Das Kerncurriculum Mathematik des Hessischen Kultusministeriums wurde nicht gefunden und ist **nicht geprüft**; keine Lehrplan-Einheit wird zitiert.
- Orientierung geben die Bausteine der Lernlandkarte `https://lernapps.net/apps/map/mathematik.json` (Quelle der Karte: KMK-Bildungsstandards Mathematik ESA/MSA 2022).
- Kein eigenes Material der Ersteller:in; die Inhalte schreibt der Assistent.

## Competencies

Kapitel `brueche` (`src/brueche/`), Wortlaut der Karte:

- `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen. Seiten `anteile-erkennen` und `anteile-darstellen`.
- `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen. Seiten `erweitern`, `kuerzen`, `vergleichen`.
- Nicht geübt, nur wiederholt: `teilbarkeit` auf der Seite `teilbarkeit-wiederholt` (`recap: mathematik/teilbarkeit`, keine Übung). `natuerliche-zahlen` wird im Text von `anteile-erkennen` verlinkt (`https://lernapps.net/apps/map/mathematik/c/natuerliche-zahlen/`).

Reihenfolge im Kapitel: `anteile-erkennen`, `anteile-darstellen`, `teilbarkeit-wiederholt`, `erweitern`, `kuerzen`, `vergleichen`. Übungs-ids stehen in den Seitendateien; jede geübte Seite hat vier Übungen.

## Content structure

- Jede geübte Seite hat die Abschnitte in dieser Reihenfolge, mit festen ids: `einstieg` (Vorwissen, Alltagsbeispiel), `erklaerung` (Figur und Regel; Titel "Anschaulich erklärt", wo es nur eine Figur gibt), `beispiel` (ein `example`-Kasten, ein Beispiel), `uebung` (mindestens eine Aufgabe mit Rückmeldung). Ein Abschnitt, den eine Seite nicht braucht, entfällt. Titel passen zum Inhalt (`explainer-honest-headings`).
- Jede Seite führt genau einen neuen Schritt ein (`explainer-one-step`). Kurze Sätze, Anrede "du".
- Die Wiederholungsseite hat nur beschreibende Blöcke, keine Übung.
- Jede Seite hat `competencies` mit einer Id der Karte (oder `recap`). `src/app.yaml` hat keinen `scope` (kein `open-task`, kein eigenes Material); dann hat keine Seite einen.
- Länge: eine Seite etwa eine Doppelstunde Material, 3 bis 5 Übungen.

## Terminology

- Verwendet: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Anteil, gleich große Teile, erweitern (mit der Erweiterungszahl), kürzen (mit der Kürzungszahl), gleichnamig, vollständig gekürzt.
- Vermieden: "Stammbruch", "Kehrwert", "unechter Bruch" (kommen nicht vor), "Hauptnenner" (nur "gemeinsamer Nenner").
- Brüche im Fließtext als `$\frac{3}{8}$`, Dezimalkomma. Anrede "du".
- Glossar: `definition`-Blöcke für Bruch, Zähler, Nenner, Erweitern, Kürzen, gleichnamig; ein Satz mit Beispiel.

## Exercise patterns

Nenner höchstens 24, Brüche zwischen 0 und 1.

- *Anteil ablesen*: `single-choice` mit `material` (Figur eines Streifens oder Kreises). Optionen sind echte Fehler: Zähler und Nenner vertauscht, ungleiche Teile mitgezählt, weiße statt gefärbte Teile gezählt. Beispiel: `src/brueche/anteile-erkennen.yaml`, Übung `anteil-ablesen-streifen`.
- *Bruch einfärben*: Übungskomponente `Bruchfeld`: Streifen mit n Teilen, ein Klick färbt, die Antwort ist die Zahl gefärbter Teile. Seite `anteile-darstellen`.
- *Am Zahlenstrahl ablesen*: `single-choice` mit Zahlenstrahl-Bild (0 und 1 beschriftet).
- *Erweitern / Kürzen*: `generated`, ein Datensatz mit allen Zahlen der Schritte aus `src/data/bruchpaare.yaml` (`pick: 1`; Felder a/b gekürzt, k, c/d erweitert), Fehlermeldungen (addiert statt multipliziert, Zahl nicht verändert), Schritte mit Begründung. Beispiel: `src/brueche/erweitern.yaml`, Übung `erweitern-nenner`. Ein `where` schließt Datensätze aus, bei denen ein Fehlerwert die Antwort trifft.
- *Vergleichen*: `generated` aus `src/data/vergleiche.yaml` (Felder a/b, c/d, gemeinsamer Nenner n, erweiterte Zähler a2/c2, richtiges Zeichen rel, Fehlerzeichen relN und relZ); Antwort als `compare: { choice: ["<", ">", "="] }`. Beispiel: Übung `zeichen-waehlen` in `src/brueche/vergleichen.yaml`.
- *Wahr oder falsch mit Grund*: `true-false` mit `explanation`.
- Zum Ausprobieren (keine Aufgabe): Komponente `Faktorstreifen` auf `erweitern` (3/4, Erweiterungszahl 1 bis 6) und `kuerzen` (12/18, Kürzungszahlen 1, 2, 3, 6). Sie prüft nichts; die Übungen der Seite prüfen.

## Figures

- Streifen und Kreise sind eigene SVG-Zeichnungen in `src/images/`, `source: eigene Zeichnung`, `licence: CC0-1.0`, mit `alt` (was zu sehen ist) und `caption` (worauf man achten soll).
- Gefärbte Teile blau (`#2b6cb0`) mit dunklem Rand, nicht gefärbte weiß. Das Ganze ist ein Streifen gleicher Länge, damit Streifen vergleichbar sind. Der Bruch steht nicht in der Figur, wenn die Aufgabe ihn erfragt (`explainer-figure-hides-answer`).
- Zwei Figuren untereinander tragen sichtbare Beschriftungen ("vorher", "erweitert mit 2").
- Zahlenstrahl: von 0 bis 1 beschriftet, ein Pfeil über der gesuchten Marke (`zahlenstrahl-*.svg`). Vergleichsbilder (`vergleich-*.svg`): Streifen untereinander mit sichtbarer Beschriftung des Bruchs.
- Die Zeichnungen erzeugt ein kleines Skript; eine neue Figur wird nach dem Muster der vorhandenen gezeichnet (gleiche Farbe, gleiche Länge des Ganzen).
- Die Übungskomponente `Bruchfeld` und `Faktorstreifen` färben blau mit Streifenmuster als zweites Merkmal.
- `hundred-grid` wird nicht benutzt.

## Sources

- Keine zweite Quelle geöffnet; der Fachinhalt ist Schulstoff Klasse 6. Das KMK-PDF und das hessische Kerncurriculum wurden nicht gelesen (nicht geprüft). Nichts wird aus fremden Texten übernommen.
- Eigenes Material der Ersteller:in gibt es nicht.

## Adding a chapter or round

1. Einen Baustein der Lernlandkarte wählen, der im Strang `mathematik/arithmetik` liegt (Wortlaut und Id von der Karte).
2. Ordner `src/<kapitel>/` mit `chapter.yaml`, in `src/app.yaml` unter `chapters` eintragen; jede Seite in `pages` von `chapter.yaml`.
3. Seite mit den Abschnittsids `einstieg`, `erklaerung`, `beispiel`, `uebung` und `competencies: [<id>]`.
4. Übungen aus den Mustern oben; neue Datensätze in `src/data/`.
   1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt (`src/brueche/chapter.yaml`).
5. Diese Datei aktualisieren, `npx --no -- lernapps check`, Commit.

## Rules learned from mistakes

- Ein Text mit `: ` in YAML steht in Anführungszeichen (`kuerzen.yaml`, `teilbarkeit-wiederholt.yaml` brachen sonst die Formatierung).
- `nojs` einer Komponente enthält keine Markdown-Tabelle, sondern eine Liste.
- Prop-Typen einer Komponente stehen im `.vue` selbst, nicht als importierter Typ.
