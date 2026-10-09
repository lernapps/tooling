// The conventions the tooling gives apps hold for the tooling itself.
import { expect, test } from "vite-plus/test";
import { ok, repoRoot } from "./support.ts";

test("no JavaScript sources: every script is TypeScript", () => {
  const javascript = ok(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "*.js", "*.mjs", "*.cjs", "*.jsx"],
    repoRoot,
  ).stdout;
  expect(javascript).toBe("");
});
