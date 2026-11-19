---
name: lernapps-cli
description: Use in Code of a lernapps.net app - to create or update the app with the CLI, whenever a check, a git hook or a runtime test fails, and before you change the preset, the configuration or the storage. What `lernapps create`, `update`, `check` and `screenshots` do, how to fix from a message, when to suppress, and what of the preset you never change.
license: MIT
---

# lernapps CLI and checks

## Read when

- [references/platform-rules.md](references/platform-rules.md): a check names a `listing` rule, and before the
  listing.
- [references/code-rules.md](references/code-rules.md): before you write TypeScript or a component, add a
  dependency, store something on the device, change the configuration, or suppress a finding; and when a finding
  names `strict-typescript`, `storage-through-wrapper`, `keep-the-preset`, `lockfile-matches` or
  `suppression-reason`.

## Create

1. Only after the creator's yes to the plan (`explore-before-code`). In the plan's folder:
   `npx --no -- lernapps create --archetype <archetype>`.
2. `create` installs nothing and commits nothing; its last lines say what follows, in this order: no git repo yet
   (`lernapps init` makes one): `git init --initial-branch=work`; then `npm install` (runtime, git hooks); then commit
   everything on `work` (`git add -A`, `git commit`; the hooks check it).
3. Needs git, Node ≥ 22.18, registry.npmjs.org. Blocked → ask the creator to allow it, run again. Never write the
   app by hand.
4. It keeps the plan and the installed skills, and writes the content guide's skeleton.

## Update

- `npx --yes @lernapps/tooling@latest update`, then `npm install`: moves the app to this
  tooling's runtime and checks, replaces the `lernapps-*` skills, adds what an older app lacks.
- `npm update` moves tooling and runtime only within their ranges (`^0.1.0` takes patches); `update` moves the ranges.

## Check

- `npx --no -- lernapps check`: format, lint, types, unit tests, build, checks of the built app, end-to-end tests. The hooks
  run its parts (`--pre-commit`, `--pre-push`); CI runs it whole.
- Report: `node_modules/.cache/lernapps/validation-report.yaml`. Options: `npx --no -- lernapps check --help`.

## Look at the app

A check says the rules hold; only a look says what a learner sees. Show the creator the pages before a push, and before
a submission they declare something about.

- Explainer or quiz: build (`npx vp build` writes `dist/`; `npm run build` writes `_site/`), then
  `npx --no -- lernapps screenshots`: it takes the newer of `dist/` and `_site/`, or the folder you name. It writes
  one image of every page, one of every figure, and an `index.html` that shows them in order to `screenshots/` (not
  part of the app: do not commit it).
  Show the images, or the `index.html` where you can show HTML. Check every figure in its own image
  (`…-figure-<n>.png`): a page image is scaled down, its details are not readable. `--desktop` adds 1280 px images.
  Options: `npx --no -- lernapps screenshots --help`. The folder ignores itself in git, so a later check never sees it.
- Interactive app: `screenshots` does not support it. Open the built app with the Playwright the tooling installs
  (`import { chromium } from "playwright"`), at 360 px width, and take `page.screenshot({ fullPage: true })` of each
  state the creator should see, from a short script outside the app.

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

