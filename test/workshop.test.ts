// The page "A workshop, not a factory" (scripts/workshop.ts): rendered from the elements of docs/arc42 and their x-*
// attributes.
import { describe, expect, test } from "vitest";
import { elements, inPhase, mapping, phasesOf, problems, render, type Element } from "../scripts/workshop.ts";

describe("the workshop page", () => {
  const all = elements();
  const byId = (id: string) => {
    const element = all.find((e) => e.id === id);
    if (!element) throw new Error(`${id} is missing`);
    return element;
  };
  const changed = (id: string, extensions: Record<string, string>): Element[] =>
    all.map((e) => (e.id === id ? { ...e, extensions: { ...e.extensions, ...extensions } } : e));

  test("every element with x-phase fits the page: known phases and kinds, a text, a skill in its group's phase", () => {
    expect(problems(mapping(), all)).toEqual([]);
  });

  test("takes phase and kind from the element's x-* attributes, interfaces included", () => {
    expect(phasesOf(byId("bb-git-hooks"))).toEqual(["code", "commit"]);
    expect(inPhase(mapping(), all, "across").map((e) => e.id)).toContain("if-plan-file");
    expect(inPhase(mapping(), all, "explore").map((e) => e.id)).toContain("bb-skill-app");
  });

  test("finds a skill outside its group's phase, an unknown phase or kind, and an element that says nothing", () => {
    expect(problems(mapping(), changed("bb-skill-app", { phase: "plan" }))).toEqual([
      "bb-skill-app: x-phase plan, but its group is bb-skills-explore",
    ]);
    expect(problems(mapping(), changed("bb-generator", { phase: "deploy", kind: "tool" }))).toEqual([
      "bb-generator: x-phase names deploy, which is no phase of the page",
      'bb-generator: x-kind "tool" is not one of the kinds',
    ]);
    expect(problems(mapping(), changed("bb-generator", { agent: "", person: "" }))).toEqual([
      "bb-generator: says nothing in x-agent or x-person",
    ]);
  });

  test("links each box to its card in the architecture, with the element's title", () => {
    const page = render(mapping(), all);
    expect(page).toContain(
      '<li class="chip" data-element="bb-skill-app"><a href="../architecture/#05-building-blocks.arc42.md:el-bb-skill-app"',
    );
    expect(page).toContain('<span class="t">lernapps-app</span>');
    expect(page).toContain('<span class="t">Plan file</span>');
  });
});
