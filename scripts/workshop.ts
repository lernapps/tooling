// Renders the page "A workshop, not a factory" of the docs site (site/workshop/) from its mapping
// (site/workshop/workshop.yaml) and the building blocks of docs/arc42, as `arc42 get` reports them. The mapping says
// per phase what the person decides and what each block does there, for whom; the model gives each block its title,
// its place in the architecture app, its phases (`x-phase`, a list) and its kind (`x-kind`). Fails, with one line per
// problem, when a phase's boxes and the blocks with that phase in the model differ, when a block has no or an unknown
// kind, or when a skill's phase is not that of its group (bb-skills-<phase>).
//
//   node scripts/workshop.ts test          the check alone (test/workshop.test.ts)
//   node scripts/workshop.ts page <file>   writes the page (scripts/build.sh); fails like test
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  /** The block's `x-*` attributes, without the prefix, as written (arc42 ≥ 0.38). */
  extensions?: Record<string, string>;
}

/** One box: a block, or neighbouring blocks shown as one, and what it does for the agent and the person. */
interface Box {
  block?: string;
  blocks?: string[];
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

/** The building blocks of docs/arc42, as `arc42 get` reports them. */
export function blocks(): Map<string, Block> {
  const json = execFileSync(
    join(ROOT, "node_modules/.bin/arc42"),
    ["--dir", join(ROOT, "docs/arc42"), "get", "--type", "building-block", "--format", "json"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const { elements } = JSON.parse(json) as { elements: Block[] };
  return new Map(elements.map((block) => [block.id, block]));
}

export function mapping(): Mapping {
  return parse(readFileSync(MAPPING, "utf8")) as Mapping;
}

const idsOf = (box: Box) => box.blocks ?? (box.block === undefined ? [] : [box.block]);

/** The phases a block supports (`x-phase`), and its kind (`x-kind`). */
export const phasesOf = (block: Block | undefined) =>
  (block?.extensions?.["phase"] ?? "")
    .split(",")
    .map((phase) => phase.trim())
    .filter(Boolean);
export const kindOf = (block: Block | undefined) => block?.extensions?.["kind"]?.trim() ?? "";

/** The boxes of each phase of the page, including `across` and `catalog`. */
const sections = (map: Mapping): [string, Box[]][] => [
  ...map.phases.map((phase): [string, Box[]] => [phase.id, phase.boxes]),
  ["across", map.across],
  ["catalog", map.catalog],
];

/** One line per problem; none when mapping and model agree. */
export function problems(map: Mapping, model: Map<string, Block>): string[] {
  const found: string[] = [];
  const shown = new Set(sections(map).map(([id]) => id));
  for (const [phase, list] of sections(map)) {
    const here = new Set<string>();
    for (const box of list) {
      const ids = idsOf(box);
      if (ids.length === 0) found.push(`${phase}: a box without block: "${box.label ?? box.agent ?? box.person}"`);
      if (!box.agent && !box.person) found.push(`${phase}: ${ids.join(", ")} says nothing for the agent or the person`);
      const kinds = new Set(ids.map((id) => kindOf(model.get(id))));
      if (kinds.size > 1)
        found.push(`${phase}: ${ids.join(", ")} are one box but of the kinds ${[...kinds].join(", ")}`);
      for (const id of ids) {
        here.add(id);
        const block = model.get(id);
        if (!block) found.push(`${id}: no such building block in docs/arc42`);
        else if (!phasesOf(block).includes(phase))
          found.push(`${id}: shown in ${phase}, but its x-phase does not name it`);
      }
    }
    for (const block of model.values()) {
      if (phasesOf(block).includes(phase) && !here.has(block.id)) {
        found.push(`${block.id}: its x-phase names ${phase}, but the page has no box for it there`);
      }
    }
  }
  for (const block of model.values()) {
    const phases = phasesOf(block);
    if (phases.length === 0) continue;
    for (const phase of phases.filter((phase) => !shown.has(phase))) {
      found.push(`${block.id}: x-phase names ${phase}, which is no phase of the page`);
    }
    if (!map.kinds.includes(kindOf(block)))
      found.push(`${block.id}: x-kind "${kindOf(block)}" is not one of the kinds`);
    if (block.parent?.startsWith("bb-skills-") && phases.join() !== block.parent.slice("bb-skills-".length)) {
      found.push(`${block.id}: x-phase ${phases.join(", ")}, but its group is ${block.parent}`);
    }
  }
  for (const phase of map.phases) {
    if (!model.has(`bb-skills-${phase.id}`))
      found.push(`bb-skills-${phase.id}: the phase ${phase.id} has no skill group`);
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
    `<span class="t">${esc(title)}</span><span class="meta"><span class="kind">${esc(kindOf(model.get(ids[0] ?? "")))}</span>` +
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
