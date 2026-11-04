# Development Plan: tooling (feat/explainer-learning-juror branch)

*Generated on 2026-11-03 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Die Kritik aus Issue #257 (Retro Bruchrechnung, lernapps/bruchrechnung PR #1) wird messbar und die Guidance daran verbessert.

1. Kriterien für Explainer, die ein Juror prüft: eine gemeinsame Rubrik für den Juror der Evals (`evals/`) und den Review (`review/archetypes/explainer.md`).
2. Juror an der Bruchrechnung eichen (Stände `3dea03c`, `791940f` mit den Labels des Kinder-Audits in #257, Endstand).
3. Baseline: Eval-Läufe mit dem aktuellen Tooling.
4. Verbesserungen aus #257 in die Guidance einführen.
5. Höchstens drei weitere Iterationen: messen, Befunde lesen, nachschärfen.

Prioritäten des Nutzers für die Kriterien:
- Prio 1: Funktionsweise und Bedeutung der Visualisierungen erklären, Analogien schaffen, Lernende dort abholen, wo sie erwartbar stehen.
- Prio 2: Altersgemäße Ansprache.

## Key Decisions
- Ort des Jurors: eine gemeinsame Rubrik für Evals und Review (Nutzer, 2026-11-03).
- Anwendungsfälle: zwei Bausteine der Bruchrechnung und zwei aus der linearen Algebra; andere Altersgruppe, daher andere (altersgemäße) Ansprache (Nutzer, 2026-11-03).
- Statt linearer Algebra (gemeint: Oberstufe; nicht auf der Karte) Beschleunigung in Physik (Nutzer, 2026-11-03). Vorschlag aus der Karte `map/physik.yaml`, Strang `mechanik`, Klasse 9–10: `geschwindigkeitsaenderung` (qualitativ: beschleunigen, bremsen, Richtung) und `bewegungsdiagramme` (Weg-Zeit- und Geschwindigkeit-Zeit-Diagramm). Quantitative Beschleunigung (a = Δv/Δt, Oberstufe) steht nicht auf der Karte. Bestätigt (Nutzer, 2026-11-03: „zwei Bausteine pro Auftrag“).
- Nutzer (2026-11-03, abends): „Leg los“ – autonom arbeiten, ohne Stopp an Phasengrenzen; nach den Poor-man's-Evals darf ich die Guidance anpassen.
- Workflow epcc; Feature-Zweig `feat/explainer-learning-juror`.
- Zwei Aufträge (Eval-Tasks) mit je zwei Bausteinen (Nutzer, 2026-11-03):
  - Mathematik Kl. 6: `brueche-begriff` und `brueche-kuerzen-erweitern` (Vorschlag: am stärksten visuell, deckt die Kritik an Kuchen/Streifen ab; `kuerzen-erweitern` braucht `teilbarkeit`, das die App nicht übt → prüft auch den Verweis auf Vorwissen).
  - Physik Kl. 9–10: `geschwindigkeitsaenderung` und `bewegungsdiagramme`.
- Bauendes Modell: Sonnet; n = 2 pro Auftrag und Messung (Nutzer). Baseline + höchstens 3 Iterationen → höchstens 16 Läufe.
- Evals über Harbor in der Umgebung „Evals“; Harbor muss dafür einen Zweig/Commit der Guidance testen können (Nutzer). Zuerst ein Probelauf als „Poor man's Eval“: eine Sonnet-Sitzung je Auftrag, ich spiele die Persona strikt; dient der Eichung des Jurors (Vorschlag, vom Nutzer nicht abgelehnt).

## Notes
- Ausgangsanalyse (Sitzung 2026-11-03): Evals messen nur den Prozess (`evals/expectations.json`); Inhalte beurteilt nur der Review beim Listing (`review/rubric.md`, `review/archetypes/explainer.md`). Die simulierte Ersteller-Persona gibt keine didaktische Kritik, eine schwache App erhält daher gute Eval-Werte.
- Noch gültig auf `main`: starre Abschnittstitel in `lernapps-explainer-design`, `early-preview` ohne Checkpoint, kein Theme-/Klassen-Leitfaden in `components.md`, `git switch --orphan` + Pre-Push-Hook in `lernapps-github` (Schritte 4/5).
- Skizze der Kriterien (K1–K10): Lernschritt pro Seite, Einstieg/Begriffe, Bedeutung der Darstellung (5 Fragen), Text–Bild-Übereinstimmung, Bedienelement mit Zweck, Bildsprache, Übung verrät nichts, Übung passt zum Schritt, Erklärung mit Inhalt, ehrliche Überschriften. Skala 0–2 (unklar/teilweise/klar), Blocker getrennt, Beleg je Bewertung.
- Lernlandkarte: `lernapps/apps` `map/mathematik.yaml`; liefert `gradeBand` und `requires` als Maßstab für „Vorwissen“.

## Explore
### Entrance Criteria
- Nutzer hat das Vorhaben beschrieben.

### Tasks

### Completed
- [x] Created development plan file
- [x] Physik-Bausteine, Test unveröffentlichter Guidance, Modell und Läufe mit dem Nutzer geklärt.
- [x] Einordnung in Plattform und Architektur (pdt, arc42), Befunde A1–A3.
- [x] Eval-Infrastruktur verstanden, Befunde E1–E5.
- [x] Review-Infrastruktur verstanden, Befunde R1–R2.
- [x] Bruchrechnung als Eichdaten: Versionen `@lernapps/tooling` 0.2.0 und `@lernapps/app-templates` 0.1.x sind auf npm; Stände lassen sich bauen (Bau selbst erst in Code).

### Befunde Explore
- A1 Plattform (lernapps/docs, pdt42): riskanteste Annahme `a-trust-built-in` („Teachers use an app without checking it themselves“). Inhaltsqualität ist also Teil des Vertrauens; der Juror stützt diese Annahme. Keine pdt-Änderung nötig.
- A2 Architektur tooling: `bb-evals` „scored by the check, the review and the plan's counters“ und `requires: if-review-procedure`. Die Architektur sieht den Review in den Evals also schon vor; umgesetzt ist er nicht. Der Juror schließt diese Lücke.
- A3 Kap. 10 hat keine Qualitätsanforderung zur Lernqualität der Inhalte. Neu: ein Szenario (z. B. `qs-learning-action-understood`) mit Metrik aus dem Juror. `qs-early-preview` ändert sich, wenn die Musterseite ein Checkpoint wird.
- E1 Eval-Tasks: `quiz-fresh`, `explainer-fresh` (Physik Stromkreis Kl. 8), `interactive-fresh`; Persona spielt eine Lehrkraft, gibt keine didaktische Kritik. Neue Tasks je Baustein nötig (Persona, instruction, task.toml).
- E2 Verifier läuft in Harbor in einem getrennten Container, deterministisch (Node), ohne Modellzugang. Der Juror braucht Modell und Browser → als eigener Schritt nach dem Lauf (wie `score-transcript.ts`) oder als zweiter Verifier mit Schlüssel.
- E3 Guidance unter Test ist immer `main` (`run.sh`: `git ls-remote … refs/heads/main`; Instruction: `github:lernapps/tooling#main`; `llms.txt` von lernapps.net, Skills aus dem npm-Paket). Iterationen auf einem Zweig sind heute nicht testbar, ohne nach `main` zu mergen (trifft echte Ersteller).
- E4 Läufe nur in der Cloud-Umgebung „Evals“ (Schlüssel, Docker). Diese Sitzung hat keinen Docker-Daemon und keinen Eval-Schlüssel. Ausführen: eigene Sitzung nach `evals/harbor/session-prompt.md`.
- E5 Bisherige Läufe n = 3 pro Zelle; ein Explainer-Lauf hat bis 2 h Agent-Timeout. Ergebnisse in `evals/runs/<run>/results.json`, Schlüsse in `conclusions.yaml`.
- R1 Review: `review/prompt.md`, `review/rubric.md`, `review/archetypes/explainer.md`; Rubrik-Items mit ```rubric id```, Verdict nach `review/verdict.v1.schema.json`. Gestartet vom Owner oder `/review` im Listing-PR; liest Bundle und Quellen, bedient die App nicht.
- R2 Vorhandene Explainer-Items, die berührt werden: `explainer-figure-explains` (nur statische Figuren), `topic-has-exercises`, `explainer-readable-without-js`, `content-matches-competencies`; allgemein `learners-act`, `learner-text-german`. Die neuen Kriterien ergänzen diese, statt sie zu doppeln.

## Plan
### Entrance Criteria
- Ort, Anwendungsfälle und Prioritäten der Kriterien sind geklärt.
- Eval- und Review-Infrastruktur sind verstanden, die Einordnung in die Architektur ist beschrieben.

### Strategie

**1. Kriterien = Regeln des Katalogs.** Jede Regel lebt in einer Skill (` ```rule ` mit id, scope, severity), der Review beurteilt sie mit einem Rubrik-Item derselben id (`scripts/rules.ts`, `npm run verdict`). Die Kriterien werden deshalb Regeln in `skills/archetypes/lernapps-explainer-design/references/rules.md` (scope `archetype:explainer`) und Items in `review/archetypes/explainer.md`. Eine Rubrik, zwei Nutzer: der Review (Befunde) und der Juror der Evals (Stufen 0–2).
Achtung Baseline: Neue Regeln in einer Skill ändern die Guidance. Die Baseline läuft daher gegen `main` (Commit vor diesem Zweig); der Juror liest die Rubrik dieses Zweigs.

| Regel-id | K | Prio | neu/erweitert |
|---|---|---|---|
| `explainer-learner-start` | K2 + Analogien | 1 | neu: Einstieg beim erwartbaren Vorwissen (Klassenstufe, `requires`), Alltagsbezug/Analogie, Begriffe dort, wo sie gebraucht werden |
| `explainer-representation-explained` | K3 | 1 | neu: die fünf Fragen je Darstellung (Ganzes/Bezug, Zeichen, Handlung, was gleich bleibt, Weg zur Aussage); auch `nojs` |
| `explainer-control-purpose` | K5 | 1 | neu: jedes Bedienelement mit erkennbarem Zweck und Wirkung; sinnvoller Startzustand |
| `explainer-text-figure-agree` | K4 | 1 | neu: gleiche Zahlen/gleiches Ganzes in Text, Bild, Aufgabe; angekündigter Beispielwechsel; genannte Werkzeuge existieren |
| `explainer-one-step` | K1 | 1 | neu: ein neuer Lernschritt je Seite, kein Vorgriff auf spätere Bausteine, ein Beispiel je Kasten |
| `explainer-figure-hides-answer` | K7 | – | erweitert (Rubrik): auch live berechnete Ergebnisse und automatisch gefüllte Antwortfelder |
| `topic-has-exercises` | K8 | – | erweitert (Rubrik): eine Darstellung je Aufgabe, kein späterer Stoff |
| `explainer-steps-explain` | K9 | 1 | neu: Lösungsweg mit den Zahlen der Aufgabe und Begründung, keine Scheinerklärung |
| `explainer-honest-headings` | K10 | 2 | neu: „Ausprobieren“ nur mit Interaktion; gleiche ids, passende Titel |
| `explainer-age-appropriate` | Prio 2 | 2 | neu: Ansprache, Beispiele und Ton passen zur Klassenstufe |
| (K6 Bildsprache) | K6 | – | Teil von `explainer-representation-explained` (Zeichen/Legende), keine eigene Regel |

Severity: `hint` für alle neuen Regeln (Urteil, kein Programm; der Review macht Zweifel zu Hinweisen).

**2. Juror.** `evals/juror/prompt.md`: ein Agent in frischem Kontext beurteilt eine gebaute App nur mit den Items der Lernqualität (Tabelle oben), bedient sie im Browser (Playwright), Rolle aus Klassenstufe und `requires` der Karte. Er sieht keine Pläne, Retros oder Git-Geschichte (`.vibe/`, `docs/` werden vorher entfernt). Ausgabe `learning.yaml` nach `evals/juror/learning.v1.schema.json`: je Item und Einheit (Seite/Darstellung/Übung) Stufe 0/1/2 mit Beleg. `evals/juror.ts` prüft die Datei und verdichtet sie zu Zahlen je Item (Mittel, Anzahl Stufe 0). Aufruf in Harbor-Läufen: `evals/harbor/judge.sh <job>` nach `run.sh`; in Poor-man's-Evals: als Subagent dieser Sitzung.

**3. Eichung** an lernapps/bruchrechnung: Stände `3dea03c` (früh), `791940f` (Labels des Kinder-Audits in #257), Endstand `7ffa8b9`. Ziele: Mittelwerte steigen in dieser Reihenfolge; bei `791940f` je Seite (Spalte „Bedienung/Handlung“ ↔ Juror-Mittel der Darstellungs-Items) höchstens eine Stufe Abstand in ≥ 80 % der Seiten, nie „klar“ (2) wo der Audit „unklar“ sagt; die Blocker des Audits (falscher Regler-/Mengenhinweis, fehlender Streifen bei Gleichungen) werden gefunden. Verfehlt → Anker schärfen, höchstens zwei Runden.

**4. Harbor testet einen Zweig.** `run.sh` nimmt `GUIDANCE_REF` (Zweig oder Commit, Standard `main`), löst ihn in einen Commit auf und schreibt für ≠ main eine Kopie des Tasks mit angepasster Vorgabe: `llms.txt` aus `raw.githubusercontent.com/lernapps/tooling/<commit>/site/llms.txt`, `npx --yes github:lernapps/tooling#<commit>` statt `@lernapps/tooling`, `--tooling github:lernapps/tooling#<commit>` bei init und create (Version 0.0.0 auf dem Zweig, `generator/init.ts` `toolingSpec`). `configuration.json` nennt den Ref. Zwei neue Tasks: `explainer-brueche` (Hessen, Gymnasium Kl. 6; `brueche-begriff`, `brueche-kuerzen-erweitern`) und `explainer-bewegung` (Kl. 9/10; `geschwindigkeitsaenderung`, `bewegungsdiagramme`), Personas nach dem Muster von `explainer-fresh`.

**5. Poor man's Evals.** Je Auftrag und Messung zwei Sonnet-Sitzungen (`create_session`, Umgebung wie diese). Vorgabe wie in Harbor (Zweig-Variante bzw. main). Ich spiele die Persona strikt nach `persona.md` (nur gefragte Fakten, „Ja, passt so“, „Mach bitte weiter“, Ende an der Veröffentlichungsfrage). Die Sitzung schickt jede Nachricht an den Ersteller mit `send_message` an diese Sitzung und pusht am Ende die App als verwaisten Zweig `evals/apps/<run>/<task>-<n>` nach lernapps/tooling. Juror als Subagent auf der gebauten App. Zählung: Rückfragen nach dem Plan, Check grün, Juror-Werte. Annahme zur Nutzeranweisung „wendet sich an Dich“: die Sitzung arbeitet selbst; an mich wendet sie sich für alles, was der Ersteller entscheidet.

**6. Guidance-Änderungen (Iteration 1, nach der Baseline)** aus #257:
- `workflow-rules.md`: `early-preview` → Checkpoint Musterseite (`pattern-page`): erste vollständige Seite (Einstieg, Darstellung, Bedienung, Beispiel, Übung), vorher Selbstprüfung mit den fünf Fragen und eine Prüfung aus Lernendensicht (Subagent), dann zeigen und auf das Ja warten; erst danach die Breite. Plan- und Increment-Template, arc42 `qs-early-preview`.
- Regel „Allgemeine Rückmeldung → alle Verwendungsstellen prüfen“ (`feedback-applied-everywhere`).
- `lernapps-explainer-design`: die neuen Regeln (Teil 1), ids fest/Titel passend, Lernhandlung je Komponente in „Content method“ beschreiben (fünf Fragen).
- `guidance/subagent-brief.md`: Brief für die Prüfung aus Lernendensicht.
- `components.md`: Theme-Tokens, reservierte Runtime-Klassen, Abstände, Startzustand (Fakten aus app-templates).
- Iterationen 2–3 nach den Befunden.

**7. Architektur und Doku:** arc42 Kap. 10 neues Szenario `qs-learning-action-understood` (Metrik aus dem Juror), Kap. 5 `bb-evals` (Juror), `evals/README.md`, `evals/expectations.json` (neue Dimensionen), Erwartung A36 im Entwicklungsplan agentic app creation.

**Risiken:** Juror schwankt (n = 2, Befunde lesen statt nur zählen); Überanpassung (Guidance und Juror teilen die Regeln: gewollt, da die Regel der Maßstab ist; Kontrolle durch die Befunde und den Physik-Auftrag); GitHub-Installation des Zweigs (`prepare` baut) kann im Container scheitern → vorher hier testen; Kosten.

### Tasks
- [ ] Nutzer bestätigt den Plan → entfällt (Nutzer: autonom, „Leg los“).

### Completed
- [x] Strategie, Regeln, Juror, Eichung, Zweig-Evals, Poor man's Evals, Guidance-Änderungen und Doku geplant.

## Code
### Entrance Criteria
- Rubrik, Juror-Aufbau, Eichverfahren, Eval-Aufgaben und Iterationsablauf sind geplant (Nutzer: autonom).

### Tasks
- [x] C1 Regeln in `lernapps-explainer-design/references/rules.md` und Items in `review/archetypes/explainer.md`; `npm run rules`, Tests grün. Commit.
- [x] C2 Juror: `evals/juror/prompt.md`, Schema, `evals/juror.ts` mit Test. Commit.
- [x] C3 Eichung an lernapps/bruchrechnung (drei Stände), Ergebnis in `evals/juror/calibration.md`; Anker nachschärfen. Commit.
- [x] C4 Harbor: `GUIDANCE_REF`, Zweig-Vorgabe, `judge.sh`; zwei Tasks `explainer-brueche`, `explainer-bewegung`; Installation von `github:lernapps/tooling#<commit>` hier getestet; Tests (`test/evals.test.ts`). Commit.
- [ ] C5 Baseline (main): Poor man's Evals 2 Aufträge × n = 2, Juror, Ergebnis in `evals/runs/<run>/`. Commit.
  - Läuft (2026-11-03, 21:34 UTC): vier Sonnet-Sitzungen (Liste in /home/user/pm/sessions.md, außerhalb des Repos). Befund: Der Auto-Modus der Kind-Sitzungen blockiert `npx --yes @lernapps/tooling init` als „Code from External“, auch nach dem „Ja, das darfst du“ der Lehrkraft im Chat (alle vier Sitzungen, 21:50 UTC). Poor man's Evals damit abgebrochen (Ende „festgefahren“); gemessen wird nur mit Harbor. Folgerung für die Guidance: Ersteller in Claude Code im Auto-Modus (Web, App) bleiben am ersten Schritt stehen; `llms.txt` sagt dazu nichts → Vorschlag für ein eigenes Issue (eine Erlaubnisregel für `npx --yes @lernapps/tooling *` oder ein Hinweis, wie man sie setzt).
  - Zusätzlich Harbor in der Umgebung „Evals“ (Sitzung session_016NmpwdCZ5sNsKGxLuji4aj): Baseline und Iteration 1 (`2ed7a8c`), je n = 2, mit Juror; Ergebnis auf `evals/run-2026-11-03-juror`.
- [ ] C6 Iteration 1: Guidance-Änderungen (Strategie 6), messen. Commit.
  - Guidance geändert (Musterseite als Checkpoint, Lernenden-Prüfung, `feedback-applied-everywhere`, Lernhandlung in „Content method“, Look and layout, Abschnittstitel); messen fehlt.
  - Harbor-Lauf 2026-11-03-juror (Sonnet, n = 2, Ergebnis `evals/run-2026-11-03-juror` `5924643`): Prozesswerte da, Juror zunächst ohne Werte (Claude Code verweigert bypassPermissions als root; behoben in `d888731`, Juror läuft neu).

    | Zelle | check | phase | Rückfragen nach Plan | Fragen/Zug max | Minuten |
    |---|---|---|---|---|---|
    | Brüche Baseline | 1 | 1 | 8,5 (6–11) | 5,5 | 26 |
    | Brüche It. 1 | 1 | 1 | 7 (5–9) | 5 | 28 |
    | Bewegung Baseline | 1 | 0,83 | 5,5 (4–7) | 5,5 | 24 |
    | Bewegung It. 1 | 1 | 1 | 6 (6–6) | 5,5 | 36 |

    Transkripte: In It. 1 bauen alle vier Läufe zuerst eine Musterseite, lassen sie von einem Subagenten prüfen und holen das Ja; in der Baseline keine Musterseite. `skills_in_phase` steigt (0,82 → 1; 0,73 → 0,94), Bewegung schlägt in It. 1 sofort `explainer` vor (Baseline: `interactive`). Probleme: Warten auf den Subagenten über mehrere Züge, echte Antwort für Wakeup gehalten, Bildschirmfotos nicht angesehen, „Zwischenstand“ fehlt (`early_preview` 0), Phasenansage seltener (Bewegung 0,54 → 0,27). Rückfragen nach dem Plan in allen Zellen über 3 (schon in der Baseline).
- [ ] C7 Iteration 2: erste Änderungen `2b1872a` (Lernenden-Prüfung im Vordergrund, Bildschirmfotos ansehen, Checkpoint-Nachricht mit „**Code · Checkpoint** Zwischenstand“); Lernqualität nach den Juror-Befunden folgt.
  - Juror (Sonnet) auf Baseline und It. 1 (`evals/runs/2026-11-03-juror/learning/`, Commit `1733e4b`), Mittel je Lauf:

    | Zelle | Läufe (mean / Stufe 0) | Mittel | representation | control | steps | one-step |
    |---|---|---|---|---|---|---|
    | Brüche Baseline | 1,66/0; 1,61/4 | 1,64 | 1,50; 1,43 | 1,40; 1,00 | 1,60; 1,10 | 1,40; 1,67 |
    | Brüche It. 1 | 1,83/2; 1,60/5 | 1,72 | 1,84; 1,75 | 1,71; 1,25 | 1,73; 1,45 | 1,29; 1,83 |
    | Bewegung Baseline | 1,78/0; 1,77/1 | 1,78 | 1,69; 1,38 | 2,00; 1,80 | 1,50; – | 1,33; 1,83 |
    | Bewegung It. 1 | 1,82/0; 1,92/0 | 1,87 | 1,75; 2,00 | 1,38; 2,00 | 1,91; 1,60 | 1,50; 1,86 |

    Richtung wie erhofft (`representation-explained` steigt in allen vier Läufen von It. 1), aber n = 2 und kleine Abstände: ein Zeichen, kein Beleg. Stufe-0-Befunde: Zähler in Übungskomponenten verrät die Lösung („6 von 10 Teilen gefärbt“), Bildunterschrift wiederholt die richtige Option, Schritte von `generated` nennen nur die Regel (Baseline und It. 1), unechte Brüche als Distraktoren, Startzustand schon verändert, Streifen ohne sichtbare Beschriftung, Diagramme ohne Achsenzahlen.
  - Iteration 2, Regeln geschärft (`7c4a73f`): Zähler/Bildunterschrift in Aufgaben, sichtbare Beschriftung und Achsenzahlen, unveränderter Start, Bedienelemente auf jeder Seite erklärt, Distraktoren im Lernschritt, Datensatz mit allen Zahlen der Schritte in `generated`. Harbor-Lauf It. 2 gestartet (dieselbe Eval-Sitzung).
  - Ergebnis It. 2 (`evals/run-2026-11-04-juror-it2` `0130705`, Sonnet, n = 2): Brüche 1,87/0 und 1,81/0 (Mittel 1,84; keine Einheit auf Stufe 0), Bewegung 1,79/0 und 1,74/2 (Mittel 1,77). `early_preview` 0,5 (vorher 0), Rückfragen nach dem Plan 5 und 6 (Baseline 8,5 und 5,5). Bewegung: Bedienelement ohne sichtbare Wirkung in einer Ansicht (control-purpose 0,67), Live-Satz unter dem Regler nennt die Antwort, mehrere Lesearten eines Diagramms pro Seite.
- [ ] C7b Iteration 3 (die letzte): Regeln `7e74a39` (eine Leseart pro Seite zählen, Bedienelement ohne Wirkung sagt das, Live-Satz in den Worten der Aufgabe verrät die Antwort). Harbor-Sitzung session_016NmpwZEYHYaLmTA8WX8DSW, Ergebnis auf `evals/run-2026-11-04-juror-it3`; fragt auch, warum die Rückfragen nach dem Plan über 3 liegen.
  - Zusätzlich auf Wunsch des Nutzers (2026-11-04): dieselbe Guidance `7e74a39` mit DeepSeek V4.1 Flash in OpenCode (offenes Modell), beide Aufgaben, n = 2, Juror Sonnet. Harbor-Sitzung session_016NmpwbvbsSqFpdHpL8xdkD, Ergebnis auf `evals/run-2026-11-04-juror-it3-opencode`. Keine Baseline mit diesem Modell (nicht verlangt). Ergebnis (`evals/run-2026-11-04-juror-it3-opencode` `819792c`): nichts gemessen. OpenCode Go lehnt jede Anfrage ab („An active OpenCode Go subscription is required to use Go models.“); Agent 3,5 min, 0 Tokens, keine App. Der Nutzer muss das Abo prüfen; dann dieselben zwei Befehle. `results.ts` zählte die Läufe als gültig; jetzt schließt es sie aus („the provider refused the model“).
- [x] C8 Architektur und Doku (Strategie 7). Commit.
- [ ] C9 (offen, aus #257) Push des leeren `gh-pages`/`main` in `lernapps-github` scheitert am Pre-Push-Hook: Vorschlag `git push origin "$(git commit-tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904 -m 'chore: gh-pages')":refs/heads/gh-pages` aus dem App-Checkout statt `git switch --orphan`. In einer Probe-App ohne Hooks nicht nachstellbar; braucht eine mit `create` angelegte App. Nicht Teil der Messung.

### Completed
*None yet*

## Commit
### Entrance Criteria
- Juror geeicht, Baseline und Iterationen gelaufen und ausgewertet; Tests grün.

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
