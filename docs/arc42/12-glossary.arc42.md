# Glossary

## Archetype

Not "template": the template is only one part of an archetype. Names describe what the app is like, not what it is used for.

```arc42
:::glossary-term
id: term-archetype
title: Archetype
definition: A kind of app the tooling supports, named after its character (explainer, interactive, quiz); a bundle of template, preset, skills, rules in scope and review rubric.
:::
```

## Assistant

The platform design calls them AI assistants (`e-ai-assistants`); in the files the assistant reads, we say agent. Not part of the system.

```arc42
:::glossary-term
id: term-assistant
title: Assistant
definition: The creator's AI coding agent (e.g. Claude Code, Codex, Gemini CLI); called "agent" in the plan and the skills.
:::
```

## Checkpoint

After the creator confirms the plan, the assistant comes back at most three times (`qs-few-turns-after-plan`).

```arc42
:::glossary-term
id: term-checkpoint
title: Checkpoint
definition: A point in the plan where the assistant stops for the creator's decision - confirming the plan, publishing, listing.
:::
```

## Creator

Not "developer": most creators are not professional developers.

```arc42
:::glossary-term
id: term-creator
title: Creator
definition: The person who builds an app with their assistant, typically a teacher or parent (platform design e-creators).
:::
```

## EPCC

Written out in `AGENTS.md` as plain instructions; the MCP server of codemcp/workflows is optional.

```arc42
:::glossary-term
id: term-epcc
title: EPCC
definition: Explore, Plan, Code, Commit - the phases of the plan file, after the workflow of the same name in codemcp/workflows.
:::
```

## Evals

Run by hand with Claude Code, Codex and Gemini CLI on their latest models (`dec-evals-by-hand`).

```arc42
:::glossary-term
id: term-evals
title: Evals
definition: Sample creator prompts run by the owner with several assistants to test the guidance itself before a change is merged.
:::
```

## Fitness values

They feed the platform's fitness signal (`ch-fitness-signal`): checked, not declared.

```arc42
:::glossary-term
id: term-fitness-values
title: Fitness values
definition: The fitness block of an entry (what an app stores, whether it contacts third parties); taken from a validation report, not declared by the creator.
:::
```

## Listing

Not "registration" or "submission". The listing is the only way an app connects to the platform.

```arc42
:::glossary-term
id: term-listing
title: Listing
definition: An app's entry in lernapps/apps, added by a pull request, validated, and accepted by the owner.
:::
```

## Plan file

Lives in the app repo and is readable by the creator; it reaches the platform only with a listing.

```arc42
:::glossary-term
id: term-plan-file
title: Plan file
definition: The assistant's Markdown plan in the app repo with phases, checkpoints, front matter counters and a closing retrospective.
:::
```

## Promotion path

Only the rule's enforcement changes; its id stays.

```arc42
:::glossary-term
id: term-promotion-path
title: Promotion path
definition: How a recurring finding moves to a lower layer - from review to a check, otherwise to a skill, or to a step in the plan template.
:::
```

## Question bank

Typed and validated at build time against the quiz's schema.

```arc42
:::glossary-term
id: term-question-bank
title: Question bank
definition: The typed questions, options, answers, feedback and explanations a quiz creator supplies; the only creator input of the quiz archetype.
:::
```

## Retrospective

Explained in comments of the plan template; the counters in the front matter are written by the hooks, not by the assistant.

```arc42
:::glossary-term
id: term-retrospective
title: Retrospective
definition: The last section of the plan file, filled by the assistant at the end - phases reached, failed checks, the creator's turns after the plan, where it had to guess.
:::
```

## Rule

Replaces the loose terms criterion, convention and guideline: their difference is expressed by scope and severity.

```arc42
:::glossary-term
id: term-rule
title: Rule
definition: One requirement on an app in the rule catalog, with scope (listing, site, archetype), severity (error, warning, hint), enforcement (guided, checked, reviewed), pitfalls and source.
:::
```

## Rules in scope

Skills, checks and rubric work on the rules in scope of the app at hand.

```arc42
:::glossary-term
id: term-rules-in-scope
title: Rules in scope
definition: The rules that apply to one app - scope listing, its archetype, and scope site when it is served on lernapps.net.
:::
```

## Validation report

Bound to the commit it checked, so a later fact sheet can trace the deployed app to it.

```arc42
:::glossary-term
id: term-validation-report
title: Validation report
definition: The JSON result of the check CLI for one commit or URL - findings per rule and the fitness values; its schema is published.
:::
```
