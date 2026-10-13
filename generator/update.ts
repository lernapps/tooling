// `lernapps update`: moves an existing app to the pins of this @lernapps/tooling. Apps pin the runtime
// @lernapps/app-templates and the tooling to exact git commits, so `npm update` changes nothing. Run from the latest
// tooling (`npx --yes github:lernapps/tooling#main update`), it sets the app's runtime to the commit this tooling pins
// (package.json, appTemplates.commit), the tooling to the commit npx installed it from, and the app's workflows to
// that commit's actions; then it runs npm install and says what moved. It takes the tooling's pin, not the newest
// commit of app-templates: the generator's tests run the templates and the runtime of that commit with this tooling,
// so the pair is known to work together, and a fix of the runtime reaches the tooling's main with its pin.
// It never moves the runtime back: a commit newer than the pin (Renovate moves the runtime too) stays, and so does one
// whose order it cannot tell (git fetches only the two commits, without their files). Run from a clone of the tooling,
// it has no commit to move the tooling and the actions to: it says so and exits 1.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { UsageError } from "../src/usage.ts";
import {
  commitOf,
  fromPackage,
  installedSpec,
  pinnedTemplates,
  readJson,
  RUNTIME,
  runtimeSpec,
  TOOLING,
} from "./create.ts";

/** The options of `lernapps update`, as node:util parseArgs takes them. */
export const UPDATE_OPTIONS = {
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

const LATEST = "npx --yes github:lernapps/tooling#main update";

export const UPDATE_USAGE = `Usage: lernapps update

Moves the app in the current folder to the pins of this @lernapps/tooling, then runs npm install. The app pins the
runtime @lernapps/app-templates and @lernapps/tooling to git commits, so npm update changes nothing; this does:
  @lernapps/app-templates  to the commit this tooling pins: the runtime its tests ran with. A commit newer than that
                           (e.g. from Renovate) is kept, and so is one whose order git cannot tell; it says so
  @lernapps/tooling        to the commit npx installed this tooling from (unchanged when run from the app)
  .github/workflows/       the actions of lernapps/tooling at that same commit

Run it from the latest tooling, in the app's folder, e.g. to pick up a fixed runtime:
  ${LATEST}
Then run npx lernapps check, and commit package.json, package-lock.json and .github/workflows/.

Exit codes: 0 when the app is updated (or was up to date), 1 when it cannot be or only partly (the message says
what was not moved and why; e.g. run from a clone of the tooling, which has no commit to move the tooling and the
actions to), 2 on a usage error.

Options:
  -h, --help   print this help
`;

/** The app cannot be updated; the message says why and what to do. */
export class UpdateError extends Error {}

const short = (spec: string | undefined) => {
  const commit = commitOf(spec);
  return commit === undefined ? (spec ?? "none") : commit.slice(0, 7);
};
const moved = (name: string, from: string | undefined, to: string | undefined) =>
  from === to ? `${name}: unchanged (${short(from)})` : `${name}: ${short(from)} → ${short(to)}`;

/** The git URL of an npm git spec: github:<owner>/<repo>#…, git+<url>#…; undefined for any other. */
function gitUrl(spec: string): string | undefined {
  const github = /^github:([^/#]+)\/([^/#]+)#/.exec(spec);
  if (github) return `https://github.com/${github[1]}/${github[2]}.git`;
  return /^git\+([^#]+)#/.exec(spec)?.[1];
}

/**
 * Whether `commit` of the repository of `spec` is older than `pin` (an ancestor of it), newer (a descendant) or
 * neither; or why that cannot be told. It fetches the two commits without their files (a few KB) into a temporary
 * repository.
 */
function order(spec: string, commit: string, pin: string): "older" | "newer" | "diverged" | { unknown: string } {
  const url = gitUrl(spec);
  if (url === undefined) return { unknown: `${spec} names no git repository to compare in` };
  const work = mkdtempSync(join(tmpdir(), "lernapps-update-"));
  const git = (...args: string[]) => {
    const result = spawnSync("git", args, {
      cwd: work,
      encoding: "utf8",
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    return { status: result.error ? -1 : result.status, out: `${result.stderr ?? ""}`.trim() };
  };
  try {
    const init = git("init", "--quiet", "--bare");
    if (init.status !== 0) return { unknown: `git cannot run${init.out ? `: ${init.out}` : ""}` };
    git("remote", "add", "origin", url);
    const fetched = git("fetch", "--quiet", "--no-tags", "--filter=tree:0", "origin", pin, commit);
    if (fetched.status !== 0) {
      const reason = fetched.out
        .split("\n")
        .filter((line) => !line.startsWith("warning:"))
        .at(-1);
      return { unknown: `git cannot fetch both commits from ${url}${reason ? ` (${reason})` : ""}` };
    }
    if (git("merge-base", "--is-ancestor", commit, pin).status === 0) return "older";
    if (git("merge-base", "--is-ancestor", pin, commit).status === 0) return "newer";
    return "diverged";
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/** The runtime's next spec, and what the output says about it. */
function nextRuntime(runtime: string, pin: { repository: string; commit: string }): { spec: string; line: string } {
  const current = commitOf(runtime);
  // the same source (GitHub, or a local clone), at the pinned commit
  const pinned =
    current === undefined ? runtimeSpec(pin.repository, pin.commit) : runtime.replace(/[0-9a-f]{40}$/, pin.commit);
  if (current === undefined || current === pin.commit) return { spec: pinned, line: moved(RUNTIME, runtime, pinned) };
  const found = order(runtime, current, pin.commit);
  if (found === "older") return { spec: pinned, line: moved(RUNTIME, runtime, pinned) };
  const kept = `${RUNTIME}: kept ${current.slice(0, 7)}, not moved to ${pin.commit.slice(0, 7)}, the commit this tooling pins`;
  const anyway = `To take the pinned one anyway: npm install --save-dev ${RUNTIME}@${pinned}`;
  if (found === "newer") return { spec: runtime, line: `${kept}: it is newer (e.g. from Renovate)` };
  if (found === "diverged") {
    return { spec: runtime, line: `${kept}: neither is older than the other, so it may be newer. ${anyway}` };
  }
  return { spec: runtime, line: `${kept}: cannot tell whether it is older: ${found.unknown}. ${anyway}` };
}

/** The workflows' `uses: lernapps/tooling/actions/<name>@<commit>`, set to `commit`; the files it changed. */
function moveActions(commit: string): string[] {
  const changed: string[] = [];
  for (const file of workflows()) {
    const text = readFileSync(file, "utf8");
    const next = text.replace(/(lernapps\/tooling\/actions\/[\w-]+@)[0-9a-f]{40}\b/g, `$1${commit}`);
    if (next !== text) {
      writeFileSync(file, next);
      changed.push(file);
    }
  }
  return changed;
}

/** The app's workflow files. */
function workflows(): string[] {
  const dir = join(".github", "workflows");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => /\.ya?ml$/.test(file))
    .map((name) => join(dir, name));
}

export function update(args: string[]): number {
  const { values, positionals } = parseArgs({ args, options: UPDATE_OPTIONS, strict: true, allowPositionals: true });
  if (values.help) {
    process.stdout.write(UPDATE_USAGE);
    return 0;
  }
  if (positionals.length > 0) throw new UsageError(`update takes no arguments, not ${positionals.join(" ")}`);
  if (!existsSync("package.json")) {
    throw new UpdateError("no package.json here: run it in the app's folder");
  }
  const app = readJson("package.json");
  const devDependencies = app.devDependencies ?? {};
  const current = devDependencies[TOOLING];
  if (current === undefined) {
    throw new UpdateError(`this is not an app from lernapps create: package.json has no devDependency ${TOOLING}`);
  }
  const pin = pinnedTemplates((message) => new UpdateError(message));

  const lines: string[] = [];
  const specs: string[] = [];
  const runtime = devDependencies[RUNTIME];
  if (runtime !== undefined) {
    const next = nextRuntime(runtime, pin);
    if (next.spec !== runtime) specs.push(`${RUNTIME}@${next.spec}`);
    lines.push(next.line);
  }
  // the commit npx installed this tooling from; none when it runs from a clone (or was installed otherwise)
  const tooling = installedSpec();
  const commit = commitOf(tooling);
  const notMoved: string[] = [];
  if (tooling === undefined || commit === undefined) {
    const why = `this tooling (${fromPackage()}) was not installed by npm from a git commit, so there is no commit to move to`;
    lines.push(`${TOOLING}: not moved (still ${short(current)}): ${why}`);
    notMoved.push(TOOLING);
    const files = workflows().filter((file) => /lernapps\/tooling\/actions\//.test(readFileSync(file, "utf8")));
    if (files.length > 0) {
      lines.push(`the actions of lernapps/tooling in ${files.join(", ")}: not moved, for the same reason`);
      notMoved.push("the actions of lernapps/tooling");
    }
  } else {
    if (tooling !== current) specs.push(`${TOOLING}@${tooling}`);
    lines.push(moved(TOOLING, current, tooling));
  }

  if (specs.length > 0) {
    // named explicitly: npm install alone keeps the commit its lock has for a git dependency
    const install = spawnSync("npm", ["install", "--no-audit", "--no-fund", "--save-dev", ...specs], {
      stdio: ["ignore", 2, 2],
    });
    if (install.error || install.status !== 0) {
      throw new UpdateError(
        `npm install ${specs.join(" ")} failed${install.error ? `: ${install.error.message}` : ` (exit ${install.status})`}; its output is above. Fix the cause, then run lernapps update again`,
      );
    }
  }
  if (commit !== undefined) {
    const changed = moveActions(commit);
    if (changed.length > 0)
      lines.push(`the actions of lernapps/tooling in ${changed.join(", ")}: ${commit.slice(0, 7)}`);
  }
  process.stdout.write(`${lines.map((line) => `lernapps update: ${line}`).join("\n")}\n`);
  if (notMoved.length > 0) {
    throw new UpdateError(
      `partly updated: ${notMoved.join(" and ")} not moved (see above). Run it from the latest tooling, installed by npx: ${LATEST}`,
    );
  }
  process.stdout.write(
    "Next: npx lernapps check, then commit package.json, package-lock.json and .github/workflows/\n",
  );
  return 0;
}
