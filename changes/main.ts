#!/usr/bin/env node
// `lernapps changes` without installing anything: the actions app-check, app-publish and app-preview and the reusable workflow
// changes.yml run it from their own checkout of this repo (node changes/main.ts --ci). In an installed tooling, the
// same command is `lernapps changes` (src/cli.ts).
import { changes } from "./changes.ts";
import { USAGE, UsageError } from "../src/usage.ts";

try {
  process.exitCode = changes(process.argv.slice(2));
} catch (error) {
  const parseError = error instanceof TypeError && "code" in error && String(error.code).startsWith("ERR_PARSE_ARGS");
  if (!(error instanceof UsageError || parseError)) throw error;
  process.stderr.write(`lernapps: ${error.message}\n\n${USAGE}`);
  process.exitCode = 2;
}
