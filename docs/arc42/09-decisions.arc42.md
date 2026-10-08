# Architecture Decisions

Each decision in the short form of an ADR: context, decision, consequences.

## Five layers around the assistant

**Context:** a creator's assistant needs guidance before, during and after building, and the platform needs proof
before listing. **Decision:** process guidance, scaffolding, conventions, deterministic verification and formal
validation, each a separate building block. **Consequences:** every layer can improve on its own; findings move
between layers (`concept-promotion-path`).

```arc42
:::decision
id: dec-five-layers
title: Five layers around the assistant
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations, qg-checked-not-declared
:::
```

## Three archetypes, named by character

**Context:** a content-heavy app and a typing trainer differ in stack, rules and review. **Decision:** archetypes
`explainer`, `interactive` and `quiz`, each a bundle of template, preset, skills, rules in scope and rubric; named
after their character, not their use. **Consequences:** every building block is designed per archetype; a new
archetype is justified only by a different check profile, stack or rubric.

```arc42
:::decision
id: dec-archetypes
title: Three archetypes, named by character
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations
:::
```

## EPCC in AGENTS.md with a plan file

**Context:** assistants run through all steps at once unless guided; the guidance must work with any assistant.
**Decision:** the EPCC workflow as plain text in `AGENTS.md` and a plan file with phases, checkpoints, front matter
counters and a retrospective; `@codemcp/workflows` stays optional. **Consequences:** no MCP server needed; the plan
is readable by the creator and is the source for measurement.

```arc42
:::decision
id: dec-epcc-plan-file
title: EPCC in AGENTS.md with a plan file
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-simple-to-build, risk-assistants-skip-guidance
:::
```

## The entry schema explains itself

**Context:** the entry model will be tuned for discovery. **Decision:** the guidance only tells the assistant to
fetch the published schema and fill it; field descriptions live in the schema. **Consequences:** the schema must be
self-explanatory; changing it needs no change to the tooling.

```arc42
:::decision
id: dec-schema-explains-itself
title: The entry schema explains itself
status: accepted
date: 2026-10-08
addresses: qg-list-in-minutes, con-entry-schema, risk-entry-schema-changes
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

## Templates in lernapps/app-template, logic in the package

**Context:** each archetype needs a starting app that can be seen and tried. **Decision:** lernapps/app-template
holds one folder per archetype; the generator in the package copies a folder at a pinned commit. **Consequences:**
templates and presets change together through the pinned commit; the templates stay small because the logic is in
the package.

```arc42
:::decision
id: dec-templates-repo
title: Templates in lernapps/app-template, logic in the package
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-guidance-evolves
:::
```

## vite-plus as the toolchain

**Context:** creators should get lint, format, type check, test and hooks without choosing tools. **Decision:**
vite-plus with its defaults, made stricter by the presets; the presets own the configuration. **Consequences:** one
CLI and one config; the risk of a young tool is contained in the presets.

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

**Context:** types give assistants the fastest feedback. **Decision:** TypeScript only, strict, in every archetype
(`concept-strict-typescript`). **Consequences:** the explainer's static rendering must work with TypeScript
(`dec-explainer-rendering`).

```arc42
:::decision
id: dec-strict-typescript
title: Strict TypeScript everywhere
status: accepted
date: 2026-10-08
addresses: qg-few-iterations, con-language-licence
:::
```

## Git hooks enforce and count

**Context:** agent hooks exist only in some assistants. **Decision:** pre-commit runs `vp staged`, pre-push runs the
full check and the static check CLI; a failed pre-push increments `prePushFailures` in the plan's front matter.
**Consequences:** every assistant meets the same checks; the number of failed pushes is measured, not reported.

```arc42
:::decision
id: dec-git-hooks
title: Git hooks enforce and count
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-few-iterations, risk-assistants-skip-guidance, risk-counter-tampering
:::
```

## Conventions as skills

**Context:** guidance must be loaded when needed, not all at once. **Decision:** skills in the agentskills.io
format, general, per archetype and per topic; their rule sections are generated from the rule catalog.
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

## Rules with scope, severity and enforcement

**Context:** "rules" came from several sources with different weight. **Decision:** one rule model
(`concept-rule-model`) and one catalog; listing rules are never warnings. **Consequences:** skills, lint, checks and
rubric share ids; a rule moves between layers by changing its enforcement.

```arc42
:::decision
id: dec-rule-model
title: Rules with scope, severity and enforcement
status: accepted
date: 2026-10-08
addresses: qg-guidance-evolves, qg-checked-not-declared, risk-oxlint-plugins
:::
```

## A standalone check CLI

**Context:** the same rules must be checked on scaffolded apps and on apps built otherwise. **Decision:** one CLI
that works on a bundle or a URL, without the source repo; for scope `site` it calls `lernapps-check` of the site
frame, which stays there. **Consequences:** the same check in hook, CI and listing; the report is the fitness signal.

```arc42
:::decision
id: dec-check-cli
title: A standalone check CLI
status: accepted
date: 2026-10-08
addresses: qg-checked-not-declared, qg-list-in-minutes, con-frontend-only, con-page-rules, risk-no-shell
:::
```

## Review by an agent, results as a comment

**Context:** some rules need judgment; creators should be able to fix failures without the owner. **Decision:** the
listing validation comments the deterministic results on failure; a review agent in a fresh context, starting from
the report, judges the rest; its verdict names the commit. Target: half pass on the first run, 7 of 8 on the second.
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

## Browser checks in CI

**Context:** Chromium is heavy for a pre-push hook. **Decision:** static checks in the hook; browser checks in the
app check action and the listing validation. **Consequences:** some failures show up only in CI.

```arc42
:::decision
id: dec-browser-checks-in-ci
title: Browser checks in CI
status: accepted
date: 2026-10-08
addresses: qg-few-iterations, risk-browser-checks-heavy
:::
```

## The owner runs the review

**Context:** a review agent in CI needs an API key and costs money per run. **Decision:** the listing workflow runs
the deterministic checks; the owner starts the review agent locally on a pull request that passed them.
**Consequences:** no secret in lernapps/apps; the review can move into the workflow without changing the procedure.

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

**Context:** other people's assistants cannot be observed. **Decision:** the owner runs the evals by hand with Claude
Code, Codex and Gemini CLI on their latest models; there is no automated eval pipeline. **Consequences:** evals before
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
cited sources and verified links are guidance (`hint`), never a listing condition. **Consequences:** the review notes,
but does not block, missing correctness support.

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

## explainer pages rendered with Eleventy and TypeScript

**Context:** explainer pages are rendered at build time like the other lernapps.net sites, but sources must be
TypeScript. **Decision:** Eleventy 3 with TypeScript configuration, data and templates (`.11ty.ts`),
loaded through Node's type stripping, and client modules bundled by vite-plus. **Alternative:** pre-rendering with
Vite only. **Consequences:** the combination has to be proven by a prototype (`risk-explainer-rendering`).

```arc42
:::decision
id: dec-explainer-rendering
title: explainer pages rendered with Eleventy and TypeScript
status: proposed
date: 2026-10-08
addresses: qg-simple-to-build, risk-explainer-rendering
:::
```

## Question types of the quiz

**Context:** quiz creators supply only questions and options, so the engine must cover what they need.
**Decision:** single choice, multiple choice, true/false, number (with tolerance and unit), ordering and
matching; each with feedback per option and an explanation per question. **Consequences:** further types are engine
extensions and never change the creator's data format.

```arc42
:::decision
id: dec-quiz-question-types
title: Question types of the quiz
status: proposed
date: 2026-10-08
addresses: qg-simple-to-build, qg-list-in-minutes
:::
```
