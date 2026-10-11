// Runs once before the test files: it reserves one directory for a fresh clone of this repo with a real `npm ci`,
// shared by the test files that need an installed clone (check.e2e, rules.e2e). The first of them to ask installs it
// (installedClone() in support.ts); the others wait for it and work in their own copies, whose node_modules link to
// this one, instead of running `npm ci` themselves. A run of only the fast test files installs nothing.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    /** Where the shared installed clone goes: <root>/clone, installed once under the lock <root>/lock. */
    installRoot: string;
  }
}

export default function setup(project: TestProject): () => void {
  const root = mkdtempSync(join(tmpdir(), "lernapps-installed-"));
  project.provide("installRoot", root);
  return () => rmSync(root, { recursive: true, force: true });
}
