// The content guide of an app from an archetype's template: the app-local skill .agents/skills/app-content/SKILL.md,
// which the generator writes as a skeleton and the assistant fills once the creator has confirmed the plan. It needs
// the app's repo. It checks an app built with the tooling: one with a plan file (.vibe/plan.md) that depends on the
// runtime @lernapps/app-templates; a template of app-templates (no plan), the tooling and a site are left out.
// Whether the guide says what was built is judged by the review (app-content-matches), not here.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { Check, Problem } from "../check.ts";

/** The guide, relative to the app's root. */
export const SKILL = ".agents/skills/app-content/SKILL.md";

/** Its fixed level-2 headings, in order: the skeleton has them, and a follow-up agent finds each part by them. */
export const HEADINGS = [
  "Curriculum",
  "Competencies",
  "Content structure",
  "Terminology",
  "Exercise patterns",
  "Figures",
  "Sources",
  "Adding a chapter or round",
  "Rules learned from mistakes",
] as const;

/** A placeholder of the skeleton: an HTML comment that starts with "FILL IN:". */
const PLACEHOLDER = "<!-- FILL IN:";

const RUNTIME = "@lernapps/app-templates";

interface Manifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** The `phase` of the plan's front matter; undefined when there is no plan file with front matter. */
function phase(project: string): string | undefined {
  const plan = join(project, ".vibe/plan.md");
  if (!existsSync(plan)) return undefined;
  const match = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(plan, "utf8"));
  if (!match) return undefined;
  try {
    const front: unknown = parse(match[1] ?? "");
    const value = typeof front === "object" && front !== null ? (front as { phase?: unknown }).phase : undefined;
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
}

export default {
  id: "app-content-guide",
  url: "https://lernapps.net/tooling/rules/#app-content-guide",
  description:
    "The app's content guide .agents/skills/app-content/SKILL.md exists with its fixed headings, and has no placeholder left once the plan is in Commit.",
  severity: "error",
  run: ({ project }) => {
    if (project === undefined || !existsSync(join(project, "package.json"))) return undefined;
    const manifest = JSON.parse(readFileSync(join(project, "package.json"), "utf8")) as Manifest;
    const fromTemplate = { ...manifest.dependencies, ...manifest.devDependencies }[RUNTIME] !== undefined;
    const current = phase(project);
    if (!fromTemplate || current === undefined) return undefined;

    const file = join(project, SKILL);
    if (!existsSync(file)) {
      return [
        {
          where: SKILL,
          found: "the app has no content guide",
          fix: "Add the skeleton with npx --yes github:lernapps/tooling#main update, then fill it in from the plan as its comments say",
        },
      ];
    }
    const lines = readFileSync(file, "utf8").split("\n");
    const problems: Problem[] = HEADINGS.filter((heading) => !lines.includes(`## ${heading}`)).map((heading) => ({
      where: SKILL,
      found: `the heading "## ${heading}" is missing`,
      fix: `Keep the fixed headings of the skeleton: ${HEADINGS.map((name) => `"## ${name}"`).join(", ")}`,
    }));
    // The app has content once the Code phase is done: its own question bank (quiz) or chapters (explainer) are
    // built and checked in place of the generated example, and the plan moves to Commit to publish them.
    if (current !== "commit") return problems;
    let section = "";
    lines.forEach((line, index) => {
      if (line.startsWith("## ")) section = line;
      if (!line.includes(PLACEHOLDER)) return;
      problems.push({
        where: `${SKILL}:${index + 1}${section === "" ? "" : ` (${section})`}`,
        found: "a placeholder is left, but the app has content (the plan is in Commit)",
        fix: "Replace it with precise, concrete instructions for this app, from the confirmed plan and what was built: name files, ids, data files and an example",
      });
    });
    return problems;
  },
} satisfies Check;
