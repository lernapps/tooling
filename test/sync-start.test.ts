// The starter repository's AGENTS.md follows guidance/AGENTS.md of this repository (.github/workflows/sync-start.yml):
// the workflow runs after a merge to main that changes the file and by hand, uses actions pinned by commit, copies the
// file to the starter and pushes only when it differs.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { repoRoot } from "./support.ts";

const text = readFileSync(join(repoRoot, ".github/workflows/sync-start.yml"), "utf8");
const workflow = parse(text) as {
  on: { push?: { branches?: string[]; paths?: string[] }; workflow_dispatch?: unknown };
  permissions: Record<string, string>;
};

test("it runs after a merge to main that changes guidance/AGENTS.md, and by hand", () => {
  expect(workflow.on.push?.branches).toEqual(["main"]);
  expect(workflow.on.push?.paths).toContain("guidance/AGENTS.md");
  expect(workflow.on).toHaveProperty("workflow_dispatch");
});

test("it only reads this repository; the push to the starter uses the App's token", () => {
  expect(workflow.permissions).toEqual({ contents: "read" });
  expect(text).toContain("repository: lernapps/start");
  expect(text).toContain("steps.app.outputs.token");
  expect(text).toContain("repositories: start");
});

test("every action is pinned by commit", () => {
  for (const [, ref] of text.matchAll(/uses: [\w./-]+@([^\s#]+)/g)) expect(ref, text).toMatch(/^[0-9a-f]{40}$/);
});

test("it copies the file and commits only when it differs", () => {
  expect(text).toContain("cp tooling/guidance/AGENTS.md start/AGENTS.md");
  expect(text).toContain("git diff --quiet -- AGENTS.md");
});
