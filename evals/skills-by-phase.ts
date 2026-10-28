// The skills the guidance expects in each phase of the plan, from the architecture at the guidance commit a job ran
// with: every building block of a skill (a child of `bb-skills-<phase>`) with its `x-phase` and its folder (`path`).
// evals/harbor/run.sh writes it into the job as skills-by-phase.json; evals/score-transcript.ts scores the loads of
// the skills against it (A2). An architecture without phases for its skills gives no phases, and no score.
//   node evals/skills-by-phase.ts <commit> <out.json>
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface Element {
  id: string;
  parent?: string;
  path?: string;
  extensions?: Record<string, string>;
}

export interface SkillsByPhase {
  guidanceCommit: string;
  /** Phase → the names of the skills the guidance loads in it. */
  phases: Record<string, string[]>;
  /** Skill → its archetype, for the skills in `skills/archetypes/` (`lernapps-<archetype>` and `-design`). */
  archetypes: Record<string, string>;
}

/** The skills by phase and the archetype skills, from the elements `arc42 get` reports. */
export function skillsByPhase(elements: Element[]): Omit<SkillsByPhase, "guidanceCommit"> {
  const phases: Record<string, string[]> = {};
  const archetypes: Record<string, string> = {};
  for (const element of elements) {
    if (!element.parent?.startsWith("bb-skills-") || !element.path) continue;
    const name = basename(element.path);
    for (const phase of (element.extensions?.["phase"] ?? "").split(",").map((p) => p.trim())) {
      if (phase) (phases[phase] ??= []).push(name);
    }
    if (element.path.startsWith("skills/archetypes/")) archetypes[name] = /^lernapps-([a-z]+)/.exec(name)?.[1] ?? name;
  }
  return { phases, archetypes };
}

/** The elements of docs/arc42 at a commit of this repo (fetched from origin when it is not here). */
export function elementsAt(commit: string): Element[] {
  const git = (...args: string[]) => execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" });
  try {
    git("cat-file", "-e", `${commit}^{commit}`);
  } catch {
    git("fetch", "--quiet", "origin", commit);
  }
  const dir = mkdtempSync(join(tmpdir(), "skills-by-phase-"));
  try {
    execFileSync("sh", ["-c", `git -C "$0" archive "$1" docs/arc42 | tar -x -C "$2"`, ROOT, commit, dir]);
    const json = execFileSync(
      join(ROOT, "node_modules/.bin/arc42"),
      ["--dir", join(dir, "docs/arc42"), "get", "--format", "json"],
      {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      },
    );
    return (JSON.parse(json) as { elements: Element[] }).elements;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [commit, out] = process.argv.slice(2);
  if (!commit || !out) {
    process.stderr.write("usage: node evals/skills-by-phase.ts <commit> <out.json>\n");
    process.exit(2);
  }
  const result: SkillsByPhase = { guidanceCommit: commit, ...skillsByPhase(elementsAt(commit)) };
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
}
