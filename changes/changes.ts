// The change scope: what a change can affect, and so what the hooks and CI run for it. `lernapps changes` and the
// hooks (lernapps check --pre-commit, --pre-push; this repo's scripts/pre-push.ts) and the actions (app-check,
// app-publish, app-preview) and the reusable workflow changes.yml ask the same function. Its usage text, with the map and the
// configuration, is CHANGES_USAGE in src/usage.ts.
//
//   none  every changed file is the plan (.vibe/**): nothing runs
//   docs  every changed file is docs (docs/**/*.md) or the plan: only the site's checks and deployment run; an app
//         has no site, so nothing runs
//   all   anything else, and whenever the changed files are not known: everything runs
//
// `none` and `docs` are allowlists: a path on neither is `all`, so a new folder never causes a skip.
// Only Node's own modules: the actions run it from their own checkout without installing anything (changes/main.ts).
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { CHANGES_OPTIONS, CHANGES_USAGE, UsageError } from "../src/usage.ts";

export type Scope = "none" | "docs" | "all";
export type Kind = "app" | "tooling" | "site";
export const KINDS: readonly Kind[] = ["app", "tooling", "site"];

/** The patterns of a repo's change scope: the allowlists of `none` and `docs`, and what is `all` regardless. */
export interface Rules {
  kind: Kind;
  none: readonly string[];
  docs: readonly string[];
  /** Exceptions: a path that matches one of these is `all`, also when it matches `none` or `docs`. */
  all: readonly string[];
}

/**
 * The default map per kind of repo. The allowlists are the same for every kind; the kind decides what `docs` runs:
 * nothing in an app (docs are not part of its bundle), the site's checks and deployment in the tooling and in a site
 * or catalog repo.
 */
export const DEFAULTS: Record<Kind, Rules> = {
  app: { kind: "app", none: [".vibe/**"], docs: ["docs/**/*.md"], all: [] },
  tooling: { kind: "tooling", none: [".vibe/**"], docs: ["docs/**/*.md"], all: [] },
  site: { kind: "site", none: [".vibe/**"], docs: ["docs/**/*.md"], all: [] },
};

/** The npm script that checks the built site of a kind of repo, after `npm run build`; an app has no site. */
export const SITE_CHECK: Record<Kind, string | undefined> = { app: undefined, tooling: "check:site", site: "check" };

/** The repo's configuration in package.json is wrong; the message says what to fix. */
export class ChangesConfigError extends Error {}

/**
 * A glob as a regular expression: `**` any number of folders, `*` any characters but "/", `?` one of them. A pattern
 * that ends with "/" is a folder and matches everything below it.
 */
function globToRegExp(pattern: string): RegExp {
  const glob = pattern.endsWith("/") ? `${pattern}**` : pattern;
  let source = "";
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i] ?? "";
    if (char === "*" && glob[i + 1] === "*") {
      i++;
      if (glob[i + 1] === "/") {
        i++;
        source += "(?:.*/)?"; // **/ : no folder or any folders
      } else {
        source += ".*";
      }
    } else if (char === "*") {
      source += "[^/]*";
    } else if (char === "?") {
      source += "[^/]";
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`);
}

const compiled = new Map<string, RegExp>();
/** Whether a path (relative to the repo root, with "/") matches one of the patterns. */
export function matchesAny(path: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => {
    let regexp = compiled.get(pattern);
    if (regexp === undefined) {
      regexp = globToRegExp(pattern);
      compiled.set(pattern, regexp);
    }
    return regexp.test(path);
  });
}

/** The scope of a change, and why. */
export interface Classification {
  scope: Scope;
  /** One line: why this scope. */
  reason: string;
}

/**
 * The scope of the changed files. Undefined (not known) or empty is `all`: a change whose files are not known could
 * affect anything.
 */
export function classify(files: readonly string[] | undefined, rules: Rules): Classification {
  if (files === undefined) return { scope: "all", reason: "the changed files are not known" };
  if (files.length === 0) return { scope: "all", reason: "no changed files are known" };
  let docs = 0;
  for (const file of files) {
    if (matchesAny(file, rules.all)) {
      return { scope: "all", reason: `${file} is an exception of this repo (lernapps.changes.all)` };
    }
    if (matchesAny(file, rules.none)) continue;
    if (!matchesAny(file, rules.docs)) return { scope: "all", reason: `${file} is neither plan nor docs` };
    docs++;
  }
  const count = (n: number) => `${n} changed file${n === 1 ? "" : "s"}`;
  return docs === 0
    ? { scope: "none", reason: `${count(files.length)}, only the plan (${rules.none.join(", ")})` }
    : { scope: "docs", reason: `${count(files.length)}, only docs (${rules.docs.join(", ")}) and the plan` };
}

/** What runs for a scope in a kind of repo: the code (build, tests), the site's checks and deployment. */
export function runs(scope: Scope, kind: Kind): { code: boolean; site: boolean } {
  return { code: scope === "all", site: scope === "all" || (scope === "docs" && SITE_CHECK[kind] !== undefined) };
}

const CONFIG_KEYS = ["kind", "none", "docs", "all"] as const;

function patterns(value: unknown, key: string): string[] {
  const where = `package.json lernapps.changes.${key}`;
  if (!Array.isArray(value))
    throw new ChangesConfigError(`${where}: a list of path patterns, not ${JSON.stringify(value)}`);
  return value.map((item: unknown) => {
    if (typeof item !== "string" || item === "") {
      throw new ChangesConfigError(`${where}: every pattern is a non-empty string, not ${JSON.stringify(item)}`);
    }
    if (item.startsWith("/") || item.startsWith("!") || item.split("/").includes("..") || item.includes("\\")) {
      throw new ChangesConfigError(
        `${where}: "${item}" must be relative to the repo root, with "/", without "..", and not negated with "!"`,
      );
    }
    return item;
  });
}

/** The kind of the repo in `dir` when its package.json names none: the tooling, an app (index.html), else a site. */
function detectKind(dir: string, manifest: Record<string, unknown>): Kind {
  if (manifest["name"] === "@lernapps/tooling") return "tooling";
  if (existsSync(join(dir, "index.html"))) return "app";
  return "site";
}

/**
 * The rules of the repo in `dir`: the default map of its kind, with the exceptions its package.json declares in
 * `lernapps.changes` ({ kind?, none?, docs?, all? }: `none` and `docs` add patterns to the allowlists, `all` makes
 * paths `all` regardless). Throws ChangesConfigError when that configuration is malformed.
 */
export function loadRules(dir: string): Rules {
  const file = join(dir, "package.json");
  let manifest: Record<string, unknown> = {};
  if (existsSync(file)) {
    try {
      const value: unknown = JSON.parse(readFileSync(file, "utf8"));
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        manifest = value as Record<string, unknown>;
      }
    } catch (error) {
      throw new ChangesConfigError(`package.json: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const lernapps = manifest["lernapps"];
  let config: Record<string, unknown> = {};
  if (lernapps !== undefined) {
    if (typeof lernapps !== "object" || lernapps === null || Array.isArray(lernapps)) {
      throw new ChangesConfigError("package.json lernapps: an object");
    }
    const changes = (lernapps as Record<string, unknown>)["changes"];
    if (changes !== undefined) {
      if (typeof changes !== "object" || changes === null || Array.isArray(changes)) {
        throw new ChangesConfigError("package.json lernapps.changes: an object with kind, none, docs, all");
      }
      config = changes as Record<string, unknown>;
    }
  }
  const unknown = Object.keys(config).filter((key) => !(CONFIG_KEYS as readonly string[]).includes(key));
  if (unknown.length > 0) {
    throw new ChangesConfigError(
      `package.json lernapps.changes: unknown ${unknown.length === 1 ? "key" : "keys"} ${unknown.join(", ")} (known: ${CONFIG_KEYS.join(", ")})`,
    );
  }
  let kind = detectKind(dir, manifest);
  if (config["kind"] !== undefined) {
    if (!(KINDS as readonly unknown[]).includes(config["kind"])) {
      throw new ChangesConfigError(
        `package.json lernapps.changes.kind: one of ${KINDS.join(", ")}, not ${JSON.stringify(config["kind"])}`,
      );
    }
    kind = config["kind"] as Kind;
  }
  const defaults = DEFAULTS[kind];
  const extra = (key: "none" | "docs" | "all") => (config[key] === undefined ? [] : patterns(config[key], key));
  return {
    kind,
    none: [...defaults.none, ...extra("none")],
    docs: [...defaults.docs, ...extra("docs")],
    all: [...defaults.all, ...extra("all")],
  };
}

const ZERO = /^0+$/;

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** The paths of `git diff --name-only -z`; renames as a deletion and an addition, so both paths count. */
function diffNames(cwd: string, ...args: string[]): string[] | undefined {
  const diff = git(cwd, "diff", "--name-only", "--no-renames", "-z", ...args);
  if (diff.error || diff.status !== 0) return undefined;
  return diff.stdout.split("\0").filter((path) => path !== "");
}

const isCommit = (cwd: string, rev: string) => git(cwd, "cat-file", "-e", `${rev}^{commit}`).status === 0;

/** The staged files of the next commit (the pre-commit hook); undefined outside a repository. */
export function stagedFiles(cwd = "."): string[] | undefined {
  return diffNames(cwd, "--cached");
}

/**
 * The files a push changes (the pre-push hook), from git's lines "<local ref> <local sha> <remote ref> <remote sha>":
 * what each pushed ref adds to the remote's commit; for a new branch, what it adds to its merge base with
 * origin/main. Undefined when that cannot be known: no lines (run by hand), an unknown commit, no origin/main.
 */
export function pushedFiles(lines: string, cwd = "."): string[] | undefined {
  const refs = lines
    .split("\n")
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields.length === 4);
  if (refs.length === 0) return undefined;
  const paths = new Set<string>();
  for (const [, local = "", , remote = ""] of refs) {
    if (ZERO.test(local)) continue; // a deleted branch
    const base = ZERO.test(remote) ? git(cwd, "merge-base", local, "origin/main").stdout.trim() : remote;
    if (base === "" || !isCommit(cwd, base)) return undefined;
    const names = diffNames(cwd, base, local);
    if (names === undefined) return undefined;
    for (const path of names) paths.add(path);
  }
  return [...paths];
}

/** Fetches the whole history once, when the clone is shallow (as actions/checkout makes it by default). */
function unshallow(cwd: string): boolean {
  if (git(cwd, "rev-parse", "--is-shallow-repository").stdout.trim() !== "true") return false;
  return git(cwd, "fetch", "--quiet", "--no-tags", "--unshallow", "origin").status === 0;
}

/**
 * The files between two commits: with `mergeBase`, what `head` adds to its merge base with `base` (a pull request);
 * else the difference from `base` to `head` (a push: before..after). A shallow clone is deepened once when a commit
 * or the merge base is missing. Undefined when the commits cannot be found.
 */
export function rangeFiles(base: string, head: string, mergeBase: boolean, cwd = "."): string[] | undefined {
  const attempt = (): string[] | undefined => {
    if (!isCommit(cwd, base) || !isCommit(cwd, head)) return undefined;
    const from = mergeBase ? git(cwd, "merge-base", base, head).stdout.trim() : base;
    return from === "" ? undefined : diffNames(cwd, from, head);
  };
  return attempt() ?? (unshallow(cwd) ? attempt() : undefined);
}

/**
 * The files of the GitHub Actions event (GITHUB_EVENT_NAME, GITHUB_EVENT_PATH): a pull request, what it adds to the
 * merge base with its base; a push, before..after. A new branch (before is zeros), workflow_dispatch and every other
 * event: undefined, so everything runs.
 */
export function eventFiles(env: NodeJS.ProcessEnv = process.env, cwd = "."): string[] | undefined {
  const name = env["GITHUB_EVENT_NAME"];
  const path = env["GITHUB_EVENT_PATH"];
  if (name === undefined || path === undefined || !existsSync(path)) return undefined;
  let event: {
    before?: unknown;
    after?: unknown;
    pull_request?: { base?: { sha?: unknown }; head?: { sha?: unknown } };
  };
  try {
    event = JSON.parse(readFileSync(path, "utf8")) as typeof event;
  } catch {
    return undefined;
  }
  const sha = (value: unknown) =>
    typeof value === "string" && /^[0-9a-f]{40}$/.test(value) && !ZERO.test(value) ? value : undefined;
  if (name === "pull_request" || name === "pull_request_target") {
    const base = sha(event.pull_request?.base?.sha);
    const head = sha(event.pull_request?.head?.sha);
    return base && head ? rangeFiles(base, head, true, cwd) : undefined;
  }
  if (name === "push") {
    const before = sha(event.before);
    const after = sha(event.after);
    return before && after ? rangeFiles(before, after, false, cwd) : undefined;
  }
  return undefined;
}

/** Standard input, as git gives it to the pre-push hook; empty when it is a terminal or closed. */
export function readStdin(): string {
  try {
    return process.stdin.isTTY ? "" : readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

/** `lernapps changes`: prints the scope; with --ci also the step outputs and a notice. */
export function changes(args: string[]): number {
  const { values, positionals } = parseArgs({ args, options: CHANGES_OPTIONS, strict: true, allowPositionals: true });
  if (values.help) {
    process.stdout.write(CHANGES_USAGE);
    return 0;
  }
  const sources = [values.staged, values.pushed, values.ci, values.base !== undefined, positionals.length > 0];
  if (sources.filter(Boolean).length > 1) {
    throw new UsageError("changes takes one source: --staged, --pushed, --ci, --base <rev> or <path>...");
  }
  if (values.head !== undefined && values.base === undefined) throw new UsageError("--head needs --base <rev>");
  let rules: Rules;
  try {
    rules = loadRules(".");
  } catch (error) {
    if (!(error instanceof ChangesConfigError)) throw error;
    process.stderr.write(`lernapps changes: ${error.message}\n`);
    return 1;
  }
  const files = values.staged
    ? stagedFiles()
    : values.pushed
      ? pushedFiles(readStdin())
      : values.ci
        ? eventFiles()
        : values.base !== undefined
          ? rangeFiles(values.base, values.head ?? "HEAD", true)
          : positionals.length > 0
            ? positionals
            : undefined;
  const { scope, reason } = classify(files, rules);
  const run = runs(scope, rules.kind);
  process.stdout.write(`${scope}\n`);
  process.stderr.write(`lernapps changes: ${scope} in a repo of kind ${rules.kind}: ${reason}\n`);
  if (values.ci) {
    const output = process.env["GITHUB_OUTPUT"];
    const lines = [`scope=${scope}`, `kind=${rules.kind}`, `code=${run.code}`, `site=${run.site}`];
    if (output !== undefined && output !== "") appendFileSync(output, `${lines.join("\n")}\n`);
    if (scope !== "all") {
      const what = run.site ? "only the site's checks and deployment run" : "nothing to build, check or publish";
      process.stdout.write(`::notice title=lernapps changes::change scope ${scope}: ${what} (${reason})\n`);
    }
  }
  return 0;
}
