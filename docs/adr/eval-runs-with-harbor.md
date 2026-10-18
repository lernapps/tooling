# ADR: Eval runs with Harbor: single-step tasks, a simulated creator, a scoring verifier

Decision `dec-eval-runs-with-harbor` in [chapter 9 of the architecture](../arc42/09-decisions.arc42.md).

## Status

accepted (2026-10-17), by the owner: option D, Harbor. Proposed the same day as `dec-eval-runs-from-files` (option A,
with D as the later option); a spike and real runs on 2026-10-17 changed the scores, and the owner chose D, also
because its methodology has been thought through by others and is documented.

It refines `dec-evals-by-hand` and does not supersede it: runs are still started on purpose, by the owner or the
orchestrating agent, before a guidance change is merged, with Claude Code, Codex and Gemini CLI as the goal; there is
still no pipeline. Harbor replaces the hand-made runner, not the decision to run by hand.

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

Findings of the spike and the first real runs (2026-10-17), which revise the facts above for D:

- Harbor 0.24.0 runs in the cloud container: `uv tool install harbor`; `dockerd` started as root. The agent proxy's
  CA has to be baked into each image (copy the CA bundle, `update-ca-certificates`, set `NODE_EXTRA_CA_CERTS` and
  `SSL_CERT_FILE`); Docker Hub rate-limits, so base images come from `mirror.gcr.io`.
- Harbor picks up host credentials on its own (the session's `ANTHROPIC_BASE_URL` and others), so it has to run
  through a wrapper with a scrubbed environment (`env -i`).
- Credentials: environment variables named `ANTHROPIC_*` are filtered out by the platform; the key is stored as
  `EVALS_ANTHROPIC_API_KEY` in the cloud environment "Evals" and the wrapper passes it on. Network secrets are never
  attached to api.anthropic.com. The current credential is a Claude subscription token (`claude setup-token`), passed
  as `CLAUDE_CODE_OAUTH_TOKEN` with `CLAUDE_FORCE_OAUTH=1`.
- Multi-step tasks and the simulated user exclude each other (`User-agent bridge trials are not supported for
  multi-step tasks`). Single-step tasks with a simulated user fit our method, since the persona answers by topic and
  checkpoint; prepared start states are baked into the image. No verifier per checkpoint is needed: a verifier in
  separate mode scores the collected artifacts (`/app` with `.git`) at the end, `harbor job regrade` re-scores stored
  runs, and `reward.json` takes named dimensions (numbers only; evidence goes into extra files).
- The simulated user is a full agent with its own model.
- With `--bridge acp` and a subscription token, the token did not reach the target adapter (`claude-code-acp`,
  started by `acpx` from the simulated user's shell): "Authentication required". A local patch fixes it:
  `acp_install` writes the token into the container as a file with mode 600 and a small wrapper script that exports
  it and starts the adapter; `acp_command()` calls that wrapper. It has been reported to Harbor upstream.
- First real run (`real-5`): a quiz mini-task, agent and simulated user on Haiku. The agent asked for the grade and
  the number of questions before building, the simulated user answered from the persona, the agent built and
  committed: 2 turns, 1:42 min, about 0.0015 USD as Harbor reports. One test failed only because Harbor leaves an
  untracked `.acpxrc.json` in `/app`; the verifier must ignore it.
- Codex and Gemini CLI are supported by Harbor (`codex` with `OPENAI_API_KEY` or `CODEX_API_KEY`, `gemini-cli` with
  `GEMINI_API_KEY`), but not installed or tried here.

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
| K1 run by the orchestrator | 0 | −1 | 0 | +1 | −1 | 0 |
| K2 conclusive | 0 | −1 | +1 | +1 | 0 | 0 |
| K3 creator at checkpoints | 0 | −1 | −1 | +1 | 0 | 0 |
| K4 three assistants | 0 | −1 | 0 | 0 | 0 | 0 |
| K5 build and maintain | 0 | 0 | −1 | −1 | −1 | −1 |
| **Sum** | **0** | **−4** | **−1** | **+2** | **−2** | **−1** |

Before the spike (the proposed version of this ADR), K1 was −1 for C, D and F, and the sums were A 0, B −4, C −2,
D 0, E −2, F −2: A and D tied, and A was chosen because D's costs (a container daemon, credentials, a toolchain) came
before the first run. The spike removed those costs: the daemon runs when started as root, the credential lives in
the cloud environment, and the installation and daemon start belong in the environment's setup. What changed:

- K1: D runs a whole eval, creator included, from the orchestrator with one command once installed (+1). C and F
  lose their blockers too (0), but without a simulated user the orchestrator still has to play the creator, as in A.
  A, in turn, needs a new session and the orchestrator conversing for hours.
- K3: D's simulated user works, observed in a real run (+1, unchanged, now verified), for Claude Code with the local
  patch; for Codex and Gemini it is documented, not yet tried.
- K4 stays 0 for D: Harbor supports the three assistants, but only Claude Code has run here.
- K5 stays −1 for D: a Python toolchain, the wrapper, the CA in every image and a patch to keep until upstream fixes
  it.

B's reasons are unchanged: it needs the OS sandbox, its graders do not reach git, the plan or `lernapps check`, and a
run is one prompt. C, D, E and F add a Python or container toolchain to a Node repository; D also normalises the
three assistants' transcripts (ATIF) and re-grades stored runs.

## Decision

We build the evals on Harbor (D).

- A scenario is a single-step Harbor task with a simulated creator: `evals/tasks/<id>/` with `task.toml` (Harbor's settings and, in its metadata, the archetype,
  start state, the expectations that apply, each mapped to the inventory item it tests, `remote: local` or
  `github`), `instruction.md` (the creator's first prompt, the real E1 or E2 text), `persona.md` (the creator's facts
  and how they answer, by topic and checkpoint rather than as a fixed sequence, because the agent's questions vary
  between runs), `environment/Dockerfile` and `tests/test.sh` (the verifier).
- Each scenario has a start state: `fresh` (from the real first prompt, the whole chain) or a prepared state from
  which the later stages are measured reliably (plan confirmed; app built with a failing check; app published, not yet
  listed; a first version, for an increment). A prepared state is a git bundle baked into the task's image; from there
  the run again goes over many turns.
- Images start from `mirror.gcr.io` and bake in the proxy's CA bundle (`update-ca-certificates`,
  `NODE_EXTRA_CA_CERTS`, `SSL_CERT_FILE`). For `remote: local` the image holds a bare git remote.
- Harbor runs only through a wrapper in `evals/` that starts it with a scrubbed environment (`env -i`) and passes
  exactly the credential it needs: `EVALS_ANTHROPIC_API_KEY` from the cloud environment "Evals", today a subscription
  token as `CLAUDE_CODE_OAUTH_TOKEN` with `CLAUDE_FORCE_OAUTH=1`; later `OPENAI_API_KEY`/`CODEX_API_KEY` and
  `GEMINI_API_KEY` the same way.
- The patch that passes the token to the ACP adapter (token file with mode 600, a wrapper script, `acp_command()`
  calling it) lives in `evals/` and is applied by the wrapper until Harbor fixes it upstream; then it is removed.
- Every job records its configuration: harness, its version, model and settings, the simulated creator's model, and
  the guidance commit. At least three trials per task and configuration (`-k 3` or more). Comparisons are between
  guidance commits within one configuration, never across.
- The verifier runs in separate mode at the end and scores the collected artifacts (`/app` with `.git`): P, G and C by
  script (plan front matter and retrospective, the git log of the remote, `lernapps check --report`, the review
  verdict). It writes named dimensions to `reward.json` (numbers only) and the evidence per expectation (file and
  line, commit, check rule) to extra files. It ignores Harbor's untracked `.acpxrc.json`.
- Expectations from the transcript (T: creator turns after the plan, failed hook runs, skills read, reads outside the
  published guidance) are scored after the run by a script over the job directory, through `harbor job regrade` or
  outside Harbor; those that need judgment (A9, A10, A19, …) are marked `judge` with the quoted turns, and the
  orchestrator records its verdict with a reason. A failed expectation names its inventory item and how it failed:
  not read (or read only as a summary), misread, or read and not followed.
- A summary over a job's trials gives the pass rate per expectation, min and max, the p90 of `prePushFailures`.
- Later, only for a suspected inventory item: a counterfactual run, the same task and configuration with that item
  changed or removed.
- GitHub: first a local bare remote in the container, which covers branch order, dummy pushes and checkpoints (cases
  1, 6, 7); later real GitHub with a sandbox account for the default branch, the Pages source, refusals by the
  integration and the forked listing pull request (cases 2–5). The sandbox account is still open.

## Consequences

- An eval is one command from the orchestrator or the owner, creator included; the owner no longer plays the creator
  for Codex and Gemini, which eases `risk-owner-bottleneck`.
- Results are comparable across trials, because every trial is scored by the same verifier and transcript script from
  stored artifacts; a better script re-scores old jobs with `harbor job regrade`.
- The creator's agent sees only the image: the published guidance and package, not our checkouts. Isolation holds by
  construction.
- The later stages and increments are measured without depending on an early derailment; the prepared states must be
  kept current with the templates (regenerated with `lernapps update` or from a recorded run), and the images rebuilt.
- The repository gains a Python tool and Dockerfiles next to Node; the environment needs `uv`, Harbor and a running
  `dockerd` (the cloud environment's setup), and the local patch must be dropped once upstream fixes it.
- The scoring scripts are the contract issue #18 asks to build test-first, on recorded runs.
- Transcript scoring starts with Claude Code; Codex and Gemini need their credentials in the environment and a trial
  run first, until then the configurations are Claude only.
- `bb-evals` (chapter 5) and `dn-lernapps-agents` (chapter 7) name Harbor tasks and the cloud container as the eval
  environment.
- Open for the owner: a sandbox account or organisation for GitHub runs, and where its listing pull requests go (a
  copy of lernapps/apps there, or real pull requests that are closed).
