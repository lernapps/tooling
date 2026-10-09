# Building Blocks

The tooling is one package, `@lernapps/tooling`, at the root of lernapps/tooling, installed by apps from git at a
commit of `main` and kept current by Renovate, like the site frame `@lernapps/site` (decision `dec-one-package`).
Its parts are subpath exports and commands of one CLI, `lernapps`. Two blocks live in other repos: the archetype
templates in lernapps/app-templates and the listing validation in lernapps/apps. Folders inside the package are
named in the prose.

Rules have no block of their own: each rule lives in the block where it acts, as skill text, lint rule, check or
rubric item (concept `concept-rule-catalog`).

## Level 1

```arc42
:::diagram
id: building-blocks-level-1
view: building-block
notation: mermaid
:::
```

```mermaid
flowchart TB
    subgraph bb-tooling-package["@lernapps/tooling"]
        bb-process-guidance["Process guidance"]
        bb-skills["Skills"]
        bb-generator["Generator"]
        bb-archetypes["Archetype presets"]
        bb-lint-rules["Lint rules"]
        bb-check-cli["Check CLI"]
        bb-review-procedure["Review procedure"]
        bb-evals["Evals"]
    end
    bb-app-templates["Archetype templates (lernapps/app-templates)"]
    bb-app-check-action["App check action"]
    bb-listing-validation["Listing validation (lernapps/apps)"]
    bb-generator -->|"if-archetype-templates"| bb-app-templates
    bb-generator -->|"if-plan-file"| bb-process-guidance
    bb-archetypes -->|"if-lint-plugin"| bb-lint-rules
    bb-archetypes -->|"if-check-cli"| bb-check-cli
    bb-app-check-action -->|"if-check-cli"| bb-check-cli
    bb-listing-validation -->|"if-check-cli"| bb-check-cli
    bb-listing-validation -->|"if-review-procedure"| bb-review-procedure
    bb-review-procedure -->|"if-validation-report"| bb-check-cli
    bb-evals -->|"if-generator-cli"| bb-generator
    bb-evals -->|"if-validation-report"| bb-check-cli
```

## Level 2: archetype presets

```arc42
:::diagram
id: building-blocks-archetypes
view: building-block
notation: mermaid
roots: bb-archetypes
:::
```

```mermaid
flowchart TB
    subgraph bb-tooling-package["@lernapps/tooling"]
        subgraph bb-archetypes["Archetype presets"]
            bb-git-hooks["Git hooks"]
        end
        bb-check-cli["Check CLI"]
        bb-process-guidance["Process guidance"]
        bb-lint-rules["Lint rules"]
    end
    bb-git-hooks -->|"if-check-cli"| bb-check-cli
    bb-git-hooks -->|"if-plan-file"| bb-process-guidance
    bb-archetypes -->|"if-lint-plugin"| bb-lint-rules
```

## @lernapps/tooling

The one package every app depends on. Its version is a commit of `main`; Renovate moves every app to the latest
commit and merges when the app's checks are green (preset `github>lernapps/tooling`). An app holds only thin files
that refer to it: configuration that extends a preset, the hooks installed by it, skills synced from it. The
package's own build runs the same check command it gives apps, plus a test that the rule ids across skills, lint
rules, checks and rubric are consistent.

```arc42
:::building-block
id: bb-tooling-package
title: "@lernapps/tooling"
technology: TypeScript, Node, npm package installed from git
implements: concept-stable-contracts
:::
```

### Process guidance

The EPCC workflow for the creator's assistant (`guidance/`): the text of the app's `AGENTS.md` and the plan
template. `AGENTS.md` is short and always loaded; it tells the assistant to keep a plan and points to the skills.

The plan template has the phases Explore, Plan, Code and Commit, each with its tasks and the creator's checkpoints
(confirm the plan, publish, list). Explore holds the questions for the creator, including what the entry schema of
the app overview needs to help adults find the app; the answers stay in the plan for listing. The front matter holds
the archetype, the current phase and counters the hooks write (`prePushFailures`). The plan ends with a
retrospective: phases reached, checks that failed and how often, the creator's turns after the plan was confirmed,
where the assistant had to guess. Comments in the template explain each part, so the template itself guides the
assistant.

```arc42
:::building-block
id: bb-process-guidance
title: Process guidance
parent: bb-tooling-package
technology: Markdown
implements: concept-plain-language, concept-terse-output, concept-traceability
:::
```

#### AGENTS.md

The entry point every assistant reads, generated into the app. It stays short and refers to the plan and the
skills.

```arc42
:::interface
id: if-agents-md
title: AGENTS.md
provider: bb-process-guidance
protocol: Markdown file at the app's root
:::
```

#### Plan file

The human-readable plan in the app repo (`.vibe/plan.md`). It stays in the creator's repo and reaches the platform
only with a listing. Its front matter has a versioned JSON Schema in the package; its headings (the four phases,
then the retrospective and its parts) are fixed, so hooks, review and evals can read it.

```arc42
:::interface
id: if-plan-file
title: Plan file
provider: bb-process-guidance
protocol: Markdown with YAML front matter
:::
```

### Skills

The `guided` rules and the know-how around them (`skills/`), in the agentskills.io format: `lernapps-app` (workflow
and general rules), one per archetype, topic skills such as third-party content (bundle it at build time, name
source and licence next to it, embeds only after a click, links verified, never guessed), and `lernapps-listing`
(fetch the entry schema, fill it from plan and report, open the pull request). Each skill names the rule ids it
carries. They are synced from the package into the creator's agent harness (chapter 7) and can be installed alone
with `npx skills add lernapps/tooling` for apps built otherwise.

```arc42
:::building-block
id: bb-skills
title: Skills
parent: bb-tooling-package
technology: Markdown (agentskills.io)
implements: concept-rule-catalog, concept-plain-language, concept-terse-output
:::
```

#### Skills interface

The skills the assistant loads when a task needs them; one per concern.

```arc42
:::interface
id: if-skills
title: Skills
provider: bb-skills
protocol: SKILL.md files in the harness's skill folder
:::
```

### Generator

`lernapps create --archetype <name>` writes a new app from the archetype's template at the commit pinned in the
package: the thin files that refer to the package, `AGENTS.md`, the plan file carried over from the conversation,
the app's workflows, LICENSE and an issue form for content errors. The assistant runs it after the creator has
confirmed the plan.

```arc42
:::building-block
id: bb-generator
title: Generator
parent: bb-tooling-package
technology: TypeScript CLI
requires: if-archetype-templates, if-plan-file
implements: concept-stable-contracts
:::
```

#### Generator CLI

It fails if the archetype is unknown or the folder is not empty.

```arc42
:::interface
id: if-generator-cli
title: Generator CLI
provider: bb-generator
protocol: CLI `lernapps create`
:::
```

### Archetype presets

What an app imports and never edits (`archetypes/`), one preset per archetype on a shared base: the vite-plus
configuration (lint with the severities of our lint rules, format, type check, unit tests, staged files), the strict
`tsconfig` base, the Playwright configuration for end-to-end tests, i18n and a11y helpers, and the git hooks.

```arc42
:::building-block
id: bb-archetypes
title: Archetype presets
parent: bb-tooling-package
technology: TypeScript, vite-plus, Playwright
requires: if-lint-plugin, if-check-cli
implements: concept-rule-catalog, concept-stable-contracts
:::
```

#### Archetype preset interface

What an app imports and extends: configuration, `tsconfig` base and hooks, by archetype.

```arc42
:::interface
id: if-archetype-preset
title: Archetype preset
provider: bb-archetypes
protocol: npm subpath exports (config, tsconfig, hooks)
:::
```

#### Git hooks

Installed by the preset. Pre-commit runs `lernapps check --pre-commit`, pre-push runs `lernapps check --pre-push`;
together they run exactly what CI runs. When the pre-push run fails, the hook increments `prePushFailures` in the
plan file's front matter and prints the messages.

```arc42
:::building-block
id: bb-git-hooks
title: Git hooks
parent: bb-archetypes
technology: vite-plus hooks, shell
requires: if-check-cli, if-plan-file
implements: concept-terse-output, concept-traceability
:::
```

### Lint rules

The `checked` rules that can be decided on source code (`lint/`), as an Oxlint JS plugin written against the
ESLint-compatible API: no URLs to other hosts in code, storage only through the preset's wrapper, learner texts only
from the i18n files, no `any`. Each rule carries its rule id; its severity is set in the preset's configuration; a
suppression needs a reason.

```arc42
:::building-block
id: bb-lint-rules
title: Lint rules
parent: bb-tooling-package
technology: TypeScript, Oxlint JS plugin
implements: concept-rule-catalog, concept-terse-output
:::
```

#### Lint plugin

The preset loads the plugin; apps do not configure it themselves.

```arc42
:::interface
id: if-lint-plugin
title: Lint plugin
provider: bb-lint-rules
protocol: Oxlint / ESLint plugin API
:::
```

### Check CLI

`lernapps check` runs every deterministic check (`check/`) and is the same command in hooks, CI and listing
validation:

| Part | Runs with | Contents |
|---|---|---|
| fast | `--pre-commit` | format, lint, type check of staged files |
| heavy | `--pre-push` | unit tests, build, checks of the built app, end-to-end tests in a browser (Playwright) |
| all | no flag, or both flags | both parts (CI) |

The checks of the built app work on a bundle or a deployed URL, without the source repo: requests to other hosts
before a click, storage, readable without JavaScript where the archetype requires it, 360 px without overflow, axe,
links, dependency licences, and the site rules by calling `lernapps-check` of the site frame for apps on
lernapps.net. With `--entry <file>` it also checks an entry against the app: the app's URL and every topic link
resolve, and the fitness values match. Each check carries its rule id and severity. The output is the validation
report.

```arc42
:::building-block
id: bb-check-cli
title: Check CLI
parent: bb-tooling-package
technology: TypeScript CLI, vite-plus, Playwright, axe-core
implements: concept-rule-catalog, concept-terse-output, concept-traceability, concept-stable-contracts
:::
```

#### Check CLI interface

Exit code 0 when no `error` rule fails; the report on standard output; `--report <file>` writes it to a file.

```arc42
:::interface
id: if-check-cli
title: Check CLI
provider: bb-check-cli
protocol: CLI `lernapps check [--pre-commit] [--pre-push] [<dir|url>] [--entry <file>]`
:::
```

#### Validation report

The result of a check run as YAML: what was checked (commit, or URL and time), the rules in scope, findings per rule
id with location and fix, suppressions with their reasons, and the fitness values for the entry. Deterministic: the
same input gives the same report. Its schema is published at lernapps.net as JSON Schema, which validates the YAML.

```arc42
:::interface
id: if-validation-report
title: Validation report
provider: bb-check-cli
protocol: YAML with published JSON Schema
:::
```

### Review procedure

The formal validation's judgment (`review/`): a prompt for an agent in a fresh context, the rubric of `reviewed`
rules per archetype, each item with its rule id, and the format of the verdict. The agent starts from the validation
report, reads the built bundle, the dependencies and the plan's retrospective, and judges what no check decides:
whether learners act themselves, ads, plain language, learner-specific data in public texts.

```arc42
:::building-block
id: bb-review-procedure
title: Review procedure
parent: bb-tooling-package
technology: Markdown
requires: if-validation-report
implements: concept-rule-catalog, concept-plain-language
:::
```

#### Review procedure interface

Its verdict names the reviewed commit and, per finding, the rule id, or proposes a new rule and where it would act.

```arc42
:::interface
id: if-review-procedure
title: Review procedure
provider: bb-review-procedure
protocol: Markdown prompt and rubric
:::
```

### Evals

Sample creator prompts, at least one per archetype, with the expected result (`evals/`). Run by hand with Claude
Code, Codex and Gemini CLI on their latest models; scored with the check CLI, the review procedure and the plan's
counters. They run before a change to the guidance is merged.

```arc42
:::building-block
id: bb-evals
title: Evals
parent: bb-tooling-package
technology: Markdown prompts, scoring script
requires: if-generator-cli, if-check-cli, if-validation-report, if-review-procedure
implements: concept-traceability
:::
```

## Archetype templates

lernapps/app-templates, one folder per archetype: the files the generator copies, each a working app that passes
every check. Each folder can be tried on its own; the logic stays in the package.

```arc42
:::building-block
id: bb-app-templates
title: Archetype templates
technology: lernapps/app-templates, one folder per archetype
:::
```

### Archetype templates interface

The generator copies one folder at the commit pinned in the package, so templates and presets change together.

```arc42
:::interface
id: if-archetype-templates
title: Archetype templates
provider: bb-app-templates
protocol: Files at a pinned commit of lernapps/app-templates
:::
```

## App check action

A composite action next to the site actions (`actions/app-check`): runs `lernapps check` without flags, exactly
what the hooks ran, with the Playwright browser cached; uploads the report. Apps on lernapps.net deploy with the
site actions after it.

```arc42
:::building-block
id: bb-app-check-action
title: App check action
technology: GitHub composite action
requires: if-check-cli
:::
```

### App check action interface

Used in the app's `pages.yml` next to the site actions, pinned to a commit and bumped by Renovate.

```arc42
:::interface
id: if-app-check-action
title: App check action
provider: bb-app-check-action
protocol: GitHub Actions `uses:` at a pinned commit
:::
```

## Listing validation

A workflow in lernapps/apps on pull requests that add or change an entry. It runs the checks of the built app against
the entry's URL with `--entry`, so it also confirms that the topic links resolve and the fitness values match. If
checks fail, it posts the report as a comment for the creator's assistant. The review agent then judges the rest;
the owner decides.

```arc42
:::building-block
id: bb-listing-validation
title: Listing validation
technology: GitHub Actions workflow in lernapps/apps
requires: if-check-cli, if-review-procedure, if-validation-report
implements: concept-terse-output, concept-traceability
:::
```

### Listing results comment

The validation report as a comment on the pull request, so the creator's assistant can fix the app and push again.

```arc42
:::interface
id: if-listing-comment
title: Listing results comment
provider: bb-listing-validation
protocol: GitHub pull request comment
:::
```
