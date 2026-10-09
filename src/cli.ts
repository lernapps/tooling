#!/usr/bin/env node
// The CLI `lernapps`: one entry for the tooling's commands. Today only `check`, which runs the toolchain checks;
// later commands (create, ...) and the checks of the built app join here.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { parseArgs } from "node:util";

const USAGE = `Usage: lernapps <command> [options]

Commands:
  check [--pre-commit] [--pre-push]   run the checks: the fast part, the heavy part, or both

Options:
  -h, --help      print this help
  -v, --version   print the version

Run "lernapps <command> --help" for the options of a command.
`;

const CHECK_USAGE = `Usage: lernapps check [--pre-commit] [--pre-push]

Runs the checks of the project in the current directory. Exits 0 when all pass.

Options:
  --pre-commit   the fast part: format, lint, type check (the pre-commit hook)
  --pre-push     the heavy part: unit tests, build (the pre-push hook)
  -h, --help     print this help

Without a flag, or with both, it runs both parts (CI): the hooks together run exactly what CI runs.
`;

/** A step of a check part: a command of the toolchain (vite-plus) and what it checks. */
interface Step {
  name: string;
  command: string;
  args: readonly string[];
}

const FAST: readonly Step[] = [{ name: "format, lint, type check", command: "vp", args: ["check"] }];
const HEAVY: readonly Step[] = [
  { name: "unit tests", command: "vp", args: ["test"] },
  { name: "build", command: "vp", args: ["pack"] },
];

class UsageError extends Error {}

function version(): string {
  const manifest: unknown = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  if (typeof manifest === "object" && manifest !== null && "version" in manifest) {
    return String(manifest.version);
  }
  return "unknown";
}

function runStep(step: Step): boolean {
  process.stderr.write(`lernapps check: ${step.name} (${step.command} ${step.args.join(" ")})\n`);
  // The toolchain of the project being checked: its node_modules/.bin first.
  const path = [join(process.cwd(), "node_modules", ".bin"), process.env["PATH"] ?? ""].join(delimiter);
  const result = spawnSync(step.command, step.args, { stdio: "inherit", env: { ...process.env, PATH: path } });
  if (result.error) {
    process.stderr.write(`lernapps check: cannot run ${step.command}: ${result.error.message}\n`);
    return false;
  }
  return result.status === 0;
}

function check(args: string[]): number {
  const { values } = parseArgs({
    args,
    options: {
      "pre-commit": { type: "boolean", default: false },
      "pre-push": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
    allowPositionals: false,
  });
  if (values.help) {
    process.stdout.write(CHECK_USAGE);
    return 0;
  }
  const all = values["pre-commit"] === values["pre-push"];
  const steps = [...(all || values["pre-commit"] ? FAST : []), ...(all || values["pre-push"] ? HEAVY : [])];
  for (const step of steps) {
    if (!runStep(step)) {
      process.stderr.write(`lernapps check: failed: ${step.name}\n`);
      return 1;
    }
  }
  return 0;
}

function main(argv: string[]): number {
  const [command, ...rest] = argv;
  switch (command) {
    case "check":
      return check(rest);
    case "-h":
    case "--help":
      process.stdout.write(USAGE);
      return 0;
    case "-v":
    case "--version":
      process.stdout.write(`${version()}\n`);
      return 0;
    case undefined:
      throw new UsageError("no command given");
    default:
      throw new UsageError(`unknown command: ${command}`);
  }
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  // A usage error, or an unknown or malformed option found by node:util parseArgs (ERR_PARSE_ARGS_*)
  const parseError = error instanceof TypeError && "code" in error && String(error.code).startsWith("ERR_PARSE_ARGS");
  if (error instanceof UsageError || parseError) {
    process.stderr.write(`lernapps: ${error.message}\n\n${USAGE}`);
    process.exitCode = 2;
  } else {
    throw error;
  }
}
