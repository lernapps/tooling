// `lernapps update`: moves an existing app to the pins of this @lernapps/tooling. Apps pin the runtime
// @lernapps/app-templates and the tooling to exact git commits, so `npm update` changes nothing. Run from the latest
// tooling (`npx --yes github:lernapps/tooling#main update`), it sets the app's runtime to the commit this tooling pins
// (package.json, appTemplates.commit), the tooling to the commit npx installed it from, and the app's workflows to
// that commit's actions; then it runs npm install and says what moved. It takes the tooling's pin, not the newest
// commit of app-templates: the generator's tests run the templates and the runtime of that commit with this tooling,
// so the pair is known to work together, and a fix of the runtime reaches the tooling's main with its pin.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { UsageError } from "../src/usage.ts";
import { commitOf, fromPackage, installedSpec, readJson, RUNTIME, runtimeSpec } from "./create.ts";

/** The options of `lernapps update`, as node:util parseArgs takes them. */
export const UPDATE_OPTIONS = {
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const UPDATE_USAGE = `Usage: lernapps update

Moves the app in the current folder to the pins of this @lernapps/tooling, then runs npm install. The app pins the
runtime @lernapps/app-templates and @lernapps/tooling to git commits, so npm update changes nothing; this does:
  @lernapps/app-templates  to the commit this tooling pins: the runtime its tests ran with
  @lernapps/tooling        to the commit npx installed this tooling from (unchanged when run from the app)
  .github/workflows/       the actions of lernapps/tooling at that same commit

Run it from the latest tooling, in the app's folder, e.g. to pick up a fixed runtime:
  npx --yes github:lernapps/tooling#main update
Then run npx lernapps check, and commit package.json, package-lock.json and .github/workflows/.

Exit codes: 0 when the app is updated (or was up to date), 1 when it cannot be (the message says why), 2 on a usage
error.

Options:
  -h, --help   print this help
`;

/** The app cannot be updated; the message says why and what to do. */
export class UpdateError extends Error {}

const TOOLING = "@lernapps/tooling";
const short = (spec: string | undefined) => {
  const commit = commitOf(spec);
  return commit === undefined ? (spec ?? "none") : commit.slice(0, 7);
};
const moved = (name: string, from: string | undefined, to: string | undefined) =>
  from === to ? `${name}: unchanged (${short(from)})` : `${name}: ${short(from)} → ${short(to)}`;

/** The workflows' `uses: lernapps/tooling/actions/<name>@<commit>`, set to `commit`; the files it changed. */
function moveActions(commit: string): string[] {
  const dir = join(".github", "workflows");
  if (!existsSync(dir)) return [];
  const changed: string[] = [];
  for (const name of readdirSync(dir).filter((file) => /\.ya?ml$/.test(file))) {
    const file = join(dir, name);
    const text = readFileSync(file, "utf8");
    const next = text.replace(/(lernapps\/tooling\/actions\/[\w-]+@)[0-9a-f]{40}\b/g, `$1${commit}`);
    if (next !== text) {
      writeFileSync(file, next);
      changed.push(file);
    }
  }
  return changed;
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
  if (devDependencies[TOOLING] === undefined) {
    throw new UpdateError(`this is not an app from lernapps create: package.json has no devDependency ${TOOLING}`);
  }
  const pin = readJson(fromPackage("package.json")).appTemplates;
  if (pin === undefined)
    throw new UpdateError("this @lernapps/tooling pins no app-templates (appTemplates in package.json)");

  const lines: string[] = [];
  const specs: string[] = [];
  const runtime = devDependencies[RUNTIME];
  if (runtime !== undefined) {
    // the same source (GitHub, or a local clone), at the pinned commit
    const next =
      commitOf(runtime) === undefined
        ? runtimeSpec(pin.repository, pin.commit)
        : runtime.replace(/[0-9a-f]{40}$/, pin.commit);
    specs.push(`${RUNTIME}@${next}`);
    lines.push(moved(RUNTIME, runtime, next));
  }
  const tooling = installedSpec() ?? devDependencies[TOOLING];
  specs.push(`${TOOLING}@${tooling}`);
  lines.push(moved(TOOLING, devDependencies[TOOLING], tooling));

  // named explicitly: npm install alone keeps the commit its lock has for a git dependency
  const install = spawnSync("npm", ["install", "--no-audit", "--no-fund", "--save-dev", ...specs], {
    stdio: ["ignore", 2, 2],
  });
  if (install.error || install.status !== 0) {
    throw new UpdateError(
      `npm install ${specs.join(" ")} failed${install.error ? `: ${install.error.message}` : ` (exit ${install.status})`}; its output is above. Fix the cause, then run lernapps update again`,
    );
  }
  const commit = commitOf(tooling);
  const workflows = commit === undefined ? [] : moveActions(commit);
  if (workflows.length > 0) {
    lines.push(`the actions of lernapps/tooling in ${workflows.join(", ")}: ${commit?.slice(0, 7)}`);
  }
  process.stdout.write(
    [
      ...lines.map((line) => `lernapps update: ${line}`),
      "Next: npx lernapps check, then commit package.json, package-lock.json and .github/workflows/",
      "",
    ].join("\n"),
  );
  return 0;
}
