---
name: lernapps-listing
description: Use in Commit when the creator wants their app in the lernapps.net app overview, or when the listing pull request gets a results comment - even if they only say "eintragen" or "veröffentlichen". The steps to the listing pull request and how to act on its results.
license: MIT
---

# Listing

- A pull request to [lernapps/apps](https://github.com/lernapps/apps) adds the app's entry.
- Rules: `entry-from-schema`, `entry-links-resolve`, `entry-fitness-matches` (skill `lernapps-app`,
  `references/platform-rules.md`).

## Open the pull request

Only after the creator's yes at the checkpoint "list".

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
