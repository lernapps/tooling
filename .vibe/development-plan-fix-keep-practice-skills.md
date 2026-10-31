# Development Plan: tooling (fix/keep-practice-skills branch)

*Generated on 2026-10-31 by Vibe Feature MCP*
*Workflow: [bugfix](https://codemcp.github.io/workflows/workflows/bugfix)*

## Goal
`lernapps update` soll die Skills `lernapps-practice-*` (aus lernapps/practice) und ihre Einträge in `skills-lock.json` nicht entfernen. Alle anderen Skills verhalten sich wie bisher. Ein Test deckt den Fall ab. Prüfen, ob weitere Präfixe oder Quellen denselben Fehler auslösen, und die einfachste allgemeine Regel wählen.

## Key Decisions
- Arbeit auf Branch `fix/keep-practice-skills`. Der Nutzer hat danach einen Commit und einen Pull Request verlangt.

- Regel: Ein `lernapps-*`-Skill bleibt stehen, wenn sein Eintrag in `skills-lock.json` eine andere `source` als `lernapps/tooling` nennt. Ohne Eintrag oder mit Quelle `lernapps/tooling` gilt er als unser und wird wie bisher ersetzt oder entfernt. Begründung: Die Lock-Datei ist die Quelle der Wahrheit, die `npx skills add` selbst schreibt. Eine Zeile deckt alle Präfixe und Repos ab, und es gibt keine Präfixliste zu pflegen. Verworfen: feste Ausnahme für `lernapps-practice-`, weil sie das nächste Repo wieder vergisst. Restrisiko: Fehlt der Lock-Eintrag, wird ein Practice-Skill weiter entfernt; `npx skills add` legt ihn aber immer an.
- Doku: arc42 Kap. 5 (Generator CLI) um den Satz ergänzen, dass Skills aus anderen Quellen stehen bleiben.

## Notes
- Der bestehende Test hat Skills ohne Lock-Eintrag (`lernapps-gone`, `lernapps-explainer`), die entfernt werden müssen. Eine Regel „nur entfernen, was in der Lock-Datei auf lernapps/tooling zeigt“ bräuchte also die Zusatzregel „ohne Eintrag gilt als unser“.
- Fehlerstelle: `generator/update.ts`, `replaceSkills`, Liste `removed` (`present.filter(name => !ours.includes(name))`). `present` enthält jeden `lernapps-*`-Skill.
- Die Aufgabe kam als Systembenachrichtigung, nicht als Nutzernachricht. Phasenübergänge brauchen trotzdem die Bestätigung des Nutzers.

## Reproduce
Entrance: Branch angelegt, Plan vorhanden.
### Tasks

### Completed
- [x] Created development plan file
- [x] Vorhandene Tests gefunden: `test/cli.test.ts` (drei Tests zu `replaceSkills`); `npm ci --ignore-scripts` installiert die Abhängigkeiten, Lauf mit `npx vp test run test/cli.test.ts`
- [x] Fehler reproduziert: neuer Test „leaves the lernapps-practice-* skills …" schlägt fehl; die Ausgabe meldet `removed lernapps-gone, lernapps-practice-explore, …`

## Analyze
Entrance: Fehler reproduziert.
### Tasks

### Completed
- [x] Architektur geprüft: `docs/arc42/05-building-blocks.arc42.md` (Generator CLI, Zeile 637) sagt „replaces the app's `lernapps-*` skills with its own; the app's own skills stay as they are". Die Skills von lernapps/practice sind keine eigenen Skills des Tooling und keine Skills der App; der Vertrag nennt sie nicht. Der Satz muss um sie ergänzt werden. Die Skills pdt und arc42-language sind hier nicht installiert; die Doku wurde direkt gelesen.
- [x] Andere Präfixe/Quellen: Der Fehler trifft jeden `lernapps-*`-Skill aus einem anderen Repo (Code kennt nur `SKILL_PREFIX = "lernapps-"`). Im Repo kommt sonst nur `lernapps-practice-*` vor.
- [x] Regel gewählt (siehe Key Decisions)

## Fix
Entrance: Ursache und Regel entschieden.
### Tasks

### Completed
- [x] `replaceSkills` ändert: `present` enthält nur `lernapps-*`-Skills, deren Lock-Eintrag keine fremde Quelle nennt; Konstante `TOOLING_SOURCE`
- [x] arc42 Kap. 5 (Generator CLI) ergänzt

## Verify
Entrance: Fix umgesetzt.
### Tasks

### Completed
- [x] Typecheck (`tsc`), Lint und Format sauber; `test/cli.test.ts`, `conventions`, `architecture`: 35 Tests grün, darunter der neue Test

## Finalize
Entrance: Verifikation grün.
### Tasks

### Completed
- [x] Doku (arc42 Kap. 5) angepasst, aufgeräumt (keine Debug-Reste)
- [x] Committet (inkl. `.vibe`) und auf `fix/keep-practice-skills` gepusht
- Auf Bitte des Nutzers: Commits zu einem gesquasht und Pull Request angelegt.



---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
