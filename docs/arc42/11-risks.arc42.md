# Risks and Technical Debt

Ordered by severity.

## Assistants skip the guidance

An assistant may ignore the agent instructions, run through all phases at once or skip the checkpoints. The process guidance
is text; nothing forces an assistant to read it.

```arc42
:::risk
id: risk-assistants-skip-guidance
title: Assistants skip the guidance
severity: high
mitigation: Enforcement in git hooks and CI, not in text; the scaffold already keeps the rules; the plan template guides through comments; the evals with three assistants show where guidance is ignored
:::
```

## The owner is the bottleneck

Review, evals and listing decisions run by hand, on one person's time (`con-one-owner`).

```arc42
:::risk
id: risk-owner-bottleneck
title: The owner is the bottleneck
severity: high
mitigation: Deterministic checks decide everything they can and comment failures without the owner; a deep scaffold leaves little to review; the review can move into the listing workflow when listings justify its cost
:::
```

## vite-plus is before 1.0

Its configuration format and commands may still change.

```arc42
:::risk
id: risk-vite-plus-young
title: vite-plus is before 1.0
severity: medium
mitigation: The configuration is owned by the archetype presets, so a change is made once; Renovate updates go through the evals before they reach apps
:::
```

## Oxlint JS plugins are young

Our lint rules depend on Oxlint's JavaScript plugin support.

```arc42
:::risk
id: risk-oxlint-plugins
title: Oxlint JS plugins are young
severity: medium
mitigation: Write the rules against the ESLint-compatible API, so they can run as an ESLint plugin; keep rules that need deep analysis in the check CLI
:::
```

## A browser at the creator

The end-to-end tests and the checks of the built app run before every push and need a browser. Downloading it costs time once,
and some assistant sandboxes cannot run one.

```arc42
:::risk
id: risk-browser-at-creator
title: A browser at the creator
severity: medium
mitigation: The check uses a browser the sandbox provides, else fetches one once and keeps it; the check says clearly when no browser can run and which part was skipped; CI runs the same checks, and the listing validation runs them against the deployed app
:::
```

## Rule artifacts drift apart

Without a central rule file, the same rule can be worded differently in a skill and a check, or a moved rule can
stay in its old place. No program compares the artifacts of one id; the rule list grouped by id makes the
differences visible to the agent that reviews it.

```arc42
:::risk
id: risk-rule-drift
title: Rule artifacts drift apart
severity: low
mitigation: Stable rule ids and the tooling's id test (unique per artifact kind, every message linked); an agent reviews the rules grouped by id; the evals show contradicting guidance
:::
```

## Creators without a shell

Creators who build in claude.ai or another chat assistant cannot run the generator, hooks or check CLI.

```arc42
:::risk
id: risk-no-shell
title: Creators without a shell
severity: medium
mitigation: The listing validation works on a URL alone; the comment with the deterministic results is readable for a chat assistant too; lernapps.net/apps/enter/llms.txt guides listing
:::
```

## Sessions without a listing stay invisible

We learn from listings only; sessions that fail before a listing leave no trace.

```arc42
:::risk
id: risk-invisible-failures
title: Sessions without a listing stay invisible
severity: medium
mitigation: Evals cover the archetypes; conversations with creators; agent feedback sent with the creator's consent through the platform's anonymous feedback channel
:::
```

## The entry model changes

The entry schema is tuned for discovery over time.

```arc42
:::risk
id: risk-entry-schema-changes
title: The entry model changes
severity: medium
mitigation: The guidance never repeats the schema's fields; the listing skill fetches the published schema each time (`dec-schema-explains-itself`)
:::
```

## Counters can be changed by hand

An assistant could reset the counter of failed pushes in the plan.

```arc42
:::risk
id: risk-counter-tampering
title: Counters can be changed by hand
severity: low
mitigation: The counter is committed with every change; the review reads its history in git; it is a learning signal, not a listing criterion
:::
```

## The packages release in a chain

`@lernapps/tooling` depends on an exact version of `@lernapps/app-templates`, and the practice package on the tooling. A
release is public. The release of each follows a merge to main by itself, and Renovate raises the dependency on the
one before it as a fix, which releases the next. A dependency between the development parts of the two (the tooling in
a template) must not be a fix, or each release would answer the other with another.

```arc42
:::risk
id: risk-release-chain
title: The packages release in a chain
severity: low
mitigation: The Renovate preset titles only a runtime dependency on one of our packages fix(deps), a development dependency chore(deps) (test/renovate.test.ts); every package is released once at a time (concurrency group release); the start tag v0.0.0 and the conventional commits decide the version
:::
```
