// What makes a check on the creator's machine differ from the one in CI, before anything runs: packages installed
// that package-lock.json does not ask for, and another major version of Node. A check that passes locally then fails
// in CI, which installs with npm ci and runs the Node of the app check action. The CLI asks these functions first,
// in a repo (src/cli.ts); the installed versions are also part of the key of a cached result (check/cache.ts).
//
// Why not `npm ci --dry-run` or node_modules/.package-lock.json: the dry run rewrites node_modules/.package-lock.json
// with the lock file's versions though it installs nothing, and from then on npm itself (npm ci --dry-run, npm ls)
// reports the old packages as up to date. The package.json of every installed package is what is installed.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Problem } from "./check.ts";

/**
 * The major version of Node that CI runs: `node-version` in actions/app-check/action.yml, which a test keeps equal
 * (test/environment.test.ts).
 */
export const CI_NODE_MAJOR = 26;

interface LockEntry {
  version?: string;
  link?: boolean;
  optional?: boolean;
}

/** Every package the lock file installs below node_modules, by its path: the version it asks for and whether it is optional. */
function lockedPackages(dir: string): Map<string, LockEntry> | undefined {
  const file = join(dir, "package-lock.json");
  if (!existsSync(file)) return undefined;
  const lock = JSON.parse(readFileSync(file, "utf8")) as { packages?: Record<string, LockEntry> };
  return new Map(
    Object.entries(lock.packages ?? {}).filter(
      // the root entry, workspace folders and links are the project's own files, not installed packages
      ([path, entry]) => path.startsWith("node_modules/") && entry.link !== true,
    ),
  );
}

/** The version of the package installed at `path` (below `dir`), or undefined when none is installed there. */
function installedVersion(dir: string, path: string): string | undefined {
  try {
    const manifest = JSON.parse(readFileSync(join(dir, path, "package.json"), "utf8")) as { version?: unknown };
    return typeof manifest.version === "string" ? manifest.version : "";
  } catch {
    return undefined;
  }
}

/**
 * The installed version of every package the lock file names, as one line per package ("path version", "path -" when
 * none is installed), sorted: what node_modules holds, for the key of a cached result. Undefined without a lock file.
 */
export function installedPackages(dir: string): string | undefined {
  const locked = lockedPackages(dir);
  if (locked === undefined) return undefined;
  return [...locked.keys()]
    .sort()
    .map((path) => `${path} ${installedVersion(dir, path) ?? "-"}`)
    .join("\n");
}

/** How many mismatches a finding names before it says how many more there are. */
const SHOWN = 5;

/**
 * Whether node_modules holds what package-lock.json asks for: every package at its version. An optional package that
 * is not installed (one for another platform) is no mismatch. Empty without a lock file or when everything matches;
 * else one problem that names the first mismatches.
 */
export function installedProblems(dir: string): Problem[] {
  const locked = lockedPackages(dir);
  if (locked === undefined || locked.size === 0) return [];
  const mismatches: string[] = [];
  for (const [path, entry] of [...locked].sort(([a], [b]) => a.localeCompare(b))) {
    const installed = installedVersion(dir, path);
    if (installed === undefined && entry.optional === true) continue;
    if (installed !== undefined && (entry.version === undefined || installed === entry.version)) continue;
    const name = path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length);
    mismatches.push(
      installed === undefined
        ? `${name} is not installed (the lock file asks for ${entry.version ?? "it"})`
        : `${name} ${installed} is installed, the lock file asks for ${entry.version}`,
    );
  }
  if (mismatches.length === 0) return [];
  const more = mismatches.length > SHOWN ? ` and ${mismatches.length - SHOWN} more` : "";
  return [
    {
      where: "node_modules",
      found: `node_modules does not hold what package-lock.json asks for: ${mismatches.slice(0, SHOWN).join("; ")}${more}. CI installs with npm ci, so the check would test other packages than CI`,
      fix: "Run npm ci, which installs exactly what package-lock.json asks for, then check again",
    },
  ];
}

/** A warning when this Node has another major version than CI, or undefined. */
export function nodeMajorProblem(version = process.versions.node): Problem | undefined {
  const major = Number(version.split(".")[0]);
  if (major === CI_NODE_MAJOR) return undefined;
  return {
    where: "node",
    found: `Node ${version} runs this check, CI runs Node ${CI_NODE_MAJOR}: what passes here may fail in CI`,
    fix: `Use Node ${CI_NODE_MAJOR} (for example nvm install ${CI_NODE_MAJOR}); the check does not fail for this`,
    severity: "warning",
  };
}
