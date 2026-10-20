// Renders the page "A workshop, not a factory" of the docs site (site/workshop/) from the elements of docs/arc42, as
// `arc42 get` reports them, and the phases of site/workshop/workshop.yaml. An element (building block or interface)
// supports the phases its `x-phase` names and says what it does for the agent (`x-agent`) and
// the person (`x-person`); its box shows its title and technology (a block) or protocol (an interface), and links its
// card in the architecture app. Fails, with one line
// per problem, when an element names an unknown phase, says nothing for agent or person, or when a skill's
// phase is not the phase of its group (bb-skills-<phase>).
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

export interface Element {
  id: string;
  kind: string;
  title: string;
  /** What a building block is built with. */
  technology?: string;
  /** How an interface is used. */
  protocol?: string;
  parent?: string;
  loc: { file: string; line: number };
  /** The element's `x-*` attributes, without the prefix, as written (arc42 ≥ 0.38). */
  extensions?: Record<string, string>;
}

interface Section {
  label: string;
  question: string;
}

interface Phase {
  id: string;
  title: string;
  question: string;
  you: string;
  gate?: string;
}

export interface Mapping {
  across: Section;
  phases: Phase[];
  catalog: Section;
}

/** The building blocks and interfaces of docs/arc42, as `arc42 get` reports them. */
export function elements(): Element[] {
  const json = execFileSync(
    join(ROOT, "node_modules/.bin/arc42"),
    ["--dir", join(ROOT, "docs/arc42"), "get", "--format", "json"],
    {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  const { elements: all } = JSON.parse(json) as { elements: Element[] };
  return all.filter((element) => element.kind === "building-block" || element.kind === "interface");
}

export function mapping(): Mapping {
  return parse(readFileSync(MAPPING, "utf8")) as Mapping;
}

const ext = (element: Element, key: string) => element.extensions?.[key]?.trim() ?? "";
/** The phases an element supports (`x-phase`, a list). */
export const phasesOf = (element: Element) =>
  ext(element, "phase")
    .split(",")
    .map((phase) => phase.trim())
    .filter(Boolean);
const PHASE_IDS = (map: Mapping) => ["across", ...map.phases.map((phase) => phase.id), "catalog"];

/** One line per problem; none when the elements fit the page. */
export function problems(map: Mapping, all: Element[]): string[] {
  const found: string[] = [];
  const ids = PHASE_IDS(map);
  for (const element of all) {
    const phases = phasesOf(element);
    const skill = element.parent?.startsWith("bb-skills-");
    if (phases.length === 0) {
      if (skill) found.push(`${element.id}: a skill without x-phase`);
      continue;
    }
    for (const phase of phases.filter((phase) => !ids.includes(phase))) {
      found.push(`${element.id}: x-phase names ${phase}, which is no phase of the page`);
    }
    if (!ext(element, "agent") && !ext(element, "person"))
      found.push(`${element.id}: says nothing in x-agent or x-person`);
    if (skill && phases.join() !== element.parent?.slice("bb-skills-".length)) {
      found.push(`${element.id}: x-phase ${phases.join(", ")}, but its group is ${element.parent}`);
    }
  }
  for (const phase of map.phases) {
    if (!all.some((element) => element.id === `bb-skills-${phase.id}`)) {
      found.push(`bb-skills-${phase.id}: the phase ${phase.id} has no skill group`);
    }
  }
  return found;
}

/** The elements of one phase, in the order of the chapters. */
export function inPhase(all: Element[], phase: string): Element[] {
  return all
    .filter((element) => phasesOf(element).includes(phase))
    .sort((a, b) => a.loc.file.localeCompare(b.loc.file) || a.loc.line - b.loc.line);
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

/** The element's card in the architecture app of this site, which opens an element at `#<chapter file>:el-<id>`. */
const href = (element: Element) => `../architecture/#${basename(element.loc.file)}:el-${element.id}`;

/** A box: its link with title, technology or protocol, and who works with it; what it does for whom opens on hover and focus. */
function box(element: Element, id: string): string {
  const person = ext(element, "person");
  const agent = ext(element, "agent");
  const who = [person ? actor("person") : "", agent ? actor("agent") : ""].join("");
  const rows = [
    person ? `<p class="how-row">${actor("person", false)}<span><strong>Person</strong> ${esc(person)}</span></p>` : "",
    agent ? `<p class="how-row">${actor("agent", false)}<span><strong>AI agent</strong> ${esc(agent)}</span></p>` : "",
  ].join("");
  return (
    `<li class="chip" data-element="${element.id}"><a href="${esc(href(element))}" aria-describedby="${id}">` +
    `<span class="t">${esc(element.title)}</span><span class="meta"><span class="actors">${who}</span>` +
    `<span class="go">${GO}</span></span><span class="tech">${esc(element.technology ?? element.protocol ?? "")}</span></a>` +
    `<div class="how" id="${id}" role="tooltip">${rows}</div></li>`
  );
}

const boxes = (list: Element[], phase: string) =>
  `<ul class="chips">${list.map((element, i) => box(element, `how-${phase}-${i + 1}`)).join("")}</ul>`;

function band(map: Mapping, all: Element[], phase: "across" | "catalog"): string {
  const { label, question } = map[phase];
  const id = `phase-${phase}`;
  return (
    `<section class="band" id="${id}" aria-labelledby="${id}-h"><h3 id="${id}-h"><span class="label">${esc(label)}</span>` +
    `<span class="question">${esc(question)}</span></h3>${boxes(inPhase(all, phase), phase)}</section>`
  );
}

/** The key under the introduction: who works with a box. */
export function key(): string {
  return (
    '<ul class="key" aria-label="Who works with a part">' +
    `<li>${actor("person", false)}<span><strong>Person</strong> decides or is asked</span></li>` +
    `<li>${actor("agent", false)}<span><strong>AI agent</strong> works from it</span></li></ul>`
  );
}

/** The board: what runs through every phase, the phases of the plan, then the catalog. */
export function render(map: Mapping, all: Element[]): string {
  const phases = map.phases
    .map((p, i) => {
      const gate = p.gate ? `<p class="gate">${esc(p.gate)}</p>` : "";
      return (
        `<section class="phase" id="phase-${p.id}" aria-labelledby="phase-${p.id}-h">` +
        `<span class="dot" aria-hidden="true">${i + 1}</span><span class="big" aria-hidden="true">0${i + 1}</span>` +
        `<h3 id="phase-${p.id}-h"><span class="label">${esc(p.title)}</span><span class="question">${esc(p.question)}</span></h3>` +
        `<div class="decides"><p class="who">${DECIDES}You decide</p><p>${esc(p.you)}</p>${gate}</div>` +
        `${boxes(inPhase(all, p.id), p.id)}</section>`
      );
    })
    .join("\n");
  return [band(map, all, "across"), `<div class="timeline">\n${phases}\n</div>`, band(map, all, "catalog")].join("\n");
}

function main(argv: string[]): number {
  const [command, out] = argv;
  if (command !== "test" && !(command === "page" && out)) {
    process.stderr.write("usage: node scripts/workshop.ts test | page <file>\n");
    return 2;
  }
  const map = mapping();
  const all = elements();
  const found = problems(map, all);
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
    writeFileSync(
      out,
      template.replace("<!-- workshop:key -->", key()).replace("<!-- workshop:board -->", render(map, all)),
    );
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
