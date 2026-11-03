// `lernapps init` starts an app's folder; this is the part that needs no registry: the git repository on the branch the
// plan names, and the tooling it installs (a local build packed, so that its dependencies install as from the registry). (The rest of init is run from a packed tarball in create.e2e.test.ts.)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { CreateError } from "../generator/create.ts";
import { ensureRepository, packBuild, toolingSpec, WORK_BRANCH } from "../generator/init.ts";
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

describe("the tooling init installs", () => {
  test("is the one named with --tooling, else this version", () => {
    expect(toolingSpec("file:/x/lernapps-tooling-0.0.0.tgz", "0.0.0")).toBe("file:/x/lernapps-tooling-0.0.0.tgz");
    expect(toolingSpec(undefined, "1.2.3")).toBe("1.2.3");
  });

  test("of a local build (0.0.0, not on the registry): its git checkout packed, else a message to name one", () => {
    const checkout = tempDir("tooling-checkout");
    ok("git", ["init", "--quiet"], checkout);
    expect(toolingSpec(undefined, "0.0.0", checkout, (root) => join(root, "packed.tgz"))).toBe(
      `file:${join(checkout, "packed.tgz")}`,
    );
    const packed = tempDir("tooling-packed");
    expect(() => toolingSpec(undefined, "0.0.0", packed)).toThrow(CreateError);
    expect(() => toolingSpec(undefined, "0.0.0", packed)).toThrow(/--tooling <spec>/);
  });

  test("a local build is packed into a tarball in a temporary folder, not linked: its dependencies install", () => {
    const checkout = tempDir("tooling-pack");
    writeFileSync(join(checkout, "package.json"), JSON.stringify({ name: "@lernapps/tooling", version: "0.0.0" }));
    writeFileSync(join(checkout, "index.js"), "export {};\n");
    const tarball = packBuild(checkout);
    expect(tarball).toMatch(/lernapps-tooling-0\.0\.0\.tgz$/);
    expect(dirname(tarball).startsWith(checkout)).toBe(false);
    expect(existsSync(tarball)).toBe(true);
  });
});
