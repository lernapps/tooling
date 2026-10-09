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

It has one CLI, `lernapps`, and subpath exports (`exports` in `package.json`) for the guidance below and the presets
that follow. Today the CLI has one command, `lernapps check`, the same in the git hooks, in CI and in the listing
validation. It runs whatever exists and decides nothing from the rules' scope or severity:

| Command | Runs |
|---|---|
| `lernapps check --pre-commit` | the fast part: format, lint, type check (`vp check`) |
| `lernapps check --pre-push` | the heavy part: unit tests (`vp test`), build (`vp build` for an app with `index.html`, else `vp pack`), the checks of the built app in `dist/`, the dependency licences, the Playwright tests when `playwright.config.*` exists; a failure increments `prePushFailures` in `.vibe/plan.md` |
| `lernapps check` | both parts, as CI does |
| `lernapps check <dir\|url>` | the checks of a built app alone, on a bundle (served on 127.0.0.1) or a URL, without the repo |
| `... --entry <file>` | also a catalog entry against the app: its URL and topic links resolve, the fitness values match; without `<dir\|url>` the app at the entry's `url` |
| `... --site <path>` | the app is served on lernapps.net at `<path>`: also the site rules, by `lernapps-check` of the site frame |
| `... --report <file>` | also writes the full report to `<file>`, passing or not |

The checks of the built app (`check/rules/*.ts`, one rule id each) open every page reachable from the start page in
Chromium, as a learner would, without a click: requests to other hosts (blocked and recorded), cookies and data sent,
the page without JavaScript, the width at 360 px, axe-core (WCAG 2.1 A and AA), links below the app's address. The
browser is installed once on the first run and cached by Playwright. A passing check prints one line; a failing one
prints the validation report as YAML, every finding with rule id, severity, where, what was found, how to fix it and
the link `https://lernapps.net/tooling/rules/#<id>`; the exit code is 1 when a finding has severity `error`. The
report's JSON Schema is `@lernapps/tooling/check/validation-report.v1.schema.json`, published at
<https://lernapps.net/tooling/schemas/validation-report.v1.schema.json>.

The process guidance for building an app (EPCC: Explore, Plan, Code, Commit) is plain Markdown, exported for the
generator and the assistant's harness:

| Export | What it is |
|---|---|
| `@lernapps/tooling/guidance/AGENTS.md` | the app's `AGENTS.md`: keep a plan, follow its phases, stop at the checkpoints, load the skills |
| `@lernapps/tooling/guidance/plan-template.md` | the plan file (`.vibe/plan.md` in an app): phases with tasks, the checkpoints, the Explore questions, the retrospective; comments explain each part |
| `@lernapps/tooling/guidance/plan-front-matter.v1.schema.json` | JSON Schema of the plan's front matter: `archetype`, `phase`, `prePushFailures` (written by the pre-push hook) |
| `@lernapps/tooling/skills/lernapps-app/SKILL.md` | the skill `lernapps-app` (agentskills.io): the workflow and the general rules, each with its id |

Consumers rely on the front matter schema and on the plan's headings: `## Explore`, `## Plan`, `## Code`,
`## Commit`, `## Retrospective` with `### Phases reached`, `### Failed checks`, `### Creator turns after the plan` and
`### Where I had to guess`. A breaking change gets a new schema version.

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
command red, a rule id used twice in the same kind of artifact or a message without its link turns the CI command red, a rubric item without its id turns it red, the rule
list and the rule page show every rule grouped by id, the recorded verdict of the review validates and names the commit
and the rule of its fixture, a broken verdict fails the verdict check with a message, the package installed from git provides `lernapps` and resolves the
guidance exports, the plan template and a filled plan validate against the front matter schema while incomplete ones
fail with a message naming the problem, every plan has the sections the retrospective needs, and the CLI's usage and
exit codes. `lernapps check` runs on fixture apps (`test/fixtures/apps/`), one passing and one per broken rule, as a
bundle, on a URL, with `--entry` and `--site`, and in temporary app repos: exit codes, the YAML report validated
against its schema, the messages, the counter in the plan. There are no unit tests of internals.

### Rules

Every rule an app follows lives in the artifact where it acts, with a stable id (architecture, chapter 8, "Rule
catalog"). The same id in several artifacts is one rule: a skill section tells it so that the assistant prevents a
problem, and a lint rule or check may report the same problem under the same id. No artifact needs to know the
others. A skill section is headed by its rule block:

````markdown
### Load nothing from other servers before a click

```rule
id: no-request-before-click
scope: [listing, site]
severity: error
```

Bundle scripts, styles, fonts ... with the app at build time.
````

| Artifact | Carries a rule as | Where |
|---|---|---|
| section of a skill | a rule block with `id`, `scope`, `severity` | `skills/**/*.md` |
| lint rule | file name = id, `meta.docs.url` = link | `lint/rules/<id>.ts` |
| check of the check CLI | `export default { id, url, description, severity, run }` | `check/rules/*.ts` |
| item of the review rubric | a fenced `rubric` block with `id: <rule id>` under every item's heading | `review/rubric.md`, `review/archetypes/<name>.md` |

The link is always `https://lernapps.net/tooling/rules/#<id>`.

```sh
node scripts/rules.ts test         # ids valid and unique within each kind of artifact, every message linked
npm run --silent rules             # every rule of every artifact, grouped by id, as YAML
node scripts/rules.ts page <file>  # the rule page of the docs site, from the same reading
```

`test/rules.test.ts` runs the test, so `lernapps check` (pre-push hook and CI) fails too. Whether the artifacts of
one id still say the same is not decided by a program: the skill `rules-review` (`.agents/skills/`) has an agent
read the list and report drift, gaps and rules that could move to a lint rule or check. The rules of scope `listing`
(the listing criteria of lernapps/apps) and `site` (ORGANIZATION.md, "Every page, in every repo") are in
`skills/lernapps-app/SKILL.md`, with the workflow rules and the first rules of one archetype; the rubric of the review
(below) judges those no program decides, under the same ids.

## The review

Before an app is listed, an agent in a fresh context judges what no check decides, and the owner decides on the
listing (architecture, chapter 5, "Review procedure"). It runs in the environment for lernapps agents, today the
owner's machine: a checkout of this repo at `main` after `npm ci`.

| File | What it is |
|---|---|
| `review/prompt.md` | the prompt the owner gives a fresh agent, with the app's repo and the commit to review |
| `review/rubric.md` | the items for every app, each headed by its rule id |
| `review/archetypes/<name>.md` | the items of one archetype (`explainer`, `interactive`, `quiz`) |
| `review/verdict.v1.schema.json` | JSON Schema of the verdict, exported as `@lernapps/tooling/review/verdict.v1.schema.json` and published at <https://lernapps.net/tooling/schemas/verdict.v1.schema.json> |

The agent works in `.reviews/<repo>-<commit>/` (ignored by git). It clones the app at the commit and builds the
bundle, runs `lernapps check` for the validation report and starts from it, then reads the bundle, the dependencies
and the plan's retrospective, and judges every rubric item of the app's archetype. It writes `verdict.yaml` there:
the reviewed commit, the rubric items judged, and per finding the rule id with its link, or a proposed new rule and
where it would act (skill, lint rule, check, rubric item); `outcome` is `fail` when a finding has severity `error`.
Before it hands the verdict over, it checks it:

```sh
npm run --silent verdict -- .reviews/<name>/verdict.yaml   # schema, and every rule id in the rule catalog
```

The owner posts the verdict on the listing pull request in lernapps/apps, merges or declines, and turns each proposed
rule into a pull request here. CI calls no model: `test/review.e2e.test.ts` checks a verdict recorded by a fresh agent
for a fixture app with a planted ad (`test/fixtures/reviews/ad/`), committed with a fixed author and date so that its
commit is the same everywhere. After a change to the fixture, record it again: `node test/review-fixture.ts ad <dir>`
creates the fixture repo, a fresh agent reviews it with the prompt, and its verdict replaces `verdict.yaml`.

## Site actions

Every site on lernapps.net is a static build in `_site/`, published on the repo's `gh-pages` branch and
served by GitHub Pages under its path (`/`, `/apps/`, `/docs/`). Three composite actions do the work; the
repos only hold two thin workflows that call them, with the same job names everywhere (`site`, `deploy`,
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
  site:
    runs-on: ubuntu-latest
    steps:
      - uses: lernapps/tooling/actions/site-check@<commit> # main
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: site
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
It is published at <https://lernapps.net/tooling/>, with the rule page at <https://lernapps.net/tooling/rules/>, like every lernapps.net site: `pages.yml` with the site actions
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
