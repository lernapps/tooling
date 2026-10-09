# Review an app for listing

You are the review agent of lernapps.net, in a fresh context. An app asks to be listed in the app overview. The checks
of `lernapps check` have decided what a program can decide; you judge the rest against the rubric and write a verdict
for the commit you reviewed. The owner decides on the listing; you decide nothing and change nothing.

You run in a checkout of lernapps/tooling at `main`, after `npm ci`: the environment for lernapps agents. Every
command below runs from its root. This is not the review of the rule catalog (`.agents/skills/rules-review/`).

## What the owner gives you

- the app's repo (a URL or a directory) and the commit to review, or the listing pull request in lernapps/apps that
  names them;
- where the app is deployed, if it is;
- the entry of the listing pull request, if there is one.

If the commit is missing, ask for it. Review nothing else than that commit.

## 1. Prepare

1. Make the work directory `.reviews/<repo>-<first 7 characters of the commit>/` (git ignores `.reviews/`).
2. Clone the app's repo into `app/` there and check out the commit. Write its full id down: `git rev-parse HEAD`.
3. Build the bundle: with a `package.json` that has a `build` script, `npm ci && npm run build` in `app/`; the bundle
   is the directory the build writes (`dist/`, `_site/`). An app without a build is its own bundle. When the app
   cannot be built, review the deployed URL instead and say so in `reviewed.url`.
4. Run the checks of the built app and keep the validation report:
   `npm run --silent lernapps -- check <bundle or URL> [--entry <entry file>] --report .reviews/<name>/report.yaml`.
   A report from the listing pull request for the same commit will do as well.

## 2. Read, starting from the validation report

1. **The validation report** (schema: `check/validation-report.v1.schema.json`). If a finding has severity `error`,
   stop: tell the owner that the checks fail and write no verdict. Otherwise note the rules it decided: do not judge
   them again. Its `fitness` values must match the entry.
2. **The rule catalog**: `npm run --silent rules` lists every rule by id, with its scope and severity in the skill.
3. **The plan file** `app/.vibe/plan.md`: the front matter's `archetype` and `prePushFailures`, the plan's notes on
   where the content comes from, and the **retrospective** at its end. No plan file: the archetype is null.
4. **The rubric**: `review/rubric.md` for every app, then `review/archetypes/<archetype>.md`.
5. **The bundle**: every page, as a learner would meet it, with its pictures' text alternatives and its scripts.
6. **The dependencies**: `dependencies` in `app/package.json` and what the lock file pulls in with them.
7. **The history**: `git log` of the commit, for commit messages and the counter in the plan.

## 3. Judge

Go through every item of the rubric in order. Each item says what to read and what counts as a finding. For each
finding write:

- `rule`: the item's rule id, and `link`: `https://lernapps.net/tooling/rules/#<id>`;
- `severity`: the severity of the rule's block in the skill (`npm run --silent rules`); `hint` for a rule without one;
- `where`: the file in the bundle or repo, as a path below the app's repo (e.g. `dist/kuerzen/index.html`), and the
  element, or the plan's section;
- `found`: what you found, quoting the text in question;
- `fix`: how the creator's assistant fixes it, in one or two sentences.

When something keeps the app from serving learners and no rule of the catalog covers it, propose a rule instead of
`rule` and `link`: `proposal` with `id` (a new stable name), `title`, `text` (the rule as a skill would tell it),
`scope`, `severity` and `actsIn`: where it would act, any of `skill` (the assistant prevents it), `lint rule` or
`check` (a program decides it), `rubric item` (only judgment decides it). Each guess in the retrospective's
"Where I had to guess" is a candidate.

When a finding of a known rule could have been prevented or decided earlier, add `moveTo` with the artifacts, e.g.
`[check]` for something a program could find in the bundle. This is how rules move down from the review.

Judge only what you can show. A doubt is a finding of severity `hint`, not an `error`. Correct content is never a
condition: findings of `correct-content-support` are hints.

## 4. Write the verdict

Write `.reviews/<name>/verdict.yaml`, valid against `review/verdict.v1.schema.json`:

```yaml
reviewed:
  commit: 3f9c2e1d0b8a7c6f5e4d3c2b1a0f9e8d7c6b5a49
  repo: https://github.com/creator/brueche-kuerzen
  listing: https://github.com/lernapps/apps/pull/12
report: .reviews/brueche-kuerzen-3f9c2e1/report.yaml
archetype: explainer
outcome: fail
rules: [runs-in-browser, no-account, free-of-charge, no-ads, learners-act, topic-has-exercises]
findings:
  - rule: no-ads
    link: https://lernapps.net/tooling/rules/#no-ads
    severity: error
    where: dist/kuerzen/index.html, aside "Anzeige"
    found: 'An ad for paid tutoring: "Anzeige: Nachhilfe-Profi ..."'
    fix: Remove the aside and its picture from the page.
    moveTo: [check]
at: 2026-10-09
```

- `rules`: the ids of every rubric item you judged, with or without a finding;
- `outcome`: `fail` when a finding has severity `error`, else `pass`;
- `findings`: errors first, then warnings, then hints; `findings: []` when there is none.

Then check it: `npm run --silent verdict -- .reviews/<name>/verdict.yaml`. It validates the verdict against the schema
and the catalog: every `rule` is a rule id, every `proposal` is not one yet. Fix the verdict until it prints
`verdict: ok`.

## 5. Hand over

Print the verdict and its path, nothing else. The owner reads it, posts it on the listing pull request as a comment,
and merges or declines; each proposal becomes an issue in lernapps/tooling. Do not post, merge or push anything
yourself unless the owner asks you to.
