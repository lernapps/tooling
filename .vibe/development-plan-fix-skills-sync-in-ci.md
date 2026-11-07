# Development Plan: tooling (fix/skills-sync-in-ci branch)

*Generated on 2026-11-07 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
`lernapps init` (and `lernapps skills`) scheitern unter `CI=true` seit 0.6.3: `skills experimental_sync` friert seit
`skills` 1.7.6 `skills-lock.json` in CI ein. Folge: alle PRs in lernapps/apps rot (entry-point-Test). Beheben und so
absichern, dass eine Version, die kein App starten kann, nie veröffentlicht wird (Nutzer/in: „Tooling muss rock solid
publiziert werden“).

## Key Decisions
- Autonom umsetzen (Nutzer/in, 2026-11-07: „Sorg dafür, dass das nicht mehr passieren kann“).
- Fix: `--no-frozen-lockfile` ausdrücklich übergeben; init und skills sollen den Lockfile schreiben.
- Neuer End-to-End-Test `test/init.e2e.test.ts`: `npx --package=<tarball> lernapps init` in leerem Ordner und
  `lernapps skills --archetype quiz`, je mit `CI` leer und `CI=true`.
- Release-Gate: `release.yml` führt den Test vor semantic-release aus; `test/release-gate.test.ts` prüft die
  Reihenfolge; der Test steht in `HEAVY_TESTS` des pre-push-Hooks.
- Entscheidung dokumentiert: arc42 `dec-release-starts-an-app`.

## Notes
- Ursache: Renovate #265 hob `skills` 1.7.4 → 1.7.6 (Patch, automerge); kein Test startete ein App mit `CI`.

## Reproduce
### Entrance Criteria
- Fehlermeldung aus lernapps/apps CI liegt vor.
### Completed
- [x] Created development plan file
- [x] Test `test/init.e2e.test.ts`: ohne CI grün, mit `CI=true` rot („Cannot install with --frozen-lockfile“)

## Analyze
### Entrance Criteria
- Fehler lokal reproduziert.
### Completed
- [x] `skills` 1.7.6: `frozenLockfile ?? isCI()`; init ruft `experimental_sync` ohne Option auf

## Fix
### Entrance Criteria
- Ursache bekannt.
### Completed
- [x] `--no-frozen-lockfile` in `syncSkills` (generator/init.ts)
- [x] Release-Gate in release.yml, Guard-Test, pre-push-Liste, arc42-Entscheidung

## Verify
### Entrance Criteria
- Fix und Absicherung umgesetzt.
### Completed
- [x] `test/init.e2e.test.ts` grün mit und ohne CI; `test/release-gate.test.ts` grün
- [x] pre-push (lernapps check mit den Heavy-Tests) grün

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
