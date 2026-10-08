# Runtime View

Four scenarios show how the building blocks work together: a new app from first prompt to listing pull request, a
failing push, the validation of a listing, and a rule that changes.

## A new app, from first prompt to listing

The creator asks their assistant for an app. The assistant reads `AGENTS.md`, explores the idea with the creator in
the plan file and confirms the plan with them. Then it works on its own: it generates the scaffold, builds with the
skills and the hooks' feedback, publishes, and lists the app from the plan and the validation report.

```arc42
:::runtime-scenario
id: rs-new-app
title: A new app, from first prompt to listing
trigger: A creator asks their AI assistant for a learning app
involves: bb-process-guidance, bb-generator, bb-app-template, bb-skills, bb-archetypes, bb-lint-rules, bb-git-hooks, bb-check-cli, bb-app-check-action, bb-listing-validation
:::
```

```arc42
:::diagram
id: rs-new-app-sequence
scenario: rs-new-app
notation: mermaid-sequence
aliases: creator=actor-creator, assistant=actor-assistant, guidance=bb-process-guidance, generator=bb-generator, templates=bb-app-template, skills=bb-skills, hooks=bb-git-hooks, check=bb-check-cli, ci=bb-app-check-action, listing=bb-listing-validation
:::
```

```mermaid
sequenceDiagram
    participant creator as Creator
    participant assistant as Assistant
    participant guidance as AGENTS.md and plan
    participant generator as Generator
    participant templates as Templates
    participant skills as Skills
    participant hooks as Git hooks
    participant check as Check CLI
    participant ci as App check action
    participant listing as Listing validation
    assistant->>guidance: read AGENTS.md, start the plan file
    assistant->>creator: Explore: purpose, learners, catalog questions
    creator->>assistant: answers, confirms the plan
    assistant->>generator: lernapps create --archetype quiz
    generator->>templates: copy the archetype folder
    assistant->>skills: load the skills of the archetype and topic
    assistant->>hooks: commit (vp staged: format, lint rules, types)
    assistant->>hooks: push
    hooks->>check: static checks
    check-->>assistant: messages for agents, or ok
    assistant->>ci: pull request in the app repo
    ci->>check: checks with --browser
    assistant->>creator: checkpoint: publish
    assistant->>listing: entry from plan and report, pull request to lernapps/apps
```

## A push fails

The pre-push hook finds a request to another server in a built page. It prints the message, counts the failure in the
plan's front matter, and the assistant fixes the app without asking the creator.

```arc42
:::runtime-scenario
id: rs-push-fails
title: A push fails
trigger: The assistant pushes a commit that breaks a checked rule
involves: bb-git-hooks, bb-check-cli, bb-process-guidance
:::
```

```arc42
:::diagram
id: rs-push-fails-sequence
scenario: rs-push-fails
notation: mermaid-sequence
aliases: assistant=actor-assistant, hooks=bb-git-hooks, check=bb-check-cli, plan=bb-process-guidance
:::
```

```mermaid
sequenceDiagram
    participant assistant as Assistant
    participant hooks as Pre-push hook
    participant check as Check CLI
    participant plan as Plan file
    assistant->>hooks: git push
    hooks->>check: lernapps check _site
    check-->>hooks: error no-external-before-click, page, element, fix
    hooks->>plan: prePushFailures + 1
    hooks-->>assistant: push refused, message
    assistant->>assistant: fix, commit (with the counter)
    assistant->>hooks: git push
    hooks->>check: lernapps check _site
    check-->>hooks: ok
```

## A listing is validated

A pull request adds an entry to lernapps/apps. The listing validation checks the deployed app and compares the
report with the entry. On failure it comments the deterministic results; the creator's assistant fixes the app and
pushes again. Then the review agent judges the rest and the owner decides.

```arc42
:::runtime-scenario
id: rs-listing-validated
title: A listing is validated
trigger: A pull request to lernapps/apps adds or changes an entry
involves: bb-listing-validation, bb-check-cli, bb-review-procedure
:::
```

```arc42
:::diagram
id: rs-listing-validated-sequence
scenario: rs-listing-validated
notation: mermaid-sequence
aliases: assistant=actor-assistant, listing=bb-listing-validation, check=bb-check-cli, review=actor-review-agent, procedure=bb-review-procedure, owner=actor-owner
:::
```

```mermaid
sequenceDiagram
    participant assistant as Creator's assistant
    participant listing as Listing validation
    participant check as Check CLI
    participant review as Review agent
    participant procedure as Review procedure
    participant owner as Owner
    assistant->>listing: pull request with the entry
    listing->>check: lernapps check --browser <url>
    check-->>listing: validation report
    listing-->>assistant: comment with the deterministic results (on failure)
    assistant->>listing: fix in the app, push the entry again
    listing->>check: second run
    check-->>listing: report, fitness values match the entry
    owner->>review: start the review of the pull request
    review->>procedure: prompt and rubric
    review-->>owner: verdict for the reviewed commit
    owner->>listing: merge or decline
```

## A rule changes

The owner tightens a rule, or a creator contributes one. The catalog changes in one place; skills, lint rules,
checks and rubric follow; the evals run; after the merge, Renovate brings the new package commit to every app.

```arc42
:::runtime-scenario
id: rs-rule-changes
title: A rule changes
trigger: A pull request to lernapps/tooling changes the rule catalog
involves: bb-rule-catalog, bb-skills, bb-lint-rules, bb-check-cli, bb-review-procedure, bb-evals
:::
```

```arc42
:::diagram
id: rs-rule-changes-sequence
scenario: rs-rule-changes
notation: mermaid-sequence
aliases: owner=actor-owner, catalog=bb-rule-catalog, skills=bb-skills, lint=bb-lint-rules, check=bb-check-cli, procedure=bb-review-procedure, evals=bb-evals, github=actor-github
:::
```

```mermaid
sequenceDiagram
    participant owner as Owner
    participant catalog as Rule catalog
    participant skills as Skills
    participant lint as Lint rules
    participant check as Check CLI
    participant procedure as Review rubric
    participant evals as Evals
    participant github as GitHub (Renovate)
    owner->>catalog: change a rule (scope, severity, enforcement)
    catalog->>skills: regenerate rule sections
    catalog->>lint: severities
    catalog->>check: rules in scope
    catalog->>procedure: regenerate rubric
    owner->>evals: run by hand with three assistants
    evals-->>owner: scores per archetype
    owner->>github: merge to main
    github->>github: Renovate bumps the package in every app, merges when green
```
