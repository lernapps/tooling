// `lernapps plan`: the way an assistant reads and changes the tasks of a plan (src/plan.ts, src/plan-command.ts).
// The assistant gets one task at a time and never edits a task line; the plan stays the Markdown file the creator
// reads. These tests walk the templates of the package through the commands, as an assistant would.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import {
  applyArchetype,
  changedTasks,
  describePosition,
  planAdd,
  planDone,
  PlanError,
  planPhase,
  planPosition,
  planTasks,
  skillFiles,
  startPlan,
} from "../src/plan.ts";
import { repoRoot, run } from "./support.ts";

const guidance = (name: string) => readFileSync(join(repoRoot, "guidance", name), "utf8");
const TEMPLATE = guidance("plan-template.md");
const explainer = () => applyArchetype(TEMPLATE, "explainer", guidance("plan-explainer.md"));
const cli = join(repoRoot, "src/cli.ts");

/** Ticks tasks until `stop` says the next one is the one wanted; checkpoints get an answer. */
function until(plan: string, stop: (text: string) => boolean): string {
  let text = plan;
  for (let steps = 0; steps < 200; steps++) {
    const task = planPosition(text).task;
    if (task === undefined || stop(task.text)) return text;
    text = planDone(text, task.text.includes("**Checkpoint:**") ? { answer: "Ja" } : {});
  }
  throw new Error("the plan never reached the task");
}

describe("reading the plan", () => {
  test("next gives the first open task of the phase, with the hints of the phase", () => {
    const position = planPosition(TEMPLATE);
    expect(position.phase).toBe("explore");
    expect(position.task?.text).toMatch(/^Check the start: the folder `\.agents\/skills\/lernapps-app` exists/);
    expect(position.ticked).toBe(0);
    const printed = describePosition(".vibe/plans/01-x.md", position);
    expect(printed).toContain("In Explore:\n- Find out what the app teaches");
    expect(printed).toContain("Task 1 of ");
    expect(printed).toContain("npx --no -- lernapps plan done");
  });

  test("a task is its box line with the indented lines that continue it, as one line of text", () => {
    const first = planTasks(TEMPLATE)[0];
    expect(first?.text).not.toContain("\n");
    expect(first?.text).toContain("(else `git switch -c work`)");
  });

  test("a box inside a comment or a code block is no task", () => {
    const plan =
      "---\nphase: explore\n---\n## Explore\n<!--\n- [ ] not this\n-->\n```\n- [ ] nor this\n```\n- [ ] this\n";
    expect(planTasks(plan).map((task) => task.text)).toEqual(["this"]);
  });
});

describe("the skills of a task", () => {
  test("a task that loads a skill names its file and asks for the file tool: the shell invites cutting", () => {
    const at = until(TEMPLATE, (task) => task.startsWith("Load skill `lernapps-app`"));
    const printed = describePosition("p", planPosition(at));
    expect(printed).toContain("\nRead whole, with your file tool: .agents/skills/lernapps-app/SKILL.md\n");
  });

  test("every skill a task loads is listed once; a skill it only refers to is not", () => {
    expect(skillFiles("Load skills `lernapps-a` and `lernapps-b`. Then load skill `lernapps-a` again.")).toEqual([
      ".agents/skills/lernapps-a/SKILL.md",
      ".agents/skills/lernapps-b/SKILL.md",
    ]);
    expect(skillFiles("Publish as skill `lernapps-github` says.")).toEqual([]);
    const first = describePosition("p", planPosition(TEMPLATE));
    expect(first).not.toContain("Read whole");
  });

  test("the explainer's first Code tasks name the skills they load", () => {
    const tasks = planTasks(explainer())
      .filter((task) => task.phase === "code")
      .flatMap((task) => skillFiles(task.text));
    expect(tasks).toEqual(
      expect.arrayContaining([
        ".agents/skills/lernapps-cli/SKILL.md",
        ".agents/skills/lernapps-explainer/SKILL.md",
        ".agents/skills/lernapps-content-questions/SKILL.md",
        ".agents/skills/lernapps-learner-check/SKILL.md",
      ]),
    );
  });
});

describe("ticking tasks", () => {
  test("done ticks the next open task and leaves every other line as it was", () => {
    const after = planDone(TEMPLATE);
    const [before, now] = [TEMPLATE.split("\n"), after.split("\n")];
    expect(now.length).toBe(before.length);
    const changed = now.filter((line, index) => line !== before[index]);
    expect(changed).toEqual([expect.stringMatching(/^- \[x\] Check the start/)]);
  });

  test("a checkpoint is ticked only with the creator's answer, which stays in the plan", () => {
    const atCheckpoint = until(explainer(), (task) => task.includes("**Checkpoint:** research"));
    expect(() => planDone(atCheckpoint)).toThrow(PlanError);
    expect(() => planDone(atCheckpoint, { skip: "not needed" })).toThrow(/cannot be skipped/);
    const after = planDone(atCheckpoint, { answer: "Ja,\npasst so" });
    expect(after).toContain("      Creator: Ja, passt so\n");
    expect(describePosition("p", planPosition(atCheckpoint))).toContain('plan done --answer "<their words>"');
  });

  test("an answer on a task that is no checkpoint is refused: it would hide a missed checkpoint", () => {
    expect(() => planDone(TEMPLATE, { answer: "Ja" })).toThrow(/is for a checkpoint/);
  });

  test("the last task of a phase enters the next phase", () => {
    const atCheckpoint = until(explainer(), (task) => task.includes("**Checkpoint:** research"));
    expect(planPhase(atCheckpoint)).toBe("explore");
    const after = planDone(atCheckpoint, { answer: "Ja" });
    expect(planPhase(after)).toBe("plan");
    expect(planPosition(after).task?.text).toMatch(
      /^Map the content as "Map the content" of skill `lernapps-explainer-design`/,
    );
  });

  test("skip ticks a task with its reason, and the task stays readable", () => {
    const at = until(explainer(), (task) => task.startsWith("Draw a sketch of each screen"));
    const after = planDone(at, { skip: "no screen of its own" });
    expect(after).toContain("- [x] (skipped: no screen of its own) Draw a sketch of each screen");
    expect(changedTasks(at, after)).toEqual([]);
  });

  test("boxes ticked by hand are taken as done: the commands go on from the first open one", () => {
    const byHand = TEMPLATE.replace("- [ ] Check the start", "- [x] Check the start");
    expect(planPosition(byHand).task?.text).toMatch(/^Load skill `lernapps-app`/);
  });
});

describe("adding tasks", () => {
  const inCode = () => until(explainer(), (task) => task.startsWith("Add the tasks of Code"));

  test("add --at puts the tasks where the plan names the place, in the order of the calls", () => {
    let plan = planAdd(inCode(), "Seite laplace", "pattern");
    plan = planAdd(plan, "Seite baumdiagramm", "pages");
    plan = planAdd(plan, "Seite pfadregel", "pages");
    const code = planTasks(plan)
      .filter((task) => task.phase === "code")
      .map((task) => task.text.slice(0, 24));
    const at = (start: string) => code.findIndex((text) => text.startsWith(start));
    expect(at("Seite laplace")).toBeLessThan(at("**Checkpoint:** the patt"));
    expect(at("Seite baumdiagramm")).toBe(at("**Checkpoint:** the patt") + 1);
    expect(at("Seite pfadregel")).toBe(at("Seite baumdiagramm") + 1);
    expect(plan).toContain("<!-- tasks: pages (2 added): the other pages or screens, after the pattern -->");
  });

  test("a place without a task stops the plan there: the pattern page cannot be forgotten", () => {
    const plan = until(inCode(), (task) => task.includes("**Checkpoint:** the pattern page"));
    const position = planPosition(plan);
    expect(position.empty?.name).toBe("pattern");
    expect(describePosition("p", position)).toContain('npx --no -- lernapps plan add --at pattern "<task>"');
    expect(() => planDone(plan, { answer: "Ja" })).toThrow(/no task was added for "pattern"/);
  });

  test("add without a place puts the task right after the one in work", () => {
    const plan = planAdd(TEMPLATE, "Ask about the class trip");
    expect(planTasks(plan)[1]?.text).toBe("Ask about the class trip");
  });

  test("an unknown place names the places the plan has", () => {
    expect(() => planAdd(explainer(), "x", "nowhere")).toThrow(/it has: pattern, pages/);
  });
});

describe("a plan as it starts", () => {
  test("has its name and its date: the assistant may not write the head, so init and plan new fill it", () => {
    const plan = startPlan(TEMPLATE, "brueche", "2026-11-19");
    expect(plan).toContain("# Plan: brueche, first version");
    expect(plan).toContain("*Started 2026-11-19. Explore, Plan, Code, Commit.*");
    expect(plan).not.toMatch(/<app name>|<date>/);
    const increment = startPlan(guidance("increment-template.md"), "kapitel-dezimal", "2026-11-19");
    expect(increment).toContain("# Increment: kapitel-dezimal");
    expect(increment).not.toContain("<date>");
  });
});

describe("the plan of an archetype", () => {
  test("the explainer's tasks stand where the template leaves room, with its skills named", () => {
    const plan = explainer();
    const explore = planTasks(plan)
      .filter((task) => task.phase === "explore")
      .map((task) => task.text);
    const run = explore.findIndex((task) => task.startsWith("Run `npx --no -- lernapps skills --archetype"));
    expect(explore[run + 1]).toMatch(/^Load skill `lernapps-explainer-design`/);
    expect(plan).toContain("Load skill `lernapps-explainer`.");
    expect(plan).toContain("npx --no -- lernapps create --archetype explainer");
  });

  test("a plan that has its archetype already keeps its tasks", () => {
    const plan = explainer();
    expect(applyArchetype(plan, "explainer", guidance("plan-explainer.md"))).toBe(plan);
  });
});

describe("the commit hook's view: tasks are ticked, skipped or added, never rewritten", () => {
  test("ticking, skipping, answering and adding change no task", () => {
    let plan = planDone(TEMPLATE);
    plan = planAdd(plan, "One more");
    expect(changedTasks(TEMPLATE, plan)).toEqual([]);
  });

  test.each(["no screen of its own", "not needed (the entry exists)", "a) b (c", "ends with ) "])(
    "a skip with the reason %j changes no task",
    (reason) => {
      const skipped = planDone(TEMPLATE, { skip: reason });
      expect(skipped).toContain("(skipped: ");
      expect(changedTasks(TEMPLATE, skipped)).toEqual([]);
      // the next commit, with the skip note already in the last commit
      expect(changedTasks(skipped, planDone(skipped, { skip: "another" }))).toEqual([]);
    },
  );

  test("a skipped task that is reworded or removed is still named", () => {
    const skipped = planDone(TEMPLATE, { skip: "not needed (yet)" });
    const first = planTasks(TEMPLATE)[0]?.text ?? "";
    expect(changedTasks(skipped, skipped.replace(first.slice(0, 20), "Something else"))).toHaveLength(1);
    expect(changedTasks(skipped, skipped.replace(/^- \[x\] \(skipped:.*\n/m, ""))).toHaveLength(1);
  });

  test("a reworded and a removed task are named", () => {
    const reworded = TEMPLATE.replace("Interview: ask the topics", "Interview: guess the topics");
    expect(changedTasks(TEMPLATE, reworded)).toEqual([expect.stringMatching(/^Interview: ask the topics "Goal"/)]);
    const removed = TEMPLATE.replace(/^- \[ \] Fill the retrospective\.\n/m, "");
    expect(changedTasks(TEMPLATE, removed)).toEqual(["Fill the retrospective."]);
  });
});

describe("the command", () => {
  const app = () => {
    const dir = mkdtempSync(join(tmpdir(), "lernapps-plan-"));
    mkdirSync(join(dir, ".vibe/plans"), { recursive: true });
    writeFileSync(join(dir, ".vibe/plans/01-brueche.md"), explainer());
    return dir;
  };
  const plan = (dir: string, ...args: string[]) => run("node", [cli, "plan", ...args], dir);

  test("next changes nothing; done writes the tick and prints the next task", () => {
    const dir = app();
    const before = readFileSync(join(dir, ".vibe/plans/01-brueche.md"), "utf8");
    expect(plan(dir, "next").stdout).toContain("Task 1 of ");
    expect(readFileSync(join(dir, ".vibe/plans/01-brueche.md"), "utf8")).toBe(before);
    const done = plan(dir, "done");
    expect(done.code).toBe(0);
    expect(done.stdout).toContain("Task 2 of ");
    expect(done.stdout).toContain("Load skill `lernapps-app`");
  });

  test("a checkpoint without the answer exits 1 and says how to tick it", () => {
    const dir = app();
    const file = join(dir, ".vibe/plans/01-brueche.md");
    writeFileSync(
      file,
      until(readFileSync(file, "utf8"), (task) => task.includes("**Checkpoint:**")),
    );
    const done = plan(dir, "done");
    expect(done.code).toBe(1);
    expect(done.stderr).toContain('plan done --answer "<their words>"');
  });

  test("new starts the next plan from the increment template, as the plan of the app's archetype", () => {
    const dir = app();
    const started = plan(dir, "new", "kapitel-dezimal");
    expect(started.code).toBe(0);
    const increment = readFileSync(join(dir, ".vibe/plans/02-kapitel-dezimal.md"), "utf8");
    expect(increment).toMatch(/^archetype: explainer$/m);
    expect(increment).toContain("Load skill `lernapps-explainer` and the content guide.");
    expect(increment).toContain("load skill `lernapps-explainer-self-assessment`");
    expect(started.stdout).toContain(".vibe/plans/02-kapitel-dezimal.md · Explore");
  });

  test("a folder without a plan says how an app starts", () => {
    const dir = mkdtempSync(join(tmpdir(), "lernapps-plan-none-"));
    const next = plan(dir, "next");
    expect(next.code).toBe(1);
    expect(next.stderr).toContain("npx --yes @lernapps/tooling init <name>");
  });
});
