# Tooling rules

Checks and preset of `@lernapps/tooling`.

## Checks

### `checks-pass`: Run the checks before you push

```rule
id: checks-pass
scope: tooling
severity: error
```

- `lernapps check` before every push (the hooks run it too): format, lint, types, unit tests, build, built-app
  checks, end-to-end tests.
- A failure names the step: fix from its output. CI runs the same command; its report is the artifact
  `validation-report`.
- A runtime test (`@lernapps/app-templates`) fails while your content validates = template bug:
  - tell the creator; issue at <https://github.com/lernapps/app-templates/issues> with
    `node_modules/.cache/lernapps/validation-report.yaml` (or ask the creator to);
  - never change tests or config to get around it;
  - `npm update` changes nothing (pinned); after the fix: `npx --yes github:lernapps/tooling#exp/compact-guidance update`,
    `npx lernapps check`, commit.
- Link with HTTP 429 → "not checked", hint, fails nothing. Tell the creator which; go on.

### `fix-from-message`: Fix failed checks, never bypass them

```rule
id: fix-from-message
scope: tooling
severity: error
```

- Read the message, fix the cause.
- Failed commit: one line names the step and `node_modules/.cache/lernapps/pre-commit.log`; read that log.
- Never bypass a hook: no `--no-verify`, no acceptance such as `ARC42_CONSISTENT` without a finding shown.
- Never delete a test to make it pass.

### `suppression-reason`: Suppress only in place, with the reason

```rule
id: suppression-reason
scope: tooling
severity: error
```

- Lint: only on the line, rule named, reason after `--`:
  `// oxlint-disable-next-line lernapps/no-request-before-click -- the video loads after a click`.
- Types: only `// @ts-expect-error -- <reason>`; never `@ts-ignore`, `@ts-nocheck`.
- The review reads every suppression.

## App from an archetype

### `keep-the-preset`: Extend the preset, change nothing of it

```rule
id: keep-the-preset
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- `vite.config.ts` = `export default lernapps()`, with only the app's own settings as generated
  (`lernapps({ plugins: [quiz()] })`).
- `tsconfig.json` extends `@lernapps/tooling/tsconfig.json` as generated.
- Hooks from the package (`prepare` in `package.json`); never replace one.
- Never turn a lint rule off or lower its severity.

### `strict-typescript`: TypeScript only, strict

```rule
id: strict-typescript
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- Every source TypeScript; no JavaScript files.
- Never `any`: `unknown` and narrow, or write the type.
- Type the creator's data; validate it at build time.

### `storage-through-wrapper`: Store only through the preset's storage

```rule
id: storage-through-wrapper
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- Only `createStorage` from `@lernapps/tooling/storage`, named after the app (own prefix, works when blocked).
- Max 100 kB under the prefix (keys and values, 2 bytes per UTF-16 unit); beyond, `save` returns false, the app
  keeps working.
- Keep the learning state, not growing histories.
- Never `localStorage`, `sessionStorage`, IndexedDB or cookies directly.

### `pages-from-gh-pages`: Publish from `gh-pages`, served from its root

```rule
id: pages-from-gh-pages
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- App publish action: GitHub Pages serves branch `gh-pages` from `/` (usually `https://<owner>.github.io/<repo>/`;
  only lernapps organisation repos at `https://lernapps.net/<repo>/`).
- Pull request previews will go below `pr-preview/` on that branch: leave the setting.
- Publish run fails → read its message; fix what you can; tell the creator the exact admin clicks it names.
- Hosted elsewhere → the entry's `url` points there.
