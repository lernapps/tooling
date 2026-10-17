// The architecture of an interactive app (generator/architecture.ts) on files alone, fast: the copy combines the
// generic part and the extension of app-templates chapter by chapter, rewrites the paths for the app (runtime blocks
// to an ignore directive, template blocks without the template's prefix) and marks each file as a reference; a second
// write (lernapps update) replaces everything outside the app sections and keeps each section verbatim, and writes
// nothing when a section with content has no place in the new reference. On the real templates: create.test.ts and
// create.e2e.test.ts.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import {
  ArchitectureError,
  architectureArchetype,
  hasArchitecture,
  REFERENCE,
  writeArchitecture,
} from "../generator/architecture.ts";
import { tempDir } from "./support.ts";

const COMMIT = "0123456789abcdef0123456789abcdef01234567";

/** A checkout of app-templates with one generic chapter and its interactive extension. */
function templates(extension: string): string {
  const dir = tempDir("architecture-templates");
  mkdirSync(join(dir, "docs/arc42"), { recursive: true });
  mkdirSync(join(dir, "interactive/docs/arc42"), { recursive: true });
  writeFileSync(
    join(dir, "docs/arc42/05-building-blocks.arc42.md"),
    "# Building Blocks\n\nGeneric.\n\n```arc42\n:::building-block\nid: bb-runtime\ntitle: Shared runtime\npath: runtime/shared\n:::\n```\n",
  );
  writeFileSync(join(dir, "interactive/docs/arc42/05-interactive-building-blocks.arc42.md"), extension);
  return dir;
}

const EXTENSION = [
  "# Building Blocks",
  "",
  "## Core",
  "",
  "```arc42",
  ":::ignore H020 shared with the state property",
  ":::",
  ":::interface",
  "id: if-core-contract",
  "path: runtime/interactive/contract.ts",
  ":::",
  ":::building-block",
  "id: bb-interactive-core",
  "path: interactive/src/core",
  ":::",
  "```",
  "",
  "<!-- app: begin core -->",
  "<!-- app: end core -->",
  "",
  "<!-- app: begin -->",
  "<!-- app: end -->",
  "",
].join("\n");

describe("the architecture of an interactive app", () => {
  test("is the generic chapter with the extension's, its paths rewritten for the app, marked as a reference", () => {
    const app = tempDir("architecture-app");
    const lines = writeArchitecture(app, templates(EXTENSION), "interactive", COMMIT);
    expect(lines[0]).toContain("docs/arc42/ has the reference of app-templates 0123456");
    const text = readFileSync(join(app, "docs/arc42/05-building-blocks.arc42.md"), "utf8");
    expect(text.split("\n").slice(0, 3).join("\n")).toContain(REFERENCE);
    expect(text).toContain("Generic.");
    expect(text).toContain("## Core");
    expect(text).not.toContain("# Building Blocks\n\n## Core"); // the extension's title is left out
    expect(text).not.toMatch(/^path: runtime/m);
    expect(text).toContain(
      ":::ignore H014 installed package @lernapps/app-templates (arc42 cannot resolve untracked paths, docToolchain/arc42-language#128)\n:::\n:::building-block\nid: bb-runtime",
    );
    expect(text).toContain("path: src/core\n");
    expect(text).not.toContain("H020"); // stale once the interface has no path
    expect(hasArchitecture(app)).toBe(true);
    expect(architectureArchetype(app)).toBe("interactive");
  });

  test("is replaced outside the app sections; each section stays verbatim", () => {
    const app = tempDir("architecture-update");
    writeArchitecture(app, templates(EXTENSION), "interactive", COMMIT);
    const file = join(app, "docs/arc42/05-building-blocks.arc42.md");
    const own = "### Scoring\n\nCounts the letters typed in time.";
    writeFileSync(
      file,
      readFileSync(file, "utf8")
        .replace("<!-- app: begin core -->\n", `<!-- app: begin core -->\n${own}\n`)
        .replace("Generic.", "Edited by hand."),
    );
    const newer = templates(EXTENSION.replace("## Core", "## Core\n\nThe app's logic."));
    writeArchitecture(app, newer, "interactive", COMMIT.replace("0123", "4567"));
    const text = readFileSync(file, "utf8");
    expect(text).toContain(`<!-- app: begin core -->\n${own}\n<!-- app: end core -->`);
    expect(text).toContain("The app's logic.");
    expect(text).toContain("Generic.");
    expect(text).not.toContain("Edited by hand.");
    expect(text).toContain("app-templates 4567");
  });

  test("is not replaced when an app section with content has no place in the new reference", () => {
    const app = tempDir("architecture-lost");
    writeArchitecture(app, templates(EXTENSION), "interactive", COMMIT);
    const file = join(app, "docs/arc42/05-building-blocks.arc42.md");
    writeFileSync(
      file,
      readFileSync(file, "utf8").replace("<!-- app: begin core -->\n", "<!-- app: begin core -->\nMine.\n"),
    );
    const before = readFileSync(file, "utf8");
    const newer = templates(EXTENSION.replace("<!-- app: begin core -->\n<!-- app: end core -->\n", ""));
    expect(() => writeArchitecture(app, newer, "interactive", COMMIT)).toThrow(ArchitectureError);
    expect(() => writeArchitecture(app, newer, "interactive", COMMIT)).toThrow(
      "has no place for the app sections 05-building-blocks.arc42.md (core): nothing was replaced",
    );
    expect(readFileSync(file, "utf8")).toBe(before);
  });
});
