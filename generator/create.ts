// The generator, `lernapps create --archetype <name> [<dir>]`: writes a new app into an empty folder. It copies the
// archetype's folder from lernapps/app-templates at the commit pinned in this package (package.json, appTemplates),
// and makes the app depend on the runtime of that same commit (the package @lernapps/app-templates at the root of
// that repo), so template and runtime always match. Then it writes what every app has: AGENTS.md, the plan file,
// the workflows, LICENSE, an issue form for content errors and the Renovate configuration (generator/app/).
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
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { UsageError } from "../src/usage.ts";

export const CREATE_USAGE = `Usage: lernapps create --archetype <name> [<dir>] [--plan <file>] [--templates <repo>] [--tooling <spec>]

Writes a new app from the archetype's template into <dir> (default: the current folder), which must be empty
except for .git and the plan file .vibe/plan.md. The template is the folder <name>/ of lernapps/app-templates at
the commit pinned in @lernapps/tooling; the app depends on the runtime @lernapps/app-templates of the same commit.
Fetching the template needs git and the network.

Then: npm install (installs the git hooks; run git init first if <dir> is not a repository yet).

Options:
  --archetype <name>  the archetype chosen in the plan: ${"{archetypes}"}
  --plan <file>       the plan file to carry over to .vibe/plan.md (default: the one in <dir>, else a new
                      one from the plan template)
  --templates <repo>  where to fetch app-templates from: a git URL or a local clone with the pinned commit
                      (default: the environment variable LERNAPPS_TEMPLATES, else GitHub)
  --tooling <spec>    the npm spec of @lernapps/tooling the app depends on (default: the template's)
  -h, --help          print this help
`;

/** The generator cannot write the app; the message says why and what to do. */
export class CreateError extends Error {}

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const fromPackage = (...path: string[]) => join(packageRoot, ...path);

interface Manifest {
  name?: string;
  devDependencies?: Record<string, string>;
  appTemplates?: { repository: string; commit: string; archetypes: string[] };
  [key: string]: unknown;
}

const readJson = (file: string): Manifest => JSON.parse(readFileSync(file, "utf8")) as Manifest;
const writeJson = (file: string, value: unknown) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

/** The archetypes this version of the package has templates for: the folders of app-templates at the pin. */
export function archetypes(): string[] {
  return [...(readJson(fromPackage("package.json")).appTemplates?.archetypes ?? [])].sort();
}

/** What is in the folder besides .git and the plan file. */
function contents(dir: string): string[] {
  if (!existsSync(dir)) return [];
  if (!statSync(dir).isDirectory()) throw new CreateError(`${dir} is a file, not a folder`);
  return readdirSync(dir).flatMap((name) => {
    if (name === ".git") return [];
    if (name === ".vibe") {
      const rest = readdirSync(join(dir, name)).filter((file) => file !== "plan.md");
      return rest.map((file) => `.vibe/${file}`);
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

const commitOf = (spec: string | undefined) => /#([0-9a-f]{40})$/.exec(spec ?? "")?.[1];

/** The runtime package at the root of app-templates. */
const RUNTIME = "@lernapps/app-templates";

/** The npm spec of the runtime at `commit` of `repository`: GitHub, another git URL, or a local clone. */
function runtimeSpec(repository: string, commit: string): string {
  const github = /^(?:https:\/\/|git@)github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(repository);
  if (github) return `github:${github[1]}/${github[2]}#${commit}`;
  if (existsSync(repository)) return `git+file://${resolve(repository)}#${commit}`;
  return `git+${repository}#${commit}`;
}

/** The plan: the one given, the one in the folder, or a new one from the template, for this archetype. */
function writePlan(dir: string, archetype: string, plan: string | undefined): void {
  const target = join(dir, ".vibe", "plan.md");
  if (plan !== undefined) {
    if (resolve(plan) === resolve(target)) return;
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(plan));
    return;
  }
  if (existsSync(target)) return;
  const template = readFileSync(fromPackage("guidance", "plan-template.md"), "utf8")
    .replace(/^archetype: null$/m, `archetype: ${archetype}`)
    .replace(/^phase: explore$/m, "phase: code");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, template);
}

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

export function create(args: string[]): number {
  const { values, positionals } = parseArgs({
    args,
    options: {
      archetype: { type: "string" },
      plan: { type: "string" },
      templates: { type: "string" },
      tooling: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
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
      `${dir} is not empty (${found.slice(0, 5).join(", ")}${found.length > 5 ? ", ..." : ""}): create the app in an empty folder; only .git and the plan file .vibe/plan.md may be there`,
    );
  }
  if (values.plan !== undefined && !existsSync(values.plan))
    throw new CreateError(`the plan ${values.plan} does not exist`);

  const manifest = readJson(fromPackage("package.json"));
  const pin = manifest.appTemplates;
  if (pin === undefined)
    throw new CreateError("this @lernapps/tooling pins no app-templates (appTemplates in package.json)");
  const repository = values.templates ?? process.env["LERNAPPS_TEMPLATES"] ?? pin.repository;
  const template = fetchTemplate(archetype, repository, pin.commit);
  try {
    mkdirSync(dir, { recursive: true });
    cpSync(template, dir, { recursive: true });
  } finally {
    rmSync(dirname(template), { recursive: true, force: true });
  }

  const app = readJson(join(dir, "package.json"));
  const templateTooling = app.devDependencies?.["@lernapps/tooling"];
  const name = packageName(dir);
  app.name = name;
  // the template uses the runtime of its own checkout (file:.., installed as a copy through .npmrc); the app the
  // runtime of the commit it was copied from
  if (app.devDependencies?.[RUNTIME] !== undefined) {
    app.devDependencies = { ...app.devDependencies, [RUNTIME]: runtimeSpec(repository, pin.commit) };
    rmSync(join(dir, ".npmrc"), { force: true });
  }
  if (values.tooling !== undefined) {
    app.devDependencies = { ...app.devDependencies, "@lernapps/tooling": values.tooling };
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
  writePlan(dir, archetype, values.plan);
  writeAppFiles(dir, {
    tooling: commitOf(values.tooling) ?? commitOf(templateTooling) ?? "main",
    year: String(new Date().getFullYear()),
    holder: holder.ok && holder.out !== "" ? holder.out : "the creator of this app",
  });

  process.stdout.write(
    [
      `lernapps create: the ${archetype} app ${name} in ${dir} (app-templates ${pin.commit.slice(0, 7)})`,
      `Next: ${existsSync(join(dir, ".git")) ? "" : "git init, "}npm install, then follow .vibe/plan.md`,
      "",
    ].join("\n"),
  );
  return 0;
}
