# System Scope and Context

The system is the tooling for building, validating and listing apps: process guidance, generator and archetype
presets, skills, checks, the review and the validation report. Most of it is one package in lernapps/tooling. The
archetype templates live in lernapps/app-templates and the listing validation in lernapps/apps (chapter 5): it is the
check the app overview runs on every pull request that adds or changes an entry.

Outside the system are the parties who use it, the external systems it runs on, and the parts of lernapps.net it
depends on but does not own. The parties have intentions: the creator, their assistant, the owner and the review
agent. The external systems only do what they are configured to do: GitHub Actions, GitHub Pages, Renovate and the
app overview. The DSL models both as actors; the external systems have the type system. The shared site frame gives pages on lernapps.net their header, footer and site check.
The app overview in lernapps/apps explains building and listing and holds the entries and their schema; it uses the
tooling but is not part of it. Developers
publish their apps where they choose: by default on the GitHub Pages of the developer's own repo, at the developer's
address, or on any other host. lernapps.net serves a copy of every listed app at `lernapps.net/apps/start/<id>/`,
built from the commit its entry names (decision `dec-copies-served`); a new commit reaches the copy as an update pull
request (decision `dec-update-replay`).

The tooling's repo also holds "Platform upkeep" (chapter 5): the build of the tooling's own docs, the actions for
lernapps.net's own websites and the update policy of every lernapps repo. No creator uses it, and it is not part of
the app path.

## Context overview

```arc42
:::diagram
id: context-overview
view: context
notation: mermaid
:::
```

```mermaid
flowchart LR
    actor-creator["Creator"]
    actor-assistant["Creator's AI assistant"]
    actor-owner["Platform owner"]
    actor-review-agent["Review agent"]
    actor-github-actions["GitHub Actions (external system)"]
    actor-github-pages["GitHub Pages (external system)"]
    actor-renovate["Renovate (external system)"]
    actor-app-overview["App overview, lernapps/apps (external system)"]
    subgraph tooling["Tooling for agentic app creation"]
        bb-process-guidance["Process guidance"]
        bb-generator["Generator"]
        bb-skills["Skills"]
        bb-check-cli["Check CLI"]
        bb-archetypes["Archetype presets"]
        bb-review-procedure["Review procedure"]
        bb-app-check-action["App check action"]
        bb-app-publish["App publish"]
        bb-app-preview["App preview"]
        bb-listing-validation["Listing validation"]
        bb-renovate-preset["Renovate preset"]
    end
    actor-creator -->|"plan file, checkpoints"| tooling
    actor-assistant -->|"agent instructions, plan, skills, generator, check, listing comment"| tooling
    actor-review-agent -->|"review procedure, check CLI"| tooling
    actor-owner -->|"validation report, review procedure"| tooling
    actor-github-actions -->|"app check action, app publish, app preview, check CLI"| tooling
    actor-github-pages -->|"checked bundle from app publish and app preview"| tooling
    actor-renovate -->|"update policy, package updates"| tooling
    actor-app-overview -->|"check CLI on entries and copies, served commit, lernapps update to classify updates"| tooling
```

## Creator

A teacher, parent or student who builds an app for a gap they noticed ([app creators](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-creators)). They talk to their assistant,
read the plan and confirm it. After that, they are asked only at the checkpoints. They never need to know the rules
or the toolchain.

```arc42
:::actor
id: actor-creator
title: Creator
type: person
description: Builds an app with their AI assistant; reads and confirms the plan
requires: if-plan-file
:::
```

## Creator's AI assistant

Claude Code, Codex, Gemini CLI or another agent, chosen by the creator ([AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants)). It reads the agent
instructions, writes the plan, creates the app, follows the skills, reacts to the checks and fills the entry. It is a
partner the platform designs for, not part of the system.

```arc42
:::actor
id: actor-assistant
title: Creator's AI assistant
type: system
description: Any coding agent; works from plain files and CLIs, no MCP server required
requires: if-agents-md, if-plan-file, if-generator-cli, if-skills, if-check-cli, if-listing-comment
:::
```

## Platform owner

Decides whether an app is listed, maintains the rules and runs the review and the evals (one owner,
`con-one-owner`). Reads the validation report and the retrospective.

```arc42
:::actor
id: actor-owner
title: Platform owner
type: person
description: Decides listing, maintains the rules, runs review and evals
requires: if-validation-report, if-review-procedure
:::
```

## Review agent

An agent in a fresh context, run by the owner. It follows the review procedure,
starts from the check CLI's report and judges what the checks cannot decide.

```arc42
:::actor
id: actor-review-agent
title: Review agent
type: system
description: Fresh-context agent that validates an app before listing
requires: if-review-procedure, if-check-cli, if-validation-report
:::
```

## GitHub Actions

An external system. It runs the checks and the publishing in the developer's app repo, with the app check action
and the app publish action, and the listing validation in lernapps/apps, with the check CLI.

```arc42
:::actor
id: actor-github-actions
title: GitHub Actions
type: system
description: External system; runs the app check, app publish and app preview actions in the developer's app repo and the listing validation in lernapps/apps
requires: if-app-check-action, if-app-publish, if-app-preview, if-check-cli
:::
```

## GitHub Pages

An external system: the default hosting of an app at the developer's own address, and optional. It serves the
checked bundle that the app publish action puts in the developer's repo; a developer may use any other host instead.
It also serves lernapps.net, with the copy of every listed app (decision `dec-copies-served`).

```arc42
:::actor
id: actor-github-pages
title: GitHub Pages
type: system
description: External system; the default hosting of an app at the developer's own address, and lernapps.net with the copies of the listed apps
requires: if-app-publish
:::
```

## Renovate

An external system. It reads the shared update policy and proposes every new version of the tooling package, the
runtime and the actions to every repo, as update pull requests.

```arc42
:::actor
id: actor-renovate
title: Renovate
type: system
description: External system; applies the update policy and proposes updates of the tooling package to every app
requires: if-update-policy, if-archetype-preset
:::
```

## App overview

An external system: lernapps/apps, the catalog of lernapps.net. It holds the entries, serves a checked copy of every
listed app and proposes an entry's update when the app has a new version (decisions `dec-copies-served`,
`dec-update-replay`). From the tooling it takes the listing validation and its results comment, the check CLI for the
copies, the commit an app's address serves, and `lernapps update` to tell a routine update from one the owner
reviews.

```arc42
:::actor
id: actor-app-overview
title: App overview (lernapps/apps)
type: system
description: External system; the catalog of lernapps.net, holds the entries, runs the listing validation, serves a copy of every listed app and proposes its updates
requires: if-check-cli, if-app-publish, if-generator-cli, if-listing-comment
:::
```
