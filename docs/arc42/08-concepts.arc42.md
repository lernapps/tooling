# Cross-cutting Concepts

## Rule catalog

A **rule** is one requirement on an app. The rule catalog is not a file or a block: it is the set of all rules,
each living in the artifacts where it acts. What makes it one catalog is a shared vocabulary and stable ids.

Every rule has:

| Attribute | Values | Meaning |
|---|---|---|
| id | stable name, e.g. `no-request-before-click` | the same id in every artifact, message and report; it never changes when the rule moves |
| scope | one or more of `listing`, `site`, `archetype:<name>` | which apps it applies to: every listed app wherever it is hosted; every page served on lernapps.net; apps of that archetype |
| severity | `error`, `warning`, `hint` | error: must not be broken, the check or review fails. Warning: may be broken deliberately with a reason recorded in place; the review sees every suppression. Hint: a recommendation, never fails |

A `listing` rule is never a `warning`: a creator cannot argue their way past the fitness signal. The rules in scope
for an app are those of scope `listing`, of its archetype and, when it is served on lernapps.net, of scope `site`.

A rule can live in several artifacts at once, each a different deployment unit; the shared id makes them one rule.
A skill tells it, so that the assistant prevents the problem; a lint rule or check reports it, so that a slip is
caught; the review judges what no program decides. No artifact refers to the others:

| Artifact | Carries a rule as | Building block | Takes effect in |
|---|---|---|---|
| section of a skill (`skills/**/*.md`) | a `rule` block with id, scope and severity under the section's heading; "must" for errors, "should" or "may" for hints | `bb-skills` | the creator's agent harness |
| lint rule (`lint/rules/<id>.ts`) | its file name; `meta.docs.url` links the rule; severity in the preset's configuration | `bb-lint-rules`, `bb-archetypes` | the editor and the pre-commit hook; CI |
| check of the check CLI (`check/rules/*.ts`) | `id`, `url` and `severity` in its default export | `bb-check-cli` | the pre-push hook; CI; the listing validation |
| item of the review rubric (`review/rubric.md` for every app, `review/archetypes/<name>.md` per archetype) | a `rubric` block with its id under the item's heading; every item has one | `bb-review-procedure` | the environment where lernapps agents run |

The link of every message is the rule's entry on the rule page, `https://lernapps.net/tooling/rules/#<id>`. The
tooling's own build reads all artifacts and tests each kind on its own: ids are valid and unique within the kind,
and every message links to its rule (`scripts/rules.ts`, run by the tests in `lernapps check`). The same reading
lists every rule grouped by id, as YAML for agents and as the rule page of the docs site. Whether the artifacts of
one id still agree, which rules lack a skill or a check, and which could move, is judged by an agent that reads
that list; it reports and changes nothing. Nothing is generated from a central file.

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
no jargon; they live in message files, not in code. Shared infrastructure is English. Guidance for assistants
(`AGENTS.md`, plan template, skills, rubric) is direct and imperative: what to do, in which order, with one
example. The same applies to the messages of every check.

```arc42
:::concept
id: concept-plain-language
title: Plain language
category: language
:::
```

## Terse output

Every token an assistant reads costs the creator time and money. Output is short and structured:

- **Messages** have one shape in lint, hooks, check CLI and listing comment: rule id and severity, where (file and
  line, or page and element), what was found, how to fix it, link to the rule. Nothing else; passing checks print
  one line.
- **Reports** are YAML, readable by people and agents without a viewer.
- **Guidance** is loaded when needed: `AGENTS.md` stays short and points to skills; a skill covers one concern.

```arc42
:::concept
id: concept-terse-output
title: Terse output
category: efficiency
:::
```

## Logging and traceability

What runs is traceable without collecting anything about people. Every validation report names the commit (or URL
and time) it checked; the hooks keep their counters in the plan file's front matter, which is committed with the app;
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

What others build on does not change silently: rule ids, the commands and flags of the CLI, the subpath exports of the
package, the schemas of the validation report and of the review verdict, and the front matter of the plan file. A
breaking change gets a new schema version or a new name, and Renovate brings it to every app with the evals run
before. The entry schema belongs to lernapps/apps; the tooling fetches it each time instead of copying it.

```arc42
:::concept
id: concept-stable-contracts
title: Stable contracts
category: evolution
:::
```
