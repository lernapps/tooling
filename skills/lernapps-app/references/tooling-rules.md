# Tooling rules

How an app keeps to the checks and the preset of `@lernapps/tooling`. Each rule is a section headed by its rule
block (`id`, `scope`, `severity`).

## Checks

### `checks-pass`: Run the checks before you push

```rule
id: checks-pass
scope: tooling
severity: error
```

Run `lernapps check` before you push; the hooks run it too. Format, lint, type check, unit tests, build, the checks of
the built app and the end-to-end tests must pass. A failure names the step: fix it from the step's output. CI runs
the same command and nothing else, so what passes on your machine passes in CI. A failed CI run has the same message
as the hook, and its report is the artifact `validation-report`.

A test that comes with the archetype's runtime (`@lernapps/app-templates`) and fails while your content validates is a
bug in the template; the message names it as a test of the template. Tell the creator, and open an issue at
<https://github.com/lernapps/app-templates/issues> with the validation report
(`node_modules/.cache/lernapps/validation-report.yaml`), or ask the creator to. Never change the tests or the
configuration to get around it. The app pins the runtime to a commit, so `npm update` changes nothing; once the fix
is in, `npx --yes github:lernapps/tooling#main update` moves the app to it. Then run `npx lernapps check` and commit.

A link whose server limits requests (HTTP 429) is reported as not checked, at severity hint: it fails nothing. Tell
the creator which links could not be checked, and go on.

### `fix-from-message`: Fix failed checks, never bypass them

```rule
id: fix-from-message
scope: tooling
severity: error
```

Read the message of a failed check and fix the cause. A failed commit prints one line with the step and the log
`node_modules/.cache/lernapps/pre-commit.log`: the messages are in that log. Never bypass a hook (`--no-verify`), never delete a test to
make it pass.

### `suppression-reason`: Suppress only in place, with the reason

```rule
id: suppression-reason
scope: tooling
severity: error
```

Suppress a lint message only on the line where it occurs, name the rule and write why after `--`:
`// oxlint-disable-next-line lernapps/no-request-before-click -- the video loads after a click`. Suppress a type
error only with `// @ts-expect-error -- <reason>`, never with `@ts-ignore` or `@ts-nocheck`. The review reads every
suppression.

## An app from an archetype

### `keep-the-preset`: Extend the preset, change nothing of it

```rule
id: keep-the-preset
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

An app from an archetype extends the preset of `@lernapps/tooling` and configures nothing the preset sets:
`vite.config.ts` is `export default lernapps()`, `tsconfig.json` extends `@lernapps/tooling/tsconfig.json` as
generated, the hooks come from the package (`prepare` in `package.json`). Pass only the app's own settings to
`lernapps({ ... })`, such as the pages to build or the build step of its archetype's runtime, as generated:
`lernapps({ plugins: [quiz()] })`. Never turn a lint rule off or lower its severity, never replace a hook.

### `strict-typescript`: TypeScript only, strict

```rule
id: strict-typescript
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

Write every source in TypeScript; no JavaScript files. Never use `any`: use `unknown` and narrow it, or write the type.
Type the data the creator supplies and validate it at build time.

### `storage-through-wrapper`: Store only through the preset's storage

```rule
id: storage-through-wrapper
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

Keep what the app must remember with `createStorage` from `@lernapps/tooling/storage`, named after the app: it stays
on the device, under the app's own prefix, and the app keeps working when the browser blocks storage. All apps share
the origin's localStorage, so an app keeps at most 100 kB under its prefix (keys and values, 2 bytes per UTF-16 code
unit): `save` returns false beyond it, as when storage is blocked, and the app keeps working. Keep the learning state,
not histories that keep growing. Never use `localStorage`, `sessionStorage`, IndexedDB or cookies directly.

### `pages-from-gh-pages`: Publish from `gh-pages`, served from its root

```rule
id: pages-from-gh-pages
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

An app from the generator publishes with the app publish action: GitHub Pages of the app repo serves the branch
`gh-pages` from its root (`/`), at the repo's Pages address (usually `https://<owner>.github.io/<repo>/`; only a repo
of the lernapps organisation is served at `https://lernapps.net/<repo>/`). Previews of pull requests will go below `pr-preview/` on the same branch, so leave
that setting as it is. When the publish run fails, read its message: fix what you can, and tell the creator the exact
clicks it names for what only a repository admin may change. The creator may host the app elsewhere; then the entry's
`url` points there.
