// The pre-push hook of this repo (.vite-hooks/pre-push). It runs `lernapps check` (format, lint, type check, the unit
// and the fast end-to-end tests, the build) on every push, and the heavy end-to-end tests too when the push changes a
// path they exercise. CI runs everything, on every push: it is the superset.
//
//   node scripts/pre-push.ts [<remote> [<url>]]   reads git's lines "<local ref> <local sha> <remote ref> <remote sha>"
//
// Quiet like the pre-commit hook: what the check prints goes to node_modules/.cache/lernapps/pre-push.log; on a
// failure the hook prints one line naming the log. Without lines on standard input (run by hand) it runs everything.
import { spawnSync } from "node:child_process";
import { mkdirSync, openSync, readFileSync, writeSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The heavy end-to-end tests: each installs, generates or builds apps and runs their checks. */
export const HEAVY_TESTS = [
  "test/check.e2e.test.ts",
  "test/rules.e2e.test.ts",
  "test/create.e2e.test.ts",
  "test/app-check.e2e.test.ts",
  "test/app-check-failing.e2e.test.ts",
  "test/preset.e2e.test.ts",
  "test/check-repo.e2e.test.ts",
  "test/check-many-pages.e2e.test.ts",
];

/**
 * A POSITIVE list: a push that changes one of these paths (a folder ends with "/") runs the heavy tests before it
 * leaves the machine; any other push runs only the fast set. These are the paths the heavy tests exercise. A path
 * missing here is still tested by CI, which runs everything; when CI finds what the hook let through, add the path.
 */
export const HEAVY_PATHS = [
  "src/",
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

/** Whether a changed path is one the heavy tests exercise. */
export const isHeavy = (path: string) =>
  HEAVY_PATHS.some((entry) => (entry.endsWith("/") ? path.startsWith(entry) : path === entry));

const ZERO = /^0+$/;
const LOG = "node_modules/.cache/lernapps/pre-push.log";

const git = (...args: string[]) => spawnSync("git", args, { encoding: "utf8" });

/** The paths a push changes, or undefined when they cannot be known (then everything runs). */
export function changedPaths(lines: string): string[] | undefined {
  const refs = lines
    .split("\n")
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields.length === 4);
  if (refs.length === 0) return undefined;
  const paths = new Set<string>();
  for (const [, local = "", , remote = ""] of refs) {
    if (ZERO.test(local)) continue; // a deleted branch
    // a new branch: what it adds to main; else what it adds to the remote's commit
    const base = ZERO.test(remote) ? git("merge-base", local, "origin/main").stdout.trim() : remote;
    if (base === "" || git("cat-file", "-e", `${base}^{commit}`).status !== 0) return undefined;
    const diff = git("diff", "--name-only", base, local);
    if (diff.status !== 0) return undefined;
    for (const path of diff.stdout.split("\n")) if (path !== "") paths.add(path);
  }
  return [...paths];
}

function main(): number {
  let input = "";
  try {
    input = process.stdin.isTTY ? "" : readFileSync(0, "utf8");
  } catch {
    // no standard input: run everything
  }
  const changed = changedPaths(input);
  const heavy = changed === undefined ? ["(the changed paths are not known)"] : changed.filter(isHeavy);
  mkdirSync(dirname(LOG), { recursive: true });
  const log = openSync(LOG, "w");
  writeSync(
    log,
    heavy.length > 0
      ? `lernapps pre-push: every test, for ${heavy.join(", ")}\n`
      : "lernapps pre-push: the fast tests; the push changes no path the heavy tests exercise\n",
  );
  const result = spawnSync("npm", ["run", "--silent", "lernapps", "--", "check"], {
    stdio: ["ignore", log, log],
    env: heavy.length > 0 ? process.env : { ...process.env, LERNAPPS_TESTS: "fast" },
  });
  const code = result.status ?? 1;
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
