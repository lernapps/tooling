# Cross-cutting Concepts

## Rule catalog

A **rule** is one requirement on an app. The rule catalog is not a file or a block: it is the set of all rules,
each living in the artifacts where it acts. What makes it one catalog is a shared vocabulary and stable ids.

Every rule has:

| Attribute | Values | Meaning |
|---|---|---|
| id | a stable name, such as no-request-before-click | the same in every artifact, message and report; it never changes when the rule moves |
| scope | listing, tooling, one or more archetypes, or a list of them | which apps it applies to: every listed app, however it is built and wherever it is hosted; the apps built with the tooling; the apps of that archetype |
| severity | error, warning, hint | error: must not be broken; the check or review fails. Warning: may be broken on purpose, with a reason recorded in place; the review sees every exception. Hint: a recommendation that never fails |

Scope `tooling` holds the rules that presuppose the plan workflow or the tooling's checks (the plan file, the
checkpoints, the retrospective, the content guide, `lernapps check`, suppressions). They apply to an app built with
the tooling; an app built freely (by hand, with another framework, with an app builder) is held to
the listing rules alone and never fails its listing for lacking a plan file. An app is built with the tooling when its
`package.json` lists `@lernapps/tooling` in `dependencies` or `devDependencies`: the generator writes it into every
app, and it needs no marker of its own. The plan file cannot be the marker, since `plan-file` is about its absence.
`npm run rules -- --app <dir>` lists the rules in scope for one app; the review judges those alone.

A tooling rule never blocks a listing, since the catalog takes apps built in completely different ways: in the
listing validation and the review its findings are warnings at most, advice for the creator, even for an app built
with the tooling (`atListing` in `npm run rules`; the verdict check refuses a tooling finding of severity error).
In the app's repo its declared severity holds: the assistant follows it, and the hooks and checks enforce it (a
failing pre-push check still fails the push). The listing validation (`lernapps check --entry`) checks the built app
on its URL or bundle, without the repo, so no tooling check runs there. An app may deviate from the listing rules
`accessible` and `usable-at-360px` where its idea needs it and says so in its catalog entry (`limits`), where teachers and parents read it; with `limits` in the entry, their findings are warnings. The
rules in scope for an app are the listing rules, the tooling rules when it is built with the tooling, and the rules
of its archetype. The rules of lernapps.net's own websites are not in the
catalog: the shared site frame owns them.

A rule can live in several artifacts at once, each deployed on its own; the shared id makes them one rule. A skill
tells it, so that the assistant prevents the problem. A lint rule or a check reports it, so that a slip is caught.
The review judges what no program decides. No artifact refers to the others:

| Artifact | Building block | Takes effect in |
|---|---|---|
| section of a skill or of the workflow rules, headed by the rule's id, scope and severity | `bb-skills`, `bb-process-guidance` | the creator's agent harness |
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

## Components under a contract

Content is data; code enters an app of a content archetype in one place only: a component, for what no built-in block
can express. A component is accountable for what it does; the runtime and the tooling make sure it cannot break the
archetype's promise:
- it is used by a block of the content that carries its props and a text for readers without a script, so the page
  means the same without it;
- the runtime renders it at build and runs it only where it is used; its props are checked against its own types;
- what it may do is narrow and the same everywhere: no network, no code or markup from strings, imports only from
  the framework, the runtime and the tooling's helpers, browser features only once it runs, a size budget. The
  archetype's build checks this on what it compiles, the lint rules in the editor, under the same rule ids;
- one that is an exercise keeps its logic apart, as pure functions that the build tests over fixed seeds; every
  component has its own test, and the check type-checks it.

The explainer uses this model first; the interactive archetype is to share it.

```arc42
:::concept
id: concept-components
title: Components under a contract
category: development
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
