# Risks and Technical Debt

Ordered by severity.

## Assistants skip the guidance

An assistant may ignore `AGENTS.md`, run through all phases at once or skip the checkpoints. The process guidance
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
mitigation: Deterministic checks decide everything they can and comment failures without the owner; the quiz scaffold leaves little to review; the review can move into the listing workflow when listings justify its cost
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

## Rendering explainer pages from TypeScript is unproven

Static rendering with TypeScript sources (`dec-explainer-rendering`) has not been tried in this setup.

```arc42
:::risk
id: risk-explainer-rendering
title: Rendering explainer pages from TypeScript is unproven
severity: medium
mitigation: Prototype the explainer template before the presets are fixed; fall back to pre-rendering with Vite
:::
```

## Browser checks are heavy

The browser checks need Chromium, which is too heavy for every creator's pre-push hook.

```arc42
:::risk
id: risk-browser-checks-heavy
title: Browser checks are heavy
severity: medium
mitigation: Static checks in the hook, browser checks in the app's CI and in the listing validation; apps not on GitHub meet the browser checks only at listing
:::
```

## Creators without a shell

Creators who build in claude.ai or another chat assistant cannot run the generator, hooks or check CLI.

```arc42
:::risk
id: risk-no-shell
title: Creators without a shell
severity: medium
mitigation: The listing validation works on a URL alone; the comment with the deterministic results is readable for a chat assistant too; lernapps.net/apps/llms.txt guides listing
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

The entry schema will be tuned for discovery.

```arc42
:::risk
id: risk-entry-schema-changes
title: The entry model changes
severity: medium
mitigation: The guidance never repeats the schema's fields; the listing skill fetches the published schema each time (`dec-schema-explains-itself`)
:::
```

## Counters can be changed by hand

An assistant could reset `prePushFailures` in the plan's front matter.

```arc42
:::risk
id: risk-counter-tampering
title: Counters can be changed by hand
severity: low
mitigation: The counter is committed with every change; the review reads its history in git; it is a learning signal, not a listing criterion
:::
```

## Installing from git

npm installs a package from git only as a whole repo root, and more slowly than from a registry.

```arc42
:::risk
id: risk-git-install
title: Installing from git
severity: low
mitigation: One package at the root of lernapps/tooling (`dec-one-package`); publish to npm under the reserved scope @lernapps when install time or size starts to hurt
:::
```
