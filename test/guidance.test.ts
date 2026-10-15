// The contract of the process guidance (guidance/, skills/), as its consumers rely on it:
//   - the hooks (pre-push) and the review read the plan's front matter; it validates against the exported schema;
//   - the review and the evals read the retrospective; its sections are in every plan started from the template;
//   - the generator copies AGENTS.md and the template; what AGENTS.md points to exists in the package.
// How an assistant behaves with these files is checked by hand (the evals), not here.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { frontMatter, frontMatterErrors, headings } from "./plan.ts";
import { repoRoot } from "./support.ts";

const file = (path: string) => join(repoRoot, path);
const read = (path: string) => readFileSync(file(path), "utf8");

const SCHEMA = "guidance/plan-front-matter.v1.schema.json";
const TEMPLATE = "guidance/plan-template.md";
const INCREMENT = "guidance/increment-template.md";
const TEMPLATES = [TEMPLATE, INCREMENT];
const AGENTS = "guidance/AGENTS.md";
const SKILL = "skills/lernapps-app/SKILL.md";
const fixture = (name: string) => `test/fixtures/plans/${name}.md`;
/** A level-2 section of a plan, up to the next one. */
const section = (plan: string, heading: string) => plan.slice(plan.indexOf(`\n${heading}\n`)).split(/\n## /)[1] ?? "";

/** The sections every plan has, in this order: the phases, then the retrospective with its parts. */
const PLAN_SECTIONS = ["## Explore", "## Plan", "## Code", "## Commit", "## Retrospective"];
const RETROSPECTIVE_SECTIONS = [
  "### Phases reached",
  "### Failed checks",
  "### Creator turns after the plan",
  "### Where I had to guess",
];

describe("the plan's front matter", () => {
  test.each(TEMPLATES)("of %s validates against the schema", (template) => {
    expect(frontMatterErrors(file(SCHEMA), file(template))).toEqual([]);
  });

  test.each(TEMPLATES)("of %s starts in Explore, without an archetype, with no failed pre-push runs", (template) => {
    expect(frontMatter(read(template))).toEqual({ archetype: null, phase: "explore", prePushFailures: 0 });
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
  test.each([...TEMPLATES, fixture("filled")])("%s has the phases and the retrospective, in order", (plan) => {
    const level2 = headings(read(plan)).filter((heading) => PLAN_SECTIONS.includes(heading));
    expect(level2).toEqual(PLAN_SECTIONS);
  });

  test.each([...TEMPLATES, fixture("filled")])("%s has every section the retrospective needs", (plan) => {
    const all = headings(read(plan));
    const retrospective = all.slice(all.indexOf("## Retrospective"));
    expect(retrospective).toEqual(expect.arrayContaining(RETROSPECTIVE_SECTIONS));
  });

  test.each(TEMPLATES)("%s marks the creator's checkpoints: research, confirm the plan, publish, list", (template) => {
    const checkpoints = read(template)
      .split("\n")
      .filter((line) => line.includes("**Checkpoint:**"));
    expect(checkpoints).toHaveLength(4);
    expect(checkpoints.join("\n")).toMatch(/research[\s\S]*confirm[\s\S]*publish[\s\S]*list/i);
  });

  test("the first publish starts the workflow the generator writes, also when GitHub starts no run for the push", () => {
    // pages.yml has no paths filter (its actions skip a push of only .vibe/), but a push that creates main from
    // commits GitHub already has may still start no run: the template has the run started by hand, as a safety net
    const workflow = parse(read("generator/app/.github/workflows/pages.yml")) as {
      name: string;
      on: Record<string, unknown>;
    };
    expect(workflow.name).toBe("Pages");
    expect(workflow.on).toHaveProperty("workflow_dispatch");
    expect(JSON.stringify(workflow.on)).not.toContain("paths");
    const commit = section(read(TEMPLATE), "## Commit");
    expect(commit).toContain("gh run list --workflow Pages --branch main --commit");
    expect(commit).toContain("gh workflow run Pages --ref main");
  });

  test("the template pushes the plan with the filled retrospective before the listing pull request", () => {
    // the listing check (retrospective-filled) and the maintainer's review read .vibe/plan.md in the app's repo
    const tasks = section(read(TEMPLATE), "## Commit").split("\n- [ ] ");
    const at = (text: string) => tasks.findIndex((task) => task.includes(text));
    expect(at("Fill the retrospective")).toBeGreaterThan(0);
    expect(at("Commit this plan on `main` and push it")).toBe(at("Fill the retrospective") + 1);
    expect(at("Open the listing pull request")).toBeGreaterThan(at("Commit this plan on `main` and push it"));
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

  test("leaves the branch to push to the current plan: each template names its own", () => {
    expect(read(AGENTS)).toContain("Push only the branch the current plan names");
    expect(read(TEMPLATE)).toContain("Work on the branch `work`");
    expect(read(INCREMENT)).toContain("Work on the branch `increment/<NN>-<short name>`");
  });

  test("points to the plans, both templates and the skill, which exist in the package", () => {
    const agents = read(AGENTS);
    expect(agents).toContain(".vibe/plans/<NN>-<short name>.md");
    expect(agents).toContain("@lernapps/tooling/guidance/");
    for (const template of TEMPLATES) {
      expect(agents).toContain(template.replace("guidance/", "`") + "`");
      expect(read(template)).toMatch(/^---\n/);
    }
    expect(agents).toContain("lernapps-app");
    expect(read(SKILL)).toMatch(/^---\nname: lernapps-app\n/);
  });
});

describe("the skills", () => {
  // Names in backticks after "skill": `lernapps-app`; the "Not installed" hint names a repo, not a skill.
  const named = (text: string) => [...text.matchAll(/skills? `([a-z][a-z0-9-]*)`/g)].map((match) => match[1]);
  const skills = readdirSync(file("skills"));

  test.each([TEMPLATE, AGENTS, ...skills.map((name) => `skills/${name}/SKILL.md`)])(
    "every skill %s names exists, with its name, and a consumer can resolve it",
    (path) => {
      const exports = (JSON.parse(read("package.json")) as { exports: Record<string, string> }).exports;
      for (const name of named(read(path))) {
        expect(skills, `${path} names the skill ${name}`).toContain(name);
        expect(read(`skills/${name}/SKILL.md`)).toMatch(new RegExp(`^---\\nname: ${name}\\n`));
        expect(exports, `package.json exports ${name}`).toHaveProperty(`./skills/${name}/SKILL.md`);
      }
    },
  );

  test("the listing skill points to the entry schema and the catalog's listing guide instead of repeating them", () => {
    const skill = read("skills/lernapps-listing/SKILL.md");
    expect(skill).toContain("https://lernapps.net/apps/schemas/entry.v1.schema.json");
    expect(skill).toContain("https://lernapps.net/apps/llms.txt");
    for (const field of ["grades", "thirdParty", "keywords", "topics"]) expect(skill).not.toContain(field);
  });
});
