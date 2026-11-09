# Development Plan: tooling (feat/cross-strand-languages branch)

Plan und Entscheidungen (KD-01 bis KD-08): lernapps/apps, `.vibe/development-plan-feat-cross-strand-languages.md`
(Issue lernapps/apps#226). Dieser Branch setzt dort die Schritte 10 bis 13 um.

## Goal
`lernapps check` und der Leitfaden kennen Einheiten-Apps (`subject`) in Fächern mit `explainerFocus: competency` und
prüfen die Voraussetzungen in der Reihenfolge der App.

## Umfang dieses Branches
- [x] 10. `check/explainer-map.ts`: `SubjectMap.explainerFocus` (fehlt es in der Karte: `strand`); `readExplainer` liest
  `strand` oder `subject`; `subjectOf` gibt das Fach und die Zeile.
- [x] 11. `competencies-on-map`: `subject` nur bei `explainerFocus: competency` (sonst Warnung); dann Bausteine aller
  Stränge erlaubt; eine Seite übt Bausteine nur eines Strangs (KD-07, Warnung).
- [x] 12. `prerequisites-linked` wird `prerequisites-in-order` (KD-03a, KD-04): Reihenfolge, Lücke, Einstieg; ein
  `recap` davor oder ein Link im Text zählen; Warnung bei `competency`, Hinweis bei `strand`.
- [x] 13. Leitfaden: `foreign-languages.md`, Skills `lernapps-explainer`, `lernapps-explainer-design`,
  `lernapps-listing`, `lernapps-content-research`, `guidance/plan-template.md`.
- [x] Tests in `test/explainer-map.test.ts` mit der Karte `test/fixtures/map/franzoesisch.json`.

## Abhängigkeit
Braucht die Karten-JSON mit `explainerFocus` aus lernapps/apps (`/apps/map/<fach>.json`). Ohne das Feld gilt
`strand`: Einheiten-Apps bekommen dann eine Warnung, Voraussetzungen nur Hinweise.
