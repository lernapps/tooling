// `lernapps init` starts an app's folder; this is the part that needs no registry: the git repository on the branch the
// plan names, and the tooling it installs (a local build packed, so that its dependencies install as from the registry). (The rest of init is run from a packed tarball in create.e2e.test.ts.)
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { CreateError } from "../generator/create.ts";
import {
  archetypeSkills,
  ensureRepository,
  packageSkills,
  packBuild,
  removeHandCopies,
  toolingSpec,
  WORK_BRANCH,
} from "../generator/init.ts";
import { ok, repoRoot, tempDir } from "./support.ts";

describe("the git repository of a started app", () => {
  test("is made on the branch work, which rule 8 of the plan names, in a folder that has none", () => {
    const dir = tempDir("init-repo");
    expect(ensureRepository(dir)).toEqual({ done: `a git repository on the branch ${WORK_BRANCH}` });
    expect(existsSync(join(dir, ".git"))).toBe(true);
    expect(readFileSync(join(dir, ".git", "HEAD"), "utf8").trim()).toBe("ref: refs/heads/work");
  });

  test("of a repository without commits (git init on master, a clone of an empty repo) switches to work", () => {
    const dir = tempDir("init-existing");
    ok("git", ["init", "--quiet", "--initial-branch=master"], dir);
    expect(ensureRepository(dir).done).toMatch(/no commit yet: now on the branch work/);
    expect(readFileSync(join(dir, ".git", "HEAD"), "utf8").trim()).toBe("ref: refs/heads/work");
  });

  test("on work already is left as it is", () => {
    const dir = tempDir("init-on-work");
    ok("git", ["init", "--quiet", "--initial-branch=work"], dir);
    expect(ensureRepository(dir)).toEqual({});
  });

  test("with commits on another branch stays there, with a warning that names the next command", () => {
    const dir = tempDir("init-commits");
    ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
    ok(
      "git",
      ["-c", "user.name=t", "-c", "user.email=t@example.org", "commit", "--quiet", "--allow-empty", "-m", "x"],
      dir,
    );
    const result = ensureRepository(dir);
    expect(result.done).toBeUndefined();
    expect(result.warning).toMatch(/on the branch main, not on work.*git switch -c work/);
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

describe("skills copied by hand before init (the fallback without npx)", () => {
  const skill = (dir: string, path: string, text = "copied by hand\n") => {
    mkdirSync(join(dir, path), { recursive: true });
    writeFileSync(join(dir, path, "SKILL.md"), text);
  };

  test("the package's skills are its folders lernapps-* with a SKILL.md, the archetypes' among them", () => {
    const names = packageSkills(repoRoot);
    expect(names).toContain("lernapps-app");
    expect(names).toContain("lernapps-map-assignment");
    expect(names).toEqual(expect.arrayContaining(archetypeSkills().map((entry) => entry.name)));
    expect(names.every((name) => name.startsWith("lernapps-"))).toBe(true);
  });

  test("are removed, in every agent's folder, so that the sync installs the package's; the app's own stay", () => {
    // without this, skills experimental_sync skips them: "already exists and was not installed by sync"
    const dir = tempDir("init-hand-copies");
    skill(dir, ".agents/skills/lernapps-app");
    skill(dir, ".agents/skills/lernapps-cli");
    skill(dir, ".agents/skills/app-content");
    mkdirSync(join(dir, ".claude/skills"), { recursive: true });
    symlinkSync("../../.agents/skills/lernapps-app", join(dir, ".claude/skills/lernapps-app"));
    expect(removeHandCopies(dir, ["lernapps-app", "lernapps-cli", "lernapps-listing"])).toEqual([
      "lernapps-app",
      "lernapps-cli",
    ]);
    expect(existsSync(join(dir, ".agents/skills/lernapps-app"))).toBe(false);
    expect(existsSync(join(dir, ".agents/skills/lernapps-cli"))).toBe(false);
    expect(() => readFileSync(join(dir, ".claude/skills/lernapps-app/SKILL.md"))).toThrow();
    expect(existsSync(join(dir, ".agents/skills/app-content/SKILL.md"))).toBe(true);
  });

  test("a skill skills-lock.json lists stays: the sync replaces its own, one of skills add is the creator's", () => {
    const dir = tempDir("init-locked");
    skill(dir, ".agents/skills/lernapps-app");
    writeFileSync(
      join(dir, "skills-lock.json"),
      JSON.stringify({ version: 1, skills: { "lernapps-app": { source: "x", sourceType: "github" } } }),
    );
    expect(removeHandCopies(dir, ["lernapps-app"])).toEqual([]);
    expect(existsSync(join(dir, ".agents/skills/lernapps-app/SKILL.md"))).toBe(true);
  });
});
