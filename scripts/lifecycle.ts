// The lifecycle view (docs/arc42 ch. 5, block "Lifecycle view"): the story of an app's lifecycle is described once, in
// site/lifecycle/lifecycle.yaml (which phase holds which blocks, what the person decides, what is planned), and this
// script renders it as the timeline of the page site/lifecycle/index.html. The architecture stays the model: the
// check fails when the story names a block chapter 5 does not have, leaves a block of the creator's path undrawn, or
// describes a phase differently from chapter 5 (docs/arc42 ch. 9, decision "dec-lifecycle-view").
//
//   node scripts/lifecycle.ts check            the check alone (test/lifecycle.test.ts): one line per problem, exit 1
//   node scripts/lifecycle.ts page <out-dir>   checks, then writes <out-dir>/index.html (scripts/build.sh)
//
// It reads chapter 5 as Markdown, so it runs without the architecture tool. A block's phase is not its heading in
// chapter 5 (a part sits under its parent), so the story is the only source of the phase; the check ties the two by id.
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

const STORY = "site/lifecycle/lifecycle.yaml";
const TEMPLATE = "site/lifecycle/index.html";
const CHAPTER = "docs/arc42/05-building-blocks.arc42.md";
/** Where the page links a block in the built architecture, from the page's own address. */
const ARCHITECTURE = "../architecture/";

/** The phases in their order; the titles are the sections of chapter 5 that describe them. */
export const PHASES = [
  { id: "plan", title: "Plan and scope" },
  { id: "build", title: "Build" },
  { id: "release", title: "Test and roll out" },
  { id: "monitor", title: "Monitor" },
] as const;
/** What runs through every phase, shown as a band above them. */
const ACROSS = { id: "across", title: "Across all phases" };
/** The sections of chapter 5 whose blocks are not part of the creator's path: the frame and what keeps the platform up. */
const OUTSIDE = ["@lernapps/tooling", "Platform upkeep"];
const PATH_SECTIONS: string[] = [ACROSS.title, ...PHASES.map((phase) => phase.title)];

export interface Block {
  id: string;
  title: string;
  parent: string | undefined;
  /** The level-2 heading of chapter 5 above the block. */
  section: string | undefined;
  file: string;
}

export interface Model {
  blocks: Map<string, Block>;
  /** The level-2 headings of the files read. */
  sections: Set<string>;
}

export interface Element {
  block: string | undefined;
  label: string | undefined;
  planned: boolean;
  note: string | undefined;
  /** Where the part answers to a goal: what the check or judgment answers to, in a word or two. */
  goal: string | undefined;
  /** What the person does or is given here; the person icon shows when it is set. */
  human: string | undefined;
  /** What the AI agent does with it; the agent icon shows when it is set. */
  agent: string | undefined;
}

/** Elements that belong together inside a phase, such as the checks, the release and the optional listing. */
export interface Group {
  id: string;
  title: string | undefined;
  lead: string | undefined;
  /** Not on the way of every app. */
  optional: boolean;
  /** Every element answers to a goal with an id. */
  goals: boolean;
  elements: Element[];
}

export interface Phase {
  id: string;
  title: string;
  question: string | undefined;
  /** Where the person decides; not for the band. */
  person: string | undefined;
  /** A sentence the phase ends on. */
  note: string | undefined;
  groups: Group[];
  /** All elements of all groups. */
  elements: Element[];
}

export interface Story {
  title: string;
  phases: Phase[];
  across: Phase;
}

// --- The model: chapter 5 as Markdown -------------------------------------------------------------------------------

const unquote = (value: string): string => (/^".*"$/.test(value) && value.length > 1 ? value.slice(1, -1) : value);

/** The building blocks of the files, each with its parent and the level-2 section it is in; headings inside fences do not count. */
export function parseModel(files: { file: string; text: string }[]): Model {
  const blocks = new Map<string, Block>();
  const sections = new Set<string>();
  for (const { file, text } of files) {
    let section: string | undefined;
    let fence: string | undefined;
    let open: (Partial<Record<"id" | "title" | "parent", string>> & Record<string, string>) | undefined;
    for (const line of text.split("\n")) {
      if (line.startsWith("```")) {
        fence = fence === undefined ? line.slice(3).trim() : undefined;
        open = undefined;
        continue;
      }
      if (fence === undefined) {
        const heading = /^(#{1,2}) (.+?)\s*$/.exec(line);
        if (heading?.[1] === "#") section = undefined;
        if (heading?.[1] === "##" && heading[2] !== undefined) {
          section = heading[2];
          sections.add(section);
        }
        continue;
      }
      if (fence !== "arc42") continue;
      if (line.trim() === ":::building-block") {
        open = {};
      } else if (open !== undefined && line.trim() === ":::") {
        const { id, title } = open;
        if (id !== undefined) blocks.set(id, { id, title: title ?? id, parent: open.parent, section, file });
        open = undefined;
      } else if (open !== undefined) {
        const attribute = /^([a-z][a-z0-9-]*):\s*(.*?)\s*$/.exec(line);
        if (attribute?.[1] !== undefined && attribute[2] !== undefined) open[attribute[1]] = unquote(attribute[2]);
      }
    }
  }
  return { blocks, sections };
}

// --- The story: the YAML ----------------------------------------------------------------------------------------------

/** A mapping of the YAML with the keys the story knows; the values are checked where they are used. */
type Raw = Partial<
  Record<
    | "block"
    | "label"
    | "planned"
    | "note"
    | "goal"
    | "human"
    | "agent"
    | "id"
    | "title"
    | "lead"
    | "optional"
    | "goals"
    | "question"
    | "person"
    | "elements"
    | "groups"
    | "phases"
    | "across",
    unknown
  >
>;
const isRecord = (value: unknown): value is Raw => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

function element(value: unknown): Element {
  const data = isRecord(value) ? value : {};
  return {
    block: text(data.block),
    label: text(data.label),
    planned: data.planned === true,
    note: text(data.note),
    goal: text(data.goal),
    human: text(data.human),
    agent: text(data.agent),
  };
}

function group(value: unknown, index: number): Group {
  const data = isRecord(value) ? value : {};
  return {
    id: text(data.id) ?? `group-${index + 1}`,
    title: text(data.title),
    lead: text(data.lead),
    optional: data.optional === true,
    goals: data.goals === true,
    elements: Array.isArray(data.elements) ? data.elements.map(element) : [],
  };
}

function phase(value: unknown): Phase {
  const data = isRecord(value) ? value : {};
  const main = Array.isArray(data.elements) ? [{ ...group({ elements: data.elements }, 0), id: "main" }] : [];
  const groups = [...main, ...(Array.isArray(data.groups) ? data.groups.map(group) : [])];
  return {
    id: text(data.id) ?? "",
    title: text(data.title) ?? "",
    question: text(data.question),
    person: text(data.person),
    note: text(data.note),
    groups,
    elements: groups.flatMap((entry) => entry.elements),
  };
}

/** The story as written; what is missing or wrong in a phase is the check's to report, not the parser's. */
export function parseStory(source: string): Story {
  const data: unknown = parse(source);
  const title = isRecord(data) ? text(data.title) : undefined;
  if (!isRecord(data) || title === undefined || !Array.isArray(data.phases) || !isRecord(data.across)) {
    throw new Error("the story needs a title, a list of phases and an across mapping");
  }
  return { title, phases: data.phases.map(phase), across: { ...phase(data.across), id: ACROSS.id } };
}

// --- The check ------------------------------------------------------------------------------------------------------

/** What is wrong between the story and chapter 5, one line each with the fix; nothing when they agree. */
export function checkStory(story: Story, model: Model): string[] {
  const problems: string[] = [];
  const problem = (code: string, what: string, fix: string) => problems.push(`${code}: ${what} Fix: ${fix}`);

  const expectedIds = PHASES.map((entry) => entry.id).join(", ");
  const ids = story.phases.map((entry) => entry.id).join(", ");
  if (ids !== expectedIds) {
    problem("phase-ids", `the phases are ${ids || "none"}.`, `list exactly ${expectedIds} in ${STORY}, in this order.`);
  }
  const groups = [...story.phases, story.across];
  for (const [index, group] of groups.entries()) {
    const expected = index < story.phases.length ? PHASES[index]?.title : ACROSS.title;
    const where = group.title || group.id || `phase ${index + 1}`;
    if (group.title !== expected || expected === undefined) {
      problem(
        "phase-title",
        `the phase "${where}" is titled "${group.title}", not "${expected ?? "(none)"}".`,
        `use the title of its section in chapter 5, "${expected ?? ""}".`,
      );
    } else if (!model.sections.has(group.title)) {
      problem(
        "phase-title",
        `chapter 5 has no section "${group.title}".`,
        "add the section to chapter 5, or change PHASES in scripts/lifecycle.ts with it.",
      );
    }
    const missing = [group.question === undefined ? "question" : "", ""];
    for (const key of missing.filter(Boolean)) {
      problem("phase-text", `the phase "${where}" has no ${key}.`, `write its ${key} in ${STORY}, in a sentence.`);
    }
  }

  const drawn = new Set<string>();
  for (const phaseGroup of groups) {
    const seen = new Set<string>();
    let number = 0;
    for (const part of phaseGroup.groups) {
      if (part.id !== "main" && part.title === undefined) {
        problem(
          "group-title",
          `a group of "${phaseGroup.title}" has no title.`,
          `write \`title\` for the group "${part.id}" in ${STORY}.`,
        );
      }
      for (const item of part.elements) {
        number += 1;
        const where = `${phaseGroup.title}, element ${number}`;
        if (item.human === undefined && item.agent === undefined) {
          problem(
            "element-how",
            `${where} does not say what it does for whom.`,
            "write `human:` (what the person does or is given), `agent:` (what the agent does), or both.",
          );
        }
        if (part.goals && item.goal === undefined) {
          problem(
            "element-goal",
            `${where} is in "${part.title ?? part.id}", where every part answers to a goal, and has none.`,
            "name what it answers to in `goal`, such as `rule id` or `rubric item id`.",
          );
        }
        if (!part.goals && item.goal !== undefined) {
          problem(
            "element-goal",
            `${where} has a goal but its group does not answer to goals.`,
            "remove `goal`, or put `goals: true` on the group.",
          );
        }
        if (item.planned) {
          if (item.block !== undefined) {
            problem(
              "element-planned",
              `${where} is planned but names the block ${item.block}.`,
              "a planned item is no block: remove `block`; it keeps `label`, `planned: true` and `note`.",
            );
          }
          if (item.label === undefined || item.note === undefined) {
            problem(
              "element-planned",
              `${where} is planned and needs a label and a note.`,
              "say what it is and why it is not built in `label` and `note`.",
            );
          }
          continue;
        }
        if (item.block === undefined || item.label !== undefined) {
          problem(
            "element-shape",
            `${where} is not a block: it has ${item.block === undefined ? "no `block`" : "a `label`"}.`,
            "an element is `block: <id>` (its title comes from chapter 5) or a planned item with `label`, `planned: true`, `note`.",
          );
          continue;
        }
        const block = model.blocks.get(item.block);
        if (block === undefined) {
          problem(
            "block-unknown",
            `${where} names ${item.block}, which chapter 5 does not have.`,
            "use the id of a building block of chapter 5.",
          );
          continue;
        }
        if (block.section !== undefined && OUTSIDE.includes(block.section)) {
          problem(
            "block-outside",
            `${where} names ${block.id} (${block.title}), which is in "${block.section}" and not on the creator's path.`,
            "remove it; the lifecycle shows only blocks the creator's path uses.",
          );
          continue;
        }
        if (seen.has(block.id)) {
          problem(
            "block-twice",
            `${phaseGroup.title} draws ${block.id} twice.`,
            "keep one element; a block may appear in several phases.",
          );
        }
        seen.add(block.id);
        drawn.add(block.id);
      }
    }
  }

  const children = new Map<string, string[]>();
  for (const block of model.blocks.values()) {
    if (block.parent !== undefined) children.set(block.parent, [...(children.get(block.parent) ?? []), block.id]);
  }
  const covered = (id: string): boolean => drawn.has(id) || (children.get(id) ?? []).some(covered);
  for (const block of model.blocks.values()) {
    if (block.section !== undefined && OUTSIDE.includes(block.section)) continue;
    if (block.section === undefined || !PATH_SECTIONS.includes(block.section)) {
      problem(
        "section-unknown",
        `${block.id} is in the section "${block.section ?? "(none)"}" of chapter 5, which is neither a phase nor ${OUTSIDE.join(" or ")}.`,
        "move it under a phase section, or add the section to PHASES or OUTSIDE in scripts/lifecycle.ts.",
      );
    } else if (!covered(block.id)) {
      problem(
        "block-undrawn",
        `${block.id} (${block.title}) in "${block.section}" of chapter 5 is not drawn in any phase.`,
        `add "- block: ${block.id}" to a phase in ${STORY}.`,
      );
    }
  }
  return problems;
}

// --- The timeline --------------------------------------------------------------------------------------------------

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const anchor = (block: Block, base: string): string => `${base}#${block.file}:el-${block.id}`;

const ARROW =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PERSON =
  '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" fill="currentColor"/></svg>';
/** Two outline icons on one grid: a person, and the sparkle that stands for an AI agent. */
const ICONS: Record<string, { name: string; svg: string }> = {
  human: {
    name: "Person",
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c.6-3.9 3.3-6 7-6s6.4 2.1 7 6"/></g></svg>',
  },
  agent: {
    name: "AI agent",
    svg: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M12 4c.7 5 2.8 7.3 8 8-5.2.7-7.3 3-8 8-.7-5-2.8-7.3-8-8 5.2-.7 7.3-3 8-8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  },
};

/** The icons of the people and agents that work with a part, person first. */
function actors(item: Element): string {
  const icons = (["human", "agent"] as const)
    .filter((actor) => item[actor] !== undefined)
    .map((actor) => {
      const icon = ICONS[actor];
      if (icon === undefined) throw new Error(`no icon for ${actor}`);
      return `<span class="actor ${actor}" role="img" aria-label="${icon.name}" title="${icon.name}">${icon.svg}</span>`;
    });
  return `<span class="actors">${icons.join("")}</span>`;
}

/** What the part does for whom, as the text that opens on hover and focus: one line for the person, one for the agent. */
function how(item: Element, id: string): string {
  const rows = (["human", "agent"] as const)
    .filter((actor) => item[actor] !== undefined)
    .map((actor) => {
      const icon = ICONS[actor];
      return (
        `<p class="how-row"><span class="actor ${actor}" aria-hidden="true">${icon?.svg ?? ""}</span>` +
        `<span><strong>${icon?.name ?? actor}</strong> ${esc(item[actor] ?? "")}</span></p>`
      );
    });
  return `<div class="how" id="${id}" role="tooltip">${rows.join("")}</div>`;
}

/** One element: a block links into the architecture, a planned item is no link and says it is not built. */
function chip(item: Element, model: Model, base: string, id: string): string {
  if (item.planned) {
    const note = item.note === undefined ? "" : `<span class="note">${esc(item.note)}</span>`;
    return (
      `<li class="chip planned" data-planned="true" tabindex="0" aria-describedby="${id}"><span class="row"><span class="t">${esc(item.label ?? "")}</span><span class="meta">${actors(item)}</span></span>` +
      `<span class="tag">Planned, not built</span>${note}${how(item, id)}</li>`
    );
  }
  const block = model.blocks.get(item.block ?? "");
  if (block === undefined) throw new Error(`the block ${item.block ?? "(none)"} is not in chapter 5`);
  const goal = item.goal === undefined ? "" : `<span class="goal">${esc(item.goal)}</span>`;
  return (
    `<li class="chip" data-bb="${esc(block.id)}"><a href="${esc(anchor(block, base))}" aria-describedby="${id}"><span class="t">${esc(block.title)}</span>` +
    `<span class="meta">${goal}${actors(item)}<span class="go">${ARROW}</span></span></a>${how(item, id)}</li>`
  );
}

/** A counter for the ids that tie a box to its text; the prefix keeps the band and the timeline apart. */
const counter = (prefix: string) => {
  let n = 0;
  return () => `${prefix}-${(n += 1)}`;
};

const chips = (items: Element[], model: Model, base: string, next: () => string): string =>
  `<ul class="chips">${items.map((item) => chip(item, model, base, next())).join("")}</ul>`;

/** What the two icons mean, for the key under the intro. */
export function renderKey(): string {
  const entry = (actor: string, what: string) =>
    `<li><span class="actor ${actor}" aria-hidden="true">${ICONS[actor]?.svg ?? ""}</span><span><strong>${ICONS[actor]?.name ?? actor}</strong> ${what}</span></li>`;
  return `<ul class="key" aria-label="Who works with a part">${entry("human", "decides or is asked")}${entry("agent", "works from it")}</ul>`;
}

/** What runs through every phase, as a band above the timeline. */
export function renderBand(story: Story, model: Model, base: string): string {
  const id = `phase-${story.across.id}`;
  return (
    `<section class="band" id="${esc(id)}" aria-labelledby="${esc(id)}-h">` +
    `<h3 id="${esc(id)}-h"><span class="label">${esc(story.across.title)}</span><span class="question">${esc(story.across.question ?? "")}</span></h3>` +
    `${chips(story.across.elements, model, base, counter("how-band"))}</section>`
  );
}

/** The phases as a timeline: a question and the person's decision per phase, then the parts that act in it. */
export function renderTimeline(story: Story, model: Model, base: string): string {
  const next = counter("how");
  const section = (entry: Phase, index: number): string => {
    const id = `phase-${entry.id}`;
    const decides =
      entry.person === undefined
        ? ""
        : `<div class="decides"><p class="who">${PERSON}The person decides</p><p>${esc(entry.person)}</p></div>`;
    const grouped = entry.groups.some((part) => part.title !== undefined);
    const body = grouped
      ? `<div class="groups">${entry.groups
          .map((part) => {
            const optional = part.optional ? '<span class="tag">Optional</span>' : "";
            const lead = part.lead === undefined ? "" : `<p class="lead">${esc(part.lead)}</p>`;
            const title = part.title === undefined ? "" : `<h4>${esc(part.title)}${optional}</h4>`;
            return `<div class="group${part.optional ? " optional" : ""}">${title}${lead}${chips(part.elements, model, base, next)}</div>`;
          })
          .join("")}</div>`
      : chips(entry.elements, model, base, next);
    const note = entry.note === undefined ? "" : `<p class="axiom">${esc(entry.note)}</p>`;
    return (
      `<section class="phase" id="${esc(id)}" aria-labelledby="${esc(id)}-h"><span class="dot" aria-hidden="true">${index + 1}</span>` +
      `<span class="big" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>` +
      `<h3 id="${esc(id)}-h"><span class="label">${esc(entry.title)}</span><span class="question">${esc(entry.question ?? "")}</span></h3>` +
      `${decides}${body}${note}</section>`
    );
  };
  return story.phases.map(section).join("\n");
}

/** The page: the template with the key, the band and the timeline at their places. */
export function buildPage(template: string, story: Story, model: Model, base: string): string {
  const places: Record<string, string> = {
    "<!--lifecycle:key-->": renderKey(),
    "<!--lifecycle:band-->": renderBand(story, model, base),
    "<!--lifecycle:timeline-->": renderTimeline(story, model, base),
  };
  let page = template;
  for (const [marker, content] of Object.entries(places)) {
    if (!page.includes(marker)) throw new Error(`the template ${TEMPLATE} has no ${marker}`);
    page = page.replace(marker, () => content);
  }
  return page;
}

// --- The command ----------------------------------------------------------------------------------------------------

function main(args: string[]): number {
  const [command, out] = args;
  if (!((command === "check" && args.length === 1) || (command === "page" && out !== undefined && args.length === 2))) {
    process.stderr.write("usage: node scripts/lifecycle.ts check | page <out-dir>\n");
    return 2;
  }
  const root = resolve(import.meta.dirname, "..");
  let story: Story;
  try {
    story = parseStory(readFileSync(join(root, STORY), "utf8"));
  } catch (error) {
    process.stderr.write(`lifecycle: ${STORY}: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
  const model = parseModel([{ file: basename(CHAPTER), text: readFileSync(join(root, CHAPTER), "utf8") }]);
  const problems = checkStory(story, model);
  if (problems.length > 0) {
    process.stderr.write(`${problems.map((entry) => `lifecycle: ${entry}`).join("\n")}\n`);
    return 1;
  }
  if (command === "page" && out !== undefined) {
    mkdirSync(resolve(out), { recursive: true });
    writeFileSync(
      resolve(out, "index.html"),
      buildPage(readFileSync(join(root, TEMPLATE), "utf8"), story, model, ARCHITECTURE),
    );
    process.stdout.write(`lifecycle: page written to ${out}\n`);
  } else {
    const blocks = new Set(
      [...story.phases, story.across].flatMap((entry) => entry.elements.map((item) => item.block)),
    );
    process.stdout.write(`lifecycle: ${story.phases.length} phases, ${blocks.size} blocks drawn, all in chapter 5\n`);
  }
  return 0;
}

const script = process.argv[1];
if (script !== undefined && existsSync(script) && import.meta.url === pathToFileURL(realpathSync(script)).href) {
  process.exitCode = main(process.argv.slice(2));
}
