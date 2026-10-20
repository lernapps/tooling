---
name: lernapps-check
description: Use in Code of a lernapps.net app - to create or update the app with the CLI, whenever a check, a git hook or a runtime test fails, and before you change the preset, the configuration or the storage. What `lernapps create`, `update` and `check` do, how to fix from a message, when to suppress, and what of the preset you never change.
license: MIT
---

# lernapps CLI and checks

## Read when

- [references/platform-rules.md](references/platform-rules.md): a check names a `listing` rule, and before the
  listing.

## Create

1. Only after the creator's yes to the plan (`explore-before-code`). In the plan's folder:
   `npx --yes github:lernapps/tooling create --archetype <archetype>`.
2. No git repo yet: `git init --initial-branch=work`. Then `npm install` (dependencies, git hooks), and commit
   everything on `work`.
3. Needs git, Node ≥ 22.18, github.com, codeload.github.com, registry.npmjs.org. Blocked → ask the creator to allow
   it, run again. Never write the app by hand.
4. It keeps the plan and the installed skills, and writes the content guide's skeleton.

## Update

- `npx --yes github:lernapps/tooling update`, then `npm install`: moves the app to this
  tooling's runtime and checks, replaces the `lernapps-*` skills, adds what an older app lacks.
- `npm update` changes nothing: tooling and runtime are pinned.

## Check

- `npx lernapps check`: format, lint, types, unit tests, build, checks of the built app, end-to-end tests. The hooks
  run its parts (`--pre-commit`, `--pre-push`); CI runs it whole.
- Report: `node_modules/.cache/lernapps/validation-report.yaml`. Options: `npx lernapps check --help`.

## A check fails

1. Read the message: it names the step and links the rule (`https://lernapps.net/tooling/rules/#<id>`).
2. Failed commit: one line names the step and `node_modules/.cache/lernapps/pre-commit.log`. Read that log.
3. Fix the cause. The rule's text is in the skill of the phase; the link says where.
4. Run the check again. Go on only when it passes.

- A runtime test (`@lernapps/app-templates`) fails while your content validates: a bug of the template.
  1. Tell the creator. Open an issue at <https://github.com/lernapps/app-templates/issues> with the validation
     report, or ask the creator to.
  2. Never change tests, config or `node_modules` to get around it. Go on with the content.
  3. After the fix: update, check, commit.
- A link answers HTTP 429: "not checked", a hint that fails nothing. Tell the creator which; go on.

## Rules

### `checks-pass`: Run the checks before you push

```rule
id: checks-pass
scope: tooling
severity: error
```

- `lernapps check` passes before every push. The hooks run it too; CI runs the same command and keeps its report as
  the artifact `validation-report`.

### `fix-from-message`: Fix failed checks, never bypass them

```rule
id: fix-from-message
scope: tooling
severity: error
```

- Fix the cause the message names.
- Never bypass a hook: no `--no-verify`, no acceptance such as `ARC42_CONSISTENT` without a finding shown.
- Never delete a test to make it pass.

### `suppression-reason`: Suppress only in place, with the reason

```rule
id: suppression-reason
scope: tooling
severity: error
```

- Lint: only on the line, with the rule named and the reason after `--`:
  `// oxlint-disable-next-line lernapps/no-request-before-click -- the video loads after a click`.
- Types: only `// @ts-expect-error -- <reason>`; never `@ts-ignore` or `@ts-nocheck`.
- The review reads every suppression.

### `keep-the-preset`: Extend the preset, change nothing of it

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

### `strict-typescript`: TypeScript only, strict

```rule
id: strict-typescript
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- Every source file is TypeScript; no JavaScript files.
- Never `any`: use `unknown` and narrow it, or write the type.
- Type the creator's data; validate it at build time.

### `storage-through-wrapper`: Store only through the preset's storage

```rule
id: storage-through-wrapper
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- Only `createStorage` from `@lernapps/tooling/storage`, named after the app's id in the catalog (own prefix
  `lernapps:<id>:`, rule `own-data-only`; works when storage is blocked).
- At most 100 kB under the prefix (keys and values, 2 bytes per UTF-16 unit). Beyond, `save` returns false and the
  app keeps working.
- Keep the learning state, not growing histories.
- Never `localStorage`, `sessionStorage`, IndexedDB or cookies directly.
