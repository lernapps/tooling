// The architecture of an interactive app (docs/arc42/, in the arc42 DSL of @doctc/arc42): `lernapps create` and
// `lernapps update` copy the generic part of lernapps/app-templates (docs/arc42/) with the archetype's extension
// (<archetype>/docs/arc42/) into the app, as a reference that `update` replaces, like the lernapps-* skills. They are
// combined as scripts/arc42.ts of app-templates combines them: a chapter's extension file is appended to the generic
// file of the same chapter (without its title), and the lines between `<!-- at the top of the generic chapter -->` and
// `<!-- end -->` go to the top of the combined chapter. The paths are rewritten for the app: a runtime block's
// (`runtime/...`) is in the untracked node_modules, which arc42 cannot resolve, so it becomes an ignore directive; a
// template block's loses the template's prefix (`interactive/src/core` → `src/core`). Every reference file carries
// REFERENCE in its second line. The app's own part is written into the app sections the extension marks
// (`<!-- app: begin core -->` … `<!-- app: end core -->`, a name per section of a chapter, none at a chapter's end),
// because arc42 wants a part in its parent's section and in a diagram of the same file: `update` replaces everything
// outside them and keeps each section verbatim. Only the archetypes in ARCHITECTURE_ARCHETYPES get an architecture.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Where an app keeps its architecture, and where app-templates keeps the generic part. */
export const ARCHITECTURE = join("docs", "arc42");
/** The archetypes whose apps get the architecture and its checks. */
export const ARCHITECTURE_ARCHETYPES: readonly string[] = ["interactive"];
/** The mark of a reference file, which `lernapps update` replaces outside its app sections. */
export const REFERENCE = "lernapps update replaces this file";
/** A marker of an app section: `<!-- app: begin <name> -->` or `<!-- app: end <name> -->`, the name optional. */
const APP_MARKER = /^<!-- app: (begin|end)(?: ([a-z0-9-]+))? -->$/;

/** The app's architecture cannot be replaced; the message says why and what to do. */
export class ArchitectureError extends Error {}

const TOP = "<!-- at the top of the generic chapter -->";
const END = "<!-- end -->";
const RUNTIME_PATH =
  "installed package @lernapps/app-templates (arc42 cannot resolve untracked paths, docToolchain/arc42-language#128)";

const chapterFiles = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((name) => /^\d{2}-.*\.arc42\.md$/.test(name))
        .sort()
    : [];

/** The lines of a file, without the trailing newline. */
const linesOf = (file: string) => readFileSync(file, "utf8").replace(/\n$/, "").split("\n");

/**
 * The paths of the blocks and interfaces, for the app: `path: runtime/...` becomes an ignore directive (H014, the
 * missing path) before the element; `path: <archetype>/...` loses the prefix.
 */
export function rewritePaths(lines: readonly string[], archetype: string): string[] {
  const out: string[] = [];
  let element: string[] | undefined;
  for (const line of lines) {
    if (element === undefined) {
      if (line === ":::building-block" || line === ":::interface") element = [line];
      else out.push(line);
      continue;
    }
    if (line !== ":::") {
      element.push(line);
      continue;
    }
    const path = element.find((text) => text.startsWith("path: "))?.slice("path: ".length);
    if (path !== undefined && (path === "runtime" || path.startsWith("runtime/"))) {
      // an element without a path shares none: its directive for a path two elements share (H020) would be stale
      if (out.at(-1) === ":::" && out.at(-2)?.startsWith(":::ignore H020 ")) out.splice(-2, 2);
      out.push(`:::ignore H014 ${RUNTIME_PATH}`, ":::", ...element.filter((text) => !text.startsWith("path: ")));
    } else if (path?.startsWith(`${archetype}/`)) {
      out.push(
        ...element.map((text) => (text === `path: ${path}` ? `path: ${path.slice(archetype.length + 1)}` : text)),
      );
    } else {
      out.push(...element);
    }
    out.push(line);
    element = undefined;
  }
  if (element !== undefined) out.push(...element);
  return out;
}

/** The combined chapters of the generic part and `archetype`'s extension in a checkout of app-templates, by name. */
export function combine(templates: string, archetype: string, commit: string): Map<string, string> {
  const generic = join(templates, ARCHITECTURE);
  const extension = join(templates, archetype, ARCHITECTURE);
  const chapters = new Map<string, string>();
  for (const name of chapterFiles(generic)) {
    const lines: string[] = [];
    const top: string[] = [];
    const add = (file: string, own: boolean) => {
      let atTop = false;
      linesOf(file).forEach((text, index) => {
        if (own && index === 0 && text.startsWith("# ")) return;
        if (own && text === TOP) atTop = true;
        if (atTop) {
          if (text === END) atTop = false;
          else if (text !== TOP) top.push(text);
          return;
        }
        lines.push(text);
      });
    };
    add(join(generic, name), false);
    for (const own of chapterFiles(extension).filter((candidate) => candidate.slice(0, 3) === name.slice(0, 3))) {
      lines.push("");
      add(join(extension, own), true);
    }
    const mark = `<!-- From @lernapps/app-templates ${commit.slice(0, 7)} (the generic part and the ${archetype} extension): ${REFERENCE} except the app sections, between <!-- app: begin … --> and <!-- app: end … -->, which hold the app's own architecture. -->`;
    lines.splice(1, 0, "", mark, ...(top.length > 0 ? ["", ...top] : []));
    chapters.set(name, `${rewritePaths(lines, archetype).join("\n")}\n`);
  }
  return chapters;
}

/** The reference files of the app's architecture: those that carry REFERENCE. */
export function referenceFiles(dir: string): string[] {
  const folder = join(dir, ARCHITECTURE);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => name.endsWith(".arc42.md"))
    .filter((name) => linesOf(join(folder, name)).slice(0, 4).join("\n").includes(REFERENCE))
    .sort();
}

/** Whether the app has the architecture from lernapps create or update, which its checks then validate. */
export const hasArchitecture = (dir = "."): boolean => referenceFiles(dir).length > 0;

/** The archetype whose extension the app's reference holds, as its mark names it; undefined without a reference. */
export function architectureArchetype(dir = "."): string | undefined {
  const [first] = referenceFiles(dir);
  if (first === undefined) return undefined;
  return /the generic part and the ([a-z-]+) extension/.exec(readFileSync(join(dir, ARCHITECTURE, first), "utf8"))?.[1];
}

/** The app sections of a file's lines, by name ("" for the unnamed one): the lines between their markers. */
export function appSections(lines: readonly string[]): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let open: string | undefined;
  for (const line of lines) {
    const marker = APP_MARKER.exec(line);
    if (marker?.[1] === "begin") {
      open = marker[2] ?? "";
      sections.set(open, []);
    } else if (marker?.[1] === "end") {
      open = undefined;
    } else if (open !== undefined) {
      sections.get(open)?.push(line);
    }
  }
  return sections;
}

/** The lines with each app section's content replaced by that of `sections`, where it has one. */
function fillSections(lines: readonly string[], sections: ReadonlyMap<string, readonly string[]>): string[] {
  const out: string[] = [];
  let open: string | undefined;
  for (const line of lines) {
    const marker = APP_MARKER.exec(line);
    if (marker?.[1] === "begin") {
      open = marker[2] ?? "";
      out.push(line, ...(sections.get(open) ?? []));
    } else if (marker?.[1] === "end") {
      open = undefined;
      out.push(line);
    } else if (open === undefined) {
      out.push(line);
    }
  }
  return out;
}

const sectionName = (file: string, name: string) => `${file}${name === "" ? " (at its end)" : ` (${name})`}`;

/**
 * Replaces the app's reference files with the combination of a checkout of app-templates, keeping the content of each
 * app section. It writes nothing when an app section with content has no place in the new reference (it would be
 * lost) and says so (ArchitectureError). What it did, as lines of the output.
 */
export function writeArchitecture(dir: string, templates: string, archetype: string, commit: string): string[] {
  const folder = join(dir, ARCHITECTURE);
  const before = new Map(referenceFiles(dir).map((name) => [name, readFileSync(join(folder, name), "utf8")]));
  const kept = new Map([...before].map(([name, text]) => [name, appSections(text.replace(/\n$/, "").split("\n"))]));
  const chapters = new Map(
    [...combine(templates, archetype, commit)].map(([name, text]) => {
      const lines = text.replace(/\n$/, "").split("\n");
      return [name, { lines, sections: appSections(lines) }] as const;
    }),
  );
  const lost = [...kept].flatMap(([name, sections]) =>
    [...sections]
      .filter(
        ([section, lines]) => lines.some((line) => line.trim() !== "") && !chapters.get(name)?.sections.has(section),
      )
      .map(([section]) => sectionName(name, section)),
  );
  if (lost.length > 0) {
    throw new ArchitectureError(
      `the reference of app-templates ${commit.slice(0, 7)} has no place for the app sections ${lost.join(", ")}: nothing was replaced. Move their content into an app section the new reference has (compare with ${archetype}/${ARCHITECTURE}/ of app-templates at that commit), then run it again`,
    );
  }
  for (const name of before.keys()) rmSync(join(folder, name));
  mkdirSync(folder, { recursive: true });
  let changed = 0;
  for (const [name, { lines }] of chapters) {
    const text = `${fillSections(lines, kept.get(name) ?? new Map()).join("\n")}\n`;
    writeFileSync(join(folder, name), text);
    if (before.get(name) !== text) changed++;
  }
  const removed = [...before.keys()].filter((name) => !chapters.has(name)).length;
  return changed + removed === 0
    ? []
    : [
        `architecture: ${ARCHITECTURE}/ has the reference of app-templates ${commit.slice(0, 7)} (${chapters.size} chapters, the generic part and the ${archetype} extension), with the app's own sections as they were`,
      ];
}
