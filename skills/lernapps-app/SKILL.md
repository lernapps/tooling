---
name: lernapps-app
description: Use when you build or change a learning app for lernapps.net. The rules every app follows, each with its id; the workflow itself is in the plan file (.vibe/plan.md, from the plan template). Load it when you start work on an app.
license: MIT
---

# Building a lernapps app

A lernapps app is static, runs in the browser only, collects nothing and is accessible. The creator decides what it
teaches; you build it, check it and prepare its listing. Every rule below has an id: check messages, the review and
the retrospective name rules by it.

## Workflow

Follow the plan in `.vibe/plan.md` exactly. The plan is the one source of the workflow: its phases, tasks and
checkpoints, and the command that creates the app. If the plan does not exist, start it from the template:
`node_modules/@lernapps/tooling/guidance/plan-template.md`, or, before the app exists,
<https://raw.githubusercontent.com/lernapps/tooling/main/guidance/plan-template.md>. This skill adds the rules
below: what every app and every step must meet.

## Rules

Each rule is a section headed by its rule block (`id`, `scope`, `severity`). Follow every rule in scope, whether
or not a lint rule, check or the review also enforces it under the same id; their messages link to the rule.
All rules: <https://lernapps.net/tooling/rules/>.

The scopes: `listing` applies to every listed app, wherever it is hosted. `archetype:<name>` applies to apps of that
archetype. Your app lives at its own address, by default the GitHub Pages of its repo (usually
`https://<owner>.github.io/<repo>/`), and the catalog links to it.

### `plan-file`: Keep the plan file

```rule
id: plan-file
scope: listing
severity: error
```

Keep `.vibe/plan.md` from the template, with every section and front matter key. Update `phase` when you enter a
phase. Never edit `prePushFailures`: the pre-push hook writes it.

### `explore-before-code`: No code before the plan is confirmed

```rule
id: explore-before-code
scope: listing
severity: error
```

Write no code and generate nothing until the creator has confirmed the plan.

### `stop-at-checkpoints`: Stop at the creator's checkpoints

```rule
id: stop-at-checkpoints
scope: listing
severity: error
```

Stop at each checkpoint (confirm the plan, publish, list) and wait for the creator's answer. Example: "Die App ist
fertig und geprüft. Soll ich sie jetzt veröffentlichen?"

### `few-turns-after-plan`: Work on your own after the plan

```rule
id: few-turns-after-plan
scope: listing
severity: hint
```

After the plan is confirmed, ask the creator only what you cannot decide. Otherwise choose, mark it "(guess)" under
"Key decisions" and list it in the retrospective.

### `entry-from-schema`: Fill the entry from the published schema

```rule
id: entry-from-schema
scope: listing
severity: error
```

Fetch the entry schema each time you need it; never fill the entry from memory or from another app. Take every value
from the creator's answers, the plan or the app; never invent one.

### `entry-links-resolve`: Every link of the entry resolves

```rule
id: entry-links-resolve
scope: listing
severity: error
```

Give each topic the path of a page that exists, relative to the app's `url`. Check the entry against the deployed app
with `lernapps check --entry <file>`.

### `entry-fitness-matches`: Fitness values as measured

```rule
id: entry-fitness-matches
scope: listing
severity: error
```

Take `fitness.storage` and `fitness.thirdParty` from what the app does, not from what it should do: `lernapps check
--report <file>` measures what it does before a click. An app that keeps anything in `localStorage` has
`storage: device`; one that loads from another server after a click has `thirdParty: on-click`.

### `fix-from-message`: Fix failed checks, never bypass them

```rule
id: fix-from-message
scope: listing
severity: error
```

Read the message of a failed check and fix the cause. A failed commit prints one line with the step and the log
`node_modules/.cache/lernapps/pre-commit.log`: the messages are in that log. Never bypass a hook (`--no-verify`), never delete a test to
make it pass.

### `suppression-reason`: Suppress only in place, with the reason

```rule
id: suppression-reason
scope: listing
severity: error
```

Suppress a lint message only on the line where it occurs, name the rule and write why after `--`:
`// oxlint-disable-next-line lernapps/no-request-before-click -- the video loads after a click`. Suppress a type
error only with `// @ts-expect-error -- <reason>`, never with `@ts-ignore` or `@ts-nocheck`. The review reads every
suppression.

### `checks-pass`: Run the checks before you push

```rule
id: checks-pass
scope: listing
severity: error
```

Run `lernapps check` before you push; the hooks run it too. Format, lint, type check, unit tests, build, the checks of
the built app and the end-to-end tests must pass. A failure names the step: fix it from the step's output. CI runs
the same command and nothing else, so what passes on your machine passes in CI. A failed CI run has the same message
as the hook, and its report is the artifact `validation-report`.

### `retrospective-filled`: Fill the retrospective

```rule
id: retrospective-filled
scope: listing
severity: error
```

At the end of Commit, fill every part of the retrospective with facts: phases reached, failed checks with rule ids,
the creator's turns after the plan, where you had to guess. No names of people.

### `no-tracking`: Collect nothing, set no cookies

```rule
id: no-tracking
scope: listing
severity: error
```

No cookies, no analytics, no tracking pixels, no server that stores data. If the app stores anything, it stays on
the device (`localStorage`) and serves only the app.

### `runs-in-browser`: Runs in the browser, without installation

```rule
id: runs-in-browser
scope: listing
severity: error
```

The app opens at its URL in a current browser and works there. Nothing to install: no app store, no download, no
browser extension.

### `no-account`: No account

```rule
id: no-account
scope: listing
severity: error
```

Learners and teachers use the whole app without signing up or logging in.

### `free-of-charge`: Free of charge

```rule
id: free-of-charge
scope: listing
severity: error
```

Every part of the app is free: no payment, no paid upgrade, no trial that ends.

### `no-ads`: No ads

```rule
id: no-ads
scope: listing
severity: error
```

Show no advertising, no sponsored content, no product placement.

### `learners-act`: Learners do something themselves

```rule
id: learners-act
scope: listing
severity: error
```

Learners try, practise or decide in the app; reading alone is not enough. Each page or screen asks them to act.

### `no-learner-data-in-texts`: Nothing about a particular learner in public texts

```rule
id: no-learner-data-in-texts
scope: listing
severity: error
```

Write no name, class, school, grade, picture or other detail of a real learner into the app, the entry, the README,
the plan or a commit message, even when the creator mentions one. Use made-up names in exercises.

### `correct-content-support`: Help keep the content correct

```rule
id: correct-content-support
scope: listing
severity: hint
```

Where answers are computable, generate the exercises and test the answers with a checker. Name a source learners and
teachers can follow for facts. This should be done where it fits; it is never a condition for listing.

### `no-request-before-click`: No request to another server before a click

```rule
id: no-request-before-click
scope: listing
severity: error
```

Bundle fonts, scripts and pictures at build time. Load anything from another server (a video, a map) only after the
learner clicks for it. Keep URLs of other servers out of code; where the learner clicks to load one, suppress the lint
message on that line with this reason.

### `accessible`: Accessible to WCAG 2.1 AA

```rule
id: accessible
scope: listing
severity: error
```

Meet WCAG 2.1 AA: labels, contrast, keyboard use, text alternatives.

### `usable-at-360px`: Usable at 360 px

```rule
id: usable-at-360px
scope: listing
severity: error
```

Every page works at 360 px width without horizontal scrolling, with every control reachable.

### `learner-text-german`: German, plain language for learners

```rule
id: learner-text-german
scope: listing
severity: error
```

Write every text for learners, teachers and parents in German, in plain language: short sentences, active voice, no
jargon. Keep the texts in message files, not in code: in an app from an archetype, in `src/messages/de.json`, shown
with `translator` from `@lernapps/tooling/i18n`.

### `third-party-licence`: Name source and licence of others' content

```rule
id: third-party-licence
scope: listing
severity: error
```

Use content of others (texts, pictures, quotes) only with a licence that allows it, and name source and licence next
to it.

### `links-resolve`: Every link resolves

```rule
id: links-resolve
scope: listing
severity: error
```

Point every link and every resource (pictures, scripts, styles) to a page or file that the build writes. Use
relative links inside the app.

### `dependency-licence`: Only dependencies with an open licence

```rule
id: dependency-licence
scope: listing
severity: error
```

Add a package to `dependencies` only if it and its own dependencies have one of these licences: MIT, MIT-0, ISC,
0BSD, BSD-2-Clause, BSD-3-Clause, Apache-2.0, MPL-2.0, BlueOak-1.0.0, Zlib, Unlicense, CC0-1.0, CC-BY-4.0,
Python-2.0. Tools for the build belong in `devDependencies`.

### `keep-the-preset`: Extend the preset, change nothing of it

```rule
id: keep-the-preset
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

An app from an archetype extends the preset of `@lernapps/tooling` and configures nothing the preset sets:
`vite.config.ts` is `export default lernapps()`, `tsconfig.json` only extends `@lernapps/tooling/tsconfig.json`, the
hooks come from the package (`prepare` in `package.json`). Pass only the app's own settings to `lernapps({ ... })`,
such as the pages to build or the build step of its archetype's runtime, as generated: `lernapps({ plugins: [quiz()]
})`. Never turn a lint rule off or lower its severity, never replace a hook.

### `pages-from-gh-pages`: Publish from `gh-pages`, served from its root

```rule
id: pages-from-gh-pages
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

An app from the generator publishes with the app publish action: GitHub Pages of the app repo serves the branch
`gh-pages` from its root (`/`), at the repo's Pages address (usually `https://<owner>.github.io/<repo>/`; only a repo
of the lernapps organisation is served at `https://lernapps.net/<repo>/`). Previews of pull requests will go below `pr-preview/` on the same branch, so leave
that setting as it is. When the publish run fails, read its message: fix what you can, and tell the creator the exact
clicks it names for what only a repository admin may change. The creator may host the app elsewhere; then the entry's
`url` points there.

### `strict-typescript`: TypeScript only, strict

```rule
id: strict-typescript
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

Write every source in TypeScript; no JavaScript files. Never use `any`: use `unknown` and narrow it, or write the type.
Type the data the creator supplies and validate it at build time.

### `storage-through-wrapper`: Store only through the preset's storage

```rule
id: storage-through-wrapper
scope: [archetype:explainer, archetype:interactive, archetype:quiz]
severity: error
```

Keep what the app must remember with `createStorage` from `@lernapps/tooling/storage`, named after the app: it stays
on the device, under the app's own prefix, and the app keeps working when the browser blocks storage. Never use
`localStorage`, `sessionStorage`, IndexedDB or cookies directly.

### `topic-has-exercises`: Every topic has exercises (explainer)

```rule
id: topic-has-exercises
scope: archetype:explainer
severity: hint
```

Give every topic page exercises that practise what it explains, on the page or one link away, each with a solution
or feedback learners can check.

### `start-page-explains`: The start page explains the app (interactive)

```rule
id: start-page-explains
scope: archetype:interactive
severity: hint
```

Say on the static start page what learners train, for whom, and how to begin.
