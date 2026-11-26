// The git hooks of an app (archetypes/shared/hooks/), where their behaviour needs no installed app.
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { ok, PRE_COMMIT_LOG, repoRoot, run, tempDir } from "./support.ts";

test("the pre-commit hook lets a commit with nothing staged pass, without running a step", () => {
  // the empty start commits of main and gh-pages: no tool is installed there, and nothing is there to check
  const dir = tempDir("empty-commit");
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  const result = run("sh", [join(repoRoot, "archetypes/shared/hooks/pre-commit")], dir);
  expect(result.code, result.stderr).toBe(0);
  expect(existsSync(join(dir, PRE_COMMIT_LOG))).toBe(false);
});

describe("vp staged in the pre-commit hook", () => {
  /** A repository whose commit deletes the files of a folder that is a link now, or only changes a file. */
  function stage(link: boolean): { dir: string; env: NodeJS.ProcessEnv; calls: () => string } {
    const dir = tempDir(link ? "beyond-link" : "plain-commit");
    ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
    mkdirSync(join(dir, ".agents/skills/a"), { recursive: true });
    mkdirSync(join(dir, ".claude/skills/a"), { recursive: true });
    writeFileSync(join(dir, ".agents/skills/a/SKILL.md"), "x\n");
    writeFileSync(join(dir, ".claude/skills/a/SKILL.md"), "x\n");
    ok("git", ["add", "-A"], dir);
    ok("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "--quiet", "-m", "start"], dir);
    if (link) {
      rmSync(join(dir, ".claude/skills/a"), { recursive: true });
      symlinkSync("../../.agents/skills/a", join(dir, ".claude/skills/a"));
    } else writeFileSync(join(dir, ".claude/skills/a/SKILL.md"), "y\n");
    ok("git", ["add", "-A"], dir);
    // stand-ins for the tools: they write their arguments down
    const bin = join(dir, "..", `${link ? "link" : "plain"}-bin`);
    mkdirSync(bin, { recursive: true });
    for (const tool of ["vp", "lernapps"]) {
      writeFileSync(join(bin, tool), `#!/bin/sh\necho "${tool} $*" >> "${join(bin, "calls")}"\n`);
      chmodSync(join(bin, tool), 0o755);
    }
    return {
      dir,
      env: { PATH: [bin, process.env["PATH"] ?? ""].join(delimiter) },
      calls: () => readFileSync(join(bin, "calls"), "utf8"),
    };
  }

  test("takes no backup when the commit deletes the files of a folder that became a link", () => {
    const { dir, env, calls } = stage(true);
    const result = run("sh", [join(repoRoot, "archetypes/shared/hooks/pre-commit")], dir, env);
    expect(result.code, result.stderr).toBe(0);
    expect(calls()).toContain("vp staged --no-stash");
  });

  test("keeps the backup of a commit that deletes nothing below a link", () => {
    const { dir, env, calls } = stage(false);
    const result = run("sh", [join(repoRoot, "archetypes/shared/hooks/pre-commit")], dir, env);
    expect(result.code, result.stderr).toBe(0);
    expect(calls()).toMatch(/^vp staged$/m);
  });
});
