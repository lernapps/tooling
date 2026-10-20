// Renders the page "A workshop, not a factory" of the docs site (site/workshop/) from its mapping
// (site/workshop/workshop.yaml) and the building blocks of docs/arc42, as `arc42 get` reports them. The mapping says
// per phase which blocks support it; the model gives each block its title and says which skills belong to which phase
// (the skill blocks under bb-skills-<phase>). Fails, with one line per problem, when the mapping names a block the
// model lacks, or when the skills of a phase in the mapping and in the model differ.
//
//   node scripts/workshop.ts test          the check alone (test/workshop.test.ts)
//   node scripts/workshop.ts page <file>   writes the page (scripts/build.sh); fails like test
//
// arc42 cannot carry the phase in a block yet (no custom attributes), so the mapping is explicit here.
import { spawnSync } from "node:child_process";
import { closeSync, mkdirSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAPPING = join(ROOT, "site/workshop/workshop.yaml");
const TEMPLATE = join(ROOT, "site/workshop/template.html");
const MARKER = /^ *<!-- workshop: .*-->$/m;

interface Block {
  id: string;
  title: string;
  parent?: string;
}

interface Tool {
  block?: string;
  blocks?: string[];
  kind: string;
  label?: string;
  text: string;
}

interface Phase {
  id: string;
  title: string;
  question: string;
  attention: { level: number; label: string };
  you: string[];
  agent: string[];
  tools: Tool[];
  gate?: { title: string; text: string };
}

interface Mapping {
  kinds: Record<string, string>;
  phases: Phase[];
  across: Tool[];
  catalog: { agent: { block: string; text: string }; owner: string };
}

/**
 * The building blocks of docs/arc42. The JSON goes to a file, not a pipe: on a pipe `arc42 get` cuts its output
 * after 64 KiB.
 */
export function blocks(): Map<string, Block> {
  const dir = mkdtempSync(join(tmpdir(), "workshop-"));
  try {
    const file = join(dir, "blocks.json");
    const out = openSync(file, "w");
    const result = spawnSync(
      join(ROOT, "node_modules/.bin/arc42"),
      ["--dir", join(ROOT, "docs/arc42"), "get", "--type", "building-block", "--format", "json"],
      { stdio: ["ignore", out, "inherit"] },
    );
    closeSync(out);
    if (result.status !== 0) throw new Error(`arc42 get failed (exit ${result.status ?? result.signal})`);
    const { elements } = JSON.parse(readFileSync(file, "utf8")) as { elements: Block[] };
    return new Map(elements.map((block) => [block.id, block]));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function mapping(): Mapping {
  return parse(readFileSync(MAPPING, "utf8")) as Mapping;
}

const idsOf = (tool: Tool) => tool.blocks ?? (tool.block === undefined ? [] : [tool.block]);

/** One line per problem; none when mapping and model agree. */
export function problems(map: Mapping, model: Map<string, Block>): string[] {
  const found: string[] = [];
  const tools = [...map.phases.flatMap((phase) => phase.tools), ...map.across];
  for (const tool of tools) {
    if (idsOf(tool).length === 0) found.push(`a tool without block: "${tool.text}"`);
    for (const id of idsOf(tool)) if (!model.has(id)) found.push(`${id}: no such building block in docs/arc42`);
    if (!(tool.kind in map.kinds)) found.push(`${idsOf(tool).join(", ")}: kind "${tool.kind}" is not in kinds`);
  }
  if (!model.has(map.catalog.agent.block))
    found.push(`${map.catalog.agent.block}: no such building block in docs/arc42`);
  for (const phase of map.phases) {
    const group = `bb-skills-${phase.id}`;
    if (!model.has(group)) {
      found.push(`${group}: the phase ${phase.id} has no skill group in docs/arc42`);
      continue;
    }
    const inModel = [...model.values()].filter((block) => block.parent === group).map((block) => block.id);
    const here = phase.tools.flatMap(idsOf).filter((id) => model.get(id)?.parent?.startsWith("bb-skills-"));
    for (const id of inModel.filter((id) => !here.includes(id))) {
      found.push(`${id}: a skill of ${phase.id} in docs/arc42, missing in the phase's tools`);
    }
    for (const id of here.filter((id) => !inModel.includes(id))) {
      found.push(`${id}: listed in ${phase.id}, but its group in docs/arc42 is ${model.get(id)?.parent}`);
    }
  }
  return found;
}

const esc = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const capital = (kind: string) => (kind === "cli" ? "CLI" : kind[0]?.toUpperCase() + kind.slice(1));
const chip = (kind: string) => `<span class="kind ${kind}">${capital(kind)}</span>`;

function tool(t: Tool, model: Map<string, Block>): string {
  const name =
    t.label ??
    idsOf(t)
      .map((id) => model.get(id)?.title ?? id)
      .join(", ");
  const ids = idsOf(t).join(" ");
  return `<li data-blocks="${ids}">${chip(t.kind)} ${esc(name)}: ${esc(t.text)}</li>`;
}

const list = (items: string[]) => items.map((item) => `            <li>${esc(item)}</li>`).join("\n");

/** The generated part of the page: legend, attention, board, across, catalog. */
export function render(map: Mapping, model: Map<string, Block>): string {
  const legend = Object.entries(map.kinds)
    .map(([kind, text]) => `      <span class="item">${chip(kind)} ${esc(text)}</span>`)
    .join("\n");
  const meter = map.phases
    .map(
      (p) => `        <span style="--level: ${p.attention.level}%">${esc(p.title)}: ${esc(p.attention.label)}</span>`,
    )
    .join("\n");
  const board = map.phases
    .map((p, i) => {
      const gate = p.gate
        ? `\n        <p class="gate">${esc(p.gate.title)} <span>– ${esc(p.gate.text)}</span></p>`
        : "";
      return `      <section class="phase" aria-labelledby="${p.id}">
        <header>
          <span class="n" aria-hidden="true">${i + 1}</span>
          <h2 id="${p.id}">${esc(p.title)}</h2>
          <p class="q">${esc(p.question)}</p>
        </header>
        <div class="lane you">
          <h3>You focus on</h3>
          <ul>
${list(p.you)}
          </ul>
        </div>
        <div class="lane agent">
          <h3>The agent</h3>
          <ul>
${list(p.agent)}
          </ul>
        </div>
        <div class="lane tools">
          <h3>Supported by</h3>
          <ul>
${p.tools.map((t) => `            ${tool(t, model)}`).join("\n")}
          </ul>
        </div>${gate}
      </section>`;
    })
    .join("\n\n");
  const across = map.across
    .map(
      (t) =>
        `      <span data-blocks="${idsOf(t).join(" ")}">${chip(t.kind)} ${esc(t.label ?? "")}: ${esc(t.text)}</span>`,
    )
    .join("\n");
  return `    <div class="legend" aria-label="Kinds of components">
${legend}
    </div>

    <div class="attention">
      <p>Your attention</p>
      <div class="meter">
${meter}
      </div>
    </div>

    <div class="board">
${board}
    </div>

    <div class="across">
      <strong>In every phase</strong>
${across}
    </div>

    <div class="across catalog">
      <strong>Then, in the catalog</strong>
      <span data-blocks="${map.catalog.agent.block}">${esc(map.catalog.agent.text)}</span>
      <span class="owner">${esc(map.catalog.owner)}</span>
    </div>
`;
}

function main(argv: string[]): number {
  const [command, out] = argv;
  if (command !== "test" && !(command === "page" && out)) {
    process.stderr.write("usage: node scripts/workshop.ts test | page <file>\n");
    return 2;
  }
  const map = mapping();
  const model = blocks();
  const found = problems(map, model);
  if (found.length > 0) {
    process.stderr.write(`${found.map((line) => `workshop: ${line}`).join("\n")}\n`);
    return 1;
  }
  if (command === "page" && out) {
    const template = readFileSync(TEMPLATE, "utf8");
    if (!MARKER.test(template)) throw new Error(`${TEMPLATE}: the marker <!-- workshop: … --> is missing`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, template.replace(MARKER, render(map, model).trimEnd()));
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
