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
- Statt linearer Algebra (gemeint: Oberstufe; nicht auf der Karte) Beschleunigung in Physik (Nutzer, 2026-11-03). Vorschlag aus der Karte `map/physik.yaml`, Strang `mechanik`, Klasse 9–10: `geschwindigkeitsaenderung` (qualitativ: beschleunigen, bremsen, Richtung) und `bewegungsdiagramme` (Weg-Zeit- und Geschwindigkeit-Zeit-Diagramm). Quantitative Beschleunigung (a = Δv/Δt, Oberstufe) steht nicht auf der Karte. Noch zu bestätigen.
- Workflow epcc; Feature-Zweig `feat/explainer-learning-juror`.

## Notes
- Ausgangsanalyse (Sitzung 2026-11-03): Evals messen nur den Prozess (`evals/expectations.json`); Inhalte beurteilt nur der Review beim Listing (`review/rubric.md`, `review/archetypes/explainer.md`). Die simulierte Ersteller-Persona gibt keine didaktische Kritik, eine schwache App erhält daher gute Eval-Werte.
- Noch gültig auf `main`: starre Abschnittstitel in `lernapps-explainer-design`, `early-preview` ohne Checkpoint, kein Theme-/Klassen-Leitfaden in `components.md`, `git switch --orphan` + Pre-Push-Hook in `lernapps-github` (Schritte 4/5).
- Skizze der Kriterien (K1–K10): Lernschritt pro Seite, Einstieg/Begriffe, Bedeutung der Darstellung (5 Fragen), Text–Bild-Übereinstimmung, Bedienelement mit Zweck, Bildsprache, Übung verrät nichts, Übung passt zum Schritt, Erklärung mit Inhalt, ehrliche Überschriften. Skala 0–2 (unklar/teilweise/klar), Blocker getrennt, Beleg je Bewertung.
- Lernlandkarte: `lernapps/apps` `map/mathematik.yaml`; liefert `gradeBand` und `requires` als Maßstab für „Vorwissen“.

## Explore
### Entrance Criteria
- Nutzer hat das Vorhaben beschrieben.

### Tasks
- [ ] Physik-Bausteine bestätigen lassen (Vorschlag unter Key Decisions).
- [ ] Mit dem Nutzer klären: wie unveröffentlichte Guidance in Evals getestet wird (siehe Befund E3).
- [ ] Mit dem Nutzer klären: Modell(e) unter Test, Läufe pro Zelle, Budget.

### Completed
- [x] Created development plan file
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

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Code
### Entrance Criteria
- Rubrik, Juror-Aufbau, Eichverfahren, Eval-Aufgaben und Iterationsablauf sind geplant und vom Nutzer bestätigt.

### Tasks
- [ ] *To be added when this phase becomes active*

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
