# Keeping a listed app up to date

Tell the creator once, at the listing. It is advice; the listing does not wait for it. The creator owns the repo, so
these are their clicks. Offer to go through them together.

## 1. Two GitHub Apps, on the app's repo only

Each opens a page: choose the creator's account, "Only select repositories", the app's repo, Install.

- `https://github.com/apps/lernapps-updater/installations/new`: every day lernapps/apps runs `lernapps update` in the
  app and opens a pull request that merges once the app's check is green. Without it the app gets no tooling updates,
  and lernapps/apps lists it in an issue.
- `https://github.com/apps/renovate/installations/new`: third-party packages, using the app's `renovate.json`. The
  file does nothing without the App.

## 2. Pull request settings

Settings → General → Pull Requests: select **Allow auto-merge** and **Allow squash merging** (a linear history
needs squash or rebase).

## 3. One ruleset for `main`

Settings → Rules → Rulesets → New ruleset → New branch ruleset. Name `main`, enforcement **Active**, Target branches
→ Add a target → include the default branch (pattern `main`). Rules:

- **Require a pull request before merging**: no approvals needed; as merge type squash.
- **Require linear history**.
- **Require status checks to pass before merging**: add the check `app` (the job of the workflow `Pages`). GitHub
  offers a check only after it has run once, so the app must have had a pull request or a push first.
- **Block force pushes** (on by default).
- Bypass list → Add bypass → the repository admins, so the creator can still push by hand.

A required check the repo does not produce blocks every pull request for good: use `app`, no other name.
