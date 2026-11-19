# Rules for code and configuration

An app whose content is only data (a quiz, an explainer without a component) needs these only when a finding names
one.

## `suppression-reason`: Suppress only in place, with the reason

```rule
id: suppression-reason
scope: tooling
severity: error
```

- Lint: only on the line, with the rule named and the reason after `--`:
  `// oxlint-disable-next-line lernapps/no-request-before-click -- the video loads after a click`.
- Types: only `// @ts-expect-error -- <reason>`; never `@ts-ignore` or `@ts-nocheck`.
- The review reads every suppression.

## `lockfile-matches`: Commit the lock file with every dependency change

```rule
id: lockfile-matches
scope: tooling
severity: error
```

- Change dependencies with `npm install`, never in `package.json` alone; commit `package-lock.json` with it.
- A git pin (`github:…#<commit>`) moves in both files together.

## `keep-the-preset`: Extend the preset, change nothing of it

```rule
id: keep-the-preset
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- `vite.config.ts` is `export default lernapps()`, with only the app's own settings as generated
  (`lernapps({ plugins: [quiz()] })`).
- `tsconfig.json` extends `@lernapps/tooling/tsconfig.json` as generated.
- The hooks come from the package (`prepare` in `package.json`); never replace one.
- Never turn a lint rule off or lower its severity.

## `strict-typescript`: TypeScript only, strict

```rule
id: strict-typescript
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- Every source file is TypeScript; no JavaScript files.
- Never `any`: use `unknown` and narrow it, or write the type.
- Type the creator's data; validate it at build time.

## `storage-through-wrapper`: Store only through the preset's storage

```rule
id: storage-through-wrapper
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- Only `createStorage` from `@lernapps/tooling/storage`, named after the app's id in the catalog (own prefix
  `lernapps:<id>:`, rule `own-data-only`; works when storage is blocked).
- At most 100 kB under the prefix (keys and values, 2 bytes per UTF-16 unit). Beyond, `save` returns false and the
  app keeps working.
- A setting of the learner that holds for every app or every app of the archetype: `createSettings("<id>",
  "<archetype>")`, saved only where the learner chose it (`"app"`, `"archetype"` or `"all"`); the app's own goes first.
- Keep the learning state, not growing histories.
- What only a reload must not lose, such as an answer being written, lasts while the tab is open:
  `createStorage("<id>", { type: "sessionStorage" })` (sessionStorage, same prefix and limit).
- Never `localStorage`, `sessionStorage`, IndexedDB or cookies directly.
