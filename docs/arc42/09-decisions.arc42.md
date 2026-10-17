# Architecture Decisions

Each decision in the short form of an ADR: context, decision, consequences.

## Five layers around the assistant

**Context:** a creator's assistant needs guidance before, during and after building, and the platform needs proof
before listing. **Decision:** process guidance, scaffolding, conventions, deterministic verification and formal
validation, each in its own building blocks. **Consequences:** every layer can improve on its own; a rule can move
between layers (`concept-rule-catalog`).

```arc42
:::decision
id: dec-five-layers
title: Five layers around the assistant
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations, qg-checked-not-declared
:::
```

## Archetypes as the variation point

**Context:** a content-heavy app and a typing trainer differ in stack, rules and review. **Decision:** apps are
built from archetypes, named after their character. An archetype is:
- a template and, where its apps need one, a runtime, both in lernapps/app-templates;
- the shared preset of the tooling;
- skills and the rules in scope.

The architecture fixes the variation point, not the list of archetypes. **Consequences:** a new archetype needs a
template, skills and perhaps a runtime, but no new building block. It is justified only by a different set of rules,
stack or review.

```arc42
:::decision
id: dec-archetypes
title: Archetypes as the variation point
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations
:::
```

## EPCC in a plan file, pointed to by AGENTS.md

**Context:** assistants run through all steps at once unless guided; the guidance must work with any assistant.
**Decision:** the EPCC workflow as plain text in one place, the plan file started from the template: phases, tasks,
checkpoints, the creator's answers for the entry, counters and a retrospective. The agent instructions and the
general skill only point to it; a workflow server stays optional.
**Consequences:** no agent protocol needed; the plan is readable by the creator, carries what the entry needs, and is the
source for measurement.

```arc42
:::decision
id: dec-epcc-plan-file
title: EPCC in a plan file, pointed to by AGENTS.md
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-simple-to-build, qg-findable, risk-assistants-skip-guidance
:::
```

## The entry schema explains itself

**Context:** the entry model of the app overview is tuned for discovery over time. **Decision:** the guidance only
tells the assistant to fetch the published schema and fill it; field descriptions live in the schema.
**Consequences:** the schema must be self-explanatory; changing it needs no change to the tooling.

```arc42
:::decision
id: dec-schema-explains-itself
title: The entry schema explains itself
status: accepted
date: 2026-10-08
addresses: qg-list-in-minutes, qg-findable, con-entry-schema, risk-entry-schema-changes
:::
```

## One package from git

**Context:** a template copied once drifts, and npm installs from git only a whole repo. **Decision:** one package
at the root of lernapps/tooling, with named entry points and one CLI, installed from git at a commit of the main
line and kept current by update pull requests, as the shared site frame is. **Consequences:** no publishing pipeline;
every app gets changes without edits; publishing to npm stays possible.

```arc42
:::decision
id: dec-one-package
title: One package from git
status: accepted
date: 2026-10-08
addresses: qg-guidance-evolves, risk-git-install, con-github
:::
```

## Templates and runtimes in lernapps/app-templates, tooling in the package

**Context:** each archetype needs a starting app that can be seen and tried. **Decision:** lernapps/app-templates
holds one folder per archetype and, at its root, the runtime of the archetypes. The generator in the tooling copies a
folder at a pinned commit. **Consequences:**
- templates and runtimes change together in one repo, and the tooling's pin moves them as one;
- templates stay small because the logic is in the runtime and the preset.

```arc42
:::decision
id: dec-templates-repo
title: Templates and runtimes in lernapps/app-templates, tooling in the package
status: accepted
date: 2026-10-09
addresses: qg-simple-to-build, qg-guidance-evolves
:::
```

## The runtime is a package the app depends on

**Context:** a deep archetype such as the quiz brings code that runs in the app: an engine, a build step, generic
end-to-end tests. Copied into the app, it would drift like a template. Shipped with the tooling, the tooling would
be part of the app instead of a tool for building it. **Decision:**
- the runtimes are one package at the root of lernapps/app-templates, installed from git at a commit;
- it has one entry point per archetype and ships no templates;
- the generator makes a new app depend on the commit it copied the template from;
- the app composes the runtime's build step with the shared preset;
- the tooling stays a development dependency and never depends on the runtime.

**Consequences:**
- a new feature of an archetype reaches every app with a dependency update, proposed by an update pull request;
- the runtime's own tests and the template's checks run in app-templates;
- the tooling's generator tests install the runtime from a local clone at the pinned commit.

```arc42
:::decision
id: dec-runtime-package
title: The runtime is a package the app depends on
status: accepted
date: 2026-10-09
addresses: qg-guidance-evolves, qg-simple-to-build
:::
```

## Explainers render with a Vite plugin

**Context:** an explainer has many pages, all readable without a script, from content written as data, with client
code only for its exercises and components. Eleventy over TypeScript sources was the first choice; a second toolchain
beside vite-plus would double the configuration, the checks and what can break. **Decision:** the explainer's runtime
renders every page at build with a Vite plugin, as the quiz's does; one toolchain builds pages and client code alike. A
spike proved it before the runtime was built: one build emitted every page and its client code, so the fallback,
Eleventy, was not needed. **Consequences:**
- an explainer is configured like a quiz, and the shared preset checks both the same way;
- the runtime owns the multi-page rendering that a static site generator would bring, and tests it in its repo.

```arc42
:::decision
id: dec-explainer-vite
title: Explainers render with a Vite plugin
status: accepted
date: 2026-10-13
addresses: qg-simple-to-build, risk-vite-plus-young
:::
```

## vite-plus as the toolchain

**Context:** creators should get lint, format, type check, tests and hooks without choosing tools. **Decision:**
vite-plus with its defaults, made stricter by the presets; the presets own the configuration. **Consequences:** one
toolchain and one config; the risk of a young tool is contained in the presets.

```arc42
:::decision
id: dec-vite-plus
title: vite-plus as the toolchain
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build, qg-few-iterations, risk-vite-plus-young
:::
```

## Strict TypeScript everywhere

**Context:** types give assistants the fastest feedback (constraint `con-strict-typescript`). **Decision:** every app
is TypeScript only, with the strictest compiler settings, no untyped values and no JavaScript sources. Data the
creator supplies is typed and validated at build time. **Consequences:** every archetype's toolchain must support
TypeScript sources end to end.

```arc42
:::decision
id: dec-strict-typescript
title: Strict TypeScript everywhere
status: accepted
date: 2026-10-08
addresses: qg-few-iterations, con-language-licence, con-strict-typescript
:::
```

## One check command for apps; hooks and CI run the same

**Context:** checks that only CI runs reach the assistant late and cost the owner's attention; checks that differ
between hook and CI surprise. **Decision:** for every app, one check command runs every deterministic check, in two
parts: a fast part (format, lint, types) before a commit and a heavy part (unit tests, build, checks of the built
app, end-to-end tests in a browser) before a push. CI runs both. A failed push is counted in the plan. CI runs
exactly the command of the hooks, with no steps or switches of its own; only the environment and keeping the report
differ. Every run keeps its report in a fixed place, so CI keeps it without a switch. The tooling's own repo is the
one exception (decision `dec-tooling-pre-push`). **Consequences:** failures reach the assistant on the creator's
machine, before any CI run; CI is a safety net for skipped hooks and adds no checks of its own; what passes locally
passes in CI; the creator's machine needs a browser for the end-to-end tests.

```arc42
:::decision
id: dec-one-check-command
title: One check command for apps; hooks and CI run the same
status: accepted
date: 2026-10-09
addresses: qg-few-iterations, qg-any-assistant, risk-owner-bottleneck, risk-assistants-skip-guidance, risk-counter-tampering, risk-browser-at-creator
:::
```

## The tooling's own push checks a fast subset; CI checks everything

**Context:** the tooling's own end-to-end tests generate, install and check whole apps. Before every push they take
minutes, also for a change to the docs that cannot affect them. **Decision:** before a push, the tooling's repo runs
its fast checks every time: format, lint, types, the unit tests, the generator on files, the checks of prepared
sample apps, and the build. It runs the heavy end-to-end tests only when the push changes a path on a positive list
of what they exercise. CI runs everything on every push and is the superset. Tests that need another repo fetch it
at a pinned commit instead of being skipped. **Consequences:** a push of docs or guidance texts is quick; a path
missing from the list is still caught by CI, and the list is maintained then; the tooling's maintainers, not
creators, accept that a heavy failure may first show in CI.

```arc42
:::decision
id: dec-tooling-pre-push
title: The tooling's own push checks a fast subset; CI checks everything
status: accepted
date: 2026-10-12
addresses: qg-guidance-evolves, con-one-owner
:::
```

## The change scope decides what runs

**Context:** a commit of only the plan or only docs started the whole check before a push and in CI, with builds and
end-to-end tests it could not affect; a paths filter on a workflow avoids that, but leaves a required check
"Pending" for ever. **Decision:** one classifier in the tooling decides what a change can affect, and the hooks, the
app actions and a reusable workflow ask it first. Only the plan does nothing; only docs run only a site's checks and
deployment, which an app does not have; anything else, and any change whose files are not known, runs everything.
The plan and the docs are allowlists, so an unknown path never causes a skip; a repo may declare exceptions.
Workflows have no paths filter: their jobs are gated, and one final job always runs and reports the result.
**Consequences:** a plan or docs commit costs seconds, in an app's hooks and CI and in the tooling's; app repos get it
with the next version of the actions, without configuration; a required check never waits for a run that does not
start; the tooling's positive list of its heavy tests stays as the second step for code changes.

```arc42
:::decision
id: dec-change-scope
title: The change scope decides what runs
status: accepted
date: 2026-10-14
addresses: qg-few-iterations, qg-guidance-evolves, con-one-owner
:::
```

## Each app lives at its developer's hosting

**Context:** an app belongs to its developer, and the catalog lists apps hosted anywhere. Still, most creators need a
simple place to publish. An app's check builds the bundle it checks. **Decision:** each app lives at its developer's
own hosting; lernapps.net hosts nothing of an app and only links to it from the catalog entry. As the simple
default, the generated workflow publishes the bundle the app check action checked to the GitHub Pages of the app's
repo, at the developer's own address. The publish action checks that setup before and after it deploys, because
previews of pull requests will need the same setup. lernapps.net's own websites keep their own platform site
actions. **Consequences:** an app is built and checked once in CI, and the published bundle is the checked one. The
app's address is the developer's: usually their own github.io address, or any other host they choose. Only an app
repo in the lernapps organisation is served below lernapps.net. A creator who hosts elsewhere changes the workflow
and the entry's address. A workflow's default token cannot change the Pages settings, so a repository admin may have to set
them once.

```arc42
:::decision
id: dec-app-own-hosting
title: Each app lives at its developer's hosting
status: accepted
date: 2026-10-11
addresses: qg-few-iterations, qg-checked-not-declared, qg-simple-to-build
:::
```

## Conventions as skills

**Context:** guidance must be loaded when needed, not all at once. **Decision:** skills in the agentskills.io
format, general, per archetype and per topic, synced from the package into the creator's agent harness.
**Consequences:** skills reach every app through the package; apps built otherwise can install them alone.

```arc42
:::decision
id: dec-skills
title: Conventions as skills
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-guidance-evolves
:::
```

## Rules live in their artifacts

**Context:** a central rule file compiled into skills, lint configuration, checks and rubric would duplicate what
the artifacts already say, and skill text cannot be generated well; rules move between layers rarely.
**Decision:** each rule lives where it acts, as skill text, lint rule, check or rubric item, often in several of
them, with a stable id and the shared vocabulary of scope and severity (`concept-rule-catalog`). Each kind of
artifact is tested on its own; the tooling's build only reads the artifacts, tests the ids per kind and lists the
rules by id. **Rejected:** a central catalog with a compile step; cross-checks between the artifacts, which would
need each artifact to declare how the rule is enforced elsewhere. **Consequences:** moving a rule is a pull request
that writes the new artifact and removes the old text; a rule can be told preventively and checked at the same
time; the artifacts can drift in wording, which an agent reading the list by id and the evals catch.

```arc42
:::decision
id: dec-rules-in-artifacts
title: Rules live in their artifacts
status: accepted
date: 2026-10-09
addresses: qg-guidance-evolves, qg-checked-not-declared, risk-oxlint-plugins, risk-rule-drift
:::
```

## A standalone check CLI with YAML output

**Context:** the same rules must be checked on scaffolded apps and on apps built otherwise, and people and agents
read the result. **Decision:** one CLI that works on a repo, a bundle or an address, without needing the source repo
for the checks of the built app. It can check an entry against the app, and it reports in YAML. It checks only rules for apps; the rules of
lernapps.net's own websites stay with the shared site frame and its check. **Consequences:** the same check in hook,
CI and listing; the report is the fitness signal and is readable without a viewer.

```arc42
:::decision
id: dec-check-cli
title: A standalone check CLI with YAML output
status: accepted
date: 2026-10-09
addresses: qg-checked-not-declared, qg-list-in-minutes, qg-findable, con-frontend-only, con-page-rules, risk-no-shell
:::
```

## Review by an agent, results as a comment

**Context:** some rules need judgment; creators should be able to fix failures without the owner. **Decision:** the
listing validation comments the report on failure; a review agent in a fresh context, starting from the report,
judges the rest; its verdict names the commit. Target: half pass on the first run, 7 of 8 on the second.
**Consequences:** the owner sees only listings that passed the checks.

```arc42
:::decision
id: dec-review-agent
title: Review by an agent, results as a comment
status: accepted
date: 2026-10-08
addresses: qg-checked-not-declared, qg-list-in-minutes, risk-owner-bottleneck
:::
```

## The owner runs the review

**Context:** a review agent in CI needs an API key and costs money per run. **Decision:** the listing workflow runs
the deterministic checks; the owner starts the review agent in the environment for lernapps agents on a pull request
that passed them, on the owner's machine or by a review command on the pull request. **Consequences:** the
secret of that review job lies in lernapps/apps, used only when a maintainer starts it, that builds and runs nothing of
the app and can write nothing; the environment can change without changing the procedure.

```arc42
:::decision
id: dec-review-by-owner
title: The owner runs the review
status: accepted
date: 2026-10-08
addresses: con-one-owner, risk-owner-bottleneck
:::
```

## A recorded verdict tests the review procedure

**Context:** the review is an agent's judgment, and CI calls no model. **Decision:** the tests check what consumers
of the procedure rely on: the verdict's schema, the rule ids of the rubric, and a verdict recorded by a fresh agent
for a fixture app with a planted ad. The fixture's repo is committed with a fixed author and date, so its commit is
the same everywhere; the test checks that the recorded verdict validates, names that commit and fails the app on the
ad's rule. **Consequences:** a change to the fixture, the schema or a rule id fails the tests until the verdict is
recorded again; whether agents judge well is measured by hand, in reviews and evals.

```arc42
:::decision
id: dec-recorded-verdict
title: A recorded verdict tests the review procedure
status: accepted
date: 2026-10-09
addresses: qg-checked-not-declared, qg-guidance-evolves
:::
```

## Evals by hand with three assistants

**Context:** other people's assistants cannot be observed. **Decision:** the evals run by hand with Claude Code,
Codex and Gemini CLI on their latest models; there is no automated eval pipeline. **Consequences:** evals before
merging guidance changes; the p90 of failed pre-push runs is measured there. How the runs are built:
`dec-eval-runs-from-files` (proposed).

```arc42
:::decision
id: dec-evals-by-hand
title: Evals by hand with three assistants
status: accepted
date: 2026-10-08
addresses: qg-any-assistant, qg-few-iterations
:::
```

## Eval runs from files: a run directory, a scripted creator, a scoring script

**Status:** proposed (2026-10-17). The owner decides. It refines `dec-evals-by-hand` and does not change it: runs are
still started on purpose, before a guidance change is merged, with Claude Code, Codex and Gemini CLI; there is still no
pipeline.

**Context.** The evals check the expectations A1–A34 (creator's agent) and B1–B3 (review agent) of the plan's sketch
for step 10, each with its evidence: transcript (T), plan file (P), git and GitHub (G), checks and review (C). The
owner asks for two things at once: simple enough that the orchestrating agent runs an eval with a sub-agent, given a
model, or else in a new session; and sophisticated enough to draw conclusions: the same scenario run several times,
scored per expectation with evidence, the spread visible. Lessons from the first runs (issue #18): the
retrospective's numbers are self-reported, so turns and failed checks are counted from the transcript and the hooks;
`prePushFailures` is the one reliable counter; a first version and an increment are separate cases; GitHub handling
has seven cases of its own. Further constraints:

- A run takes hours, with many turns, and stops at checkpoints for the creator. Someone has to answer: the owner, or
  a creator played from a script (a persona with the facts and the answer for each checkpoint).
- The creator's agent may know only what a creator's agent knows: the published site, skills and package, not our
  checkouts.
- Facts of the orchestrator's cloud environment, checked on 2026-10-17: a sub-agent takes a model, Claude models only,
  shares the orchestrator's filesystem (other checkouts in `/home/user` are readable) and writes its transcript as
  JSONL under `~/.claude/projects/…/subagents/`. A new cloud session takes a model and a repository, shares no
  filesystem, and its transcript is read with `list_events`. `codex` and `gemini` are not installed. The Docker client
  and daemon are installed but the daemon does not run; started by hand as root, it ran a container. No provider API
  key is set (the session authenticates through its own endpoint). `bubblewrap` and `socat` are not installed.

Options:

- **A. Scripts and result files** (baseline). A scenario is a directory of files: the creator's first prompt (the
  real E1 or E2 text), a persona with scripted answers, the expectations that apply. A prepare script makes a run
  directory; the orchestrator starts the creator's agent and plays the creator from the persona (or the owner runs
  Codex and Gemini by hand from the same files); a scoring script reads the run directory and writes a result file
  per run, a summary script aggregates the runs.
- **B. `claude plugin eval`** ([docs](https://code.claude.com/docs/en/plugin-evals)): cases of one prompt run in
  `claude -p` with graders `regex`, `tool_used`, `tool_order`, `file_exists`, `llm`, `baseline`; three runs per case by
  default, a no-plugin baseline arm; at most 200 turns and 3600 seconds per run; a transcript can be resumed for one
  more user turn, but no simulated user; Claude only; Bash needs the OS sandbox (`bubblewrap`, `socat` on Linux).
- **C. Inspect AI with Inspect SWE** ([agent bridge](https://inspect.aisi.org.uk/agent-bridge.html),
  [Inspect SWE](https://meridianlabs-ai.github.io/inspect_swe/)): runs `claude_code()`, `codex_cli()`, `gemini_cli()`
  inside a sandbox (Docker in the examples), any model through Inspect's model providers, scorers and a log viewer. No
  simulated user found in the pages checked.
- **D. Harbor** ([tasks](https://docs.harborframework.com/tasks/overview),
  [simulated user](https://docs.harborframework.com/jobs/simulate-a-user),
  [agents](https://docs.harborframework.com/agents/pre-integrated-agents)): a task is an instruction, an environment
  (Dockerfile) and a test script that writes a reward, also as JSON with several dimensions; pre-integrated
  `claude-code`, `codex`, `gemini-cli`; a simulated user (any agent with a persona) drives `claude-code`, `codex`,
  `gemini-cli` or `opencode` over an ACP bridge; trajectories in one format (ATIF); re-grading without a new run.
  Needs a container runtime and provider credentials.
- **E. promptfoo** ([simulated user](https://www.promptfoo.dev/docs/providers/simulated-user/),
  [Claude Agent SDK](https://www.promptfoo.dev/docs/providers/claude-agent-sdk),
  [Codex SDK](https://www.promptfoo.dev/docs/providers/openai-codex-sdk/)): a simulated-user provider (OpenAI chat
  format, 10 turns by default) and agent SDK providers; their combination is not documented; API keys needed.
- **F. Own container**: option A inside an image with node, git and the agent CLIs, isolation by construction.

Criteria, each against A. K1 and K2 are the owner's two demands. Isolation from our checkouts does not
discriminate: A reaches it by running scored Claude runs in a new session and Codex and Gemini in their own
environment, the others by a container or sandbox. Cost per run does not discriminate either: the agent's and the
simulated creator's tokens dominate in every option. Neither is in the matrix.

- K1 Run by the orchestrator: a sub-agent or a new session with a chosen model, nothing to set up first.
- K2 Conclusive: scores per expectation with evidence from T, P, G and C, several runs, spread visible, scores can be
  recomputed from the stored run.
- K3 A creator at the checkpoints across a run of hours, for every assistant.
- K4 Claude Code, Codex and Gemini CLI (KD-14).
- K5 Effort to build and maintain, next to the scoring logic every option needs.

| Criterion | A scripts + files | B plugin eval | C Inspect | D Harbor | E promptfoo | F own container |
| --- | --- | --- | --- | --- | --- | --- |
| K1 run by the orchestrator | 0 | −1 | −1 | −1 | −1 | −1 |
| K2 conclusive | 0 | −1 | +1 | +1 | 0 | 0 |
| K3 creator at checkpoints | 0 | −1 | −1 | +1 | 0 | 0 |
| K4 three assistants | 0 | −1 | 0 | 0 | 0 | 0 |
| K5 build and maintain | 0 | 0 | −1 | −1 | −1 | −1 |
| **Sum** | **0** | **−4** | **−2** | **0** | **−2** | **−2** |

Reasons: B, C, D, E and F all need something this environment lacks before the first run (the OS sandbox for B; a
running container daemon and provider credentials for C, D and F; API keys for E), and none runs as a sub-agent or a
new session. B's graders do not reach git, the plan or `lernapps check`, and a run is one prompt. C and D add
repetition, parallel trials and logs; D also normalises the three assistants' transcripts. D's simulated user works
for all three assistants; in A it is the orchestrator for Claude runs and the owner, reading the persona, for Codex and
Gemini. C, D, E and F add a Python or container toolchain to a Node repository.

**Decision.** A and D tie; we build A now, in a layout D can take over. D's costs come before the first run (a
container daemon, credentials, a toolchain); its gains (a simulated user for Codex and Gemini, parallel runs) pay only
once runs across assistants are automated, which `dec-evals-by-hand` excludes for now.

- `evals/scenarios/<id>/` per scenario: `instruction.md` (the creator's first prompt), `persona.md` (the creator's
  facts and the answer for each checkpoint), `scenario.yaml` (archetype, first version or increment, the expectations
  that apply, `remote: local` or `github`). The names follow D's task format, so a later switch reuses them.
- `npm run eval:prepare -- <scenario> <assistant>` creates a run directory outside every checkout, with a `meta.json`
  (scenario, assistant, model, guidance commit, start time) and, for `remote: local`, a bare git remote.
- Runner, in this order of preference: a new cloud session with the chosen model and no repository of ours, the
  orchestrator playing the creator from `persona.md` (`send_message`, `list_events`); for a quick trial a sub-agent,
  its run marked unscored, since it can read our checkouts; Codex and Gemini by hand in their own environment from the
  same files, the owner as the creator. The transcript is saved into the run directory.
- `npm run eval:score -- <run>` writes `result.json` and `result.md`: one line per expectation with `pass`, `fail`,
  `n/a` or `judge`, and its evidence (file and line, commit, check rule, transcript turn). P, G and C are read by
  script: plan front matter and retrospective, git log of the remote, `lernapps check --report`, the review verdict.
  T is counted from the transcript (creator turns after the plan, failed hook runs, skills read, reads outside the
  published guidance); expectations that need judgment (A9, A10, A19, …) are marked `judge` with the quoted turns,
  and the orchestrator records its verdict with a reason.
- `npm run eval:summary` aggregates at least three runs per scenario and assistant: pass rate per expectation, min
  and max, the p90 of `prePushFailures`.
- GitHub: local bare remotes cover branch order, dummy pushes and checkpoints (cases 1, 6, 7); the default branch, the
  Pages source, refusals by the integration and the forked listing pull request (cases 2–5) need real GitHub, in a
  few runs with a sandbox account, which also serves new sessions, since a local remote in their container is out of
  the orchestrator's reach.

**Consequences.**

- An eval is a few commands and one conversation; any Claude model the orchestrator can name runs it, and a person
  runs Codex or Gemini from the same files.
- Results are comparable across runs and assistants, because every run is scored by the same script from stored
  evidence; a better scoring script re-scores old runs.
- The scoring script is the contract issue #18 asks to build test-first, on recorded runs.
- Transcript parsing covers Claude Code first; Codex and Gemini transcripts need a parser each, or are scored on P,
  G and C only until they have one.
- Isolation of sub-agent runs rests on the transcript scan, not on construction; only new-session and own-environment
  runs count.
- The simulated creator for Codex and Gemini is the owner reading the persona, which costs the owner's time
  (`risk-owner-bottleneck`). If that becomes the bottleneck, or runs are to be automated, the scenarios move into
  Harbor as tasks; that would supersede `dec-evals-by-hand`.
- When accepted, `bb-evals` (chapter 5) and `dn-lernapps-agents` (chapter 7) are updated to name the cloud session as
  an eval environment.
- Open for the owner: a sandbox account or organisation for GitHub runs, and where its listing pull requests go (a
  copy of lernapps/apps there, or real pull requests that are closed).

```arc42
:::decision
id: dec-eval-runs-from-files
title: Eval runs from files: a run directory, a scripted creator, a scoring script
status: proposed
date: 2026-10-17
addresses: qg-any-assistant, qg-few-iterations, qg-guidance-evolves, risk-invisible-failures
:::
```

## Content correctness is suggested

**Context:** correctness is checkable only where answers are computable. **Decision:** generator and checker tests,
cited sources and verified links are hints, never a listing condition. **Consequences:** the review notes, but
does not block, missing correctness support.

```arc42
:::decision
id: dec-correctness-suggested
title: Content correctness is suggested
status: accepted
date: 2026-10-08
addresses: qg-simple-to-build
:::
```

## Each app keeps its own content guide

**Context:** the content decisions of a first run (curriculum, competencies, exercise patterns, figures, sources)
live in the plan and the conversation; an agent who extends the app later sees neither, and generic guidance cannot
know them. **Decision:** every app keeps its content decisions in a content guide in its repo, an app-local skill with
fixed parts. The generator starts it, the assistant fills it once the creator has confirmed the plan and changes it
with every content decision; it takes precedence over the generic content skills, which stay independent of the
archetype. The check asks only that the guide exists and is filled once the app has content; whether it says what
was built is judged by the review. A check of its freshness would be too noisy. **Consequences:** a follow-up agent
starts from the app's own decisions; the plan stays the record of one run; a stale guide is found by the review, not
by the hooks.

```arc42
:::decision
id: dec-app-content-guide
title: Each app keeps its own content guide
status: accepted
date: 2026-10-14
addresses: qg-guidance-evolves, qg-few-iterations, qg-any-assistant
:::
```

## The tooling sends nothing

**Context:** sessions that never reach a listing stay invisible, but the platform collects nothing in secret.
**Decision:** the tooling sends nothing about a creator, an app or a session. Measurements stay in the creator's
repo (plan file) and reach the platform only with a listing. Feedback from an assistant to the platform needs the
creator's consent for each sending and carries structured totals only, through the platform's anonymous feedback
channel. **Consequences:** measurement relies on evals, listings and conversations with creators.

```arc42
:::decision
id: dec-tooling-sends-nothing
title: The tooling sends nothing
status: accepted
date: 2026-10-08
addresses: qg-nothing-collected, risk-invisible-failures
:::
```

## Every report is bound to a commit

**Context:** apps may be deployed anywhere, and a validation does not stay true when the app changes.
**Decision:** every validation report names the commit (or the URL and time) it checked. Showing an entry as a
fact sheet of an app deployed elsewhere, and re-validating listed apps, belong to the app overview and build on
that. **Consequences:** the deployed app can be traced to the validated commit.

```arc42
:::decision
id: dec-report-per-commit
title: Every report is bound to a commit
status: accepted
date: 2026-10-08
addresses: qg-checked-not-declared
:::
```
