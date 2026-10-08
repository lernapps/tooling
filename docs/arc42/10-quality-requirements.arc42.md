# Quality Requirements

The quality goals below decide between conflicting requirements of the app-creation tooling. They follow from the
platform design: creators list an app when it costs minutes (D8 `a-creators-list`), apps collect nothing in secret
(KD-18 of the platform design), and AI assistants are a partner the platform designs for (D1, D2).

## 10.1 Quality Goals

## Low effort from idea to listing

Reach is no reason for creators to start (D4), so building and listing an app has to cost little. The creator makes
a few clear decisions; the agent always knows the next step, gets fast feedback and fixes problems without asking.
When this goal conflicts with flexibility of the toolchain, low effort wins: fewer choices, stricter defaults.

```arc42
:::quality-goal
id: qg-low-effort
title: Low effort from idea to listing
priority: high
:::
```

## No hidden data collection

No app built with the tooling and no app that passes validation collects anything in secret: no requests to other
servers before a click, nothing stored outside the device, no tracking. This is the platform's promise to adopting
adults and the condition for listing. When it conflicts with features or convenience, it wins.

```arc42
:::quality-goal
id: qg-no-hidden-collection
title: No hidden data collection
priority: high
:::
```

## Trustworthy validation

The fitness signal of an entry is measured, not self-declared. A validation result is reproducible, names what was
checked and how, and is bound to one commit of the app. It covers apps built without the tooling as well.

```arc42
:::quality-goal
id: qg-trustworthy-validation
title: Trustworthy validation
priority: high
:::
```

## Works with any agent

Creators bring their own AI agent. Guidance and enforcement must not depend on one vendor, on an MCP server or on
agent-specific hooks; the agent-specific parts only add convenience.

```arc42
:::quality-goal
id: qg-agent-neutral
title: Works with any agent
priority: high
:::
```

## Rules stay current in every app

A rule, a check or a piece of guidance is defined in one place. A change reaches every app through its dependency
updates, not through copying, and changes to the guidance are tested before they reach creators.

```arc42
:::quality-goal
id: qg-rules-stay-current
title: Rules stay current in every app
priority: medium
:::
```

## 10.2 Quality Scenarios

## First app of a new creator

The riskiest assumption of the MVP is that creators list an app when it costs minutes (D8 `a-creators-list`).

```arc42
:::quality-scenario
id: qs-first-app
title: First app of a new creator
quality: qg-low-effort
stimulus: A creator who has never used the tooling asks their agent for a small app on one topic, starting from the guidance
response: The agent works through the plan phase by phase, asks the creator only at the defined checkpoints, and ends with a validated app and a pull request with its entry to lernapps/apps
metric: At most 4 creator decisions (scope, plan, publish, list) and less than one hour of agent time for an app with up to 6 topics
:::
```

## A check fails

Agents fix what they understand. An error message is their prompt.

```arc42
:::quality-scenario
id: qs-actionable-failure
title: A check fails
quality: qg-low-effort
stimulus: A deterministic check fails on a commit or push
response: The message names the rule, the file or page, what was found, and how to fix it
metric: The agent fixes the finding without asking the creator in at least 9 of 10 cases in the evals
:::
```

## An external request slips in

A web font, a CDN script or a video thumbnail sends the learner's IP address to another server before any click.

```arc42
:::quality-scenario
id: qs-external-request
title: An external request slips in
quality: qg-no-hidden-collection
stimulus: An agent adds a resource that loads from another server on page load
response: The pre-push hook and the validation both fail and name the page, the host and the element
metric: 0 requests to other hosts before a click in any app that passes validation
:::
```

## An app not built with the tooling

Some creators already have an app, e.g. a claude.ai artifact or a site of their own; the Mathe-Karte builds with Eleventy.

```arc42
:::quality-scenario
id: qs-foreign-app
title: An app not built with the tooling
quality: qg-trustworthy-validation
stimulus: A listing pull request names an app that was not generated from a scaffold
response: The validation runs on the deployed URL or the built bundle alone and produces the same report as for a scaffolded app
metric: Every deterministic check runs without access to the app's source repository
:::
```

## Validation is repeated

The owner and adopting adults rely on the result; a check that passes once and fails the next time is no signal.

```arc42
:::quality-scenario
id: qs-repeatable-validation
title: Validation is repeated
quality: qg-trustworthy-validation
stimulus: The deterministic part of the validation runs twice on the same commit
response: Both runs give the same findings and the same fitness values; the report names the commit
metric: Identical deterministic results for the same commit; every entry's fitness values come from a report
:::
```

## A creator uses another agent

The guidance is written for any agent; Claude Code is only the one the owner uses.

```arc42
:::quality-scenario
id: qs-other-agent
title: A creator uses another agent
quality: qg-agent-neutral
stimulus: A creator builds an app with an agent other than Claude Code, without an MCP server
response: The agent reads the workflow from AGENTS.md, writes the plan file, loads the skills, and the git hooks run the same checks
metric: The evals pass with at least two different agents
:::
```

## A rule changes

A template copied once drifts; the scaffold therefore refers to versioned packages (plan KD-05).

```arc42
:::quality-scenario
id: qs-rule-change
title: A rule changes
quality: qg-rules-stay-current
stimulus: The owner tightens a check or a convention in the tooling
response: The change is released once; every app built from a scaffold gets it with its next dependency update pull request, and the evals run before release
metric: No file in an app repo has to be edited by hand to receive the change
:::
```
