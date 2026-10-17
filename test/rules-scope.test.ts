// The scopes of the rule catalog from the review's side (docs/arc42 ch. 8, concept "Rule catalog"): the review judges
// the rules `npm run rules -- --app <dir>` lists for the app. A freely built app (no @lernapps/tooling in its
// package.json) is held to the listing rules alone, so it is never judged by a rule that presupposes the plan workflow
// or the tooling's checks, and a missing plan file fails nothing. An app built with the tooling still is, plan or not.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { repoRoot, run, tempDir } from "./support.ts";

const TOOLING_RULES = [
  "plan-file",
  "explore-before-code",
  "stop-at-checkpoints",
  "few-turns-after-plan",
  "retrospective-filled",
  "app-content-guide",
  "app-content-matches",
  "checks-pass",
  "fix-from-message",
  "suppression-reason",
];

/** An app's repo without a plan file: only its package.json. */
function app(name: string, devDependencies: Record<string, string>): string {
  const dir = tempDir(name);
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, private: true, devDependencies }));
  return dir;
}

/** The rules in scope for the app, with their scopes in the skill, and the first line naming the app's scopes. */
function inScope(dir: string): { header: string; rules: Map<string, string[]> } {
  const result = run("node", ["scripts/rules.ts", "list", "--app", dir], repoRoot);
  expect(result.code, result.stderr).toBe(0);
  const list = parse(result.stdout) as Record<string, { in: string; scope?: string[] }[]>;
  const rules = new Map(
    Object.entries(list).map(([id, entries]) => [id, entries.find((entry) => entry.in === "skill")?.scope ?? []]),
  );
  return { header: result.stdout.split("\n")[0] ?? "", rules };
}

test("a freely built app without a plan file is held to the listing rules alone", () => {
  const { header, rules } = inScope(app("free", { vite: "8.0.0" }));
  expect(header).toMatch(/: listing$/);
  for (const id of TOOLING_RULES) expect(rules.has(id), id).toBe(false);
  for (const id of [
    "no-ads",
    "no-tracking",
    "accessible",
    "runs-in-browser",
    "app-checkable",
    "entry-fitness-matches",
  ]) {
    expect(rules.has(id), id).toBe(true);
  }
  for (const [id, scopes] of rules) {
    if (scopes.length > 0) expect(scopes, id).toContain("listing");
  }
});

test("an app built with the tooling without a plan file is still held to plan-file and the other tooling rules", () => {
  const { header, rules } = inScope(app("built", { "@lernapps/tooling": "github:lernapps/tooling#main" }));
  expect(header).toMatch(/: listing, tooling$/);
  for (const id of TOOLING_RULES) expect(rules.get(id), id).toEqual(["tooling"]);
  expect(rules.has("no-ads")).toBe(true);
});
