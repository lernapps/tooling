// The contract of `lernapps hooks` (archetypes/shared/install-hooks.ts): the hooks keep running after npm replaced the
// tooling's package folder, as it does when the app moves to another commit of the tooling.
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { HOOKS_DIR } from "../archetypes/shared/install-hooks.ts";
import { ok, repoRoot, run, tempDir } from "./support.ts";

test("the hooks run after npm replaced the package folder", () => {
  const app = tempDir("hooks");
  ok("git", ["init", "--quiet"], app);
  mkdirSync(join(app, "node_modules/.bin"), { recursive: true });
  symlinkSync(join(repoRoot, "node_modules/.bin/vp"), join(app, "node_modules/.bin/vp"));
  const installPackage = () => {
    rmSync(join(app, "node_modules/@lernapps"), { recursive: true, force: true });
    mkdirSync(join(app, HOOKS_DIR), { recursive: true });
    writeFileSync(join(app, HOOKS_DIR, "pre-commit"), 'echo "the hook of the package ran" >&2\nexit 1\n');
  };
  installPackage();
  ok("node", [join(repoRoot, "src/cli.ts"), "hooks"], app);
  installPackage(); // npm install --save-dev @lernapps/tooling@<another commit>, which runs no prepare script
  writeFileSync(join(app, "file.txt"), "a change\n");
  ok("git", ["add", "file.txt"], app);
  const commit = run("git", ["-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "a change"], app);
  expect(commit.code).not.toBe(0);
  expect(commit.stderr).toContain("the hook of the package ran");
});
