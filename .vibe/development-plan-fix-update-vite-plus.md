# Development Plan: tooling (fix/update-vite-plus branch)

*Workflow: minor (the workflows server was not reachable in this session; the plan file is the record)*

## Goal

`lernapps update` bricht in Apps mit `vite-plus` 1.0.0 und einer Laufzeit aus einem Git-Commit ab (npm ERESOLVE).
Betroffen: kniffel-trainer, textcheck, naturwunder-quiz, typonaut (Upgrade-Lauf lernapps/apps 42844701169).
Sie bekommen dadurch weder neue Actions noch `preview-cleanup.yml` (lernapps/tooling#275).

## Key Decisions

- `vite-plus` zieht mit der Laufzeit mit: auf die Version, mit der app-templates gebaut ist (seine devDependency, die
  es auch als Peer nennt). Eine neuere bleibt. Der Override `vite` → `@voidzero-dev/vite-plus-core@<v>` zieht mit.
- Die neuen Versionen gehen direkt in package.json (exakte Versionen bleiben exakt), dann `npm install` ohne Argumente.
- Vor dem Install vergisst der Lock die Pakete, die wandern (und was nur unter ihnen liegt). Mit ihnen im Lock behält
  npm den alten Peer-Satz und meldet ERESOLVE, obwohl dieselbe package.json ohne Lock auflöst. Alles andere bleibt
  gelockt.
- Owner hat den Fix und den Merge verlangt.

## Notes

Geprüft an einer echten Kopie von mrsimpson/kniffel-trainer: vorher ERESOLVE, nachher läuft `lernapps update` durch
(app-templates ^0.6.0, vite-plus 1.4.0, Override 1.4.0, preview-cleanup.yml angelegt).

## Explore
### Tasks
- [x] Ursache im Log des Upgrade-Laufs gefunden
### Completed
- [x] Ursache reproduziert

## Implement
### Tasks
- [x] nextToolchain, forgetLocked, Install über package.json; Tests in test/cli.test.ts
### Completed
- [x] Umsetzung

## Finalize
### Tasks
- [ ] PR, CI grün, Squash-Merge, Upgrade-Lauf in lernapps/apps erneut
### Completed
*None yet*
