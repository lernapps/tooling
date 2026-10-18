// The verifier of the lernapps eval tasks (evals/tasks/*/tests/test.sh runs it in the verifier container).
// It reads the workspace the agent left (/app, collected as an artifact) and writes:
// - /logs/verifier/reward.json: named dimensions, numbers only (evals/expectations.json maps each to its expectation);
// - /logs/verifier/evidence.md: one line per dimension with what it saw;
// - /logs/verifier/check-report.yaml: the report of `lernapps check`, when it ran.
// Node built-ins only: the verifier container has Node and the app's own dependencies, nothing else.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const WORKSPACE = process.env["EVAL_WORKSPACE"] ?? "/app";
const OUT = process.env["EVAL_OUT"] ?? "/logs/verifier";
const TESTS = process.env["EVAL_TESTS"] ?? "/tests";
const EXPECTED_ARCHETYPE = process.env["EXPECTED_ARCHETYPE"] ?? "";
const SKIP_CHECK = process.env["EVAL_SKIP_CHECK"] === "1";
/** Files the harness leaves in the workspace, not the agent. */
const HARNESS_FILES = [".acpxrc.json"];
const PHASES = ["explore", "plan", "code", "commit"] as const;
// "Failed checks" is no part any more: the check counts them in the front matter (failedChecks).
const RETRO_PARTS = ["Phases reached", "Creator turns after the plan", "Where I had to guess"];

const reward: Record<string, number> = {};
const evidence: string[] = [];
const record = (name: string, value: number, detail: string) => {
  reward[name] = Math.round(value * 1000) / 1000;
  evidence.push(`- \`${name}\`: ${reward[name]} (${detail})`);
};
const note = (line: string) => evidence.push(`  - ${line}`);

const run = (command: string, args: string[], cwd: string, timeoutMs = 120_000) =>
  spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
  });
const git = (cwd: string, ...args: string[]) => run("git", ["-c", "safe.directory=*", ...args], cwd);

/** The folders under the workspace that hold a `.vibe/` folder (the agent may create the app in a subfolder). */
function findVibeDirs(dir: string, depth = 0): string[] {
  if (depth > 4 || !existsSync(dir)) return [];
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name === ".vibe") found.push(dir);
    else found.push(...findVibeDirs(path, depth + 1));
  }
  return found;
}

/** The current plan: the highest-numbered file in .vibe/plans/, else .vibe/plan.md (as the pre-push hook finds it). */
function findPlan(appDir: string): string | undefined {
  const plans = join(appDir, ".vibe", "plans");
  if (existsSync(plans)) {
    const files = readdirSync(plans)
      .filter((file) => file.endsWith(".md"))
      .sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0) || a.localeCompare(b));
    const last = files.at(-1);
    if (last) return join(plans, last);
  }
  const single = join(appDir, ".vibe", "plan.md");
  return existsSync(single) ? single : undefined;
}

/** The flat YAML front matter of a plan (`key: value` per line, comments allowed), or undefined without one. */
const scalar = (value: string): unknown =>
  value === "null" || value === "~" || value === "" ? null : /^-?\d+$/.test(value) ? Number(value) : value;

/** A one-line flow map of scalars, as failedChecks is written: `{ checks-pass: 2, quiz-bank-valid: 1 }`. */
function flowMap(value: string): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  for (const entry of value.slice(1, -1).split(",")) {
    const kv = /^\s*([^:\s]+):\s*(.*?)\s*$/.exec(entry);
    if (kv) map[kv[1] ?? ""] = scalar(kv[2] ?? "");
  }
  return map;
}

export function parseFrontMatter(text: string): Record<string, unknown> | undefined {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match) return undefined;
  const data: Record<string, unknown> = {};
  for (const raw of (match[1] ?? "").split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "").trimEnd();
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) return undefined;
    const value = (kv[2] ?? "").trim().replace(/^(["'])(.*)\1$/, "$2");
    data[kv[1] ?? ""] = /^\{.*\}$/.test(value) ? flowMap(value) : scalar(value);
  }
  return data;
}

interface Schema {
  type?: string;
  enum?: unknown[];
  minimum?: number;
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean | Schema;
  if?: Schema;
  then?: Schema;
}

/** The errors of a value against the subset of JSON Schema the plan front matter schema uses. */
export function validate(value: unknown, schema: Schema, path = ""): string[] {
  const errors: string[] = [];
  const at = path || "(root)";
  if (schema.enum && !schema.enum.some((option) => option === value)) {
    errors.push(`${at}: ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum)}`);
  }
  if (schema.type) {
    const ok =
      schema.type === "object"
        ? typeof value === "object" && value !== null && !Array.isArray(value)
        : schema.type === "integer"
          ? Number.isInteger(value)
          : schema.type === "string"
            ? typeof value === "string"
            : true;
    if (!ok) errors.push(`${at}: ${JSON.stringify(value)} is not of type ${schema.type}`);
  }
  if (schema.minimum !== undefined && typeof value === "number" && value < schema.minimum) {
    errors.push(`${at}: ${value} is below ${schema.minimum}`);
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const object = value as Record<string, unknown>;
    for (const key of schema.required ?? []) if (!(key in object)) errors.push(`${at}: missing ${key}`);
    for (const [key, child] of Object.entries(object)) {
      const sub = schema.properties?.[key];
      if (sub) errors.push(...validate(child, sub, key));
      else if (schema.additionalProperties === false) errors.push(`${at}: unexpected key ${key}`);
      else if (typeof schema.additionalProperties === "object") {
        errors.push(...validate(child, schema.additionalProperties, path ? `${path}.${key}` : key));
      }
    }
    if (schema.if && schema.then && validate(value, schema.if, path).length === 0) {
      errors.push(...validate(value, schema.then, path));
    }
  }
  return errors;
}

/** The text of a `## <title>` section (up to the next `## `), or "" without one. */
export function section(markdown: string, title: string, level = 2): string {
  const lines = markdown.split(/\r?\n/);
  const hashes = "#".repeat(level);
  const start = lines.findIndex((line) => line.trim().toLowerCase() === `${hashes} ${title}`.toLowerCase());
  if (start < 0) return "";
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => new RegExp(`^#{1,${level}} `).test(line));
  return (end < 0 ? rest : rest.slice(0, end)).join("\n");
}

const withoutComments = (text: string) => text.replace(/<!--[\s\S]*?-->/g, "");

/** Ticked and all task boxes of a text. */
export function boxes(text: string): { ticked: number; total: number } {
  const all = withoutComments(text).match(/^\s*[-*] \[[ xX]\]/gm) ?? [];
  return {
    ticked: all.filter((box) => /\[[xX]\]/.test(box)).length,
    total: all.length,
  };
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const vibeDirs = findVibeDirs(WORKSPACE);
  const appDir = vibeDirs.find((dir) => existsSync(join(dir, ".vibe", "plans"))) ?? vibeDirs[0] ?? WORKSPACE;
  evidence.push(`App folder: \`${relative(WORKSPACE, appDir) || "."}\` (folders with .vibe/: ${vibeDirs.length})`, "");

  // The plan (A4) and its front matter.
  const planPath = findPlan(appDir);
  const plan = planPath ? readFileSync(planPath, "utf8") : "";
  record(
    "plan_exists",
    planPath ? 1 : 0,
    planPath ? relative(WORKSPACE, planPath) : "no .vibe/plans/*.md or .vibe/plan.md",
  );
  if (planPath) {
    const plans = existsSync(join(appDir, ".vibe", "plans")) ? readdirSync(join(appDir, ".vibe", "plans")) : [];
    note(`plan files: ${plans.join(", ") || "(only .vibe/plan.md)"}`);
  }
  const front = parseFrontMatter(plan);

  // Committed and clean (before npm ci touches anything).
  const head = git(appDir, "rev-parse", "--verify", "HEAD");
  const status = git(appDir, "status", "--porcelain", "--untracked-files=all");
  const dirty = (status.stdout ?? "")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .filter((line) => !HARNESS_FILES.some((file) => line.endsWith(file)));
  const commits = head.status === 0 ? (git(appDir, "rev-list", "--count", "HEAD").stdout ?? "").trim() : "0";
  record(
    "committed_clean",
    head.status === 0 && status.status === 0 && dirty.length === 0 ? 1 : 0,
    head.status !== 0 ? "no commit" : `${commits} commits, ${dirty.length} uncommitted paths`,
  );
  for (const line of dirty.slice(0, 10)) note(`uncommitted: \`${line}\``);
  if (head.status === 0) {
    note(
      `branches: ${(git(appDir, "branch", "--format=%(refname:short)").stdout ?? "").trim().split("\n").join(", ")}`,
    );
    note(`log: ${(git(appDir, "log", "--format=%s", "-n", "15").stdout ?? "").trim().split("\n").join(" | ")}`);
  }

  // The app was created with the tooling (A3).
  const pkgPath = join(appDir, "package.json");
  const pkg = existsSync(pkgPath)
    ? (JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, Record<string, string> | undefined>)
    : undefined;
  const toolingDep = pkg?.["dependencies"]?.["@lernapps/tooling"] ?? pkg?.["devDependencies"]?.["@lernapps/tooling"];
  record(
    "app_created",
    toolingDep ? 1 : 0,
    toolingDep ? `@lernapps/tooling ${toolingDep}` : "no package.json with @lernapps/tooling",
  );

  // npm ci, then `lernapps check` (A21, and the platform rules it checks, A16–A18).
  let schemaPath = join(TESTS, "plan-front-matter.v1.schema.json");
  if (toolingDep && !SKIP_CHECK) {
    const ci = run("npm", ["ci", "--no-audit", "--no-fund"], appDir, 20 * 60_000);
    if (ci.status !== 0) {
      record("check_passes", 0, `npm ci failed with ${ci.status ?? ci.signal}`);
      note(`npm ci: ${(ci.stderr ?? "").trim().split("\n").slice(-5).join(" / ")}`);
    } else {
      const report = join(OUT, "check-report.yaml");
      const check = run("npx", ["lernapps", "check", "--report", report], appDir, 30 * 60_000);
      writeFileSync(join(OUT, "check-output.txt"), `${check.stdout ?? ""}\n${check.stderr ?? ""}`);
      const failing = existsSync(report)
        ? readFileSync(report, "utf8")
            .split(/^\s*- rule:\s*/m)
            .slice(1)
            .filter((finding) => /^\s*severity:\s*error/m.test(finding))
            .map((finding) => finding.split(/\s/)[0] ?? "")
        : [];
      record(
        "check_passes",
        check.status === 0 ? 1 : 0,
        `npx lernapps check exited ${check.status ?? check.signal}; report check-report.yaml`,
      );
      if (check.status !== 0) note(`output: ${(check.stdout ?? "").trim().split("\n").slice(0, 8).join(" / ")}`);
      if (failing.length) note(`rules with errors: ${[...new Set(failing)].join(", ")}`);
    }
    const installed = join(
      appDir,
      "node_modules",
      "@lernapps",
      "tooling",
      "guidance",
      "plan-front-matter.v1.schema.json",
    );
    if (existsSync(installed)) schemaPath = installed;
  } else {
    record("check_passes", 0, toolingDep ? "skipped (EVAL_SKIP_CHECK=1)" : "no app to check");
  }

  // The front matter against the schema of the tooling the app uses (A4), the archetype (A19), the phase (A4).
  const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as Schema;
  const errors = front ? validate(front, schema) : ["no front matter"];
  record(
    "plan_front_matter_valid",
    planPath && errors.length === 0 ? 1 : 0,
    errors.join("; ") || `valid against ${relative("/", schemaPath)}`,
  );
  const archetype = front?.["archetype"];
  record(
    "archetype_expected",
    archetype === EXPECTED_ARCHETYPE ? 1 : 0,
    `archetype ${String(archetype)}, expected ${EXPECTED_ARCHETYPE}`,
  );
  const phase = typeof front?.["phase"] === "string" ? (front["phase"] as string) : "";
  const phaseIndex = PHASES.indexOf(phase as (typeof PHASES)[number]);
  record(
    "phase_reached",
    Math.max(phaseIndex, 0) / (PHASES.length - 1),
    `phase ${phase || "(none)"}: 0 explore, 0.333 plan, 0.667 code, 1 commit`,
  );
  const failures = front?.["prePushFailures"];
  if (typeof failures === "number")
    record("pre_push_failures", failures, "prePushFailures in the front matter, written by the hook");
  const failedChecks = front?.["failedChecks"];
  if (typeof failedChecks === "object" && failedChecks !== null) {
    const runs = Object.values(failedChecks).reduce((sum: number, n) => sum + (typeof n === "number" ? n : 0), 0);
    record(
      "failed_checks",
      runs,
      `failedChecks in the front matter, written by the check: ${JSON.stringify(failedChecks)}`,
    );
  }

  // Boxes ticked in the phases before the current one (A4).
  if (planPath && phaseIndex > 0) {
    const done = PHASES.slice(0, phaseIndex).map((name) => ({
      name,
      ...boxes(section(plan, name)),
    }));
    const ticked = done.reduce((sum, part) => sum + part.ticked, 0);
    const total = done.reduce((sum, part) => sum + part.total, 0);
    record(
      "plan_boxes_ticked",
      total ? ticked / total : 0,
      done.map((part) => `${part.name} ${part.ticked}/${part.total}`).join(", "),
    );
  }

  // Retrospective (A7): the share of its four parts with text beyond the template's comments.
  if (planPath) {
    const retro = section(plan, "Retrospective");
    const filled = RETRO_PARTS.filter((part) => withoutComments(section(retro, part, 3)).trim() !== "");
    // The template fills it after the listing checkpoint; a run that stops earlier leaves it out (n/a, no 0).
    const listed = /^- \[x\] \*\*Checkpoint:\*\* list/im.test(section(plan, "Commit"));
    if (listed || filled.length > 0)
      record("retrospective_filled", filled.length / RETRO_PARTS.length, `filled: ${filled.join(", ") || "none"}`);
    else evidence.push("- `retrospective_filled`: n/a (the listing checkpoint was not reached)");
    // Competencies as "Ich kann …" (A12).
    const competencies = (plan.match(/Ich kann /g) ?? []).length;
    record("competencies_written", competencies > 0 ? 1 : 0, `${competencies} lines with "Ich kann"`);
  }

  // The content guide filled in (A13).
  const guide = join(appDir, ".agents", "skills", "app-content", "SKILL.md");
  if (existsSync(guide)) {
    const left = (readFileSync(guide, "utf8").match(/FILL IN/g) ?? []).length;
    record("app_content_filled", left === 0 ? 1 : 0, `${left} "FILL IN" left in .agents/skills/app-content/SKILL.md`);
  } else {
    record("app_content_filled", 0, "no .agents/skills/app-content/SKILL.md");
  }

  writeFileSync(join(OUT, "reward.json"), `${JSON.stringify(reward, null, 2)}\n`);
  writeFileSync(join(OUT, "evidence.md"), `# Evidence\n\n${evidence.join("\n")}\n`);
  process.stdout.write(`${JSON.stringify(reward)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
