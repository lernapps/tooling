// The scoring of the eval tasks (evals/): the transcript score of a trial, the verifier's parsing of a plan, and the
// summary across jobs. The trials are fixtures: a synthetic one that exercises each dimension, and a trimmed real one.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { parseTurn, type CreatorTurn } from "../evals/harbor/creator-say.ts";
import { isLinked, linksIn } from "../evals/guidance-links.ts";
import { HARNESSES } from "../evals/harnesses.ts";
import {
  questionsWaiting,
  scoreTrial,
  scoreTurns,
  turns,
  turnsFromAcp,
  withRecords,
  type AcpMessage,
  type SkillContext,
} from "../evals/score-transcript.ts";
import { skillsByPhase } from "../evals/skills-by-phase.ts";
import { elements } from "../scripts/workshop.ts";
import { results } from "../evals/results.ts";
import { modelLabel } from "../evals/rows.ts";
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
    // no "Zwischenstand" in Code: the trial predates the rule early-preview
    early_preview: 0,
    // "Passt er so? Soll ich etwas ändern? Und wie heißt die App?" is one paragraph that asks: one question waiting
    questions_per_turn_mean: 0.75,
    questions_per_turn_max: 1,
    turns_over_two_questions: 0,
    question_marks_per_turn_max: 3,
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
    // the sample questions of the plan draft (in quotation marks and a quote) wait for no answer
    questions_per_turn_max: 2,
    turns_over_two_questions: 0,
    question_marks_per_turn_max: 4,
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

test("a model's label: Claude by family and version, DeepSeek by version and size, another by its name", () => {
  expect(modelLabel("anthropic/claude-haiku-5-5")).toBe("Haiku 5.5");
  expect(modelLabel("opencode-go/deepseek-v4.1-flash")).toBe("DeepSeek V4.1 Flash");
  expect(modelLabel("openai/some-model")).toBe("some-model");
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

test("a run an eval session pushed without conclusions shows as not evaluated yet", () => {
  const dir = mkdtempSync(join(tmpdir(), "runs-"));
  cpSync(join(repoRoot, "evals", "runs", "2026-10-18-first-run", "results.json"), join(dir, "r", "results.json"), {
    recursive: true,
  });
  const results = JSON.parse(readFileSync(join(dir, "r", "results.json"), "utf8")) as { run: string };
  results.run = "r";
  writeFileSync(join(dir, "r", "results.json"), JSON.stringify(results));
  const [run] = runs(dir);
  if (!run) throw new Error("the run is missing");
  expect(problems(run)).toEqual([]);
  expect(render([run])).toContain("Not evaluated yet");
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

test("early_preview: a Zwischenstand between phase: code and phase: commit; none before the plan's yes", () => {
  const set = (phase: string) => ({
    name: "Bash",
    input: { command: `sed -i 's/^phase: .*$/phase: ${phase}/' .vibe/plans/01-quiz.md` },
  });
  const turn = (creator: string, text: string, tools: { name: string; input: Record<string, unknown> }[] = []) => ({
    creator,
    text,
    tools,
  });
  const shown = scoreTurns([
    turn("Ein Quiz zu Brüchen", "**Plan · Checkpoint** Passt der Plan?"),
    turn("Ja, passt so.", "**Code** Zwischenstand: So sieht die erste Frage aus. Ich baue weiter.", [set("code")]),
    turn("Gut", "**Commit** Wie soll das Repo heißen?", [set("commit")]),
  ]);
  expect(shown.dimensions["early_preview"]).toBe(1);
  const late = scoreTurns([
    turn("Ein Quiz zu Brüchen", "**Plan · Checkpoint** Passt der Plan?"),
    turn("Ja, passt so.", "**Code** Ich baue.", [set("code"), set("commit")]),
    turn("brueche", "**Commit** Zwischenstand der Checks: grün."),
  ]);
  expect(late.dimensions["early_preview"]).toBe(0);
  expect(scoreTurns([turn("Ein Quiz", "Zwischenstand")]).dimensions).not.toHaveProperty("early_preview");
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

test("the questions that wait for an answer: one per paragraph or list item that asks, none in a draft's samples", () => {
  expect(questionsWaiting("Was soll die App lehren? Und für welche Klasse?")).toBe(1);
  expect(
    questionsWaiting(
      [
        "Was ich von dir brauche:",
        "",
        "1. **Was soll die App lehren?** Was tun Lernende darin?",
        "2. Woher kommen die Inhalte?",
        "",
        "Eine Eingabe nur für ganze Zahlen, z. B. „Mit welcher Zahl erweitert man 3/4 auf 12?“ → 4.",
        "> Welcher Bruch ist gleichwertig zu 2/3?",
        "| Frage | Antwort |",
        "| Ist 1/2 > 1/3? | ja |",
        "```",
        "question: Wie viel ist 1/2 + 1/4?",
        "```",
        "Bestätigst du den Plan? Dann lege ich die App an.",
      ].join("\n"),
    ),
  ).toBe(3);
  expect(questionsWaiting("Fertig gebaut. Die App läuft.")).toBe(0);
});

test("only the yes to the reply at the Plan checkpoint confirms the plan; a phase set before it is counted", () => {
  const setCode = {
    name: "Edit",
    input: { file_path: "/app/.vibe/plans/01-quiz.md", old_string: "phase: plan", new_string: "phase: code" },
  };
  const create = {
    name: "Bash",
    input: { command: "npx --yes github:lernapps/tooling#main create --archetype quiz ." },
  };
  const turn = (creator: string, reply: string, tools: { name: string; input: Record<string, unknown> }[] = []) => ({
    creator,
    text: reply,
    opening: { text: reply, toolsBefore: tools.length },
    closing: reply,
    tools,
  });
  // A yes to a draft in Explore, taken as the plan's yes (#141): no confirmation, the app created early.
  const draft = scoreTurns([
    turn("Ein Quiz", "**Explore** Hier sind die Kompetenzen als Entwurf. Passen sie?"),
    turn("Ja, passt so.", "**Code** Ich lege die App an.", [setCode, create]),
    turn("Danke!", "Gern."),
  ]);
  expect(draft.dimensions).toMatchObject({ plan_confirmed: 0, code_before_plan_confirmed: 1, installs_before_plan: 1 });
  expect(draft.dimensions["creator_turns_after_plan"]).toBeUndefined();
  const checkpoint = scoreTurns([
    turn("Ein Quiz", "**Explore** Hier sind die Kompetenzen als Entwurf. Passen sie?"),
    turn("Ja, passt so.", "**Plan · Checkpoint** Hier ist der Plan mit den Skizzen. Bestätigst du ihn?"),
    turn("Ja, passt so.", "**Code** Ich lege die App an.", [setCode, create]),
    turn("Danke!\n[Ende: fertig]", "Gern."),
  ]);
  expect(checkpoint.dimensions).toMatchObject({
    plan_confirmed: 1,
    code_before_plan_confirmed: 0,
    installs_before_plan: 0,
    creator_turns_after_plan: 1,
    scenario_end: 1,
  });
  expect(checkpoint.evidence).toMatchObject({ planConfirmedAtCreatorTurn: 3, planConfirmedBy: "checkpoint" });
  // A run whose agent announces no phase (before 2026-10-21) keeps the agent's sign, `phase: code`.
  const before = scoreTurns([
    { creator: "Ein Quiz", text: "Passt der Plan?", tools: [] },
    { creator: "Ja, passt so.", text: "", tools: [setCode, create] },
  ]);
  expect(before.dimensions).toMatchObject({ plan_confirmed: 1, installs_before_plan: 0 });
  expect(before.dimensions["code_before_plan_confirmed"]).toBeUndefined();
});

test("the creator's message goes out as its reply and end; a record it cannot read is not sent", () => {
  const turn = parseTurn(
    '{"asked": ["publish"], "answers": ["publish"], "reply": " Stopp. Danke! ", "end": "veröffentlichen"}',
  );
  expect(turn).toEqual({
    asked: ["publish"],
    answers: ["publish"],
    reply: "Stopp. Danke!",
    end: "veröffentlichen",
    message: "Stopp. Danke!\n[Ende: veröffentlichen]",
  });
  expect(parseTurn('{"asked": [], "answers": [], "reply": "Los", "end": null}')).toMatchObject({ message: "Los" });
  const problems = (input: string) => ("problems" in parseTurn(input) ? "not sent" : "sent");
  expect(problems("Ja, passt so.")).toBe("not sent");
  expect(problems('{"asked": ["plan"], "answers": [], "reply": "Ja", "end": null}')).toBe("not sent");
  expect(problems('{"asked": [], "answers": [], "reply": "", "end": null}')).toBe("not sent");
  expect(problems('{"asked": [], "answers": [], "reply": "Danke!", "end": "stopp"}')).toBe("not sent");
  expect(problems('{"asked": [], "answers": [], "reply": "Danke!\\n[Ende: fertig]", "end": null}')).toBe("not sent");
  expect(problems('{"asked": [], "answers": [], "reply": "Ja", "end": null, "mood": "gut"}')).toBe("not sent");
});

test("the structured creator: its end and its yes to the plan are read, its own mistakes counted apart", () => {
  const record = (
    asked: CreatorTurn["asked"],
    answers: CreatorTurn["answers"],
    reply: string,
    end: CreatorTurn["end"] = null,
  ) => {
    const turn = parseTurn(JSON.stringify({ asked, answers, reply, end }));
    if ("problems" in turn) throw new Error(turn.problems.join("; "));
    return turn;
  };
  const turn = (creator: string, reply: string, tools: { name: string; input: Record<string, unknown> }[] = []) => ({
    creator,
    text: reply,
    opening: { text: reply, toolsBefore: 0 },
    closing: reply,
    tools,
  });
  const setCode = {
    name: "Edit",
    input: { file_path: "/app/.vibe/plans/01-quiz.md", old_string: "phase: plan", new_string: "phase: code" },
  };
  const records = [
    record([], [], "Ein Quiz"),
    record(["content"], ["content", "github"], "Bruchrechnung, Klasse 6. Kein GitHub-Repo."),
    record([], ["confirm"], "Ja, passt so."),
    record(["plan_confirm"], ["plan_confirm"], "Ja, passt so."),
    // never reached the agent: skipped
    record(["go_on"], ["go_on"], "Ja."),
    record(["publish"], ["publish"], "Stopp, das reicht für heute.", "veröffentlichen"),
  ];
  // The agent did not begin its plan's reply with the checkpoint: the creator's record confirms it.
  const all = withRecords(
    [
      turn("Ein Quiz", "Was soll die App lehren?"),
      turn("Bruchrechnung, Klasse 6. Kein GitHub-Repo.", "Hier ist der Entwurf."),
      turn("Ja, passt so.", "Hier ist der Plan. Bestätigst du ihn?"),
      turn("Ja, passt so.", "Die App ist gebaut. Darf ich weitermachen?", [setCode]),
      turn("Mach bitte weiter.", "Geprüft. Soll ich veröffentlichen?"),
      turn("Stopp, das reicht für heute.\n[Ende: veröffentlichen]", "Gut."),
    ],
    records,
  );
  expect(all.map((entry) => entry.record?.reply ?? null)).toEqual([
    "Ein Quiz",
    "Bruchrechnung, Klasse 6. Kein GitHub-Repo.",
    "Ja, passt so.",
    "Ja, passt so.",
    null,
    "Stopp, das reicht für heute.",
  ]);
  const score = scoreTurns(all);
  expect(score.dimensions).toMatchObject({
    plan_confirmed: 1,
    creator_turns_after_plan: 2,
    code_before_plan_confirmed: 0,
    scenario_end: 1,
    creator_mistakes: 3,
  });
  expect(score.evidence).toMatchObject({
    planConfirmedAtCreatorTurn: 4,
    planConfirmedBy: "creator_or_checkpoint",
    scenarioEnd: "veröffentlichen",
    creatorMistakes: [
      { turn: 2, mistake: "answer_not_asked", answers: ["github"] },
      { turn: 3, mistake: "yes_without_question", answers: ["confirm"] },
      { turn: 5, mistake: "unrecorded" },
    ],
  });
  // Its last message without an end: no regular end, whatever it says, and a mistake of its own.
  const noEnd = scoreTurns(
    withRecords(
      [turn("Ein Quiz", "Plan · Checkpoint: passt er?"), turn("Ja, passt so.", "Fertig."), turn("Danke!", "Gern.")],
      [
        record([], [], "Ein Quiz"),
        record(["plan_confirm"], ["plan_confirm"], "Ja, passt so."),
        record([], [], "Danke!"),
      ],
    ),
  );
  expect(noEnd.dimensions).toMatchObject({ plan_confirmed: 1, scenario_end: 0, creator_mistakes: 1 });
});

test("a trial's creator records are read from its user-agent folder", () => {
  const trial = trialCopy("synthetic");
  const sent = turns(
    readFileSync(join(trial, "agent", "sessions", "projects", "-app", "session.jsonl"), "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line) as Parameters<typeof turns>[0][number]),
  ).map((turn) => turn.creator);
  const records = sent.map((message, index) => ({
    asked: index === 4 ? ["publish"] : [],
    answers: index === 4 ? ["publish"] : [],
    reply: message,
    end: index === 4 ? "veröffentlichen" : null,
    message,
  }));
  mkdirSync(join(trial, "user-agent"));
  writeFileSync(
    join(trial, "user-agent", "creator-turns.jsonl"),
    records.map((entry) => JSON.stringify(entry)).join("\n") + "\n",
  );
  const score = scoreTrial(trial);
  // "Ja, passt so." to a plan nobody announced, recorded as no answer at all: the plan is not confirmed.
  expect(score?.dimensions).toMatchObject({ creator_mistakes: 0, plan_confirmed: 0, scenario_end: 0 });
  expect(score?.evidence["creatorMessages"]).toContainEqual(
    expect.objectContaining({ turn: 5, asked: ["publish"], end: "veröffentlichen" }),
  );
});

test("a command that ticks the boxes naming a phase sets no phase; a substitution of the phase line does", () => {
  const plan = ".vibe/plans/01-quiz.md";
  const bash = (command: string) => ({ name: "Bash", input: { command } });
  // From run 2026-10-22 (quiz-fresh, Haiku): the phase set to commit, then the boxes ticked that quote `phase: code`.
  const setCommit = bash(
    `cd /app && sed -i 's/^phase: code$/phase: commit/' ${plan} && sed -i -e 's/^- \\[ \\] \`grep .\\^phase:.\` prints \`phase: code\`\\./- [x] \`grep '^phase:'\` prints \`phase: code\`./' ${plan}`,
  );
  const tickBoxes = bash(
    `cd /app && sed -i -e 's/^- \\[ \\] Set \`phase: code\`\\./- [x] Set \`phase: code\`./' ${plan} && git add -A`,
  );
  const reply = (text: string, toolsBefore: number) => ({ opening: { text, toolsBefore }, closing: text });
  const score = scoreTurns([
    {
      creator: "Ein Quiz",
      text: "**Plan · Checkpoint** Passt er?",
      ...reply("**Plan · Checkpoint** Passt er?", 1),
      tools: [bash(`sed -i 's/^phase: explore$/phase: plan/' ${plan}`)],
    },
    {
      creator: "Ja, passt so.",
      text: "**Commit · Checkpoint** Darf sie online?",
      ...reply("**Commit · Checkpoint** Darf sie online?", 3),
      tools: [bash(`sed -i 's/^phase: plan$/phase: code/' ${plan}`), setCommit, tickBoxes],
    },
    { creator: "Stopp.\n[Ende: veröffentlichen]", text: "Gut.", ...reply("Gut.", 0), tools: [] },
  ]);
  expect(score.dimensions).toMatchObject({ phase_announced: 1, phase_announced_right: 1 });
  // A plan written with a heredoc: its phase line counts, not the boxes that name the next phase.
  const heredoc = bash(
    `cat > ${plan} <<'EOF'\n---\nphase: explore\n---\n- [ ] Set \`phase: plan\`: change the value line.\nEOF`,
  );
  const written = scoreTurns([
    { creator: "Ein Quiz", text: "**Explore** Was?", ...reply("**Explore** Was?", 1), tools: [heredoc] },
    { creator: "Bruchrechnung", text: "Gut.", ...reply("Gut.", 0), tools: [] },
  ]);
  expect(written.evidence["phasesAnnounced"]).toEqual([
    { turn: 1, announced: "explore", plan: "explore" },
    { turn: 2, announced: null, plan: "explore" },
  ]);
});

test("the archetype the agent proposes first is scored against the task's, and a correction by the creator is shown", () => {
  const context: SkillContext = { phases: {}, archetypes: {}, archetype: "quiz", conditional: [] };
  const record = (asked: CreatorTurn["asked"], answers: CreatorTurn["answers"], reply: string) => {
    const turn = parseTurn(JSON.stringify({ asked, answers, reply, end: null }));
    if ("problems" in turn) throw new Error(turn.problems.join("; "));
    return turn;
  };
  const turn = (creator: string, text: string) => ({ creator, text, tools: [] });
  // From run 2026-10-22 (quiz-fresh, Haiku): explainer first, the creator asks for a quiz.
  const wrong = scoreTurns(
    withRecords(
      [
        turn(
          "Ein Quiz zu Brüchen",
          "Ich habe die drei Archetypen gelesen.\n\n**Mein Vorschlag: Archetyp `explainer`.**",
        ),
        turn("Ich möchte ein Quiz.", "Gut. Warum nicht `interactive`: kein Spiel. Archetyp: `quiz`."),
      ],
      [record([], [], "Ein Quiz zu Brüchen"), record(["archetype"], ["archetype"], "Ich möchte ein Quiz.")],
    ),
    context,
  );
  expect(wrong.dimensions).toMatchObject({ archetype_first_proposed_right: 0 });
  expect(wrong.evidence).toMatchObject({
    archetypeProposals: [
      { turn: 1, archetype: "explainer" },
      { turn: 2, archetype: "quiz" },
    ],
    archetypeCorrectedByCreatorAtTurn: 2,
  });
  const right = scoreTurns([turn("Ein Quiz zu Brüchen", "- **Archetyp: `quiz`.** Fragen mit Rückmeldung.")], context);
  expect(right.dimensions).toMatchObject({ archetype_first_proposed_right: 1 });
  expect(right.evidence).toMatchObject({ archetypeCorrectedByCreatorAtTurn: null });
  // No proposal, or no task to compare with: no number.
  expect(scoreTurns([turn("Ein Quiz", "Was sollen sie können?")], context).dimensions).not.toHaveProperty(
    "archetype_first_proposed_right",
  );
  expect(scoreTurns([turn("Ein Quiz", "Archetyp `quiz`.")]).dimensions).not.toHaveProperty(
    "archetype_first_proposed_right",
  );
});

test("an OpenCode trial is scored from its ACP session export, its tools mapped onto the score's names", () => {
  // Recorded with OpenCode over acpx against a stand-in model that plays a fixed script (2026-10-22), paths as /app.
  const job = join(mkdtempSync(join(tmpdir(), "evals-")), "opencode-job");
  cpSync(join(fixtures, "opencode-job"), job, { recursive: true });
  const score = scoreTrial(join(job, "opencode-trial"));
  expect(score?.evidence["transcript"]).toBe("acp");
  expect(score?.dimensions).toMatchObject({
    creator_turns: 2,
    // the reply begins "**Plan · Checkpoint**", and the creator's yes answers it; the agent had set code before
    plan_confirmed: 1,
    code_before_plan_confirmed: 1,
    questions_per_turn_max: 1,
    phase_announced: 1,
  });
  // Over ACP, OpenCode reports only the usage of each prompt's last model call: without its database, no tokens.
  expect(score?.dimensions).not.toHaveProperty("agent_output_tokens");
  // bash, read, write and edit as Bash, Read, Write and Edit: the sed sets plan, the edit of the plan sets code
  expect(score?.evidence["phasesAnnounced"]).toEqual([
    { turn: 1, announced: "plan", plan: "code" },
    { turn: 2, announced: "plan", plan: "code" },
  ]);
});

test("a Claude Code transcript over ACP: its tools, their outputs and the agent's text blocks", () => {
  const update = (value: Record<string, unknown>): AcpMessage => ({
    method: "session/update",
    params: { update: value },
  });
  const history: AcpMessage[] = [
    { method: "session/prompt", params: { prompt: [{ type: "text", text: "Ein Quiz" }] } },
    update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: "**Explore** Ich lade " } }),
    update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: "die Vorlage." } }),
    // announced without input, then again with it; the output comes with the update
    update({
      sessionUpdate: "tool_call",
      toolCallId: "t1",
      title: "Terminal",
      rawInput: {},
      _meta: { claudeCode: { toolName: "mcp__acp__Bash" } },
    }),
    update({
      sessionUpdate: "tool_call",
      toolCallId: "t1",
      title: "`grep '^phase:' .vibe/plans/01.md`",
      rawInput: { command: "grep '^phase:' .vibe/plans/01.md" },
      _meta: { claudeCode: { toolName: "mcp__acp__Bash" } },
    }),
    update({
      sessionUpdate: "tool_call_update",
      toolCallId: "t1",
      status: "completed",
      rawOutput: [{ type: "text", text: "phase: plan" }],
    }),
    update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: "Was sollen sie können?" } }),
    { result: { usage: { inputTokens: 3, cachedReadTokens: 7, outputTokens: 2 } } },
  ];
  const [turn] = turnsFromAcp(history, HARNESSES["claude-code"]!);
  expect(turn).toEqual({
    creator: "Ein Quiz",
    text: "**Explore** Ich lade die Vorlage.\nWas sollen sie können?",
    opening: { text: "**Explore** Ich lade die Vorlage.", toolsBefore: 0 },
    closing: "Was sollen sie können?",
    tools: [{ name: "Bash", input: { command: "grep '^phase:' .vibe/plans/01.md" }, id: "t1", result: "phase: plan" }],
  });
  expect(HARNESSES["opencode"]!.tool("skill", { name: "lernapps-app" })).toEqual({
    name: "Skill",
    input: { name: "lernapps-app", skill: "lernapps-app" },
  });
});

test("an OpenCode trial's tokens are summed from OpenCode's own database, reasoning counted as output", () => {
  const job = join(mkdtempSync(join(tmpdir(), "evals-")), "opencode-job");
  cpSync(join(fixtures, "opencode-job"), job, { recursive: true });
  const trial = join(job, "opencode-trial");
  const folder = join(trial, "agent", "opencode", "xdg-data", "opencode");
  mkdirSync(folder, { recursive: true });
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
  const db = new DatabaseSync(join(folder, "opencode.db"));
  db.exec("CREATE TABLE message (id TEXT, data TEXT)");
  const insert = db.prepare("INSERT INTO message VALUES (?, ?)");
  insert.run("m1", JSON.stringify({ role: "user" }));
  insert.run(
    "m2",
    JSON.stringify({
      role: "assistant",
      tokens: { input: 100, output: 40, reasoning: 10, cache: { read: 900, write: 5 } },
    }),
  );
  insert.run(
    "m3",
    JSON.stringify({
      role: "assistant",
      tokens: { input: 7, output: 3, reasoning: 0, cache: { read: 1000, write: 0 } },
    }),
  );
  db.close();
  expect(scoreTrial(trial)?.dimensions).toMatchObject({
    agent_input_tokens: 112,
    agent_cache_read_tokens: 1900,
    agent_output_tokens: 53,
  });
});

test("a hint where the creator recorded no question but the agent's message waits for an answer", () => {
  const record = (
    asked: CreatorTurn["asked"],
    answers: CreatorTurn["answers"],
    reply: string,
    end: CreatorTurn["end"] = null,
  ) => {
    const turn = parseTurn(JSON.stringify({ asked, answers, reply, end }));
    if ("problems" in turn) throw new Error(turn.problems.join("; "));
    return turn;
  };
  const turn = (creator: string, closing: string) => ({ creator, text: closing, closing, tools: [] });
  // From the OpenCode run of 2026-10-22: two questions about GitHub, and the creator's "Mach bitte weiter."
  const score = scoreTurns(
    withRecords(
      [
        turn(
          "Ein Quiz",
          "Die App ist fertig.\n\n1. Wie soll das Repository heißen?\n2. Kannst du einen GitHub-Zugang bereitstellen?",
        ),
        turn("Mach bitte weiter.", "Ich arbeite weiter."),
        turn("Danke!\n[Ende: fertig]", "Gern."),
      ],
      [record([], [], "Ein Quiz"), record([], [], "Mach bitte weiter."), record([], [], "Danke!", "fertig")],
    ),
  );
  expect(score.dimensions).toMatchObject({ creator_questions_missed: 1, creator_mistakes: 0 });
  expect(score.evidence["creatorQuestionsMissed"]).toEqual([{ turn: 2, waiting: 2, reply: "Mach bitte weiter." }]);
});

test("what the guidance links counts as guidance: any branch, placeholders, a shell variable for one segment", () => {
  expect(
    linksIn(
      "See [the README](https://raw.githubusercontent.com/lernapps/app-templates/main/quiz/README.md). Start: " +
        "`https://lernapps.net/apps/start/<id>/`, or <https://github.com/lernapps/tooling/blob/main/review/rubric.md>.",
    ),
  ).toEqual([
    "https://raw.githubusercontent.com/lernapps/app-templates/main/quiz/README.md",
    // cut at the placeholder's ">", as an autolink's end; the comparison stops at "<" anyway
    "https://lernapps.net/apps/start/<id",
    "https://github.com/lernapps/tooling/blob/main/review/rubric.md",
  ]);
  const links = [
    "https://raw.githubusercontent.com/lernapps/app-templates/main/quiz/README.md",
    "https://lernapps.net/apps/start/<id>",
    "https://lernapps.net/<repo>",
    "https://github.com/lernapps/tooling/blob/main/review/rubric.md",
  ];
  // the same file on another branch or commit, as blob or raw
  expect(isLinked("https://github.com/lernapps/app-templates/blob/v2/quiz/README.md", links)).toBe(true);
  expect(isLinked("https://raw.githubusercontent.com/lernapps/tooling/abc123/review/rubric.md", links)).toBe(true);
  // a placeholder after two segments stands for its URLs; one after fewer stands for too much
  expect(isLinked("https://lernapps.net/apps/start/bruch/", links)).toBe(true);
  expect(isLinked("https://lernapps.net/docs/", links)).toBe(false);
  // the READMEs of all archetypes in one loop, as the plan template asks (run of 2026-10-22, Haiku)
  expect(isLinked("https://raw.githubusercontent.com/lernapps/app-templates/main/$a/README.md;", links)).toBe(true);
  // not linked: a schema the guidance names in node_modules, another app's entry
  expect(
    isLinked("https://raw.githubusercontent.com/lernapps/app-templates/main/runtime/quiz/quiz.v1.schema.json", links),
  ).toBe(false);
  expect(isLinked("https://raw.githubusercontent.com/lernapps/apps/main/entries/x.yaml", links)).toBe(false);
  // in the score: a read of a linked README is no read outside the guidance
  const read = (url: string) => [
    { creator: "Ein Quiz", text: "", tools: [{ name: "Bash", input: { command: `curl -sSL ${url}` } }] },
  ];
  const readme = "https://raw.githubusercontent.com/lernapps/app-templates/main/quiz/README.md";
  expect(scoreTurns(read(readme)).dimensions["reads_outside_guidance"]).toBe(1);
  expect(scoreTurns(read(readme), undefined, links).dimensions["reads_outside_guidance"]).toBe(0);
});
