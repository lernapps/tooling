#!/bin/bash
# Prepares a machine for the lernapps evals: installs Harbor (pinned) outside the repo, patches its Claude Code agent
# for a subscription token over ACP, starts dockerd if none runs, and writes the generated files of each task
# (the egress CA, the shared verifier, the plan front matter schema). Idempotent: run it again any time.
#   LERNAPPS_EVALS_HOME  where Harbor, its home and the jobs live (default: $HOME/.lernapps-evals)
#   LERNAPPS_EVALS_CA    a CA bundle the containers must trust, for a TLS-intercepting egress proxy
#                        (default: /root/.ccr/ca-bundle.crt when it exists, else none)
set -euo pipefail
HARBOR_VERSION=0.24.0
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
evals="$(dirname "$here")"
repo="$(dirname "$evals")"
home="${LERNAPPS_EVALS_HOME:-$HOME/.lernapps-evals}"
mkdir -p "$home/bin" "$home/home" "$home/jobs"

# Harbor, pinned, in its own tool directory
if [ "$("$home/bin/harbor" --version 2>/dev/null || true)" != "$HARBOR_VERSION" ]; then
  UV_TOOL_DIR="$home/uv-tools" UV_TOOL_BIN_DIR="$home/bin" uv tool install --force --python 3.13 "harbor==$HARBOR_VERSION"
fi
site="$(ls -d "$home"/uv-tools/harbor/lib/python3.*/site-packages | head -1)"
installed="$(cat "$site"/harbor-*.dist-info/METADATA | sed -n 's/^Version: //p')"
[ "$installed" = "$HARBOR_VERSION" ] || { echo "Harbor $installed installed, the patch is for $HARBOR_VERSION" >&2; exit 1; }

# The patches (evals/README.md): with --bridge acp, hand the subscription token to the target adapter, and keep the
# acpx config out of the workspace
for patch_file in "$here"/*.patch; do
  if patch -p1 -d "$site" --dry-run -R -s -f < "$patch_file" > /dev/null 2>&1; then
    echo "already applied: $(basename "$patch_file")"
  else
    patch -p1 -d "$site" -s -f < "$patch_file"
    echo "applied: $(basename "$patch_file")"
  fi
done

# dockerd
if ! docker info > /dev/null 2>&1; then
  nohup dockerd > "$home/dockerd.log" 2>&1 &
  for _ in $(seq 30); do docker info > /dev/null 2>&1 && break; sleep 1; done
  docker info > /dev/null 2>&1 || { echo "dockerd did not start, see $home/dockerd.log" >&2; exit 1; }
fi

# The generated files of each task (gitignored)
ca="${LERNAPPS_EVALS_CA:-}"
[ -z "$ca" ] && [ -f /root/.ccr/ca-bundle.crt ] && ca=/root/.ccr/ca-bundle.crt
for task in "$evals"/tasks/*/; do
  if [ -n "$ca" ]; then cp "$ca" "$task/environment/ccr-ca.crt"; else echo "# no extra CA" > "$task/environment/ccr-ca.crt"; fi
  cp "$evals/verifier/verify.ts" "$task/tests/verify.ts"
  cp "$repo/guidance/plan-front-matter.v1.schema.json" "$task/tests/plan-front-matter.v1.schema.json"
done
echo "ready: Harbor $HARBOR_VERSION in $home; run evals/harbor/run.sh <task> <model>"
