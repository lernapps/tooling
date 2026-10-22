#!/bin/bash
# Runs Harbor with a scrubbed environment: nothing of the calling session reaches it or the containers (no
# ANTHROPIC_BASE_URL, CLAUDE_*, GH_TOKEN, GITHUB_TOKEN, AWS_*, CLOUDSDK_*). The credentials are the subscription token
# in EVALS_ANTHROPIC_API_KEY (the creator, and Claude Code under test), handed over as CLAUDE_CODE_OAUTH_TOKEN with
# CLAUDE_FORCE_OAUTH=1, and, when set, the OpenCode key in EVALS_OPENCODE_API_KEY, handed over as OPENCODE_API_KEY.
# They are moved between environment variables only, never onto a command line (where `ps` would show them).
set -euo pipefail
home="${LERNAPPS_EVALS_HOME:-$HOME/.lernapps-evals}"
ca="${LERNAPPS_EVALS_CA:-}"
[ -z "$ca" ] && [ -f /root/.ccr/ca-bundle.crt ] && ca=/root/.ccr/ca-bundle.crt
[ -n "${EVALS_ANTHROPIC_API_KEY:-}" ] || { echo "EVALS_ANTHROPIC_API_KEY is not set" >&2; exit 1; }
token="$EVALS_ANTHROPIC_API_KEY" opencode_key="${EVALS_OPENCODE_API_KEY:-}"
# the equivalent of env -i, without passing the token as an argument
while read -r name; do unset "$name" 2> /dev/null || true; done < <(compgen -e)
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin HOME="$home/home" TERM=dumb HARBOR_TELEMETRY=off
if [ -n "$ca" ]; then export SSL_CERT_FILE="$ca" REQUESTS_CA_BUNDLE="$ca"; fi
export CLAUDE_FORCE_OAUTH=1 CLAUDE_CODE_OAUTH_TOKEN="$token"
if [ -n "$opencode_key" ]; then export OPENCODE_API_KEY="$opencode_key"; fi
unset token opencode_key
exec "$home/bin/harbor" "$@"
