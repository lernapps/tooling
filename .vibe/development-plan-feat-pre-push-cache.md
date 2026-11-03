# Development Plan: tooling (feat/pre-push-cache branch)

*Generated on 2026-11-03 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal
Der Pre-push dauert lange, vor allem wenn mehrere Agenten denselben Stand mehrfach prüfen. Ziel ist ein schnellerer Hook bei gleicher Sicherheit. Agenten, die mit dem Creator Apps bauen, dürfen in der CI nicht von Fehlern überrascht werden: Der Hook einer App prüft weiter alles, was die CI prüft.

Umfang (vom Nutzer beauftragt, im Repo tooling):
1. **Zeiten messen:** `lernapps check` hält fest, wie lange jeder Schritt braucht.
2. **Ergebnis-Cache:** Ein bestandener Lauf für denselben Stand wird wiederverwendet und nicht wiederholt.
3. **Sperre:** Parallele Läufe in einem Clone warten aufeinander. Der zweite nutzt dann das Ergebnis des ersten.

Nicht im Umfang: Anleitung in den Skills (Vorschlag 5), andere Strenge je Repo (Vorschlag 4), Änderungen in app-templates und apps.

## Key Decisions
*Vorschläge aus der Explore-Phase, in der Plan-Phase mit dem Nutzer bestätigen:*
- Alles kommt in `lernapps check` (Baustein `bb-check-cli`). Damit wirkt es überall, wo der Befehl läuft: im Hook jeder App, im Pre-push von tooling (`scripts/pre-push.ts` ruft `lernapps check` auf) und in den Template-Ordnern von app-templates (`lernapps check --pre-push`). Die Apps bekommen es mit der nächsten Version des Pakets.
- **Zeiten nicht in den Prüfbericht.** Laut Architektur ist der Bericht deterministisch: gleiche Eingabe, gleicher Bericht. Zeiten würden das brechen. Sie kommen deshalb in eine eigene Datei `node_modules/.cache/lernapps/timings.json` (letzter Lauf) und als eine Zeile je Schritt auf stderr bzw. ins Log des Hooks.
- **Cache-Schlüssel**, ein Hash über:
  - den Tree-Hash von `HEAD`,
  - den Ordner relativ zur Wurzel des Repos (app-templates prüft Unterordner),
  - die geprüften Teile (`pre-commit`, `pre-push`),
  - die Version von `@lernapps/tooling` und von Node,
  - den Inhalt von `node_modules/.package-lock.json` (den installierten Stand),
  - alle Umgebungsvariablen `LERNAPPS_*` (z. B. `LERNAPPS_TESTS=fast` im Pre-push von tooling; ein schneller Lauf darf keinen vollen ersetzen).
- **Ein Treffer gilt nur bei sauberem Arbeitsbaum** (`git status --porcelain` leer, ungetrackte Dateien zählen mit). Grund: Der Check prüft den Arbeitsbaum, nicht den Commit.
- Nur **bestandene** Läufe kommen in den Cache. Ein Treffer gibt den gespeicherten Bericht aus, schreibt ihn wie gewohnt nach `node_modules/.cache/lernapps/validation-report.yaml` und sagt in der einen Zeile, dass das Ergebnis wiederverwendet ist. Zähler im Plan (`prePushFailures`, `failedChecks`) ändern sich nur bei Fehlern, also nicht bei einem Treffer.
- **Ort von Cache und Sperre:** `<git common dir>/lernapps/` (bei einem normalen Clone `.git/lernapps/`). Worktrees eines Clones teilen ihn. `node_modules` gehört dagegen jedem Worktree einzeln. Der Cache behält nur die letzten Einträge (z. B. 20).
- **Kein Cache in der CI** (`CI` gesetzt) und keiner mit einer neuen Option `--no-cache`. Die neue Option ist eine Erweiterung der stabilen Schnittstelle (`concept-stable-contracts`) und kommt in die Hilfe.
- **Sperre:** ein Ordner `<git common dir>/lernapps/check.lock`, angelegt mit `mkdir` (atomar), darin PID und Rechnername. Ein zweiter Lauf wartet, gibt einmal eine Zeile aus („wartet auf lernapps check, PID …“) und schaut danach zuerst in den Cache. Eine Sperre, deren Prozess auf diesem Rechner nicht mehr lebt, wird übernommen. Sie gilt für alle Worktrees eines Clones und damit auch gegen parallele Browser-Last. Getrennte Clones bleiben parallel.
- Die Sperre gilt nur für Läufe in einem Repo, nicht für `lernapps check <dir|url>`.
- Vom Nutzer bestätigt: Der Cache gilt immer, auch bei einem Lauf von Hand (`--no-cache` umgeht ihn). Die Sperre gilt für alle Worktrees eines Clones.
- **Gegen „works on my machine“:** Der Check meldet einen Befund, wenn die Hauptversion von Node nicht die der CI ist (`node-version: 26` in `actions/app-check/action.yml`). Nur die Hauptversion, wie vom Nutzer gewünscht.
- Node-Version: `package.json` erlaubt `^22.18.0 || ^24.11.0 || >=26.0.0`. Eine andere Hauptversion als die der CI ist also erlaubt. Darum nur eine **Warnung** (Regel `checks-pass`), kein Fehler. Die Hauptversion der CI steht als Konstante im Code; ein Test prüft, dass sie zu `actions/app-check/action.yml` passt.
- **Installierte Pakete gegen `package-lock.json`** (vom Nutzer beauftragt): Für jedes Paket in `package-lock.json` (`packages`, außer `""`) die Version in `node_modules/<pfad>/package.json` lesen und vergleichen. Ein fehlendes optionales Paket (`optional: true`) zählt nicht. Abweichung oder fehlendes Paket: **Fehler** (Regel `checks-pass`), Fix: `npm ci`. Diese Prüfung läuft zuerst; bei einem Fehler laufen die übrigen Schritte nicht, denn ihr Ergebnis wäre nichts wert. Grenze: ein Git-Paket mit neuem Commit, aber gleicher Version, bleibt unerkannt.
- **Verworfen:** `npm ci --dry-run` und `node_modules/.package-lock.json`. Test im Explore: Der Dry Run schreibt `node_modules/.package-lock.json` neu (mit den Versionen der Lock-Datei, obwohl nichts installiert wurde). Danach melden `npm ci --dry-run` und `npm ls` „aktuell“, obwohl die alte Version installiert ist.
- Der Cache-Schlüssel nimmt deshalb die echten installierten Versionen (dieselbe Liste wie die Prüfung) statt `node_modules/.package-lock.json`.
- **Architektur:** Eine neue Entscheidung in `docs/arc42/09-decisions.arc42.md`: „Ein bestandener Check desselben Stands wird nicht wiederholt“. Sie ergänzt `dec-one-check-command`; Hook und CI prüfen weiterhin dasselbe. Dazu kommt ein Satz bei `bb-check-cli`/`if-check-cli` (neue Option, Cache, Sperre).

## Notes
- Messung in tooling (4 Kerne, Node 22), voller Check wie im Pre-push mit allen Tests:
  - alter Stand: 601 s (teilweise parallel zu meinen Tests; ein Test scheiterte daran an einem Port-Konflikt)
  - neuer Stand, Hook beim Push: 553 s; davon Unit-/e2e-Tests 545 s, Format/Lint/Typen 3 s, Build 0,8 s, Prüfung der installierten Pakete 0,03 s
  - derselbe Stand noch einmal: 1,2 s („already checked“)
  - Fazit: Fast die ganze Zeit sind die Tests (in tooling die schweren e2e-Tests). Weitere Beschleunigung müsste dort ansetzen.
- Code-Phase, Abweichungen vom Plan:
  - Die Node-Warnung ist **keine Befund-Zeile im Bericht**, sondern eine Zeile auf stderr. Grund: Der Bericht soll für denselben Stand überall gleich sein (wie bei den Zeiten). Außerdem würde jede Warnung den YAML-Bericht ausgeben statt der einen Zeile, auf jedem Rechner mit Node 22 oder 24 bei jedem Push.
  - Ein Treffer im Cache setzt `checked.commit` auf den aktuellen Commit (gleicher Tree, evtl. anderer Commit nach Amend oder Rebase).
  - Die Prüfung der installierten Pakete läuft auch im Pre-commit (kostet Millisekunden; Lint und Typen hängen auch an den Paketen).
- Panne beim Messen: Ein Worktree mit verlinktem `node_modules` hat das `node_modules` des Haupt-Clones geleert. Danach `npm ci` neu. Der Messlauf des alten Stands lief teilweise parallel zu meinen Tests; seine Zeit ist darum eher zu hoch.
- Messung aus `development-plan-fix-125-flaky-e2e-ci.md` (4 Kerne, Quiz-Vorlage): `lernapps check --pre-push` 15 s, davon fast alles e2e-Tests. Mit 64 Fragen 52 s. `vp check`, Unit-Tests, Build und arc42 je 1 bis 2 s, `--pre-commit` 2,5 s. Die Zeitmessung (1) liefert solche Zahlen künftig bei jedem Lauf.
- Relevanter Code:
  - `src/cli.ts`: `check()` (Ablauf, Bericht schreiben), `checkProject()` (Schritte, Browser-Checks, Playwright), `runStep()`/`stepFindings()`, `commitOrDirectory()`, `REPORT`.
  - `changes/changes.ts`: `readStdin`, `pushedFiles`, `classifyPush` (Änderungsumfang vor dem Hook).
  - `scripts/pre-push.ts` (tooling): ruft `npm run lernapps -- check` mit `LERNAPPS_PRE_PUSH=1` und ggf. `LERNAPPS_TESTS=fast`.
  - `archetypes/shared/hooks/pre-push` (Apps): `lernapps check --pre-push`.
- Architektur: `dec-one-check-command`, `dec-tooling-pre-push`, `dec-change-scope`, `dec-report-per-commit`, Konzept `concept-terse-output`, Qualitätsziel `qg-few-iterations`.
- Einschränkung (bleibt wie heute): Der Hook prüft den Arbeitsbaum. Wer einen anderen Branch als `HEAD` pusht, prüft trotzdem `HEAD`.

## Explore
### Phase Entrance Criteria:
- [x] Der Nutzer hat den Umfang beauftragt (Vorschläge 3, 1 und 2 im Repo tooling).

### Tasks

### Completed
- [x] Created development plan file
- [x] Hooks in tooling, app-templates und apps gelesen
- [x] `lernapps check` (Ablauf, Schritte, Bericht) und den Änderungsumfang gelesen
- [x] Passende Entscheidungen und Bausteine in `docs/arc42` gefunden
- [x] Entwurf für Cache-Schlüssel, Sperre und Zeitmessung festgehalten (Key Decisions)
- [x] Abweichungen lokal/CI untersucht: Node-Hauptversion, installierte Pakete
- [x] `npm ci --dry-run` getestet und verworfen

## Plan
### Phase Entrance Criteria:
- [x] Der betroffene Code und die Architektur sind bekannt.
- [x] Die Entwurfsentscheidungen stehen unter Key Decisions.
- [x] Der Nutzer hat der Explore-Phase zugestimmt.

### Umsetzungsplan

**Gilt für welche Läufe:** Cache und Sperre gelten für jeden Lauf von `lernapps check` in einem Repo, der den schweren Teil enthält (`--pre-push` oder ohne Flag). Nicht für `--pre-commit` allein: Der prüft den Index, nicht `HEAD`, und ist schnell (2,5 s). Ein Commit soll nicht minutenlang hinter einem Push warten. Nicht für `lernapps check <dir|url>`.

**Ablauf eines Laufs im Repo (schwerer Teil):**
1. Änderungsumfang wie heute (`hookScope`). Bei „nichts zu prüfen“ endet der Lauf wie heute.
2. Installierte Pakete gegen `package-lock.json` prüfen. Abweichung: Fehler, keine weiteren Schritte.
3. Cache-Schlüssel bilden (nur bei sauberem Arbeitsbaum, ohne `CI`, ohne `--no-cache`). Treffer: gespeicherten Bericht übernehmen, fertig.
4. Sperre holen. Wartet der Lauf, eine Zeile auf stderr. Nach dem Warten Schritt 3 noch einmal.
5. Prüfen wie heute; jeder Schritt mit Dauer.
6. Bestanden und Schlüssel unverändert (Arbeitsbaum während des Laufs nicht geändert): Bericht in den Cache.
7. Sperre freigeben, auch bei Abbruch (Handler für `exit`, `SIGINT`, `SIGTERM`).

**Ausgabe (Konzept `concept-terse-output`, bleibt eine Zeile bei Erfolg):**
- Bestanden: `lernapps check: ok, 12 rules, no findings (commit abc1234) in 48 s`.
- Treffer im Cache: `lernapps check: ok, 12 rules, no findings (commit abc1234), already checked at 08:41 (--no-cache checks again)`.
- Die Dauer je Schritt steht in `node_modules/.cache/lernapps/timings.json` (letzter Lauf): Schritt, Sekunden, Gesamtzeit. Nicht im Bericht (deterministisch).
- Node-Hauptversion anders als in der CI: Befund mit Schwere `warning` im Bericht. Der Bericht wird bei Befunden ausgegeben, also auch bei einer Warnung; das ist das bestehende Verhalten.

**Module:**
- `check/installed.ts` (neu): `installedProblems(dir)` vergleicht `package-lock.json` (`packages`, ohne `""`) mit `node_modules/<pfad>/package.json`; fehlendes optionales Paket zählt nicht; Links (`link: true`, Workspaces) zählen nicht. `installedVersions(dir)` liefert die Liste für den Schlüssel. `nodeMajorProblem()` vergleicht `process.versions.node` mit `CI_NODE_MAJOR`.
- `check/cache.ts` (neu): `cacheKey(...)`, `cachedReport(key)`, `storeReport(key, yaml)` (behält die letzten 20), `acquireLock()`/`release` mit `mkdir` in `<git common dir>/lernapps/`, verwaister Lock (PID lebt nicht, gleicher Rechner) wird übernommen; Warten in Schritten von 1 s.
- `src/cli.ts`: Ablauf oben einbauen; `runStep`/`stepFindings` und die Browser-Schritte messen die Dauer; `timings.json` schreiben; Ausgabezeile erweitern.
- `src/usage.ts`: Option `--no-cache`; Hilfe beschreibt Cache, Sperre, Zeiten, Prüfung der installierten Pakete und der Node-Version.

**Tests:**
- `test/installed.test.ts`: passend, andere Version, fehlendes Paket, fehlendes optionales Paket, verschachteltes Paket (`node_modules/a/node_modules/b`), Link.
- `test/check-cache.test.ts` (temporäres Git-Repo): gleicher Stand gleicher Schlüssel; anderer Tree, Ordner, Teil, `LERNAPPS_*`, installierte Version → anderer Schlüssel; unsauberer Baum (geändert, ungetrackt) → kein Schlüssel; `CI` → kein Schlüssel; Aufräumen auf 20; Sperre: zweiter wartet, verwaiste wird übernommen, Worktree teilt sie.
- Test, dass `CI_NODE_MAJOR` zu `node-version` in `actions/app-check/action.yml` passt.
- `test/cli.test.ts`: Hilfe nennt `--no-cache` (bestehender Test `expectEveryOption`).
- `test/check-repo.e2e.test.ts`: zweiter Lauf auf demselben Stand meldet „already checked“ und startet keinen Build; nach einer Änderung prüft er neu; mit veraltetem `node_modules` ein Fehler mit `npm ci`.

**Doku:**
- `docs/arc42/09-decisions.arc42.md`: neue Entscheidung „A passing check of the same state is not repeated“ (Kontext, Entscheidung, Folgen; addresses `qg-few-iterations`), Verweis aus `dec-one-check-command` nicht nötig, sie ergänzt sie.
- `docs/arc42/05-building-blocks.arc42.md`: bei `bb-check-cli` und `if-check-cli` je ein Satz zu Cache, Sperre, Zeiten und der Prüfung der Umgebung.
- Nicht: Skills (Vorschlag 5, später).

### Tasks
- [x] Ablauf, Module, Tests und Doku planen

### Completed
- [x] Umsetzungsplan geschrieben

## Code
### Phase Entrance Criteria:
- [x] Der Plan nennt die Module, Tests und Doku-Änderungen.
- [x] Der Nutzer hat dem Plan zugestimmt.

### Tasks
- [x] Abhängigkeiten installieren (`npm ci`), Ausgangszeit von `lernapps check` messen
- [x] `check/environment.ts` (statt `check/installed.ts`: installierte Pakete und Node-Version) mit Tests
- [x] `check/cache.ts` (Schlüssel, Cache, Sperre) mit Tests
- [x] Zeiten je Schritt und `timings.json` in `src/cli.ts`
- [x] Ablauf in `src/cli.ts` einbauen, `--no-cache` in `src/usage.ts`
- [x] e2e-Test in `test/check-repo.e2e.test.ts`
- [x] arc42: Entscheidung und Bausteine
- [x] `lernapps check` des Repos besteht (Pre-push-Hook beim Push, 553 s, alle Tests grün)

### Completed
*None yet*

## Commit
### Phase Entrance Criteria:
- [x] Alle Code-Aufgaben sind erledigt.
- [x] `lernapps check` besteht, die neuen Tests laufen.

### Tasks

### Completed
- [x] Aufräumen: keine Debug-Ausgaben, keine TODOs im neuen Code
- [x] Doku geprüft: arc42 (`dec-check-cache`, `bb-check-cli`, `if-check-cli`) und die Hilfe von `lernapps check` beschreiben den Endstand
- [x] Commits des Branches zu einem zusammengefasst
- [x] Pull Request geöffnet



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
