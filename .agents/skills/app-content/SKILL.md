---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

## Curriculum

- Hessen, Gymnasium, Jahrgangsstufe 6 (Sekundarstufe I). Mathematik, Strang `mathematik/arithmetik` der Lernlandkarte.
- Orientierung: Hessisches Kultusministerium, *Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen,
  Sekundarstufe I – Gymnasium, Mathematik*, 2021,
  https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf. Kapitel 7.3,
  Inhaltsfeld „Zahl und Operation", Jahrgangsstufe 5/6: Brüche als Teil eines Ganzen und als Teil mehrerer Ganzer;
  Vergleichen und Ordnen gebrochener Zahlen; Teilbarkeit; Darstellungen (Zahlenstrahl, Kreisdiagramm).
- Die Kompetenzerwartungen am Ende der Jahrgangsstufe 6 (Kapitel 7.1) sind nicht im Wortlaut geprüft.
- Kein eigenes Material der Lehrkraft; der Lehrplan ist nur Orientierung.
- Nicht Teil der App: gemischte Zahlen, Rechnen mit Brüchen, Dezimalbrüche, Prozent.

## Competencies

Ids und Wortlaut stammen aus der Lernlandkarte (`https://lernapps.net/apps/map/mathematik.json`); nicht umformulieren.

1. Kapitel `brueche-verstehen` („Brüche verstehen")
   - `brueche-begriff`: Ich kann Brüche als Teil eines Ganzen deuten und darstellen.
     - `was-ist-ein-bruch`: Anteil, Ganzes, Zähler, Nenner.
     - `brueche-darstellen`: Streifen, Kreis, Zahlenstrahl; Brüche größer als 1.
2. Kapitel `kuerzen-erweitern` („Kürzen und erweitern")
   - `brueche-kuerzen-erweitern`: Ich kann Brüche kürzen und erweitern und der Größe nach vergleichen.
     - `brueche-erweitern`: gleichwertige Brüche durch Erweitern.
     - `brueche-kuerzen`: Kürzen, vollständig kürzen.
     - `brueche-vergleichen`: gleichnamig machen, ordnen.
- Voraussetzungen, die die App nicht übt: `natuerliche-zahlen` (Link auf der ersten Seite) und `teilbarkeit` (Link auf
  der Kürzen-Seite): `https://lernapps.net/apps/map/mathematik/c/<id>/`. Keine Wiederholungsseite.
- Übungs-ids stehen in der Seitendatei im Abschnitt `uebung`, sprechend und seitenweit eindeutig; sie dürfen nicht
  so heißen wie ein Abschnitt der Seite (zum Beispiel `kuerzen-nenner`, `bruch-ueber-eins-wahr`).

## Content structure

- Dateien: `src/app.yaml` (Kapitelliste), `src/<kapitel>/chapter.yaml` (Seitenliste), `src/<kapitel>/<seite>.yaml`.
- Jede Seite hat Abschnitte mit festen ids in dieser Reihenfolge; ein Abschnitt, den eine Seite nicht braucht, entfällt:
  1. `einstieg`: Alltag (Pizza, Schokolade, Kuchen), was Klasse 6 schon kennt; höchstens fünf Sätze; hier steht der Link
     auf eine Voraussetzung, die die App nicht übt.
  2. ein bis drei Erklärabschnitte, deren ids den Schritt nennen (`zaehler-nenner`, `kreis-zahlenstrahl`,
     `mehr-als-ein-ganzes`, `erweitern`, `kuerzen`, `gleicher-zaehler`, `gleichnamig`). Vor jeder Figur steht, was das
     Ganze ist. Die Komponente der Seite steht im Erklärabschnitt (Seite 1: eigener Abschnitt `ausprobieren`).
  3. `uebung`: mindestens eine Aufgabe, am Ende der Seite.
- Eine Seite, ein Schritt; Seitentitel nennen, was der Abschnitt tut.
- Länge: eine Seite lässt sich in etwa 15 bis 20 Minuten lesen und üben.

## Terminology

- Verwendet: Bruch, Zähler, Nenner, Ganzes, Anteil, gleichwertige Brüche, erweitern, kürzen, vollständig gekürzt,
  gleichnamig. Brüche schreibt man `$\frac{3}{4}$`; im Fließtext der Seiten als Formel, nie „3 durch 4".
- Vermieden: „Bruchstrich teilen" ohne Erklärung, „oben/unten" statt Zähler/Nenner (nur bei der ersten Einführung als
  Hilfe, danach nur die Fachwörter).
- Lernende werden mit „du" angesprochen, einfache Sprache, kurze Sätze.
- Glossar (`definition`): Bruch, Zähler, Nenner, gleichwertige Brüche, kürzen, erweitern, gleichnamig; je ein Satz.
- Der Streifen ist immer ein Ganzes (1 Streifen = 1 Ganzes); das steht vor jeder Figur.

## Exercise patterns

Daten: `src/data/brueche.yaml` (Beispielbrüche mit Alltagsbild); jede Tatsache einmal.

- **Anteil färben** (darstellen): Komponente `BruchStreifen` (`src/components/BruchStreifen.vue`, `.ts`, `.test.ts`). Fest: Streifen mit n
  gleichen Feldern, Aufgabe nennt z/n. Variiert: n (2–12), z. Beispiel: Seite `was-ist-ein-bruch`, Abschnitt `uebung`.
- **Anteil ablesen** (deuten): `generated`; fest: Text mit „n gleiche Teile, z gefärbt"; variiert n, z; gefragt Zähler
  oder Nenner. Fehler: Nenner = Zahl der gefärbten Teile; z/(n−z).
- **Wahr oder falsch mit Grund** (beurteilen): `true-false` und `single-choice`; die Rückmeldung nennt den Grund
  (ungleiche Teile sind kein Bruch).
- **Erweitern** (rechnen): zwei `generated` in `src/kuerzen-erweitern/brueche-erweitern.yaml` (`erweitern-zaehler`,
  `erweitern-nenner`); n, z, k gezogen, `where` schließt Gleichheit von Fehler und Lösung aus. Fehler: Addition statt
  Multiplikation (`z + k`, `n + k`), nur eine Zahl erweitert. Dazu `true-false` zu gleichwertigen Brüchen.
- **Kürzen** (rechnen): zwei `generated` in `brueche-kuerzen.yaml`: `kuerzen-nenner` (Daten `src/data/kuerzen.yaml`:
  z, n, t = Teiler, zk, nk) und `kuerzen-ganz` (Daten `src/data/kuerzen-ganz.yaml`: z, n, zs, ns = einmal gekürzt, zk, nk).
  Fehler: nur ein Teil geteilt, nicht vollständig gekürzt. Dazu `multiple-choice` zu gemeinsamen Teilern.
- **Vergleichen** (vergleichen, ordnen): in `brueche-vergleichen.yaml` `single-choice`, `true-false`, `ordering` und
  ein `generated` `gleichnamig-zaehler` (Daten `src/data/vergleich.yaml`: a, b, c, d, n = gemeinsamer Nenner, za, zc).
  Fehler: „1/8 > 1/4, weil 8 > 4"; Addition statt Multiplikation. Die Rückmeldung sagt: Je mehr Teile, desto kleiner
  jedes Teil.
- **Ablesen am Bild** (deuten): in `brueche-darstellen.yaml` `single-choice` mit `material` (Figur zeigt das Gegebene, nie
  die Antwort), `true-false` und `number` zu Brüchen über 1. Fehler: Striche statt Abschnitte gezählt, Zähler und Nenner
  vertauscht.
- Jede Rückmeldung nennt, was schiefging und wie man es richtig macht, nie nur „Falsch".
- Zahlen: Nenner bis 40 in Kürz-Aufgaben, sonst bis 24; Zähler kleiner als der Nenner, außer auf Seite
  `brueche-darstellen` (Brüche über 1).

## Figures

- `bar` für „ein Teil von einem Ganzen" im Text. Eigene SVGs in `src/images/` (Kreis, Streifen untereinander,
  Zahlenstrahl); Alt-Text beschreibt, was zu sehen ist; Unterschrift sagt, worauf man schaut.
- Farben: Gefärbtes blau mit zusätzlichem Muster, Ungefärbtes weiß, schwarze Rahmen; Farbe trägt nie allein die
  Bedeutung. Zwei Figuren nebeneinander tragen eine sichtbare Beschriftung („vorher", „erweitert mit 3").
- Komponenten: `BruchStreifen` (Übung: Felder anklicken, „Prüfen"; kein Zähler vor dem Prüfen), `StreifenTeilen`
  (Modell: Stück feiner teilen oder zusammenfassen, die gefärbte Fläche bleibt gleich, die Zahlen ändern sich). Jede
  hat ein Logikmodul, einen Test und einen Text ohne JavaScript. Skizzen: `.vibe/sketches/`.
- Herkunft aller Bilder: eigene Arbeit, CC BY 4.0. Alles funktioniert bei 360 px.

## Sources

- Lehrplan: siehe Curriculum (heruntergeladen und gelesen).
- Lernlandkarte: `https://lernapps.net/apps/map/mathematik.json` (Kompetenzen und ids).
- Zweite Quellen (z. B. serlo.org) sind nicht geöffnet und nicht geprüft; die Inhalte stammen aus der Mathematik selbst.
  Keine Sätze werden aus Quellen übernommen.
- Nichts über echte Lernende in Texten oder Commits.

## Adding a chapter or round

1. Kompetenz-id aus der Karte wählen (`mathematik.json`, Strang `arithmetik`); Wortlaut nicht ändern.
2. Ordner `src/<kapitel>/` mit `chapter.yaml` anlegen und in `src/app.yaml` unter `chapters` eintragen.
3. Pro Seite `src/<kapitel>/<seite>.yaml` nach dem Muster von `src/kuerzen-erweitern/brueche-erweitern.yaml`: Abschnitte
   `einstieg`, `erklaerung`, `ausprobieren`, `uebung`; die Seite nennt in `competencies` genau eine id.
4. Übungen aus den Mustern oben, Beispielbrüche aus `src/data/brueche.yaml`.
5. Voraussetzung, die die App nicht übt: Link auf die Karte im Text.
6. 1 bis 3 ihrer Übungen in `selfAssessment` der `chapter.yaml` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt
   (1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen); `generated` und Komponenten vor Fragen, die man raten kann.
7. Begriffe ins Glossar (`definition`). Dieses Dokument ergänzen (Competencies, Patterns).
8. `npx --no -- lernapps check`, dann committen.

## Rules learned from mistakes

None yet.
