// The scoring of the eval tasks (evals/): the transcript score of a trial, the verifier's parsing of a plan, and the
// summary across jobs. The trials are fixtures: a synthetic one that exercises each dimension, and a trimmed real one.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { scoreTrial, scoreTurns, type SkillContext } from "../evals/score-transcript.ts";
import { skillsByPhase } from "../evals/skills-by-phase.ts";
import { elements } from "../scripts/workshop.ts";
import { fill, report } from "../evals/report.ts";
import { summarise } from "../evals/summary.ts";
import { boxes, parseFrontMatter, section, validate } from "../evals/verifier/verify.ts";
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

test("the skill score counts the skills loaded in their phase, and those of another archetype or loaded early", () => {
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
  // explore 2 of 3 (no research), plan 1 of 1 (growth is conditional), code 1 of 3; commit not reached
  expect(score.dimensions["skills_in_phase"]).toBe(0.57);
  expect(score.dimensions["skills_out_of_place"]).toBe(2);
  expect(score.evidence["skillsOutOfPlace"]).toEqual(["lernapps-github", "lernapps-explainer"]);
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
      loaded: ["lernapps-check"],
      missing: ["lernapps-quiz", "lernapps-content-questions"],
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

test("the report of the results page: one cell per task and model, excluded jobs listed, only create commands count", () => {
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
  const data = report(
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
  expect(data.excluded).toEqual([{ task: "quiz-fresh", model: "Opus 5.5", reason: "a harness fault" }]);
  expect(data.totals).toMatchObject({
    trials: 2,
    checkPasses: 2,
    createdBeforePlanRuns: 1,
    installsBeforePlanRuns: 2,
  });
  expect(data.rows.find((row) => row.id === "check_passes")?.expectations).toEqual(["A21"]);
  expect(fill("a<!-- report:x -->old<!-- /report:x -->b", { x: "new" })).toBe(
    "a<!-- report:x -->\nnew\n<!-- /report:x -->b",
  );
});
