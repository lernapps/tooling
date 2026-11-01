// The generator, `lernapps create --archetype <name> [<dir>]`: writes a new app into an empty folder, once the creator
// has confirmed the first version's plan (.vibe/plans/01-<short name>.md, in the phase code, for this archetype). It
// copies the archetype's folder out of the installed package @lernapps/app-templates (a dependency of this package, at
// an exact version), and makes the app depend on that same version of the runtime, so template and runtime always
// match. Then it writes what every app has: AGENTS.md, the
// plan, the content guide (an app-local skill), the workflows, LICENSE, an issue form for content errors and the
// Renovate configuration (generator/app/); an interactive app also its architecture (generator/architecture.ts). The
// skills `lernapps init` synced into the folder stay, and are committed with the app; `lernapps update` replaces them
// with those of the tooling it moves the app to.
// To move to a new app-templates: set the exact version of @lernapps/app-templates in package.json; the generator's
// tests then run on that version.
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { ARCHITECTURE, ARCHITECTURE_ARCHETYPES, writeArchitecture } from "./architecture.ts";
import { LEGACY_PLAN, MIGRATED_PLAN, PLAN_NAME, PLANS, planFrontMatter, plans } from "../src/plan.ts";
import { UsageError } from "../src/usage.ts";

/** The options of `lernapps create`, as node:util parseArgs takes them. */
export const CREATE_OPTIONS = {
  archetype: { type: "string" },
  plan: { type: "string" },
  templates: { type: "string" },
  tooling: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

export const CREATE_USAGE = `Usage: lernapps create --archetype <name> [<dir>] [--plan <file>] [--templates <repo>] [--tooling <spec>]

Writes a new app from the archetype's template into <dir> (default: the current folder), which must be empty
except for .git, the first version's plan .vibe/plans/01-<short name>.md and the skills that
lernapps init synced (.agents/skills/, .claude/skills/, skills-lock.json, and the package.json, package-lock.json and
node_modules init wrote). The template is the folder <name>/ of the installed package @lernapps/app-templates, the
version @lernapps/tooling depends on; the app depends on the runtime of the same version.

It needs the plan of the first version, confirmed by the creator: started from the plan template as
.vibe/plans/01-<short name>.md, the only plan there, worked through Explore and Plan, now in the phase code
(phase: code in its front matter), with the same archetype as --archetype. A plan .vibe/plan.md of an earlier
tooling is moved to .vibe/plans/01-first-version.md. Without a plan, it writes nothing and says what to do.

Run it in the folder lernapps init prepared, from the tooling init installed:
  npx lernapps create --archetype <name> [<dir>]
It needs git, and the npm registry for the npm install that follows. The app then depends on the version of
@lernapps/tooling that created it, and its workflows use the actions of that version's tag.

It writes, besides the template: package.json named after the folder (its prepare script, lernapps hooks,
installs the git hooks; for an explainer and an interactive app also vue-tsc and typescript, with which lernapps
check type-checks its Vue components; for an interactive app also @doctc/arc42, which checks its architecture),
for an interactive app its architecture docs/arc42/ (the generic part and the interactive extension of app-templates,
which lernapps update replaces except the marked app sections, where the app's own part goes),
AGENTS.md, the plan in .vibe/plans/ (the one already there is kept), the content guide
.agents/skills/app-content/SKILL.md (a skeleton the assistant fills in; linked as .claude/skills/app-content for
Claude Code where the system allows symbolic links), the workflow
.github/workflows/pages.yml (the app check action on every pull request and push to main; on main, then the app
publish action to the repo's GitHub Pages), an issue form for content errors, LICENSE (MIT), renovate.json (the
Renovate preset of lernapps). The installed skills and skills-lock.json are committed with the app, like the
content guide; lernapps update replaces the lernapps-* skills.

Then: git init (if <dir> is not a repository yet), npm install (installs the git hooks), and the first commit.

Exit codes: 0 when the app is written, 1 when it cannot be (the message says why), 2 on a usage error.

Options:
  --archetype <name>  the archetype chosen in the plan: ${"{archetypes}"}
  --plan <file>       the confirmed plan to carry over to .vibe/plans/01-<short name>.md, the short name from
                      its file name <NN>-<short name>.md, else 01-plan.md (default: the one in <dir>)
  --templates <dir>   the package @lernapps/app-templates to copy from: its folder, or a clone of its repository
                      (default: the environment variable LERNAPPS_TEMPLATES, else the installed package)
  --tooling <spec>    the npm spec of @lernapps/tooling the app depends on (default: ^ the version of this
                      @lernapps/tooling)
  -h, --help          print this help
`;

/** The generator cannot write the app; the message says why and what to do. */
export class CreateError extends Error {}

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
export const fromPackage = (...path: string[]) => join(packageRoot, ...path);

export interface Manifest {
  name?: string;
  version?: string;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  lernapps?: { archetypes?: string[]; init?: boolean };
  [key: string]: unknown;
}

export const readJson = (file: string): Manifest => JSON.parse(readFileSync(file, "utf8")) as Manifest;
export const writeJson = (file: string, value: unknown) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/** The package @lernapps/app-templates: where its templates are, its version, and the archetypes it has. */
export interface Templates {
  root: string;
  version: string;
  archetypes: string[];
}

/** The runtime package, which also carries the templates. */
export const RUNTIME = "@lernapps/app-templates";

/**
 * The package @lernapps/app-templates: the folder named (a local copy or clone), else the one installed next to this
 * package, the version it depends on.
 */
export function templatesPackage(dir?: string): Templates {
  let root: string;
  if (dir !== undefined) root = resolve(dir);
  else {
    try {
      root = dirname(createRequire(import.meta.url).resolve(`${RUNTIME}/package.json`));
    } catch {
      throw new CreateError(
        `the package ${RUNTIME} is not installed: it is a dependency of @lernapps/tooling, so run npm install, or name a copy with --templates <dir> or LERNAPPS_TEMPLATES`,
      );
    }
  }
  if (!existsSync(join(root, "package.json"))) {
    throw new CreateError(`${root} is no package ${RUNTIME}: it has no package.json`);
  }
  const manifest = readJson(join(root, "package.json"));
  return { root, version: manifest.version ?? "0.0.0", archetypes: [...(manifest.lernapps?.archetypes ?? [])].sort() };
}

/** The archetypes of the installed templates. */
export const archetypes = (): string[] => templatesPackage().archetypes;

/** The version of this package. */
export const ownVersion = (): string => readJson(fromPackage("package.json")).version ?? "0.0.0";

/** The lock file of `npx skills add`, next to the skills it installed. */
export const SKILLS_LOCK = "skills-lock.json";

/** The skills that `npx skills add` installed into the folder: the names in its lock file. */
function installedSkills(dir: string): Set<string> {
  try {
    const lock = JSON.parse(readFileSync(join(dir, SKILLS_LOCK), "utf8")) as { skills?: Record<string, unknown> };
    return new Set(Object.keys(lock.skills ?? {}));
  } catch {
    return new Set();
  }
}

/**
 * What is in the folder besides .git, the plans (src/plan.ts) and the skills as `npx skills add lernapps/tooling`
 * installs them: each skill of its lock file in .agents/skills/<skill>/ and, for Claude Code, .claude/skills/<skill>
 * (a link to it, or a copy with --copy).
 */
function contents(dir: string): string[] {
  if (!existsSync(dir)) return [];
  if (!statSync(dir).isDirectory()) throw new CreateError(`${dir} is a file, not a folder`);
  const skills = installedSkills(dir);
  const within = (folder: string, keep: (name: string) => boolean): string[] =>
    readdirSync(join(dir, folder))
      .filter((name) => !keep(name))
      .map((name) => `${folder}/${name}`);
  return readdirSync(dir).flatMap((name) => {
    if (name === ".git" || (name === SKILLS_LOCK && skills.size > 0)) return [];
    // what `lernapps init` wrote: the installed packages, their lock, and a package.json it marked
    if (name === "node_modules" || name === "package-lock.json") return [];
    if (name === "package.json" && readJson(join(dir, name)).lernapps?.init === true) return [];
    if (name === ".vibe") {
      return within(name, (file) => file === "plan.md" || file === "plans").concat(
        existsSync(join(dir, PLANS)) ? within(PLANS, (file) => PLAN_NAME.test(file)) : [],
      );
    }
    if ((name === ".agents" || name === ".claude") && skills.size > 0) {
      return within(name, (folder) => folder === "skills").concat(
        existsSync(join(dir, name, "skills")) ? within(`${name}/skills`, (skill) => skills.has(skill)) : [],
      );
    }
    return [name];
  });
}

function git(args: readonly string[], cwd: string): { ok: boolean; out: string } {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.error) throw new CreateError(`git cannot run: ${result.error.message}. Install git, then create again`);
  return { ok: result.status === 0, out: `${result.stdout}${result.stderr}`.trim() };
}

/** A package name from the folder's name: lower case, letters, digits and hyphens. */
const packageName = (dir: string) =>
  basename(dir)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "app";

/** This package, as an app depends on it. */
export const TOOLING = "@lernapps/tooling";

/**
 * What the apps of an archetype need beyond its template, as development dependencies: an explainer's Vue components
 * (src/components/<Name>.vue) are type-checked by vue-tsc, which `lernapps check` runs once the app has a .vue file.
 * The same versions as in app-templates; Renovate moves them in the app.
 */
export const ARCHETYPE_DEV_DEPENDENCIES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  explainer: { typescript: "6.0.3", "vue-tsc": "3.3.11" },
  // an interactive app's UI is Vue components from the start; its architecture (docs/arc42/) is validated by the
  // arc42 CLI, the version this repo validates its own with
  interactive: { "@doctc/arc42": "0.38.0", typescript: "6.0.3", "vue-tsc": "3.3.11" },
};

const START_THE_PLAN =
  "start the plan of the first version from the plan template with `npx --yes @lernapps/tooling init <short name>` in an empty folder, which writes it complete and unchanged as .vibe/plans/01-<short name>.md, and work through Explore and Plan with the creator first";

/** The plan the app is created from, and where it goes in the app. */
interface Plan {
  file: string;
  target: string;
}

/**
 * The first version's plan: the one given (carried over to .vibe/plans/01-<short name>.md), else the only one in
 * the folder's .vibe/plans/, numbered 01, else a .vibe/plan.md of an earlier tooling (moved to
 * .vibe/plans/01-first-version.md, as lernapps update moves it).
 */
function firstPlan(dir: string, given: string | undefined): Plan {
  const found = plans(dir).map((plan) => join(dir, plan));
  const legacy = existsSync(join(dir, LEGACY_PLAN)) ? [join(dir, LEGACY_PLAN)] : [];
  if (given !== undefined) {
    if (!existsSync(given)) throw new CreateError(`there is no plan ${given}: ${START_THE_PLAN}`);
    const others = [...found, ...legacy].filter((plan) => resolve(plan) !== resolve(given));
    if (others.length > 0) {
      throw new CreateError(
        `${others.join(", ")} is already there besides the plan ${given} (--plan): a new app has one plan, the first version's; remove the one that is not confirmed`,
      );
    }
    const name = /^\d{2}-([^/\\]+\.md)$/.exec(basename(given))?.[1] ?? "plan.md";
    return { file: given, target: join(dir, PLANS, `01-${name}`) };
  }
  if (found.length + legacy.length > 1) {
    throw new CreateError(
      `there is more than one plan (${[...found, ...legacy].join(", ")}): a new app has one plan, the first version's, .vibe/plans/01-<short name>.md; keep the one the creator confirmed, or name it with --plan <file>`,
    );
  }
  const [plan] = found;
  if (plan !== undefined) {
    if (!basename(plan).startsWith("01-")) {
      throw new CreateError(
        `the plan ${plan} is not numbered 01: the first version's plan is .vibe/plans/01-<short name>.md, from the plan template; rename it`,
      );
    }
    return { file: plan, target: plan };
  }
  const [old] = legacy;
  if (old !== undefined) return { file: old, target: join(dir, MIGRATED_PLAN) };
  throw new CreateError(`there is no plan in ${join(dir, PLANS)}: ${START_THE_PLAN}`);
}

/**
 * The plan the app is created from, which the creator has confirmed: it is in the phase code (or later), for this
 * archetype. The front matter is read as the hooks read it (src/plan.ts).
 */
function confirmedPlan(dir: string, archetype: string, given: string | undefined): Plan {
  const found = firstPlan(dir, given);
  const plan = found.file;
  const values = planFrontMatter(plan);
  const phase = values["phase"];
  if (phase === "explore" || phase === "plan") {
    throw new CreateError(
      `the plan ${plan} is in the phase ${phase}: the creator must confirm the plan first. Work through Explore and Plan with the creator; the Plan phase ends with phase: code, then create the app`,
    );
  }
  if (phase !== "code" && phase !== "commit") {
    throw new CreateError(`the plan ${plan} has no phase code in its front matter: ${START_THE_PLAN}`);
  }
  if (values["archetype"] !== archetype) {
    throw new CreateError(
      `the plan ${plan} chose the archetype ${String(values["archetype"])}, not ${archetype} (--archetype): create the app with the archetype of the plan, or change the plan with the creator first`,
    );
  }
  return found;
}

/** The plan at its place in .vibe/plans/: the one in the folder stays, a legacy one moves, one given is copied. */
function writePlan(dir: string, plan: Plan): void {
  if (resolve(plan.file) === resolve(plan.target)) return;
  mkdirSync(dirname(plan.target), { recursive: true });
  if (resolve(plan.file) === resolve(join(dir, LEGACY_PLAN))) renameSync(plan.file, plan.target);
  else writeFileSync(plan.target, readFileSync(plan.file));
}

/**
 * The lines an earlier generator appended to .gitignore, to ignore the skills `npx skills add lernapps/tooling`
 * installed. Apps now commit them (every checkout has the skills of the tooling the app is on); `lernapps update`
 * removes these lines from an app that has them.
 */
export const IGNORED_SKILLS_LINES: readonly string[] = [
  "# the skills npx skills add lernapps/tooling installed: each checkout installs them; the content guide is the app's",
  `/${SKILLS_LOCK}`,
  "/.agents/skills/*",
  "!/.agents/skills/app-content/",
  "/.claude/skills/*",
  "!/.claude/skills/app-content",
];

/** The files every app has (generator/app/), with their placeholders filled. */
function writeAppFiles(dir: string, values: Record<string, string>): void {
  const source = fromPackage("generator", "app");
  const walk = (folder: string): string[] =>
    readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
    );
  for (const file of walk(source)) {
    const target = join(dir, relative(source, file));
    mkdirSync(dirname(target), { recursive: true });
    const text = readFileSync(file, "utf8").replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
    writeFileSync(target, text);
  }
  writeFileSync(join(dir, "AGENTS.md"), readFileSync(fromPackage("guidance", "AGENTS.md")));
}

/** The app's content guide, an app-local skill: written as a skeleton, filled in by the assistant. */
export const CONTENT_GUIDE = ".agents/skills/app-content/SKILL.md";
/** Where Claude Code looks for the skills of a project: a relative symbolic link to the guide's folder. */
const CONTENT_GUIDE_LINK = ".claude/skills/app-content";

/**
 * Adds the content guide's skeleton and its link where they are missing; what it did, one line per file. The link is
 * relative, so it survives a move, a commit and a clone (git keeps it as a link). Where the system allows no symbolic
 * link (Windows without Developer Mode) it is left out: AGENTS.md names the guide's path, which every harness reads.
 */
export function addContentGuide(dir: string): string[] {
  const done: string[] = [];
  const guide = join(dir, CONTENT_GUIDE);
  if (!existsSync(guide)) {
    mkdirSync(dirname(guide), { recursive: true });
    writeFileSync(guide, readFileSync(fromPackage("generator", "app", CONTENT_GUIDE)));
    done.push(`added ${CONTENT_GUIDE}; fill it in from the plan, as its comments say`);
  }
  const link = join(dir, CONTENT_GUIDE_LINK);
  if (!existsSync(link)) {
    try {
      rmSync(link, { force: true }); // a dangling link
      mkdirSync(dirname(link), { recursive: true });
      symlinkSync("../../.agents/skills/app-content", link, "dir");
      done.push(`linked ${CONTENT_GUIDE_LINK} to it for Claude Code`);
    } catch (error) {
      done.push(
        `could not link ${CONTENT_GUIDE_LINK} (${error instanceof Error ? error.message : String(error)}); AGENTS.md names ${CONTENT_GUIDE}, which is enough`,
      );
    }
  }
  return done;
}

export function create(args: string[]): number {
  const { values, positionals } = parseArgs({
    args,
    options: CREATE_OPTIONS,
    strict: true,
    allowPositionals: true,
  });
  const templates = templatesPackage(values.templates ?? process.env["LERNAPPS_TEMPLATES"]);
  const known = templates.archetypes;
  if (values.help) {
    process.stdout.write(CREATE_USAGE.replace("{archetypes}", known.join(", ")));
    return 0;
  }
  const archetype = values.archetype;
  if (archetype === undefined) throw new UsageError(`create needs --archetype <name> (${known.join(", ")})`);
  if (!known.includes(archetype)) {
    throw new UsageError(`unknown archetype: ${archetype} (known: ${known.join(", ")})`);
  }
  if (positionals.length > 1) throw new UsageError(`one <dir> at most, not ${positionals.join(" ")}`);
  const dir = resolve(positionals[0] ?? ".");
  const found = contents(dir);
  if (found.length > 0) {
    throw new CreateError(
      `${dir} is not empty (${found.slice(0, 5).join(", ")}${found.length > 5 ? ", ..." : ""}): create the app in an empty folder; only .git, the first version's plan .vibe/plans/01-<short name>.md and what lernapps init wrote (its skills, package.json, package-lock.json and node_modules) may be there`,
    );
  }
  const plan = confirmedPlan(dir, archetype, values.plan);

  const architecture = ARCHITECTURE_ARCHETYPES.includes(archetype);
  if (!existsSync(join(templates.root, archetype, "package.json"))) {
    throw new CreateError(`${templates.root} has no template ${archetype}/ (version ${templates.version})`);
  }
  // what `lernapps init` wrote: its dependencies (the tooling, skills, an add-on) stay, and so does its lock
  const initialised = existsSync(join(dir, "package.json")) ? readJson(join(dir, "package.json")) : undefined;
  const initialLock = existsSync(join(dir, "package-lock.json"))
    ? readFileSync(join(dir, "package-lock.json"), "utf8")
    : undefined;
  mkdirSync(dir, { recursive: true });
  cpSync(join(templates.root, archetype), dir, { recursive: true });
  rmSync(join(dir, "package-lock.json"), { force: true }); // the template's lock, of another name and tooling
  if (initialLock !== undefined) writeFileSync(join(dir, "package-lock.json"), initialLock);
  // npm never ships a .gitignore: the package carries it as _gitignore (app-templates, scripts/pack-dotfiles.ts)
  if (existsSync(join(dir, "_gitignore"))) renameSync(join(dir, "_gitignore"), join(dir, ".gitignore"));
  // the template's README says what the archetype can do, for choosing one; it is no part of the app
  rmSync(join(dir, "README.md"), { force: true });
  // the template folder's architecture is the extension of app-templates' own: an interactive app gets the
  // combination as its reference, the other archetypes none
  rmSync(join(dir, ARCHITECTURE), { recursive: true, force: true });
  if (existsSync(join(dir, "docs")) && readdirSync(join(dir, "docs")).length === 0) {
    rmSync(join(dir, "docs"), { recursive: true });
  }
  if (architecture) writeArchitecture(dir, templates.root, archetype, templates.version);
  else rmSync(join(dir, ".arc42ignore"), { force: true });

  const app = readJson(join(dir, "package.json"));
  const name = packageName(dir);
  app.name = name;
  // npm install installs the hooks of this package, in the app's own repository only (lernapps hooks); the
  // template needs no prepare script of its own, which would install them in app-templates
  app.scripts = { ...app.scripts, prepare: "lernapps hooks" };
  // the template uses the runtime of its own checkout (file:.., installed as a copy through .npmrc); the app the
  // version of the runtime it was copied from
  if (app.devDependencies?.[RUNTIME] !== undefined) {
    app.devDependencies = { ...app.devDependencies, [RUNTIME]: `^${templates.version}` };
    rmSync(join(dir, ".npmrc"), { force: true });
  }
  // the tooling the app depends on: the one named, else this version (init may have installed it already)
  const tooling = values.tooling ?? `^${ownVersion()}`;
  app.devDependencies = {
    ...app.devDependencies,
    ...ARCHETYPE_DEV_DEPENDENCIES[archetype],
    ...initialised?.devDependencies,
    [TOOLING]: tooling,
  };
  // sorted by name, as npm and the formatter keep them
  app.devDependencies = Object.fromEntries(Object.entries(app.devDependencies).sort(([a], [b]) => a.localeCompare(b)));
  writeJson(join(dir, "package.json"), app);

  const holder = git(["config", "user.name"], existsSync(dir) ? dir : process.cwd());
  const moved = resolve(plan.file) === resolve(join(dir, LEGACY_PLAN));
  writePlan(dir, plan);
  writeAppFiles(dir, {
    tooling: `v${ownVersion()}`,
    year: String(new Date().getFullYear()),
    holder: holder.ok && holder.out !== "" ? holder.out : "the creator of this app",
  });
  const guide = addContentGuide(dir).filter((line) => line.startsWith("could not"));

  process.stdout.write(
    [
      `lernapps create: the ${archetype} app ${name} in ${dir} (app-templates ${templates.version})`,
      ...guide.map((line) => `Content guide: ${line}`),
      ...(moved ? [`Plan: moved ${LEGACY_PLAN} to ${relative(dir, plan.target)}`] : []),
      `Next: ${existsSync(join(dir, ".git")) ? "" : "git init, "}npm install, then follow ${relative(dir, plan.target)}`,
      "",
    ].join("\n"),
  );
  return 0;
}
