# Development Plan: tooling (fix/275-preview-cleanup branch)

*Generated on 2026-11-10 by Vibe Feature MCP*
*Workflow: [epcc](https://codemcp.github.io/workflows/workflows/epcc)*

## Goal

Issue lernapps/tooling#275: Vorschauen geschlossener PRs sollen zuverlässig von `gh-pages` verschwinden. Mehrere
Läufe sollen sich auf `gh-pages` nicht mehr in die Quere kommen. Gilt für alle Repos, die `actions/site-preview`
nutzen (apps, docs, tooling selbst).

## Key Decisions

- KD-1 (Owner, 2026-11-10): App-Repos (`app-preview`, Generator) gehören dazu. Für Sites und Apps gilt dieselbe Lösung.
- KD-2 (Owner): Das Aufräumen ist ein wiederverwendbarer Workflow in tooling (`preview-cleanup.yml`, per
  `workflow_call`). Jedes Repo ruft ihn aus einer kleinen Datei auf: täglich (`schedule`) und von Hand
  (`workflow_dispatch`).
- KD-3 (Owner): Weg B. Keine gemeinsame `concurrency`-Gruppe. Jeder Schreiber auf `gh-pages` versucht es mehrmals:
  neuen Stand holen, eigene Änderung neu anwenden, pushen, bei Abweisung zufällig wachsend warten.
  Grund: Eine gemeinsame Gruppe kann einen wartenden Deploy von `main` still abbrechen.
- KD-4 (Owner): Autonom bis zum Pull Request in lernapps/tooling. apps und docs ändere ich nicht; die nötige
  Ergänzung (Aufruf-Datei) steht in der Doku und im PR.
- KD-5: Eigenes Skript `publish/gh-pages.ts` statt `rossjrw/pr-preview-action`. Grund: rossjrw nutzt intern
  JamesIves mit 3 Versuchen ohne Wartezeit und lässt das nicht einstellen; beim Entfernen bleibt `.nojekyll` liegen.
  Das Skript nutzt nur Node-Module und git (wie `publish/preview.ts`).
- KD-6: `site-deploy` und `app-publish` behalten JamesIves; sie bekommen `attempt-limit: 10` (JamesIves holt und
  rebased bei Abweisung schon selbst).
- KD-7: Vor dem Schreiben fragt das Skript die API, ob der PR noch offen ist; sonst entfernt es (Ursache 3).
- KD-9: tooling selbst ruft den Workflow über dessen eigene Auslöser auf (`schedule`, `workflow_dispatch` in
  `preview-cleanup.yml`); keine zweite Datei. Der Workflow ist von der Prüfung „jeder Job hängt an changes.yml“
  ausgenommen, wie `release.yml`: Er läuft nicht zu einem Push und ist keine Pflichtprüfung.
- KD-10: Im Generator steht `tooling-ref: "{{tooling}}"` in Anführungszeichen; sonst formatiert der Formatter den
  Platzhalter kaputt. `lernapps update` und das Renovate-Muster erlauben die Anführungszeichen.
- KD-11: Die Uhrzeit des täglichen Aufräumens legt jedes Repo selbst fest. Gleiche Zeiten stören sich nicht (jedes
  Repo hat sein eigenes gh-pages). Vorschlag für apps/docs: andere Minuten (z. B. `13 4`, `27 4`).
- KD-8: Kommentar von site-preview: `marocchino/sticky-pull-request-comment` mit `header: pr-preview` (dieselbe
  Kennung wie bisher bei rossjrw, so wird der alte Kommentar weiter aktualisiert).

## Notes

### Was es heute gibt (Stand 2026-11-10)

- `actions/site-preview`: baut und schreibt mit `rossjrw/pr-preview-action` (v1.8.2) nach `pr-preview/pr-<n>/`.
  Beim Schließen entfernt dieselbe Action den Ordner; `.nojekyll` bleibt (Ursache 4).
- `actions/app-preview`: gleiche Technik für App-Repos (aus dem Generator). Gleiche Fehlerklasse, aber nicht im Issue.
- `actions/site-deploy`: `JamesIves/github-pages-deploy-action`, lässt `pr-preview/` stehen.
- Nutzer von site-preview: lernapps/apps, lernapps/docs, lernapps/tooling (eigene `pr-preview.yml`).
- `concurrency` heute:
  - `pr-preview.yml` (apps, docs, tooling): `preview-<PR-Nummer>`, `cancel-in-progress: true`, auf Workflow-Ebene.
  - `pages.yml` (apps, docs, tooling): `pages-<ref>`, auf Workflow-Ebene.
  - apps `publish.yml`, Job `publish`: schon `gh-pages` auf Job-Ebene. Diesen Namen übernehmen wir.
- Ein Zeitplan (`schedule`) kann nur im aufrufenden Repo stehen, nicht in einem wiederverwendbaren Workflow.
  Wiederverwendbare Workflows von tooling gibt es schon (`changes.yml`, per `workflow_call`).

### Vorbehalt zu `concurrency`

Je Gruppe gibt es höchstens einen laufenden und einen wartenden Lauf. Kommt ein weiterer dazu, bricht GitHub den
bisher wartenden ab (auch mit `cancel-in-progress: false`). Bei einer gemeinsamen Gruppe `gh-pages` kann so eine
Vorschau oder ein Entfernen ausfallen. Darum: Gruppe nur am Job, der schreibt (kurz), und das tägliche Aufräumen
als Netz. Prüfen, ob GitHub inzwischen echte Warteschlangen bietet.

### Vorschlag zur Einordnung

In lernapps/tooling:
1. Neue Action `actions/preview-cleanup` (oder wiederverwendbarer Workflow `preview-cleanup.yml`): liest offene PRs
   per API, löscht jeden Ordner `pr-preview/pr-<n>/` (ganz, mit `.nojekyll`), dessen PR nicht offen ist; ein Commit,
   Push mit Wiederholung. Fängt Ursachen 2, 3, 4.
2. `actions/site-preview`: vor dem Schreiben prüfen, ob der PR noch offen ist; sonst entfernen statt schreiben
   (Ursache 3). Optional nach dem Entfernen den leeren Ordner ganz löschen (Ursache 4).
3. Eigene Workflows von tooling anpassen (tooling ist selbst ein Site-Repo): Job-`concurrency` `gh-pages` in
   `pr-preview.yml` und im Deploy-Job von `pages.yml`; neuer `preview-cleanup.yml` (täglich + von Hand).
4. Doku: arc42 (Bausteine, Schnittstelle), Beschreibungen der Actions, Hinweis für Site-Repos.

In den Site-Repos (apps, docs) – nur nach Freigabe, als eigener Schritt:
- Job-`concurrency` `gh-pages` (`cancel-in-progress: false`) am Job `build` in `pr-preview.yml` und am Job `deploy`
  in `pages.yml`; Workflow-Gruppe `preview-<n>` bleibt.
- Kleine Datei `preview-cleanup.yml`: `schedule` täglich + `workflow_dispatch`, ruft die tooling-Action auf.
- Renovate zieht die neue tooling-Version nach.

Offene Fragen an den Owner:
- Auch App-Repos (Generator, `app-preview`) mit einbeziehen oder eigenes Issue?
- Action oder wiederverwendbarer Workflow für das Aufräumen?
- Statt `concurrency` lieber mehr Push-Versuche (eigener Push mit fetch/rebase)?

## Explore
### Tasks
- [x] Issue lesen
- [x] site-preview, site-deploy, app-preview, eigene Workflows lesen
- [x] Workflows von apps und docs lesen (nur lesen, Klon unter /home/user/lernapps)
- [x] Einordnung mit dem Owner abstimmen

### Completed
- [x] Created development plan file

## Plan
### Tasks
- [x] Entwurf: Skript, Actions, wiederverwendbarer Workflow, Aufrufer, Doku, Tests

### Completed
- [x] Plan steht (siehe Code-Aufgaben)

## Code
### Tasks
- [x] `publish/gh-pages.ts`: Befehle `deploy --number <n> --dir <d>`, `remove --number <n>`, `cleanup`.
      Jeder Versuch: `gh-pages` flach holen (oder neu anlegen, mit `.nojekyll` an der Wurzel), Änderung anwenden,
      committen, pushen; bei Abweisung warten (zufällig, wachsend) und neu. Bis 10 Versuche. Ordner ganz löschen.
      Token über `GIT_CONFIG_*`-Umgebung, nicht in der Befehlszeile. `deploy` prüft vorher, ob der PR offen ist.
      `cleanup` liest alle offenen PRs (seitenweise) und löscht jeden `pr-preview/pr-<n>/` ohne offenen PR, in
      einem Commit. Ausgabe `result=deployed|removed|unchanged`.
- [x] Tests `test/gh-pages.test.ts`: mit lokalem Bare-Repo als Remote; gleichzeitiger Push führt zu neuem Versuch;
      ganzer Ordner weg; `cleanup` lässt offene PRs und Fremdes stehen; Branch fehlt → neu mit `.nojekyll`.
- [x] `actions/site-preview`: rossjrw ersetzen durch das Skript + sticky comment; Node immer einrichten.
- [x] `actions/app-preview`: rossjrw ersetzen; `after` nur, wenn nicht entfernt wurde; Output `base` weg.
- [x] `actions/site-deploy`, `actions/app-publish`: `attempt-limit: 10`.
- [x] `.github/workflows/preview-cleanup.yml` (`workflow_call`, Input `tooling-ref`) und Aufrufer in tooling
      (`schedule` + `workflow_dispatch`); Generator: `generator/app/.github/workflows/preview-cleanup.yml`.
- [x] Tests anpassen (`test/app-preview.test.ts`, Generator-/Renovate-Tests).
- [x] Doku: arc42 (Baustein + Schnittstelle Aufräumen, Deployment-Sicht), Beschreibungen der Actions,
      `skills/process/lernapps-github` falls nötig; Hinweis für Site-Repos (Aufruf-Datei).
- [x] `npm run check` grün (lokal Node 22; CI nutzt Node 26)
- [x] `lernapps update`: verschiebt auch `.github/workflows/...@` und `tooling-ref:`; legt `preview-cleanup.yml` in
      bestehenden Apps mit Vorschau an

### Completed
- [x] Alle Code-Aufgaben

## Commit
### Tasks
- [x] Branch zu einem Commit zusammenfassen (squash), pushen
- [x] Pull Request in lernapps/tooling anlegen: #277 (Owner hat es verlangt); darin: was apps und docs ergänzen müssen
- [x] CI rot (actionlint SC2086 in preview-cleanup.yml) behoben
- [x] Owner gibt Merge frei (Squash-Merge)
- [ ] Nach dem Merge, nicht hier: in apps und docs je eine `preview-cleanup.yml` (Aufruf-Datei), nur mit Freigabe

### Completed
*None yet*



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
