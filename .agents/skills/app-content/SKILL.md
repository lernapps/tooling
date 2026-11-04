---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

Physik Klasse 9: beschleunigte Bewegung beschreiben und in Weg-Zeit- und Geschwindigkeit-Zeit-Diagrammen darstellen. Ein Kapitel, sechs Seiten, nur Deutsch.

## Curriculum

- Gesamtschule, Nordrhein-Westfalen, Klasse 9. Der Kernlehrplan Naturwissenschaften NRW (QUA-LiS) wurde nicht gelesen: nicht geprüft, keine Einheit zitiert.
- Orientierung: Lernlandkarte `https://lernapps.net/apps/map/physik.json`, Strang `physik/mechanik`; die Karte nennt als Quelle die KMK-Bildungsstandards Physik (MSA), Beschluss 16.12.2004 i.d.F. 13.06.2024 (nicht selbst gelesen).
- Nicht Teil der App (Wunsch der Lehrkraft): Kräfte, a = Δv/Δt, s = ½·a·t², Fläche unter dem v-t-Graphen als Weg.

## Competencies

Wortlaut der Karte, Kapitel `beschleunigte-bewegung` (Ordner `src/beschleunigte-bewegung/`):

- `geschwindigkeit-berechnen` (nicht geübt): Seite `geschwindigkeit-wiederholen`, `recap: physik/geschwindigkeit-berechnen`, ohne Aufgaben.
- `geschwindigkeitsaenderung`: "Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert." Seiten `beschleunigen-abbremsen` und `richtung-aendern`.
- `bewegungsdiagramme`: "Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen." Seiten `weg-zeit-diagramm`, `geschwindigkeit-zeit-diagramm`, `diagramme-zusammen`.

Aufgaben-Ids stehen auf den Seiten; sie beginnen mit dem Seitenkürzel (`wz-…`, `vz-…`, `dz-…`, `ba-…`, `ra-…`) und bleiben stabil.

## Content structure

- Jede Seite hat Abschnitte mit festen Ids in dieser Reihenfolge, nicht benötigte entfallen: `einstieg` (was die Schüler schon wissen, Alltagssituation), `erklaerung` (der eine neue Schritt), `ausprobieren` (nur wo etwas bedient wird, sonst "Anschaulich erklärt"), `uebung`.
- Eine neue Idee pro Seite (`explainer-one-step`): Seite 4 nur Weg-Zeit-Diagramm, Seite 5 nur Geschwindigkeit-Zeit-Diagramm, Seite 6 beide zusammen.
- Länge: eine Bildschirmseite Text, dann Aufgaben. Kurze Sätze, gemischte Leistung: Hilfen (`hint`) bei jeder Rechenaufgabe.
- Das Kapitel ist das einzige, die Navigation blendet es aus; die Adressen bleiben `/beschleunigte-bewegung/<seite>/`.
- Der Start- und Kapiteltext in `src/app.yaml` und `chapter.yaml` sagt, was gelernt wird, und nennt die Quellen.
- Kein `scope` (kein `open-task`, kein eigenes Material des Erstellers).

## Terminology

- Verwendet: Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, beschleunigen, abbremsen, Geschwindigkeit, Richtung, Abschnitt, Zeitpunkt.
- Vermieden: "Beschleunigung" als Größe mit Formel (kommt in der Oberstufe), "negative Beschleunigung", "Verzögerung". "Abbremsen" meint: die Geschwindigkeit wird kleiner. Das Wort Beschleunigung steht nur als Suchwort im Katalogeintrag.
- Anrede "du". Zeichen: s für Weg in m, t für Zeit in s, v für Geschwindigkeit in m/s (und km/h im Alltag). Dezimalkomma im Text, Einheiten mit `\pu{…}` in Formeln.
- Glossar (Block `definition`, einmal an der Stelle, wo der Begriff gebraucht wird): Geschwindigkeit (Seite 1), Weg-Zeit-Diagramm (Seite 4), Geschwindigkeit-Zeit-Diagramm (Seite 5).

## Exercise patterns

- *Ablesen*: Diagramm (Bild oder Tabelle) gegeben, Wert oder Aussage gefragt; `number` und `single-choice`, jede falsche Option mit `info`. Seiten 4 bis 6.
- *Beschreiben*: Tacho-Werte zu Zeitpunkten in einer `table` (Zeilen stehen auf der Seite; sie steht als `material` auch in der Frage); `single-choice` beschleunigt, bremst, gleich; `true-false` mit Begründung zu Fehlvorstellungen. Seiten 2 und 3.
- *Zuordnen*: `matching` Geschichte ↔ Diagramm, s-t ↔ v-t. Seite 6.
- *Berechnen*: `generated`, v = s/t aus Weg und Zeit eines Abschnitts (`m/s`), Fehler "Weg und Zeit vertauscht", "Einheit nicht umgerechnet", Hinweis und Schritte mit den gezogenen Zahlen. Seite 4.
- *Einstellen*: Übungskomponente `GeschichteEinstellen` (Seite 6, Block `geschichte-einstellen`). Die Geschichten stehen in `src/data/geschichten.yaml` (Felder `text`, `v0`, `c1` bis `c3` mit `mehr`, `gleich`, `weniger`); die Aufgabe Nr. n nimmt die Geschichte n (reihum). Eine neue Geschichte: einen Eintrag anhängen, dessen Geschwindigkeiten bei Schritten von 3 m/s im Bereich 0 bis 10 m/s bleiben, und in `examples` ein `accepted` und ein `rejected` für den neuen Seed ergänzen.
- *Zuordnen und Übersetzen* (Seite 6): `single-choice` mit dem Weg-Zeit-Bild (`images/wz-fahrrad.svg`) und vier Geschwindigkeitsreihen, jede falsche mit Grund; `matching` Merkmal im Geschwindigkeit-Zeit-Diagramm ↔ Merkmal im Weg-Zeit-Diagramm.
- *Ordnen* (Seite 5): `ordering` der Abschnitte nach der Geschwindigkeit, mit Bild `images/vz-fahrrad.svg`.
- Typische Fehlvorstellungen, die das Feedback nennt: "Abbremsen heißt negative Geschwindigkeit"; Diagramm als Bild der Strecke gelesen; waagerechte Linie im Weg-Zeit-Diagramm heißt "fährt gleichmäßig" statt "steht"; Steigung und Höhe verwechselt.

## Figures

- Komponente `Bewegungslabor` (`src/components/Bewegungslabor.vue`, `.ts`, `.test.ts`), Prop `view`: `st`, `vt`, `both`. Eine Fahrt von 30 s in drei Abschnitten zu je 10 s; pro Abschnitt ein Regler 0 bis 10 m/s (ganze Zahlen); Zeitachse und Skalen fest. Weg als Summe der Abschnitte (stückweise gerade), Geschwindigkeit als Stufen. Farben: Weg blau, Geschwindigkeit orange, beide mit zweiter Markierung (Punkte an den Abschnittsgrenzen, Beschriftung), Farben nur wo sie Fachbedeutung haben. Achsen mit Zahlen und Einheit. Immer mit `nojs`-Text.
- Komponente `GeschichteEinstellen` (`src/components/GeschichteEinstellen.vue`, `.ts`, `.test.ts`): Auswahl je Abschnitt (wird größer / bleibt gleich / wird kleiner, im Vergleich zum Abschnitt davor; Schritt 3 m/s), das Geschwindigkeit-Zeit-Diagramm zeichnet sich nach der Wahl (Achsen fest, Start bei der Geschwindigkeit `v0` der Geschichte). Nach "Prüfen" eine Rückmeldung zum ersten falschen Abschnitt, je nach Art des Fehlers: "gleich" gewählt, Änderung gewählt, Richtung vertauscht. Sie verrät die Lösung nicht.
- Bilder (`src/images/`, SVG, eigene Zeichnung, Lizenz CC-BY-4.0, weißer Hintergrund, damit sie auch im dunklen Modus lesbar sind): `wz-fahrrad.svg` (Weg-Zeit-Diagramm: 3 m/s, Stillstand, 6 m/s), `vz-fahrrad.svg` (Geschwindigkeit-Zeit-Diagramm: 2, 6, 4 m/s), `kurve.svg` (runder Radweg von oben, vier Fahrräder mit 15 km/h). Diagramme: Zeitachse 0 bis 30 s, Weg 0 bis 100 m (Bild) und 0 bis 300 m (Labor), Geschwindigkeit in m/s. Jedes Bild mit `alt` (was es zeigt) und `caption` (worauf achten).
- Maßstab: Zeit in s, Weg in m, v in m/s; Zahlen passen zur Geschichte (Fahrrad 0 bis 8 m/s, Auto im Alltagsbeispiel km/h).

## Sources

- Lernlandkarte `physik.json` (geöffnet), Quelle dort: KMK-Bildungsstandards Physik (MSA) 2004 i.d.F. 2024.
- Inhalte stammen aus eigener Sachkenntnis; keine Sätze aus Dritttexten. Zweitquellen je Kompetenz sind noch nicht gesucht: nicht geprüft.
- Das Material der Lehrkraft (falls später geliefert) bleibt lokal, nie im Repo.

## Adding a chapter or round

1. Kompetenz-Ids der Karte `https://lernapps.net/apps/map/physik.json` lesen; fehlende nicht erfinden, im Katalog vorschlagen.
2. Ordner `src/<kapitel>/` mit `chapter.yaml`, in `src/app.yaml` unter `chapters` eintragen, Seiten in `chapter.yaml` auflisten.
3. Seiten wie die bestehenden: feste Abschnitt-Ids, eine neue Idee je Seite, `competencies` mit einer Id.
4. Messreihen in `src/data/`, Komponenten in `src/components/` mit Test und `nojs`.
5. Aufgaben nach den Mustern oben, Glossarbegriffe einmal.
6. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt.
7. Diesen Leitfaden anpassen, `npx --no -- lernapps check`, ein Commit je Aufgabe.

## Rules learned from mistakes

- Tabellen haben höchstens zwei Spalten mit kurzen Zellen: eine Tabelle mit vier Spalten wurde bei 360 px rechts abgeschnitten (Seiten `diagramme-zusammen` und `richtung-aendern`).
