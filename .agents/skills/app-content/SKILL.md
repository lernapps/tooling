---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium (G9), Klasse 6. Strang `mathematik/arithmetik` der Lernlandkarte.
- Orientierung: Hessisches Kultusministerium, Kerncurriculum Mathematik Gymnasium Sekundarstufe I, https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf, Einheit 6.1 (Lehrplan G9, 2016). Nicht geprüft: das PDF ließ sich nicht lesen; Einheit und Jahrgang stammen aus der Lernlandkarte.
- Kein eigenes Material der Lehrkraft; die App folgt der Lernlandkarte.

## Competencies

- Kapitel `brueche-verstehen`
  - Seite `anteile` (`brueche-begriff`): "Ich kann Brüche als Teil eines Ganzen deuten und darstellen."
- Kapitel `gleichwertige-brueche` (`brueche-kuerzen-erweitern`): "Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen."
  - Seiten `erweitern`, `kuerzen`, `vergleichen`; davor als Wiederholung `teilbarkeit-wiederholen` (`recap: mathematik/teilbarkeit`, ohne Übung), vor `kuerzen`.
- Ids der Übungen: siehe die Seiten; Übungen heißen `<thema>-<art>`, z. B. `anteile-faerben`.
- Nicht in dieser Version: Rechnen mit Brüchen, gemischte Zahlen, Dezimalbrüche, Prozent.

## Content structure

- Jede Seite hat die Abschnitte `einstieg` (Alltag, was die Kinder schon wissen), `erklaerung` (Figur, Begriffe), `beispiel` (`example`-Box mit durchgerechnetem Fall) und `uebung`. Ein nicht nötiger Abschnitt entfällt; die Titel sagen, was der Abschnitt auf dieser Seite tut.
- Eine neue Idee je Seite. Kinder werden mit "du" angesprochen, kurze Sätze.
- Jede Seite hat mindestens eine Frage oder erzeugte Aufgabe in `uebung`; eine Komponente zählt nicht dazu. Die Wiederholungsseite hat keine Übung.

## Terminology

- Gebraucht: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Teil, gleich große Teile, gleichwertig, erweitern, kürzen, Faktor, gemeinsamer Teiler, gleichnamig, ungleichnamig.
- Vermieden: "Bruchteil" im Fließtext für den Bruch selbst, "Rechnen mit Brüchen" als Versprechen der App.
- Schreibweise: Brüche als `$\frac{3}{8}$`, Zähler zuerst genannt ("3 von 8 Teilen"). Das Ganze ist immer ein Rechteck oder Streifen aus gleich großen Teilen.
- Glossar: `definition` für Bruch, Zähler, Nenner, gleichwertig, erweitern, kürzen, gleichnamig (je eine, an der Stelle, wo der Begriff zuerst gebraucht wird).

## Exercise patterns

- Teile färben (Komponente `BruchFeld`, Seite `anteile`, Übung `anteile-faerben`): Ganzes aus N gleich großen Feldern (N aus 4, 5, 6, 8, 10, 12), Aufgabe "Färbe den Bruch Z/N"; die Antwort ist die Zahl gefärbter Felder, welche es sind, ist egal; kein Zählerstand vor "Prüfen". Typische Fehler: den Rest gefärbt (N − Z), das ganze Feld gefärbt (Zähler und Nenner vertauscht).
- Verfeinern und Zusammenfassen (Komponente `BruchVerfeinern`, Seiten `erweitern` und `kuerzen`, keine Übung): links das Ausgangsbild "vorher", rechts dasselbe Rechteck feiner geteilt (`erweitern`, Faktor 1 bis 6) oder zusammengefasst (`kuerzen`, gemeinsame Teiler); die gefärbte Fläche bleibt gleich. Beispiele: `erweitern-bild` (2/3), `kuerzen-bild` (12/18). Neue Seite mit dem Baustein: `modus`, `z`, `n` und die Texte als Props setzen, `nojs` schreiben.
- Umwandeln, typische Fehler diagnostiziert (`generated`): Erweitern (`erweitern-zaehler`, `erweitern-nenner`, Datei `src/data/bruchpaare.yaml`: teilerfremde Brüche z/n), Kürzen (`kuerzen-nenner`, `kuerzen-vollstaendig`, Datei `src/data/kuerzbeispiele.yaml`: z, n, Faktor f und die fertigen Produkte gz = z·f, gn = n·f, weil Platzhalter keine Ausdrücke können), Gemeinsamer Nenner (`vergleichen-gemeinsamer-nenner`, Datei `src/data/vergleichspaare.yaml`: zwei Brüche, gemeinsamer Nenner nn, Zähler a und b nach dem Erweitern). Jede Fehlermeldung nennt den Fehler und den Weg, nicht die Lösung. Fehlerwerte dürfen nie der richtigen Antwort gleichen (`where`).
- Auswahl (`single-choice`), Wahr oder falsch mit Begründung (`true-false`), Ordnen nach Größe (`ordering`, Einträge als Klartext wie "1/4", weil `ordering` keine Formeln zeigt).
- Beispiel: `src/brueche-verstehen/anteile.yaml`, Übung `anteile-faerben`.
- Wiederholungsseite: `teilbarkeit-wiederholen` (`recap: mathematik/teilbarkeit`), nur beschreibende Blöcke, keine Übung, vor `kuerzen`.

## Figures

- Bilder in `src/images/`: `schokolade-drei-von-acht.svg`, `ungleiche-teile.svg`, `streifen-drei-von-fuenf.svg` (Seite `anteile`), `streifen-gleichnamig.svg` (3/8 und 5/8), `streifen-zwoelftel.svg` (3/4 = 9/12 und 2/3 = 8/12) (Seite `vergleichen`); weiß hinterlegt, gestreift = gefärbt.
- Ganzes: Rechteck oder Streifen aus gleich großen Teilen; gefärbt = Farbe und Schraffur, ungefärbt = weiß. Zwei Bilder nebeneinander tragen sichtbare Beschriftungen ("vorher", "erweitert mit 3").
- Jedes Bild hat einen Alt-Text, der sagt, was es zeigt (Zahl der Teile, Zahl der gefärbten), und eine Bildunterschrift, die sagt, wohin man schaut. Eigene Zeichnungen: `source: eigene Zeichnung`, `licence: CC-BY-4.0`. Funktioniert bei 360 px Breite.
- Aufgabenbilder zeigen nur das Gegebene, nie die Lösung.

## Sources

- Lernlandkarte `https://lernapps.net/apps/map/mathematik.json` (geöffnet und gelesen).
- Bruchrechnung (Wikipedia), https://de.wikipedia.org/wiki/Bruchrechnung: geöffnet, enthält die Abschnitte zu Erweitern und Kürzen und zum Gleichnamigmachen; als Weiterlesen verlinkt, Fakten in eigenen Worten.
- Hessisches Kerncurriculum: nicht geprüft (siehe Curriculum).
- Weitere zweite Erklärung (serlo.org) noch nicht gefunden; Adresse nicht geraten, bis geöffnet.

## Adding a chapter or round

1. Kompetenz in der Lernlandkarte wählen und in diesem Guide unter Competencies eintragen.
2. Ordner `src/<kapitel>/` mit `chapter.yaml`; Kapitel in `src/app.yaml` und Seiten in `chapter.yaml` jeweils einmal in Lesereihenfolge listen.
3. Seite nach der Musterseite `src/brueche-verstehen/anteile.yaml` bauen (Abschnitte wie oben), `competencies` mit der Karten-Id.
4. Übungen aus den Mustern oben; Fehlermeldungen aus der Fehlerliste des Plans.
5. Voraussetzungen, die die App nicht übt: Wiederholungsseite (`recap`) oder Link zur Karte.
6. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt.
7. `npx --no -- lernapps check`, dann committen.

## Rules learned from mistakes

None yet.
