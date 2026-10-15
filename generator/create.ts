// The generator, `lernapps create --archetype <name> [<dir>]`: writes a new app into an empty folder, once the creator
// has confirmed the plan (.vibe/plan.md, in the phase code, for this archetype). It copies the archetype's folder from
// lernapps/app-templates at the commit pinned in this package (package.json, appTemplates), and makes the app depend
// on the runtime of that same commit (the package @lernapps/app-templates at the root of that repo), so template and
// runtime always match. Then it writes what every app has: AGENTS.md, the plan file, the content guide (an app-local
// skill), the workflows, LICENSE, an issue form for content errors and the Renovate configuration (generator/app/),
// and has git ignore the skills an assistant installed with `npx skills add`.
// To move the pin when app-templates changes: set appTemplates.commit in package.json to the new commit on its main
// (and appTemplates.archetypes to its archetype folders); the generator's tests then run on that commit.
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { parse } from "yaml";
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
except for .git, the plan file .vibe/plan.md and the skills that npx skills add lernapps/tooling installed
(.agents/skills/, .claude/skills/, skills-lock.json). The template is the folder <name>/ of lernapps/app-templates
at the commit pinned in @lernapps/tooling; the app depends on the runtime @lernapps/app-templates of the same commit.

It needs the plan, confirmed by the creator: started from the plan template, worked through Explore and Plan, now
in the phase code (phase: code in its front matter), with the same archetype as --archetype. Without it, it writes
nothing and says what to do.

Run it before anything is installed, with npx from git (the package is not on npm):
  npx --yes github:lernapps/tooling#main create --archetype <name> [<dir>]
It needs git and access to github.com, codeload.github.com and the npm registry. The app then depends on the
commit of @lernapps/tooling that npx installed, and its workflows use the actions of that commit.

It writes, besides the template: package.json named after the folder (its prepare script, lernapps hooks,
installs the git hooks; for an explainer also vue-tsc and typescript, with which lernapps check type-checks its Vue
components), AGENTS.md, the plan .vibe/plan.md (the one already there is kept), the content guide
.agents/skills/app-content/SKILL.md (a skeleton the assistant fills in; linked as .claude/skills/app-content for
Claude Code where the system allows symbolic links), the workflow
.github/workflows/pages.yml (the app check action on every pull request and push to main; on main, then the app
publish action to the repo's GitHub Pages), an issue form for content errors, LICENSE (MIT), renovate.json (the
Renovate preset of lernapps) and, in .gitignore, the installed skills and skills-lock.json (installed again in each
checkout; the content guide is committed).

Then: git init (if <dir> is not a repository yet), npm install (installs the git hooks), and the first commit.

Exit codes: 0 when the app is written, 1 when it cannot be (the message says why), 2 on a usage error.

Options:
  --archetype <name>  the archetype chosen in the plan: ${"{archetypes}"}
  --plan <file>       the confirmed plan to carry over to .vibe/plan.md (default: the one in <dir>)
  --templates <repo>  where to fetch app-templates from: a git URL or a local clone with the pinned commit
                      (default: the environment variable LERNAPPS_TEMPLATES, else GitHub)
  --tooling <spec>    the npm spec of @lernapps/tooling the app depends on (default: the commit this
                      @lernapps/tooling was installed from, else the template's)
  -h, --help          print this help
`;

/** The generator cannot write the app; the message says why and what to do. */
export class CreateError extends Error {}

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
export const fromPackage = (...path: string[]) => join(packageRoot, ...path);

export interface Manifest {
  name?: string;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  appTemplates?: { repository: string; commit: string; archetypes: string[] };
  [key: string]: unknown;
}

export const readJson = (file: string): Manifest => JSON.parse(readFileSync(file, "utf8")) as Manifest;
export const writeJson = (file: string, value: unknown) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/** The archetypes this version of the package has templates for: the folders of app-templates at the pin. */
export function archetypes(): string[] {
  return [...(readJson(fromPackage("package.json")).appTemplates?.archetypes ?? [])].sort();
}

/** The lock file of `npx skills add`, next to the skills it installed. */
const SKILLS_LOCK = "skills-lock.json";

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
 * What is in the folder besides .git, the plan file and the skills as `npx skills add lernapps/tooling` installs them:
 * each skill of its lock file in .agents/skills/<skill>/ and, for Claude Code, .claude/skills/<skill> (a link to it,
 * or a copy with --copy).
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
    if (name === ".vibe") return within(name, (file) => file === "plan.md");
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

/** The archetype's folder of app-templates at the pinned commit, in a temporary folder. */
function fetchTemplate(archetype: string, repository: string, commit: string): string {
  const work = mkdtempSync(join(tmpdir(), "lernapps-create-"));
  const fail = (message: string) => {
    rmSync(work, { recursive: true, force: true });
    return new CreateError(message);
  };
  const init = git(["init", "--quiet"], work);
  if (!init.ok) throw fail(`git init failed: ${init.out}`);
  const source = existsSync(repository) ? resolve(repository) : repository;
  const fetched = git(["fetch", "--quiet", "--depth", "1", source, commit], work);
  if (!fetched.ok) {
    throw fail(
      `cannot fetch app-templates at ${commit} from ${source}: ${fetched.out}. It needs the network; or name a local clone that has this commit with --templates <dir> or LERNAPPS_TEMPLATES`,
    );
  }
  const checkout = git(["checkout", "--quiet", "FETCH_HEAD", "--", `${archetype}/`], work);
  if (!checkout.ok) throw fail(`app-templates has no folder ${archetype}/ at ${commit}`);
  return join(work, archetype);
}

/** A package name from the folder's name: lower case, letters, digits and hyphens. */
const packageName = (dir: string) =>
  basename(dir)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "app";

export const commitOf = (spec: string | undefined) => /#([0-9a-f]{40})$/.exec(spec ?? "")?.[1];

/**
 * The npm spec this package was installed from, at its commit, read from the lock npm keeps next to it
 * (node_modules/.package-lock.json): `npx github:lernapps/tooling#main create ...` resolves `main` to a commit and
 * installs the package from git. The app then depends on the same commit, and its workflows use the actions of that
 * commit. Undefined when the package was not installed by npm (a clone of this repo).
 */
export function installedSpec(): string | undefined {
  const parts = resolve(packageRoot).split(sep);
  const at = parts.lastIndexOf("node_modules");
  if (at < 0) return undefined;
  const modules = parts.slice(0, at + 1).join(sep);
  const key = parts.slice(at).join("/");
  try {
    const lock = JSON.parse(readFileSync(join(modules, ".package-lock.json"), "utf8")) as {
      packages?: Record<string, { resolved?: string }>;
    };
    const resolved = lock.packages?.[key]?.resolved;
    const commit = commitOf(resolved);
    if (resolved === undefined || commit === undefined) return undefined;
    const github = /^git\+(?:ssh:\/\/git@|https:\/\/)github\.com[/:]([^/]+)\/([^/#]+?)(?:\.git)?#/.exec(resolved);
    return github ? `github:${github[1]}/${github[2]}#${commit}` : resolved;
  } catch {
    return undefined;
  }
}

/** The runtime package at the root of app-templates. */
export const RUNTIME = "@lernapps/app-templates";
/** This package, as an app depends on it. */
export const TOOLING = "@lernapps/tooling";

/** The commit of app-templates this @lernapps/tooling pins (appTemplates in package.json); `fail` when it pins none. */
export function pinnedTemplates(fail: (message: string) => Error): NonNullable<Manifest["appTemplates"]> {
  const pin = readJson(fromPackage("package.json")).appTemplates;
  if (pin === undefined) throw fail("this @lernapps/tooling pins no app-templates (appTemplates in package.json)");
  return pin;
}

/** The npm spec of the runtime at `commit` of `repository`: GitHub, another git URL, or a local clone. */
export function runtimeSpec(repository: string, commit: string): string {
  const github = /^(?:https:\/\/|git@)github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(repository);
  if (github) return `github:${github[1]}/${github[2]}#${commit}`;
  if (existsSync(repository)) return `git+file://${resolve(repository)}#${commit}`;
  return `git+${repository}#${commit}`;
}

/**
 * What the apps of an archetype need beyond its template, as development dependencies: an explainer's Vue components
 * (src/components/<Name>.vue) are type-checked by vue-tsc, which `lernapps check` runs once the app has a .vue file.
 * The same versions as in app-templates; Renovate moves them in the app.
 */
export const ARCHETYPE_DEV_DEPENDENCIES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  explainer: { typescript: "6.0.3", "vue-tsc": "3.3.11" },
};

/** Where an assistant downloads the plan template before the app exists. */
const PLAN_TEMPLATE = "https://raw.githubusercontent.com/lernapps/tooling/main/guidance/plan-template.md";
const START_THE_PLAN = `start the plan .vibe/plan.md from the plan template, downloaded complete and unchanged from ${PLAN_TEMPLATE}, and work through Explore and Plan with the creator first`;

/**
 * The plan the app is created from: the one given, else the one in the folder. The creator has confirmed it: it is in
 * the phase code (or later), for this archetype. The front matter is read as the hooks read it (plan-front-matter).
 */
function confirmedPlan(dir: string, archetype: string, given: string | undefined): string {
  const plan = given ?? join(dir, ".vibe", "plan.md");
  if (!existsSync(plan)) throw new CreateError(`there is no plan ${plan}: ${START_THE_PLAN}`);
  let front: unknown;
  try {
    front = parse(/^---\n([\s\S]*?)\n---\n/.exec(readFileSync(plan, "utf8"))?.[1] ?? "");
  } catch {
    front = undefined;
  }
  const values = (typeof front === "object" && front !== null ? front : {}) as Record<string, unknown>;
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
  return plan;
}

/** The plan at .vibe/plan.md: the one in the folder, or the one given, carried over. */
function writePlan(dir: string, plan: string): void {
  const target = join(dir, ".vibe", "plan.md");
  if (resolve(plan) === resolve(target)) return;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, readFileSync(plan));
}

/**
 * The skills as `npx skills add lernapps/tooling` installs them, ignored by git: an install for the assistant, like
 * node_modules. Each checkout installs them again, as the plan says, and so reads the current skills, not a copy that
 * falls behind. The app's own skill, the content guide, is committed.
 */
const IGNORED_SKILLS = `
# the skills npx skills add lernapps/tooling installed: each checkout installs them; the content guide is the app's
/${SKILLS_LOCK}
/.agents/skills/*
!/.agents/skills/app-content/
/.claude/skills/*
!/.claude/skills/app-content
`;

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
  const known = archetypes();
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
      `${dir} is not empty (${found.slice(0, 5).join(", ")}${found.length > 5 ? ", ..." : ""}): create the app in an empty folder; only .git, the plan file .vibe/plan.md and the skills that npx skills add lernapps/tooling installed may be there`,
    );
  }
  const plan = confirmedPlan(dir, archetype, values.plan);

  const pin = pinnedTemplates((message) => new CreateError(message));
  const repository = values.templates ?? process.env["LERNAPPS_TEMPLATES"] ?? pin.repository;
  const template = fetchTemplate(archetype, repository, pin.commit);
  try {
    mkdirSync(dir, { recursive: true });
    cpSync(template, dir, { recursive: true });
  } finally {
    rmSync(dirname(template), { recursive: true, force: true });
  }

  const app = readJson(join(dir, "package.json"));
  const templateTooling = app.devDependencies?.[TOOLING];
  const name = packageName(dir);
  app.name = name;
  // npm install installs the hooks of this package, in the app's own repository only (lernapps hooks); the
  // template needs no prepare script of its own, which would install them in app-templates
  app.scripts = { ...app.scripts, prepare: "lernapps hooks" };
  // the template uses the runtime of its own checkout (file:.., installed as a copy through .npmrc); the app the
  // runtime of the commit it was copied from
  if (app.devDependencies?.[RUNTIME] !== undefined) {
    app.devDependencies = { ...app.devDependencies, [RUNTIME]: runtimeSpec(repository, pin.commit) };
    rmSync(join(dir, ".npmrc"), { force: true });
  }
  // sorted by name, as npm and the formatter keep them
  app.devDependencies = Object.fromEntries(
    Object.entries({ ...app.devDependencies, ...ARCHETYPE_DEV_DEPENDENCIES[archetype] }).sort(([a], [b]) =>
      a.localeCompare(b),
    ),
  );
  // the tooling the app depends on: the one named, else the commit this generator was installed from, else the
  // template's
  const tooling = values.tooling ?? installedSpec();
  if (tooling !== undefined) {
    app.devDependencies = { ...app.devDependencies, [TOOLING]: tooling };
    rmSync(join(dir, "package-lock.json"), { force: true }); // locks the template's tooling, not this one
  } else if (existsSync(join(dir, "package-lock.json"))) {
    const lock = readJson(join(dir, "package-lock.json"));
    const root = (lock["packages"] as Record<string, Manifest> | undefined)?.[""];
    lock.name = name;
    if (root) root.name = name;
    writeJson(join(dir, "package-lock.json"), lock);
  }
  writeJson(join(dir, "package.json"), app);

  const holder = git(["config", "user.name"], existsSync(dir) ? dir : process.cwd());
  writePlan(dir, plan);
  writeAppFiles(dir, {
    tooling: commitOf(tooling) ?? commitOf(templateTooling) ?? "main",
    year: String(new Date().getFullYear()),
    holder: holder.ok && holder.out !== "" ? holder.out : "the creator of this app",
  });
  const ignore = join(dir, ".gitignore");
  writeFileSync(ignore, `${existsSync(ignore) ? readFileSync(ignore, "utf8") : ""}${IGNORED_SKILLS}`);
  const guide = addContentGuide(dir).filter((line) => line.startsWith("could not"));

  process.stdout.write(
    [
      `lernapps create: the ${archetype} app ${name} in ${dir} (app-templates ${pin.commit.slice(0, 7)})`,
      ...guide.map((line) => `Content guide: ${line}`),
      `Next: ${existsSync(join(dir, ".git")) ? "" : "git init, "}npm install, then follow .vibe/plan.md`,
      "",
    ].join("\n"),
  );
  return 0;
}
