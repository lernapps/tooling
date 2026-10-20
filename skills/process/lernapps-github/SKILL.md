---
name: lernapps-github
description: Use in Commit, when a lernapps.net app or increment goes on GitHub and online, or a GitHub step fails - repo and branches, Pages from gh-pages, the preview pull request and its checks, bringing the branch into main, the run of the workflow Pages, the fork for the listing pull request. Which tool first, what you may do yourself, which click you ask the creator for.
license: MIT
---

# GitHub

- Branches: `main` is published; `work` holds the first version until its publish (an increment:
  `increment/<NN>-<short name>`); `gh-pages` is served. A push to `main` publishes.
- Until Commit everything is local. You do the GitHub part; the creator need not know GitHub. On request:
  <https://lernapps.net/tooling/github/>.

## Tools, in this order

1. `gh` over REST: `gh api`, `gh run`, `gh workflow`. GraphQL may be blocked, and with it the commands that use it
   (repo view, repo edit, pr create): that is no reason to drop `gh`; use `gh api`.
2. GitHub MCP tools, if present.
3. `curl -s https://api.github.com/repos/<owner>/<repo>/…`: public reads, no token.

## 1. Repo and Pages (first version)

1. Ask the creator in one message: the repo name (a later rename can cost your access), and, if you cannot create
   repos or change Pages, the clicks below.
2. No repo on GitHub: `gh api user/repos -f name=<repo>`. Refused → the creator creates an empty public repo and
   gives you its address.
3. `git remote add origin <address>`.
4. No `main` on the remote: `git switch --orphan main`, `git commit --allow-empty -m "chore: start"`,
   `git push -u origin main`.
5. No `gh-pages`: `git switch --orphan gh-pages`, `git commit --allow-empty -m "chore: gh-pages"`,
   `git push -u origin gh-pages`.
6. `git switch work`; it has its own root: `git rebase --root --onto main`.
7. Pages from `gh-pages`, root (`pages-from-gh-pages`):
   `gh api -X POST repos/<owner>/<repo>/pages -f build_type=legacy -f "source[branch]=gh-pages" -f "source[path]=/"`.
   Verify: `gh api repos/<owner>/<repo>/pages --jq '.build_type, .source.branch, .source.path'` prints `legacy`,
   `gh-pages`, `/`. "Not Found" means off.
8. Default branch: `gh api repos/<owner>/<repo> --jq .default_branch` prints `main`. Else (admin):
   `gh api -X PATCH repos/<owner>/<repo> -f default_branch=main`.

## 2. Preview and checks

1. `git push -u origin <branch>`. The pre-push hook runs the heavy checks; fix failures (skill `lernapps-check`).
2. Open the pull request over REST:
   `gh api repos/<owner>/<repo>/pulls -f base=main -f head=<branch> -f title=<"Erste Version" or the increment> -f body=Vorschau`.
   Its comment "Vorschau der App" links the preview.
3. Watch the checks of the head commit:
   `gh api repos/<owner>/<repo>/commits/<sha>/check-runs --jq '.check_runs[] | [.name, .status, .conclusion]'`.
   A check fails → `gh run view <id> --log-failed`; fix, commit, push. Green before the checkpoint "publish".

## 3. Publish

1. Only after the creator's yes at the checkpoint "publish".
2. One squash commit on `main`, its message as skill `lernapps-commit` says; never a merge commit.
   First version: `git switch main`, `git merge --squash work`, `git commit`, `git push origin main`; the pull
   request closes with it. Increment: squash-merge its pull request
   (`gh api -X PUT repos/<owner>/<repo>/pulls/<n>/merge -f merge_method=squash -f commit_title=… -f commit_message=…`).
3. Run started? `gh run list --workflow Pages --branch main --commit "$(git rev-parse HEAD)"`. None after a minute
   → `gh workflow run Pages --ref main`.
4. Watch it: `gh run watch <id>`. It fails → read the failed step, fix, push.
5. The job `deploy` prints "published at …" (also in the run summary). Use that address; follow redirects.

## "403 Resource not accessible by integration"

- The token may not change this setting or start this run. It is a click for the creator; put it into your next
  question, once:
  - Pages: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages, folder:
    / (root) → Save.
  - Default branch: Settings → General → Default branch → ⇄ → main → Update.
  - Run: Actions → Pages → Run workflow, or the run → Re-run all jobs.
- Never work around it: no dummy push, no new branch to pass a setting.

## 4. Listing pull request from a fork

- Never push a branch to lernapps/apps, even if allowed. You open the pull request from the creator's fork at the
  checkpoint "list", without asking first: it publishes nothing.
- Find the fork by its owner, never by its name (it may be renamed):
  `curl -s "https://api.github.com/repos/lernapps/apps/forks?per_page=100" | jq -r '.[] | select(.owner.login=="<owner>") | .clone_url'`.
- No fork, or no access to it: first add the repos your environment needs (e.g. `add_repo` with push access for the
  fork and lernapps/apps); then `gh repo fork lernapps/apps --clone=false`, or MCP. Only when both fail: the creator's
  click (github.com/lernapps/apps → Fork), asked for once.
- Push `add-<id>` to the fork; open the pull request over REST:
  `gh api repos/lernapps/apps/pulls -f base=main -f head=<owner>:add-<id> -f title=… -f body=…`.
- From a fork the pull request gets the results comment, but no preview.

## Gotchas

- The creator merged the pull request themselves → no second merge: check the `Pages` run of that commit and confirm
  the address.
- Never `git commit-tree` or `--no-verify` to get past a hook; an empty start commit passes the hook as it is.

## `pages-from-gh-pages`: Publish from `gh-pages`, served from its root

```rule
id: pages-from-gh-pages
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

- GitHub Pages serves the branch `gh-pages` from `/`: usually `https://<owner>.github.io/<repo>/`; only repos of
  the lernapps organisation at `https://lernapps.net/<repo>/`.
- Previews of pull requests go below `pr-preview/` on that branch: leave the setting.
- Hosted elsewhere → the entry's `url` points there.
