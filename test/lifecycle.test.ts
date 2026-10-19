// The lifecycle view (docs/arc42 ch. 5, block "Lifecycle view"): the story of an app's lifecycle is described once, in
// site/lifecycle/lifecycle.yaml, and rendered by scripts/lifecycle.ts. The check ties the description to chapter 5:
// every block it names exists, every block of the creator's path is drawn, planned items name no block, every part says
// who works with it. Fast, on strings; the last test runs the script on this repo.
import { describe, expect, test } from "vite-plus/test";
import {
  buildPage,
  checkStory,
  parseModel,
  parseStory,
  renderBand,
  renderKey,
  renderTimeline,
  type Model,
} from "../scripts/lifecycle.ts";
import { repoRoot, run } from "./support.ts";

const block = (id: string, title: string, extra = "") =>
  `\`\`\`arc42\n:::building-block\nid: ${id}\ntitle: ${title}\n${extra}:::\n\`\`\`\n`;

/** A chapter 5 with every phase section and one block in each, and two blocks outside the lifecycle. */
const CHAPTER = [
  "# Building Blocks",
  "## Level 1",
  "```mermaid\nflowchart TB\n## not a heading\n```",
  "## @lernapps/tooling",
  block("bb-package", "@lernapps/tooling"),
  "## Across all phases",
  "### Process guidance",
  block("bb-guidance", "Process guidance", "parent: bb-package\n"),
  "### Skills",
  block("bb-skills", "Skills", "parent: bb-package\n"),
  "#### Exploration",
  block("bb-skills-exploration", "Exploration", "parent: bb-skills\n"),
  "## Plan and scope",
  "## Build",
  "### Generator",
  block("bb-generator", "Generator", "parent: bb-package\n"),
  "## Test and roll out",
  "### Check CLI",
  block("bb-check", "Check CLI", "parent: bb-package\n"),
  "### Review procedure",
  block("bb-review", "Review procedure", "parent: bb-package\n"),
  "### App publish",
  block("bb-publish", "App publish"),
  "## Monitor",
  "### Evals",
  block("bb-evals", "Evals", "parent: bb-package\n"),
  "## Platform upkeep",
  block("bb-upkeep", 'Platform "upkeep"'),
  "### Lifecycle view",
  block("bb-view", "Lifecycle view", "parent: bb-upkeep\n"),
].join("\n\n");

const STORY = `
title: The lifecycle of an app
phases:
  - id: plan
    title: Plan and scope
    question: What is the app for?
    person: What the app is for
    elements:
      - block: bb-skills-exploration
        agent: "Works from it."
  - id: build
    title: Build
    question: Does the app keep the goals?
    elements:
      - block: bb-generator
        agent: "Works from it."
  - id: release
    title: Test and roll out
    question: Does the app hold, and does it go out?
    person: Whether it goes out
    note: A judgment may vary.
    groups:
      - id: checks
        title: Decided by a program
        lead: Same result everywhere.
        goals: true
        elements:
          - block: bb-check
            goal: rule id
            agent: "Works from it."
      - id: release
        title: Released at the person's yes
        elements:
          - block: bb-publish
            human: "Is asked."
            agent: "Works from it."
      - id: listing
        title: Listed in the app overview
        optional: true
        goals: true
        elements:
          - block: bb-review
            goal: rubric item id
            human: "Is asked."
            agent: "Works from it."
  - id: monitor
    title: Monitor
    question: Where were the goals not held?
    person: Which guesses become rules
    elements:
      - block: bb-evals
        human: "Is asked."
        agent: "Works from it."
      - block: bb-review
        human: "Is asked."
        agent: "Works from it."
      - label: Evaluating agent sessions
        planned: true
        human: "Is asked."
        agent: "Works from it."
        note: Sessions the owner owns, not built yet.
across:
  title: Across all phases
  question: What runs through every phase?
  elements:
    - block: bb-guidance
      human: "Is asked."
      agent: "Works from it."
`;

function model(chapter = CHAPTER): Model {
  return parseModel([{ file: "05-building-blocks.arc42.md", text: chapter }]);
}
const story = (yaml = STORY) => parseStory(yaml);
const problems = (yaml = STORY, chapter = CHAPTER) => checkStory(story(yaml), model(chapter)).join("\n");

describe("the model of chapter 5", () => {
  test("reads blocks with their parent and the section they are in, not headings inside fences", () => {
    const { blocks, sections } = model();
    expect(blocks.get("bb-check")).toMatchObject({
      title: "Check CLI",
      parent: "bb-package",
      section: "Test and roll out",
    });
    expect(blocks.get("bb-skills-exploration")?.section).toBe("Across all phases");
    expect(blocks.get("bb-upkeep")?.title).toBe('Platform "upkeep"');
    expect(sections.has("Plan and scope")).toBe(true);
    expect(sections.has("not a heading")).toBe(false);
  });
});

describe("the story", () => {
  test("reads the elements of a phase as one group, or the groups it lists, and all elements of both", () => {
    const [plan, , release] = story().phases;
    expect(plan?.groups.map((entry) => entry.id)).toEqual(["main"]);
    expect(release?.groups.map((entry) => entry.id)).toEqual(["checks", "release", "listing"]);
    expect(release?.elements.map((item) => item.block)).toEqual(["bb-check", "bb-publish", "bb-review"]);
    expect(release?.groups[2]).toMatchObject({ optional: true, goals: true });
  });
});

describe("the check", () => {
  test("accepts a story that matches the chapter, with a block in two phases and a planned item", () => {
    expect(problems()).toBe("");
  });

  test("a block that is not in chapter 5", () => {
    expect(problems(STORY.replace("bb-generator", "bb-gone"))).toContain("block-unknown");
  });

  test("a block of the creator's path that is never drawn, with the section it is in", () => {
    const withoutPublish = STORY.replace(
      /\n {10}- block: bb-publish\n {12}human: "Is asked."\n {12}agent: "Works from it."/,
      "",
    );
    expect(withoutPublish).not.toBe(STORY);
    const text = problems(withoutPublish);
    expect(text).toContain("block-undrawn");
    expect(text).toContain("bb-publish");
    expect(text).toContain("Test and roll out");
  });

  test("a parent counts as drawn when a part of it is drawn", () => {
    expect(problems()).not.toContain("bb-skills ");
  });

  test("a block outside the lifecycle", () => {
    expect(problems(STORY.replace("bb-generator", "bb-view"))).toContain("block-outside");
    expect(problems(STORY.replace("bb-generator", "bb-package"))).toContain("block-outside");
  });

  test("a planned item names no block and says what it is", () => {
    const planned = "      - label: Evaluating agent sessions\n        planned: true\n";
    expect(problems(STORY.replace(planned, `${planned}        block: bb-evals\n`))).toContain("element-planned");
    expect(problems(STORY.replace("        note: Sessions the owner owns, not built yet.\n", ""))).toContain(
      "element-planned",
    );
  });

  test("an element is a block or a planned item, and takes its label from the model", () => {
    expect(problems(STORY.replace("      - block: bb-generator", "      - note: nothing"))).toContain("element-shape");
    expect(
      problems(STORY.replace("      - block: bb-generator", "      - block: bb-generator\n        label: Mine")),
    ).toContain("element-shape");
  });

  test("a block twice in one phase", () => {
    const twice = STORY.replace(
      "      - block: bb-generator\n",
      '      - block: bb-generator\n        agent: "x"\n      - block: bb-generator\n',
    );
    expect(problems(twice)).toContain("block-twice");
  });

  test("every element says what it does for the person, the agent or both", () => {
    const none = STORY.replace(
      '      - block: bb-generator\n        agent: "Works from it."\n',
      "      - block: bb-generator\n",
    );
    expect(none).not.toBe(STORY);
    expect(problems(none)).toContain("element-how");
    expect(problems(STORY.replace('agent: "Works from it."', 'agent: ""'))).toContain("element-how");
    expect(problems(STORY)).not.toContain("element-how");
  });

  test("where a group answers to goals every element has one, and elsewhere none does", () => {
    expect(problems(STORY.replace("            goal: rule id\n", ""))).toContain("element-goal");
    expect(
      problems(STORY.replace("      - block: bb-generator\n", "      - block: bb-generator\n        goal: rule id\n")),
    ).toContain("element-goal");
  });

  test("a titled group needs a title", () => {
    expect(problems(STORY.replace("        title: Decided by a program\n", ""))).toContain("group-title");
  });

  test("the phases are the four, in order, named like the sections of chapter 5", () => {
    expect(problems(STORY.replace("id: release\n    title", "id: roll-out\n    title"))).toContain("phase-ids");
    expect(problems(STORY.replace("title: Test and roll out", "title: Test"))).toContain("phase-title");
    expect(problems(STORY.replace("title: Across all phases", "title: Everywhere"))).toContain("phase-title");
  });

  test("a phase needs its question; where the person decides is optional", () => {
    expect(problems(STORY.replace("    question: Does the app keep the goals?\n", ""))).toContain("phase-text");
    expect(problems(STORY.replace("    person: What the app is for\n", ""))).toBe("");
  });

  test("a block under a heading that is neither a phase nor outside", () => {
    expect(problems(STORY, CHAPTER.replace("## Monitor", "## Somewhere"))).toContain("section-unknown");
  });

  test("says how to fix every problem", () => {
    for (const bad of [
      STORY.replace("bb-generator", "bb-gone"),
      STORY.replace("title: Test and roll out", "title: Test"),
    ]) {
      expect(problems(bad)).toMatch(/Fix:/);
    }
  });
});

describe("the timeline", () => {
  const html = () => renderTimeline(story(), model(), "../architecture/");

  test("has a section per phase, each with its question as a heading, and not the band", () => {
    for (const id of ["plan", "build", "release", "monitor"]) {
      expect(html()).toContain(`id="phase-${id}-h"`);
    }
    expect(html()).not.toContain("phase-across");
    expect(html()).toContain('<span class="question">Does the app hold, and does it go out?</span>');
  });

  test("links a block into the architecture, and a block twice when two phases have it", () => {
    expect(html()).toContain('href="../architecture/#05-building-blocks.arc42.md:el-bb-publish"');
    expect(html().match(/data-bb="bb-review"/g)).toHaveLength(2);
  });

  test("says where the person decides, only in the phases that say so, and ends a phase on its note", () => {
    expect(html()).toContain("Whether it goes out");
    expect(html().match(/The person decides/g)).toHaveLength(3);
    const build = html().match(/id="phase-build"[\s\S]*?<\/section>/)?.[0] ?? "";
    expect(build).not.toContain("The person decides");
    expect(html()).toContain('<p class="axiom">A judgment may vary.</p>');
  });

  test("lists the groups of a phase in order, marks the optional one and shows the goal of each part", () => {
    const release = html().match(/id="phase-release"[\s\S]*?<\/section>/)?.[0] ?? "";
    const titles = [...release.matchAll(/<h4>(.*?)(?:<span|<\/h4>)/g)].map((match) => match[1]);
    expect(titles).toEqual(["Decided by a program", "Released at the person's yes", "Listed in the app overview"]);
    expect(release.match(/<div class="group optional">[\s\S]*?<\/div>/)?.[0]).toContain("Review procedure");
    expect(release).toContain('<span class="tag">Optional</span>');
    expect(release).toContain('<span class="goal">rule id</span>');
    expect(release).toContain('<span class="goal">rubric item id</span>');
  });

  test("shows who works with a part as icons with a name for assistive technology", () => {
    const publish = html().match(/data-bb="bb-publish"[\s\S]*?<\/li>/)?.[0] ?? "";
    expect(publish).toContain('class="actor human" role="img" aria-label="Person"');
    expect(publish).toContain('class="actor agent" role="img" aria-label="AI agent"');
    const generator = html().match(/data-bb="bb-generator"[\s\S]*?<\/li>/)?.[0] ?? "";
    expect(generator).not.toContain("actor human");
    expect(generator).toContain("actor agent");
  });

  test("the icons are the lines of the text: a part has the person icon exactly when it says what the person does", () => {
    const evals = html().match(/data-bb="bb-evals"[\s\S]*?<\/li>/)?.[0] ?? "";
    const yaml = STORY.replace(/- block: bb-evals\n {8}human: "Is asked."\n/, "- block: bb-evals\n");
    expect(yaml).not.toBe(STORY);
    const changed = renderTimeline(story(yaml), model(), "../architecture/");
    const evalsWithout = changed.match(/data-bb="bb-evals"[\s\S]*?<\/li>/)?.[0] ?? "";
    expect(evals).toContain("actor human");
    expect(evalsWithout).not.toContain("actor human");
    expect(evalsWithout).not.toContain("<strong>Person</strong>");
  });

  test("explains each part on hover and focus: one line per actor, tied to the box for assistive technology", () => {
    const publish = html().match(/data-bb="bb-publish"[\s\S]*?<\/li>/)?.[0] ?? "";
    const id = publish.match(/aria-describedby="([^"]+)"/)?.[1] ?? "";
    expect(id).not.toBe("");
    expect(publish).toContain(`<div class="how" id="${id}" role="tooltip">`);
    expect(publish).toContain("<strong>Person</strong> Is asked.");
    expect(publish).toContain("<strong>AI agent</strong> Works from it.");
    const ids = [...html().matchAll(/class="how" id="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("a planned item can be focused to read its text", () => {
    const planned = html().match(/<li class="chip planned"[\s\S]*?<\/li>/)?.[0] ?? "";
    expect(planned).toContain('tabindex="0"');
    expect(planned).toContain('class="how"');
  });

  test("shows a planned item with a text marker and the actors, without a link", () => {
    const planned = html().match(/<li class="chip planned"[\s\S]*?<\/li>/)?.[0] ?? "";
    expect(planned).toContain("Evaluating agent sessions");
    expect(planned).toContain("Planned, not built");
    expect(planned).toContain("actor human");
    expect(planned).not.toContain("<a ");
  });

  test("escapes what it is given and has no script or external reference", () => {
    const text = renderTimeline(story(STORY.replace("What is the app for?", "<b>x</b>")), model(), "../architecture/");
    expect(text).not.toContain("<b>");
    expect(html()).not.toMatch(/<script|<img|https?:\/\//);
  });
});

describe("the band and the key", () => {
  test("the band shows what runs through every phase, above the phases", () => {
    const band = renderBand(story(), model(), "../architecture/");
    expect(band).toContain("What runs through every phase?");
    expect(band).toContain("Process guidance");
    expect(band).toContain("actor human");
    const ids = [...band.matchAll(/class="how" id="([^"]+)"/g)].map((match) => match[1]);
    const timeline = renderTimeline(story(), model(), "../architecture/");
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(timeline).not.toContain(`id="${id}"`);
  });

  test("the key says what both icons mean", () => {
    expect(renderKey()).toContain("Person");
    expect(renderKey()).toContain("AI agent");
  });
});

describe("the page", () => {
  const template = "<main><!--lifecycle:key--><!--lifecycle:band--><!--lifecycle:timeline--></main>";

  test("fills the template at its three places, the band before the phases", () => {
    const page = buildPage(template, story(), model(), "../architecture/");
    expect(page).toContain('id="phase-build"');
    expect(page).not.toContain("<!--lifecycle:");
    expect(page.indexOf("phase-across")).toBeLessThan(page.indexOf("phase-plan"));
  });

  test("refuses a template without one of its places", () => {
    expect(() => buildPage("<main></main>", story(), model(), "../architecture/")).toThrow(/lifecycle:key/);
  });
});

test("the story of this repo matches its architecture", () => {
  const result = run("node", ["scripts/lifecycle.ts", "check"], repoRoot);
  expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(0);
});
