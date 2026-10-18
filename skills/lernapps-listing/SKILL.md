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

1. Follow the listing guide of the app overview, <https://lernapps.net/apps/enter/llms.txt>, step by step. It says where
   the entry goes, how to check it before you open the pull request, and how to open it.
2. Fill the entry from the entry draft of the plan and from the entry schema,
   <https://lernapps.net/apps/schemas/entry.v1.schema.json>, fetched now. The schema describes every field; this
   skill names none of them.
3. Run the check the guide names and fix what it reports before you open the pull request: it is the same check the
   pull request runs.
4. Open the pull request from a fork of lernapps/apps; never push a branch to lernapps/apps itself, even if you may.
   The skill `lernapps-github` says how, and what to do when a GitHub step fails.

## Read the results comment

The listing guide says how to read the comment the listing validation writes on the pull request, and what to do until
it says "bestanden". Then the owner of lernapps.net reviews the app and decides; wait for that, and tell the creator
what the comment and the decision say.
