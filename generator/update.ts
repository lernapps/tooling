// `lernapps update`: moves an existing app to the versions of this @lernapps/tooling. Run from the latest tooling
// (`npx --yes @lernapps/tooling@latest update`), it sets the app's runtime @lernapps/app-templates to the version this
// tooling depends on (the runtime its tests ran with) and the tooling to its own version, and the app's workflows to
// the actions of that version's tag; then it runs npm install, installs the hooks again and says what moved. It takes
// the tooling's version, not the newest runtime: the generator's tests run the templates and the runtime of that
// version with this tooling, so the pair is known to work together. An app made when apps pinned git commits has
// them replaced with versions.
// It never moves the runtime back: a newer version (Renovate moves the runtime too) stays. An app made before the
// generator wrote the content guide gets its skeleton (generator/create.ts), and one made before the plans had a
// folder gets its plan .vibe/plan.md moved to .vibe/plans/01-first-version.md (src/plan.ts). An explainer in format 1 gets `format: 2` and `strand: none` in src/app.yaml where the runtime knows
// format 2. The app's lernapps-*
// skills, which the app commits, are replaced with those of this tooling (its skills/), in the layout of
// `npx skills add`; the app's own skills (app-content, any other) stay as they are. An interactive app's architecture
// is replaced outside its app sections, which stay as they are (generator/architecture.ts).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { installHooks } from "../archetypes/shared/install-hooks.ts";
import { currentPlan, LEGACY_PLAN, MIGRATED_PLAN, planFrontMatter, plans } from "../src/plan.ts";
import { ARCHITECTURE, architectureArchetype, ArchitectureError, writeArchitecture } from "./architecture.ts";
import { UsageError } from "../src/usage.ts";
import {
  addContentGuide,
  CreateError,
  fromPackage,
  IGNORED_SKILLS_LINES,
  ownVersion,
  readJson,
  RUNTIME,
  runtimeSpec,
  SKILLS_LOCK,
  templatesPackage,
  TOOLING,
  writeJson,
} from "./create.ts";

/** The options of `lernapps update`, as node:util parseArgs takes them. */
export const UPDATE_OPTIONS = {
  help: { type: "boolean", short: "h", default: false },
} as const satisfies ParseArgsOptionsConfig;

const LATEST = "npx --yes @lernapps/tooling@latest update";

export const UPDATE_USAGE = `Usage: lernapps update

Moves the app in the current folder to the versions of this @lernapps/tooling, then runs npm install. npm update
moves the app within its version ranges; this moves the ranges, and what npm does not know:
  @lernapps/app-templates  to the version this tooling depends on: the runtime its tests ran with. A newer version
                           (e.g. from Renovate) is kept. A git commit, as apps once pinned, becomes a version; while
                           this tooling depends on a commit (an unreleased runtime), the app moves to that commit
  @lernapps/tooling        to the version of this tooling (unchanged when run from the app)
  vite-plus                to the version the runtime was built with, which it names as its peer (a newer one
                           stays), and the override of vite to its core with it
  .github/workflows/       the actions and reusable workflows of lernapps/tooling at the tag of that version;
                           preview-cleanup.yml where the app has previews and no such file yet
  .agents/skills/app-content/SKILL.md
                           the content guide's skeleton, where the app has none yet (and its link for Claude Code)
  .vibe/plan.md            the plan of an app made before the plans had a folder: moved to
                           .vibe/plans/01-first-version.md, the first of its plans (one per piece of work)
  src/app.yaml             of an explainer in format 1, when the runtime knows format 2: adds format: 2 and
                           strand: none (the app is not on the learning map; its pages need no competencies)
  .agents/skills/lernapps-*, .claude/skills/lernapps-*, skills-lock.json
                           replaced with the skills of this tooling, as npx skills add lays them out: those of
                           every phase, and of the archetypes only those of the current plan's archetype; every
                           other lernapps-* skill is removed. The app's own skills (app-content, any other) stay. The lines of an earlier generator that had git ignore them are removed
                           from .gitignore: the app commits its skills
  docs/arc42/              of an interactive app: replaced with the generic part and the interactive extension of
                           app-templates at the version of the app's runtime, except the app sections (between
                           <!-- app: begin … --> and <!-- app: end … -->), which stay as they are

Run it from the latest tooling, in the app's folder, e.g. to pick up a fixed runtime:
  ${LATEST}
Run as the app's own tooling (npx --no -- lernapps update), it knows only the versions the app already has.
Then run npx --no -- lernapps check, and commit package.json, package-lock.json, .github/workflows/ and what else it names.

Exit codes: 0 when the app is updated (or was up to date), 1 when it cannot be or only partly (the message says
what was not moved and why), 2 on a usage error.

Options:
  -h, --help   print this help
`;

/** The app cannot be updated; the message says why and what to do. */
export class UpdateError extends Error {}

/** The version a dependency range names at its lowest: `^1.2.3`, `~1.2.3`, `1.2.3`; undefined for a git spec or a tag. */
function lowest(range: string): [number, number, number] | undefined {
  const match = /^[\^~>=\s]*(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(range);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined;
}

/** Whether `a` is older than `b`. */
const older = (a: [number, number, number], b: [number, number, number]) =>
  a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] < b[2];

/**
 * The next range of a dependency at `version` (target: ^ that version, or the spec given, e.g. a git commit of an
 * unreleased runtime), and what the output says about it.
 */
export function nextRange(
  name: string,
  current: string | undefined,
  version: string,
  target = `^${version}`,
): { spec: string; line: string } {
  // a local copy (a folder or a tarball of the package, as an app under development uses) is the creator's choice
  if (current !== undefined && /^(file:|link:|\.{0,2}\/)/.test(current)) {
    return { spec: current, line: `${name}: kept ${current}, a local copy` };
  }
  const now = current === undefined ? undefined : lowest(current);
  const next = lowest(version);
  if (current === target) return { spec: current, line: `${name}: unchanged (${current})` };
  // a newer version than this tooling's stays: it must never move back; a commit (no version to compare) is where the
  // tooling's tests ran, so the app moves to it
  if (lowest(target) !== undefined && now !== undefined && next !== undefined && !older(now, next)) {
    return { spec: current ?? target, line: `${name}: kept ${current}, not moved to ${target}: it is not older` };
  }
  return { spec: target, line: `${name}: ${current ?? "none"} → ${target}` };
}

/**
 * The workflows' `uses: lernapps/tooling/actions/<name>@<ref>`, `uses: lernapps/tooling/.github/workflows/<name>@<ref>`
 * and `tooling-ref: <ref>`, set to `ref` (a commit or a tag); the files it changed.
 */
function moveActions(ref: string): string[] {
  const changed: string[] = [];
  const pinned =
    /(lernapps\/tooling\/(?:actions\/[\w-]+|\.github\/workflows\/[\w-]+\.ya?ml)@|\btooling-ref:[ \t]*["']?)(?:[0-9a-f]{40}|v\d+\.\d+\.\d+)\b/g;
  for (const file of workflows()) {
    const text = readFileSync(file, "utf8");
    const next = text.replace(pinned, `$1${ref}`);
    if (next !== text) {
      writeFileSync(file, next);
      changed.push(file);
    }
  }
  return changed;
}

/**
 * The lock without the packages that move, and what depends on them only below them: npm resolves those afresh. With
 * them still locked, npm keeps the old runtime's peer set and cannot move the runtime and its toolchain at once
 * (ERESOLVE: an app at a runtime from a git commit next to vite-plus 1.0.0 could not move to app-templates 0.6.0 and
 * vite-plus 1.4.0, while the same package.json without a lock resolves). The other packages stay as locked.
 */
export function forgetLocked(lock: { packages?: Record<string, unknown> }, names: readonly string[]): void {
  if (lock.packages === undefined) return;
  for (const path of Object.keys(lock.packages)) {
    if (names.some((name) => path === `node_modules/${name}` || path.startsWith(`node_modules/${name}/`))) {
      delete lock.packages[path];
    }
  }
}

/** The toolchain of an app, which the runtime names as its peer: its version moves with the runtime. */
export const TOOLCHAIN = "vite-plus";
/** The override that makes vite the toolchain's core: it moves with the toolchain. */
const TOOLCHAIN_CORE = "npm:@voidzero-dev/vite-plus-core@";

/**
 * The toolchain of the app at the version the runtime was built and tested with (its devDependency vite-plus): a
 * runtime names exactly that version as its peer, so npm cannot install a new runtime next to an older toolchain
 * (ERESOLVE). An older toolchain moves to it, a newer one stays; the app's override of vite, which points at the
 * toolchain's core, moves with it. What changes, and the line of the output; undefined when the app or the runtime
 * names no toolchain.
 */
export function nextToolchain(
  app: { devDependencies?: Record<string, string>; [key: string]: unknown },
  runtime: { devDependencies?: Record<string, string> },
): { spec: string; line: string; overrides?: Record<string, unknown> } | undefined {
  const current = app.devDependencies?.[TOOLCHAIN];
  const target = runtime.devDependencies?.[TOOLCHAIN];
  if (current === undefined || target === undefined) return undefined;
  const next = nextRange(TOOLCHAIN, current, target, target);
  if (next.spec === current) return next;
  const appOverrides =
    typeof app["overrides"] === "object" && app["overrides"] !== null
      ? (app["overrides"] as Record<string, unknown>)
      : {};
  const vite = appOverrides["vite"];
  const overrides =
    typeof vite === "string" && vite.startsWith(TOOLCHAIN_CORE)
      ? { ...appOverrides, vite: `${TOOLCHAIN_CORE}${next.spec}` }
      : undefined;
  return overrides === undefined ? next : { ...next, overrides };
}

/** The workflow that removes the previews whose pull request is not open (issue lernapps/tooling#275). */
const PREVIEW_CLEANUP = join(".github", "workflows", "preview-cleanup.yml");

/**
 * Adds the preview cleanup to an app made before the generator wrote it, at `ref`; what it did, as lines of the
 * output. Only to an app whose workflows publish previews (the app preview action).
 */
function addPreviewCleanup(ref: string): string[] {
  if (existsSync(PREVIEW_CLEANUP)) return [];
  if (!workflows().some((file) => readFileSync(file, "utf8").includes("lernapps/tooling/actions/app-preview@")))
    return [];
  const text = readFileSync(fromPackage("generator", "app", PREVIEW_CLEANUP), "utf8").replaceAll("{{tooling}}", ref);
  writeFileSync(PREVIEW_CLEANUP, text);
  return [`added ${PREVIEW_CLEANUP}: removes the previews of closed pull requests, daily and by hand`];
}

/**
 * Moves the plan of an app made before the plans had a folder, .vibe/plan.md, to .vibe/plans/01-first-version.md,
 * where there is no plan 01 yet; what it did, as lines of the output. A move only: git sees the rename when the
 * change is committed.
 */
function migratePlan(): string[] {
  if (!existsSync(LEGACY_PLAN)) return [];
  if (plans().some((plan) => /\/01-[^/]+$/.test(plan))) {
    return [
      `plan: kept ${LEGACY_PLAN}: .vibe/plans/ already has a plan 01. Compare the two and keep one as the plan 01`,
    ];
  }
  mkdirSync(dirname(MIGRATED_PLAN), { recursive: true });
  renameSync(LEGACY_PLAN, MIGRATED_PLAN);
  return [
    `plan: moved ${LEGACY_PLAN} to ${MIGRATED_PLAN}, unchanged: each piece of work has its own plan in .vibe/plans/`,
  ];
}

/** The explainer's app file, and the schema file that tells the runtime knows format 2 (learning map). */
const EXPLAINER_APP = join("src", "app.yaml");
const EXPLAINER_V2_SCHEMA = join("runtime", "explainer", "explainer.v2.schema.json");

/**
 * Moves an explainer from format 1 to format 2 (the learning map): adds `format: 2` and `strand: none` to
 * src/app.yaml when the app has neither, and points its schema comment to explainer.v2.schema.json. `strand: none`
 * keeps the app off the map, so its pages need no competencies; the creator may name a strand later (skill
 * lernapps-content-research). Only where the runtime of this tooling has the v2 schema: an older runtime does not
 * know the fields. An app that is no explainer, or already has a `format` or a `strand`, stays as it is. What it did,
 * as lines of the output.
 */
export function migrateExplainer(templatesRoot: string): string[] {
  if (!existsSync(EXPLAINER_APP) || !existsSync(join(templatesRoot, EXPLAINER_V2_SCHEMA))) return [];
  const text = readFileSync(EXPLAINER_APP, "utf8");
  const top = (key: string) => new RegExp(`^${key}:`, "m").test(text);
  if (!top("chapters") || top("format") || top("strand")) return [];
  const schema = /^(# yaml-language-server: \$schema=.*)explainer\.v1\.schema\.json$/m;
  const fields = "format: 2\nstrand: none\n";
  let next: string;
  if (schema.test(text))
    next = text.replace(schema, (_all, head: string) => `${head}explainer.v2.schema.json\n${fields.trimEnd()}`);
  else next = fields + text;
  writeFileSync(EXPLAINER_APP, next);
  return [
    `explainer: ${EXPLAINER_APP} moved to format 2: added format: 2 and strand: none (not on the learning map; pages need no competencies). To join the map, pick a strand of https://lernapps.net/apps/map/ and give every page competencies`,
  ];
}

/**
 * The skills of this tooling, as it ships them (skills/<group>/<name>/), and as the app keeps them (flat, by name).
 * Every app has those of the groups process, tooling and content; of the group archetypes only those of its own
 * archetype (lernapps-<archetype> and lernapps-<archetype>-<part>, e.g. lernapps-explainer-design), which the plan
 * installs in the phase that needs it.
 */
const SKILL_PREFIX = "lernapps-";
const TOOLING_SOURCE = "lernapps/tooling";
const ARCHETYPE_GROUP = "archetypes";
const SKILLS = join(".agents", "skills");
const SKILL_LINKS = join(".claude", "skills");

/** The hash `npx skills` keeps in skills-lock.json (computedHash): every file of the folder, path and content. */
function skillHash(dir: string): string {
  const files: string[] = [];
  const walk = (folder: string) => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== ".git" && entry.name !== "node_modules") walk(join(folder, entry.name));
      else if (entry.isFile()) files.push(relative(dir, join(folder, entry.name)).split("\\").join("/"));
    }
  };
  walk(dir);
  const hash = createHash("sha256");
  for (const file of files.sort((a, b) => a.localeCompare(b))) {
    hash.update(file);
    hash.update(readFileSync(join(dir, file)));
  }
  return hash.digest("hex");
}

interface SkillsLock {
  version?: number;
  skills?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

/** The lernapps-* skills below `source`: each folder with a SKILL.md, its group and its path relative to `source`. */
function shippedSkills(source: string): { name: string; group: string; path: string }[] {
  const found: { name: string; group: string; path: string }[] = [];
  for (const group of readdirSync(source, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    for (const skill of readdirSync(join(source, group.name), { withFileTypes: true })) {
      if (
        skill.isDirectory() &&
        skill.name.startsWith(SKILL_PREFIX) &&
        existsSync(join(source, group.name, skill.name, "SKILL.md"))
      ) {
        found.push({ name: skill.name, group: group.name, path: `${group.name}/${skill.name}` });
      }
    }
  }
  return found;
}

/**
 * Replaces the app's lernapps-* skills with those of this tooling, as `npx skills add lernapps/tooling` lays them out:
 * the folder in .agents/skills/, a relative link to it in .claude/skills/ (a copy where the system allows no link), and
 * its entry in skills-lock.json with the hash of the new files. Of the archetypes' skills only those of the archetype
 * the current plan names; without one, those the app has. Removes every other lernapps-* skill, unless its entry in
 * skills-lock.json names another source than this tooling (lernapps-practice-* come from lernapps/practice).
 * Never touches another skill. What it did, as lines of the output.
 */
export function replaceSkills(dir = ".", source = fromPackage("skills")): string[] {
  const skillsDir = join(dir, SKILLS);
  const linksDir = join(dir, SKILL_LINKS);
  const lockFile = join(dir, SKILLS_LOCK);
  let lock: SkillsLock = { version: 1, skills: {} };
  try {
    lock = JSON.parse(readFileSync(lockFile, "utf8")) as SkillsLock;
  } catch {
    // none yet, or unreadable: written anew
  }
  // a skill whose lock entry names another source (e.g. lernapps-practice-* of lernapps/practice) is not ours: it stays
  const foreign = (name: string) => {
    const source = lock.skills?.[name]?.["source"];
    return source !== undefined && source !== TOOLING_SOURCE;
  };
  const present = existsSync(skillsDir)
    ? readdirSync(skillsDir).filter((name) => name.startsWith(SKILL_PREFIX) && !foreign(name))
    : [];
  const plan = currentPlan(dir);
  const archetype = plan === undefined ? undefined : planFrontMatter(join(dir, plan))["archetype"];
  const own = (name: string) =>
    typeof archetype === "string"
      ? name === `${SKILL_PREFIX}${archetype}` || name.startsWith(`${SKILL_PREFIX}${archetype}-`)
      : present.includes(name);
  const shipped = shippedSkills(source).filter(({ name, group }) => group !== ARCHETYPE_GROUP || own(name));
  const folder = new Map(shipped.map(({ name, path }) => [name, path]));
  const ours = [...folder.keys()].sort();
  const entries: Record<string, Record<string, unknown>> = { ...lock.skills };
  const added: string[] = [];
  const changed: string[] = [];
  const removed = present.filter((name) => !ours.includes(name));
  for (const name of removed) {
    rmSync(join(skillsDir, name), { recursive: true, force: true });
    rmSync(join(linksDir, name), { recursive: true, force: true });
    delete entries[name];
  }
  for (const name of ours) {
    const target = join(skillsDir, name);
    const before = existsSync(target) ? skillHash(target) : undefined;
    rmSync(target, { recursive: true, force: true });
    mkdirSync(skillsDir, { recursive: true });
    cpSync(join(source, folder.get(name) ?? name), target, { recursive: true });
    const hash = skillHash(target);
    if (before === undefined) added.push(name);
    else if (before !== hash) changed.push(name);
    const link = join(linksDir, name);
    const to = `../../.agents/skills/${name}`;
    let linked = false;
    try {
      linked = lstatSync(link).isSymbolicLink() && readlinkSync(link) === to;
    } catch {
      // no link yet
    }
    if (!linked) {
      rmSync(link, { recursive: true, force: true });
      mkdirSync(linksDir, { recursive: true });
      try {
        symlinkSync(to, link, "dir");
      } catch {
        cpSync(target, link, { recursive: true }); // no symbolic links on this system: a copy, as npx skills makes
      }
    }
    entries[name] = {
      source: TOOLING_SOURCE,
      sourceType: "github",
      ...entries[name],
      skillPath: `skills/${folder.get(name) ?? name}/SKILL.md`,
      computedHash: hash,
    };
  }
  const sorted = Object.fromEntries(
    Object.keys(entries)
      .sort()
      .map((name) => [name, entries[name]]),
  );
  const next = `${JSON.stringify({ ...lock, version: lock.version ?? 1, skills: sorted }, null, 2)}\n`;
  const lockChanged = !existsSync(lockFile) || readFileSync(lockFile, "utf8") !== next;
  if (lockChanged) writeFileSync(lockFile, next);
  const lines: string[] = [];
  const list = (names: string[]) => names.join(", ");
  if (added.length + changed.length + removed.length === 0) {
    lines.push(
      lockChanged
        ? `skills: the ${SKILL_PREFIX}* skills are those of this tooling; their entries in ${SKILLS_LOCK} updated`
        : `skills: the ${SKILL_PREFIX}* skills are those of this tooling already (${ours.length})`,
    );
  } else {
    const parts = [
      ...(changed.length > 0 ? [`replaced ${list(changed)}`] : []),
      ...(added.length > 0 ? [`added ${list(added)}`] : []),
      ...(removed.length > 0 ? [`removed ${list(removed)}: not of this tooling, or of another archetype`] : []),
    ];
    lines.push(
      `skills: ${parts.join("; ")}: the ${SKILL_PREFIX}* skills of this tooling, in ${SKILLS}/ and ${SKILL_LINKS}/`,
    );
  }
  return lines;
}

/**
 * Removes the lines an earlier generator appended to .gitignore so that git ignored the installed skills: the app
 * commits them now. What it did, as lines of the output.
 */
export function unignoreSkills(dir = "."): string[] {
  const ignore = join(dir, ".gitignore");
  if (!existsSync(ignore)) return [];
  const lines = readFileSync(ignore, "utf8").split("\n");
  const kept = lines.filter((line) => !IGNORED_SKILLS_LINES.includes(line));
  if (kept.length === lines.length) return [];
  writeFileSync(ignore, `${kept.join("\n").replace(/\n+$/, "")}\n`);
  return ["skills: removed the lines from .gitignore that had git ignore them: the app commits its skills"];
}

/**
 * Replaces the reference files of an interactive app's architecture with the generic part and the extension of
 * the installed app-templates; the app's own files stay. What it did, as lines of the output, and whether it failed.
 */
function updateArchitecture(): { lines: string[]; failed: boolean } {
  const archetype = architectureArchetype();
  if (archetype === undefined) return { lines: [], failed: false };
  try {
    const templates = templatesPackage();
    return { lines: writeArchitecture(".", templates.root, archetype, templates.version), failed: false };
  } catch (error) {
    if (!(error instanceof ArchitectureError) && !(error instanceof CreateError)) throw error;
    return { lines: [`architecture: not replaced: ${error.message}`], failed: true };
  }
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
  const templates = templatesPackage();

  const lines: string[] = [];
  const specs: string[] = [];
  const notMoved: string[] = [];
  const runtime = devDependencies[RUNTIME];
  if (runtime !== undefined) {
    const next = nextRange(RUNTIME, runtime, templates.version, runtimeSpec(templates.version));
    if (next.spec !== runtime) specs.push(`${RUNTIME}@${next.spec}`);
    lines.push(next.line);
  }
  // the toolchain the runtime names as its peer, and the override of vite that goes with it: the override is written
  // before npm install, which reads it
  const toolchain = nextToolchain(app, readJson(join(templates.root, "package.json")));
  if (toolchain !== undefined) {
    if (toolchain.spec !== devDependencies[TOOLCHAIN]) specs.push(`${TOOLCHAIN}@${toolchain.spec}`);
    if (toolchain.overrides !== undefined) {
      writeJson("package.json", { ...readJson("package.json"), overrides: toolchain.overrides });
    }
    lines.push(toolchain.line);
  }
  const version = ownVersion();
  const nextTooling = nextRange(TOOLING, current, version);
  if (nextTooling.spec !== current) specs.push(`${TOOLING}@${nextTooling.spec}`);
  lines.push(nextTooling.line);
  // the app's own tooling knows the version the app already has: nothing newer
  if (nextTooling.spec === current && resolve(fromPackage()) === resolve("node_modules", TOOLING)) {
    lines.push(`this is the app's own tooling, which knows only its own version; for the latest run: ${LATEST}`);
  }

  if (specs.length > 0) {
    // the new specs go into package.json as they are (an exact toolchain stays exact), and the lock forgets the
    // packages that move, so that npm resolves them together
    const moved = specs.map((spec) => [spec.slice(0, spec.indexOf("@", 1)), spec.slice(spec.indexOf("@", 1) + 1)]);
    const manifest = readJson("package.json");
    writeJson("package.json", {
      ...manifest,
      devDependencies: { ...manifest.devDependencies, ...Object.fromEntries(moved) },
    });
    if (existsSync("package-lock.json")) {
      const lock = JSON.parse(readFileSync("package-lock.json", "utf8")) as { packages?: Record<string, unknown> };
      forgetLocked(
        lock,
        moved.map(([name]) => name ?? ""),
      );
      writeJson("package-lock.json", lock);
    }
    const install = spawnSync("npm", ["install", "--no-audit", "--no-fund"], {
      stdio: ["ignore", 2, 2],
    });
    if (install.error || install.status !== 0) {
      throw new UpdateError(
        `npm install ${specs.join(" ")} failed${install.error ? `: ${install.error.message}` : ` (exit ${install.status})`}; its output is above. Fix the cause, then run lernapps update again`,
      );
    }
    // npm install <spec> runs no prepare script: the hooks of the new tooling, as npm install would install them
    if (installHooks([]) !== 0)
      throw new UpdateError("lernapps hooks failed (see above); run npx --no -- lernapps hooks again");
  }
  const changed = moveActions(`v${version}`);
  if (changed.length > 0) lines.push(`the actions of lernapps/tooling in ${changed.join(", ")}: v${version}`);
  lines.push(...addPreviewCleanup(`v${version}`));
  // an app made before the generator wrote the content guide gets its skeleton
  const guide = addContentGuide(".");
  lines.push(...guide.map((line) => `content guide: ${line}`));
  const plan = migratePlan();
  lines.push(...plan);
  const explainer = migrateExplainer(templates.root);
  lines.push(...explainer);
  const skills = [...replaceSkills(), ...unignoreSkills()];
  lines.push(...skills);
  const architecture = updateArchitecture();
  lines.push(...architecture.lines);
  if (architecture.failed) notMoved.push("the architecture");
  process.stdout.write(`${lines.map((line) => `lernapps update: ${line}`).join("\n")}\n`);
  if (notMoved.length > 0) {
    throw new UpdateError(
      `partly updated: ${notMoved.join(" and ")} not moved (see above). Run it from the latest tooling, installed by npx: ${LATEST}`,
    );
  }
  const files = ["package.json", "package-lock.json", ".github/workflows/"];
  const skillsMoved = skills.some((line) => !line.includes("those of this tooling already"));
  if (guide.length > 0 || skillsMoved) files.push(".agents/", ".claude/");
  if (skillsMoved) files.push(SKILLS_LOCK);
  if (skills.some((line) => line.includes(".gitignore"))) files.push(".gitignore");
  if (architecture.lines.length > 0) files.push(`${ARCHITECTURE}/`);
  if (explainer.length > 0) files.push(EXPLAINER_APP);
  if (plan.some((line) => line.startsWith("plan: moved"))) files.push(".vibe/ (git add -A .vibe, to keep the move)");
  process.stdout.write(
    `Next: npx --no -- lernapps check, then commit ${files.slice(0, -1).join(", ")} and ${files.at(-1) ?? ""}\n`,
  );
  return 0;
}
