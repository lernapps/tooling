---
name: lernapps-github
description: Use when a GitHub step of a lernapps.net app fails or a tool is missing - pushing branches, checking the default branch or GitHub Pages, watching or rerunning a workflow, opening the listing pull request from a fork. Which tools to try in which order (gh over REST, GitHub MCP tools, curl for public reads), what "403 Resource not accessible by integration" means (a click for the creator, never a dummy push), and the REST calls for the checks.
license: MIT
---

# GitHub

- Branches: `main` (published), `work` (until first publish), `gh-pages` (served). Workflow `Pages` checks and
  publishes. Listing pull request to lernapps/apps.
- You do it; the creator need not know. Explain on request: <https://lernapps.net/tooling/github/>.
- Settle the repo name before the first push: a rename may cost your access.

## Tools, in order

1. `gh` over REST: `gh api`, `gh run`, `gh workflow`. GraphQL blocked (`gh repo view --json`, `gh repo edit`, some
   `gh pr`) ≠ no gh: use `gh api`.
2. GitHub MCP tools, if present.
3. `curl -s https://api.github.com/repos/<owner>/<repo>/…`: public reads, no token.

## REST checks

- Default branch: `gh api repos/<owner>/<repo> --jq .default_branch` → `main`. Set (admin):
  `gh api -X PATCH repos/<owner>/<repo> -f default_branch=main`.
- Pages: `gh api repos/<owner>/<repo>/pages --jq '.build_type, .source.branch, .source.path'` → `legacy`,
  `gh-pages`, `/`. "Not Found" = off.
- Runs: `gh run list --workflow Pages --branch main`, `gh run watch <id>`, `gh run view <id> --log-failed`.

## "403 Resource not accessible by integration"

- Token may not (Pages settings, default branch, rerun, dispatch) → a click for the creator. Say the place once:
  - Pages: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages, folder:
    / (root) → Save. Last deploy is on `gh-pages`: app appears without a new run.
  - Default branch: Settings → General → Default branch → ⇄ → main → Update.
  - Run: Actions → the run → Re-run all jobs (or Re-run failed jobs).
- Never work around it: no dummy push to start a run, no new branch to pass a setting.

## Listing pull request from a fork

- Never push a branch to lernapps/apps, even if allowed. Opening the pull request from the fork is yours: do it
  yourself, after the creator's yes at the checkpoint "list".
- No fork yet and you cannot create one → give the creator the click (github.com/lernapps/apps → Fork) in your
  checkpoint question, not later.
- Fork (`gh repo fork lernapps/apps --clone=false`, or MCP), push `add-<id>` to the fork.
- `gh pr create --repo lernapps/apps --head <your-user>:add-<id>`, or
  `gh api repos/lernapps/apps/pulls -f base=main -f head=<your-user>:add-<id> -f title=… -f body=…`.
- From a fork: check comment yes, preview no.
