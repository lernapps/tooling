// `lernapps init <short name>` and `lernapps skills --archetype <name>`: the start of an app, from the npm registry
// alone. `init` runs in an empty folder: it writes a package.json that depends on this tooling (and on an add-on such as
// @lernapps/practice), installs them, writes the plan template of the package, complete and unchanged, as
// .vibe/plans/01-<short name>.md, and syncs the skills of the installed packages into the agent directories with
// `skills experimental_sync` (the package `skills` supports many agents). The skills of the archetypes wait until the
// plan has chosen one: `skills --archetype <name>` then adds that archetype's. `lernapps create` later takes over the
// package.json (the marker lernapps.init) and the installed packages.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { UsageError } from "../src/usage.ts";
import { PLANS } from "../src/plan.ts";
import {
  CreateError,
  fromPackage,
  ownVersion,
  readJson,
  TOOLING,
  WORK_BRANCH,
  writeJson,
  writeProcessGuidance,
} from "./create.ts";

/** What may be in the folder before init: git, and what the fallback without npx of llms.txt copied there. */
const FALLBACK_FILES = [".git", ".vibe", ".agents", "AGENTS.md", "CLAUDE.md"];

/** The options of `lernapps init`, as node:util parseArgs takes them. */
export const INIT_OPTIONS = {
  addon: { type: "string" },
  tooling: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const INIT_USAGE = `Usage: lernapps init <short name> [--addon <package>] [--tooling <spec>]

Starts an app in the current folder, which must be empty except for .git. It needs git, Node and the npm registry; nothing
else. In order:
  git repository               on the branch work, which the plan names; no commit. A repository without commits
                                switches to work; one with commits stays, and init warns: git switch -c work
  package.json                  names the folder, depends on @lernapps/tooling (this version) and the add-on
  npm install                   installs them
  .vibe/plans/01-<short name>.md
                                the plan template of the add-on, else of this tooling, copied complete and unchanged
  .agents/skills/, ...          the skills of the installed packages, for every agent \`skills\` finds, except those of
                                the archetypes: after the plan chose one, run \`lernapps skills --archetype <name>\`

Then follow the plan: it says what to do, and when to wait for the creator.

Options:
  --addon <package>  a package that extends the tooling, e.g. @lernapps/practice: its plan template and its skills
  --tooling <spec>   for maintainers: the npm spec of @lernapps/tooling to install instead of this version, e.g.
                     file:/path/to/lernapps-tooling-0.0.0.tgz or github:lernapps/tooling#<commit>; give the same
                     to lernapps create. Without it, a tooling of version 0.0.0 (a local build, not on the
                     registry) is packed with npm pack into a temporary folder and installed from that tarball
                     when its folder is a git checkout (file:<tarball>), with its dependencies, as from the
                     registry
  -h, --help         print this help
`;

/** The options of `lernapps skills`. */
export const SKILLS_OPTIONS = {
  archetype: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const SKILLS_USAGE = `Usage: lernapps skills --archetype <name>

Adds the skills of the archetype the plan chose to the agent directories (.agents/skills/ and those of the agents
\`skills\` finds), next to those lernapps init synced. The skills of the other archetypes stay out.

Options:
  --archetype <name>  the archetype of the plan
  -h, --help          print this help
`;

/** The version of the package `skills` that does the sync, as this tooling depends on it. */
const SKILLS_BIN = () => {
  const manifest = createRequire(import.meta.url).resolve("skills/package.json");
  const bin = readJson(manifest)["bin"] as Record<string, string> | undefined;
  return join(dirname(manifest), bin?.["skills"] ?? "bin/cli.mjs");
};

export { WORK_BRANCH };

/** A git command in `dir`; a git that cannot run is an error of init. */
function git(dir: string, args: string[]) {
  const result = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  if (result.error) throw new CreateError(`git cannot run: ${result.error.message}. Install git, then run init again`);
  return { ok: result.status === 0, out: `${result.stdout}${result.stderr}`.trim() };
}

/** What `ensureRepository` did: a line for the output, and a warning when the plan's branch is not checked out. */
export interface Repository {
  done?: string;
  warning?: string;
}

/**
 * Puts the folder on the branch `work`, which the plan names: `create` and the hooks need a repository, and the plan's
 * first rule is to work there. No repository yet → `git init` on `work`. A repository without commits (a fresh
 * `git init` on master or main, a clone of an empty GitHub repo) → its unborn branch becomes `work`: nothing is lost,
 * since there is nothing on it. A repository with commits on another branch is left as it is, with a warning that
 * names the command. No commit.
 */
export function ensureRepository(dir: string): Repository {
  if (!existsSync(join(dir, ".git"))) {
    const result = git(dir, ["init", "--quiet", `--initial-branch=${WORK_BRANCH}`]);
    if (!result.ok) throw new CreateError(`git init failed: ${result.out}`);
    return { done: `a git repository on the branch ${WORK_BRANCH}` };
  }
  const branch = git(dir, ["symbolic-ref", "--quiet", "--short", "HEAD"]);
  if (branch.ok && branch.out === WORK_BRANCH) return {};
  if (!git(dir, ["rev-parse", "--verify", "--quiet", "HEAD"]).ok) {
    const result = git(dir, ["symbolic-ref", "HEAD", `refs/heads/${WORK_BRANCH}`]);
    if (!result.ok) throw new CreateError(`git could not switch to the branch ${WORK_BRANCH}: ${result.out}`);
    return { done: `the repository had no commit yet: now on the branch ${WORK_BRANCH}` };
  }
  const where = branch.ok ? `on the branch ${branch.out}` : "on no branch (detached HEAD)";
  return {
    warning: `the repository has commits and is ${where}, not on ${WORK_BRANCH}, which the plan works on. Run next: git switch -c ${WORK_BRANCH}`,
  };
}

/** The names of the skills of the archetypes, with the archetype each belongs to (lernapps-<archetype>[-…]). */
export function archetypeSkills(): { name: string; archetype: string }[] {
  const dir = fromPackage("skills", "archetypes");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      archetype: /^lernapps-([a-z]+)(?:-|$)/.exec(entry.name)?.[1] ?? entry.name,
    }));
}

/** The script of a command that is run; its failure is an error of `fail`. */
function run(command: string, args: string[], fail: (message: string) => Error, cwd = "."): void {
  const result = spawnSync(command, args, { cwd, stdio: ["ignore", 2, 2] });
  if (result.error) throw fail(`${command} cannot run: ${result.error.message}`);
  if (result.status !== 0)
    throw fail(`${command} ${args.join(" ")} failed (exit ${result.status}); its output is above`);
}

/**
 * `skills experimental_sync` in `dir`, without the skills of the archetypes in `exclude`. The skills are copied, not
 * linked into node_modules: the app commits them, and a fresh clone has them before its first npm install.
 */
function syncSkills(dir: string, exclude: string[]): void {
  const filters = exclude.flatMap((name) => [`${TOOLING}#${name}`]);
  run(
    process.execPath,
    [
      SKILLS_BIN(),
      "experimental_sync",
      "-y",
      "--no-remote",
      "--copy",
      ...(filters.length > 0 ? ["--exclude", ...filters] : []),
    ],
    (message) => new CreateError(message),
    dir,
  );
}

/** The version of a build that is not on the registry: package.json of the repository says 0.0.0. */
const LOCAL_VERSION = "0.0.0";

/**
 * The tarball of the package in `root`, packed by npm pack (with its prepare script, so the build is current) into a
 * new temporary folder.
 */
export function packBuild(root: string): string {
  const out = mkdtempSync(join(tmpdir(), "lernapps-tooling-"));
  run("npm", ["pack", "--silent", "--pack-destination", out], (message) => new CreateError(message), root);
  const tarball = readdirSync(out).find((name) => name.endsWith(".tgz"));
  if (tarball === undefined) throw new CreateError(`npm pack in ${root} wrote no tarball into ${out}`);
  return join(out, tarball);
}

/**
 * The spec of @lernapps/tooling that init installs: the one given, else this version. A local build (version 0.0.0,
 * which the registry does not have) is packed when its folder is a git checkout and installed from the tarball, else
 * init says to name one with --tooling. Not the folder itself (file:<folder>): npm links it, so the app's
 * node_modules lacks the tooling's dependencies (Playwright for the end-to-end tests, @lernapps/app-templates with
 * the templates and their READMEs); from a tarball they are installed into the app, as from the registry.
 */
export function toolingSpec(
  given: string | undefined,
  version = ownVersion(),
  root = fromPackage(),
  pack: (root: string) => string = packBuild,
): string {
  if (given !== undefined && given !== "") return given;
  if (version !== LOCAL_VERSION) return version;
  if (existsSync(join(root, ".git"))) return `file:${pack(resolve(root))}`;
  throw new CreateError(
    `this @lernapps/tooling is a local build (version ${LOCAL_VERSION}), which the npm registry does not have: name the tooling to install with --tooling <spec>, e.g. file:/path/to/lernapps-tooling-${LOCAL_VERSION}.tgz (npm pack) or github:lernapps/tooling#<commit>, and give the same to lernapps create`,
  );
}

export function init(args: string[]): number {
  const { values, positionals } = parseArgs({ args, options: INIT_OPTIONS, strict: true, allowPositionals: true });
  if (values.help) {
    process.stdout.write(INIT_USAGE);
    return 0;
  }
  if (positionals.length !== 1 || !/^[a-z0-9][a-z0-9-]*$/.test(positionals[0] ?? "")) {
    throw new UsageError("init needs one <short name> for the plan: lower case letters, digits and hyphens");
  }
  const name = positionals[0] ?? "plan";
  const dir = resolve(".");
  // the files of the fallback without npx (site/llms.txt) may be there: the plan, AGENTS.md, CLAUDE.md, the skills
  const present = readdirSync(dir).filter((entry) => !FALLBACK_FILES.includes(entry));
  if (present.length > 0) {
    throw new CreateError(
      `${dir} is not empty (${present.slice(0, 5).join(", ")}${present.length > 5 ? ", ..." : ""}): start in a new, empty folder`,
    );
  }
  const addon = values.addon;
  const tooling = toolingSpec(values.tooling);
  const repository = ensureRepository(dir);
  writeJson(join(dir, "package.json"), {
    name,
    version: "0.0.0",
    private: true,
    lernapps: { init: true },
  });
  const fail = (message: string) => new CreateError(message);
  run(
    "npm",
    ["install", "--save-dev", "--no-audit", "--no-fund", `${TOOLING}@${tooling}`, ...(addon ? [addon] : [])],
    fail,
  );

  const source = (packageName: string, ...path: string[]) => join(dir, "node_modules", packageName, ...path);
  let template = source(TOOLING, "guidance", "plan-template.md");
  if (addon !== undefined) {
    const manifest = readJson(source(addon, "package.json"));
    const relative = (manifest.lernapps as { planTemplate?: string } | undefined)?.planTemplate;
    if (relative !== undefined) template = source(addon, relative);
  }
  const target = join(dir, PLANS, `01-${name}.md`);
  mkdirSync(dirname(target), { recursive: true });
  // a plan begun in the fallback stays: it holds the creator's answers
  const kept = existsSync(target);
  if (!kept) writeFileSync(target, readFileSync(template));
  syncSkills(
    dir,
    archetypeSkills().map((skill) => skill.name),
  );
  writeProcessGuidance(dir);
  if (repository.warning !== undefined) process.stderr.write(`lernapps init: warning: ${repository.warning}\n`);
  process.stdout.write(
    `lernapps init: ${relative(dir, target)} ${kept ? "kept" : `from ${relativeTemplate(template, dir)}`}; AGENTS.md (every process rule) and CLAUDE.md; the skills of the packages are installed${repository.done ? `; ${repository.done}` : ""}\nNext: ${repository.warning ? `git switch -c ${WORK_BRANCH}, then ` : ""}read AGENTS.md and ${relative(dir, target)} completely and follow the plan, in this folder\n`,
  );
  return 0;
}

const relative = (from: string, to: string) => (to.startsWith(from) ? to.slice(from.length + 1) : to);
const relativeTemplate = (template: string, dir: string) => relative(join(dir, "node_modules"), template);

export function skills(args: string[]): number {
  const { values, positionals } = parseArgs({ args, options: SKILLS_OPTIONS, strict: true, allowPositionals: true });
  if (values.help) {
    process.stdout.write(SKILLS_USAGE);
    return 0;
  }
  if (positionals.length > 0) throw new UsageError(`skills takes no arguments, not ${positionals.join(" ")}`);
  const known = [...new Set(archetypeSkills().map((skill) => skill.archetype))].sort();
  if (values.archetype === undefined) throw new UsageError(`skills needs --archetype <name> (${known.join(", ")})`);
  if (!known.includes(values.archetype)) {
    throw new UsageError(`unknown archetype: ${values.archetype} (known: ${known.join(", ")})`);
  }
  const others = archetypeSkills()
    .filter((skill) => skill.archetype !== values.archetype)
    .map((skill) => skill.name);
  syncSkills(resolve("."), others);
  process.stdout.write(`lernapps skills: the skills of the archetype ${values.archetype} are installed\n`);
  return 0;
}
