// Installed dependencies in the repository (`git add -A` before .gitignore knew node_modules) make a commit thousands of
// files large. The check lists what git tracks below node_modules/ in the app's repo. No git repo: nothing to check.
import { spawnSync } from "node:child_process";
import type { Check } from "../check.ts";

export default {
  id: "no-committed-dependencies",
  url: "https://lernapps.net/tooling/rules/#no-committed-dependencies",
  description: "The repository of the app tracks no file below node_modules/.",
  severity: "warning",
  run: ({ project }) => {
    if (project === undefined) return undefined;
    const listed = spawnSync("git", ["-C", project, "ls-files", "--", "node_modules"], { encoding: "utf8" });
    if (listed.status !== 0) return undefined;
    const files = listed.stdout.split("\n").filter((line) => line !== "");
    if (files.length === 0) return [];
    return [
      {
        where: "node_modules/",
        found: `${files.length} files below node_modules/ are tracked by git, e.g. ${files[0]}`,
        fix: "Run `git rm -r --cached node_modules` and commit; keep `node_modules/` in .gitignore",
      },
    ];
  },
} satisfies Check;
