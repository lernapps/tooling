#!/bin/bash
# Runs one eval task with one model: one Harbor job of <trials> trials, the simulated creator playing the task's
# persona over ACP. Jobs land outside the repo, in $LERNAPPS_EVALS_HOME/jobs (default $HOME/.lernapps-evals/jobs).
#   evals/harbor/run.sh <task> <model> [trials=1] [concurrency=1]
#   <task>   a folder of evals/tasks, e.g. quiz-fresh
#   <model>  a Harbor model name, e.g. anthropic/claude-sonnet-5-5 or opencode-go/deepseek-v4.1-flash
#   HARNESS     the agent under test: claude-code (default) or opencode (evals/harnesses.ts maps its tool calls)
#   USER_MODEL  the creator's model (always Claude Code); default: <model> for claude-code, else Haiku 5.5
# The creator decides each message in structured output and sends it with /opt/creator/say.ts (harbor/bridge-prompt.md,
# harbor/creator-say.ts), which records it in the trial's user-agent/creator-turns.jsonl.
# Afterwards it writes <job>/configuration.json (harness and version, Harbor version, models, commits) and scores the
# transcripts (evals/score-transcript.ts) against the skills of the guidance by phase (evals/skills-by-phase.ts).
# Run evals/harbor/setup.sh first.
set -euo pipefail
[ $# -ge 2 ] || { sed -n '2,13p' "$0" >&2; exit 2; }
task="$1" model="$2" trials="${3:-1}" concurrency="${4:-1}"
harness="${HARNESS:-claude-code}"
# The agent's own credential, handed over by harbor.sh, and named for Harbor as a template (never as a value on a
# command line): Harbor passes OPENCODE_API_KEY on to OpenCode only for providers it knows, and not opencode-go.
case "$harness" in
  claude-code) agent_env=() default_user_model="$model" ;;
  opencode)
    [ -n "${EVALS_OPENCODE_API_KEY:-}" ] || { echo "EVALS_OPENCODE_API_KEY is not set" >&2; exit 2; }
    agent_env=(--ae 'OPENCODE_API_KEY=${OPENCODE_API_KEY}') default_user_model=anthropic/claude-haiku-5-5 ;;
  *) echo "no harness $harness (claude-code, opencode)" >&2; exit 2 ;;
esac
user_model="${USER_MODEL:-$default_user_model}"
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
evals="$(dirname "$here")"
repo="$(dirname "$evals")"
home="${LERNAPPS_EVALS_HOME:-$HOME/.lernapps-evals}"
jobs="${LERNAPPS_EVALS_JOBS:-$home/jobs}"
task_dir="$evals/tasks/$task"
[ -f "$task_dir/task.toml" ] || { echo "no task $task in $evals/tasks" >&2; exit 2; }
for generated in tests/verify.ts environment/creator-say.ts; do
  [ -f "$task_dir/$generated" ] || { echo "run evals/harbor/setup.sh first" >&2; exit 2; }
done

# The guidance under test is what the build prompt sends the agent to: lernapps/tooling at main, now.
guidance="$(git ls-remote https://github.com/lernapps/tooling.git refs/heads/main | cut -c1-40)"
tooling="$(git -C "$repo" rev-parse HEAD)"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
job="${task}__${harness}__${model##*/}__g${guidance:0:7}__${stamp}"
mkdir -p "$jobs"

"$here/harbor.sh" run -p "$task_dir" -a "$harness" -m "$model" ${agent_env[@]+"${agent_env[@]}"} \
  --user-agent claude-code --user-model "$user_model" \
  --user-persona-path "$task_dir/persona.md" --user-prompt-template-path "$here/user-prompt.md.j2" \
  --bridge acp --bridge-prompt-path "$here/bridge-prompt.md" \
  -o "$jobs" --job-name "$job" -n "$concurrency" -k "$trials" --yes || status=$?

# configuration.json: what was tested (an assistant configuration, not a model) and with which guidance
JOB_DIR="$jobs/$job" HARNESS="$harness" MODEL="$model" USER_MODEL="$user_model" TASK="$task" GUIDANCE="$guidance" TOOLING="$tooling" \
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
  harness: env.HARNESS,
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
# The skills the guidance under test loads in each phase, from its architecture (A2), then the transcripts
node "$evals/skills-by-phase.ts" "$guidance" "$jobs/$job/skills-by-phase.json" || echo "skills by phase failed" >&2
node "$evals/score-transcript.ts" "$jobs/$job" || echo "transcript scoring failed" >&2
# No token may appear in what the job wrote: an Anthropic token by its shape, the OpenCode key by its value (read
# from a pipe, never from a command line).
if grep -rlE 'sk-ant-[A-Za-z0-9_-]{8,}' "$jobs/$job" > /dev/null 2>&1 ||
  { [ -n "${EVALS_OPENCODE_API_KEY:-}" ] &&
    printf '%s\n' "$EVALS_OPENCODE_API_KEY" | grep -rlF -f - "$jobs/$job" > /dev/null 2>&1; }; then
  echo "WARNING: a token-like string is in $jobs/$job; do not share the job" >&2
  exit 3
fi
echo "job: $jobs/$job"
exit "${status:-0}"
