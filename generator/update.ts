// `lernapps update`: moves an existing app to the pins of this @lernapps/tooling. Apps pin the runtime
// @lernapps/app-templates and the tooling to exact git commits, so `npm update` changes nothing. Run from the latest
// tooling (`npx --yes github:lernapps/tooling#main update`), it sets the app's runtime to the commit this tooling pins
// (package.json, appTemplates.commit), the tooling to the commit npx installed it from, and the app's workflows to
// that commit's actions; then it runs npm install, installs the hooks again and says what moved. It takes the
// tooling's pin, not the newest commit of app-templates: the generator's tests run the templates and the runtime of
// that commit with this tooling, so the pair is known to work together, and a fix of the runtime reaches the tooling's
// main with its pin.
// It never moves the runtime back: a commit newer than the pin (Renovate moves the runtime too) stays, and so does one
// whose order it cannot tell (git fetches only the two commits, without their files). An app made before the generator
// wrote the content guide gets its skeleton (generator/create.ts), and one made before the plans had a folder gets its
// plan .vibe/plan.md moved to .vibe/plans/01-first-version.md (src/plan.ts). The app's lernapps-* skills, which the
// app commits, are replaced with those of this tooling (its skills/), in the layout of `npx skills add`; the app's
// own skills (app-content, any other) stay as they are. An interactive app's architecture is replaced outside its app
// sections, which stay as they are (generator/architecture.ts). Run from a clone of the tooling,
// it has no commit to move the tooling and the actions to: it says so and exits 1. Run as the app's own tooling
// (npx lernapps update), it knows only that tooling's pins, which the app already has: it says how to run the latest.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { installHooks } from "../archetypes/shared/install-hooks.ts";
import { currentPlan, LEGACY_PLAN, MIGRATED_PLAN, planFrontMatter, plans } from "../src/plan.ts";
import { ARCHITECTURE, architectureArchetype, ArchitectureError, writeArchitecture } from "./architecture.ts";
import { UsageError } from "../src/usage.ts";
import {
  addContentGuide,
  commitOf,
  CreateError,
  fetchTemplates,
  fromPackage,
  IGNORED_SKILLS_LINES,
  installedSpec,
  pinnedTemplates,
  readJson,
  RUNTIME,
  runtimeSpec,
  SKILLS_LOCK,
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
  .agents/skills/app-content/SKILL.md
                           the content guide's skeleton, where the app has none yet (and its link for Claude Code)
  .vibe/plan.md            the plan of an app made before the plans had a folder: moved to
                           .vibe/plans/01-first-version.md, the first of its plans (one per piece of work)
  .agents/skills/lernapps-*, .claude/skills/lernapps-*, skills-lock.json
                           replaced with the skills of this tooling, as npx skills add lays them out: those of
                           every phase, and of the archetypes only those of the current plan's archetype; every
                           other lernapps-* skill is removed. The app's own skills (app-content, any other) stay. The lines of an earlier generator that had git ignore them are removed
                           from .gitignore: the app commits its skills
  docs/arc42/              of an interactive app: replaced with the generic part and the interactive extension of
                           app-templates at the commit of the app's runtime, except the app sections (between
                           <!-- app: begin … --> and <!-- app: end … -->), which stay as they are

Run it from the latest tooling, in the app's folder, e.g. to pick up a fixed runtime:
  ${LATEST}
Run as the app's own tooling (npx lernapps update), it knows only the pins the app already has.
Then run npx lernapps check, and commit package.json, package-lock.json, .github/workflows/ and what else it names.

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

/**
 * The skills of this tooling, as it ships them (skills/<group>/<name>/), and as the app keeps them (flat, by name).
 * Every app has those of the groups process, tooling and content; of the group archetypes only those of its own
 * archetype (lernapps-<archetype> and lernapps-<archetype>-<part>, e.g. lernapps-explainer-design), which the plan
 * installs in the phase that needs it.
 */
const SKILL_PREFIX = "lernapps-";
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
 * the current plan names; without one, those the app has. Removes every other lernapps-* skill.
 * Never touches another skill. What it did, as lines of the output.
 */
export function replaceSkills(dir = ".", source = fromPackage("skills")): string[] {
  const skillsDir = join(dir, SKILLS);
  const linksDir = join(dir, SKILL_LINKS);
  const lockFile = join(dir, SKILLS_LOCK);
  const present = existsSync(skillsDir) ? readdirSync(skillsDir).filter((name) => name.startsWith(SKILL_PREFIX)) : [];
  const plan = currentPlan(dir);
  const archetype = plan === undefined ? undefined : planFrontMatter(join(dir, plan))["archetype"];
  const own = (name: string) =>
    typeof archetype === "string"
      ? name === `${SKILL_PREFIX}${archetype}` || name.startsWith(`${SKILL_PREFIX}${archetype}-`)
      : present.includes(name);
  const shipped = shippedSkills(source).filter(({ name, group }) => group !== ARCHETYPE_GROUP || own(name));
  const folder = new Map(shipped.map(({ name, path }) => [name, path]));
  const ours = [...folder.keys()].sort();
  let lock: SkillsLock = { version: 1, skills: {} };
  try {
    lock = JSON.parse(readFileSync(lockFile, "utf8")) as SkillsLock;
  } catch {
    // none yet, or unreadable: written anew
  }
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
      source: "lernapps/tooling",
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
 * app-templates at the commit of the runtime `spec` (the one the app is on after this update, so that the architecture
 * describes the runtime it has); the app's own files stay. What it did, as lines of the output, and whether it failed.
 */
function updateArchitecture(spec: string | undefined): { lines: string[]; failed: boolean } {
  const archetype = architectureArchetype();
  if (archetype === undefined) return { lines: [], failed: false };
  const commit = commitOf(spec);
  const url = spec === undefined ? undefined : gitUrl(spec);
  if (commit === undefined || url === undefined) {
    return {
      lines: [`architecture: not replaced: the runtime ${spec ?? "(none)"} names no git commit to take it from`],
      failed: true,
    };
  }
  let templates: string;
  try {
    templates = fetchTemplates(url, commit, [ARCHITECTURE, `${archetype}/${ARCHITECTURE}`]);
  } catch (error) {
    if (!(error instanceof CreateError)) throw error;
    return { lines: [`architecture: not replaced: ${error.message}`], failed: true };
  }
  try {
    return { lines: writeArchitecture(".", templates, archetype, commit), failed: false };
  } catch (error) {
    if (!(error instanceof ArchitectureError)) throw error;
    return { lines: [`architecture: not replaced: ${error.message}`], failed: true };
  } finally {
    rmSync(templates, { recursive: true, force: true });
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
    // the app's own tooling knows the pins the app already has: nothing newer
    if (tooling === current && resolve(fromPackage()) === resolve("node_modules", TOOLING)) {
      lines.push(`this is the app's own tooling, which knows only its own pins; for the latest run: ${LATEST}`);
    }
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
    // npm install <spec> runs no prepare script: the hooks of the new tooling, as npm install would install them
    if (installHooks([]) !== 0)
      throw new UpdateError("lernapps hooks failed (see above); run npx lernapps hooks again");
  }
  if (commit !== undefined) {
    const changed = moveActions(commit);
    if (changed.length > 0)
      lines.push(`the actions of lernapps/tooling in ${changed.join(", ")}: ${commit.slice(0, 7)}`);
  }
  // an app made before the generator wrote the content guide gets its skeleton
  const guide = addContentGuide(".");
  lines.push(...guide.map((line) => `content guide: ${line}`));
  const plan = migratePlan();
  lines.push(...plan);
  const skills = [...replaceSkills(), ...unignoreSkills()];
  lines.push(...skills);
  const runtimeSpec = specs.find((spec) => spec.startsWith(`${RUNTIME}@`))?.slice(RUNTIME.length + 1) ?? runtime;
  const architecture = updateArchitecture(runtimeSpec);
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
  if (plan.some((line) => line.startsWith("plan: moved"))) files.push(".vibe/ (git add -A .vibe, to keep the move)");
  process.stdout.write(
    `Next: npx lernapps check, then commit ${files.slice(0, -1).join(", ")} and ${files.at(-1) ?? ""}\n`,
  );
  return 0;
}
