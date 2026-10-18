// Scores the transcript of a finished eval trial: what the creator's agent read, asked and ran, from the session log
// of the agent (Claude Code, <trial>/agent/sessions/projects/*/*.jsonl). Writes <trial>/transcript-score.json with
// numbers (the dimensions, evals/expectations.json maps each to its expectation) and the evidence behind them.
//   node evals/score-transcript.ts <trial or job dir>...
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

/** One entry of a Claude Code session log, as far as the score reads it. */
interface Entry {
  type?: string;
  isSidechain?: boolean;
  isMeta?: boolean;
  timestamp?: string;
  message?: { id?: string; content?: string | Block[]; usage?: Record<string, unknown> };
}
interface Block {
  type: string;
  text?: string;
  name?: string;
  input?: Record<string, unknown>;
}

/** A turn of the agent: everything between one creator message and the next. */
interface Turn {
  creator: string;
  text: string;
  tools: { name: string; input: Record<string, unknown> }[];
}

export interface TranscriptScore {
  dimensions: Record<string, number>;
  evidence: Record<string, unknown>;
}

/** Published guidance: where the build prompt and the skills send the agent. */
const GUIDANCE = [
  /^https:\/\/lernapps\.net\/(tooling|apps)\//,
  /^https:\/\/raw\.githubusercontent\.com\/lernapps\/tooling\/[^/]+\/(skills|guidance)\//,
  /^https:\/\/github\.com\/lernapps\/tooling\/blob\/[^/]+\/(skills|guidance)\//,
];
/** Files of lernapps the agent was not sent to: any other path of a lernapps repo on GitHub. */
const LERNAPPS_REPO = /^https:\/\/(raw\.githubusercontent\.com|github\.com)\/lernapps\//;
const APPROVAL = /^\s*(ja\b|passt\b|ok\b|okay\b|einverstanden|gerne)/i;
const QUESTION = /[^?.!\n]{3,}\?/g;

const toolName = (name: string) => name.replace(/^mcp__acp__/, "");
/** The URLs in a command; a closing parenthesis belongs to a URL only when the URL opened one. */
const urlsIn = (text: string) =>
  [...text.matchAll(/https?:\/\/[^\s"'`<>\\]+/g)].map((match) => {
    let url = match[0];
    while (url.endsWith(")") && (url.match(/\(/g) ?? []).length < (url.match(/\)/g) ?? []).length)
      url = url.slice(0, -1);
    return url;
  });

/** The session logs of the agent in a trial (not those of sub-agents). */
export function sessionLogs(trial: string): string[] {
  const projects = join(trial, "agent", "sessions", "projects");
  if (!existsSync(projects)) return [];
  return readdirSync(projects)
    .map((dir) => join(projects, dir))
    .filter((dir) => statSync(dir).isDirectory())
    .flatMap((dir) =>
      readdirSync(dir)
        .filter((file) => file.endsWith(".jsonl"))
        .map((file) => join(dir, file)),
    );
}

/** The turns of a session: a creator message, then the agent's text and tool calls until the next one. */
export function turns(entries: Entry[]): Turn[] {
  const result: Turn[] = [];
  for (const entry of entries) {
    if (entry.isSidechain || entry.isMeta) continue;
    const content = entry.message?.content;
    if (entry.type === "user") {
      const text =
        typeof content === "string"
          ? content
          : (content ?? [])
              .filter((block) => block.type === "text")
              .map((block) => block.text ?? "")
              .join("\n");
      const isToolResult = Array.isArray(content) && content.some((block) => block.type === "tool_result");
      if (text.trim() !== "" && !isToolResult) result.push({ creator: text, text: "", tools: [] });
    } else if (entry.type === "assistant" && Array.isArray(content)) {
      const turn = result.at(-1);
      if (!turn) continue;
      for (const block of content) {
        if (block.type === "text") turn.text += `${turn.text ? "\n" : ""}${block.text ?? ""}`;
        if (block.type === "tool_use") turn.tools.push({ name: toolName(block.name ?? ""), input: block.input ?? {} });
      }
    }
  }
  return result;
}

const commandOf = (tool: Turn["tools"][number]) =>
  typeof tool.input["command"] === "string" ? tool.input["command"] : "";
const pathOf = (tool: Turn["tools"][number]) =>
  typeof tool.input["file_path"] === "string" ? tool.input["file_path"] : "";

/** Whether a tool call sets `phase: code` in a plan file: the agent's sign that the plan was confirmed. */
const setsPhaseCode = (tool: Turn["tools"][number]) => {
  const written = [tool.input["new_string"], tool.input["content"]].filter((value) => typeof value === "string");
  const command = commandOf(tool);
  return (
    (written.some((value) => /^phase:\s*code\b/m.test(value as string)) && /\.vibe\//.test(pathOf(tool))) ||
    (/phase:\s*code/.test(command) && /\.vibe\//.test(command))
  );
};

export function scoreTurns(all: Turn[]): TranscriptScore {
  // A11: creator turns after the confirmation of the plan (the last creator message before `phase: code` is set).
  const codeAt = all.findIndex((turn) => turn.tools.some(setsPhaseCode));
  const confirmedAt = codeAt;
  const creatorTurns = all.length;
  const afterPlan = confirmedAt >= 0 ? creatorTurns - confirmedAt - 1 : undefined;

  // A9: questions per agent turn (sentences ending in "?" in the text the creator saw).
  const questions = all.map((turn) => (turn.text.match(QUESTION) ?? []).length);
  const turnsWithText = questions.filter((_, index) => (all[index]?.text ?? "").trim() !== "");
  const maxQuestions = Math.max(0, ...questions);
  const overTwo = questions.filter((count) => count > 2).length;

  // A6: every approval of the creator answers a question the agent asked in the turn before.
  const approvals = all
    .map((turn, index) => ({ index, approval: index > 0 && APPROVAL.test(turn.creator) }))
    .filter((turn) => turn.approval);
  const afterQuestion = approvals.filter((turn) => (questions[turn.index - 1] ?? 0) > 0).length;

  // A1, A2: guidance read, and how: a raw download (curl, wget, a file read) or a summarising fetch (WebFetch).
  const fetches: { url: string; via: "raw" | "summary"; turn: number }[] = [];
  const readFiles: { path: string; turn: number }[] = [];
  const commands: { command: string; turn: number }[] = [];
  all.forEach((turn, index) => {
    for (const tool of turn.tools) {
      if (tool.name === "WebFetch" && typeof tool.input["url"] === "string") {
        fetches.push({ url: tool.input["url"], via: "summary", turn: index });
      }
      const command = commandOf(tool);
      if (command) {
        commands.push({ command, turn: index });
        if (/\b(curl|wget)\b/.test(command))
          for (const url of urlsIn(command)) fetches.push({ url, via: "raw", turn: index });
        for (const match of command.matchAll(/\b(?:cat|head|tail|less|sed -n [^ ]+)\s+([^\s;&|]+\.md)\b/g)) {
          readFiles.push({ path: match[1] ?? "", turn: index });
        }
      }
      if (tool.name === "Read" && pathOf(tool)) readFiles.push({ path: pathOf(tool), turn: index });
      if (tool.name === "Skill" && typeof tool.input["skill"] === "string") {
        readFiles.push({ path: `skill:${tool.input["skill"]}`, turn: index });
      }
    }
  });
  const guidanceFetches = fetches.filter((fetch) => GUIDANCE.some((pattern) => pattern.test(fetch.url)));
  const summaryFetches = guidanceFetches.filter((fetch) => fetch.via === "summary");
  const outside = fetches.filter(
    (fetch) => LERNAPPS_REPO.test(fetch.url) && !GUIDANCE.some((pattern) => pattern.test(fetch.url)),
  );
  const skillRead = (name: string) =>
    readFiles.some((file) => file.path === `skill:${name}` || file.path.includes(`skills/${name}/SKILL.md`)) ||
    guidanceFetches.some((fetch) => fetch.via === "raw" && fetch.url.includes(`skills/${name}/SKILL.md`));
  const planTemplateRaw =
    guidanceFetches.some((fetch) => fetch.via === "raw" && fetch.url.includes("plan-template.md")) ||
    readFiles.some((file) => file.path.includes("plan-template.md"));
  const skills = [
    ...new Set(
      [
        ...readFiles.map(({ path, turn }) => ({ path, turn })),
        ...guidanceFetches.filter((f) => f.via === "raw").map((f) => ({ path: f.url, turn: f.turn })),
      ]
        .sort((a, b) => a.turn - b.turn)
        .map(({ path }) => /skill:([\w-]+)|skills\/([\w-]+)\/SKILL\.md/.exec(path))
        .filter((match) => match !== null)
        .map((match) => match[1] ?? match[2] ?? ""),
    ),
  ];

  // A3: nothing installed and no app created before the plan is confirmed (`npx skills add` belongs to Explore).
  const install = /\b(npm (install|i|ci|add)\b|npx\b(?!.*\bskills add\b).*\bcreate\b|lernapps create)/;
  const earlyInstalls = commands.filter(
    (entry) =>
      (confirmedAt < 0 || entry.turn < confirmedAt) &&
      install.test(entry.command) &&
      !/\bskills add\b|--help\b/.test(entry.command) &&
      // tools for reading sources (a PDF reader in /tmp) are research, not the app
      !/\bcd \/tmp\b|\/tmp\/\S+ &&/.test(entry.command),
  );
  // A3: the app is created with the command the plan names.
  const createdWith = commands.find((entry) =>
    /github:lernapps\/tooling#main create --archetype \w+/.test(entry.command),
  );

  // A22: no hook bypass and no edit of the counter the hook writes.
  // Reading the hooks path (`git config --get core.hooksPath`) is no bypass; setting or unsetting it is.
  const bypasses = commands.filter((entry) =>
    /\bgit\b[^;&|]*\b(commit|push|merge|rebase|am)\b[^;&|]*--no-verify|HUSKY=0|SKIP_HOOKS|core\.hooksPath\s+[^\s;|&]|--unset\s+core\.hooksPath/.test(
      entry.command,
    ),
  );
  const counterEdits = all.flatMap((turn) =>
    turn.tools.filter((tool) => {
      const before = tool.input["old_string"];
      const after = tool.input["new_string"];
      return (
        typeof before === "string" &&
        typeof after === "string" &&
        /prePushFailures/.test(`${before}${after}`) &&
        (before.match(/prePushFailures:\s*\d+/)?.[0] ?? "") !== (after.match(/prePushFailures:\s*\d+/)?.[0] ?? "")
      );
    }),
  );

  const dimensions: Record<string, number> = {
    creator_turns: creatorTurns,
    plan_confirmed: confirmedAt >= 0 ? 1 : 0,
    questions_per_turn_mean: turnsWithText.length
      ? Math.round((turnsWithText.reduce((sum, count) => sum + count, 0) / turnsWithText.length) * 100) / 100
      : 0,
    questions_per_turn_max: maxQuestions,
    turns_over_two_questions: overTwo,
    approvals_after_question: approvals.length ? Math.round((afterQuestion / approvals.length) * 100) / 100 : 1,
    skill_read_raw: skillRead("lernapps-app") ? 1 : 0,
    plan_template_read_raw: planTemplateRaw ? 1 : 0,
    guidance_summary_fetches: summaryFetches.length,
    reads_outside_guidance: outside.length,
    installs_before_plan: earlyInstalls.length,
    created_with_plan_command: createdWith ? 1 : 0,
    no_verify_bypass: bypasses.length === 0 ? 1 : 0,
    pre_push_counter_edits: counterEdits.length,
  };
  if (afterPlan !== undefined) dimensions["creator_turns_after_plan"] = afterPlan;
  return {
    dimensions,
    evidence: {
      planConfirmedAtCreatorTurn: confirmedAt >= 0 ? confirmedAt + 1 : null,
      creatorMessages: all.map((turn, index) => ({
        turn: index + 1,
        creator: turn.creator.slice(0, 200),
        agentQuestions: questions[index],
      })),
      skillsRead: skills,
      guidanceFetches: guidanceFetches.map(({ url, via, turn }) => ({ url, via, turn: turn + 1 })),
      readsOutsideGuidance: outside.map((fetch) => fetch.url),
      otherUrls: [
        ...new Set(
          fetches
            .filter((fetch) => !LERNAPPS_REPO.test(fetch.url) && !GUIDANCE.some((p) => p.test(fetch.url)))
            .map((fetch) => fetch.url),
        ),
      ],
      installsBeforePlan: earlyInstalls.map((entry) => entry.command.slice(0, 200)),
      bypasses: bypasses.map((entry) => entry.command.slice(0, 200)),
    },
  };
}

/**
 * The tokens of the agent under test, from its session log: Harbor's own numbers for an ACP target are not the
 * target's. One API message is logged as several entries with the same id and usage; each counts once.
 */
export function usage(entries: Entry[]): Record<string, number> {
  const seen = new Set<string>();
  const sum = { agent_input_tokens: 0, agent_cache_read_tokens: 0, agent_output_tokens: 0 };
  for (const entry of entries) {
    const message = entry.message;
    if (entry.type !== "assistant" || !message?.usage || (message.id && seen.has(message.id))) continue;
    if (message.id) seen.add(message.id);
    const value = (key: string) => (typeof message.usage?.[key] === "number" ? (message.usage[key] as number) : 0);
    sum.agent_input_tokens += value("input_tokens") + value("cache_creation_input_tokens");
    sum.agent_cache_read_tokens += value("cache_read_input_tokens");
    sum.agent_output_tokens += value("output_tokens");
  }
  return sum;
}

/** Scores one trial directory and writes its transcript-score.json; undefined when it has no session log. */
export function scoreTrial(trial: string): TranscriptScore | undefined {
  const logs = sessionLogs(trial);
  if (logs.length === 0) return undefined;
  const entries = logs
    .flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => JSON.parse(line) as Entry),
    )
    .sort((a, b) => (a.timestamp ?? "").localeCompare(b.timestamp ?? ""));
  const score = scoreTurns(turns(entries));
  Object.assign(score.dimensions, usage(entries));
  writeFileSync(join(trial, "transcript-score.json"), `${JSON.stringify(score, null, 2)}\n`);
  return score;
}

/** The trial directories of a job directory, or the directory itself when it is a trial. */
export function trialsOf(dir: string): string[] {
  if (existsSync(join(dir, "agent"))) return [dir];
  return readdirSync(dir)
    .map((name) => join(dir, name))
    .filter((path) => statSync(path).isDirectory() && existsSync(join(path, "agent")));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dirs = process.argv.slice(2);
  if (dirs.length === 0) {
    process.stderr.write("Usage: node evals/score-transcript.ts <trial or job dir>...\n");
    process.exit(2);
  }
  for (const trial of dirs.flatMap(trialsOf)) {
    const score = scoreTrial(trial);
    process.stdout.write(`${basename(trial)}: ${score ? JSON.stringify(score.dimensions) : "no session log"}\n`);
  }
}
