# Development Plan: tooling (claude/inspiring-pascal-4i1yjy branch)

*Generated on 2026-11-24 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Die Preview eines Pull Requests an einer Explainer-App zeigt den Diff-Modus (app-templates 0.20.0, PR lernapps/app-templates#199): Der Build vergleicht die App mit der Basis des PR (`EXPLAINER_BASE`) und markiert neue, geänderte, verschobene und gelöschte Blöcke. Außerdem Bump von `@lernapps/app-templates` auf 0.20.0.

## Key Decisions
- Die veröffentlichte App darf nie Markierungen enthalten. Der Artifact `app` wird von `app-publish` genommen und von einem Push auf main wiederverwendet (checked.ts). Darum entsteht die Diff-Variante als eigener Artifact `app-preview`; `app-preview` (Preview-Action) nimmt diesen.
- `app-check` baut die Diff-Variante nach dem bestandenen Check, nur auf einem Pull Request aus demselben Repo mit Änderungsumfang `all`: Basis = erster Elternteil des Merge-Commits (`git archive HEAD^1`), `EXPLAINER_BASE=<Basis der App> npx vp build --outDir dist-diff`, nur wenn die Basis `src/app.yaml` hat. Sonst wird `dist` auch als `app-preview` hochgeladen (kein Unterschied zu heute).
- Arbeit läuft wie beim ersten Teil autonom bis zum PR (Nutzer: "Ja ... Tooling Änderung und app templates bump").

## Notes
- app-templates 0.20.0 ist als Tag v0.20.0 da, auf npm bei der ersten Abfrage noch nicht sichtbar (Registry-Verzug).
- Betroffen: `actions/app-check/action.yml`, `actions/app-preview/action.yml`, `test/app-preview.test.ts`, `test/app-check-*.test.ts`, arc42 (05, 07), `package.json` + Lockfile.

## Explore
### Tasks
- [ ] *Tasks will be added as they are identified*

### Completed
- [x] Created development plan file

## Plan
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Code
### Phase Entrance Criteria
- Der Plan steht in den Key Decisions; der Nutzer hat die Umsetzung bis zum PR bestätigt.
### Tasks
- [ ] *Alles erledigt, siehe Completed*

### Completed
- [x] `actions/app-check`: Auf einem Pull Request aus demselben Repo wird nach dem bestandenen Check die Diff-Variante gebaut (`EXPLAINER_BASE`, Basis = `HEAD^1` des Merge-Commits, nur mit `src/app.yaml` in der Basis) und als Artifact `app-preview` hochgeladen; sonst wird `dist` hochgeladen. Ein fehlgeschlagener Diff-Build warnt nur. Der Artifact `app` bleibt unverändert.
- [x] `actions/app-preview`: nimmt `app-preview` (per Muster, ohne Treffer kein Fehler), sonst `app`
- [x] Tests in `test/app-preview.test.ts` (Vertrag der Downloads, Bedingungen und Befehl des Diff-Builds, `app` unverändert)
- [x] Git-Logik an Temp-Repos geprüft (Merge-Commit, kein Merge-Commit, neuer App-Ordner ohne Basis); `shellcheck` und `actionlint` sauber
- [x] arc42: Texte zu App-Check und App-Preview
- [x] Bump `@lernapps/app-templates` 0.19.0 auf 0.20.0 (`package.json`, Lockdatei nur an den drei Zeilen, Abhängigkeiten gleich)

## Commit
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
