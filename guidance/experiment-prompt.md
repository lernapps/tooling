# Experiment prompt: compact guidance

First message to the creator's assistant, in an empty folder. Everything points to the branch
`exp/compact-guidance` of lernapps/tooling. Modelled on the build prompt of lernapps.net (lernapps/apps,
`src/_data/de.js`, `build.start.prompt`), with only the entry point given: the plan template names every skill when its phase needs it.

```text
Bau mit mir eine Lern-App für lernapps.net. Wir testen eine kompakte Anleitung auf dem Branch exp/compact-guidance: Nimm nur die Adressen und Befehle aus dieser Nachricht und aus den Dateien dieses Branches, nie die von main.

Lade diese Datei mit curl herunter und lies sie vollständig, Wort für Wort (kein Fetch-Werkzeug, das zusammenfasst), und folge ihr:
https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/site/llms.txt

Frag mich, was die App lehren soll, und schreib mit mir den Plan.
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
