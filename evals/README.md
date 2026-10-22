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
  skills loaded in their phase). It reads the ACP session export Harbor writes for the agent under test
  (`agent/bridge-trajectory.json`), the same for every harness; trials without one fall back to Claude Code's own
  session log.
- `guidance-links.ts`: the links of the guidance under test (plan templates, skills, `llms.txt` at the job's guidance
  commit); `run.sh` writes them into the job as `guidance-links.json`. A fetch of a linked URL counts as reading the
  guidance, whatever the branch, also as `blob` or `raw` on GitHub, so that what the guidance sends the agent to never
  counts as a read outside it.
- `harnesses.ts`: one small adapter per harness (Claude Code, OpenCode) that maps its tool calls onto the names the
  score reads (`Bash`, `Read`, `Write`, `Edit`, `WebFetch`, `Skill`). A new harness needs an adapter here and a line
  in `run.sh`.
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
  scrubbed environment and the subscription token), `run.sh` (one job per task and model), the patches, the prompt
  template of the simulated user, `bridge-prompt.md` and `creator-say.ts` (how the simulated creator talks to the
  agent, below), and `session-prompt.md`, the prompt of an eval session.

## An eval run, step by step

1. **Start a session** of its own in the cloud environment "Evals" (it holds the key and allows Docker), with the
   prompt of `harbor/session-prompt.md`: the run's id (`<date>-<short name>`) and its jobs. The session runs the
   jobs, writes `runs/<run>/results.json`, pushes only that file to `evals/run-<run>` and summarises.
2. **Read the transcripts, not only the numbers.** Every run so far found a gap in the measure (a phase set with
   `sed`, the creator's end, the first text of a reply); fix the score, then score the run's transcripts again (below)
   before you conclude.
3. **Write `runs/<run>/conclusions.yaml`** in a pull request from that branch: the question, the bottom line, findings
   with the cells they rest on, the actions with their status. Until it is there, the page shows the run as not
   evaluated yet.
4. Open actions become issues; done ones name their pull request.

## Scoring again

The numbers come from the job directories, which stay where the run was (`~/.lernapps-evals/jobs` of the eval
session's container). To score a run again after a change to the score: copy its job directories, run
`node evals/guidance-links.ts <guidanceCommit> <job>/guidance-links.json` for a job without one, then
`node evals/score-transcript.ts <job>…` on the copy, then `node evals/results.ts <run> <job>… --out <file>`, and
compare with the run's `results.json` before you replace it: only the changed dimensions may differ.

## The structured creator

The simulated creator decides each message in structured output and sends it with `node /opt/creator/say.ts`
(`harbor/creator-say.ts`, copied into each task's image; `harbor/bridge-prompt.md` replaces Harbor's instructions
for `acpx`). Its input is `{"asked": [...], "answers": [...], "reply": "...", "end": null}`: what the agent's last
message asked of it and what its reply answers (`plan_confirm`, `confirm`, `archetype`, `content`, `github`, `publish`,
`permission`, `technical`, `go_on`, `other`), its reply, and its end. The command sends the agent only the reply
(with the end marker below), so the agent under test still talks to a person in free text, and appends the record
to `/logs/user-agent/creator-turns.jsonl`, which lands in the trial as `user-agent/creator-turns.jsonl`.

`score-transcript.ts` gives each creator message its record and reads the end and the plan's yes from there. It
counts the creator's own mistakes as `creator_mistakes` (evidence `creatorMistakes`): an answer to a question the
agent did not ask (`answer_not_asked`), a yes when the agent asked nothing (`yes_without_question`), a message sent
past the command (`unrecorded`), a last message without its end (`no_end`). Apart from them it counts a hint,
`creator_questions_missed` (evidence `creatorQuestionsMissed`): the creator recorded that the agent asked nothing,
but the agent's last message holds questions that wait for an answer. The rule behind it misses requests without a
question mark and counts rhetorical questions, so a person reads each hint right after the run (#156). Runs before 2026-10-22 have no records
and fall back to reading the creator's free text.

## The creator's end, the plan's yes and the phase announced

- The simulated creator ends the scenario before anything is pushed, and sends its last message with a marker on
  its last line: `[Ende: veröffentlichen]` (stopped at the question to publish), `[Ende: fertig]` (the agent said it
  is done) or `[Ende: festgefahren]` (stuck). `scenario_end` reads the creator's recorded `end`; runs before it read
  the marker, and runs before the marker the persona's sentences. "Code done" counts a green check and a regular end
  after the plan.
- The plan is confirmed by the creator's yes to the reply at the Plan checkpoint: a reply that begins
  "**Plan · Checkpoint**", or one the creator recorded as asking for the plan's yes (`plan_confirm`). A yes to a
  draft in Explore confirms that draft only. Creator turns after the plan and installs before it count from that
  yes; `code_before_plan_confirmed` is 1 when the agent set `phase: code` before it or without it. Runs whose agent
  announced no phase (before 2026-10-21) keep the agent's sign, the creator message before `phase: code` is set
  (evidence `planConfirmedBy`).
- The plan template asks each reply to begin with the phase ("**Plan · Checkpoint**"). `phase_announced` is the
  share of the replies the creator read whose first text begins with a phase; `phase_announced_right` the share of
  those whose phase is the plan's at that point of the turn.

## The archetype

`archetype_expected` (the verifier) is the archetype in the plan at the end, after any correction by the creator,
whose persona asks for the task's kind of app. `archetype_first_proposed_right` is the agent's own choice: the first
archetype it proposes in its text ("Archetyp `quiz`"), against the task's. The evidence lists the proposals and, where
the creator recorded it, the turn at which it answered the kind of app after a proposal of another
(`archetypeCorrectedByCreatorAtTurn`).

## Questions per turn

`questions_per_turn_*` count the questions that wait for the creator's answer, in the agent's last text of the turn
(the message the creator answers): a paragraph or list item that asks counts once, however many question marks it
has, and code, quotes, tables and text in quotation marks (a sample question of a draft) count not at all. Before
2026-10-22 they counted every sentence ending in "?" in the turn's text; `question_marks_per_turn_max` keeps that
count, to compare with the runs scored before.

## Running

```sh
evals/harbor/setup.sh                                   # once per machine; again after a pull
EVALS_ANTHROPIC_API_KEY=… evals/harbor/run.sh quiz-fresh anthropic/<model> [trials] [concurrency]
EVALS_ANTHROPIC_API_KEY=… EVALS_OPENCODE_API_KEY=… HARNESS=opencode \
  evals/harbor/run.sh quiz-fresh opencode-go/deepseek-v4.1-flash [trials] [concurrency]
node evals/summary.ts ~/.lernapps-evals/jobs
node evals/results.ts <run> ~/.lernapps-evals/jobs     # then write evals/runs/<run>/conclusions.yaml
```

`HARNESS` names the agent under test: `claude-code` (default) or `opencode`. The simulated creator is always Claude
Code, on `USER_MODEL` (default: the model under test for Claude Code, Haiku 5.5 for another harness).

`EVALS_ANTHROPIC_API_KEY` holds a Claude subscription token; `harbor.sh` hands it to Harbor as
`CLAUDE_CODE_OAUTH_TOKEN`, and nothing else of the calling environment. For OpenCode, `EVALS_OPENCODE_API_KEY` holds
the key of OpenCode Go; `harbor.sh` hands it over as `OPENCODE_API_KEY`, and `run.sh` names it to Harbor as a template
(`--ae 'OPENCODE_API_KEY=${OPENCODE_API_KEY}'`), because Harbor passes it on by itself only for providers it knows. Jobs land in `~/.lernapps-evals/jobs`
(`LERNAPPS_EVALS_HOME` moves everything). To check that a task builds and its verifier runs, without a model:
`evals/harbor/harbor.sh run -p evals/tasks/<task> -a oracle -o <dir>` (all dimensions 0).

Two patches to Harbor 0.24.0, which `setup.sh` applies:
- `harbor/claude-code-acp-oauth.patch`: with `--bridge acp`, Harbor does not pass a subscription token to the Claude
  Code ACP adapter, which `acpx` starts from the simulated user's shell. The patch writes the token into the container
  as a mode-600 file and starts the adapter through a wrapper that loads it.
- `harbor/acpx-config-outside-workspace.patch`: Harbor writes the acpx config as `.acpxrc.json` into the workspace,
  where the agent under test finds a file it did not make, and `lernapps create` refuses the folder. The patch writes
  it to the global config, `~/.acpx/config.json`, instead.
