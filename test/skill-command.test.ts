// `lernapps skill`: an assistant gets a skill of the app whole (src/skill-command.ts). In a manual eval the harness
// offered the skills only after init, the assistant never used its skill tool and read three skills only to line 80,
// missing a step that stood below. The command prints the file to its last line and lists what is there.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import { appSkills, describeSkills, skillDescription } from "../src/skill-command.ts";
import { repoRoot, run, tempDir } from "./support.ts";

const cli = join(repoRoot, "src/cli.ts");
const source = (path: string) => readFileSync(join(repoRoot, "skills", path), "utf8");

/** An app's folder with two skills of this repository, as init installs them. */
function app(): string {
  const dir = tempDir("skill-command");
  for (const [name, from] of [
    ["lernapps-app", "process/lernapps-app"],
    ["lernapps-explainer", "archetypes/lernapps-explainer"],
  ] as const) {
    mkdirSync(join(dir, ".agents/skills", name, "references"), { recursive: true });
    writeFileSync(join(dir, ".agents/skills", name, "SKILL.md"), source(`${from}/SKILL.md`));
  }
  writeFileSync(
    join(dir, ".agents/skills/lernapps-explainer/references/blocks.md"),
    source("archetypes/lernapps-explainer/references/blocks.md"),
  );
  return dir;
}
const skill = (dir: string, ...args: string[]) => run("node", [cli, "skill", ...args], dir);

describe("lernapps skill", () => {
  test("prints a skill complete and unchanged, to its last line", () => {
    const printed = skill(app(), "lernapps-explainer");
    expect(printed.code).toBe(0);
    expect(printed.stdout).toBe(source("archetypes/lernapps-explainer/SKILL.md"));
  });

  test("prints a file of a skill by its path in the skill's folder", () => {
    const printed = skill(app(), "lernapps-explainer", "references/blocks.md");
    expect(printed.stdout).toBe(source("archetypes/lernapps-explainer/references/blocks.md"));
  });

  test("without a name lists the skills with their descriptions and says how to read one", () => {
    const dir = app();
    const listed = skill(dir).stdout;
    expect(listed).toContain("npx --no -- lernapps skill <name>");
    expect(listed).toContain("- lernapps-app: Use in Explore, when a creator wants a learning app");
    expect(listed).toBe(describeSkills(dir));
    expect(appSkills(dir).map((entry) => entry.name)).toEqual(["lernapps-app", "lernapps-explainer"]);
  });

  test("an unknown skill names the skills there are; an unknown file the files of the skill", () => {
    const dir = app();
    const unknown = skill(dir, "lernapps-quiz");
    expect(unknown.code).toBe(1);
    expect(unknown.stderr).toContain("There are: lernapps-app, lernapps-explainer");
    const missing = skill(dir, "lernapps-explainer", "references/rules.md");
    expect(missing.code).toBe(1);
    expect(missing.stderr).toContain("It has: SKILL.md, references/blocks.md");
  });

  test("a path out of the skill's folder is refused", () => {
    const outside = skill(app(), "lernapps-explainer", "../lernapps-app/SKILL.md");
    expect(outside.code).toBe(1);
    expect(outside.stdout).toBe("");
  });

  test("the description is the line of the front matter, whatever follows it", () => {
    expect(
      skillDescription("---\nname: x\ndescription: Use in Code when a page fails.\nlicense: MIT\n---\n# X\n"),
    ).toBe("Use in Code when a page fails.");
    expect(skillDescription("# no front matter\n")).toBe("");
  });
});
