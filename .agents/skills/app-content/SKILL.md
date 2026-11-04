---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

Erklär-App „Brüche verstehen, kürzen und erweitern“ für Klasse 6, Mathematik. Archetyp `explainer`, Format 2, Strang `mathematik/arithmetik`, nur Deutsch, Anrede „du“.

## Curriculum

- Hessen, Gymnasium, Jahrgang 6.
- Orientierung ist die Lernkarte `https://lernapps.net/apps/map/mathematik.json` (Quelle der Karte: KMK-Bildungsstandards Mathematik ESA/MSA 2022). Das Kerncurriculum Mathematik Hessen (Sekundarstufe I) ist **nicht geprüft**; keine Lehrplaneinheit wird zitiert.
- Die Lehrkraft hat kein eigenes Material gegeben; der Inhalt entsteht aus der Karte und Fachkenntnis. Folgt später Material, hat es Vorrang und bleibt lokal.

## Competencies

Ids und Wortlaut aus der Karte, nicht umformulieren.

Kapitel `bruch` – „Was ist ein Bruch?“
- `brueche-begriff` – Ich kann Brüche als Teil eines Ganzen deuten und darstellen.
  - Seite `ganzes-und-teile` (`src/bruch/ganzes-und-teile.yaml`): Übungen `drittel-oder-nicht`, `teile-aus-namen`, `kuchen-gerecht`.
  - Seite `zaehler-und-nenner` (`src/bruch/zaehler-und-nenner.yaml`): Übungen `nenner-ablesen`, `zaehler-ablesen`, `bruch-einstellen`, `bruch-urteilen`.

Kapitel `kuerzen-erweitern` – „Erweitern, kürzen, vergleichen“
- `brueche-kuerzen-erweitern` – Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen.
  - Seite `teilbarkeit-wiederholt` (`recap: mathematik/teilbarkeit`, keine Übung).
  - Seite `erweitern` (`src/kuerzen-erweitern/erweitern.yaml`): Übungen `gleicher-wert`, `erweitern-zaehler`, `erweitern-nenner`, `erweitern-ziel`.
  - Seite `kuerzen`: Übungen `weitester-teiler`, `kuerzen-zaehler`, `kuerzen-nenner`, `kuerzen-vollstaendig`.
  - Seite `vergleichen`: Übungen `groesser-stammbruch`, `gleichnamig-zaehler`, `welcher-ist-groesser`, `brueche-ordnen`.
  - Reihenfolge der Seiten: `erweitern`, `teilbarkeit-wiederholt`, `kuerzen`, `vergleichen`.

Voraussetzungen, die die App nicht übt: `teilbarkeit` (Wiederholungsseite), `natuerliche-zahlen` (Link `https://lernapps.net/apps/map/mathematik/c/natuerliche-zahlen/` im Text der ersten Seite).

Nicht Teil der App: Rechnen mit Brüchen, gemischte Zahlen, Dezimalbrüche, Prozent.

## Content structure

Jede Seite hat dieselben Abschnitte mit festen Ids; ein Abschnitt, den die Seite nicht braucht, entfällt.
1. `einstieg` – sagt in einem Satz, was man danach kann, und knüpft an Bekanntes an (Pizza, Schokolade, Kuchen; die Seite davor).
2. `erklaerung` – Bild oder Baustein mit Text. Der Text sagt vor dem Bild, was das Ganze ist, was die Teile und die Markierung bedeuten und worauf man achtet.
3. `beispiel` – ein durchgerechnetes `example`-Feld mit den Zahlen der Seite.
4. `uebung` – vom Erkennen über Anwenden mit anderen Zahlen zum neuen Fall (z. B. Umkehrfrage).

Titel passen zur Seite; „Ausprobieren“ heißt nur ein Abschnitt, in dem man einen Baustein bedient. Eine Seite bringt genau einen neuen Schritt und nimmt nichts Späteres vorweg. Kurze Sätze, wenig Fremdwörter.

## Terminology

- Verwendet: Bruch, Zähler, Nenner, Bruchstrich, Ganzes, Teil, erweitern, kürzen, gleichnamig, Anteil. Brüche im Text als `$\frac{3}{4}$` oder im Satz „drei Viertel“.
- Vermieden: „Bruchzahl“, „Zähler über Nenner“-Merkwörter ohne Erklärung, „Kehrwert“ und Fachwörter späterer Klassen.
- Anrede „du“; Alltag der 6. Klasse (Pizza, Schokolade, Kuchen), keine Kleinkind-Sprache.
- Glossar (`definition`-Blöcke): Bruch, Zähler, Nenner, erweitern, kürzen, gleichnamig. Jeder Begriff wird dort definiert, wo er zum ersten Mal gebraucht wird.

## Exercise patterns

- **Ablesen** (`brueche-begriff`): Bild gegeben, Zähler oder Nenner erfragen. `number` mit `material` (ein `figure` mit SVG aus `src/images/`; das Bild zeigt nur das Gegebene) und `mistakes` je Fehlzahl; eine erzeugte Aufgabe kann kein wechselndes Bild zeigen. Fehler: Zähler und Nenner vertauscht („Der Nenner sagt, in wie viele gleiche Teile das Ganze geteilt ist.“). Beispiel: `nenner-ablesen`.
- **Darstellen**: Bruch gegeben, mit der Übungskomponente `BruchEinstellen` einstellen (Antwort `{ nenner, zaehler }`; Fehler: Rest ausgemalt, Zähler als Nenner genommen; Zahlen aus `generate(seed)`). Beispiel: `bruch-einstellen`.
- **Urteilen**: `single-choice` oder `true-false`, bei ungleichen Teilen oder vertauschtem Bruch; jede falsche Option hat `info` mit Grund. Beispiel: `drittel-oder-nicht`, `bruch-urteilen`.
- **Erweitern**: `generated` „Erweitere a/b mit k“, Zähler und Nenner als zwei Aufgaben. Fehler: nur den Nenner mit k multipliziert (Zähler bleibt a), Zähler und Nenner addiert statt multipliziert. Zahlen: Zähler kleiner als Nenner, Nenner höchstens 9, k 2 bis 6; `where` schließt Werte aus, bei denen eine Fehlerantwort der richtigen gleicht (z. B. `z * k != z + k`). Dazu `erweitern-ziel` („Der Nenner soll N werden“, Fehler: Unterschied der Nenner addiert) und `single-choice` `gleicher-wert`. Beispiel: `erweitern-zaehler`.
- **Kürzen**: `generated` „Kürze a/b so weit wie möglich“, Zähler und Nenner als zwei Aufgaben; die Aufgaben ziehen je einen Datensatz aus `src/data/brueche.yaml` (Felder `z`, `n` ungekürzt, `zk`, `nk` fertig gekürzt, `d` größter gemeinsamer Teiler, `zh`, `nh` halb gekürzt durch 2). `kuerzen-vollstaendig` zieht nur Datensätze mit zusammengesetztem `d` (`where`), damit „noch nicht fertig gekürzt“ (`nh`) eine echte Fehlerantwort ist. Fehler: nur Zähler oder nur Nenner geteilt, Zähler und Nenner verwechselt. Dazu `single-choice` `weitester-teiler`. Neue Brüche: neuer Datensatz mit geprüften `zk`/`nk`/`d`.
- **Vergleichen**: `single-choice` „Welcher Bruch ist größer?“ mit Vergleichsbild (`image`); Fehler „1/8 ist größer als 1/4, weil 8 größer ist als 4“ mit Rückmeldung am Bild („Je mehr Teile, desto kleiner ist jedes Teil.“). `generated` `gleichnamig-zaehler` aus `src/data/vergleiche.yaml` (Felder `a`, `b`, `c`, `d`, `h` = kleinstes gemeinsames Vielfaches von `b` und `d`, `ah`, `ch`; immer `h` ungleich `b`); `single-choice` `welcher-ist-groesser`; `ordering` `brueche-ordnen`.
- Jede falsche Antwort bekommt die konkreteste Rückmeldung (Option-`info`, `mistakes`-Eintrag, `hint`). Zwei bis drei `mistakes` je erzeugter Aufgabe. Alle Zahlen so, dass Fehlerwerte nie der richtigen Antwort gleichen.

## Figures

- Gezeichnete Bilder als `image` (SVG) in `src/images/` (flach); Rechteckstreifen und Kreise (Pizza), erzeugt mit `sectorPath` und `stripPart` aus `src/components/BruchBild.ts`, blaue Streifenfüllung `#2f5fb3`, weißer Hintergrund, schwarzer Rand.
- Konventionen: das Ganze ist immer gleich groß; ausgemalter Anteil in einer Farbe, nicht ausgemalt hell; gleich große Teile; Nenner = Anzahl aller Teile, Zähler = ausgemalte Teile. `alt` nennt, was gegeben ist, nie die gesuchte Zahl; die Bildunterschrift sagt, worauf man schaut.
- Bausteine (Vue, in `src/components/`, je mit Logikmodul, Test und Text ohne JavaScript):
  - `BruchBild`: nur Anzeige (Rechteck oder Kreis, Nenner Teile, Zähler ausgemalt, Streifenmuster als zweites Merkmal); die beiden anderen benutzen es.
  - `BruchBaustein` (Seite `zaehler-und-nenner`, Abschnitt `ausprobieren`): Nenner 2 bis 12 und Zähler 0 bis Nenner verstellen, Wechsel Rechteck/Kreis; zeigt Teile und ausgemalte Fläche; prüft nichts; Start 1/4.
  - `BruchEinstellen`: Übungskomponente mit denselben Tasten ohne Formtaste, Start Nenner 2 und Zähler 0; Aufgabe im Abschnitt `uebung`.
  - `ErweiternKuerzen` (Seiten `erweitern` und `kuerzen`, Abschnitt `ausprobieren`, Prop `modus`): zwei gleich lange Streifen untereinander; Faktor mit „−“/„+“, beim Erweitern 1 bis 6, beim Kürzen nur die gemeinsamen Teiler von Zähler und Nenner (Hinweis im Text). Start Faktor 1, die ausgemalte Fläche bleibt gleich. Prüft nichts.
- Skizzen der Bausteine: `.vibe/sketches/`. Ein Baustein zeigt vor „Prüfen“ nie die Lösung der Aufgabe.
- Bilder sind selbst gezeichnet; Lizenz des Codes MIT, des Inhalts CC BY 4.0.

## Sources

- Lernkarte `mathematik` (geöffnet): Kompetenz-Ids, Wortlaut, `requires`.
- Kerncurriculum Hessen: nicht geprüft (Seite des Ministeriums war nicht abrufbar). Kein Lehrplan-Zitat im Inhalt.
- Zweite Quellen (serlo.org o. ä.) sind noch nicht geöffnet und geprüft; Seiten verlinken keine, bis sie geprüft sind. Es werden keine Sätze aus fremden Texten übernommen.

## Adding a chapter or round

1. Kompetenz in der Karte `mathematik/arithmetik` wählen (Id, `requires` prüfen); fehlt sie, im Katalog `lernapps/apps` vorschlagen, nicht erfinden.
2. Ordner `src/<kapitel>/` mit `chapter.yaml` (`title`, `summary`, `pages`), in `src/app.yaml` unter `chapters` eintragen.
3. Je Kompetenz eine Seite `src/<kapitel>/<seite>.yaml` mit `competencies: [<id>]` und den Abschnitten `einstieg`, `erklaerung`, `beispiel`, `uebung` (siehe Content structure). Eine Voraussetzung, die die App nicht übt, bekommt eine `recap`-Seite oder einen Link auf die Karte.
4. Übungen nach den Mustern oben; Brüche für erzeugte Aufgaben als neue Datensätze in `src/data/bruchbilder.yaml`.
5. Neue Begriffe als `definition` ins Glossar. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt (je Seite ein Schritt in `chapter.yaml`, nur Übungen, die ohne die Seite verständlich sind).
6. Diese Datei und den Plan anpassen, `npx --no -- lernapps check`, Commit (die Hooks prüfen).

## Rules learned from mistakes

None yet.
