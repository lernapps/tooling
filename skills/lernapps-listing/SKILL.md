---
name: lernapps-listing
description: Use when you list a learning app in the lernapps.net app overview, or when its listing pull request has a results comment. Where the entry's format and the listing steps are, and how to read the results comment and act on it. Load it at the listing checkpoint of the plan.
license: MIT
---

# Listing an app

An app is listed by a pull request to [lernapps/apps](https://github.com/lernapps/apps) that adds its entry. The
rules of `lernapps-app` apply; the entry rules are `entry-from-schema`, `entry-links-resolve` and
`entry-fitness-matches`, in its `references/platform-rules.md`.

## Open the listing pull request

Only after the creator said yes at the checkpoint "list".

1. Follow the listing guide of the app overview, <https://lernapps.net/apps/llms.txt>, step by step. It says where
   the entry goes, how to check it before you open the pull request, and how to open it.
2. Fill the entry from the entry draft of the plan and from the entry schema,
   <https://lernapps.net/apps/schemas/entry.v1.schema.json>, fetched now. The schema describes every field; this
   skill names none of them.
3. Run the check the guide names and fix what it reports before you open the pull request: it is the same check the
   pull request runs.

## Read the results comment

On every push to the pull request, the listing validation checks the entry against the app at its address and
comments its result on the pull request: "bestanden" when the check passes, else "nicht bestanden" with its
findings. The comment starts
with `<!-- lernapps-listing -->`, and each new run updates the same comment.

- Each finding names its rule, where it is, what was found, the fix and a link to the rule. Fix the cause, in the app
  or in the entry (`fix-from-message`). The full reports are the artifact `listing` of the run.
- A fix in the app counts only once it is published: the check opens the app at the entry's address. Publish it
  as the plan's Commit phase does, then push to the pull request's branch.
- Repeat until the comment says "bestanden". Then the owner of lernapps.net reviews the app and decides; wait for
  that, and tell the creator what the comment and the decision say.
