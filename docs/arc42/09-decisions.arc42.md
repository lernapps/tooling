# Architecture Decisions

Each decision in the short form of an ADR: context, decision, consequences.

## Five layers around the assistant

**Context:** a creator's assistant needs guidance before, during and after building, and the platform needs proof
before listing. **Decision:** process guidance, scaffolding, conventions, deterministic verification and formal
validation, each in its own building blocks. **Consequences:** every layer can improve on its own; a rule can move
between layers (`concept-rule-catalog`).

```arc42
:::decision
id: dec-five-layers
title: Five layers around the assistant
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations, qg-checked-not-declared
:::
```

## Archetypes as the variation point

**Context:** a content-heavy app and a typing trainer differ in stack, rules and review. **Decision:** apps are
built from archetypes, named after their character; an archetype is a template, a preset, skills and the rules in
scope. The architecture fixes the variation point, not the list of archetypes. **Consequences:** a new archetype
needs a template, a preset and skills, no new building block; it is justified only by a different set of rules,
stack or review.

```arc42
:::decision
id: dec-archetypes
title: Archetypes as the variation point
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations
:::
```

## EPCC in AGENTS.md with a plan file

**Context:** assistants run through all steps at once unless guided; the guidance must work with any assistant.
**Decision:** the EPCC workflow as plain text in `AGENTS.md` and a plan file with phases, checkpoints, the creator's
answers for the entry, front matter counters and a retrospective; `@codemcp/workflows` stays optional.
**Consequences:** no MCP server needed; the plan is readable by the creator, carries what the entry needs, and is the
source for measurement.

```arc42
:::decision
id: dec-epcc-plan-file
title: EPCC in AGENTS.md with a plan file
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-simple-to-build, qg-findable, risk-assistants-skip-guidance
:::
```

## The entry schema explains itself

**Context:** the entry model of the app overview is tuned for discovery over time. **Decision:** the guidance only
tells the assistant to fetch the published schema and fill it; field descriptions live in the schema.
**Consequences:** the schema must be self-explanatory; changing it needs no change to the tooling.

```arc42
:::decision
id: dec-schema-explains-itself
title: The entry schema explains itself
status: accepted
date: 2026-10-08
addresses: qg-list-in-minutes, qg-findable, con-entry-schema, risk-entry-schema-changes
:::
```

## One package from git

**Context:** a template copied once drifts; npm installs from git only a repo root. **Decision:** one package
`@lernapps/tooling` at the root of lernapps/tooling with subpath exports and one CLI, installed from git at a commit
of `main`, kept current by Renovate, as `@lernapps/site` is. **Consequences:** no publishing pipeline; every app gets
changes without edits; publishing to npm stays possible.

```arc42
:::decision
id: dec-one-package
title: One package from git
status: accepted
date: 2026-10-08
addresses: qg-guidance-evolves, risk-git-install, con-github
:::
```

## Templates in lernapps/app-templates, logic in the package

**Context:** each archetype needs a starting app that can be seen and tried. **Decision:** lernapps/app-templates
holds one folder per archetype; the generator in the package copies a folder at a pinned commit.
**Consequences:** templates and presets change together through the pinned commit; templates stay small because the
logic is in the package.

```arc42
:::decision
id: dec-templates-repo
title: Templates in lernapps/app-templates, logic in the package
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-guidance-evolves
:::
```

## vite-plus as the toolchain

**Context:** creators should get lint, format, type check, tests and hooks without choosing tools. **Decision:**
vite-plus with its defaults, made stricter by the presets; the presets own the configuration. **Consequences:** one
toolchain and one config; the risk of a young tool is contained in the presets.

```arc42
:::decision
id: dec-vite-plus
title: vite-plus as the toolchain
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations, risk-vite-plus-young
:::
```

## Strict TypeScript everywhere

**Context:** types give assistants the fastest feedback. **Decision:** every app is TypeScript only: `strict` and the
stricter compiler options, no `any`, no JavaScript sources; data the creator supplies is typed and validated at
build time. **Consequences:** every archetype's toolchain must support TypeScript sources end to end.

```arc42
:::decision
id: dec-strict-typescript
title: Strict TypeScript everywhere
status: accepted
date: 2026-10-08
addresses: qg-few-iterations, con-language-licence
:::
```

## One check command; hooks and CI run the same

**Context:** checks that only CI runs reach the assistant late and cost the owner's attention; checks that differ
between hook and CI surprise. **Decision:** `lernapps check` runs every deterministic check. `--pre-commit` selects
the fast part (format, lint, types), `--pre-push` the heavy part (unit tests, build, checks of the built app,
end-to-end tests with Playwright); no flag or both flags run everything. The hooks run the two parts, CI runs
everything. A failed pre-push increments `prePushFailures` in the plan's front matter. **Consequences:** failures
reach the assistant on the creator's machine, before any CI run; CI is a safety net for skipped hooks and adds no
checks of its own; the creator's machine needs a browser for the end-to-end tests.

```arc42
:::decision
id: dec-one-check-command
title: One check command; hooks and CI run the same
status: accepted
date: 2026-10-09
addresses: qg-few-iterations, qg-any-assistant, risk-owner-bottleneck, risk-assistants-skip-guidance, risk-counter-tampering, risk-browser-at-creator
:::
```

## Conventions as skills

**Context:** guidance must be loaded when needed, not all at once. **Decision:** skills in the agentskills.io
format, general, per archetype and per topic, synced from the package into the creator's agent harness.
**Consequences:** skills reach every app through the package; apps built otherwise can install them alone.

```arc42
:::decision
id: dec-skills
title: Conventions as skills
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-guidance-evolves
:::
```

## Rules live in their artifacts

**Context:** a central rule file compiled into skills, lint configuration, checks and rubric would duplicate what
the artifacts already say, and skill text cannot be generated well; rules move between layers rarely.
**Decision:** each rule lives where it acts, as skill text, lint rule, check or rubric item, with a stable id and the
shared vocabulary of scope, severity and enforcement (`concept-rule-catalog`). The tooling's build only reads the
artifacts and tests the ids. **Rejected:** a central catalog with a compile step. **Consequences:** moving a rule is
a pull request that writes the new artifact and removes the old text; the artifacts can drift in wording, which the
evals and the id test catch.

```arc42
:::decision
id: dec-rules-in-artifacts
title: Rules live in their artifacts
status: accepted
date: 2026-10-09
addresses: qg-guidance-evolves, qg-checked-not-declared, risk-oxlint-plugins, risk-rule-drift
:::
```

## A standalone check CLI with YAML output

**Context:** the same rules must be checked on scaffolded apps and on apps built otherwise, and people and agents
read the result. **Decision:** one CLI that works on a repo, a bundle or a URL, without needing the source repo for
the checks of the built app; it checks an entry against the app with `--entry`; it reports in YAML; for scope
`site` it calls `lernapps-check` of the site frame, which stays there. **Consequences:** the same check in hook, CI
and listing; the report is the fitness signal and is readable without a viewer.

```arc42
:::decision
id: dec-check-cli
title: A standalone check CLI with YAML output
status: accepted
date: 2026-10-09
addresses: qg-checked-not-declared, qg-list-in-minutes, qg-findable, con-frontend-only, con-page-rules, risk-no-shell
:::
```

## Review by an agent, results as a comment

**Context:** some rules need judgment; creators should be able to fix failures without the owner. **Decision:** the
listing validation comments the report on failure; a review agent in a fresh context, starting from the report,
judges the rest; its verdict names the commit. Target: half pass on the first run, 7 of 8 on the second.
**Consequences:** the owner sees only listings that passed the checks.

```arc42
:::decision
id: dec-review-agent
title: Review by an agent, results as a comment
status: accepted
date: 2026-10-08
addresses: qg-checked-not-declared, qg-list-in-minutes, risk-owner-bottleneck
:::
```

## The owner runs the review

**Context:** a review agent in CI needs an API key and costs money per run. **Decision:** the listing workflow runs
the deterministic checks; the owner starts the review agent in the environment for lernapps agents on a pull request
that passed them. **Consequences:** no secret in lernapps/apps; the environment can change without changing the
procedure.

```arc42
:::decision
id: dec-review-by-owner
title: The owner runs the review
status: accepted
date: 2026-10-08
addresses: con-one-owner, risk-owner-bottleneck
:::
```

## Evals by hand with three assistants

**Context:** other people's assistants cannot be observed. **Decision:** the evals run by hand with Claude Code,
Codex and Gemini CLI on their latest models; there is no automated eval pipeline. **Consequences:** evals before
merging guidance changes; the p90 of failed pre-push runs is measured there.

```arc42
:::decision
id: dec-evals-by-hand
title: Evals by hand with three assistants
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-few-iterations
:::
```

## Content correctness is suggested

**Context:** correctness is checkable only where answers are computable. **Decision:** generator and checker tests,
cited sources and verified links are `hint` rules, never a listing condition. **Consequences:** the review notes, but
does not block, missing correctness support.

```arc42
:::decision
id: dec-correctness-suggested
title: Content correctness is suggested
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build
:::
```

## The tooling sends nothing

**Context:** sessions that never reach a listing stay invisible, but the platform collects nothing in secret.
**Decision:** the tooling sends nothing about a creator, an app or a session. Measurements stay in the creator's
repo (plan file) and reach the platform only with a listing. Feedback from an assistant to the platform needs the
creator's consent for each sending and carries structured totals only, through the platform's anonymous feedback
channel. **Consequences:** measurement relies on evals, listings and conversations with creators.

```arc42
:::decision
id: dec-tooling-sends-nothing
title: The tooling sends nothing
status: accepted
date: 2026-10-08
addresses: qg-nothing-collected, risk-invisible-failures
:::
```

## Every report is bound to a commit

**Context:** apps may be deployed anywhere, and a validation does not stay true when the app changes.
**Decision:** every validation report names the commit (or the URL and time) it checked. Showing an entry as a
fact sheet of an app deployed elsewhere, and re-validating listed apps, belong to the app overview and build on
that. **Consequences:** the deployed app can be traced to the validated commit.

```arc42
:::decision
id: dec-report-per-commit
title: Every report is bound to a commit
status: accepted
date: 2026-10-08
addresses: qg-checked-not-declared
:::
```
