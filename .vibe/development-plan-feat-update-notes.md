# Development Plan: tooling (feat/update-notes branch)

*Workflow: minor (the workflows server was not reachable in this session; the plan file is the record)*

## Goal

`lernapps update` nennt, was eine App nach dem Update selbst ändern muss, als Zeile `breaking: …`. Der Update-PR
von lernapps/apps stellt diese Zeilen nach oben (eigener PR dort).

## Key Decisions

- Owner: so einfach wie möglich. Die Hinweise stehen als Liste `BREAKING` in generator/update.ts (Paket, Version,
  Text), keine eigene Datei.
- Ein Hinweis gilt, wenn das Paket in diesem Update von unter der Version auf sie oder darüber wandert (eine Version
  aus einem Git-Commit gilt als darunter).
- Erster Eintrag: vite-plus 1.4.0 löst `vitest` nicht mehr auf (textcheck#25).
- Englisch, wie die übrigen Zeilen des PRs.

## Implement
- [x] BREAKING, breakingLines, Ausgabe vor den anderen Zeilen; Test in test/cli.test.ts

## Finalize
- [ ] PR in tooling, PR in apps (upgrade-message.mjs), beide mergen
