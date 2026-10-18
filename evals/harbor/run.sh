#!/bin/bash
# Runs one eval task with one model: one Harbor job of <trials> trials, the simulated creator playing the task's
# persona over ACP. Jobs land outside the repo, in $LERNAPPS_EVALS_HOME/jobs (default $HOME/.lernapps-evals/jobs).
#   evals/harbor/run.sh <task> <model> [trials=1] [concurrency=1]
#   <task>   a folder of evals/tasks, e.g. quiz-fresh
#   <model>  a Harbor model name, e.g. anthropic/claude-sonnet-5-5; the creator plays on the same model unless
#            USER_MODEL names another
# Afterwards it writes <job>/configuration.json (harness and version, Harbor version, models, commits) and scores the
# transcripts (evals/score-transcript.ts). Run evals/harbor/setup.sh first.
set -euo pipefail
[ $# -ge 2 ] || { sed -n '2,9p' "$0" >&2; exit 2; }
task="$1" model="$2" trials="${3:-1}" concurrency="${4:-1}"
user_model="${USER_MODEL:-$model}"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
evals="$(dirname "$here")"
repo="$(dirname "$evals")"
home="${LERNAPPS_EVALS_HOME:-$HOME/.lernapps-evals}"
jobs="${LERNAPPS_EVALS_JOBS:-$home/jobs}"
task_dir="$evals/tasks/$task"
[ -f "$task_dir/task.toml" ] || { echo "no task $task in $evals/tasks" >&2; exit 2; }
[ -f "$task_dir/tests/verify.ts" ] || { echo "run evals/harbor/setup.sh first" >&2; exit 2; }

# The guidance under test is what the build prompt sends the agent to: lernapps/tooling at main, now.
guidance="$(git ls-remote https://github.com/lernapps/tooling.git refs/heads/main | cut -c1-40)"
tooling="$(git -C "$repo" rev-parse HEAD)"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
job="${task}__${model##*/}__g${guidance:0:7}__${stamp}"
mkdir -p "$jobs"

"$here/harbor.sh" run -p "$task_dir" -a claude-code -m "$model" \
  --user-agent claude-code --user-model "$user_model" \
  --user-persona-path "$task_dir/persona.md" --user-prompt-template-path "$here/user-prompt.md.j2" \
  --bridge acp -o "$jobs" --job-name "$job" -n "$concurrency" -k "$trials" --yes || status=$?

# configuration.json: what was tested (an assistant configuration, not a model) and with which guidance
JOB_DIR="$jobs/$job" MODEL="$model" USER_MODEL="$user_model" TASK="$task" GUIDANCE="$guidance" TOOLING="$tooling" \
  HARBOR_VERSION="$("$home/bin/harbor" --version)" node --input-type=module -e '
import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const env = process.env;
const dir = env.JOB_DIR;
const results = existsSync(dir)
  ? readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "result.json")))
      .map((entry) => JSON.parse(readFileSync(join(dir, entry.name, "result.json"), "utf8")))
  : [];
const versions = [...new Set(results.map((result) => result.agent_info?.version).filter(Boolean))];
const configuration = {
  harness: "claude-code",
  harnessVersion: versions.length === 1 ? versions[0] : versions,
  harbor: env.HARBOR_VERSION,
  bridge: "acp",
  model: env.MODEL,
  userModel: env.USER_MODEL,
  task: env.TASK,
  guidanceCommit: env.GUIDANCE,
  toolingCommit: env.TOOLING,
};
writeFileSync(join(dir, "configuration.json"), JSON.stringify(configuration, null, 2) + "\n");
console.log(JSON.stringify(configuration));
'
node "$evals/score-transcript.ts" "$jobs/$job" || echo "transcript scoring failed" >&2
# The token must not appear in what the job wrote.
if grep -rlE 'sk-ant-[A-Za-z0-9_-]{8,}' "$jobs/$job" > /dev/null 2>&1; then
  echo "WARNING: a token-like string is in $jobs/$job; do not share the job" >&2
  exit 3
fi
echo "job: $jobs/$job"
exit "${status:-0}"
