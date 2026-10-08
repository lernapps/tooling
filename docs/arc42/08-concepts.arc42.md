# Cross-cutting Concepts

## Rule model

A **rule** is one requirement on an app, defined once in the rule catalog. It has:

| Attribute | Values | Meaning |
|---|---|---|
| scope | `listing`, `site`, `archetype:<name>` | which apps it applies to: every listed app wherever it is hosted; every page served on lernapps.net; apps built from that archetype |
| severity | `error`, `warning`, `hint` | error: must not be broken, the check or review fails. Warning: may be broken deliberately with a reason recorded in place (a suppression comment with a reason); the review sees every suppression. Hint: a recommendation, never fails |
| enforcement | `guided`, `checked`, `reviewed` | described in a skill only; decided by a lint rule or the check CLI; judged by the review agent from the rubric |
| pitfalls | text | common ways the rule gets broken, e.g. a video thumbnail loaded before the click |
| source | reference | where the rule comes from: ORGANIZATION.md, the listing criteria, the platform design, an owner decision, a review finding |

A `listing` rule is never a `warning`: a creator cannot argue their way past the fitness signal. The rules in scope
for an app are those of scope `listing`, of its archetype and, when it is served on lernapps.net, of scope `site`.

Examples:

| Rule | Scope | Severity | Enforcement |
|---|---|---|---|
| No requests to other servers before a click | listing | error | checked |
| Learners act themselves | listing | error | reviewed |
| Imprint and privacy notice linked | site | error | checked |
| Every page readable without JavaScript | archetype:explainer | error | checked |
| Learner texts come from the i18n files | archetype:explainer, archetype:interactive, archetype:quiz | warning | checked |
| Cite the curriculum source | archetype:explainer | hint | guided |

```arc42
:::concept
id: concept-rule-model
title: Rule model
category: guidance
:::
```

## Promotion path

Findings move down the layers so they are not found again: a finding of the review that recurs becomes a check
(enforcement `checked`) where a machine can decide it, otherwise a convention in a skill (`guided`); what is
forgotten again and again becomes a step or a question in the plan template. Only the rule's `enforcement` changes,
not its id. Every review finding names the rule and, if it has none yet, proposes one with the layer it should move
to. Contributions of experienced creators ([contributing best practices](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-contribute-practices)) enter the same way, as a pull request adding
a rule.

```arc42
:::concept
id: concept-promotion-path
title: Promotion path
category: guidance
:::
```

## Plan file

The assistant's plan in the app repo, readable by the creator, following EPCC:

- **Explore**: what the app is for, for whom, what the catalog needs to know (the assistant fetches the entry schema
  and asks what it needs), which archetype. Many turns are fine here.
- **Plan**: tasks per topic or question set; the creator confirms the plan. From here on, the assistant works on its
  own and comes back only for what it cannot decide (at most 3 creator turns, `qs-few-turns-after-plan`).
- **Code**: the generator, then the tasks, with the hooks giving feedback.
- **Commit**: publish (creator's checkpoint), validate, list (creator's checkpoint).

The front matter holds the archetype, the current phase and counters the hooks write (`prePushFailures`). The file
ends with the retrospective: phases reached, checks that failed and how often, the creator's turns after the plan,
where the assistant had to guess. Comments in the template explain each part, so the template itself guides the
assistant. The file stays in the creator's repo and reaches the platform only with a listing.

```arc42
:::concept
id: concept-plan-file
title: Plan file
category: process
:::
```

## Messages for agents

Every check message, from lint, hooks, the check CLI and the listing comment, has the same shape: rule id and
severity, where (file and line, or page and element), what was found, how to fix it, and a link to the rule. An
assistant can act on it without asking the creator; people can read it too. The same rule gives the same message
everywhere.

```arc42
:::concept
id: concept-agent-messages
title: Messages for agents
category: feedback
:::
```

## Validation report

The check CLI's result as JSON with a published schema: what was checked (commit, or URL and time), the rules in
scope, findings per rule, and the fitness values derived from them (`storage`, `thirdParty` of the entry). The same
input gives the same deterministic result. The entry's fitness values come from a report, never from the creator.
A fact sheet of an app deployed elsewhere can build on the commit the report names.

```arc42
:::concept
id: concept-validation-report
title: Validation report
category: validation
:::
```

## Versioned distribution

An app holds only thin files that refer to `@lernapps/tooling` (configuration that extends the preset, the hooks
installed by it, skills synced from it). The package is installed from git at a commit of `main`; Renovate moves every
app to the latest commit and merges when green. A change to a rule, a skill or a check therefore reaches every app
without editing it, and the evals run before the change is merged.

```arc42
:::concept
id: concept-versioned-distribution
title: Versioned distribution
category: distribution
:::
```

## Strict TypeScript

Every archetype is TypeScript only, strictly enforced: `strict` and the stricter compiler options
(`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`), no `any`, no JavaScript sources,
type check in the pre-commit hook and in CI. Data the creator supplies (topic pages, question bank) is typed and
validated at build time.

```arc42
:::concept
id: concept-strict-typescript
title: Strict TypeScript
category: code quality
:::
```

## i18n and accessibility

Texts for learners are German, plain language, and live in message files, not in code; the lint rules enforce it.
Every archetype is built for WCAG 2.1 AA and 360 px: semantic HTML, focus order, keyboard operation, contrast from
the site frame's tokens, no timing pressure without a way to turn it off. Readable without JavaScript: every page of
`explainer` and `quiz`, the start page of `interactive`.

```arc42
:::concept
id: concept-i18n-a11y
title: i18n and accessibility
category: usability
:::
```

## Third-party content

Content-heavy apps use material from others (Wikipedia, serlo, videos, curriculum quotes). It is bundled at build
time, never fetched at runtime; source and licence are named next to it; embeds from other servers load only after a
click (two-click embed). Video and article links are verified, never guessed.

```arc42
:::concept
id: concept-third-party-content
title: Third-party content
category: content
:::
```

## Measurement

The quality scenarios name their source (chapter 10): our evals, the listing reports, the plan's retrospective and
counters, conversations with creators. Nothing is collected in secret: counters and retrospective stay in the
creator's repo until they submit a listing. Feedback sent to the platform would need the creator's consent for each sending and
carry structured totals only.

```arc42
:::concept
id: concept-measurement
title: Measurement
category: quality
:::
```
