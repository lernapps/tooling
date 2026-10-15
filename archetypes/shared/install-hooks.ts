// `lernapps hooks`: installs the git hooks of the preset (archetypes/shared/hooks/) into the app's repository, as
// the app's prepare script runs it on every npm install. Only where the app's folder is the root of its git work
// tree: a folder inside another repository (a template in lernapps/app-templates, an app in a monorepo) leaves that
// repository's hooks alone, since vp config would point the whole repository at the app's hooks.
//
// git runs the hooks from a folder of their own below node_modules/.cache/, each a line that runs the preset's hook
// of the installed tooling. Not from the package's folder: npm replaces that whenever the tooling moves to another
// commit (lernapps update installs it by name, which runs no prepare script), and git skips a hooks folder that is gone
// without a word, so the commits after an update would pass unchecked.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { parseArgs } from "node:util";
import { HOOKS_OPTIONS, HOOKS_USAGE } from "../../src/usage.ts";

/** The hooks, as the app's folder sees them once @lernapps/tooling is installed. */
export const HOOKS_DIR = "node_modules/@lernapps/tooling/archetypes/shared/hooks";
/** Where git runs them from: a folder npm leaves alone when it replaces the package. */
export const GIT_HOOKS_DIR = "node_modules/.cache/lernapps/hooks";
const HOOKS = ["pre-commit", "pre-push"] as const;

export function installHooks(args: string[]): number {
  const { values } = parseArgs({ args, options: HOOKS_OPTIONS, strict: true, allowPositionals: false });
  if (values.help) {
    process.stdout.write(HOOKS_USAGE);
    return 0;
  }
  const say = (message: string) => process.stdout.write(`lernapps hooks: ${message}\n`);
  const prefix = spawnSync("git", ["rev-parse", "--show-prefix"], { encoding: "utf8" });
  if (prefix.error || prefix.status !== 0) {
    say("not in a git repository, no hooks installed (git init, then npm install again)");
    return 0;
  }
  const inside = prefix.stdout.trim();
  if (inside !== "") {
    say(`this folder is ${inside} inside another git repository; its hooks stay as they are`);
    return 0;
  }
  // a missing hook of the package fails the commit or push: sh cannot read the file
  mkdirSync(GIT_HOOKS_DIR, { recursive: true });
  for (const hook of HOOKS) {
    writeFileSync(
      join(GIT_HOOKS_DIR, hook),
      `# Written by lernapps hooks: runs the ${hook} hook of the installed @lernapps/tooling.\n. ./${HOOKS_DIR}/${hook}\n`,
    );
  }
  // an app installed before the hooks had their own folder: vp config leaves any other core.hooksPath as it is
  const current = spawnSync("git", ["config", "--local", "core.hooksPath"], { encoding: "utf8" });
  if (current.stdout.trim() === `${HOOKS_DIR}/_`) {
    spawnSync("git", ["config", "--local", "core.hooksPath", `${GIT_HOOKS_DIR}/_`]);
  }
  // the app's toolchain first, as npm puts it on the PATH of the prepare script
  const env = {
    ...process.env,
    PATH: [join(process.cwd(), "node_modules", ".bin"), process.env["PATH"] ?? ""].join(delimiter),
  };
  const result = spawnSync("vp", ["config", "--no-agent", "--hooks-dir", GIT_HOOKS_DIR], { stdio: "inherit", env });
  if (result.error) {
    process.stderr.write(`lernapps hooks: cannot run vp: ${result.error.message}. Install the dependencies (npm ci)\n`);
    return 1;
  }
  return result.status ?? 1;
}
