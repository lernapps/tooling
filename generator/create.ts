// The generator, `lernapps create --archetype <name> [<dir>]`: writes a new app into an empty folder, once the creator
// has confirmed the first version's plan (.vibe/plans/01-<short name>.md, in the phase code, for this archetype). It
// writes the archetype's scaffold out of the installed package @lernapps/app-templates (a dependency of this package,
// at an exact version): the paths of the template folder its lernapps.scaffold lists and the placeholder in
// scaffold/<archetype>/, not the example app, which stays in node_modules for the assistant to look up. It makes the
// app depend on that same version of the runtime, so template and runtime always match. Then it writes what every app has: AGENTS.md, the
// plan, the content guide (an app-local skill), the workflows, LICENSE, an issue form for content errors and the
// Renovate configuration (generator/app/); an interactive app also its architecture (generator/architecture.ts). The
// skills `lernapps init` synced into the folder stay, and are committed with the app; `lernapps update` replaces them
// with those of the tooling it moves the app to.
// To move to a new app-templates: set the exact version of @lernapps/app-templates in package.json; the generator's
// tests then run on that version. A commit (github:lernapps/app-templates#<commit>) is for a branch only: every merge
// into main publishes this package, and lernapps/practice builds with the exact version the published package names.
// An app gets ^ the version, or, from a branch build, the same commit (runtimeSpec).
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
import { ARCHITECTURE_ARCHETYPES, writeArchitecture } from "./architecture.ts";
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
node_modules init wrote). From the installed package @lernapps/app-templates, the version @lernapps/tooling depends
on, it writes the archetype's scaffold: the files of the template folder <name>/ that the package's lernapps.scaffold
lists (the entry, the configuration, the end-to-end tests of the content) and a placeholder as start content
(scaffold/<name>/), which the planned content replaces. The template folder itself is the example app: it stays in
node_modules/@lernapps/app-templates/<name>/, to look up. The app depends on the runtime of the same version (or
the same commit, while @lernapps/tooling depends on an unreleased one).

It needs the plan of the first version, confirmed by the creator: started from the plan template as
.vibe/plans/01-<short name>.md, the only plan there, worked through Explore and Plan, now in the phase code
(phase: code in its front matter), with the same archetype as --archetype. A plan .vibe/plan.md of an earlier
tooling is moved to .vibe/plans/01-first-version.md. Without a plan, it writes nothing and says what to do.

Run it in the folder lernapps init prepared, from the tooling init installed:
  npx --no -- lernapps create --archetype <name> [<dir>]
It needs git, and the npm registry for the npm install that follows. The app then depends on the version of
@lernapps/tooling that created it, and its workflows use the actions of that version's tag.

It writes, besides the scaffold: package.json named after the short name given to init (the folder's name without init) (its prepare script, lernapps hooks,
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

It installs nothing and commits nothing. Its last lines say what to do next, in this order: git init
--initial-branch=work (only if <dir> is not a repository yet; lernapps init made one), npm install (installs the
runtime and the git hooks), git add -A and git commit (the first commit, on work; the hooks check it), then follow
the plan.

Exit codes: 0 when the app is written, 1 when it cannot be (the message says why), 2 on a usage error.

Options:
  --archetype <name>  the archetype chosen in the plan: ${"{archetypes}"}
  --plan <file>       the confirmed plan to carry over to .vibe/plans/01-<short name>.md, the short name from
                      its file name <NN>-<short name>.md, else 01-plan.md (default: the one in <dir>)
  --templates <dir>   the package @lernapps/app-templates to copy from: its folder, or a clone of its repository
                      (default: the environment variable LERNAPPS_TEMPLATES, else the installed package)
  --tooling <spec>    the npm spec of @lernapps/tooling the app depends on (default: the one lernapps init
                      installed, else ^ the version of this @lernapps/tooling)
  -h, --help          print this help
`;

/** The generator cannot write the app; the message says why and what to do. */
export class CreateError extends Error {}

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
export const fromPackage = (...path: string[]) => join(packageRoot, ...path);

export interface Manifest {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  lernapps?: { archetypes?: string[]; scaffold?: Record<string, string[]>; init?: boolean };
  [key: string]: unknown;
}

export const readJson = (file: string): Manifest => JSON.parse(readFileSync(file, "utf8")) as Manifest;
export const writeJson = (file: string, value: unknown) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/** The package @lernapps/app-templates: where its templates are, its version, and the archetypes it has. */
export interface Templates {
  root: string;
  version: string;
  archetypes: string[];
  /** Per archetype, the paths of its template folder a new app gets (lernapps.scaffold of the package). */
  scaffold: Record<string, string[]>;
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
  return {
    root,
    version: manifest.version ?? "0.0.0",
    archetypes: [...(manifest.lernapps?.archetypes ?? [])].sort(),
    scaffold: manifest.lernapps?.scaffold ?? {},
  };
}

/** The version of a package built from a commit, not released: its package.json in the repository says 0.0.0. */
const UNRELEASED = "0.0.0";

/**
 * The spec of the runtime an app depends on, for templates of `version`: ^ that version; for templates built from a
 * commit (version 0.0.0, which the registry does not have) the spec this tooling depends on, the same commit
 * (github:lernapps/app-templates#<commit>), so that template and runtime match.
 */
export function runtimeSpec(version: string): string {
  if (version !== UNRELEASED) return `^${version}`;
  return readJson(fromPackage("package.json")).dependencies?.[RUNTIME] ?? `^${version}`;
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
      // the planning folder: the plans are checked (a first version has one), what the planning leaves beside them stays
      // (the sketches of the plan, .vibe/sketches/)
      return existsSync(join(dir, PLANS)) ? within(PLANS, (file) => PLAN_NAME.test(file)) : [];
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

/**
 * The scaffold of the archetype into `dir` (decision dec-scaffold of app-templates): the paths of its template folder
 * that lernapps.scaffold.<archetype> of the package lists (the entry, the configuration, the e2e entry), then the start
 * content scaffold/<archetype>/, a placeholder the creator replaces. The rest of the template folder is the example
 * app; it stays in node_modules/@lernapps/app-templates/<archetype>/ for the creator's assistant to look up.
 */
export function writeScaffold(templates: Templates, archetype: string, dir: string): void {
  const paths = templates.scaffold[archetype];
  if (paths === undefined || paths.length === 0) {
    throw new CreateError(
      `${templates.root} (version ${templates.version}) names no scaffold for ${archetype} (lernapps.scaffold in its package.json): use the version of ${RUNTIME} this tooling depends on`,
    );
  }
  const template = join(templates.root, archetype);
  for (const path of paths) {
    // npm never ships a .gitignore: the package carries it as _gitignore (app-templates, scripts/pack-dotfiles.ts);
    // a clone of the repository has the .gitignore itself
    const shipped = basename(path) === ".gitignore" ? join(template, dirname(path), "_gitignore") : undefined;
    const source = shipped !== undefined && existsSync(shipped) ? shipped : join(template, path);
    if (!existsSync(source)) throw new CreateError(`${template} has no ${path}, which its scaffold lists`);
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    cpSync(source, join(dir, path));
  }
  const start = join(templates.root, "scaffold", archetype);
  if (!existsSync(start)) throw new CreateError(`${templates.root} has no start content scaffold/${archetype}/`);
  cpSync(start, dir, { recursive: true });
}

/** The branch the plan works on (rule 8 of the plan template). */
export const WORK_BRANCH = "work";

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
      `${dir} is not empty (${found.slice(0, 5).join(", ")}${found.length > 5 ? ", ..." : ""}): create the app in an empty folder; only .git, .vibe/ (the first version's plan .vibe/plans/01-<short name>.md, and its sketches) and what lernapps init wrote (its skills, package.json, package-lock.json and node_modules) may be there`,
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
  writeScaffold(templates, archetype, dir);
  if (initialLock !== undefined) writeFileSync(join(dir, "package-lock.json"), initialLock);
  if (architecture) writeArchitecture(dir, templates.root, archetype, templates.version);

  const app = readJson(join(dir, "package.json"));
  // the short name the creator gave `lernapps init` stays the app's name; without init, the folder names it
  const name =
    initialised?.lernapps?.init === true && typeof initialised.name === "string" ? initialised.name : packageName(dir);
  app.name = name;
  // npm install installs the hooks of this package, in the app's own repository only (lernapps hooks); the
  // template needs no prepare script of its own, which would install them in app-templates
  app.scripts = { ...app.scripts, prepare: "lernapps hooks" };
  // the template uses the runtime of its own checkout (file:.., installed as a copy through .npmrc); the app the
  // version of the runtime it was copied from
  if (app.devDependencies?.[RUNTIME] !== undefined) {
    app.devDependencies = { ...app.devDependencies, [RUNTIME]: runtimeSpec(templates.version) };
  }
  // the template keeps its checkout's runtime with an override (file:..), which npm would otherwise swap for the
  // version this tooling depends on; the app has no checkout to point at
  const overrides = app["overrides"];
  if (typeof overrides === "object" && overrides !== null && RUNTIME in overrides) {
    const kept = Object.fromEntries(Object.entries(overrides).filter(([name]) => name !== RUNTIME));
    if (Object.keys(kept).length > 0) app["overrides"] = kept;
    else delete app["overrides"];
  }
  // the tooling the app depends on: the one named, else the one init installed (maybe a local one, --tooling of
  // init), else this version
  const tooling = values.tooling ?? initialised?.devDependencies?.[TOOLING] ?? `^${ownVersion()}`;
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
      "Next, in this order (create installs and commits nothing):",
      ...[
        ...(existsSync(join(dir, ".git")) ? [] : [`git init --initial-branch=${WORK_BRANCH}`]),
        "npm install (the runtime and the git hooks)",
        "git add -A, then git commit (the first commit; the hooks check it)",
        `follow ${relative(dir, plan.target)}`,
      ].map((step, index) => `  ${index + 1}. ${step}`),
      "",
    ].join("\n"),
  );
  return 0;
}
