# Development Plan: tooling (feat/scaffold branch)

*Generated on 2026-11-02 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Der tooling-Teil von „gezieltes Templating“ (Plan und Entscheidungen: lernapps/app-templates `.vibe/development-plan-feat-content-only-app-e2e.md`, PR lernapps/app-templates#126). `lernapps create` kopiert nur noch das Scaffold einer Vorlage (`lernapps.scaffold.<archetyp>` in der `package.json` von @lernapps/app-templates) und den Startinhalt `scaffold/<archetyp>/`. Das Beispiel bleibt in `node_modules`. Die Skills verweisen darauf.

## Key Decisions
- Entscheidungen stehen im Plan in app-templates (Nutzer, 2026-11-02). Der Nutzer erlaubt, die abhängigen PRs selbst zu mergen, und lässt ohne Stopp an den Phasengrenzen arbeiten.
- create entfernt `overrides["@lernapps/app-templates"]` aus der `package.json` der App: Die Vorlagen brauchen ihn nur in app-templates (`file:..`).
- Ohne `lernapps.scaffold` für das Archetyp bricht create mit einer Meldung ab (tooling hängt von einer exakten Version ab; ein Rückfall auf den ganzen Ordner ist nicht nötig).
- `lernapps update` bleibt unverändert.
- Abhängigkeit: `@lernapps/app-templates` auf das Release von #126 heben. Bis dahin lokal mit `LERNAPPS_TEMPLATES=/home/user/app-templates` testen.

## Notes
- Umgesetzt: `writeScaffold` in `generator/create.ts`; Override der Runtime entfernt; Skills (quiz, explainer, interactive, Verweise auf ProzentFeld) zeigen auf das Beispiel in `node_modules`; arc42 Kap. 5 (Generator); Tests in `test/create.test.ts`, `test/create.e2e.test.ts`.
- Lokal: `test/create.test.ts` mit `LERNAPPS_TEMPLATES=/home/user/app-templates` grün (17). `create.e2e` braucht das Release: die App installiert die Runtime aus der Registry.
- `@lernapps/app-templates` auf 0.2.1 gehoben (0.2.0 aus #126, 0.2.1 aus #127: `src/data` im Interactive-Scaffold, den die Architektur beansprucht). `create.e2e` grün (20). Der Test „a failing generic test of the runtime“ verändert jetzt einen Inhaltstest (`every question and its solution can be read`), weil Apps die Laufzeittests nicht mehr ausführen.
- Betroffene Tests: `test/create.test.ts`, `test/create.e2e.test.ts`, `test/app-fixture.ts` erwarten Beispielinhalt („Naturwunder“, „Prozentwert“).

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
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Commit
### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
