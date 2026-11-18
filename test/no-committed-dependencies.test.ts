// The check no-committed-dependencies: files git tracks below node_modules/ in the app's repo are named; a clean repo, a
// folder that is no git repo, and no project give nothing.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import type { Problem } from "../check/check.ts";
import check from "../check/rules/no-committed-dependencies.ts";
import { tempDir } from "./support.ts";

const run = (project?: string) => check.run(project === undefined ? {} : { project }) as Problem[] | undefined;

function repo(tracked: boolean): string {
  const dir = tempDir("no-committed-dependencies");
  spawnSync("git", ["init", "-q"], { cwd: dir });
  mkdirSync(join(dir, "node_modules", "pkg"), { recursive: true });
  writeFileSync(join(dir, "node_modules", "pkg", "index.js"), "x");
  writeFileSync(join(dir, ".gitignore"), "node_modules/\n");
  spawnSync("git", ["add", "-f", ...(tracked ? ["node_modules"] : [".gitignore"])], { cwd: dir });
  return dir;
}

describe("no-committed-dependencies", () => {
  test("checks nothing without a project or outside a git repo", () => {
    expect(run(undefined)).toBeUndefined();
    expect(run(tempDir("no-repo"))).toBeUndefined();
  });

  test("a repo whose node_modules is ignored passes", () => {
    expect(run(repo(false))).toEqual([]);
  });

  test("tracked files below node_modules are named, with their number and the repair", () => {
    expect(run(repo(true))).toEqual([
      expect.objectContaining({
        found: "1 files below node_modules/ are tracked by git, e.g. node_modules/pkg/index.js",
        fix: expect.stringContaining("git rm -r --cached node_modules"),
      }),
    ]);
    expect(check.severity).toBe("warning");
  });
});
