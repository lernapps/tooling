// The page "A workshop, not a factory" (scripts/workshop.ts): its mapping and the building blocks of docs/arc42 agree.
import { describe, expect, test } from "vitest";
import { blocks, mapping, problems, render } from "../scripts/workshop.ts";

describe("the workshop page", () => {
  const model = blocks();

  test("names only blocks of the model, and per phase exactly the skills of its group", () => {
    expect(problems(mapping(), model)).toEqual([]);
  });

  test("finds a skill the model puts into another phase, and a block the model lacks", () => {
    const map = mapping();
    const [explore, plan] = map.phases;
    if (!explore || !plan) throw new Error("the mapping has no phases");
    const moved = explore.tools.find((tool) => tool.block === "bb-skill-app");
    if (!moved) throw new Error("bb-skill-app is not in Explore");
    explore.tools = explore.tools.filter((tool) => tool !== moved);
    plan.tools.push(moved, { block: "bb-nowhere", kind: "skill", text: "planted" });
    expect(problems(map, model)).toEqual([
      "bb-nowhere: no such building block in docs/arc42",
      "bb-skill-app: a skill of explore in docs/arc42, missing in the phase's tools",
      "bb-skill-app: listed in plan, but its group in docs/arc42 is bb-skills-explore",
    ]);
  });

  test("shows each block with the title the model gives it, unless the mapping labels a part of it", () => {
    const page = render(mapping(), model);
    expect(page).toContain('<li data-blocks="bb-skill-app"><span class="kind skill">Skill</span> lernapps-app: ');
    expect(page).toContain('data-blocks="bb-git-hooks"><span class="kind hook">Hook</span> pre-push: ');
    expect(page).toContain("lernapps-&lt;archetype&gt;-design");
  });
});
