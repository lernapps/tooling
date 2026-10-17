# ADR: Eval runs from files: a run directory, a scripted creator, a scoring script

Decision `dec-eval-runs-from-files` in [chapter 9 of the architecture](../arc42/09-decisions.arc42.md).

## Status

proposed (2026-10-17). The owner decides. It refines `dec-evals-by-hand` and does not change it: runs are
still started on purpose, before a guidance change is merged, with Claude Code, Codex and Gemini CLI; there is still no
pipeline.

## Context

The evals check the expectations A1–A34 (creator's agent) and B1–B3 (review agent) of the plan's sketch
for step 10, each with its evidence: transcript (T), plan file (P), git and GitHub (G), checks and review (C). The
owner asks for two things at once: simple enough that the orchestrating agent runs an eval with a sub-agent, given a
model, or else in a new session; and sophisticated enough to draw conclusions: the same scenario run several times,
scored per expectation with evidence, the spread visible. Lessons from the first runs (issue #18): the
retrospective's numbers are self-reported, so turns and failed checks are counted from the transcript and the hooks;
`prePushFailures` is the one reliable counter; a first version and an increment are separate cases; GitHub handling
has seven cases of its own. Further constraints:

- What is tested is an assistant configuration, not a model: the harness, its version, the model and its settings
  together. The harness shapes the result as much as the model (a fetch tool that summarises, a blocked GraphQL API,
  how skills are loaded). We control only the guidance, so comparisons are between guidance commits within one
  configuration; configurations are conditions, like browsers in a test matrix.
- The guidance works as a chain (E1 → llms.txt → skill → plan → AGENTS.md → archetype skill → tool messages →
  listing); a single prompt's effect cannot be measured alone. A run from the first prompt measures the chain, but a
  run that derails early never reaches the later stages, and an increment needs a first version.

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

## Decision

A and D tie; we build A now, in a layout D can take over. D's costs come before the first run (a
container daemon, credentials, a toolchain); its gains (a simulated user for Codex and Gemini, parallel runs) pay only
once runs across assistants are automated, which `dec-evals-by-hand` excludes for now.

- Scenarios run in one session, the creator's turns in sequence. Each scenario has a start state: `fresh` (from the
  real first prompt, the whole chain) or a prepared state from which the later stages are measured reliably (plan
  confirmed; app built with a failing check; app published, not yet listed; a first version, for an increment). From
  there it again runs over many turns.
- `evals/scenarios/<id>/` per scenario: `instruction.md` (the creator's first prompt), `persona.md` (the creator's
  facts and how they answer, by topic and checkpoint rather than as a fixed sequence, because the agent's questions
  vary between runs), `scenario.yaml` (archetype, start state, the expectations that apply, each mapped to the
  inventory item it tests, `remote: local` or `github`). Prepared states live in `evals/states/<id>/` as a git bundle.
  The names follow D's task format, so a later switch reuses them.
- `npm run eval:prepare -- <scenario> <assistant>` creates a run directory outside every checkout, with a `meta.json`
  (scenario, configuration: harness, its version, model and settings; guidance commit, start time) and, for `remote: local`, a bare git remote.
- Runner, in this order of preference: a new cloud session with the chosen model and no repository of ours, the
  orchestrator playing the creator from `persona.md` (`send_message`, `list_events`); for a quick trial a sub-agent,
  its run marked unscored, since it can read our checkouts; Codex and Gemini by hand in their own environment from the
  same files, the owner as the creator. The transcript is saved into the run directory.
- `npm run eval:score -- <run>` writes `result.json` and `result.md`: one line per expectation with `pass`, `fail`,
  `n/a` or `judge`, and its evidence (file and line, commit, check rule, transcript turn). P, G and C are read by
  script: plan front matter and retrospective, git log of the remote, `lernapps check --report`, the review verdict.
  T is counted from the transcript (creator turns after the plan, failed hook runs, skills read, reads outside the
  published guidance); expectations that need judgment (A9, A10, A19, …) are marked `judge` with the quoted turns,
  and the orchestrator records its verdict with a reason. A failed expectation names its inventory item and how it
  failed, read from the transcript: not read (or read only as a summary), misread, or read and not followed; each
  needs a different fix.
- `npm run eval:summary` aggregates at least three runs per scenario and assistant: pass rate per expectation, min
  and max, the p90 of `prePushFailures`. It compares guidance commits within one configuration, never across.
- Later, only for a suspected inventory item: a counterfactual run, the same scenario and configuration with that item
  changed or removed; the difference is its effect in the chain.
- GitHub: local bare remotes cover branch order, dummy pushes and checkpoints (cases 1, 6, 7); the default branch, the
  Pages source, refusals by the integration and the forked listing pull request (cases 2–5) need real GitHub, in a
  few runs with a sandbox account, which also serves new sessions, since a local remote in their container is out of
  the orchestrator's reach.

## Consequences

- An eval is a few commands and one conversation; any Claude model the orchestrator can name runs it, and a person
  runs Codex or Gemini from the same files.
- Results are comparable across runs and assistants, because every run is scored by the same script from stored
  evidence; a better scoring script re-scores old runs.
- The later stages and increments are measured without depending on an early derailment; the prepared states must be
  kept current with the templates (regenerated with `lernapps update` or from a recorded run).
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
