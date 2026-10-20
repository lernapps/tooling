// Renders the page "A workshop, not a factory" of the docs site (site/workshop/) from its mapping
// (site/workshop/workshop.yaml) and the building blocks of docs/arc42, as `arc42 get` reports them. The mapping says
// per phase what the person decides and which blocks support it, for whom; the model gives each block its title and its
// place in the architecture app, and says which skills belong to which phase
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
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MAPPING = join(ROOT, "site/workshop/workshop.yaml");
const TEMPLATE = join(ROOT, "site/workshop/template.html");

interface Block {
  id: string;
  title: string;
  parent?: string;
  loc: { file: string };
}

/** One box: a block, or neighbouring blocks shown as one, and what it does for the agent and the person. */
interface Box {
  block?: string;
  blocks?: string[];
  kind: string;
  label?: string;
  agent?: string;
  person?: string;
}

interface Phase {
  id: string;
  title: string;
  question: string;
  you: string;
  gate?: string;
  boxes: Box[];
}

interface Mapping {
  kinds: string[];
  phases: Phase[];
  across: Box[];
  catalog: Box[];
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

const idsOf = (box: Box) => box.blocks ?? (box.block === undefined ? [] : [box.block]);

/** One line per problem; none when mapping and model agree. */
export function problems(map: Mapping, model: Map<string, Block>): string[] {
  const found: string[] = [];
  for (const box of [...map.phases.flatMap((phase) => phase.boxes), ...map.across, ...map.catalog]) {
    const ids = idsOf(box);
    if (ids.length === 0) found.push(`a box without block: "${box.label ?? box.agent ?? box.person}"`);
    for (const id of ids) if (!model.has(id)) found.push(`${id}: no such building block in docs/arc42`);
    if (!map.kinds.includes(box.kind)) found.push(`${ids.join(", ")}: kind "${box.kind}" is not in kinds`);
    if (!box.agent && !box.person) found.push(`${ids.join(", ")}: says nothing for the agent or the person`);
  }
  for (const phase of map.phases) {
    const group = `bb-skills-${phase.id}`;
    if (!model.has(group)) {
      found.push(`${group}: the phase ${phase.id} has no skill group in docs/arc42`);
      continue;
    }
    const inModel = [...model.values()].filter((block) => block.parent === group).map((block) => block.id);
    const here = phase.boxes.flatMap(idsOf).filter((id) => model.get(id)?.parent?.startsWith("bb-skills-"));
    for (const id of inModel.filter((id) => !here.includes(id))) {
      found.push(`${id}: a skill of ${phase.id} in docs/arc42, missing in the phase's boxes`);
    }
    for (const id of here.filter((id) => !inModel.includes(id))) {
      found.push(`${id}: listed in ${phase.id}, but its group in docs/arc42 is ${model.get(id)?.parent}`);
    }
  }
  return found;
}

const esc = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

// Who works with a part: two outline icons, never colour alone; the arrow says the box is a link.
const PERSON =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.6-3.9 3.3-6 7-6s6.4 2.1 7 6"/></g></svg>';
const AGENT =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M12 4c.7 5 2.8 7.3 8 8-5.2.7-7.3 3-8 8-.7-5-2.8-7.3-8-8 5.2-.7 7.3-3 8-8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const DECIDES =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" fill="currentColor"/></svg>';
const GO =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const actor = (who: "person" | "agent", label = true) =>
  who === "person"
    ? `<span class="actor human"${label ? ' role="img" aria-label="Person" title="Person"' : ' aria-hidden="true"'}>${PERSON}</span>`
    : `<span class="actor agent"${label ? ' role="img" aria-label="AI agent" title="AI agent"' : ' aria-hidden="true"'}>${AGENT}</span>`;

/**
 * The block's card in the architecture app of this site, which opens an element at `#<chapter file>:el-<id>`. A box
 * of several blocks links the first; they are neighbours in chapter 5.
 */
function href(ids: string[], model: Map<string, Block>): string {
  const block = model.get(ids[0] ?? "");
  return block ? `../architecture/#${basename(block.loc.file)}:el-${block.id}` : "../architecture/";
}

/** A box: its link with title, kind and who works with it; what it does for whom opens on hover and focus. */
function box(b: Box, id: string, model: Map<string, Block>): string {
  const ids = idsOf(b);
  const title = b.label ?? ids.map((block) => model.get(block)?.title ?? block).join(", ");
  const who = [b.person ? actor("person") : "", b.agent ? actor("agent") : ""].join("");
  const rows = [
    b.person
      ? `<p class="how-row">${actor("person", false)}<span><strong>Person</strong> ${esc(b.person)}</span></p>`
      : "",
    b.agent
      ? `<p class="how-row">${actor("agent", false)}<span><strong>AI agent</strong> ${esc(b.agent)}</span></p>`
      : "",
  ].join("");
  return (
    `<li class="chip" data-blocks="${ids.join(" ")}"><a href="${esc(href(ids, model))}" aria-describedby="${id}">` +
    `<span class="t">${esc(title)}</span><span class="meta"><span class="kind">${esc(b.kind)}</span>` +
    `<span class="actors">${who}</span><span class="go">${GO}</span></span></a>` +
    `<div class="how" id="${id}" role="tooltip">${rows}</div></li>`
  );
}

const boxes = (list: Box[], prefix: string, model: Map<string, Block>) =>
  `<ul class="chips">${list.map((b, i) => box(b, `how-${prefix}-${i + 1}`, model)).join("")}</ul>`;

function band(id: string, label: string, question: string, list: Box[], model: Map<string, Block>): string {
  return (
    `<section class="band" id="${id}" aria-labelledby="${id}-h"><h3 id="${id}-h"><span class="label">${esc(label)}</span>` +
    `<span class="question">${esc(question)}</span></h3>${boxes(list, id, model)}</section>`
  );
}

/** The key under the introduction: who works with a box, and the kinds. */
export function key(map: Mapping): string {
  return (
    '<ul class="key" aria-label="Who works with a part, and its kind">' +
    `<li>${actor("person", false)}<span><strong>Person</strong> decides or is asked</span></li>` +
    `<li>${actor("agent", false)}<span><strong>AI agent</strong> works from it</span></li>` +
    `<li><span>${map.kinds.map((kind) => `<span class="kind">${esc(kind)}</span>`).join(" ")}</span></li></ul>`
  );
}

/** The board: what runs through every phase, the four phases, then the catalog. */
export function render(map: Mapping, model: Map<string, Block>): string {
  const phases = map.phases
    .map((p, i) => {
      const gate = p.gate ? `<p class="gate">${esc(p.gate)}</p>` : "";
      return (
        `<section class="phase" id="phase-${p.id}" aria-labelledby="phase-${p.id}-h">` +
        `<span class="dot" aria-hidden="true">${i + 1}</span><span class="big" aria-hidden="true">0${i + 1}</span>` +
        `<h3 id="phase-${p.id}-h"><span class="label">${esc(p.title)}</span><span class="question">${esc(p.question)}</span></h3>` +
        `<div class="decides"><p class="who">${DECIDES}You decide</p><p>${esc(p.you)}</p>${gate}</div>` +
        `${boxes(p.boxes, p.id, model)}</section>`
      );
    })
    .join("\n");
  return [
    band("phase-across", "Across all phases", "What runs through every phase?", map.across, model),
    `<div class="timeline">\n${phases}\n</div>`,
    band("phase-catalog", "Then, in the catalog", "Is it listed?", map.catalog, model),
  ].join("\n");
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
    for (const marker of ["<!-- workshop:key -->", "<!-- workshop:board -->"]) {
      if (!template.includes(marker)) throw new Error(`${TEMPLATE}: the marker ${marker} is missing`);
    }
    mkdirSync(dirname(out), { recursive: true });
    const page = template
      .replace("<!-- workshop:key -->", key(map))
      .replace("<!-- workshop:board -->", render(map, model));
    writeFileSync(out, page);
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
