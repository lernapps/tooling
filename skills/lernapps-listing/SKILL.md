---
name: lernapps-listing
description: Use when you list a learning app in the lernapps.net app overview, or when its listing pull request has a results comment. Where the entry's format and the listing steps are, and how to read the results comment and act on it. Load it at the listing checkpoint of the plan.
license: MIT
---

# Listing

- A pull request to [lernapps/apps](https://github.com/lernapps/apps) adding the entry.
- Rules: `entry-from-schema`, `entry-links-resolve`, `entry-fitness-matches` (skill `lernapps-app`,
  `references/platform-rules.md`).

## Open the pull request

- Only after the creator's yes at the checkpoint "list".
1. Follow <https://lernapps.net/apps/llms.txt> step by step (where the entry goes, how to check, how to open).
2. Fill the entry from the plan's entry draft and <https://lernapps.net/apps/schemas/entry.v1.schema.json>,
   fetched now. The schema describes every field.
3. Run the check the guide names; fix findings first (same check as the pull request).
4. From a fork; never push a branch to lernapps/apps (skill `lernapps-github`). You open the pull request yourself.

## Results comment

- Each push: validation against the app at its address; comment starting `<!-- lernapps-listing -->`, updated in
  place: "bestanden" or "nicht bestanden" with findings.
- Finding: rule, place, what was found, fix, link. Fix the cause in app or entry (`fix-from-message`). Full
  reports: artifact `listing`.
- App fixes count only once published (plan, Commit), then push to the pull request's branch.
- Repeat until "bestanden". Then the owner of lernapps.net reviews and decides; wait; tell the creator the comment
  and the decision.
