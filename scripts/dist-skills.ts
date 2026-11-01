// The skills of this package for `skills experimental_sync`, which reads dist/skills/<name>/SKILL.md, one level deep:
// skills/<group>/<name>/ (process, tooling, content, archetypes) copied flat to dist/skills/<name>/. The source
// folders stay as they are; `lernapps update` and the exports of package.json read them.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const source = "skills";
const target = join("dist", "skills");
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
for (const group of readdirSync(source, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  for (const skill of readdirSync(join(source, group.name), { withFileTypes: true })) {
    const from = join(source, group.name, skill.name);
    if (!skill.isDirectory() || !existsSync(join(from, "SKILL.md"))) continue;
    if (existsSync(join(target, skill.name))) throw new Error(`two skills are named ${skill.name}`);
    cpSync(from, join(target, skill.name), { recursive: true });
  }
}
