# Glossary

## Archetype

Not "template": the template is only one part of an archetype. Names describe what the app is like, not what it is used for.

```arc42
:::glossary-term
id: term-archetype
title: Archetype
definition: A kind of app the tooling supports, named after its character; a template, a preset, skills and the rules in scope.
:::
```

## Assistant

The platform design calls them [AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants); in the files the assistant reads, we say agent. Not part of the system.

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
definition: The person who builds an app with their assistant, typically a teacher or parent.
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

They feed the platform's [fitness signal](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-fitness-signal): checked, not declared.

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

A move is a pull request that adds the new artifact and removes the old text; the id stays.

```arc42
:::glossary-term
id: term-promotion-path
title: Promotion path
definition: How a rule moves to the layer where it works best - a recurring review finding becomes a lint rule or check, a forgotten step a question in the plan template.
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

Replaces the loose terms criterion, convention and guideline: their difference is expressed by scope and severity. One rule can be told in a skill and checked by a program at the same time, under one id. All rules together are the rule catalog (chapter 8).

```arc42
:::glossary-term
id: term-rule
title: Rule
definition: One requirement on an app, with a stable id, scope (listing, site, archetype), and severity (error, warning, hint); it lives as skill text, lint rule, check or rubric item, often in several of them under the same id.
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

Bound to the commit it checked, so a fact sheet can trace the deployed app to it.

```arc42
:::glossary-term
id: term-validation-report
title: Validation report
definition: The YAML result of the check CLI for one commit or URL - findings per rule id and the fitness values; its schema is published.
:::
```

## Verdict

The judgment part of the formal validation, next to the validation report; the owner decides on the listing.

```arc42
:::glossary-term
id: term-verdict
title: Verdict
definition: The YAML result of the review agent for one commit - findings per rule id, or proposed new rules and where they would act; its schema is published.
:::
```
