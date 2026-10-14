// The contract of the check `app-content-guide` (check/rules/app-content-guide.ts), as `lernapps check` runs it in
// an app's repo: an app from an archetype's template (its plan file, the runtime @lernapps/app-templates) keeps the
// content guide .agents/skills/app-content/SKILL.md with its fixed headings, and has no placeholder left in it once
// the app has content (the plan is in Commit). The skeleton the generator writes passes while the plan is in Code.
// On files alone, without installing or building anything: fast enough for every push.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import check, { HEADINGS, SKILL } from "../check/rules/app-content-guide.ts";
import type { Problem } from "../check/check.ts";
import { repoRoot, tempDir } from "./support.ts";

const SKELETON = readFileSync(join(repoRoot, "generator/app", SKILL), "utf8");
/** The skeleton with every placeholder filled in, as after the plan is confirmed. */
const FILLED = SKELETON.replace(/<!-- FILL IN:[\s\S]*?-->/g, "Concrete: the files, ids and examples of this app.");

const plan = (phase: string) => `---\narchetype: quiz\nphase: ${phase}\nprePushFailures: 0\n---\n\n# Plan\n`;
const RUNTIME = JSON.stringify({ devDependencies: { "@lernapps/app-templates": "github:lernapps/app-templates#1" } });

/** An app repo with the files given. */
function app(files: Record<string, string>): string {
  const dir = tempDir("app-content");
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  return dir;
}

const run = (project: string) => check.run({ project }) as Problem[] | undefined;

describe("app-content-guide", () => {
  test("the skeleton the generator writes has the fixed headings, and a placeholder under each", () => {
    const level2 = SKELETON.split("\n").filter((line) => line.startsWith("## "));
    expect(level2).toEqual(HEADINGS.map((heading) => `## ${heading}`));
    expect(SKELETON.match(/<!-- FILL IN:/g)).toHaveLength(HEADINGS.length);
    expect(SKELETON).toMatch(/^---\nname: app-content\ndescription: .+\n---\n/);
  });

  test("checks nothing where there is no app from an archetype's template", () => {
    expect(run(app({ "package.json": "{}" }))).toBeUndefined(); // the tooling itself, a site
    expect(run(app({ "package.json": "{}", ".vibe/plan.md": plan("commit") }))).toBeUndefined(); // built otherwise
    expect(run(app({ "package.json": RUNTIME }))).toBeUndefined(); // a template in app-templates: no plan
  });

  test("an app without the guide fails, naming the file and how to get it", () => {
    const problems = run(app({ "package.json": RUNTIME, ".vibe/plan.md": plan("code") }));
    expect(problems).toHaveLength(1);
    expect(problems?.[0]?.where).toBe(SKILL);
    expect(problems?.[0]?.fix).toContain("npx --yes github:lernapps/tooling#main update");
  });

  test("a guide without a fixed heading fails, naming the heading", () => {
    const guide = FILLED.replace("\n## Figures\n", "\n## Pictures\n");
    const problems = run(app({ "package.json": RUNTIME, ".vibe/plan.md": plan("commit"), [SKILL]: guide }));
    expect(problems?.map((problem) => problem.found)).toEqual([`the heading "## Figures" is missing`]);
  });

  test("placeholders may stay while the plan is in Code; in Commit each one fails with its line", () => {
    expect(run(app({ "package.json": RUNTIME, ".vibe/plan.md": plan("code"), [SKILL]: SKELETON }))).toEqual([]);
    const problems = run(app({ "package.json": RUNTIME, ".vibe/plan.md": plan("commit"), [SKILL]: SKELETON }));
    expect(problems).toHaveLength(HEADINGS.length);
    const line = SKELETON.split("\n").findIndex((text) => text.includes("<!-- FILL IN:")) + 1;
    expect(problems?.[0]?.where).toBe(`${SKILL}:${line} (## ${HEADINGS[0]})`);
  });

  test("a filled guide passes in Commit", () => {
    expect(run(app({ "package.json": RUNTIME, ".vibe/plan.md": plan("commit"), [SKILL]: FILLED }))).toEqual([]);
  });
});
