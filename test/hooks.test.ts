// The git hooks of an app (archetypes/shared/hooks/), where their behaviour needs no installed app.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { ok, PRE_COMMIT_LOG, repoRoot, run, tempDir } from "./support.ts";

test("the pre-commit hook lets a commit with nothing staged pass, without running a step", () => {
  // the empty start commits of main and gh-pages: no tool is installed there, and nothing is there to check
  const dir = tempDir("empty-commit");
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  const result = run("sh", [join(repoRoot, "archetypes/shared/hooks/pre-commit")], dir);
  expect(result.code, result.stderr).toBe(0);
  expect(existsSync(join(dir, PRE_COMMIT_LOG))).toBe(false);
});
