// Reads the rule catalog from the artifacts where the rules live (docs/arc42 ch. 8, concept "Rule catalog";
// ch. 9, decision "Rules live in their artifacts"). Nothing is generated into the artifacts; there is no central
// rule file.
//
//   node scripts/rules.ts test          the id test (test/rules.test.ts): one line per problem, exit 1 on any
//   node scripts/rules.ts page <file>   writes the rule page of the docs site (scripts/build.sh); fails like test
//
// Where a rule is declared, and where it is enforced:
//   - skills/**/*.md   declares: a section of a skill, headed by a rule block; every rule is explained there
//   - check/rules/*.ts enforces a `checked` rule: a check of the built app, default export { id, url, ... }
//   - lint/rules/*.ts  enforces a `checked` rule: a lint rule (ESLint-compatible), file name = id, meta.docs.url
//   - review/**/*.md   enforces a `reviewed` rule: an item of the review rubric, headed by a `rubric` block (id)
// A rule block is a fenced block with the info string `rule` right under the section's heading, one key per line:
//
//   ```rule
//   id: no-request-before-click
//   scope: [listing, site]
//   severity: error
//   enforcement: guided
//   ```
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const RULE_PAGE = "https://lernapps.net/tooling/rules/";
const SOURCE = "https://github.com/lernapps/tooling/blob/main/";

const ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SCOPE = /^(listing|site|archetype:[a-z][a-z0-9-]*)$/;
const SEVERITIES = ["error", "warning", "hint"];
const ENFORCEMENTS = ["guided", "checked", "reviewed"];
const KEYS = { rule: ["id", "scope", "severity", "enforcement"], rubric: ["id"] };
type Info = keyof typeof KEYS;

interface Rule {
  id: string;
  scopes: string[];
  severity: string;
  enforcement: string;
  title: string;
  /** The section's text below the rule block: where the rule is explained. Markdown. */
  body: string;
  /** Where it is declared: path relative to the repo, and line of the rule block. */
  file: string;
  line: number;
}

/** A fenced block with info string `rule` or `rubric`, and the section it heads. */
interface Block {
  fields: Map<string, string>;
  title: string | undefined;
  body: string;
  file: string;
  line: number;
}

interface Implementation {
  kind: "check" | "lint rule" | "rubric item";
  id: string | undefined;
  url: string | undefined;
  file: string;
}

interface Catalog {
  rules: Rule[];
  implementations: Implementation[];
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

    blocks.push({ fields, title: heading?.title, body: body.join("\n").trim(), file, line: i + 1 });
    heading = undefined; // one block per section
    i = end;
  }
  return blocks;
}

/** A rule from its rule block, with the problems of its fields. */
function toRule({ fields, title, body, file, line }: Block, problems: string[]): Rule {
  const at = `${file}:${line}`;
  const id = fields.get("id") ?? "";
  const name = id === "" ? "rule block" : `rule ${id}`;
  if (!ID.test(id)) problems.push(`${at}: ${name}: id must be a stable name like no-request-before-click`);
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
  const enforcement = fields.get("enforcement") ?? "";
  if (!ENFORCEMENTS.includes(enforcement)) {
    problems.push(`${at}: ${name}: unknown enforcement "${enforcement}" (${ENFORCEMENTS.join(", ")})`);
  }
  if (title === undefined) problems.push(`${at}: ${name}: a rule block must stand under the heading of its section`);
  return { id, scopes, severity, enforcement, title: title ?? id, body, file, line };
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

async function readImplementations(root: string, problems: string[]): Promise<Implementation[]> {
  const implementations: Implementation[] = [];
  const load = async (path: string): Promise<unknown> => {
    try {
      const module: unknown = await import(pathToFileURL(path).href);
      return field(module, "default");
    } catch (error) {
      problems.push(`${relative(root, path)}: cannot load: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  };
  for (const path of filesBelow(join(root, "check", "rules"), ".ts")) {
    const check = await load(path);
    implementations.push({
      kind: "check",
      id: text(field(check, "id")),
      url: text(field(check, "url")),
      file: relative(root, path),
    });
  }
  for (const path of filesBelow(join(root, "lint", "rules"), ".ts")) {
    const rule = await load(path);
    implementations.push({
      kind: "lint rule",
      id: basename(path, ".ts"),
      url: text(field(rule, "meta", "docs", "url")),
      file: relative(root, path),
    });
  }
  for (const path of filesBelow(join(root, "review"), ".md")) {
    for (const { fields, title, file, line } of readBlocks(root, path, "rubric", problems)) {
      if (title === undefined)
        problems.push(`${file}:${line}: a rubric block must stand under the heading of its item`);
      implementations.push({ kind: "rubric item", id: fields.get("id"), url: undefined, file: `${file}:${line}` });
    }
  }
  return implementations;
}

/** Reads all artifacts and tests the ids: unique, every checked rule implemented, every message linked. */
async function readCatalog(root: string): Promise<Catalog> {
  const problems: string[] = [];
  const rules: Rule[] = [];
  for (const path of filesBelow(join(root, "skills"), ".md")) {
    for (const block of readBlocks(root, path, "rule", problems)) rules.push(toRule(block, problems));
  }

  const declared = new Map<string, Rule>();
  for (const rule of rules) {
    const first = declared.get(rule.id);
    if (first) {
      problems.push(`${rule.file}:${rule.line}: rule ${rule.id} declared twice (first in ${first.file}:${first.line})`);
    } else if (rule.id !== "") {
      declared.set(rule.id, rule);
    }
  }

  const implementations = await readImplementations(root, problems);
  const seen = new Map<string, Implementation>();
  for (const implementation of implementations) {
    const { kind, id, url, file } = implementation;
    if (id === undefined || !ID.test(id)) {
      problems.push(
        kind === "check"
          ? `${file}: check has no rule id: export default { id: "<rule id>", url: "${RULE_PAGE}#<rule id>", ... }`
          : kind === "lint rule"
            ? `${file}: lint rule has no rule id: name the file <rule id>.ts`
            : `${file}: rubric item has no rule id: \`\`\`rubric with id: <rule id>`,
      );
      continue;
    }
    const twice = seen.get(`${kind}:${id}`);
    if (twice) problems.push(`${file}: rule ${id} implemented twice by a ${kind} (also ${twice.file})`);
    seen.set(`${kind}:${id}`, implementation);
    const rule = declared.get(id);
    if (!rule) {
      problems.push(`${file}: rule ${id} is not declared: add its section with a rule block to a skill (skills/)`);
    } else if (rule.enforcement !== (kind === "rubric item" ? "reviewed" : "checked")) {
      problems.push(
        `${file}: rule ${id} has a ${kind} but is declared ${rule.enforcement} in ${rule.file}:${rule.line}`,
      );
    }
    if (kind !== "rubric item" && url !== ruleUrl(id)) {
      problems.push(
        `${file}: the messages of rule ${id} do not link to the rule: ` +
          (kind === "check" ? "url" : "meta.docs.url") +
          ` must be ${ruleUrl(id)}` +
          (url === undefined ? "" : `, not ${url}`),
      );
    }
  }
  for (const rule of declared.values()) {
    const enforced = implementations.filter((implementation) => implementation.id === rule.id);
    if (rule.enforcement === "checked" && !enforced.some((implementation) => implementation.kind !== "rubric item")) {
      problems.push(
        `${rule.file}:${rule.line}: checked rule ${rule.id} has no implementation: ` +
          "a check in check/rules/ or a lint rule in lint/rules/",
      );
    }
    if (rule.enforcement === "reviewed" && !enforced.some((implementation) => implementation.kind === "rubric item")) {
      problems.push(`${rule.file}:${rule.line}: reviewed rule ${rule.id} has no rubric item in review/`);
    }
  }
  return { rules, implementations, problems };
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

const LABEL: Record<Implementation["kind"], string> = {
  check: "geprüft von der Prüfung",
  "lint rule": "geprüft von der Lint-Regel",
  "rubric item": "beurteilt nach dem Punkt der Begutachtung in",
};

const ORDER = (rule: Rule) => (rule.scopes.includes("listing") ? 0 : rule.scopes.includes("site") ? 1 : 2);

function rulePage(catalog: Catalog): string {
  const rules = [...catalog.rules].sort((a, b) => ORDER(a) - ORDER(b) || a.id.localeCompare(b.id));
  const rows = rules
    .map(
      (rule) =>
        `<tr><td><a href="#${rule.id}"><code>${rule.id}</code></a></td><td>${rule.scopes.join(", ")}</td>` +
        `<td>${rule.severity}</td><td>${rule.enforcement}</td></tr>`,
    )
    .join("\n");
  const sections = rules
    .map((rule) => {
      const implementations = catalog.implementations.filter((implementation) => implementation.id === rule.id);
      const where = [
        `Steht in ${source(rule.file)}`,
        ...implementations.map(
          (implementation) => `${LABEL[implementation.kind]} ${source(implementation.file.replace(/:\d+$/, ""))}`,
        ),
      ].join("; ");
      return [
        `<section id="${rule.id}">`,
        // A heading like "`plan-file`: Keep the plan file": the id is shown below it.
        `<h2 lang="en">${inline(rule.title.replace(/^`[^`]+`:\s*/, ""))}</h2>`,
        `<p><code>${rule.id}</code> · ${rule.scopes.join(", ")} · ${rule.severity} · ${rule.enforcement}</p>`,
        `<div lang="en">\n${blocks(rule.body)}\n</div>`,
        `<p>${where}.</p>`,
        "</section>",
      ].join("\n");
    })
    .join("\n\n");
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>Regeln – Werkzeuge – lernapps.net</title>
  <link rel="canonical" href="${RULE_PAGE}">
  <link rel="stylesheet" href="../stil.css">
</head>
<body>
  <main id="main-content" tabindex="-1">
    <h1>Regeln</h1>
    <p>Jede Regel ist eine Anforderung an eine Lern-App. Erklärt ist sie in einem Abschnitt eines Skills für
      KI-Assistenten; durchgesetzt wird sie dort, wo sie wirkt: als Prüfung, als Lint-Regel oder als Punkt der
      Begutachtung. Diese Seite liest sie von dort. Die Regeln selbst sind englisch, weil KI-Assistenten sie so
      lesen.</p>
    <ul>
      <li><strong>Geltung:</strong> <code>listing</code> gilt für jede App in der App-Übersicht, egal wo sie liegt;
        <code>site</code> für jede Seite auf lernapps.net; <code>archetype:…</code> für Apps dieser Art.</li>
      <li><strong>Schwere:</strong> <code>error</code> darf nicht verletzt werden; <code>warning</code> nur mit
        Begründung an Ort und Stelle; <code>hint</code> ist eine Empfehlung.</li>
      <li><strong>Durchsetzung:</strong> <code>guided</code> steht in einem Skill; <code>checked</code> prüft ein
        Programm; <code>reviewed</code> beurteilt die Begutachtung.</li>
    </ul>
    <p>Jede Meldung einer Prüfung verlinkt auf ihre Regel hier, über deren Kennung: <code>${RULE_PAGE}#&lt;Kennung&gt;</code>.</p>
    <table>
      <thead><tr><th>Regel</th><th>Geltung</th><th>Schwere</th><th>Durchsetzung</th></tr></thead>
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
  if (command !== "test" && !(command === "page" && out)) {
    process.stderr.write("usage: node scripts/rules.ts test | page <file>\n");
    return 2;
  }
  const root = resolve(import.meta.dirname, "..");
  const catalog = await readCatalog(root);
  if (catalog.problems.length > 0) {
    process.stderr.write(`${catalog.problems.map((problem) => `rules: ${problem}`).join("\n")}\n`);
    return 1;
  }
  if (command === "page" && out) {
    mkdirSync(dirname(resolve(out)), { recursive: true });
    writeFileSync(resolve(out), rulePage(catalog));
    process.stdout.write(`rules: ${catalog.rules.length} rules written to ${out}\n`);
  } else {
    const checked = catalog.rules.filter((rule) => rule.enforcement === "checked").length;
    process.stdout.write(
      `rules: ${catalog.rules.length} rules, ids unique, ${checked} checked rules implemented, every message linked\n`,
    );
  }
  return 0;
}

process.exitCode = await main(process.argv.slice(2));
