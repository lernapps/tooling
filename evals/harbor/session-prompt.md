# The prompt of an eval session

An eval run gets a Claude Code session of its own, in the cloud environment "Evals". That environment holds
`EVALS_ANTHROPIC_API_KEY` and allows Docker. Start the session on `lernapps/tooling` at `main`, with the branch
`evals/run-<run>` as its outcome branch and the permission mode `auto`. Its first message is the text below the line.
Fill in `<run>` (e.g. `2026-10-21-phase-announced`) and the jobs, one `evals/harbor/run.sh` line per task and model.
The session pushes only `results.json`; people write `conclusions.yaml` in the pull request (`evals/README.md`).

---

You run Harbor evals of lernapps/tooling at its current `main`. Nobody is watching, so work on your own and safely
until every job has finished, then push the results and summarise.

## Hard rules (never break them)
- **The key:** never read, print, echo, grep for or otherwise inspect the value of `EVALS_ANTHROPIC_API_KEY` or any
  other token. Check only that the variable name exists: `env | cut -d= -f1 | grep -x EVALS_ANTHROPIC_API_KEY`.
  `evals/harbor/harbor.sh` hands it to Harbor; do nothing else with it.
- **Your own credentials:** never pass this session's credentials (`CLAUDE_CODE_OAUTH_TOKEN`, `ANTHROPIC_API_KEY`,
  GitHub tokens) to Harbor, Docker or any container. Start runs only through `evals/harbor/run.sh`, which scrubs the
  environment.
- **Tests and verifiers:** never skip or edit a test or a verifier to make a run pass, and never use `--no-verify`.
- **Exit code 3:** if `run.sh` exits 3 (a token-like string in a job), stop. Do not open, print or share that job;
  report the job name only.
- **Git:** your only write is one commit on the branch `evals/run-<run>` holding
  `evals/runs/<run>/results.json`. Change no other file, open no pull request or issue, and comment nowhere.

## What to run
Read `evals/README.md` first. Then:
1. `npm ci`, then `evals/harbor/setup.sh`. Check Docker (`docker info`) and the free disk space (`df -h ~`).
2. The jobs, one after another, each detached (`nohup … > ~/eval-run.log 2>&1 &`). Watch them with short checks (the
   log, `docker ps`, the disk space); never let a check block for long.
   <one line per job, e.g. `evals/harbor/run.sh interactive-fresh anthropic/claude-haiku-5-5 3 3`>
3. **Safety:**
   - If the disk passes about 85 %, run `docker container prune -f` and `docker image prune -f`. Never delete a job
     directory.
   - A job that dies before any trial's agent started may be re-run once.
   - A rate limit (HTTP 429, `usage_limit_reached`, `rate_limit_error`): wait 30–60 minutes, then re-run the job once.
     Do not hammer.
   - Anything else is a result: keep it, do not retry it.
4. After each job, check that it has `configuration.json`, `skills-by-phase.json` (four phases) and a
   `transcript-score.json` per trial. If `skills-by-phase.json` is missing or empty, run
   `node evals/skills-by-phase.ts <guidanceCommit from configuration.json> <job>/skills-by-phase.json`, then
   `node evals/score-transcript.ts <job>`.

## Results
- `node evals/results.ts <run> <the job directories of this run>`: this run's jobs (and their re-runs) only.
- Check the file: `grep -c 'sk-ant'` prints 0, and it names no absolute home path.
- `npx vp check --fix` on it, then commit only that file to `evals/run-<run>` and push.

## Summary (your last message), in German
- Per task × model: n, failed or re-run trials and why; `check_passes`, `code_done`, `phase_reached`,
  `t_phase_announced`, `t_phase_announced_right`, `t_installs_before_plan`, `t_creator_turns_after_plan`,
  `t_questions_per_turn_max`, `t_skills_in_phase`, agent minutes.
- Against the latest run in `evals/runs/` that has the same cell.
- From the transcripts: what the numbers do not say (where the agent left the process, where the creator played its
  part wrong, which check failed and why).
- The commit hash you pushed.
