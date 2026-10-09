# Cross-cutting Concepts

## Rule catalog

A **rule** is one requirement on an app. The rule catalog is not a file or a block: it is the set of all rules,
each living in the artifact where it acts. What makes it one catalog is a shared vocabulary and stable ids.

Every rule has:

| Attribute | Values | Meaning |
|---|---|---|
| id | stable name, e.g. `no-request-before-click` | the same id in every artifact, message and report; it never changes when the rule moves |
| scope | one or more of `listing`, `site`, `archetype:<name>` | which apps it applies to: every listed app wherever it is hosted; every page served on lernapps.net; apps of that archetype |
| severity | `error`, `warning`, `hint` | error: must not be broken, the check or review fails. Warning: may be broken deliberately with a reason recorded in place; the review sees every suppression. Hint: a recommendation, never fails |
| enforcement | `guided`, `checked`, `reviewed` | told in a skill; decided by a lint rule or a check; judged by the review agent |

A `listing` rule is never a `warning`: a creator cannot argue their way past the fitness signal. The rules in scope
for an app are those of scope `listing`, of its archetype and, when it is served on lernapps.net, of scope `site`.

Where the rules live, and where they take effect:

| Enforcement | Artifact | Building block | Takes effect in |
|---|---|---|---|
| guided | a section of a skill; "must" for errors, "should" or "may" for hints | `bb-skills` | the creator's agent harness |
| checked on source | a rule of the lint plugin; severity in the preset's configuration | `bb-lint-rules`, `bb-archetypes` | the editor and the pre-commit hook, on the creator's machine; CI |
| checked on the built app | a check of the check CLI, with its severity | `bb-check-cli` | the pre-push hook; CI; the listing validation |
| reviewed | an item of the review rubric | `bb-review-procedure` | the environment where lernapps agents run |

Each rule is declared once, in the section that explains it, by a rule block: a fenced block with the info string
`rule` right under the section's heading, one key per line (`id`, `scope`, `severity`, `enforcement`). A rule a
program checks is still explained in a skill, because that is what the assistant reads; its lint rule or check
implements it and carries only the id and the link:

| Artifact | Declares or implements | Where |
|---|---|---|
| section of a skill | declares a `guided` or `checked` rule with a rule block | `skills/**/*.md` |
| item of the review rubric | declares a `reviewed` rule with a rule block | `review/**/*.md` |
| lint rule | implements a `checked` rule: the file name is the id, `meta.docs.url` the link | `lint/rules/<id>.ts` |
| check of the check CLI | implements a `checked` rule: its default export has `id` and `url` | `check/rules/*.ts` |

The severity is the one in the rule block; the preset's lint configuration and the check use the same. The link of
every message is the rule's entry on the rule page, `https://lernapps.net/tooling/rules/#<id>`. The tooling's own
build reads all artifacts and tests that ids are declared once, that every `checked` rule has an implementation and
every implementation a declared `checked` rule, and that every message links to where its rule is explained
(`scripts/rules.ts`, run by the tests in `lernapps check`). The same reading produces the rule page of the docs
site, which shows each rule's section. Nothing is generated from a central file.

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

What others build on does not change silently: rule ids, the commands and flags of the CLI, the subpath exports of
the package, the schema of the validation report and the front matter of the plan file. A breaking change gets a
new schema version or a new name, and Renovate brings it to every app with the evals run before. The entry schema
belongs to lernapps/apps; the tooling fetches it each time instead of copying it.

```arc42
:::concept
id: concept-stable-contracts
title: Stable contracts
category: evolution
:::
```
