// The architecture of an interactive app (docs/arc42/, in the arc42 DSL of @doctc/arc42): `lernapps create` and
// `lernapps update` copy the generic part of lernapps/app-templates (docs/arc42/) with the archetype's extension
// (<archetype>/docs/arc42/) into the app, as a reference that `update` replaces, like the lernapps-* skills. They are
// combined as scripts/arc42.ts of app-templates combines them: a chapter's extension file is appended to the generic
// file of the same chapter (without its title), and the lines between `<!-- at the top of the generic chapter -->` and
// `<!-- end -->` go to the top of the combined chapter. The paths are rewritten for the app: a runtime block's
// (`runtime/...`) is in the untracked node_modules, which arc42 cannot resolve, so it becomes an ignore directive; a
// template block's loses the template's prefix (`interactive/src/core` → `src/core`). Every reference file carries
// REFERENCE in its second line; the app's own part is in files of its own next to them (`app-*.arc42.md`), which
// `update` never touches. Only the archetypes in ARCHITECTURE_ARCHETYPES get an architecture.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Where an app keeps its architecture, and where app-templates keeps the generic part. */
export const ARCHITECTURE = join("docs", "arc42");
/** The archetypes whose apps get the architecture and its checks. */
export const ARCHITECTURE_ARCHETYPES: readonly string[] = ["interactive"];
/** The mark of a reference file, which `lernapps update` replaces. */
export const REFERENCE = "lernapps update replaces this file";

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
    const mark = `<!-- From @lernapps/app-templates ${commit.slice(0, 7)} (the generic part and the ${archetype} extension): ${REFERENCE}. The app's own architecture is in ${ARCHITECTURE}/app-*.arc42.md. -->`;
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

/**
 * Replaces the app's reference files with the combination of a checkout of app-templates; the app's own files stay.
 * What it did, as lines of the output.
 */
export function writeArchitecture(dir: string, templates: string, archetype: string, commit: string): string[] {
  const folder = join(dir, ARCHITECTURE);
  const before = new Map(referenceFiles(dir).map((name) => [name, readFileSync(join(folder, name), "utf8")]));
  for (const name of before.keys()) rmSync(join(folder, name));
  const chapters = combine(templates, archetype, commit);
  mkdirSync(folder, { recursive: true });
  for (const [name, text] of chapters) writeFileSync(join(folder, name), text);
  const changed = [...chapters].filter(([name, text]) => before.get(name) !== text).length;
  const removed = [...before.keys()].filter((name) => !chapters.has(name)).length;
  return changed + removed === 0
    ? []
    : [
        `architecture: ${ARCHITECTURE}/ has the reference of app-templates ${commit.slice(0, 7)} (${chapters.size} chapters, the generic part and the ${archetype} extension); the app's own files stay`,
      ];
}
