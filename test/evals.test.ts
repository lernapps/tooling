// The scoring of the eval tasks (evals/): the transcript score of a trial, the verifier's parsing of a plan, and the
// summary across jobs. The trials are fixtures: a synthetic one that exercises each dimension, and a trimmed real one.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { scoreTrial, scoreTurns, turns, type SkillContext } from "../evals/score-transcript.ts";
import { skillsByPhase } from "../evals/skills-by-phase.ts";
import { elements } from "../scripts/workshop.ts";
import { results } from "../evals/results.ts";
import { problems, render, runs } from "../evals/site.ts";
import { summarise } from "../evals/summary.ts";
import { boxes, findVibeDirs, parseFrontMatter, section, validate } from "../evals/verifier/verify.ts";
import { repoRoot } from "./support.ts";

const fixtures = join(repoRoot, "test", "fixtures", "evals");

/** A copy of a fixture trial, so that scoring it does not write into the repo. */
function trialCopy(name: string): string {
  const dir = join(mkdtempSync(join(tmpdir(), "evals-")), name);
  cpSync(join(fixtures, name), dir, { recursive: true });
  return dir;
}

test("the transcript score counts turns, questions, reads and bypasses of a synthetic trial", () => {
  const trial = trialCopy("synthetic");
  const score = scoreTrial(trial);
  expect(score?.dimensions).toEqual({
    creator_turns: 5,
    plan_confirmed: 1,
    creator_turns_after_plan: 2,
    questions_per_turn_mean: 1.5,
    questions_per_turn_max: 3,
    turns_over_two_questions: 1,
    approvals_after_question: 1,
    skill_read_raw: 1,
    plan_template_read_raw: 1,
    guidance_summary_fetches: 1,
    reads_outside_guidance: 1,
    installs_before_plan: 0,
    created_with_plan_command: 1,
    no_verify_bypass: 0,
    pre_push_counter_edits: 1,
    scenario_end: 1,
    phase_announced: 0,
    agent_input_tokens: 0,
    agent_cache_read_tokens: 0,
    agent_output_tokens: 0,
  });
  expect(score?.evidence["skillsRead"]).toEqual(["lernapps-app", "lernapps-quiz"]);
  expect(score?.evidence["otherUrls"]).toEqual(["https://de.wikipedia.org/wiki/Bruch_(Mathematik)"]);
  expect(JSON.parse(readFileSync(join(trial, "transcript-score.json"), "utf8"))).toEqual(score);
});

test("the transcript score of a recorded trial (quiz-fresh, trimmed): the plan confirmed at the fifth creator turn", () => {
  const score = scoreTrial(trialCopy("quiz-fresh-trial"));
  expect(score?.dimensions).toMatchObject({
    creator_turns: 6,
    plan_confirmed: 1,
    creator_turns_after_plan: 1,
    questions_per_turn_max: 4,
    turns_over_two_questions: 2,
    approvals_after_question: 1,
    skill_read_raw: 1,
    plan_template_read_raw: 1,
    guidance_summary_fetches: 1,
    reads_outside_guidance: 0,
    installs_before_plan: 0,
    created_with_plan_command: 1,
    no_verify_bypass: 1,
    pre_push_counter_edits: 0,
    agent_output_tokens: 104001,
  });
  expect(score?.evidence["planConfirmedAtCreatorTurn"]).toBe(5);
  expect(score?.evidence["skillsRead"]).toEqual([
    "lernapps-content-research",
    "lernapps-quiz",
    "app-content",
    "lernapps-app",
  ]);
});

test("the skills by phase come from the skills' building blocks and their x-phase", () => {
  const { phases, archetypes } = skillsByPhase(elements());
  expect(phases["explore"]).toContain("lernapps-app");
  expect(phases["code"]).toContain("lernapps-check");
  expect(phases["commit"]?.toSorted()).toEqual(["lernapps-commit", "lernapps-github", "lernapps-listing"]);
  expect(archetypes).toMatchObject({
    "lernapps-quiz": "quiz",
    "lernapps-quiz-design": "quiz",
    "lernapps-explainer": "explainer",
  });
  expect(archetypes["lernapps-app"]).toBeUndefined();
});

test("the skill score counts the skills loaded by the end of their phase, and those of another archetype or loaded early", () => {
  const context: SkillContext = {
    phases: {
      explore: ["lernapps-app", "lernapps-content-research", "lernapps-quiz-design", "lernapps-explainer-design"],
      plan: ["lernapps-exercise-patterns", "lernapps-content-growth"],
      code: ["lernapps-check", "lernapps-quiz", "lernapps-explainer", "lernapps-content-questions"],
      commit: ["lernapps-github", "lernapps-commit", "lernapps-listing"],
    },
    archetypes: {
      "lernapps-quiz": "quiz",
      "lernapps-quiz-design": "quiz",
      "lernapps-explainer": "explainer",
      "lernapps-explainer-design": "explainer",
    },
    archetype: "quiz",
    conditional: ["lernapps-content-growth"],
  };
  const raw = "https://raw.githubusercontent.com/lernapps/tooling/main/skills";
  const turn = (tools: { name: string; input: Record<string, unknown> }[]) => ({ creator: "weiter", text: "", tools });
  const score = scoreTurns(
    [
      turn([
        { name: "Skill", input: { skill: "lernapps-app" } },
        { name: "Read", input: { file_path: "/app/.agents/skills/lernapps-quiz-design/SKILL.md" } },
        { name: "Bash", input: { command: `curl -sL ${raw}/process/lernapps-github/SKILL.md` } },
        { name: "Read", input: { file_path: "/app/.agents/skills/lernapps-quiz/SKILL.md" } },
      ]),
      turn([
        { name: "Write", input: { file_path: "/app/.vibe/plans/01-quiz.md", content: "---\nphase: plan\n---\n" } },
        { name: "Bash", input: { command: "cd .agents/skills/lernapps-exercise-patterns && cat SKILL.md" } },
      ]),
      turn([
        {
          name: "Edit",
          input: { file_path: "/app/.vibe/plans/01-quiz.md", old_string: "phase: plan", new_string: "phase: code" },
        },
        { name: "Bash", input: { command: "cat .agents/skills/lernapps-check/SKILL.md" } },
        { name: "Skill", input: { skill: "lernapps-explainer" } },
      ]),
    ],
    context,
  );
  // explore 2 of 3 (no research), plan 1 of 1 (growth is conditional), code 2 of 3 (quiz, loaded early, counts);
  // commit not reached. Out of place: github and quiz before their phase, explainer of another archetype.
  expect(score.dimensions["skills_in_phase"]).toBe(0.71);
  expect(score.dimensions["skills_out_of_place"]).toBe(3);
  expect(score.evidence["skillsOutOfPlace"]).toEqual(["lernapps-github", "lernapps-quiz", "lernapps-explainer"]);
  expect(score.evidence["skillsByPhase"]).toEqual([
    {
      phase: "explore",
      expected: ["lernapps-app", "lernapps-content-research", "lernapps-quiz-design"],
      loaded: ["lernapps-app", "lernapps-quiz-design"],
      missing: ["lernapps-content-research"],
    },
    { phase: "plan", expected: ["lernapps-exercise-patterns"], loaded: ["lernapps-exercise-patterns"], missing: [] },
    {
      phase: "code",
      expected: ["lernapps-check", "lernapps-quiz", "lernapps-content-questions"],
      loaded: ["lernapps-check", "lernapps-quiz"],
      missing: ["lernapps-content-questions"],
    },
  ]);
  expect(scoreTurns([turn([{ name: "Skill", input: { skill: "lernapps-app" } }])]).dimensions).not.toHaveProperty(
    "skills_in_phase",
  );
});

const plan = `---
# comment
archetype: quiz
phase: code
prePushFailures: 2
---

## Explore

### Tasks

<!-- - [ ] not a task -->

### Completed

- [x] Ask
- [x] Research

## Plan

### Tasks

- [ ] Confirm

### Completed

- [x] Write

## Code

- [ ] Build

## Retrospective

### Phases reached

code

### Where I had to guess

<!-- comment only -->
`;

test("the verifier reads a plan's front matter, its sections and its boxes", () => {
  const front = parseFrontMatter(plan);
  expect(front).toEqual({
    archetype: "quiz",
    phase: "code",
    prePushFailures: 2,
  });
  const schema = JSON.parse(readFileSync(join(repoRoot, "guidance", "plan-front-matter.v1.schema.json"), "utf8"));
  expect(validate(front, schema)).toEqual([]);
  expect(validate({ archetype: null, phase: "code", prePushFailures: -1, extra: 1 }, schema)).toEqual([
    "prePushFailures: -1 is below 0",
    "(root): unexpected key extra",
    "archetype: null is not of type string",
  ]);
  const counted = parseFrontMatter(
    "---\narchetype: quiz\nphase: code\nprePushFailures: 0\nfailedChecks: { checks-pass: 2, quiz-bank-valid: 1 }\n---\n",
  );
  expect(counted?.["failedChecks"]).toEqual({
    "checks-pass": 2,
    "quiz-bank-valid": 1,
  });
  expect(validate(counted, schema)).toEqual([]);
  expect(validate({ ...counted, failedChecks: { "checks-pass": 0 } }, schema)).toEqual([
    "failedChecks.checks-pass: 0 is below 1",
  ]);
  expect(boxes(section(plan, "Explore"))).toEqual({ ticked: 2, total: 2 });
  expect(boxes(section(plan, "Plan"))).toEqual({ ticked: 1, total: 2 });
  const retro = section(plan, "Retrospective");
  expect(section(retro, "Phases reached", 3).trim()).toBe("code");
  expect(
    section(retro, "Where I had to guess", 3)
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim(),
  ).toBe("");
});

test("the summary aggregates trials per task and configuration and never mixes configurations", () => {
  const jobs = mkdtempSync(join(tmpdir(), "evals-jobs-"));
  const job = (name: string, model: string, rewards: Record<string, number>[]) => {
    const dir = join(jobs, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "configuration.json"),
      JSON.stringify({
        harness: "claude-code",
        model,
        task: "quiz-fresh",
        toolingCommit: name,
      }),
    );
    rewards.forEach((reward, index) => {
      mkdirSync(join(dir, `t${index}`, "verifier"), { recursive: true });
      writeFileSync(join(dir, `t${index}`, "result.json"), "{}");
      writeFileSync(join(dir, `t${index}`, "verifier", "reward.json"), JSON.stringify(reward));
    });
    return dir;
  };
  const groups = summarise([
    job("a", "m1", [{ plan_exists: 1 }, { plan_exists: 0 }]),
    job("b", "m1", [{ plan_exists: 1 }]),
    job("c", "m2", [{ plan_exists: 0 }]),
  ]);
  expect(groups.map((group) => [group.configuration.model, group.trials, group.dimensions["plan_exists"]])).toEqual([
    ["m1", 3, { mean: 0.667, min: 0, max: 1, n: 3 }],
    ["m2", 1, { mean: 0, min: 0, max: 0, n: 1 }],
  ]);
});

test("the results of a run: one cell per task and model, excluded jobs listed, only create commands count", () => {
  const jobs = mkdtempSync(join(tmpdir(), "evals-report-"));
  const job = (name: string, model: string, trials: { reward: Record<string, number>; early?: string[] }[]) => {
    const dir = join(jobs, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "configuration.json"),
      JSON.stringify({
        harness: "claude-code",
        model,
        userModel: "anthropic/claude-haiku-5-5",
        task: "quiz-fresh",
      }),
    );
    trials.forEach(({ reward, early = [] }, index) => {
      mkdirSync(join(dir, `t${index}`, "verifier"), { recursive: true });
      writeFileSync(
        join(dir, `t${index}`, "result.json"),
        JSON.stringify({
          started_at: "2026-10-17T23:00:00Z",
          finished_at: "2026-10-18T01:00:00Z",
          agent_execution: {
            started_at: "2026-10-17T23:00:00Z",
            finished_at: "2026-10-17T23:30:00Z",
          },
        }),
      );
      writeFileSync(join(dir, `t${index}`, "verifier", "reward.json"), JSON.stringify(reward));
      writeFileSync(
        join(dir, `t${index}`, "transcript-score.json"),
        JSON.stringify({
          dimensions: {
            questions_per_turn_max: index + 1,
            installs_before_plan: early.length,
          },
          evidence: { installsBeforePlan: early },
        }),
      );
    });
    return dir;
  };
  const excluded = job("x", "anthropic/claude-opus-5-5", [{ reward: { check_passes: 0 } }]);
  writeFileSync(join(excluded, "excluded.txt"), "a harness fault\n");
  const data = results(
    "test-run",
    [
      job("a", "anthropic/claude-haiku-5-5", [
        {
          reward: { check_passes: 1 },
          early: ["cd /app && npx --yes github:lernapps/tooling#main create --archetype quiz q"],
        },
        {
          reward: { check_passes: 1 },
          early: ["cat > plan.md <<'EOF'\nnpm install"],
        },
      ]),
      excluded,
    ],
    { reward: { check_passes: ["A21"] }, transcript: {} },
  );
  expect(data.cells.map((cell) => [cell.model, cell.n, cell.minutes])).toEqual([["Haiku 5.5", 2, [30, 30]]]);
  expect(data.cells[0]?.rows["not_created_before_plan"]).toEqual({
    mean: 0.5,
    min: 0,
    max: 1,
    n: 2,
  });
  expect(data.cells[0]?.rows["questions_max_2"]).toEqual({
    mean: 1,
    min: 1,
    max: 1,
    n: 2,
  });
  expect(data.excludedJobs).toEqual([{ job: "x", task: "quiz-fresh", model: "Opus 5.5", reason: "a harness fault" }]);
  expect(data.totals).toMatchObject({
    trials: 2,
    checkPasses: 2,
    createdBeforePlanRuns: 1,
    installsBeforePlanRuns: 2,
  });
  expect(data.rows.find((row) => row.id === "check_passes")?.expectations).toEqual(["A21"]);
});

test("the results of a run leave out trials that hit the usage limit or broke off, and keep a crashed verifier's trial partly", () => {
  const root = mkdtempSync(join(tmpdir(), "results-"));
  const job = (name: string, configuration: Record<string, string>) => {
    mkdirSync(join(root, name), { recursive: true });
    writeFileSync(join(root, name, "configuration.json"), JSON.stringify(configuration));
    return join(root, name);
  };
  const trial = (jobDir: string, name: string, reward: Record<string, number> | undefined, extra: object, log = "") => {
    const dir = join(jobDir, name);
    mkdirSync(join(dir, "verifier"), { recursive: true });
    mkdirSync(join(dir, "agent", "sessions"), { recursive: true });
    writeFileSync(
      join(dir, "result.json"),
      JSON.stringify({
        started_at: "2026-10-20T22:40:00Z",
        finished_at: "2026-10-20T23:00:00Z",
        agent_execution: { started_at: "2026-10-20T22:41:00Z", finished_at: "2026-10-20T22:59:00Z" },
        ...extra,
      }),
    );
    if (reward) writeFileSync(join(dir, "verifier", "reward.json"), JSON.stringify(reward));
    writeFileSync(join(dir, "agent", "sessions", "log.jsonl"), log);
  };
  const configuration = { task: "quiz-fresh", model: "anthropic/claude-sonnet-5-5", guidanceCommit: "b20b514" };
  const first = job("quiz-fresh__claude-sonnet-5-5__gb20b514__20261020T224000Z", configuration);
  trial(first, "a", { check_passes: 1, phase_reached: 1 }, {});
  trial(first, "b", { verifier_error: 1 }, {});
  const limited = job("quiz-fresh__claude-sonnet-5-5__gb20b514__20261021T052214Z", configuration);
  trial(limited, "c", { check_passes: 0 }, {}, '{"error":{"type":"usage_limit_reached"}}\n');
  trial(limited, "d", undefined, { exception_info: { exception_type: "DockerError" }, agent_execution: null });
  const again = job("quiz-fresh__claude-sonnet-5-5__gb20b514__20261021T061000Z", configuration);
  trial(again, "e", { check_passes: 1, phase_reached: 0.667 }, {});
  const other = job("quiz-fresh__claude-sonnet-5-5__g1e4ba59__20261021T070000Z", {
    ...configuration,
    guidanceCommit: "1e4ba59",
  });
  trial(other, "f", { check_passes: 1, phase_reached: 1 }, {});

  const data = results("test-run", [first, limited, again, other], { reward: {}, transcript: {} });
  expect(Object.values(data.configurations).map((c) => c.guidanceCommit)).toEqual(["b20b514", "1e4ba59"]);
  expect(data.trials.map((t) => [t.trial, t.status, t.reason])).toEqual([
    ["a", "valid", undefined],
    ["b", "partial", "the verifier crashed; its numbers are left out"],
    ["c", "excluded", "the subscription's usage limit (HTTP 429)"],
    ["d", "excluded", "broke off before the agent started (DockerError)"],
    ["e", "valid", undefined],
    ["f", "valid", undefined],
  ]);
  expect(data.trials.find((t) => t.trial === "b")?.numbers).toHaveProperty("agent_minutes", 18);
  expect(data.trials.find((t) => t.trial === "b")?.numbers).not.toHaveProperty("verifier_error");
  expect(data.excludedJobs).toEqual([
    {
      job: "quiz-fresh__claude-sonnet-5-5__gb20b514__20261021T052214Z",
      task: "quiz-fresh",
      model: "Sonnet 5.5",
      reason: "the subscription's usage limit (HTTP 429)",
      replacedBy: "quiz-fresh__claude-sonnet-5-5__gb20b514__20261021T061000Z",
    },
  ]);
  // one cell per configuration: the trials of b20b514 (a, b partly, e) and those of 1e4ba59 (f) are never mixed
  expect(data.cells.map((c) => [c.configuration, c.n, c.rows["check_passes"]?.n])).toEqual([
    ["c1", 3, 2],
    ["c2", 1, 1],
  ]);
  expect(data.totals).toMatchObject({ trials: 4, excludedTrials: 2, partialTrials: 1 });
});

test("the eval runs on the page: every conclusion names cells, rows and findings its run has", () => {
  const all = runs();
  expect(all.map((run) => run.id)).toContain("2026-10-18-first-run");
  expect(all.flatMap(problems)).toEqual([]);
  const [run] = all.filter((r) => r.id === "2026-10-18-first-run");
  if (!run) throw new Error("the first run is missing");
  const broken = {
    ...run,
    conclusions: {
      ...run.conclusions,
      findings: [
        ...run.conclusions.findings,
        { id: "x", title: "X", text: "x", evidence: [{ task: "quiz-fresh", model: "Haiku 5.5", row: "no_such_row" }] },
        { id: "x", title: "Y", text: "y", evidence: [{ task: "quiz-fresh", model: "Gemini", row: "check_passes" }] },
      ],
      actions: [{ text: "a", status: "later" as "open", findings: ["missing"] }],
    },
  };
  expect(problems(broken)).toEqual([
    "2026-10-18-first-run: finding x: quiz-fresh · Haiku 5.5 has no row no_such_row",
    "2026-10-18-first-run: finding x: its id is used twice",
    "2026-10-18-first-run: finding x: no cell quiz-fresh · Gemini",
    '2026-10-18-first-run: action "a": status later',
    '2026-10-18-first-run: action "a": no finding missing',
  ]);
  const html = render(all);
  expect(html).toContain('id="run-2026-10-18-first-run"');
  expect(html).toContain('href="#2026-10-18-first-run--quiz-fresh--haiku-5-5--c1--app_content_filled"');
  expect(html).toContain('id="2026-10-18-first-run--quiz-fresh--haiku-5-5--c1--app_content_filled"');
});

test("the verifier finds the plan's folder past a symlink whose target is gone", () => {
  const app = mkdtempSync(join(tmpdir(), "verify-"));
  mkdirSync(join(app, "quiz", ".vibe", "plans"), { recursive: true });
  mkdirSync(join(app, ".claude", "skills"), { recursive: true });
  symlinkSync(join(app, ".agents", "skills", "lernapps-quiz"), join(app, ".claude", "skills", "lernapps-quiz"));
  expect(findVibeDirs(app)).toEqual([join(app, "quiz")]);
});

test("the plan counts as confirmed when sed, a helper script or a write sets phase: code; an earlier create is early", () => {
  const create = {
    name: "Bash",
    input: { command: "npx --yes github:lernapps/tooling#main create --archetype quiz ." },
  };
  const turn = (creator: string, tools: { name: string; input: Record<string, unknown>; result?: string }[]) => ({
    creator,
    text: "",
    tools,
  });
  const bySed = scoreTurns([
    turn("Ein Quiz zu Brüchen", []),
    turn("Ja, passt so.", [
      { name: "Bash", input: { command: "sed -i 's/^phase: plan$/phase: code/' .vibe/plans/01-quiz.md" } },
      create,
    ]),
  ]);
  expect(bySed.dimensions).toMatchObject({ plan_confirmed: 1, installs_before_plan: 0 });
  const byScript = scoreTurns([
    turn("Ein Quiz zu Brüchen", []),
    turn("Ja, passt so.", [
      { name: "Write", input: { file_path: "/app/.edit-plan.cjs", content: "/* sets the phase */" } },
      { name: "Bash", input: { command: "node .edit-plan.cjs" } },
      { name: "Bash", input: { command: "grep '^phase:' .vibe/plans/01-quiz.md" }, result: "phase: code" },
      create,
    ]),
  ]);
  expect(byScript.dimensions).toMatchObject({ plan_confirmed: 1, installs_before_plan: 0 });
  const early = scoreTurns([
    turn("Ein Quiz zu Brüchen", []),
    turn("Ja, passt so.", [create]),
    turn("Ja", [
      {
        name: "Edit",
        input: { file_path: "/app/.vibe/plans/01-quiz.md", old_string: "phase: plan", new_string: "phase: code" },
      },
    ]),
  ]);
  expect(early.dimensions).toMatchObject({ plan_confirmed: 1, installs_before_plan: 1 });
});

test("the scenario ends regularly when the creator's last message after the plan is a GitHub answer, a stop or thanks, not the stuck line", () => {
  const setCode = {
    name: "Edit",
    input: { file_path: "/app/.vibe/plans/01-quiz.md", old_string: "phase: plan", new_string: "phase: code" },
  };
  const github =
    "Ich habe dir kein GitHub-Repo angelegt; arbeite lokal mit git. Veröffentlichen und Eintragen machen wir später.";
  const turn = (creator: string, tools: { name: string; input: Record<string, unknown> }[] = []) => ({
    creator,
    text: "",
    tools,
  });
  // The GitHub line while planning is not the end; after the plan's yes it is, with or without `phase: commit`.
  const planning = scoreTurns([
    turn("Ein Quiz"),
    turn(github),
    turn("Ja, passt so.", [setCode]),
    turn("Danke, wir hören hier auf."),
  ]);
  expect(planning.dimensions).toMatchObject({ scenario_end: 0 });
  const asked = scoreTurns([turn("Ein Quiz"), turn("Ja, passt so.", [setCode]), turn(github), turn("Danke!")]);
  expect(asked.dimensions).toMatchObject({ scenario_end: 1 });
  expect(asked.evidence).toMatchObject({ scenarioEndAtCreatorTurn: 4 });
  // A GitHub answer in the middle of Code, then stuck: no regular end.
  const midCode = scoreTurns([
    turn("Ein Quiz"),
    turn("Ja, passt so.", [setCode]),
    turn(github),
    turn("Danke, wir hören hier auf."),
  ]);
  expect(midCode.dimensions).toMatchObject({ scenario_end: 0 });
  // The persona words its ends freely: the GitHub line as the last message, or thanks around a pause.
  const lastGithub = scoreTurns([
    turn("Ein Quiz"),
    turn("Ja, passt so.", [setCode]),
    turn(`${github} Ich melde mich.`),
  ]);
  expect(lastGithub.dimensions).toMatchObject({ scenario_end: 1 });
  const pause = scoreTurns([
    turn("Ein Quiz"),
    turn("Ja, passt so.", [setCode]),
    turn("Danke, wir legen hier eine Pause ein. Veröffentlichen machen wir später. Danke!"),
  ]);
  expect(pause.dimensions).toMatchObject({ scenario_end: 1 });
  const doneStop = scoreTurns([
    turn("Ein Quiz"),
    turn("Ja, passt so.", [setCode]),
    turn("Danke! Die App ist lokal fertig und geprüft. Wir hören hier auf."),
  ]);
  expect(doneStop.dimensions).toMatchObject({ scenario_end: 1 });
  const stopped = scoreTurns([
    turn("Ein Quiz"),
    turn("Ja, passt so.", [setCode]),
    turn("Stopp, das reicht für heute."),
  ]);
  expect(stopped.dimensions).toMatchObject({ scenario_end: 1 });
  const done = scoreTurns([turn("Ein Quiz"), turn("Ja, passt so.", [setCode]), turn("Danke!")]);
  expect(done.dimensions).toMatchObject({ scenario_end: 1 });
  const stuck = scoreTurns([turn("Ein Quiz"), turn("Ja, passt so.", [setCode]), turn("Danke, wir hören hier auf.")]);
  expect(stuck.dimensions).toMatchObject({ scenario_end: 0 });
});

test("the creator's end marker decides the end; each reply's announced phase is checked against the plan's", () => {
  const setCode = {
    name: "Edit",
    input: { file_path: "/app/.vibe/plans/01-quiz.md", old_string: "phase: plan", new_string: "phase: code" },
  };
  const turn = (
    creator: string,
    reply: string,
    tools: { name: string; input: Record<string, unknown> }[] = [],
    toolsBefore = 0,
  ) => ({ creator, text: reply, ...(reply ? { opening: { text: reply, toolsBefore } } : {}), tools });
  const score = scoreTurns([
    turn("Ein Quiz", "**Explore** Was sollen sie können?"),
    turn("Brüche addieren", "**Plan · Checkpoint** Passt der Plan?"),
    turn("Ja, passt so.", "**Code** Ich lege an.", [setCode], 1),
    turn("Danke, wir hören hier auf. Die App ist fertig.\n[Ende: fertig]", "Gern."),
  ]);
  // The marker wins over the sentence. The three replies the creator read begin with a phase (the last one, after
  // the end, is left out); two are the plan's: the plan was never set to plan, and the third reply begins after the
  // call that set code.
  expect(score.dimensions).toMatchObject({ scenario_end: 1, phase_announced: 1, phase_announced_right: 0.67 });
  expect(score.evidence).toMatchObject({ scenarioEnd: "fertig" });
  const stuck = scoreTurns([
    turn("Ein Quiz", ""),
    turn("Ja, passt so.", "", [setCode]),
    turn("Danke!\n[Ende: festgefahren]", ""),
  ]);
  expect(stuck.dimensions).toMatchObject({ scenario_end: 0 });
});

test("a tool call keeps what it returned, so that the grep of the phase can be read", () => {
  const all = turns([
    { type: "user", message: { content: "Los" } },
    {
      type: "assistant",
      message: {
        content: [{ type: "tool_use", id: "t1", name: "Bash", input: { command: "grep '^phase:' .vibe/plans/01.md" } }],
      },
    },
    { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "t1", content: "phase: code" }] } },
  ]);
  expect(all[0]?.tools[0]?.result).toBe("phase: code");
});
