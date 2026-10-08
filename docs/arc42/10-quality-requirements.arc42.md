# Quality Requirements

The quality goals below decide between conflicting requirements of the app-creation tooling. Each one is grounded
in the platform design (<https://lernapps.net/docs/platform-design/>): the value proposition of the creators'
journey `x-list-and-hear-back` ("Build your app faster with good guidance, list it in minutes"), the gains of the
partner role `e-ai-assistants`, the channels `ch-listing`, `ch-fitness-signal` and `ch-feedback`, and the decision
that nothing is collected in secret (KD-18 of the platform design).

## How the scenarios are measured

We cannot observe other people's AI assistants, and the platform collects nothing in secret. As in the MVP (D8),
the scenarios are learning tests with small absolute numbers, not statistics. Each metric names its source:

- **Evals**: we run several assistants ourselves on sample creator prompts, one set per archetype. The only source
  for iterations and for comparing assistants.
- **Listing reports**: the validation report of every listing pull request (first-pass rate, findings per rule).
- **Retrospective**: the section the agent writes at the end of its plan file (phases, failed checks, questions
  to the creator, where it had to guess). It stays in the creator's repo and reaches the platform only with a
  listing.
- **Conversations**: the owner talks to each creator after listing (D8 `a-creators-unpaid`).

Agent feedback sent with the creator's consent would add sessions that never reach a listing; it is deferred until
the anonymous thanks service exists ([lernapps/tooling#8](https://github.com/lernapps/tooling/issues/8)).

## 10.1 Quality Goals

## Simple to build with guidance

Creators have little time and build alongside their actual job (`e-creators` pressure "Little time"); the
journey promises to "build your app faster with good guidance" (`x-list-and-hear-back`). This goal is about
simplicity for the creator: few, clear decisions, the next step always known, no need to know the platform's rules
or the toolchain. When it conflicts with flexibility, simplicity wins: fewer choices, stricter defaults.

```arc42
:::quality-goal
id: qg-simple-to-build
title: Simple to build with guidance
priority: high
:::
```

## List in minutes

Reach is no reason for creators to start (D4), so the first listing has to cost almost nothing: "Contributing an
app takes minutes" (`ch-listing`, `s-listing-help`). This tests the riskiest assumption of the MVP,
`a-creators-list`.

```arc42
:::quality-goal
id: qg-list-in-minutes
title: List in minutes
priority: high
:::
```

## Checked, not declared

Adults decide whether to use an app from its listing; what an app sends to third parties is "checked rather than
declared" (`ch-fitness-signal`). Teachers use an app without checking it themselves (`a-trust-built-in`), so the
validation must be trustworthy: reproducible, bound to one commit, and the same for apps not built with the tooling.

```arc42
:::quality-goal
id: qg-checked-not-declared
title: Checked, not declared
priority: high
:::
```

## Nothing collected in secret

The apps collect nothing and stay frontend-only (KD-18). The tooling follows the same rule towards creators:
it sends nothing about a creator, an app or a session without the creator's explicit consent, and then only
structured totals (`ch-feedback`). When this conflicts with features or convenience, it wins.

```arc42
:::quality-goal
id: qg-nothing-collected
title: Nothing collected in secret
priority: high
:::
```

## Fewer iterations for the assistant

AI assistants want to "reach a working app with fewer iterations and less guessing" (`e-ai-assistants`
convenience gain). This goal is about cost: every iteration costs the creator time and money for their assistant.
Fast, precise feedback and a scaffold that already meets the rules keep iterations down.

```arc42
:::quality-goal
id: qg-few-iterations
title: Fewer iterations for the assistant
priority: medium
:::
```

## Works through any assistant

"Whatever lernapps.net offers creators has to work through their AI assistants" (`e-ai-assistants`), and the
providers compete. Guidance and enforcement must not depend on one vendor, an MCP server or agent-specific hooks.

```arc42
:::quality-goal
id: qg-any-assistant
title: Works through any assistant
priority: medium
:::
```

## The guidance evolves

Maintaining the guidance is an activity of the creators' journey, paid with the owner's time
(`x-list-and-hear-back`), and experienced creators bring their own practices into it (`s-contribute-practices`).
A rule lives in one place; a change reaches every app through its dependency updates, and is tested before it
reaches creators.

```arc42
:::quality-goal
id: qg-guidance-evolves
title: The guidance evolves
priority: medium
:::
```

## 10.2 Quality Scenarios

## Few decisions for a new creator

The creator decides what matters and nothing else: scope, plan, publishing, listing.

```arc42
:::quality-scenario
id: qs-few-decisions
title: Few decisions for a new creator
quality: qg-simple-to-build
stimulus: A creator who has never used the tooling asks their assistant for a small app on one topic
response: The assistant works through the plan phase by phase and asks the creator only at the defined checkpoints
metric: At most 4 decisions by the creator in at least 4 of the first 5 listings (source - retrospective)
:::
```

## Creators name the guidance

The creators' own view is the main source in the MVP (D8).

```arc42
:::quality-scenario
id: qs-guidance-named
title: Creators name the guidance
quality: qg-simple-to-build
stimulus: The owner talks to a creator after their first listing
response: The creator describes building as simpler than without the guidance
metric: Most of the first 5 to 10 creators name the guidance as a reason it went fast (source - conversations)
:::
```

## An archetype in the evals

Iterations can only be counted where we run the assistant ourselves.

```arc42
:::quality-scenario
id: qs-eval-iterations
title: An archetype in the evals
quality: qg-few-iterations
stimulus: The evals run a sample creator prompt for an archetype
response: The assistant reaches an app that passes validation
metric: At most N failed pre-push runs per app (source - evals)
:::
```

## A check fails

Agents fix what they understand. An error message is their prompt.

```arc42
:::quality-scenario
id: qs-actionable-failure
title: A check fails
quality: qg-few-iterations
stimulus: A deterministic check fails on a commit or push
response: The message names the rule, the file or page, what was found, and how to fix it
metric: The assistant fixes it without asking the creator in every eval run; no listing retrospective names a check message as unclear (source - evals, retrospective)
:::
```

## The first listings

The listing is generated from the plan and the validation report, not typed by the creator.

```arc42
:::quality-scenario
id: qs-first-listings
title: The first listings
quality: qg-list-in-minutes
stimulus: A creator with a working app asks their assistant to list it
response: The assistant fills the entry from the plan and the validation report and opens the pull request to lernapps/apps
metric: At least 4 of the first 5 listing pull requests pass validation on the first run, and no creator types an entry field by hand (source - listing reports, retrospective)
:::
```

## An app not built with the tooling

Some creators already have an app, e.g. a claude.ai artifact or a site of their own; the Mathe-Karte builds with
Eleventy.

```arc42
:::quality-scenario
id: qs-foreign-app
title: An app not built with the tooling
quality: qg-checked-not-declared
stimulus: A listing pull request names an app that was not generated from a scaffold
response: The validation runs on the deployed URL or the built bundle alone and produces the same report as for a scaffolded app
metric: Every deterministic check runs without access to the app's source repository (source - listing reports)
:::
```

## Validation is repeated

The owner and adopting adults rely on the result; a check that passes once and fails the next time is no signal.

```arc42
:::quality-scenario
id: qs-repeatable-validation
title: Validation is repeated
quality: qg-checked-not-declared
stimulus: The deterministic part of the validation runs twice on the same commit
response: Both runs give the same findings and the same fitness values; the report names the commit
metric: Identical deterministic results for the same commit; every entry's fitness values come from a report (source - listing reports)
:::
```

## An external request slips in

A web font, a CDN script or a video thumbnail sends the learner's IP address to another server before any click.

```arc42
:::quality-scenario
id: qs-external-request
title: An external request slips in
quality: qg-nothing-collected
stimulus: An assistant adds a resource that loads from another server on page load
response: The pre-push hook and the validation both fail and name the page, the host and the element
metric: 0 requests to other hosts before a click in any app that passes validation (source - listing reports)
:::
```

## A session with the tooling

The tooling itself must not become a hidden channel about creators.

```arc42
:::quality-scenario
id: qs-tooling-silent
title: A session with the tooling
quality: qg-nothing-collected
stimulus: A creator builds and checks an app with the tooling
response: The tooling fetches what it needs (packages, schemas) and sends nothing about the creator, the app or the session
metric: No request from the tooling carries data about the creator, the app or the session without the creator's consent (source - evals with recorded network)
:::
```

## A creator uses another assistant

The guidance is written for any assistant; Claude Code is only the one the owner uses.

```arc42
:::quality-scenario
id: qs-other-assistant
title: A creator uses another assistant
quality: qg-any-assistant
stimulus: A creator builds an app with an assistant other than Claude Code, without an MCP server
response: The assistant reads the workflow from AGENTS.md, writes the plan file, loads the skills, and the git hooks run the same checks
metric: The evals pass with at least two assistants of different providers (source - evals)
:::
```

## A rule changes

A template copied once drifts; the scaffold therefore refers to versioned packages (plan KD-05).

```arc42
:::quality-scenario
id: qs-rule-change
title: A rule changes
quality: qg-guidance-evolves
stimulus: The owner tightens a rule in the tooling
response: The change is released once; every app built from a scaffold gets it with its next dependency update pull request, and the evals run before release
metric: No file in an app repo has to be edited by hand to receive the change (source - repos)
:::
```

## A creator contributes a practice

Whoever shapes the guidance shapes the platform (`s-contribute-practices`).

```arc42
:::quality-scenario
id: qs-practice-contributed
title: A creator contributes a practice
quality: qg-guidance-evolves
stimulus: An experienced creator proposes a practice from their own app
response: It is added as a rule in one place, with scope and severity, and reaches the skills, checks or review rubric from there
metric: One pull request to lernapps/tooling, touching no other repo (source - repos)
:::
```
