// `lernapps init` and `lernapps skills` end to end, as an assistant starts an app: `npx --yes @lernapps/tooling init`
// in an empty folder (here the package packed from a fresh clone of this repo), then `lernapps skills --archetype`.
// Both run on a developer's machine and in CI (lernapps/apps tests the entry point in GitHub Actions, where CI=true);
// the package `skills` behaves differently when CI is set (it then freezes skills-lock.json by default), so every case
// runs with CI unset and with CI=true. A new version of `skills` that changes its behaviour fails here, before a
// release: test/release-gate.test.ts holds that release.yml runs this file against the packed package.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { packedTooling, run, tempDir } from "./support.ts";

const SLOW = 10 * 60 * 1000;
// a check inside a test copy does not start the end-to-end tests again (support.ts, LERNAPPS_E2E_INNER)
const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
// npx keeps what it installs in the npm cache, keyed by the package spec: a cache of its own per run, so that two runs
// at the same time (a test copy, a second worktree) never share a half-written _npx folder
const npmCache = () => tempDir("npm-cache");

describe.skipIf(inner).each([
  ["without CI", { CI: "" }],
  ["with CI=true", { CI: "true" }],
])("lernapps init in an empty folder, %s", (_label, caseEnv) => {
  test(
    "installs the tooling, keeps a plan begun without npx, replaces the skills copied by hand and syncs the others; lernapps skills then adds an archetype's",
    { timeout: SLOW },
    () => {
      const tarball = packedTooling();
      const dir = tempDir("init");
      const env = { ...caseEnv, npm_config_cache: npmCache() };
      // what the fallback without npx of llms.txt copied: a plan with answers, a skill copied by hand
      mkdirSync(join(dir, ".vibe/plans"), { recursive: true });
      writeFileSync(join(dir, ".vibe/plans/01-first-version.md"), "the creator's answers\n");
      mkdirSync(join(dir, ".agents/skills/lernapps-app"), { recursive: true });
      writeFileSync(join(dir, ".agents/skills/lernapps-app/SKILL.md"), "copied by hand\n");
      const init = run(
        "npx",
        ["--yes", `--package=${tarball}`, "lernapps", "init", "first-version", "--tooling", `file:${tarball}`],
        dir,
        env,
      );
      expect(init.code, `${init.stdout}\n${init.stderr}`).toBe(0);
      expect(init.stdout).toContain(".vibe/plans/01-first-version.md kept");
      expect(init.stdout).toContain("replaced the skills copied by hand with the package's: lernapps-app");
      expect(readFileSync(join(dir, ".vibe/plans/01-first-version.md"), "utf8")).toBe("the creator's answers\n");
      expect(readFileSync(join(dir, ".agents/skills/lernapps-app/SKILL.md"), "utf8")).toContain("name: lernapps-app");
      expect(readFileSync(join(dir, "skills-lock.json"), "utf8")).toContain("lernapps-app");

      const skills = run(join(dir, "node_modules/.bin/lernapps"), ["skills", "--archetype", "quiz"], dir, env);
      expect(skills.code, `${skills.stdout}\n${skills.stderr}`).toBe(0);
      expect(existsSync(join(dir, ".agents/skills/lernapps-quiz/SKILL.md"))).toBe(true);
    },
  );
});
