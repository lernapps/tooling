// Whether package-lock.json installs what package.json asks for. npm ci already refuses a lock file whose registry
// versions do not satisfy package.json, but not one whose git pin points to another commit: an update that changes
// the pin in package.json alone (as Renovate does when it cannot write the lock file) passes npm ci and installs the
// old commit. The rule lockfile-matches (check/rules/lockfile-matches.ts) and the site check action
// (check/lockfile-main.ts) ask this function.
// Only Node's own modules: the site check action runs it from its own checkout without installing anything.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The dependency fields npm copies from package.json into the lock file's root entry. */
const FIELDS = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"] as const;

/** The commit a git spec pins (github:owner/repo#<sha>, git+https://…#<sha>), if it pins a full one. */
const pinnedCommit = (spec: string) => (spec.startsWith("file:") ? undefined : /#([0-9a-f]{40})$/.exec(spec)?.[1]);

interface Manifest {
  [field: string]: unknown;
}

interface Lock {
  packages?: Record<string, { resolved?: string } & Manifest>;
}

export interface LockfileProblem {
  where: string;
  found: string;
  fix: string;
}

const FIX = "Run npm install, then commit package-lock.json together with package.json";

/** The mismatches between package.json and package-lock.json in dir; undefined when dir has no lock file. */
export function lockfileProblems(dir: string): LockfileProblem[] | undefined {
  const lockFile = join(dir, "package-lock.json");
  if (!existsSync(lockFile) || !existsSync(join(dir, "package.json"))) return undefined;
  const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as Manifest;
  const lock = JSON.parse(readFileSync(lockFile, "utf8")) as Lock;
  const root = lock.packages?.[""] ?? {};
  const problems: LockfileProblem[] = [];
  const reported = new Set<string>();
  for (const field of FIELDS) {
    const wanted = (manifest[field] ?? {}) as Record<string, string>;
    const locked = (root[field] ?? {}) as Record<string, string>;
    for (const name of [...new Set([...Object.keys(wanted), ...Object.keys(locked)])].sort()) {
      if (wanted[name] === locked[name]) continue;
      reported.add(name);
      problems.push({
        where: "package-lock.json",
        found: `${field} ${name}: package.json has ${wanted[name] ?? "nothing"}, the lock file ${locked[name] ?? "nothing"}`,
        fix: FIX,
      });
    }
  }
  for (const field of FIELDS.filter((field) => field !== "peerDependencies")) {
    for (const [name, spec] of Object.entries((manifest[field] ?? {}) as Record<string, string>)) {
      const commit = pinnedCommit(spec);
      if (commit === undefined || reported.has(name)) continue;
      const resolved = lock.packages?.[`node_modules/${name}`]?.resolved;
      if (resolved?.endsWith(`#${commit}`)) continue;
      problems.push({
        where: "package-lock.json",
        found: `${name}: package.json pins the commit ${commit}, the lock file installs ${resolved ?? "nothing"}`,
        fix: FIX,
      });
    }
  }
  return problems;
}
