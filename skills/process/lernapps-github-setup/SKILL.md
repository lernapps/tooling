---
name: lernapps-github-setup
description: Use in Code, right after `lernapps create`, to put a lernapps.net app on GitHub, and in each increment to push its branch and open the preview pull request. Settle the repo name, branches main, work and gh-pages, Pages from gh-pages, default branch main, first push, preview pull request. Which tool first, what you may do yourself, which click you ask the creator for.
license: MIT
---

# GitHub setup

- Branches: `main` is published; `work` holds the first version until its publish (an increment:
  `increment/<NN>-<short name>`); `gh-pages` is served.
- You do it; the creator need not know GitHub. On request: <https://lernapps.net/tooling/github/>.

## Tools, in this order

1. `gh` over REST: `gh api`, `gh run`, `gh workflow`. GraphQL may be blocked (`gh repo view --json`, `gh repo edit`,
   `gh pr create`): that is no reason to drop `gh`; use `gh api`.
2. GitHub MCP tools, if present.
3. `curl -s https://api.github.com/repos/<owner>/<repo>/…`: public reads, no token.

## First version

1. Settle the repo name with the creator. A later rename can cost your access.
2. No repo on GitHub: `gh api user/repos -f name=<repo>`. Refused → ask the creator to create an empty public repo
   and give you its address.
3. No git repo: `git init --initial-branch=main`; `git remote add origin <address>`.
4. No `main` (`git ls-remote --heads origin main` and `git branch --list main` empty): `git switch --orphan main`,
   `git commit --allow-empty -m "chore: start"`, `git push -u origin main`.
5. No `gh-pages`: `git switch --orphan gh-pages`, `git commit --allow-empty -m "chore: gh-pages"`,
   `git push -u origin gh-pages`.
6. No `work`: `git switch -c work main`. Commit the generated app with the plan; `git push -u origin work`.
7. Pages from `gh-pages`, root (`pages-from-gh-pages`):
   `gh api -X POST repos/<owner>/<repo>/pages -f build_type=legacy -f "source[branch]=gh-pages" -f "source[path]=/"`.
   Verify: `gh api repos/<owner>/<repo>/pages --jq '.build_type, .source.branch, .source.path'` prints `legacy`,
   `gh-pages`, `/`. "Not Found" means off.
8. Default branch: `gh api repos/<owner>/<repo> --jq .default_branch` prints `main`. Else (admin):
   `gh api -X PATCH repos/<owner>/<repo> -f default_branch=main`.
9. Preview pull request over REST:
   `gh api repos/<owner>/<repo>/pulls -f base=main -f head=work -f title="Erste Version" -f body="Vorschau"`.
   Its comment "Vorschau der App" links the preview. Give the creator the link once.

## Increment

1. `git push -u origin increment/<NN>-<short name>`.
2. Open its pull request to `main` as in step 9, with `head` set to the branch and a title naming the increment.

## "403 Resource not accessible by integration"

- The token may not change this setting. It is a click for the creator; put it into your next question, once:
  - Pages: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages, folder:
    / (root) → Save.
  - Default branch: Settings → General → Default branch → ⇄ → main → Update.
- Never work around it: no dummy push, no new branch to pass a setting.

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
