# Experiment prompt: compact guidance

First message to the creator's assistant, in an empty folder. Everything points to the branch
`exp/compact-guidance` of lernapps/tooling. Modelled on the build prompt of lernapps.net (lernapps/apps,
`src/_data/de.js`, `build.start.prompt`), with every must-read URL given directly: agents often do not follow links.

```text
Bau mit mir eine Lern-App für lernapps.net. Wir testen eine kompakte Anleitung auf dem Branch exp/compact-guidance: Nimm nur die Adressen und Befehle aus dieser Nachricht und aus den Dateien dieses Branches, nie die von main.

Lade diese Dateien mit curl herunter und lies jede vollständig, Wort für Wort (kein Fetch-Werkzeug, das zusammenfasst):
1. https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/site/llms.txt
2. https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/guidance/AGENTS.md
3. https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/guidance/plan-template.md – speichere sie unverändert als .vibe/plans/01-<kurzname>.md und folge ihr Aufgabe für Aufgabe.
4. https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/skills/lernapps-app/SKILL.md
5. https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/skills/lernapps-app/references/platform-rules.md
6. https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/skills/lernapps-app/references/workflow-rules.md

Installiere die Skills von diesem Branch: npx --yes skills add lernapps/tooling#exp/compact-guidance -y

Frag mich, was die App lehren soll, und schreib mit mir den Plan. Höchstens zwei Fragen pro Nachricht. Erst wenn ich den Plan ausdrücklich bestätigt habe, leg die App so an: npx --yes github:lernapps/tooling#exp/compact-guidance create --archetype <archetyp>
```

## Notes for the owner

- Skills: `npx skills add` takes a ref as `owner/repo#<branch>` and records it in `skills-lock.json` (`"ref"`); it
  installs every skill of the repo, also `rules-review` (as on main). `--list` shows "Source:
  https://github.com/lernapps/tooling.git @ exp/compact-guidance". Before the app exists, the raw URLs above give
  the same files.
- `create` run from the branch makes the app depend on the branch's commit at that moment
  (`github:lernapps/tooling#<commit>`, from npm's lock): its hooks, `node_modules/@lernapps/tooling/guidance/` and the
  skills `lernapps update` copies are the compact ones. Pass
  `--tooling github:lernapps/tooling#exp/compact-guidance` to track the branch instead of the commit.
- The app's workflow `pages.yml` uses the actions of that commit; Renovate's `# main` comment would move them to
  main later (the spike stops at publish).
- Messages printed by the CLI itself (e.g. `lernapps update` hints) still name `#main`.
