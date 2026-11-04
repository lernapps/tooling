#!/bin/bash
# Runs the eval juror (evals/juror/prompt.md) on every trial of a job: builds the app the agent left, serves it, lets a
# fresh Claude Code judge its learning quality and scores the result (evals/juror.ts). Writes per trial
# juror/learning.yaml and learning-score.json, which evals/summary.ts and evals/results.ts read (prefix l_).
#   evals/harbor/judge.sh <job dir> [<job dir>…]
#   JUROR_MODEL  the juror's model (default anthropic's Sonnet, claude-sonnet-5-5)
# The learner the juror plays comes from the task's task.toml (juror_grade, juror_subject, juror_competencies); a task
# without them is skipped. The juror runs with the subscription token of the evals, through a scrubbed environment as
# in harbor.sh, and sees the app without its plans, retrospective and history. Its tools are allowed by name
# (--allowedTools), not by bypassing the permissions: Claude Code refuses that as root, and the eval host runs as root.
set -euo pipefail
[ $# -ge 1 ] || { sed -n '2,9p' "$0" >&2; exit 2; }
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
evals="$(dirname "$here")"
repo="$(dirname "$evals")"
model="${JUROR_MODEL:-claude-sonnet-5-5}"
claude_bin="$(command -v claude)" || { echo "no claude on PATH" >&2; exit 2; }
[ -n "${EVALS_ANTHROPIC_API_KEY:-}" ] || { echo "EVALS_ANTHROPIC_API_KEY is not set" >&2; exit 2; }
port=4400

meta() { # <task.toml> <key>: the value of a metadata key, unquoted
  sed -n "s/^$2 = //p" "$1" | head -1 | sed 's/^"//; s/"$//'
}

for job in "$@"; do
  task="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).task)' "$job/configuration.json")"
  toml="$evals/tasks/$task/task.toml"
  grade="$(meta "$toml" juror_grade)"
  [ -n "$grade" ] || { echo "$task has no juror_grade: skipped" >&2; continue; }
  subject="$(meta "$toml" juror_subject)"
  competencies="$(meta "$toml" juror_competencies)"
  for trial in "$job"/*/; do
    trial="${trial%/}"
    app=""
    # The app folder, or one folder below it (`lernapps create <name>` makes one), as the verifier finds it
    for candidate in "$trial/artifacts/app" "$trial/app" "$trial"/artifacts/app/*/ "$trial"/app/*/; do
      candidate="${candidate%/}"
      [ -f "$candidate/package.json" ] && { app="$candidate"; break; }
    done
    [ -n "$app" ] || { echo "$trial: no app" >&2; continue; }
    work="$trial/juror"
    rm -rf "$work" && mkdir -p "$work"
    # The build: a full copy without the plans, the retrospective and the history.
    build="$(mktemp -d)"
    (cd "$app" && tar --exclude=./.vibe --exclude=./docs --exclude=./.git --exclude=./node_modules -cf - .) | tar -C "$build" -xf -
    if ! (cd "$build" && npm ci --no-audit --no-fund --ignore-scripts > "$work/build.log" 2>&1 && npm run build >> "$work/build.log" 2>&1); then
      echo "$trial: the app does not build (juror/build.log)" >&2
      echo '{"mean": null, "zeros": 0, "items": {}, "pages": 0, "error": "build"}' > "$trial/learning-score.json"
      rm -rf "$build"
      continue
    fi
    # The root of the built site: the shortest path to an index.html (a page has its own index.html below it)
    bundle="$(dirname "$(find "$build" -path "$build/node_modules" -prune -o -name index.html -path '*/_site/*' -print -o -name index.html -path '*/dist/*' -print | awk '{ print length, $0 }' | sort -n | head -1 | cut -d' ' -f2-)")"
    mkdir -p "$work/app" && cp -R "$build/src" "$build/package.json" "$work/app/"
    port=$((port + 1))
    (cd "$bundle" && exec python3 -m http.server "$port" --bind 127.0.0.1 > /dev/null 2>&1) &
    server=$!
    cat > "$work/juror-input.yaml" << INPUT
url: http://127.0.0.1:$port/
grade: "$grade"
subject: $subject
competencies: $competencies
out: $work/learning.yaml
INPUT
    prompt="You are the juror of the lernapps evals. Read $repo/evals/juror/prompt.md in full and follow it. Your work directory is $work (juror-input.yaml, app/); the checkout of lernapps/tooling is $repo. Read nothing outside these two. Write your scripts into $work/scripts/."
    # The scrubbed environment of harbor.sh, with the claude binary found before
    (
      token="$EVALS_ANTHROPIC_API_KEY"
      # Playwright and its browser, as the calling environment has them (the juror uses the browser)
      node_path="${NODE_PATH:-$(npm root -g)}" browsers="${PLAYWRIGHT_BROWSERS_PATH:-}"
      bins="$(dirname "$claude_bin"):$(dirname "$(command -v node)")"
      while read -r name; do unset "$name" 2> /dev/null || true; done < <(compgen -e)
      export PATH="$bins:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" HOME="${LERNAPPS_EVALS_HOME:-/root/.lernapps-evals}/home" TERM=dumb
      export NODE_PATH="$node_path"
      [ -n "$browsers" ] && export PLAYWRIGHT_BROWSERS_PATH="$browsers"
      export CLAUDE_FORCE_OAUTH=1 CLAUDE_CODE_OAUTH_TOKEN="$token"
      unset token
      cd "$work" && "$claude_bin" -p "$prompt" --model "$model" --permission-mode acceptEdits \
        --allowedTools Bash Read Write Edit Glob Grep WebFetch \
        --output-format json > "$work/juror-session.json" 2> "$work/juror.log"
    ) || echo "$trial: the juror failed (juror/juror.log)" >&2
    kill "$server" 2> /dev/null || true
    rm -rf "$build"
    node "$evals/juror.ts" "$work/learning.yaml" --out "$trial/learning-score.json" > /dev/null ||
      echo "$trial: no valid juror/learning.yaml" >&2
  done
done
