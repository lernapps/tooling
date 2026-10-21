---
name: lernapps-listing
description: Use in Commit when the creator wants their app in the lernapps.net app overview, or when the listing pull request gets a results comment - even if they only say "eintragen" or "veröffentlichen". The steps to the listing pull request and how to act on its results.
license: MIT
---

# Listing

- A pull request to [lernapps/apps](https://github.com/lernapps/apps) adds the app's entry.
- Rules: `entry-from-schema`, `entry-links-resolve`, `entry-fitness-matches` (skill `lernapps-check`,
  `references/platform-rules.md`).

## Open the pull request

At the checkpoint "list", without asking first: the pull request publishes nothing and is the review. After
"bestanden", show the creator the pull request and its result; change nothing in it without their word.

1. Follow the listing guide <https://lernapps.net/apps/enter/llms.txt> step by step: where the entry goes, how to
   check it, how to open the pull request.
2. Fill the entry from the plan's entry draft and <https://lernapps.net/apps/schemas/entry.v1.schema.json>, fetched
   now. The schema describes every field.
3. Run the check the guide names. Fix its findings first: the pull request runs the same check.
4. Open the pull request from the creator's fork as skill `lernapps-github` says.

## Results comment

- The listing guide says how to read it. Repeat until "bestanden".
- A fix of the app counts only once it is published (plan, Commit); then push to the pull request's branch.
- Then the owner of lernapps.net reviews and decides. Wait; tell the creator the comment and the decision.

## After the merge

- lernapps.net builds a copy of the app from the entry's `commit` and serves it at
  `https://lernapps.net/apps/start/<id>/`; the catalog links it once it is checked there. Tell the creator: the app
  stays theirs, at their own address too.
- A new version needs no new pull request from you. Publish it as usual (plan, Commit). Once the app's address
  serves the new commit, lernapps/apps opens an update pull request for the entry within about 30 minutes; the
  listing check runs on it.
- It merges itself when nothing else changed than what `lernapps update` makes, versions of npm dependencies and
  Markdown outside `src/` and `public/`. Anything else (content, code, workflows edited by hand, the licence) waits
  for the owner's review. Tell the creator which of the two to expect.
