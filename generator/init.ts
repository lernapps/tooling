// `lernapps init <short name>` and `lernapps skills --archetype <name>`: the start of an app, from the npm registry
// alone. `init` runs in an empty folder: it writes a package.json that depends on this tooling (and on an add-on such as
// @lernapps/practice), installs them, writes the plan template of the package, complete and unchanged, as
// .vibe/plans/01-<short name>.md, and syncs the skills of the installed packages into the agent directories with
// `skills experimental_sync` (the package `skills` supports many agents). The skills of the archetypes wait until the
// plan has chosen one: `skills --archetype <name>` then adds that archetype's. `lernapps create` later takes over the
// package.json (the marker lernapps.init) and the installed packages.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, resolve } from "node:path";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { UsageError } from "../src/usage.ts";
import { PLANS } from "../src/plan.ts";
import { CreateError, fromPackage, ownVersion, readJson, TOOLING, writeJson } from "./create.ts";

/** The options of `lernapps init`, as node:util parseArgs takes them. */
export const INIT_OPTIONS = {
  addon: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const INIT_USAGE = `Usage: lernapps init <short name> [--addon <package>]

Starts an app in the current folder, which must be empty except for .git. It needs git, Node and the npm registry; nothing
else. In order:
  git repository               on the branch work, which the plan names (unless the folder is one already; no commit)
  package.json                  names the folder, depends on @lernapps/tooling (this version) and the add-on
  npm install                   installs them
  .vibe/plans/01-<short name>.md
                                the plan template of the add-on, else of this tooling, copied complete and unchanged
  .agents/skills/, ...          the skills of the installed packages, for every agent \`skills\` finds, except those of
                                the archetypes: after the plan chose one, run \`lernapps skills --archetype <name>\`

Then follow the plan: it says what to do, and when to wait for the creator.

Options:
  --addon <package>  a package that extends the tooling, e.g. @lernapps/practice: its plan template and its skills
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

/** The branch the plan works on (rule 8 of the plan template). */
export const WORK_BRANCH = "work";

/**
 * Makes the folder a git repository on the branch `work`, which the plan names, unless it is one already: `create` and
 * the hooks need it, and the plan's first rule is to work there. Returns what it did, for the output; no commit.
 */
export function ensureRepository(dir: string): string | undefined {
  if (existsSync(join(dir, ".git"))) return undefined;
  const result = spawnSync("git", ["init", "--quiet", `--initial-branch=${WORK_BRANCH}`], {
    cwd: dir,
    encoding: "utf8",
  });
  if (result.error) throw new CreateError(`git cannot run: ${result.error.message}. Install git, then run init again`);
  if (result.status !== 0) throw new CreateError(`git init failed: ${`${result.stdout}${result.stderr}`.trim()}`);
  return `a git repository on the branch ${WORK_BRANCH}`;
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

/** A package name from the folder's name: lower case, letters, digits and hyphens. */
const slug = (dir: string) =>
  basename(dir)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "app";

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
  const present = readdirSync(dir).filter((entry) => entry !== ".git");
  if (present.length > 0) {
    throw new CreateError(
      `${dir} is not empty (${present.slice(0, 5).join(", ")}${present.length > 5 ? ", ..." : ""}): start in a new, empty folder`,
    );
  }
  const addon = values.addon;
  const repository = ensureRepository(dir);
  writeJson(join(dir, "package.json"), {
    name: slug(dir),
    version: "0.0.0",
    private: true,
    lernapps: { init: true },
  });
  const fail = (message: string) => new CreateError(message);
  run(
    "npm",
    ["install", "--save-dev", "--no-audit", "--no-fund", `${TOOLING}@${ownVersion()}`, ...(addon ? [addon] : [])],
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
  writeFileSync(target, readFileSync(template));
  syncSkills(
    dir,
    archetypeSkills().map((skill) => skill.name),
  );
  process.stdout.write(
    `lernapps init: ${relative(dir, target)} from ${relativeTemplate(template, dir)}; the skills of the packages are installed${repository ? `; ${repository}` : ""}\nNext: read ${relative(dir, target)} completely and follow it\n`,
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
