// The contract of the process guidance (guidance/, skills/), as its consumers rely on it:
//   - the hooks (pre-push) and the review read the plan's front matter; it validates against the exported schema;
//   - the review and the evals read the retrospective; its sections are in every plan started from the template;
//   - the generator copies AGENTS.md and the template; what AGENTS.md points to exists in the package.
// How an assistant behaves with these files is checked by hand (the evals), not here.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { frontMatter, frontMatterErrors, headings } from "./plan.ts";
import { repoRoot } from "./support.ts";

const file = (path: string) => join(repoRoot, path);
const read = (path: string) => readFileSync(file(path), "utf8");

const SCHEMA = "guidance/plan-front-matter.v1.schema.json";
const TEMPLATE = "guidance/plan-template.md";
const AGENTS = "guidance/AGENTS.md";
const SKILL = "skills/lernapps-app/SKILL.md";
const fixture = (name: string) => `test/fixtures/plans/${name}.md`;

/** The sections every plan has, in this order: the phases, then the retrospective with its parts. */
const PLAN_SECTIONS = ["## Explore", "## Plan", "## Code", "## Commit", "## Retrospective"];
const RETROSPECTIVE_SECTIONS = [
  "### Phases reached",
  "### Failed checks",
  "### Creator turns after the plan",
  "### Where I had to guess",
];

describe("the plan's front matter", () => {
  test("of the template validates against the schema", () => {
    expect(frontMatterErrors(file(SCHEMA), file(TEMPLATE))).toEqual([]);
  });

  test("of the template starts in Explore, without an archetype, with no failed pre-push runs", () => {
    expect(frontMatter(read(TEMPLATE))).toEqual({ archetype: null, phase: "explore", prePushFailures: 0 });
  });

  test("of a filled plan validates against the schema", () => {
    expect(frontMatterErrors(file(SCHEMA), file(fixture("filled")))).toEqual([]);
  });

  test.each([
    [
      "without the counter of the hooks",
      "missing-counter",
      "front matter must have required property 'prePushFailures'",
    ],
    ["in Code without an archetype", "code-without-archetype", "front matter/archetype must be string"],
    [
      "with an unknown phase",
      "unknown-phase",
      "front matter/phase must be equal to one of the allowed values: explore",
    ],
    ["with a misspelt key", "misspelt-key", "front matter must NOT have additional properties: prepushFailures"],
  ])("of a plan %s fails with a message naming the problem", (_name, plan, message) => {
    expect(frontMatterErrors(file(SCHEMA), file(fixture(plan))).join("\n")).toContain(message);
  });
});

describe("the plan's sections", () => {
  test.each([TEMPLATE, fixture("filled")])("%s has the phases and the retrospective, in order", (plan) => {
    const level2 = headings(read(plan)).filter((heading) => PLAN_SECTIONS.includes(heading));
    expect(level2).toEqual(PLAN_SECTIONS);
  });

  test.each([TEMPLATE, fixture("filled")])("%s has every section the retrospective needs", (plan) => {
    const all = headings(read(plan));
    const retrospective = all.slice(all.indexOf("## Retrospective"));
    expect(retrospective).toEqual(expect.arrayContaining(RETROSPECTIVE_SECTIONS));
  });

  test("the template marks the creator's checkpoints: confirm the plan, publish, list", () => {
    const checkpoints = read(TEMPLATE)
      .split("\n")
      .filter((line) => line.includes("**Checkpoint:**"));
    expect(checkpoints).toHaveLength(3);
    expect(checkpoints.join("\n")).toMatch(/confirm[\s\S]*publish[\s\S]*list/i);
  });

  test("the template asks to fetch the entry schema instead of repeating its fields", () => {
    const template = read(TEMPLATE);
    expect(template).toContain("https://lernapps.net/apps/schemas/entry.v1.schema.json");
    for (const field of ["grades", "fitness", "thirdParty", "keywords"]) expect(template).not.toContain(field);
  });
});

describe("AGENTS.md", () => {
  test("stays short: it is loaded in every turn", () => {
    expect(read(AGENTS).split(/\s+/).length).toBeLessThanOrEqual(350);
  });

  test("points to the plan file, the template and the skill, which exist in the package", () => {
    const agents = read(AGENTS);
    expect(agents).toContain(".vibe/plan.md");
    expect(agents).toContain("@lernapps/tooling/guidance/plan-template.md");
    expect(agents).toContain("lernapps-app");
    expect(read(SKILL)).toMatch(/^---\nname: lernapps-app\n/);
  });
});
