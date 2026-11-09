---
name: lernapps-listing
description: Use in Commit when the creator wants their app in the lernapps.net app overview, or when the listing pull request gets a results comment - even if they only say "eintragen" or "veröffentlichen". The steps to the listing pull request and how to act on its results.
license: MIT
---

# Listing

- A pull request to [lernapps/apps](https://github.com/lernapps/apps) adds the app's entry.
- Rules: `entry-from-schema`, `entry-links-resolve`, `entry-fitness-matches` (skill `lernapps-cli`,
  `references/platform-rules.md`).

## Open the pull request

At the checkpoint "list", without asking first: the pull request publishes nothing and is the review. After
"bestanden", show the creator the pull request and its result; change nothing in it without their word.

1. Follow the listing guide <https://lernapps.net/apps/enter/llms.txt> step by step: where the entry goes, how to
   check it, how to open the pull request.
2. Fill the entry from the plan's entry draft and <https://lernapps.net/apps/schemas/entry.v1.schema.json>, fetched
   now. The schema describes every field.
   - `subject` is the id of a subject of the learning map (`mathematik`, `franzoesisch`), not its name; the catalog
     shows the name from the map. Every listed app has one.
   - An explainer in format 2: its pages come from `lernapps-pages.json` of the build, not from a hand-written list. The
     listing checks the competency ids against the map and that they belong to the app's `strand`, or of a unit app
     (`subject` in its src/app.yaml) to one strand per page. A `strand` in the entry, if given, equals the one in that
     file, and its `subject` equals the entry's.
   - Any other app may give `strand` (`<subject>/<strand>` of its subject) and `competencies` (ids of that strand). A
     unit app across strands gives `competencies` without `strand`. An app without `competencies` and `strand` is not
     on the map; that is valid.
   - A unit app only where the subject's map says `explainerFocus: competency` (foreign languages, German); elsewhere
     one app, one strand.
   - Errors of the listing (`entry-learning-map`, lernapps/apps): an unknown id, one of another strand, a unit app
     in a subject with `explainerFocus: strand`, a page across strands.
   - Prerequisites in order: a recap page before or a link in the page's text counts. With `explainerFocus:
     competency` a prerequisite only on a later page (order) or missing inside the app's chain (gap) is an error, one
     missing at the app's entry a warning; with `strand` all are warnings. An app without pages: only gap and entry.
   - `lernapps check` warns about these before (`competencies-on-map`, `prerequisites-in-order`). The review adds two
     hints, never errors: a strand that could fit an app with `strand: none` (`strand-from-map`), a page that teaches
     more or other than its competencies say (`content-matches-competencies`).
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
- Tell the creator once how to keep the app up to date: two GitHub Apps and a few settings of their repo, in
  [references/keeping-updated.md](references/keeping-updated.md). Without them the app gets no tooling updates, and
  lernapps/apps lists it in an issue. It is advice; the listing does not wait for it.
- A new version needs no new pull request from you. Publish it as usual (plan, Commit). Once the app's address
  serves the new commit, lernapps/apps opens an update pull request for the entry within about 30 minutes; the
  listing check runs on it.
- It merges itself when nothing else changed than what `lernapps update` makes, versions of npm dependencies and
  Markdown outside `src/` and `public/`. Anything else (content, code, workflows edited by hand, the licence) waits
  for the owner's review. Tell the creator which of the two to expect.
