---
name: lernapps-github
description: Use when a GitHub step of a lernapps.net app fails or a tool is missing - pushing branches, checking the default branch or GitHub Pages, watching or rerunning a workflow, opening the listing pull request from a fork. Which tools to try in which order (gh over REST, GitHub MCP tools, curl for public reads), what "403 Resource not accessible by integration" means (a click for the creator, never a dummy push), and the REST calls for the checks.
license: MIT
---

# GitHub access for a lernapps app

The app lives in the creator's GitHub repo: branches `main` (published), `work` (until the first publish) and
`gh-pages` (what Pages serves), the workflow `Pages` (checks and publishes), and the listing pull request to
lernapps/apps. The creator need not know any of it: you do it, and explain in plain words when they ask
(<https://lernapps.net/tooling/github/>).

## Tools, in this order

1. `gh`: `gh api`, `gh run`, `gh workflow` use REST. Some environments block GraphQL, which `gh repo view --json`,
   `gh repo edit` and some `gh pr` commands use: that does not mean "no gh"; do the same with `gh api`.
2. The GitHub MCP tools of your environment, if there are any.
3. `curl -s https://api.github.com/repos/<owner>/<repo>/…` for reads of a public repo, without a token.

Settle the repo's name before the first push: after a rename, your session may lose access to it.

## Checks over REST

- Default branch: `gh api repos/<owner>/<repo> --jq .default_branch` must say `main`. Set it with admin rights:
  `gh api -X PATCH repos/<owner>/<repo> -f default_branch=main`.
- Pages: `gh api repos/<owner>/<repo>/pages --jq '.build_type, .source.branch, .source.path'` must say `legacy`,
  `gh-pages`, `/`. "Not Found" means Pages is off.
- Runs: `gh run list --workflow Pages --branch main`, `gh run watch <id>`, `gh run view <id> --log-failed`.

## "403 Resource not accessible by integration"

Your token may not do this: Pages settings, the default branch, a rerun or a dispatch of a workflow. It is a click
for the creator. Tell them the exact place, once, in plain words:
- Pages: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages, folder: / (root)
  → Save. The last deploy is on `gh-pages` already, so the app appears without a new run.
- Default branch: Settings → General → Default branch → ⇄ → main → Update.
- A run: Actions → the run → Re-run all jobs (or Re-run failed jobs).

Never work around it: no push of a dummy change to start a run, no new branch to get past a setting.

## The listing pull request from a fork

Never push a branch to lernapps/apps, even if you may. Fork it (`gh repo fork lernapps/apps --clone=false`, or the
MCP tool), push `add-<id>` to the fork, and open the pull request from it:
`gh pr create --repo lernapps/apps --head <your-user>:add-<id>`, or over REST
`gh api repos/lernapps/apps/pulls -f base=main -f head=<your-user>:add-<id> -f title=… -f body=…`. A pull request from a fork gets the check comment,
but no preview.
