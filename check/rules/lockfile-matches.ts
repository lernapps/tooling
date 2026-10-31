// package-lock.json installs what package.json asks for, git pins included (check/lockfile.ts). Needs the app's repo.
import type { Check } from "../check.ts";
import { lockfileProblems } from "../lockfile.ts";

export default {
  id: "lockfile-matches",
  url: "https://lernapps.net/tooling/rules/#lockfile-matches",
  description: "package-lock.json installs what package.json asks for, the commit of every git pin included.",
  severity: "error",
  run: ({ project }) => (project === undefined ? undefined : lockfileProblems(project)),
} satisfies Check;
