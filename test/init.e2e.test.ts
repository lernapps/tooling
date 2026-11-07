// `lernapps init` and `lernapps skills` end to end, as an assistant starts an app: `npx --yes @lernapps/tooling init`
// in an empty folder (here the package packed from a fresh clone of this repo), then `lernapps skills --archetype`.
// Both run on a developer's machine and in CI (lernapps/apps tests the entry point in GitHub Actions, where CI=true);
// the package `skills` behaves differently when CI is set (it then freezes skills-lock.json by default), so every case
// runs with CI unset and with CI=true. A new version of `skills` that changes its behaviour fails here, before a
// release: test/release-gate.test.ts holds that release.yml runs this file against the packed package.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { packedTooling, run, tempDir } from "./support.ts";

const SLOW = 10 * 60 * 1000;

describe.each([
  ["without CI", { CI: "" }],
  ["with CI=true", { CI: "true" }],
])("lernapps init in an empty folder, %s", (_label, env) => {
  test(
    "installs the tooling, writes the plan and syncs the skills; lernapps skills then adds an archetype's",
    { timeout: SLOW },
    () => {
      const tarball = packedTooling();
      const dir = tempDir("init");
      const init = run(
        "npx",
        ["--yes", `--package=${tarball}`, "lernapps", "init", "first-version", "--tooling", `file:${tarball}`],
        dir,
        env,
      );
      expect(init.code, `${init.stdout}\n${init.stderr}`).toBe(0);
      expect(existsSync(join(dir, ".vibe/plans/01-first-version.md"))).toBe(true);
      expect(existsSync(join(dir, ".agents/skills/lernapps-app/SKILL.md"))).toBe(true);
      expect(readFileSync(join(dir, "skills-lock.json"), "utf8")).toContain("lernapps-app");

      const skills = run(join(dir, "node_modules/.bin/lernapps"), ["skills", "--archetype", "quiz"], dir, env);
      expect(skills.code, `${skills.stdout}\n${skills.stderr}`).toBe(0);
      expect(existsSync(join(dir, ".agents/skills/lernapps-quiz/SKILL.md"))).toBe(true);
    },
  );
});
