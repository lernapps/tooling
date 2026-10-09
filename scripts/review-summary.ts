// Renders the pull request comment of the tooling preview: a link to the preview and the change of the
// architecture (arc42) since the merge base, from the JSON that `arc42 diff <base>...HEAD --format json`
// wrote (scripts/build.sh). The same as scripts/docs-review-summary.mjs in lernapps/docs.
// Placeholder the workflow replaces: {{SITE_URL}} (the preview of the site).
// TypeScript, run by Node's type stripping (Node 22.18 or later):
//
//   node scripts/review-summary.ts <base> > summary.md   (reads _site/architecture-diff/changes.json)
import { existsSync, readFileSync } from "node:fs";

// The part of the output of `arc42 diff --format json` that the comment uses.
interface Attribute {
  name: string;
  before?: unknown;
  after?: unknown;
}
interface Element {
  id: string;
  kind: string;
  status: string;
  attributes?: Attribute[];
}
interface Diagram {
  id?: string;
  diagram?: { id?: string };
  status: string;
}
interface Edge {
  status: string;
  edge: { from: string; relation: string; to: string };
}
interface ProseSection {
  status: string;
  section: { headingPath: string[]; file: string };
}
interface DocumentCount {
  added: number;
  modified: number;
  removed: number;
}
interface Finding {
  message: string;
  file: string;
  line: number;
}
interface Changes {
  architecture: {
    elements: Element[];
    diagrams?: Diagram[];
    edges: Edge[];
    proseSections: ProseSection[];
    documents: DocumentCount[];
  };
  findings: Finding[];
}

const MARKER = "<!-- lernapps-tooling-architecture-review -->";
const MAX_LINES = 150; // keeps the comment well below GitHub's size limit
const FILE = "_site/architecture-diff/changes.json";
const base = process.argv[2] ?? "the base";

const value = (v: unknown): string => {
  if (v === undefined) return "—";
  const text = Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : JSON.stringify(v);
  return `\`${text.replaceAll("`", "'").replaceAll("|", "\\|")}\``;
};

const lines = [MARKER, "### Tooling review", "", "**[Open the preview]({{SITE_URL}})** — as it would be published", ""];

if (existsSync(FILE)) {
  const diff = JSON.parse(readFileSync(FILE, "utf8")) as Changes;
  const { elements, diagrams = [], edges, proseSections, documents } = diff.architecture;
  lines.push("#### Architecture (arc42)", "");
  if (elements.length + diagrams.length + edges.length + proseSections.length === 0) {
    lines.push(`No changes compared with \`${base}\`.`, "");
  } else {
    const sum = (key: keyof DocumentCount) => documents.reduce((total, d) => total + d[key], 0);
    lines.push(
      "**[Open the review of the changes]({{SITE_URL}}architecture-diff/)** — the changes inside their chapters, in the browser",
      "",
      "| Added | Modified | Removed | Warnings |",
      "|---:|---:|---:|---:|",
      `| ${sum("added")} | ${sum("modified")} | ${sum("removed")} | ${diff.findings.length} |`,
      "",
    );
    if (diff.findings.length > 0) {
      lines.push("**Warnings** — a block and the prose that explains it should change together", "");
      for (const f of diff.findings) lines.push(`- ${f.message} (\`${f.file}${f.line > 0 ? `:${f.line}` : ""}\`)`);
      lines.push("");
    }
    const changes: string[] = [];
    for (const e of elements) {
      const status = e.status === "unchanged" ? "prose changed" : e.status;
      const attributes = (e.attributes ?? [])
        .map((a) => `${a.name}: ${value(a.before)} → ${value(a.after)}`)
        .join("; ");
      changes.push(`- \`${e.id}\` (${e.kind}) — ${status}${attributes ? ` — ${attributes}` : ""}`);
    }
    for (const d of diagrams) changes.push(`- diagram \`${d.id ?? d.diagram?.id ?? "?"}\` — ${d.status}`);
    for (const { status, edge } of edges)
      changes.push(`- relation \`${edge.from}\` ${edge.relation} \`${edge.to}\` — ${status}`);
    for (const { status, section } of proseSections) {
      changes.push(`- section “${section.headingPath.join(" › ") || section.file}” — ${status}`);
    }
    const shown = changes.slice(0, MAX_LINES);
    if (changes.length > shown.length)
      shown.push(`- … and ${changes.length - shown.length} more (see the review page)`);
    lines.push(
      `<details><summary>Changed elements, relations and sections (${changes.length})</summary>`,
      "",
      ...shown,
      "",
      "</details>",
      "",
    );
  }
}

process.stdout.write(`${lines.join("\n")}\n`);
