// The pre-push hook of this repo (.vite-hooks/pre-push). It first asks the change scope (changes/changes.ts, as every
// hook does): a push of only the plan (.vibe/**) checks nothing; a push of only docs (docs/**/*.md) and the plan builds
// and checks the docs site (npm run build, npm run check:site). Any other push runs `lernapps check` (format, lint,
// type check, the unit and the fast end-to-end tests, the build), and the heavy end-to-end tests too when it changes
// a path they exercise. CI runs everything a change can affect: it is the superset.
//
//   node scripts/pre-push.ts [<remote> [<url>]]   reads git's lines "<local ref> <local sha> <remote ref> <remote sha>"
//
// Quiet like the pre-commit hook: what the check prints goes to node_modules/.cache/lernapps/pre-push.log; on a
// failure the hook prints one line naming the log, and a push that checks less than everything says so in one line.
// Without lines on standard input (run by hand) it runs everything.
import { spawnSync } from "node:child_process";
import { mkdirSync, openSync, writeSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { classify, loadRules, matchesAny, pushedFiles, readStdin } from "../changes/changes.ts";

/** The heavy end-to-end tests: each installs, generates or builds apps and runs their checks. */
export const HEAVY_TESTS = [
  "test/check.e2e.test.ts",
  "test/rules.e2e.test.ts",
  "test/create.e2e.test.ts",
  "test/app-check.e2e.test.ts",
  "test/app-check-failing.e2e.test.ts",
  "test/preset.e2e.test.ts",
  "test/check-repo.e2e.test.ts",
  "test/changes.e2e.test.ts",
];

/**
 * A POSITIVE list: a push that changes one of these paths (a folder ends with "/") runs the heavy tests before it
 * leaves the machine; any other push runs only the fast set. These are the paths the heavy tests exercise. A path
 * missing here is still tested by CI, which runs everything; when CI finds what the hook let through, add the path.
 */
export const HEAVY_PATHS = [
  "src/",
  "changes/",
  "check/",
  "generator/",
  "archetypes/",
  "lint/",
  "publish/",
  "scripts/",
  "actions/app-check/",
  "actions/app-publish/",
  ".vite-hooks/",
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "tsconfig.json",
  ...HEAVY_TESTS,
  "test/support.ts",
  "test/repo-copy.ts",
  "test/global-setup.ts",
  "test/app-fixture.ts",
  "test/check-report.ts",
  "test/plan.ts",
  "test/fixtures/",
];

/** Whether a changed path is one the heavy tests exercise (the patterns of the change scope; "/" ends a folder). */
export const isHeavy = (path: string) => matchesAny(path, HEAVY_PATHS);

/** The paths a push changes, or undefined when they cannot be known (then everything runs). */
export const changedPaths = (lines: string): string[] | undefined => pushedFiles(lines);

const LOG = "node_modules/.cache/lernapps/pre-push.log";

/** Runs the steps one after the other into the log; the exit code of the first that fails, else 0. */
function runLogged(log: number, steps: readonly string[][], env: NodeJS.ProcessEnv = process.env): number {
  for (const args of steps) {
    writeSync(log, `$ npm ${args.join(" ")}\n`);
    const code = spawnSync("npm", args, { stdio: ["ignore", log, log], env }).status ?? 1;
    if (code !== 0) return code;
  }
  return 0;
}

function main(): number {
  const changed = changedPaths(readStdin());
  const { scope, reason } = classify(changed, loadRules("."));
  mkdirSync(dirname(LOG), { recursive: true });
  const log = openSync(LOG, "w");
  if (scope === "none") {
    process.stdout.write(`lernapps pre-push: nothing to check, the push changes only the plan (${reason})\n`);
    return 0;
  }
  if (scope === "docs") {
    process.stdout.write(`lernapps pre-push: the docs site only, the push changes only docs (${reason})\n`);
    const code = runLogged(log, [
      ["run", "--silent", "build"],
      ["run", "--silent", "check:site"],
    ]);
    if (code !== 0) {
      process.stderr.write(
        `lernapps pre-push: the docs site's build or check failed (exit ${code}); the full output is in ${LOG}\n`,
      );
    }
    return code;
  }
  const heavy = changed === undefined ? ["(the changed paths are not known)"] : changed.filter(isHeavy);
  writeSync(
    log,
    heavy.length > 0
      ? `lernapps pre-push: every test, for ${heavy.join(", ")}\n`
      : "lernapps pre-push: the fast tests; the push changes no path the heavy tests exercise\n",
  );
  const code = runLogged(
    log,
    [["run", "--silent", "lernapps", "--", "check"]],
    // LERNAPPS_PRE_PUSH=1 tells the tests they run in the hook: a test that is load-dependent there skips itself on
    // purpose (test/check-app.e2e.test.ts) and runs in CI
    { ...process.env, LERNAPPS_PRE_PUSH: "1", ...(heavy.length > 0 ? {} : { LERNAPPS_TESTS: "fast" }) },
  );
  if (code !== 0) {
    process.stderr.write(
      `lernapps pre-push: lernapps check (${heavy.length > 0 ? "every test" : "the fast tests"}) failed (exit ${code}); the full output is in ${LOG}\n`,
    );
  }
  return code;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
