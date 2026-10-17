#!/bin/bash
# Scores the workspace the agent left (/app, an artifact of the trial) with the shared verifier of the lernapps evals
# (evals/verifier/verify.ts, copied next to this file by evals/harbor/setup.sh). EXPECTED_ARCHETYPE: task.toml.
mkdir -p /logs/verifier
if ! node /tests/verify.ts; then
  echo "verifier failed" >&2
  [ -s /logs/verifier/reward.json ] || echo '{"verifier_error": 1}' > /logs/verifier/reward.json
fi
exit 0
