// `lernapps init` starts an app's folder; this is the part that needs no registry: the git repository on the branch the
// plan names. (The rest of init is run from a packed tarball in create.e2e.test.ts.)
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { ensureRepository, WORK_BRANCH } from "../generator/init.ts";
import { ok, tempDir } from "./support.ts";

describe("the git repository of a started app", () => {
  test("is made on the branch work, which rule 8 of the plan names, in a folder that has none", () => {
    const dir = tempDir("init-repo");
    expect(ensureRepository(dir)).toBe(`a git repository on the branch ${WORK_BRANCH}`);
    expect(existsSync(join(dir, ".git"))).toBe(true);
    expect(readFileSync(join(dir, ".git", "HEAD"), "utf8").trim()).toBe("ref: refs/heads/work");
  });

  test("is left as it is when the folder is a repository already", () => {
    const dir = tempDir("init-existing");
    ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
    expect(ensureRepository(dir)).toBeUndefined();
    expect(readFileSync(join(dir, ".git", "HEAD"), "utf8").trim()).toBe("ref: refs/heads/main");
  });
});
