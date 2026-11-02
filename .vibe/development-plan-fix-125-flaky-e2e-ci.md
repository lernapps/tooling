# Development Plan: tooling (fix/125-flaky-e2e-ci branch)

*Generated on 2026-11-02 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
Issue lernapps/app-templates#125: Die e2e-Tests einer App scheitern in CI immer wieder an genau einem Test mit 30 s Timeout. Ziel:
1. Ein einzelner, vorübergehender Timeout in CI macht die App-Prüfung nicht mehr rot (Retries). Echte Fehler bleiben rot, wackelige Tests bleiben sichtbar.
2. Nach dem Merge eines Pull Requests prüft CI auf `main` nicht noch einmal denselben Stand, den der Pull Request schon geprüft hat.

Danach (nur Antwort, keine Änderung): Was läuft pre-commit/pre-push und was davon dauert lange?

## Key Decisions
- Der Nutzer hat Punkt 1 und 2b beauftragt und Commit und Push freigegeben. Ich arbeite bis zum Push ohne Stopp an den Phasengrenzen. Kein Pull Request.
- Retries: `retries: process.env.CI ? 2 : 0` in `archetypes/shared/playwright.ts`. Lokal keine Retries, damit wackelige Tests beim Entwickeln auffallen. Playwright zählt einen Test, der erst im zweiten Versuch besteht, als „flaky“, nicht als „passed“; `spec.ok` ist dann true, `lernapps check` besteht.
- Worker bleiben bei `75%`: Playwright rechnet `max(1, floor(Kerne × 0,75))`. Ein Runner mit 2 Kernen hat also schon nur 1 Worker. Die Vermutung im Issue („starke Parallelität auf 2 Kernen“) trifft so nicht zu; weniger Worker würden nichts ändern.
- 2b (kein zweiter Lauf nach dem Merge), in der Action `app-check`:
  - Ein Pull Request aus demselben Repo lädt nach einer bestandenen Prüfung zusätzlich das Artefakt `lernapps-checked-<tree>` hoch (der Prüfbericht). `<tree>` ist der Tree-Hash des geprüften Stands (`git rev-parse HEAD^{tree}`; beim Pull Request der Merge-Commit `refs/pull/N/merge`).
  - Ein Push auf `main` sucht über die API ein Artefakt `lernapps-checked-<tree>` mit seinem eigenen Tree, das nicht abgelaufen ist und aus einem Lauf dieses Repos stammt (`workflow_run.head_repository_id` = Repo-ID). Findet er eines, übernimmt er aus diesem Lauf die Artefakte `app` und den Bericht und prüft nicht noch einmal. Sonst prüft er wie bisher.
  - Der Tree-Hash deckt alles ab, was das Ergebnis bestimmt: Inhalt, `package-lock.json` (Tooling- und Runtime-Version) und die Workflow-Datei (Version der Action). Gleicher Tree heißt gleicher Stand. Er ist gleich, wenn der Pull Request beim Merge auf dem Stand von `main` war (Squash oder Merge-Commit).
  - Sicherheit: Nur Läufe aus diesem Repo zählen. Ein Fork kann in seinem Lauf ein Artefakt mit beliebigem Namen hochladen; er darf das Ergebnis nicht liefern.
  - Rechte: Das Lesen der Artefakte braucht `actions: read`. Die Vorlage `generator/app/.github/workflows/pages.yml` bekommt das im Job `app`. Bestehende Apps haben es nicht (`lernapps update` setzt nur die Refs der Actions). Fehlt das Recht, prüft die Action wie bisher und nennt in einem Hinweis die Zeile, die fehlt.
  - Verworfen: `actions/cache`. Ein Cache aus einem Pull Request ist auf `main` nicht lesbar (Cache-Scope von GitHub).
  - Das Repo app-templates bekommt 2b nicht: Sein CI braucht etwa 2 Minuten und hat kein Bundle zu übernehmen.

## Notes
- Die e2e-Tests ruft `src/cli.ts` (`runEndToEndTests`) mit `playwright test --reporter=line,json` auf; `failingRuntimeTests` liest `spec.ok`.
- `actions/download-artifact` kann mit `run-id` und `github-token` Artefakte eines anderen Laufs laden.
- Messung (4 Kerne, also 3 Worker): Die Quiz-Vorlage hat 54 e2e-Tests, `lernapps check --pre-push` braucht 15 s. Mit der Fixture mit 64 Fragen sind es 264 Tests und 52 s; davon entfällt fast alles auf die e2e-Tests. `vp check`, die Unit-Tests, der Build und arc42 brauchen je 1 bis 2 s. `--pre-commit` braucht 2,5 s.
- Pro Frage gibt es 3 Tests, jeder in 2 Projekten (desktop, 360px), also 6 Tests pro Frage. 890 Tests entsprechen etwa 148 Fragen.
- Wahrscheinliche eigentliche Ursache von #125: Der Test „all right answers give the full score, then the solutions show“ (app-templates `runtime/quiz/e2e.ts`, Zeile 112) geht in einem einzigen Test durch alle Fragen und hat das Standard-Timeout von 30 s. Seine Dauer wächst mit der Zahl der Fragen; bei etwa 148 Fragen auf einem langsamen Runner kommt er nahe an 30 s. Die Retries sind deshalb nur ein Pflaster. Folgearbeit in app-templates: das Timeout solcher Durchlauf-Tests mit der Zahl der Fragen skalieren (`test.setTimeout`).

## Reproduce
Entrance: Branch `fix/125-flaky-e2e-ci` angelegt, Plan vorhanden.
### Tasks

### Completed
- [x] Created development plan file
- [x] Fehlerbild aus dem Issue übernommen: in CI 889 von 890 Tests bestanden, jedes Mal ein anderer Test mit 30 s Timeout; lokal immer grün. Ein lokaler Nachbau mit 2 Kernen ist nicht verlässlich (der Fehler ist selten und lastabhängig); ein Test prüft stattdessen die Konfiguration.

## Analyze
Entrance: Fehlerbild bekannt.
### Tasks

### Completed
- [x] Ursache: `retries` fehlt in der gemeinsamen Playwright-Konfiguration; ein einzelner Timeout macht die Prüfung rot.
- [x] Worker-Rechnung von Playwright geprüft (siehe Key Decisions).
- [x] Doppelter Lauf: `pages.yml` prüft auf `main` nach dem Merge alles noch einmal. Lösung siehe Key Decisions.

## Fix
Entrance: Ursache und Lösung entschieden.
### Tasks

### Completed
- [x] `archetypes/shared/playwright.ts`: `retries: process.env.CI ? 2 : 0`
- [x] `actions/app-check/checked.ts`: sucht auf `main` den Lauf mit demselben Tree (nur dieses Repo, nicht abgelaufen, neuester); scheitert nie, sondern prüft dann
- [x] `actions/app-check/action.yml`: Tree ermitteln, Lauf suchen, Bundle und Bericht übernehmen, Prüfschritte überspringen; Pull Request lädt `lernapps-checked-<tree>` hoch; Ausgabe `reused`
- [x] `generator/app/.github/workflows/pages.yml`: Job `app` mit `actions: read`
- [x] arc42 Kap. 5 (App check action) um die Übernahme ergänzt
- [x] Tests: `test/app-check-checked.test.ts`

## Verify
Entrance: Änderungen umgesetzt.
### Tasks

### Completed
- [x] `vp check` grün; `arc42 validate --strict` ohne Fehler und Warnungen
- [x] Schnelle Tests (ohne `*.e2e.test.ts`): 334 bestanden, darunter die Gate-Prüfung der Action in `test/changes.test.ts`
- [x] Nicht lokal prüfbar: der echte API-Aufruf und `download-artifact` mit `run-id`. Das zeigt sich erst beim ersten Merge einer App mit `actions: read`.

## Finalize
Entrance: Verifikation abgeschlossen.
### Tasks

### Completed
- [x] Kein Debug-Code, keine TODOs; Doku (Action-Beschreibung, pages.yml, arc42) beschreibt den Endzustand
- [x] Commit und Push auf `fix/125-flaky-e2e-ci`



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
