# Development Plan: tooling (feat/map-assignment branch)

*Generated on 2026-11-11 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Ein Skill, der methodisch erklärt, wie ein Agent aus der Lernlandkarte eines Fachs einen sinnvollen **Auftrag für
eine App** ableitet, für eine Lehrkraft: welcher Strang (oder welche Einheit), welche Klasse, welche Bausteine in der
Reihenfolge der Kette, welche Voraussetzungen als Wiederholung, und warum gerade diese Lücke. Owner, 2026-11-11.
Der Skill liegt in lernapps/tooling (Owner).

## Key Decisions
### KD-01: Ergebnis ist ein Auftrag, kein fertiger Erklärer (Owner, 2026-11-11)
Der Skill führt bis zum Auftrag. Das Bauen danach folgt den vorhandenen Skills (content-research, explainer …).

### KD-02: Ort lernapps/tooling (Owner, 2026-11-11)
Dort liegen die Skills, die die Agenten der Lehrkräfte mit der Vorlage bekommen. Die Karte kommt aus lernapps/apps
(`/apps/map/<fach>.json`).

### KD-03: Die Karten-JSON liefert den Ort mit (Owner, 2026-11-11)
lernapps/apps ergänzt `/apps/map/<fach>.json` je Baustein um `place: { band, step }` (Klasse und Schritt der
Ansicht nach Klasse und Kette, lib/map.js `places`). Der Skill rechnet nichts nach. Eigener Branch in apps
(`feat/map-json-place`), Vertrag Abschnitt 5 und Test.

### KD-04: Der Agent lässt nachschauen und schlägt selbst vor (Owner, 2026-11-11)
Nennt die Lehrkraft kein Thema, bittet der Agent sie, die Karte anzusehen (`/apps/map/<fach>/c/`, Lücken gestrichelt),
und macht selbst einen begründeten Vorschlag. Die Lehrkraft entscheidet.

### KD-05: Vorschlag für eine kindgerechte Geschichte (Owner, 2026-11-11)
Zum Auftrag gehört ein Vorschlag für eine Geschichte, an der sich der Erklärer entlangzieht: Figuren, Ort, ein
Anliegen; je Baustein (Seite) eine Situation, in der er gebraucht wird. Passend zur Klasse, ohne fremde Marken und
Figuren, ohne Klischees, Zahlen plausibel (`explainer-plausible-numbers`). Die Geschichte dient dem Lernen: Sie
trägt die Aufgaben, sie lenkt nicht ab. Angenommen kommt sie in den Inhaltsleitfaden (`app-content`, „Content
structure“).

### KD-07: Erprobung in einer eigenen Sitzung (Owner, 2026-11-11)
Der Skill-Entwurf wird zuerst erprobt: Eine neue Sitzung ohne Repo (session_016Nmpwc6nnrUph2Pi6mniC3) spielt den
Assistenten einer Lehrkraft (Französisch, 2. FS, Hessen G9, Kl. 7, Anfang 1. Lernjahr) und baut einen Einstieg.
Diese Sitzung spielt die Lehrkraft. Ohne Push, ohne PR, ohne Eintrag. Ihre Rückmeldung zum Skill fließt vor der
Registrierung ein. Teil A (place im JSON) folgt danach.

### Befunde der Erprobung (2026-11-11, Bericht der Sitzung session_016Nmpwc6nnrUph2Pi6mniC3)
Auftrag „Bonjour ! – Mia in Lyon“: 6 Bausteine (laut-und-schrift, subjektpronomen, verb-etre,
begruessen-und-vorstellen, tu-oder-vous, begruessungsrituale), Ort selbst berechnet und korrekt; Plan bestätigt;
6 Seiten als Entwurf, gegen explainer.v2 gültig. Kein Build, kein `lernapps check`: `npx` war im automatischen
Modus der Sitzung gesperrt („Code from External“).
Was half: fester Ablauf bis zu einem bestätigbaren Auftrag; die Regel für den Ort; Richtstufe nach Kursstand bei
Fremdsprachen; Regeln für die Geschichte; „Offen“ sammelt alle Fragen.
Zu ändern (Vorschläge der Sitzung, von mir gewichtet):
1. Kriterium „Kann der Archetyp es üben?“ (Erklärer: kein Ton; Hören/Sprechen nicht) und Zeile „Was die App nicht
   kann“ im Auftrag.
2. Ort: Voraussetzungen aus allen Strängen zählen, nur die Richtstufe trennt („same band“ eindeutig).
3. Reihenfolge und Geschichte: Innerhalb eines Schritts frei; die Geschichte darf die Reihenfolge in einem Schritt
   bestimmen. Befund für die Karte Französisch: `begruessen-und-vorstellen` braucht `verb-etre`, darum kommt
   „Bonjour“ erst auf Seite 4. Feste Wendungen vor der Regel (wie Englisch classroom-phrases → imperativ) prüfen.
4. Bei einer Karte voller Lücken: „öffnet den Weg“ zählbar machen (Zahl der Bausteine, die darauf aufbauen).
5. Ohne Thema: wie man eine Situation für eine Einheit wählt (Sprachen).
6. Lehrplan nennen (`lernapps-content-research`), auch wenn er die ersten Wochen nicht beschreibt.
7. Plan-Vorlage verweist auf den Auftrag; Interview und Research-Checkpoint nicht doppeln.
8. Kapitel: ein Auftrag = in der Regel ein Kapitel.
9. Wo die Geschichte liegt: Inhaltsleitfaden „Content structure“ (steht schon), ggf. Beispiel.
10. Registrierung im Paket (`package.json`), damit `init` den Skill mitbringt (war ohnehin geplant).
11. Kurzes Beispielskript, um die Karten-JSON zu lesen (Lücken, Ort).
Außerhalb des Skills: Ersatzweg in llms.txt kopiert die Archetyp-Skills nicht; YAML-Fallen (Komma in Tabellenzellen,
„on“ → true); Quellen blockieren automatisierte Abrufe; autonome Agenten brauchen die Erlaubnis für `npx`.

### KD-08: Lehrplan irrelevant, nur der logische Aufbau; Skill kompakt (Owner, 2026-11-11)
Der Skill nennt keinen Lehrplan und kein Land: Es zählt die Kette der Karte. Überarbeitet nach den Befunden 1–5,
7–9, 11 und den Best Practices für Skills (Beschreibung sagt, wann; Imperativ mit Begründung; knapp; was immer
anfällt, liegt bei: `references/read-map.md` mit einem Skript für Lücken, Schritt und „öffnet den Weg“). Zweite
Erprobung in einer neuen Sitzung, selber Auftrag.

### Befunde der Erprobung 2 (2026-11-11, session_016NmpwdLKA6DtRRNRjzpvz6)
Auftrag „Salut ! – Ich stelle mich vor“ im ersten Anlauf bestätigt; Auswahl nach `opens` begründet
(subjektpronomen 120, bestimmter-artikel 68, verb-etre 40, laut-und-schrift 38); „Was die App nicht kann“ von selbst
genannt. Plan bestätigt (ohne „Jetzt du“); 6 Seiten und 5 Zeichnungen als Entwurf, gegen explainer.v2 gültig.
Wieder kein Build: `npx` gesperrt, ebenso `node read-map.mjs` (lädt aus dem Netz und führt aus).
Zu ändern:
1. Kein Skript: Die Karten-JSON liefert `place` und `opens` (Teil A in apps, erweitert), oder ein Befehl im Paket.
2. Ausgabe mit `name`/`iCan`.
3. Versteckte Voraussetzungen: Was brauchen die Übungen einer Seite (Wörter, Formen), das nicht im Schnitt steht?
   (avoir → Alter → Zahlen; Pronomen ohne Verben; Artikel ohne un/une) → als offene Frage.
4. Feste Zeilen im Auftrag: Sprache der Seiten; Art der Übungen (nur geprüfte oder auch freie). Übergabe: Der
   Auftrag erledigt den Checkpoint „research“ der Plan-Vorlage.
5. Kursstand genauer: Formel aus map-research (Lernjahr y von n → Teil ⌊3(y−½)/n⌋+1).
6. Skill nur auf dem Branch: erst nach dem Merge bringen `init` und der Ersatzweg ihn mit.
7. Geschichte: Figuren in einer Datendatei, damit sie auf allen Seiten gleich bleiben (prüfen, ob der Erklärer das
   vorsieht).
Karte Französisch: `begruessen-und-vorstellen` → `verb-etre` lässt „Bonjour“ ans Ende rutschen (zweimal gesehen).

### KD-09: Überarbeitung nach Erprobung 2 (Owner, 2026-11-11)
Die Karten-JSON trägt `place` und `opens` (lernapps/apps#261): Das Skript `references/read-map.md` entfällt. Neu im
Skill: Formel für den Kursstand; versteckte Voraussetzungen; `ahead` für feste Wendungen vor der Regel
(lernapps/tooling#282, app-templates#150); Zeilen „Sprache der Seiten“ und „Übungen“; Ausgabe mit Name, iCan und
opens; der Auftrag ist das Ergebnis des Checkpoints „research“. Figuren der Geschichte stehen im Inhaltsleitfaden:
Datendateien des Erklärers liest nur eine Zeitleiste, eine Übung oder eine Komponente (sonst explainer-unused-data).
Karte Französisch: `begruessen-und-vorstellen` ohne `requires` (Owner). Dritte Erprobung, selber Auftrag.

### Befunde der Erprobung 3 (2026-11-11, session_016NmpwaZz75T2SmeR2QZkLo)
Auftrag „Salut ! Je m'appelle …“ im ersten Anlauf bestätigt: 8 Seiten (laut-und-schrift, begruessen-und-vorstellen
mit `ahead: verb-etre`, subjektpronomen, zahlen-bis-100, verb-etre, verb-avoir, tu-oder-vous, steckbrief); Stufe
nach Formel; versteckte Voraussetzungen selbst gefunden (Zahlen fürs Alter, quel, Artikel); Figuren mit Aussehen.
Plan, Inhaltsleitfaden und 8 Seiten als Entwurf, gegen explainer.v2 gültig (außer `ahead`: erst app-templates#150).
Wieder kein Build: `npx` gesperrt.
Zu ändern (Vorschläge der Sitzung, von mir gewichtet):
1. Fach-Id nennen (`franzoesisch`, nicht `french`); Filtern nach `place.band` erlauben (JSON 270 kB).
2. n für den Kursstand: Jahre bis Klasse 10, sonst fragen.
3. Feste Wendung ohne Erklärung (je m'appelle, le foot) braucht kein `ahead`; `ahead` nur, wenn die Seite die
   Voraussetzung erkennbar benutzt und die App sie übt.
4. Tabelle Auftrag → Teile des Plans; das „ja“ ersetzt den Checkpoint „research“, nicht „confirm the plan“.
5. Höchstens 2 offene Fragen je Nachricht (wie die Plan-Vorlage).
6. Unklar: „Propose all the same“, „phonetic signs“ (wirkt wie Pflicht), Ids oder Namen in Zeile Strang/Einheit.
Kleiner: Abschlusstext mit `opens` 0 erlauben; Datei-Id je Seite.

### KD-10: Überarbeitung nach Erprobung 3 (Owner, 2026-11-11)
Fach-Id und Liste der Karten; Karte nach Stufe filtern; n bis Klasse 10, sonst fragen; Lautschrift nur auf Wunsch;
Abschlusstext erlaubt; feste Wendung braucht nichts, `ahead` nur, wenn die Seite die Voraussetzung benutzt;
Datei-Id je Seite; höchstens 2 Fragen; Tabelle Auftrag → Plan; das „ja“ bestätigt den Inhalt, nicht den Plan.
Eintrag in arc42 Kap. 5 und ein Schritt in der Plan-Vorlage (Explore), damit der Skill geladen wird.

### KD-06: Später (Owner, 2026-11-11)
Der Link „Baue eine App“ auf den Seiten der Karte gibt den Auftrag erst später mit.

## Notes
- Einordnung (pdt, lernapps/docs): Service `s-gap-finding` „Seeing which app is still missing“ (D6, x-phase
  explore) und Annahme `a-gaps-guide-creators` (D8, MVP first draft): „Creators build an app for a gap they see on the
  map“. Der Skill macht diesen Service für den Agenten nutzbar; Plattform-Design bleibt unverändert.
- Architektur (arc42 dieses Repos, Kap. 5): Skills sind Bausteine unter `bb-skills-explore`; ein neuer Skill braucht
  einen Eintrag dort, einen Export in `package.json` und ggf. eine Erwartung in `test/evals.test.ts`.
- Vorhanden: `lernapps-content-research` Abschnitt 2 „The learning map“ (Strang empfehlen, Ids übernehmen,
  Voraussetzungen als Wiederholung, fehlende Bausteine an apps vorschlagen). Es fehlt: **welche Lücke** zuerst, wie
  groß, in welcher Reihenfolge.
- Die Karten-JSON trägt `requires`, `gradeBand`, `practisedBy`, aber nicht Klasse/Schritt (Vertrag Abschnitt 5). Der
  Skill muss die Regel „Ort = Richtstufe + Schritt in ihr“ (lernapps/apps#235, KD-17) selbst anwenden oder die JSON
  bekommt sie (Änderung in apps).
- Im apps-Repo: Die Seiten eines Bausteins und Strangs verlinken „Baue eine App“ auf `/build/` ohne Auftrag.

## Explore
### Entrance Criteria
- Auftrag des Owners liegt vor.

### Tasks
- [ ] Owner: Name, Zuschnitt und offene Fragen (siehe Abschluss Explore)

### Completed
- [x] Branch `feat/map-assignment` von main (cd063c4)
- [x] Einordnung mit pdt: `s-gap-finding`, `a-gaps-guide-creators`
- [x] Vorhandene Skills und Registrierung gesichtet (package.json exports, arc42 Kap. 5, evals)

## Plan
### Entrance Criteria
- Name, Zuschnitt und Abgrenzung zu `lernapps-content-research` sind mit dem Owner geklärt.

### Plan
**Teil A – lernapps/apps, Branch `feat/map-json-place` (zuerst, damit der Skill sich darauf stützt):**
1. `src/_data/map.js` (JSON je Fach): je Baustein `place: { band, step }` aus `subject.places`.
2. `docs/learning-map-contract.md` Abschnitt 5: Feld beschreiben; Abschnitt „place“ ergänzen („The JSON carries it“).
3. Test in `test/map.e2e.test.mjs`: JSON hat `place` für jeden Baustein, gleiche Werte wie die Ansicht.
4. Eigener PR; Owner entscheidet über Merge.

**Teil B – lernapps/tooling, dieser Branch:**
1. Neuer Skill `skills/content/lernapps-map-assignment/SKILL.md` (Englisch, Stil der anderen Skills, kurz):
   - Wann: Explore, wenn die Lehrkraft eine App „für eine Lücke“ will oder nicht weiß, was sie bauen soll; vor
     `lernapps-content-research`.
   - 1 Fragen: Fach, Land/Schulform, Klasse, laufendes Thema.
   - 2 Karte lesen: JSON, `place`, `practisedBy`, `requires`, `explainerFocus`; Lehrkraft bitten, die Seite
     `/apps/map/<fach>/c/` anzusehen (KD-04).
   - 3 Kandidaten: Lücken in ihrer Klasse; Strang (oder Einheit bei `explainerFocus: competency`).
   - 4 Bewerten: passt zu Klasse/Thema; Voraussetzungen geübt oder als Wiederholung machbar; was darauf aufbaut;
     zusammenhängende Kette.
   - 5 Zuschnitt: 3–8 Bausteine, ein Schritt nach dem anderen, eine Seite je Baustein; Voraussetzungen außerhalb →
     Wiederholungsseite oder Link.
   - 6 Geschichte (KD-05): Vorschlag mit Figuren, Ort, Anliegen; je Baustein eine Situation.
   - 7 Auftrag schreiben (feste Form, Beispiel) und mit der Lehrkraft bestätigen; danach `lernapps-content-research`.
   - Eine Regel im Rule-Format der anderen Skills (z. B. `assignment-from-map`, severity hint), falls passend.
2. `lernapps-content-research` Abschnitt 2: ein Satz mit Verweis auf den neuen Skill.
3. Registrierung: Export in `package.json`; arc42 Kap. 5 Baustein unter `bb-skills-explore`
   (`implements`, `x-phase: explore`); ggf. Erwartung in `test/evals.test.ts` und Wege, über die Skills in Apps
   kommen (generator/update.ts, guidance), prüfen.
4. Prüfen: `npm test`, Lint der Skills (falls vorhanden), `npm run build`.

### Tasks
- [x] Plan Teil A und B
- [x] Owner: Skill zuerst schreiben und in einer Sitzung erproben (KD-07)

### Completed
- [x] Owner-Antworten KD-03 bis KD-06

## Code
### Entrance Criteria
- Gliederung des Skills und Änderungen an Registrierung/Doku sind geplant und bestätigt.

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Commit
### Entrance Criteria
- Skill geschrieben, registriert, Checks und Tests grün.

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
