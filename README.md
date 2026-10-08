# tooling

Shared tooling for the lernapps.net apps and sites, so that they all behave the same: GitHub Actions for
building, checking, deploying and previewing a site, and the Renovate preset of every lernapps repo. Later
also the agent skill for building an app and the thanks and feedback component that creators can include
in their apps.

The components serve the [platform design](https://lernapps.net/docs/platform-design/) (agents: skill
[`skills/pdt`](https://github.com/lernapps/docs/tree/main/skills/pdt) in lernapps/docs): "GitHub as the means
of production: issue templates, GitHub Actions workflows" (D1 `platform-lernapps`).

## Site actions

Every site on lernapps.net is a static build in `_site/`, published on the repo's `gh-pages` branch and
served by GitHub Pages under its path (`/`, `/apps/`, `/docs/`). Three composite actions do the work; the
repos only hold two thin workflows that call them, with the same job names everywhere (`check`, `deploy`,
`preview`). The contract with a repo: `npm ci`, then `npm run build` writes `_site/`, then `npm run check`
checks it (`lernapps-check` from the shared site frame in lernapps.github.io).

| Action | Does |
|---|---|
| `actions/site-check` | checkout, Node 22, `npm ci`, `npm run build`, `npm run check`; on `main` uploads `_site/` |
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
follow `main` at once and merge when green.

## License

[MIT](LICENSE)
