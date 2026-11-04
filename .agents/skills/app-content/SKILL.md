---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Physik, Klasse 9, Gesamtschule in NRW, gemischte Leistung. Vorwissen: v = s/t aus Klasse 7; Diagramme sind neu.
- Orientierung: Lernlandkarte `physik/mechanik` (https://lernapps.net/apps/map/physik.json), die auf den KMK-Bildungsstandards Physik (MSA, Beschluss 16.12.2004 i.d.F. vom 13.06.2024) beruht. Der NRW-Kernlehrplan der Gesamtschule wurde nicht gelesen ("nicht geprüft"); keine Einheit wird zitiert.
- Kein eigenes Material der Lehrkraft. Ausgeschlossen: Rechnen mit der Beschleunigung (a = Δv/Δt), Kräfte, Trägheit, Reibung, freier Fall, Fläche unter dem v-t-Graphen.

## Competencies

Strang `physik/mechanik`. Ids sind die der Karte.

- Kapitel `bewegung-beschreiben` (Bewegung beschreiben)
  - Seite `wiederholung`: `recap: physik/geschwindigkeit-berechnen`, keine Übung.
  - Seite `aenderung`: `geschwindigkeitsaenderung` – Ich kann beschreiben, wann sich eine Bewegung beschleunigt, verlangsamt oder die Richtung ändert.
- Kapitel `bewegungsdiagramme` (Bewegungsdiagramme), alle `bewegungsdiagramme` – Ich kann eine Bewegung in einem Weg-Zeit-Diagramm und einem Geschwindigkeit-Zeit-Diagramm darstellen und ablesen.
  - Seite `weg-zeit`: Weg-Zeit-Diagramm lesen.
  - Seite `geschwindigkeit-zeit`: Geschwindigkeit-Zeit-Diagramm lesen.
  - Seite `verbinden`: beide Diagramme verbinden und selbst einstellen.

## Content structure

- Jede Seite hat dieselben Abschnitts-ids, die der Seite passen: `einstieg` (Alltagssituation, Bezug zum Bekannten), `erklaert` (Anschaulich erklärt: Bild, Begriffe, Kasten zur Fehlvorstellung), `ausprobieren` (nur wo das Bewegungslabor steht), `beispiel` (ein Kasten `example`, ein Beispiel), `uebung` (Fragen mit Rückmeldung). Die Wiederholungsseite hat nur `einstieg` und `erklaert`.
- Länge: pro Seite zwei bis vier kurze Absätze je Abschnitt, Sätze kurz; Klasse 9, gemischte Leistung.
- Eine Seite, ein neuer Schritt: die Seite zum Weg-Zeit-Diagramm erklärt kein Geschwindigkeit-Zeit-Diagramm, und umgekehrt; erst `verbinden` zeigt beide.

## Terminology

- Wörter: Geschwindigkeit, Weg (Strecke s), Zeit t, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm, beschleunigen (Geschwindigkeit wird größer), abbremsen (Geschwindigkeit wird kleiner), Richtung ändern, Stillstand, gleichbleibende Geschwindigkeit. Vermeiden: „Beschleunigung“ als Größe mit Formel, „Verzögerung“, „negative Beschleunigung“.
- Einheiten: s in m, t in s, v in m/s; Werte als ganze Zahlen.
- Anrede: „du“. Im Geschwindigkeit-Zeit-Diagramm steht nur die Größe der Geschwindigkeit (v ≥ 0); die Richtung zeigt das Weg-Zeit-Diagramm (fallende Linie = zurück zum Start).
- Glossar (`definition`-Blöcke): beschleunigen, abbremsen, Weg-Zeit-Diagramm, Geschwindigkeit-Zeit-Diagramm.

## Exercise patterns

- Zuordnen/Erkennen: `single-choice` mit Diagrammbildern als `material`; jede Option mit `info`, die sagt, warum sie nicht passt.
- Ablesen: `number` mit Diagramm als `material`, `unit`, `tolerance`, `mistakes` (Zeit statt Weg, falsche Skalenzählung) mit Meldung.
- Urteilen: `true-false` mit Begründung in `explanation`; Hauptfall: „Berg im Diagramm = Berg auf dem Weg“. Weitere: „Bremsen heißt negative Geschwindigkeit“, „Kreisbahn mit gleichem Tempo ändert die Geschwindigkeit nicht“.
- Ordnen: `ordering` nur bei eindeutiger Reihenfolge.
- Zeichnen (Seite `verbinden`, Block `fahrt-einstellen`): Übungskomponente `DiagrammEinstellen` (Logik `DiagrammEinstellen.ts`, sechs Geschichten in der Reihenfolge der Seeds). Sie bettet `Bewegungslabor` ein; geprüft wird, wie sich das Tempo in jedem der vier Abschnitte ändert (schneller, gleichbleibend, langsamer, Stillstand), nicht ein bestimmter Satz Zahlen. Rückmeldung: typischer Fehler (nichts verändert; schneller und langsamer vertauscht) oder der erste Abschnitt, der nicht passt. Eine neue Geschichte: Eintrag in `STORIES` der Logik, Text in `stories` des Blocks, gleiche Reihenfolge.
- Zuordnen von Linien zu Fahrten: `matching` aus Aussagen über beide Diagramme; `single-choice` mit drei kleinen Diagrammen A, B, C (`weg-zeit-drei-bewegungen.svg`, `geschwindigkeit-zeit-drei-bewegungen.svg`).
- Es gibt keine Datendatei: Zahlen stehen in den Seiten und Bildern, weil jede Seite ihre eigenen Beispielfahrten hat (kein Fakt kommt zweimal vor).

## Figures

- Eigene SVG-Zeichnungen in `src/images/`, mit `source: eigene Zeichnung` und `licence: CC-BY-4.0`; erzeugt mit einem Skript außerhalb von `src/`.
- Konventionen überall gleich: Weg-Zeit-Diagramm grün (durchgezogen), Geschwindigkeit-Zeit-Diagramm blau; Achsen mit Zahlen und Einheit (s in m, v in m/s, t in s); die Zeitachse ist überall 0–20 s, die Skalen der Bilder stehen mit Zahlen an den Achsen und ändern sich nur zwischen Bildern, nie in einem Bild; Abschnitte mit senkrechten gestrichelten Linien bei 5, 10, 15 s. Bilder zeigen das Gegebene, nie die Antwort. Lesbar bei 360 px.
- `alt` beschreibt Achsen und Verlauf; `caption` sagt, worauf man achten soll.
- Komponente `Bewegungslabor`: vier Abschnitte à 5 s, Regler für das Tempo am Ende (0–20 m/s, Schritt 5), Kästchen „rückwärts“; Skala fest (s: −400 bis 400 m, v: 0 bis 20 m/s, t: 0 bis 20 s; Start mit 10 m/s bei s = 0); Prop `show` ist `s`, `v` oder `both`.

## Sources

- Lernlandkarte Physik (KMK-Bildungsstandards) über https://lernapps.net/apps/map/physik.json.
- Wikipedia „Weg-Zeit-Diagramm (Mechanik)“ (https://de.wikipedia.org/wiki/Weg-Zeit-Diagramm_(Mechanik)), „Gleichmäßig beschleunigte Bewegung“ und „Geschwindigkeit“ sind als weiterführende Links in den Übungen angegeben (geöffnet; nur Hintergrund, nichts wörtlich übernommen). Wikipedia „Geschwindigkeit“ nur als Hintergrund für Klasse-7-Wissen, nichts wörtlich übernommen. Keine passende Zweitquelle für die Diagramme gefunden; Inhalt aus Fachwissen, Sätze eigene. Das Material der Lehrkraft (keines) bliebe lokal.

## Adding a chapter or round

1. Kompetenz(en) aus `physik/mechanik` der Karte wählen; Voraussetzungen prüfen (`requires`), nicht geübte als Wiederholungsseite (`recap`) oder Link.
2. Ordner `src/<kapitel>/` mit `chapter.yaml`; Kapitel in `src/app.yaml` eintragen.
3. Pro Kompetenz eine Seite mit den Abschnitts-ids oben; `competencies: [<id>]`; Seiten in `chapter.yaml` listen.
4. Übungen aus den Mustern oben; Daten in `src/data/`; Bilder per Skript, gleiche Konventionen.
5. Diesen Leitfaden aktualisieren, `npx --no -- lernapps check`, committen.

## Rules learned from mistakes

None yet.
