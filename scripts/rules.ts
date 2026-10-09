// Reads the rule catalog from the artifacts where the rules live (docs/arc42 ch. 8, concept "Rule catalog";
// ch. 9, decision "Rules live in their artifacts"). Nothing is generated into the artifacts; there is no central
// rule file, and no artifact needs to know the others.
//
//   node scripts/rules.ts test          the id test (test/rules.test.ts): one line per problem, exit 1 on any
//   node scripts/rules.ts list          every rule of every artifact, grouped by id, as YAML (npm run rules)
//   node scripts/rules.ts page <file>   writes the rule page of the docs site (scripts/build.sh); fails like test
//
// The artifacts, each one deployment unit with its own ids:
//   - skills/**/*.md   a section of a skill, headed by a rule block (id, scope, severity)
//   - check/rules/*.ts a check of the check CLI, default export { id, url, description, severity, run }
//   - lint/rules/*.ts  a lint rule (ESLint-compatible), file name = id, meta.docs.url
//   - review/**/*.md   an item of the review rubric, headed by a `rubric` block (id); in the rubric files
//                      (review/rubric.md, review/archetypes/*.md) every level-2 heading is an item and needs one
// The same id in several artifacts is one rule, told and enforced in several places. An id is unique within its
// artifact kind; whether the artifacts of one id agree is judged by an agent (.agents/skills/rules-review/).
// A rule block is a fenced block with the info string `rule` right under the section's heading, one key per line:
//
//   ```rule
//   id: no-request-before-click
//   scope: [listing, site]
//   severity: error
//   ```
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stringify } from "yaml";

const RULE_PAGE = "https://lernapps.net/tooling/rules/";
const SOURCE = "https://github.com/lernapps/tooling/blob/main/";

const ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SCOPE = /^(listing|site|archetype:[a-z][a-z0-9-]*)$/;
const SEVERITIES = ["error", "warning", "hint"];
const KEYS = { rule: ["id", "scope", "severity"], rubric: ["id"] };
type Info = keyof typeof KEYS;

type Kind = "skill" | "check" | "lint rule" | "rubric item";

/** One artifact that carries a rule. */
interface Entry {
  kind: Kind;
  id: string;
  /** Path relative to the repo; for Markdown with the line of the block. */
  file: string;
  line?: number | undefined;
  title?: string | undefined;
  /** What the artifact says about the rule: the section's text, or the description of a check or lint rule. */
  text?: string | undefined;
  scopes?: string[];
  severity?: string;
}

interface Catalog {
  /** By id, in the order skill, check, lint rule, rubric item. */
  rules: Map<string, Entry[]>;
  problems: string[];
}

const ruleUrl = (id: string) => `${RULE_PAGE}#${id}`;

function filesBelow(dir: string, extension: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return filesBelow(path, extension);
      return entry.name.endsWith(extension) ? [path] : [];
    })
    .sort();
}

/** A fenced block with info string `rule` or `rubric`, and the section it heads. */
interface Block {
  fields: Map<string, string>;
  title: string | undefined;
  body: string;
  file: string;
  line: number;
}

/** The blocks of one kind in a Markdown file, with the section each one heads. */
function readBlocks(root: string, path: string, info: Info, problems: string[]): Block[] {
  const file = relative(root, path);
  const lines = readFileSync(path, "utf8").split("\n");
  const blocks: Block[] = [];
  const keys: readonly string[] = KEYS[info];
  let heading: { level: number; title: string } | undefined;
  let fence: string | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (fence !== undefined) {
      if (line.trim() === fence) fence = undefined;
      continue;
    }
    const open = /^(`{3,}|~{3,})\s*(\S*)\s*$/.exec(line);
    if (open && open[2] !== info) {
      fence = open[1];
      continue;
    }
    const head = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (head) {
      heading = { level: head[1]?.length ?? 1, title: head[2] ?? "" };
      continue;
    }
    if (!open) continue;

    // The block: key: value lines up to the closing fence.
    const at = `${file}:${i + 1}`;
    const fields = new Map<string, string>();
    let end = i + 1;
    for (; end < lines.length && (lines[end] ?? "").trim() !== open[1]; end++) {
      const text = lines[end] ?? "";
      if (text.trim() === "") continue;
      const field = /^([a-z]+):\s*(.*?)\s*$/.exec(text);
      if (!field || !keys.includes(field[1] ?? "")) {
        problems.push(`${at}: ${info} block: unexpected line "${text.trim()}" (keys: ${keys.join(", ")})`);
        continue;
      }
      fields.set(field[1] ?? "", field[2] ?? "");
    }
    // The section's text: up to the next heading of the same or a higher level.
    const body: string[] = [];
    let inner: string | undefined;
    let next = end + 1;
    for (; next < lines.length; next++) {
      const text = lines[next] ?? "";
      if (inner === undefined) {
        const level = /^(#{1,6})\s/.exec(text)?.[1]?.length;
        if (level !== undefined && level <= (heading?.level ?? 6)) break;
        const innerOpen = /^(`{3,}|~{3,})/.exec(text);
        if (innerOpen) inner = innerOpen[1];
      } else if (text.trim() === inner) {
        inner = undefined;
      }
      body.push(text);
    }

    if (heading === undefined) problems.push(`${at}: a ${info} block must stand under the heading of its section`);
    blocks.push({ fields, title: heading?.title, body: body.join("\n").trim(), file, line: i + 1 });
    heading = undefined; // one block per section
    i = end;
  }
  return blocks;
}

/** The rubric files: one for every app, one per archetype. Every level-2 heading in them is an item. */
const isRubric = (file: string) => /^review\/(rubric|archetypes\/[^/]+)\.md$/.test(file.split("\\").join("/"));

/** The items of a rubric file whose heading is not followed by its rubric block. */
function itemsWithoutBlock(root: string, path: string): string[] {
  const file = relative(root, path);
  const lines = readFileSync(path, "utf8").split("\n");
  const problems: string[] = [];
  let fence: string | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const open = /^(`{3,}|~{3,})/.exec(line);
    if (fence !== undefined) {
      if (line.trim() === fence) fence = undefined;
      continue;
    }
    if (open) {
      fence = open[1];
      continue;
    }
    const item = /^##\s+(.*?)\s*#*\s*$/.exec(line);
    if (!item) continue;
    const next = lines.slice(i + 1).find((text) => text.trim() !== "") ?? "";
    if (!/^(`{3,}|~{3,})\s*rubric\s*$/.test(next)) {
      problems.push(
        `${file}:${i + 1}: rubric item "${item[1] ?? ""}" has no rule id: put a rubric block with its id under the heading`,
      );
    }
  }
  return problems;
}

/** A skill section from its rule block, with the problems of its fields. */
function fromRuleBlock({ fields, title, body, file, line }: Block, problems: string[]): Entry {
  const at = `${file}:${line}`;
  const id = fields.get("id") ?? "";
  const name = id === "" ? "rule block" : `rule ${id}`;
  const scopeText = fields.get("scope") ?? "";
  const scopes = scopeText
    .replace(/^\[(.*)\]$/, "$1")
    .split(",")
    .map((scope) => scope.trim())
    .filter((scope) => scope !== "");
  if (scopes.length === 0 || scopes.some((scope) => !SCOPE.test(scope))) {
    problems.push(`${at}: ${name}: scope "${scopeText}" must be listing, site or archetype:<name>, or a list of them`);
  }
  const severity = fields.get("severity") ?? "";
  if (!SEVERITIES.includes(severity)) {
    problems.push(`${at}: ${name}: unknown severity "${severity}" (${SEVERITIES.join(", ")})`);
  }
  if (severity === "warning" && scopes.includes("listing")) {
    problems.push(`${at}: ${name}: a listing rule is never a warning`);
  }
  return { kind: "skill", id, file, line, title: title ?? id, text: body, scopes, severity };
}

function field(value: unknown, ...path: string[]): unknown {
  let current = value;
  for (const key of path) {
    if (typeof current !== "object" || current === null || !(key in current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

const text = (value: unknown) => (typeof value === "string" ? value : undefined);

/** Reads all artifacts and tests each on its own: ids valid and unique within the kind, messages linked. */
async function readCatalog(root: string): Promise<Catalog> {
  const problems: string[] = [];
  const entries: Entry[] = [];
  const load = async (path: string): Promise<unknown> => {
    try {
      const module: unknown = await import(pathToFileURL(path).href);
      return field(module, "default");
    } catch (error) {
      problems.push(`${relative(root, path)}: cannot load: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  };
  const linked = (file: string, id: string, key: string, url: string | undefined) => {
    if (url !== ruleUrl(id)) {
      problems.push(
        `${file}: the messages of rule ${id} do not link to the rule: ${key} must be ${ruleUrl(id)}` +
          (url === undefined ? "" : `, not ${url}`),
      );
    }
  };

  for (const path of filesBelow(join(root, "skills"), ".md")) {
    for (const block of readBlocks(root, path, "rule", problems)) entries.push(fromRuleBlock(block, problems));
  }
  for (const path of filesBelow(join(root, "check", "rules"), ".ts")) {
    const check = await load(path);
    const file = relative(root, path);
    const id = text(field(check, "id")) ?? "";
    if (id !== "") linked(file, id, "url", text(field(check, "url")));
    const severity = text(field(check, "severity"));
    entries.push({
      kind: "check",
      id,
      file,
      text: text(field(check, "description")),
      ...(severity === undefined ? {} : { severity }),
    });
  }
  for (const path of filesBelow(join(root, "lint", "rules"), ".ts")) {
    const rule = await load(path);
    const file = relative(root, path);
    const id = basename(path, ".ts");
    linked(file, id, "meta.docs.url", text(field(rule, "meta", "docs", "url")));
    entries.push({ kind: "lint rule", id, file, text: text(field(rule, "meta", "docs", "description")) });
  }
  for (const path of filesBelow(join(root, "review"), ".md")) {
    for (const { fields, title, body, file, line } of readBlocks(root, path, "rubric", problems)) {
      entries.push({ kind: "rubric item", id: fields.get("id") ?? "", file, line, title, text: body });
    }
    if (isRubric(relative(root, path))) problems.push(...itemsWithoutBlock(root, path));
  }

  const HOW: Record<Kind, string> = {
    skill: "id: <rule id> in its rule block",
    check: 'export default { id: "<rule id>", ... }',
    "lint rule": "name the file <rule id>.ts",
    "rubric item": "id: <rule id> in its rubric block",
  };
  const rules = new Map<string, Entry[]>();
  for (const entry of entries) {
    const at = entry.line === undefined ? entry.file : `${entry.file}:${entry.line}`;
    if (!ID.test(entry.id)) {
      problems.push(
        `${at}: ${entry.kind} has no valid rule id (a stable name like no-request-before-click): ${HOW[entry.kind]}`,
      );
      continue;
    }
    const same = rules.get(entry.id) ?? [];
    const twice = same.find((other) => other.kind === entry.kind);
    if (twice) {
      const first = twice.line === undefined ? twice.file : `${twice.file}:${twice.line}`;
      problems.push(`${at}: rule ${entry.id} appears twice in a ${entry.kind} (first in ${first})`);
      continue;
    }
    rules.set(entry.id, [...same, entry]);
  }
  return { rules, problems };
}

// The list

/** Every rule, grouped by id: what each artifact says about it, for people and for the rules review. */
function ruleList(catalog: Catalog): string {
  const list = Object.fromEntries(
    [...catalog.rules.keys()].sort().map((id) => [
      id,
      (catalog.rules.get(id) ?? []).map(({ kind, file, line, title, scopes, severity, text }) => ({
        in: kind,
        file: line === undefined ? file : `${file}:${line}`,
        ...(title === undefined ? {} : { title }),
        ...(scopes === undefined ? {} : { scope: scopes }),
        ...(severity === undefined ? {} : { severity }),
        ...(text === undefined || text === "" ? {} : { text }),
      })),
    ]),
  );
  return stringify(list, { lineWidth: 0 });
}

// The rule page

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Inline Markdown: `code`, **strong**, [text](https://...), <https://...>. Anything else stays text. */
function inline(markdown: string): string {
  return markdown
    .split("`")
    .map((part, index) => {
      if (index % 2 === 1) return `<code>${escape(part)}</code>`;
      return escape(part)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1">$1</a>');
    })
    .join("");
}

/** The text of a section: paragraphs and lists. */
function blocks(markdown: string): string {
  return markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block !== "")
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim());
      if (lines.every((line) => /^[-*]\s/.test(line))) {
        return `<ul>\n${lines.map((line) => `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`).join("\n")}\n</ul>`;
      }
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("\n");
}

const source = (file: string) => `<a href="${SOURCE}${escape(file)}"><code>${escape(file)}</code></a>`;

const LABEL: Record<Kind, string> = {
  skill: "told in the skill",
  check: "checked by the check",
  "lint rule": "checked by the lint rule",
  "rubric item": "judged by the rubric item in",
};

function rulePage(catalog: Catalog): string {
  const rules = [...catalog.rules].map(([id, entries]) => {
    const skill = entries.find((entry) => entry.kind === "skill");
    const told = skill ?? entries.find((entry) => entry.text !== undefined && entry.text !== "");
    return { id, entries, skill, title: told?.title ?? id, text: told?.text ?? "" };
  });
  const order = ({ skill }: (typeof rules)[number]) =>
    skill?.scopes?.includes("listing") ? 0 : skill?.scopes?.includes("site") ? 1 : 2;
  rules.sort((a, b) => order(a) - order(b) || a.id.localeCompare(b.id));
  const rows = rules
    .map(
      ({ id, skill }) =>
        `<tr><td><a href="#${id}"><code>${id}</code></a></td><td>${skill?.scopes?.join(", ") ?? ""}</td>` +
        `<td>${skill?.severity ?? ""}</td></tr>`,
    )
    .join("\n");
  const sections = rules
    .map(({ id, entries, skill, title, text }) => {
      const where = entries.map((entry) => `${LABEL[entry.kind]} ${source(entry.file)}`).join("; ");
      const where_ = where.charAt(0).toUpperCase() + where.slice(1);
      return [
        `<section id="${id}">`,
        // A heading like "`plan-file`: Keep the plan file": the id is shown below it.
        `<h2>${inline(title.replace(/^`[^`]+`:\s*/, ""))}</h2>`,
        `<p>${[`<code>${id}</code>`, skill?.scopes?.join(", "), skill?.severity].filter(Boolean).join(" · ")}</p>`,
        `<div>\n${blocks(text)}\n</div>`,
        `<p>${where_}.</p>`,
        "</section>",
      ].join("\n");
    })
    .join("\n\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>Rules – Tooling – lernapps.net</title>
  <link rel="canonical" href="${RULE_PAGE}">
  <link rel="stylesheet" href="../stil.css">
</head>
<body>
  <main id="main-content" tabindex="-1">
    <h1>Rules</h1>
    <p>Each rule is one requirement on a learning app. It lives where it acts: as a section of a skill for AI
      assistants, as a check, as a lint rule or as an item of the review rubric. The same rule can live in several of
      them, always under the same id. This page reads them from there.</p>
    <ul>
      <li><strong>Scope:</strong> <code>listing</code> applies to every app in the app overview, wherever it is
        hosted; <code>site</code> to every page on lernapps.net; <code>archetype:…</code> to apps of that
        archetype.</li>
      <li><strong>Severity:</strong> <code>error</code> must not be broken; <code>warning</code> only with a reason
        recorded in place; <code>hint</code> is a recommendation.</li>
    </ul>
    <p>Every message of a check links to its rule here, by its id: <code>${RULE_PAGE}#&lt;id&gt;</code>.</p>
    <table>
      <thead><tr><th>Rule</th><th>Scope</th><th>Severity</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
${sections}
  </main>
</body>
</html>
`;
}

async function main(args: string[]): Promise<number> {
  const [command, out] = args;
  if (command !== "test" && command !== "list" && !(command === "page" && out)) {
    process.stderr.write("usage: node scripts/rules.ts test | list | page <file>\n");
    return 2;
  }
  const root = resolve(import.meta.dirname, "..");
  const catalog = await readCatalog(root);
  if (catalog.problems.length > 0) {
    process.stderr.write(`${catalog.problems.map((problem) => `rules: ${problem}`).join("\n")}\n`);
    return 1;
  }
  if (command === "list") {
    process.stdout.write(ruleList(catalog));
  } else if (command === "page" && out) {
    mkdirSync(dirname(resolve(out)), { recursive: true });
    writeFileSync(resolve(out), rulePage(catalog));
    process.stdout.write(`rules: ${catalog.rules.size} rules written to ${out}\n`);
  } else {
    process.stdout.write(`rules: ${catalog.rules.size} rules, ids unique per artifact kind, every message linked\n`);
  }
  return 0;
}

process.exitCode = await main(process.argv.slice(2));
