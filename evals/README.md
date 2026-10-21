# Evals

Evals of the guidance for creators' agents, as [Harbor](https://docs.harborframework.com) tasks. What we evaluate and
what we expect (E1–E5, A1–A34): `.vibe/development-plan-agentic-app-creation.md`, "Sketch: the evals". The decision
for Harbor: the ADR on eval infrastructure in `docs/adr/`.

What is tested is an assistant configuration (harness and version, model, Harbor version), against the guidance at
`lernapps/tooling` main at the time of the run; each job records both in its `configuration.json`.

## Layout

- `tasks/<scenario>/`: one Harbor task per scenario, single step, with a simulated creator.
  - `instruction.md`: the creator's first message, the build prompt E1 exactly as lernapps.net/apps/build/ shows it.
  - `persona.md`: who the creator is and what they answer (the simulated user plays it, over ACP).
  - `environment/Dockerfile`: the creator's machine (Node 22, git, Chromium for the checks), an empty `/app`.
  - `tests/test.sh`: runs the shared verifier in a separate container on the collected `/app`.
  - `task.toml`: timeouts, the separate verifier, the expected archetype, the expectations scored.
- `verifier/verify.ts`: the verifier; writes `reward.json` (numbers only), `evidence.md` and the check report.
- `score-transcript.ts`: scores a trial's transcript (turns, questions, what was read and how, bypasses, and the
  skills loaded in their phase).
- `skills-by-phase.ts`: the skills the guidance under test loads in each phase, from the `x-phase` of the skills'
  building blocks in its architecture (`docs/arc42` at the job's guidance commit); `run.sh` writes it into the job as
  `skills-by-phase.json`. A task names the skills it leaves to a condition in `task.toml` (`skills_conditional`).
- `summary.ts`: aggregates jobs per task and configuration (mean, min, max, n).
- `results.ts`: the results of one eval run as `runs/<run>/results.json` (schema results.v1): configurations, a cell
  per task, model and configuration, every trial with its status, and what was left out and why (a job with
  `excluded.txt`, a trial that hit the usage limit or broke off before its agent started; a crashed verifier keeps the
  trial without its numbers). `rows.ts` holds the rows and metrics it sums up.
- `runs/<run>/conclusions.yaml`: what we concluded from a run, written by people: the question, the bottom line,
  findings with the cells they rest on, and what we did about them. `site.ts` renders every run onto the page
  Prompt engineering (lernapps.net/tooling/prompt-engineering/) and fails when a finding names a cell the run has not.
- `expectations.json`: which expectation each dimension measures.
- `harbor/`: `setup.sh` (installs Harbor 0.24.0 outside the repo and patches it), `harbor.sh` (runs Harbor with a
  scrubbed environment and the subscription token), `run.sh` (one job per task and model), the patch and the prompt
  template of the simulated user.

## Running

```sh
evals/harbor/setup.sh                                   # once per machine; again after a pull
EVALS_ANTHROPIC_API_KEY=… evals/harbor/run.sh quiz-fresh anthropic/<model> [trials] [concurrency]
node evals/summary.ts ~/.lernapps-evals/jobs
node evals/results.ts <run> ~/.lernapps-evals/jobs     # then write evals/runs/<run>/conclusions.yaml
```

`EVALS_ANTHROPIC_API_KEY` holds a Claude subscription token; `harbor.sh` hands it to Harbor as
`CLAUDE_CODE_OAUTH_TOKEN`, and nothing else of the calling environment. Jobs land in `~/.lernapps-evals/jobs`
(`LERNAPPS_EVALS_HOME` moves everything). To check that a task builds and its verifier runs, without a model:
`evals/harbor/harbor.sh run -p evals/tasks/<task> -a oracle -o <dir>` (all dimensions 0).

Two patches to Harbor 0.24.0, which `setup.sh` applies:
- `harbor/claude-code-acp-oauth.patch`: with `--bridge acp`, Harbor does not pass a subscription token to the Claude
  Code ACP adapter, which `acpx` starts from the simulated user's shell. The patch writes the token into the container
  as a mode-600 file and starts the adapter through a wrapper that loads it.
- `harbor/acpx-config-outside-workspace.patch`: Harbor writes the acpx config as `.acpxrc.json` into the workspace,
  where the agent under test finds a file it did not make, and `lernapps create` refuses the folder. The patch writes
  it to the global config, `~/.acpx/config.json`, instead.
