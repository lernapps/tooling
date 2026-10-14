// The conventions the tooling gives apps hold for the tooling itself.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { ok, repoRoot } from "./support.ts";

test("no JavaScript sources: every script is TypeScript", () => {
  const javascript = ok(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "*.js", "*.mjs", "*.cjs", "*.jsx"],
    repoRoot,
  ).stdout;
  expect(javascript).toBe("");
});

test("every action describes itself and each of its inputs and outputs: the action is where they are documented", () => {
  const dir = join(repoRoot, "actions");
  const actions = readdirSync(dir);
  expect(actions.length).toBeGreaterThan(0);
  for (const name of actions) {
    const action = parse(readFileSync(join(dir, name, "action.yml"), "utf8")) as {
      description?: string;
      inputs?: Record<string, { description?: string }>;
      outputs?: Record<string, { description?: string }>;
    };
    expect(action.description?.trim(), `${name}: description`).toBeTruthy();
    for (const [kind, entries] of Object.entries({ inputs: action.inputs, outputs: action.outputs })) {
      for (const [key, entry] of Object.entries(entries ?? {})) {
        expect(entry.description?.trim(), `${name}: ${kind}.${key}`).toBeTruthy();
      }
    }
  }
});

/** The anchor GitHub gives a Markdown heading. */
const anchor = (heading: string) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");

test("every link to a section of the README points at a heading it has", () => {
  const headings = new Set(
    readFileSync(join(repoRoot, "README.md"), "utf8")
      .split("\n")
      .filter((line) => /^#{1,6} /.test(line))
      .map((line) => anchor(line.replace(/^#+ /, ""))),
  );
  const files = ok("git", ["ls-files", "site", "guidance", "skills", "docs", "review", "README.md"], repoRoot)
    .stdout.split("\n")
    .filter((file) => file !== "");
  const links = files.flatMap((file) =>
    [
      ...readFileSync(join(repoRoot, file), "utf8").matchAll(
        /github\.com\/lernapps\/tooling(?:\/blob\/main\/README\.md)?#([\w-]+)/g,
      ),
    ]
      .map((match) => ({ file, anchor: match[1] ?? "" }))
      .filter((link) => link.anchor !== "main" && !/^[0-9a-f]{7,40}$/.test(link.anchor)),
  );
  expect(links.filter((link) => !headings.has(link.anchor))).toEqual([]);
});
