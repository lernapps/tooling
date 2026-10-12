// `lernapps hooks`: installs the git hooks of the preset (archetypes/shared/hooks/) into the app's repository, as
// the app's prepare script runs it on every npm install. Only where the app's folder is the root of its git work
// tree: a folder inside another repository (a template in lernapps/app-templates, an app in a monorepo) leaves that
// repository's hooks alone, since vp config would point the whole repository at the app's hooks.
import { spawnSync } from "node:child_process";
import { delimiter, join } from "node:path";
import { parseArgs } from "node:util";
import { HOOKS_OPTIONS, HOOKS_USAGE } from "../../src/usage.ts";

/** The hooks, as the app's folder sees them once @lernapps/tooling is installed. */
export const HOOKS_DIR = "node_modules/@lernapps/tooling/archetypes/shared/hooks";

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
  // the app's toolchain first, as npm puts it on the PATH of the prepare script
  const env = {
    ...process.env,
    PATH: [join(process.cwd(), "node_modules", ".bin"), process.env["PATH"] ?? ""].join(delimiter),
  };
  const result = spawnSync("vp", ["config", "--no-agent", "--hooks-dir", HOOKS_DIR], { stdio: "inherit", env });
  if (result.error) {
    process.stderr.write(`lernapps hooks: cannot run vp: ${result.error.message}. Install the dependencies (npm ci)\n`);
    return 1;
  }
  return result.status ?? 1;
}
