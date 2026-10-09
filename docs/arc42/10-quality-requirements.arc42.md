# Quality Requirements

The quality goals below decide between conflicting requirements of the app-creation tooling. Each one is grounded
in the platform design: the value proposition of the creators' journey
[list an app and hear it is used](https://lernapps.net/docs/platform-design/#2-design/d7-experiences.pdt42.md:el-x-list-and-hear-back) ("Build your app faster with good guidance, list it in minutes"),
the gains of [AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants), and the channels [effortless listing](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-listing),
[visible fitness for use](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-fitness-signal) and [returning use and praise to creators](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-feedback), which
also states that nothing is collected in secret.

## How the scenarios are measured

We cannot observe other people's AI assistants, and the platform collects nothing in secret. As in the
[MVP](https://lernapps.net/docs/platform-design/#2-design/d8-mvp.pdt42.md), the scenarios are learning tests with small absolute numbers, not statistics. Each metric names its source:

- **Evals**: we run Claude Code, Codex and Gemini CLI ourselves, by hand, with each provider's latest model, on
  sample creator prompts, one set per archetype. The only source for iterations and for comparing assistants.
- **Listing reports**: the validation report of every listing pull request (first-pass rate, findings per rule).
- **Retrospective**: the section the agent writes at the end of its plan file (phases, failed checks, the
  creator's turns after the plan, where it had to guess), and the counters the git hooks keep in the plan's front
  matter (failed pre-push runs). It stays in the creator's repo and reaches the platform only with a
  listing.
- **Conversations**: the owner talks to each creator after listing ([creators contribute without payment](https://lernapps.net/docs/platform-design/#2-design/d8-mvp.pdt42.md:el-a-creators-unpaid)).

## 10.1 Quality Goals

## Simple to build with guidance

Creators have little time and build alongside their actual job ([app creators](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-creators)); the
journey promises to "build your app faster with good guidance" ([list an app and hear it is used](https://lernapps.net/docs/platform-design/#2-design/d7-experiences.pdt42.md:el-x-list-and-hear-back)). This goal is about
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

Reach is no reason for creators to start ([relationships](https://lernapps.net/docs/platform-design/#2-design/d4-relationships.pdt42.md)), so the first listing has to cost almost nothing: "Contributing an
app takes minutes" ([effortless listing](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-listing), [help to list an app](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-listing-help)). It serves the riskiest
assumption of the MVP, [creators list an app when it costs minutes](https://lernapps.net/docs/platform-design/#2-design/d8-mvp.pdt42.md:el-a-creators-list).

```arc42
:::quality-goal
id: qg-list-in-minutes
title: List in minutes
priority: high
:::
```

## Listings help find the right app

The platform's main job is that adults [find an app for a topic and grade](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-t-find-app), through
[finding apps by topic and grade](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-finding). A listing helps only if it describes the app as adults search for it:
subject, grades, topics with deep links into the app, a summary of what learners do. The tooling asks for this while
the app is being shaped, not after it is built, and checks that what the entry promises exists in the app.

```arc42
:::quality-goal
id: qg-findable
title: Listings help find the right app
priority: high
:::
```

## Checked, not declared

Adults decide whether to use an app from its listing; what an app sends to third parties is "checked rather than
declared" ([visible fitness for use](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-fitness-signal)). Teachers use an app without checking it themselves
([teachers use an app without checking it themselves](https://lernapps.net/docs/platform-design/#2-design/d8-mvp.pdt42.md:el-a-trust-built-in)), so the
validation must be trustworthy: reproducible, bound to one commit, and the same for apps not built with the tooling.

```arc42
:::quality-goal
id: qg-checked-not-declared
title: Checked, not declared
priority: high
:::
```

## Nothing collected in secret

The apps collect nothing and stay frontend-only ([returning use and praise to creators](https://lernapps.net/docs/platform-design/#2-design/d5-transactions.pdt42.md:el-ch-feedback)). The tooling follows the same rule towards creators:
it sends nothing about a creator, an app or a session without the creator's explicit consent, and then only
structured totals. When this conflicts with features or convenience, it wins.

```arc42
:::quality-goal
id: qg-nothing-collected
title: Nothing collected in secret
priority: high
:::
```

## Fewer iterations for the assistant

AI assistants want to "reach a working app with fewer iterations and less guessing" ([AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants),
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

"Whatever lernapps.net offers creators has to work through their AI assistants" ([AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants)), and the
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
([list an app and hear it is used](https://lernapps.net/docs/platform-design/#2-design/d7-experiences.pdt42.md:el-x-list-and-hear-back)), and experienced creators bring their own practices into it
([contributing best practices](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-contribute-practices)).
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

## Few turns after the plan

Turns before the plan is agreed are good assistance: the assistant explores the idea with the creator and asks what
the catalog needs. Once the creator has confirmed the plan, the assistant should work on its own.

```arc42
:::quality-scenario
id: qs-few-turns-after-plan
title: Few turns after the plan
quality: qg-simple-to-build
stimulus: The creator confirms the plan at the end of the Plan phase
response: The assistant builds, checks and prepares the listing on its own and comes back to the creator only for what it cannot decide
metric: At most 3 creator turns from the confirmed plan to the listing pull request (source - retrospective)
:::
```

## Creators name the guidance

The creators' own view is the main source in the [MVP](https://lernapps.net/docs/platform-design/#2-design/d8-mvp.pdt42.md).

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

Iterations are compared in the evals, where we run the assistants ourselves. The pre-push hook counts its failed
runs in the front matter of the plan file, so the same number arrives with every listing, without the assistant
reporting it.

```arc42
:::quality-scenario
id: qs-eval-iterations
title: An archetype in the evals
quality: qg-few-iterations
stimulus: The evals run a sample creator prompt for an archetype
response: The assistant reaches an app that passes validation
metric: p90 of failed pre-push runs per app below 5 (source - evals, counter in the plan's front matter)
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

The listing is generated from the plan and the validation report, not typed by the creator. A first run that
fails is expected for many creators; the results comment has to be enough for their assistant to fix it.

```arc42
:::quality-scenario
id: qs-first-listings
title: The first listings
quality: qg-list-in-minutes
stimulus: A creator with a working app asks their assistant to list it
response: The assistant fills the entry from the plan and the validation report and opens the pull request to lernapps/apps; if the validation fails, it posts the deterministic check results as a comment on the pull request, and the assistant fixes the app from that comment
metric: Half of the listing pull requests pass validation on the first run, 7 of 8 on the second run after the comment; no creator types an entry field by hand (source - listing reports, retrospective)
:::
```

## An entry promises what the app has

The entry is built from the creator's answers in Explore, and the listing validation compares it with the app.

```arc42
:::quality-scenario
id: qs-entry-matches-app
title: An entry promises what the app has
quality: qg-findable
stimulus: The assistant opens a listing pull request
response: Subject, grades, topics and summary come from the plan's Explore answers; the check confirms that the app's URL and every topic link resolve
metric: Every topic link of every listing built with the tooling resolves, and no listing needs a field corrected by the owner for discovery (source - listing reports)
:::
```

## An app not built with the tooling

Some creators already have an app, e.g. a chat assistant's artifact, a site of their own or an app built with
another toolchain.

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
metric: The evals pass with Claude Code, Codex and Gemini CLI, each with its provider's latest model at the time of the run (source - evals)
:::
```

## A rule changes

A template copied once drifts; the scaffold therefore refers to the versioned package (`dec-one-package`).

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

Whoever shapes the guidance shapes the platform ([contributing best practices](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-contribute-practices)).

```arc42
:::quality-scenario
id: qs-practice-contributed
title: A creator contributes a practice
quality: qg-guidance-evolves
stimulus: An experienced creator proposes a practice from their own app
response: It is added where it acts - a skill section, a lint rule, a check or a rubric item - with a new rule id, scope and severity
metric: One pull request to lernapps/tooling, touching no other repo (source - repos)
:::
```
