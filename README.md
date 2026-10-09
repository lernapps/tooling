# tooling

Shared tooling for the lernapps.net apps and sites, so that they all behave the same: GitHub Actions for
building, checking, deploying and previewing a site, and the Renovate preset of every lernapps repo. Later
also the agent skill for building an app and the thanks and feedback component that creators can include
in their apps.

The components serve the [platform design](https://lernapps.net/docs/platform-design/) (agents: skill
[`skills/pdt`](https://github.com/lernapps/docs/tree/main/skills/pdt) in lernapps/docs): "GitHub as the means
of production: issue templates, GitHub Actions workflows" (D1 `platform-lernapps`).

## The package `@lernapps/tooling`

The repo root is the npm package `@lernapps/tooling`, installed from git at a commit of `main` and kept current by
Renovate, like `@lernapps/site`:

```bash
npm install --save-dev --save-exact "github:lernapps/tooling#<commit>"
npx lernapps --help
```

It has one CLI, `lernapps`, and subpath exports (`exports` in `package.json`) for the presets that follow. Today the
CLI has one command:

| Command | Runs |
|---|---|
| `lernapps check --pre-commit` | the fast part: format, lint, type check (`vp check`) |
| `lernapps check --pre-push` | the heavy part: unit and end-to-end tests (`vp test`), build (`vp pack`) |
| `lernapps check` | both parts, as CI does |

The package is TypeScript only and strict (`tsconfig.json`: `strict`, `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `noImplicitOverride`; lint forbids `any`; no JavaScript sources). The toolchain is
[vite-plus](https://viteplus.dev/) (`vp`), configured in `vite.config.ts`. The CLI is built into `dist/` by
`prepare`, which npm runs on `npm ci` and when it installs the package from git; in this repo the scripts run the
source directly with Node's type stripping (`npm run lernapps -- <command>`, Node 22.18 or later).

### Development

`npm ci` also installs the git hooks (`vp config`, hooks in `.vite-hooks/`): pre-commit formats and fixes the staged
files (`vp staged`), then runs `lernapps check --pre-commit`; pre-push runs `lernapps check --pre-push`. The job
`check` in `.github/workflows/check.yml` runs `lernapps check`: exactly what the two hooks run together.

```bash
npm ci                                   # dependencies, build of the CLI, git hooks
npm run lernapps -- check                # what CI runs; --pre-commit / --pre-push for one part
npm run check                            # the same; builds nothing
npm run build && npm run check:site      # the docs site, built and checked (job `site` in pages.yml)
```

The tests (`test/`) check what a consumer relies on, end to end: a fresh clone gets green from `npm ci && npm run
check` without building anything, the docs site builds and passes `check:site`, a planted type error, lint error or failing test turns the hook command, `git commit` / `git push` and the CI
command red, the package installed from git provides `lernapps`, and the CLI's usage and exit codes. There are no unit
tests of internals.

## Site actions

Every site on lernapps.net is a static build in `_site/`, published on the repo's `gh-pages` branch and
served by GitHub Pages under its path (`/`, `/apps/`, `/docs/`). Three composite actions do the work; the
repos only hold two thin workflows that call them, with the same job names everywhere (`check`, `deploy`,
`preview`). The contract with a repo: `npm ci`, then `npm run build` writes `_site/`, then `npm run check`
checks it (`lernapps-check` from the shared site frame in lernapps.github.io). A repo whose `check` checks its
code names the site check with the input `check-script`; this repo does (`check:site`, job `site`), and its own
workflows use the actions from the checkout, so a change to an action is exercised by its pull request.

| Action | Does |
|---|---|
| `actions/site-check` | checkout, Node 22, `npm ci`, `npm run build`, `npm run check` (input `check-script`); on `main` uploads `_site/` |
| `actions/site-deploy` | publishes that artifact to the root of `gh-pages` (previews stay) |
| `actions/site-preview` | a preview per pull request at `https://lernapps.net/<site>pr-preview/pr-<n>/`, removed on close |

`pages.yml` of a site:

```yaml
name: Pages
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: false
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: lernapps/tooling/actions/site-check@<commit> # main
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: check
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: lernapps/tooling/actions/site-deploy@<commit> # main
```

`pr-preview.yml`: the same with `site-preview` and `site: /apps/`; see lernapps/apps for the full file.

The actions inside are pinned to full commit SHAs, and so are the callers' references to this repo;
Renovate bumps both.

## Renovate preset

`default.json` is the preset of every lernapps repo (`"extends": ["github>lernapps/tooling"]`): the owner's
defaults ([mrsimpson/renovate-config](https://github.com/mrsimpson/renovate-config): automerge of patch and
minor after 3 days, majors by hand) plus one rule: our own building blocks (`@lernapps/site`, these actions)
follow `main` at once, at any time of the week (not only in the Saturday window), and merge when green. A second
rule groups `vite-plus` with `@voidzero-dev/vite-plus-core`, which `package.json` puts in place of `vite` through
`overrides` (as the vite-plus README asks), so both always move to the same version.

## Documentation

The architecture of the tooling for building apps is written with [arc42](https://github.com/doctoolchain/arc42-language)
in `docs/arc42/` (agents: skill `arc42-language` in `.agents/skills/`); the plan of the current work is in `.vibe/`.
It is published at <https://lernapps.net/tooling/>, like every lernapps.net site: `pages.yml` with the site actions
above, and a preview per pull request (`pr-preview.yml`) that also contains the architecture's changes since the
merge base (`architecture-diff/`) and one comment listing them (`scripts/review-summary.ts`).

```bash
npm ci
npm run build && npm run check:site         # scripts/build.sh validates and builds into _site/; lernapps-check
ARC42_DIFF_BASE=origin/main npm run build   # also the review page of the changes (compares commits)
npm run arc42 -- get                        # any arc42 command on docs/arc42/
python3 -m http.server -d _site 8000        # preview; links assume the /tooling/ prefix
```

## License

[MIT](LICENSE)
