---
name: lernapps-github
description: Use in Commit, when a lernapps.net app or increment goes online or a GitHub step fails there - the pull request's checks, bringing the branch into main, the run of the workflow Pages (start, watch, "403"), verifying default branch and Pages, the fork for the listing pull request. What you may do yourself and what you ask the creator for.
license: MIT
---

# GitHub in Commit

- Tools: in the order of skill `lernapps-github-setup` (`gh api` first; GraphQL may be blocked).
- A push to `main` publishes: the workflow `Pages` checks and deploys. Push `main` only after the creator's yes.

## Checks of the pull request

1. `git push origin <branch>`. The pre-push hook runs the heavy checks; fix failures (skill `lernapps-check`).
2. Watch the checks of the head commit:
   `gh api repos/<owner>/<repo>/commits/<sha>/check-runs --jq '.check_runs[] | [.name, .status, .conclusion]'`.
3. A check fails → `gh run view <id> --log-failed`; fix, commit, push. See them to green before the checkpoint.

## Verify before the checkpoint "publish"

- Default branch and Pages as steps 7 and 8 of skill `lernapps-github-setup` say.
- Not right and not yours to change → note the creator's click for the checkpoint question.

## Publish

1. First version: `git switch main`, `git merge --ff-only work`, `git push origin main`. Increment: merge its pull
   request (`gh api -X PUT repos/<owner>/<repo>/pulls/<n>/merge`), or merge the branch the same way.
2. Run started? `gh run list --workflow Pages --branch main --commit "$(git rev-parse HEAD)"`. None after a minute
   → `gh workflow run Pages --ref main`.
3. Watch it: `gh run watch <id>`. It fails → read the failed step, fix, push.
4. The job `deploy` prints "published at …" (also in the run summary). Use that address; follow redirects.
5. A Pages setting only an admin may change: the run deployed anyway; after the creator's click the app appears
   without a new run.

## "403 Resource not accessible by integration"

- The token may not start or rerun a run. A click for the creator, said once: Actions → Pages → Run workflow, or the
  run → Re-run all jobs.
- Never push only to start a run.

## Listing pull request from a fork

- Never push a branch to lernapps/apps, even if allowed. You open the pull request from the creator's fork, after
  their yes at the checkpoint "list".
- Find the fork by its owner, never by its name (it may be renamed):
  `curl -s "https://api.github.com/repos/lernapps/apps/forks?per_page=100" | jq -r '.[] | select(.owner.login=="<owner>") | .clone_url'`.
- No fork: `gh repo fork lernapps/apps --clone=false`, or MCP. Refused → give the creator the click
  (github.com/lernapps/apps → Fork) in the checkpoint question, not later.
- Push `add-<id>` to the fork. Your environment grants access per repo (e.g. `add_repo`): adding lernapps/apps to
  open the pull request is allowed.
- Open it over REST: `gh api repos/lernapps/apps/pulls -f base=main -f head=<owner>:add-<id> -f title=… -f body=…`.
- From a fork the pull request gets the results comment, but no preview.
