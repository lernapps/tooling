// The contract of the process guidance (guidance/, skills/), as its consumers rely on it:
//   - the hooks (pre-push) and the review read the plan's front matter; it validates against the exported schema;
//   - the review and the evals read the retrospective; its sections are in every plan started from the template;
//   - the generator copies AGENTS.md and the template; what AGENTS.md points to exists in the package.
// How an assistant behaves with these files is checked by hand (the evals), not here.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
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
const PHASES = ["Explore", "Plan", "Code", "Commit"] as const;
const fixture = (name: string) => `test/fixtures/plans/${name}.md`;
/** A level-2 section of a plan, up to the next one. */
const section = (plan: string, heading: string) => plan.slice(plan.indexOf(`\n${heading}\n`)).split(/\n## /)[1] ?? "";

/** The sections every plan has, in this order: the phases, then the retrospective with its parts. */
const PLAN_SECTIONS = ["## Explore", "## Plan", "## Code", "## Commit", "## Retrospective"];
const RETROSPECTIVE_SECTIONS = ["### Phases reached", "### Creator turns after the plan", "### Where I had to guess"];

describe("the plan's front matter", () => {
  test.each(TEMPLATES)("of %s validates against the schema", (template) => {
    expect(frontMatterErrors(file(SCHEMA), file(template))).toEqual([]);
  });

  test.each(TEMPLATES)("of %s starts in Explore, without an archetype, with no failed runs", (template) => {
    expect(frontMatter(read(template))).toEqual({
      archetype: null,
      phase: "explore",
      prePushFailures: 0,
      failedChecks: {},
    });
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
    // commits GitHub already has may still start no run: the skill of Commit has the run started by hand, as a
    // safety net
    const workflow = parse(read("generator/app/.github/workflows/pages.yml")) as {
      name: string;
      on: Record<string, unknown>;
    };
    expect(workflow.name).toBe("Pages");
    expect(workflow.on).toHaveProperty("workflow_dispatch");
    expect(JSON.stringify(workflow.on)).not.toContain("paths");
    const github = read("skills/process/lernapps-github/SKILL.md");
    expect(github).toContain("gh run list --workflow Pages --branch main --commit");
    expect(github).toContain("gh workflow run Pages --ref main");
  });

  test("the GitHub setup creates main, gh-pages and work and the Pages source before the app is pushed", () => {
    // the first push sets the default branch; Pages from gh-pages from the start lets the first publish deploy
    const setup = read("skills/process/lernapps-github-setup/SKILL.md");
    const at = (text: string) => setup.indexOf(text);
    expect(at("git switch --orphan main")).toBeGreaterThan(0);
    expect(at("git switch --orphan gh-pages")).toBeGreaterThan(at("git push -u origin main"));
    expect(at("git switch -c work main")).toBeGreaterThan(at("git push -u origin main"));
    expect(setup).toContain("pages-from-gh-pages");
    expect(setup).toContain("https://lernapps.net/tooling/github/");
    // GraphQL may be blocked where the assistant runs: guidance and skills use REST (gh api) for writes
    for (const path of [TEMPLATE, INCREMENT, "skills/process/lernapps-github/SKILL.md"]) {
      expect(read(path), path).not.toMatch(/gh repo (view|edit)|gh pr (create|ready)/);
    }
    expect(section(read(TEMPLATE), "## Code")).toContain("skill `lernapps-github-setup`");
  });

  test("the template pushes the plan with the filled retrospective before the listing pull request", () => {
    // the listing check (retrospective-filled) and the maintainer's review read the current plan in the app's repo
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

  test("points to the plans and both templates, which exist in the package", () => {
    const agents = read(AGENTS);
    expect(agents).toContain(".vibe/plans/<NN>-<short name>.md");
    expect(agents).toContain("@lernapps/tooling/guidance/");
    for (const template of TEMPLATES) {
      expect(agents).toContain(template.replace("guidance/", "`") + "`");
      expect(read(template)).toMatch(/^---\n/);
    }
  });
});

describe("the skills", () => {
  // Names in backticks after "skill": `lernapps-app`; the "Not installed" hint names a repo, not a skill.
  const named = (text: string) => [...text.matchAll(/skills?\s+`([a-z][a-z0-9-]*)`/g)].map((match) => match[1]);
  /** Each skill's folder below skills/, by name: skills/<group>/<name>/. */
  const folders = new Map(
    readdirSync(file("skills")).flatMap((group) =>
      readdirSync(file(`skills/${group}`)).map((name) => [name, `skills/${group}/${name}`] as const),
    ),
  );
  const skills = [...folders.keys()];
  const folder = (name: string) => folders.get(name) ?? `skills/?/${name}`;
  /** The files of a skill besides its SKILL.md, relative to its folder, e.g. references/platform-rules.md. */
  const filesOf = (name: string) =>
    readdirSync(file(folder(name)), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) =>
        relative(file(folder(name)), join(entry.parentPath, entry.name))
          .split("\\")
          .join("/"),
      )
      .filter((path) => path !== "SKILL.md");
  const exported = () => (JSON.parse(read("package.json")) as { exports: Record<string, string> }).exports;
  const description = (name: string) => /^description: (.*)$/m.exec(read(`${folder(name)}/SKILL.md`))?.[1] ?? "";

  test("the skills are grouped by what they hold: process, tooling, content, archetypes", () => {
    expect(readdirSync(file("skills")).sort()).toEqual(["archetypes", "content", "process", "tooling"]);
  });

  test.each(skills)("the skill %s links each of its files from SKILL.md and exports them", (name) => {
    // progressive disclosure (agentskills.io): SKILL.md is the entry and links the files an assistant reads on demand
    const skill = read(`${folder(name)}/SKILL.md`);
    const links = [...skill.matchAll(/\]\(([^)#\s]+)\)/g)]
      .map((match) => match[1] ?? "")
      .filter((link) => !/^[a-z]+:/.test(link));
    for (const link of links) expect(existsSync(file(`${folder(name)}/${link}`)), `${name} links ${link}`).toBe(true);
    for (const path of filesOf(name)) {
      expect(links, `SKILL.md of ${name} links ${path}`).toContain(path);
      expect(exported(), `package.json exports ${name}/${path}`).toHaveProperty(`./${folder(name)}/${path}`);
    }
  });

  test.each(skills)("the skill %s belongs to one phase: its description starts with when, in that phase", (name) => {
    // skills are found by their description (agentskills.io): it says first when the skill is needed
    expect(description(name)).toMatch(/^Use (?:at the start of |right after |)in (Explore|Plan|Code|Commit)\b/);
    expect(description(name).length).toBeLessThanOrEqual(1024);
  });

  test.each(TEMPLATES)("%s loads each skill in the phase its description names", (template) => {
    const plan = read(template);
    for (const phase of PHASES) {
      for (const name of named(section(plan, `## ${phase}`))) {
        const skill = name ?? "";
        if (!skills.includes(skill)) continue; // a name that is no skill: the next test fails on it
        expect(description(skill), `${template}: ${phase} names ${name}`).toMatch(new RegExp(`^Use .*?in ${phase}\\b`));
      }
    }
  });

  test.each([
    TEMPLATE,
    INCREMENT,
    AGENTS,
    ...skills.flatMap((name) => ["SKILL.md", ...filesOf(name)].map((path) => `${folder(name)}/${path}`)),
  ])("every skill %s names exists, with its name, and a consumer can resolve it", (path) => {
    const exports = exported();
    for (const name of named(read(path))) {
      if (name === undefined) continue;
      expect(skills, `${path} names the skill ${name}`).toContain(name);
      expect(read(`${folder(name)}/SKILL.md`)).toMatch(new RegExp(`^---\\nname: ${name}\\n`));
      expect(exports, `package.json exports ${name}`).toHaveProperty(`./${folder(name)}/SKILL.md`);
    }
  });

  test("the plan template installs every skill but the archetypes' at the start, and those at the end of Explore", () => {
    const explore = section(read(TEMPLATE), "## Explore");
    const [base, archetype] = [...explore.matchAll(/npx --yes skills add[\s\S]*?`/g)].map((match) => match[0]);
    const groups = (...names: string[]) =>
      skills.filter((name) => names.includes(folder(name).split("/")[1] ?? "")).sort();
    expect(
      [...(base ?? "").matchAll(/lernapps-[a-z-]+/g)]
        .map((match) => match[0])
        .filter((name) => skills.includes(name))
        .sort(),
    ).toEqual(groups("process", "tooling", "content"));
    expect(archetype).toContain("lernapps-<archetype>-plan lernapps-<archetype>");
    for (const name of groups("archetypes")) expect(name).toMatch(/^lernapps-(quiz|explainer|interactive)(-plan)?$/);
  });

  test("the listing skill points to the entry schema and the catalog's listing guide instead of repeating them", () => {
    const skill = read("skills/process/lernapps-listing/SKILL.md");
    expect(skill).toContain("https://lernapps.net/apps/schemas/entry.v1.schema.json");
    expect(skill).toContain("https://lernapps.net/apps/enter/llms.txt");
    for (const field of ["grades", "thirdParty", "keywords", "topics"]) expect(skill).not.toContain(field);
  });
});
