# Solution Strategy

The tooling follows the creator's journey. Each step has its own approach; three principles hold across all of
them: everything the assistant needs is a plain file or a command, everything an app uses comes from one versioned
package, and nothing leaves the creator's side unless they submit a listing.

```arc42
:::solution-strategy
id: strategy-architecture
title: Follow the creator's journey; plain files, one package, nothing leaves unasked
addresses: qg-simple-to-build, qg-list-in-minutes, qg-findable, qg-checked-not-declared, qg-nothing-collected, qg-few-iterations, qg-any-assistant, qg-guidance-evolves
:::
```

## Clarify: the plan file asks first

The assistant starts a plan file before it writes code and works through its phases (Explore, Plan, Code, Commit).
In Explore it asks the creator what the app is for and for whom, fetches the entry schema of the app overview and
asks what the schema needs to help adults find the app. From the answers it chooses the archetype. The creator
confirms the plan; from then on the assistant works on its own.

## Set up: start from a working app

Apps come in a few kinds, called archetypes, named after their character: a quiz, pages that explain and practise a
topic, one interactive page. The archetype is the variation point: each one brings its own template, preset, skills
and rules in scope. Which archetypes exist is decided outside this document.

The generator writes an app from the archetype's template that already passes every check, with strict types, tests,
translations and accessibility in place. The app holds only thin files that refer to the tooling package, so it never
has to be changed to receive a new rule. The assistant changes a working app instead of building one from nothing.

## Build: one check, run before every commit and push

Rules reach the assistant in three forms: as skills it loads when a task needs them, as lint rules that mark the
code while it writes, and as checks of the built app. One check command runs every deterministic check, from format
and types to tests in a browser. Git hooks run its fast part before a commit and its heavy part before a push; CI
runs both. Every message says what to fix, so the assistant fixes it without asking.

## Validate: deterministic first, judgment for the rest

The same check runs once more in the listing validation, against the deployed app, and writes a report bound to
the commit. When it fails, the report goes back to the creator's assistant as a comment on the listing pull
request. A review agent in a fresh context starts from the report and judges only what no check can decide.

## List: the entry comes from the plan and the report

The assistant fills the entry from the creator's answers in the plan and from the validation report; it never asks
the creator to type the entry. The fitness values come from the report. The topics of the entry are deep links into
the app, and the check confirms that they resolve, so adults land where the entry promises.

## Across the journey

- **Plain files and commands.** Process guidance, plan and skills are plain text; generator and check are commands;
  enforcement sits in git hooks, which every assistant triggers. Nothing depends on one vendor or an agent protocol.
- **One versioned package.** Templates aside, everything an app uses comes from one package, installed from git and
  kept current by automatic update pull requests, so a change reaches every app without editing it.
- **Nothing leaves unasked.** The tooling fetches packages and schemas and sends nothing. What is measured stays in
  the plan file until the creator submits a listing.
