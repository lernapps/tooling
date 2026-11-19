// `lernapps skill`: gives an assistant a skill of the app whole, whatever its harness does with skills.
//   skill                    lists the app's skills with their descriptions
//   skill <name>             prints the skill's SKILL.md, complete and unchanged
//   skill <name> <file>      prints a file of the skill, e.g. references/blocks.md
// A harness offers skills only if it found them when the session started, and an assistant that reads a skill as a
// plain file tends to read its first lines only. This command is the one way the plan and AGENTS.md name, so that a
// skill is read to its last line and the eval scoring sees which skill was loaded.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, normalize, sep } from "node:path";
import { UsageError } from "./usage.ts";

export const SKILL_USAGE = `Usage: lernapps skill [<name> [<file>]]

Prints a skill of this app, complete: the file .agents/skills/<name>/SKILL.md, or with <file> one of the skill's
other files, such as references/blocks.md. Without a name it lists the app's skills with their descriptions.

Options:
  -h, --help   print this help

Exit codes: 0 on success, 1 when the skill or the file is not there (the message names what is), 2 on a usage error.
`;

/** Where an app's skills are, relative to its root: what `lernapps init`, `skills` and `create` install and write. */
export const SKILLS = ".agents/skills";

/** The description in the front matter of a SKILL.md; empty when it has none. */
export const skillDescription = (markdown: string): string =>
  /^---\n[\s\S]*?^description:[ \t]*(.*)$[\s\S]*?^---$/m.exec(markdown)?.[1]?.trim() ?? "";

/** The skills in `root`, by name, each with its description. */
export function appSkills(root = "."): { name: string; description: string }[] {
  const folder = join(root, SKILLS);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => existsSync(join(folder, name, "SKILL.md")))
    .sort()
    .map((name) => ({ name, description: skillDescription(readFileSync(join(folder, name, "SKILL.md"), "utf8")) }));
}

const READ = "npx --no -- lernapps skill <name>";

/** The list of skills an assistant gets: one line per skill, and how to read one. `only` narrows it to those names. */
export function describeSkills(root = ".", only?: readonly string[]): string {
  const skills = appSkills(root).filter((skill) => only === undefined || only.includes(skill.name));
  if (skills.length === 0) return "";
  return [
    `You now have these skills. Read one when a task names it, whole, with: ${READ}`,
    ...skills.map((skill) => `- ${skill.name}: ${skill.description}`),
    "",
  ].join("\n");
}

export function skillCommand(args: string[], root = "."): number {
  if (args.includes("-h") || args.includes("--help")) {
    process.stdout.write(SKILL_USAGE);
    return 0;
  }
  const [name, file, ...rest] = args;
  if (rest.length > 0) throw new UsageError(`skill takes a name and at most one file, not ${args.join(" ")}`);
  if (name === undefined) {
    const list = describeSkills(root);
    process.stdout.write(list === "" ? "lernapps skill: this folder has no skills yet (.agents/skills/)\n" : list);
    return list === "" ? 1 : 0;
  }
  const names = appSkills(root).map((skill) => skill.name);
  if (!names.includes(name)) {
    process.stderr.write(
      `lernapps skill: no skill ${name} in ${SKILLS}/${names.length > 0 ? `. There are: ${names.join(", ")}` : ""}\n`,
    );
    return 1;
  }
  const folder = join(root, SKILLS, name);
  const path = normalize(file ?? "SKILL.md");
  const inside = !path.startsWith("..") && !path.startsWith(sep) && existsSync(join(folder, path));
  if (!inside || !statSync(join(folder, path)).isFile()) {
    const others = readdirSync(folder, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name).slice(folder.length + 1))
      .sort();
    process.stderr.write(`lernapps skill: ${name} has no file ${file ?? "SKILL.md"}. It has: ${others.join(", ")}\n`);
    return 1;
  }
  process.stdout.write(readFileSync(join(folder, path), "utf8"));
  return 0;
}
