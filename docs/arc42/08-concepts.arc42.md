# Cross-cutting Concepts

## Rule catalog

A **rule** is one requirement on an app. The rule catalog is not a file or a block: it is the set of all rules,
each living in the artifacts where it acts. What makes it one catalog is a shared vocabulary and stable ids.

Every rule has:

| Attribute | Values | Meaning |
|---|---|---|
| id | a stable name, such as no-request-before-click | the same in every artifact, message and report; it never changes when the rule moves |
| scope | one or more of listing, site, or one archetype | which apps it applies to: every listed app wherever it is hosted; every page served on lernapps.net; the apps of that archetype |
| severity | error, warning, hint | error: must not be broken; the check or review fails. Warning: may be broken on purpose, with a reason recorded in place; the review sees every exception. Hint: a recommendation that never fails |

A listing rule is never a warning: a creator cannot argue their way past the fitness signal. The rules in scope for an
app are the listing rules, the rules of its archetype and, when it is served on lernapps.net, the site rules.

A rule can live in several artifacts at once, each deployed on its own; the shared id makes them one rule. A skill
tells it, so that the assistant prevents the problem. A lint rule or a check reports it, so that a slip is caught.
The review judges what no program decides. No artifact refers to the others:

| Artifact | Building block | Takes effect in |
|---|---|---|
| section of a skill, headed by the rule's id, scope and severity | `bb-skills` | the creator's agent harness |
| lint rule, named by the rule's id | `bb-lint-rules`, `bb-archetypes` | the editor and the commit; CI |
| check of the built app, carrying the rule's id and severity | `bb-check-cli` | the push; CI; the listing validation |
| item of the review rubric, headed by the rule's id | `bb-review-procedure` | the environment where lernapps agents run |

Every message links the rule's entry on the published rule page. The tooling's own check reads all artifacts and
tests each kind on its own: ids are valid and unique within the kind, and every message links its rule. The same
reading lists every rule by id, for agents and as the rule page. Whether the artifacts of one id still agree, which
rules lack a skill or a check, and which could move, is judged by an agent that reads that list. It reports and
changes nothing. Nothing is generated from a central file.

A rule moves when experience shows it can: a review finding that recurs becomes a lint rule or a check, a step that
assistants keep forgetting becomes a question in the plan template. The move is a pull request that adds the new
artifact and removes the old text; the id stays. Rules contributed by experienced creators enter the same way.

```arc42
:::concept
id: concept-rule-catalog
title: Rule catalog
category: guidance
:::
```

## Plain language

Texts for learners, teachers and parents are German in plain language (ISO 24495-1): short sentences, active voice,
no jargon. They live in message files, not in code. Shared infrastructure is English. Guidance for assistants (the
agent instructions, the plan template, the skills, the rubric) is direct and imperative: what to do, in which order,
with one example. The same holds for the messages of every check.

```arc42
:::concept
id: concept-plain-language
title: Plain language
category: language
:::
```

## Terse output

Every token an assistant reads costs the creator time and money. Output is short and structured:

- **Messages** have one shape in lint, hooks, check and listing comment: rule id and severity, where (file and
  line, or page and element), what was found, how to fix it, link to the rule. Nothing else; passing checks print
  one line.
- **Reports** are YAML, readable by people and agents without a viewer.
- **Guidance** is loaded when needed: the agent instructions stay short and point to skills; a skill covers one
  concern.

```arc42
:::concept
id: concept-terse-output
title: Terse output
category: efficiency
:::
```

## Logging and traceability

What runs is traceable without collecting anything about people. Every validation report names the commit (or address
and time) it checked; the hooks keep their counters in the plan, which is committed with the app;
the review verdict names the reviewed commit. Logs stay where the run happens: on the creator's machine, in the CI
log of the repo, in the environment where lernapps agents run. No log or report contains personal data, and the
tooling sends no telemetry.

```arc42
:::concept
id: concept-traceability
title: Logging and traceability
category: operations
:::
```

## Stable contracts

What others build on does not change silently: rule ids, the commands and options of the CLI, the inputs of the
actions, the entry points of the package, the schemas of the validation report and of the review verdict, and the
front matter of the plan file. The CLI's help and each action's description state these contracts where a user
meets them, and tests hold them. A
breaking change gets a new schema version or a new name, and Renovate brings it to every app with the evals run
before. The entry schema belongs to lernapps/apps; the tooling fetches it each time instead of copying it.

```arc42
:::concept
id: concept-stable-contracts
title: Stable contracts
category: evolution
:::
```
