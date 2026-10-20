// The page "A workshop, not a factory" (scripts/workshop.ts): its mapping and the building blocks of docs/arc42 agree.
import { describe, expect, test } from "vitest";
import { blocks, kindOf, mapping, phasesOf, problems, render } from "../scripts/workshop.ts";

describe("the workshop page", () => {
  const model = blocks();

  test("names only blocks of the model, and per phase exactly the skills of its group", () => {
    expect(problems(mapping(), model)).toEqual([]);
  });

  test("finds a box whose block the model puts into another phase, a block without its box, an unknown block", () => {
    const map = mapping();
    const [explore, plan] = map.phases;
    if (!explore || !plan) throw new Error("the mapping has no phases");
    const moved = explore.boxes.find((box) => box.block === "bb-skill-app");
    if (!moved) throw new Error("bb-skill-app is not in Explore");
    explore.boxes = explore.boxes.filter((box) => box !== moved);
    plan.boxes.push(moved, { block: "bb-nowhere", agent: "planted" });
    expect(problems(map, model)).toEqual([
      "bb-skill-app: its x-phase names explore, but the page has no box for it there",
      "bb-skill-app: shown in plan, but its x-phase does not name it",
      "bb-nowhere: no such building block in docs/arc42",
    ]);
  });

  test("takes phase and kind from the block's x-* attributes", () => {
    const hooks = model.get("bb-git-hooks");
    expect(phasesOf(hooks)).toEqual(["code", "commit"]);
    expect(kindOf(hooks)).toBe("hook");
    const skill = model.get("bb-skill-app");
    if (!skill) throw new Error("bb-skill-app is missing");
    const moved = new Map(model).set(skill.id, { ...skill, extensions: { phase: "plan", kind: "skill" } });
    expect(problems(mapping(), moved)).toContain("bb-skill-app: x-phase plan, but its group is bb-skills-explore");
  });

  test("links each box to its card in the architecture, with the title the model gives it or the mapping's label", () => {
    const page = render(mapping(), model);
    expect(page).toContain(
      '<li class="chip" data-blocks="bb-skill-app"><a href="../architecture/#05-building-blocks.arc42.md:el-bb-skill-app"',
    );
    expect(page).toContain('<span class="t">lernapps-app</span>');
    expect(page).toContain('<span class="t">Pre-push</span>');
    expect(page).toContain("lernapps-&lt;archetype&gt;-design");
  });
});
