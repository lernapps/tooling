// The licences of the app's runtime dependencies (`dependencies` in package.json, and theirs), read from
// node_modules. Needs the app's repo; a bundle alone does not say which packages it contains.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Check, Problem } from "../check.ts";

/** Licences that allow the app to be shared freely, with or without changes (SPDX identifiers). */
const ALLOWED = new Set([
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC-BY-4.0",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MIT-0",
  "MPL-2.0",
  "Python-2.0",
  "Unlicense",
  "Zlib",
]);

/** An SPDX expression is allowed when one of its alternatives (OR) has only allowed parts (AND). */
const allowed = (expression: string) =>
  expression
    .replace(/[()]/g, " ")
    .split(/\s+OR\s+/)
    .some((alternative) => alternative.split(/\s+AND\s+/).every((part) => ALLOWED.has(part.trim())));

interface Manifest {
  name?: string;
  version?: string;
  license?: unknown;
  licenses?: unknown;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const read = (file: string): Manifest => JSON.parse(readFileSync(file, "utf8")) as Manifest;

function licenceOf(manifest: Manifest): string {
  const { license, licenses } = manifest;
  if (typeof license === "string") return license;
  if (typeof license === "object" && license !== null && "type" in license) return String(license.type);
  if (Array.isArray(licenses)) {
    return licenses.map((entry: unknown) => String((entry as { type?: unknown }).type)).join(" OR ");
  }
  return "";
}

/** Where Node would find package `name` required from `from`: the nearest node_modules up to the project. */
function locate(name: string, from: string, project: string): string | undefined {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name, "package.json");
    if (existsSync(candidate)) return candidate;
    if (dir === project || dirname(dir) === dir) return undefined;
  }
}

export default {
  id: "dependency-licence",
  url: "https://lernapps.net/tooling/rules/#dependency-licence",
  description: "Every runtime dependency of the app has a licence from the allowlist.",
  severity: "error",
  run: ({ project }) => {
    if (project === undefined || !existsSync(join(project, "package.json"))) return undefined;
    const problems: Problem[] = [];
    const seen = new Set<string>();
    const walk = (manifest: Manifest, dir: string) => {
      const optional = manifest.optionalDependencies ?? {};
      for (const name of Object.keys({ ...manifest.dependencies, ...optional }).sort()) {
        const file = locate(name, dir, project);
        if (file === undefined) {
          if (!(name in optional) && !seen.has(name)) {
            seen.add(name);
            problems.push({
              where: relative(project, join(dir, "package.json")) || "package.json",
              found: `${name} is not installed, so its licence cannot be read`,
              fix: "Run npm ci, then check again",
            });
          }
          continue;
        }
        if (seen.has(file)) continue;
        seen.add(file);
        const dependency = read(file);
        const licence = licenceOf(dependency);
        if (!allowed(licence)) {
          problems.push({
            where: relative(project, file),
            found: `${dependency.name ?? name}@${dependency.version ?? "?"} has ${licence === "" ? "no licence" : `the licence ${licence}`}, which is not on the allowlist`,
            fix: `Replace it with a package under one of ${[...ALLOWED].join(", ")}`,
          });
        }
        walk(dependency, dirname(file));
      }
    };
    walk(read(join(project, "package.json")), project);
    return problems;
  },
} satisfies Check;
