// Scores the transcript of a finished eval trial: what the creator's agent read, asked and ran, from the session log
// of the agent (Claude Code, <trial>/agent/sessions/projects/*/*.jsonl). Writes <trial>/transcript-score.json with
// numbers (the dimensions, evals/expectations.json maps each to its expectation) and the evidence behind them. The
// skills loaded in their phase (A2) are scored against the job's skills-by-phase.json (evals/skills-by-phase.ts).
//   node evals/score-transcript.ts <trial or job dir>...
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { SkillsByPhase } from "./skills-by-phase.ts";

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
  id?: string;
  tool_use_id?: string;
  content?: string | Block[];
  input?: Record<string, unknown>;
}

/** A turn of the agent: everything between one creator message and the next. */
interface Turn {
  creator: string;
  text: string;
  /** The agent's first text in the turn, where the reply to the creator begins, and the tool calls made before it. */
  opening?: { text: string; toolsBefore: number };
  /** The agent's tool calls, each with what it returned (the text of its tool result). */
  tools: { name: string; input: Record<string, unknown>; id?: string; result?: string }[];
}

/** What the skill score of a trial needs: the guidance's skills by phase, and the task's archetype and conditions. */
export interface SkillContext {
  /** Phase → the skills the guidance loads in it (skills-by-phase.json of the job). */
  phases: Record<string, string[]>;
  /** Skill → its archetype, for the skills of one archetype. */
  archetypes: Record<string, string>;
  /** The archetype the task expects. */
  archetype: string;
  /** Skills the guidance loads only on a condition the task may not meet (task.toml `skills_conditional`). */
  conditional: string[];
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
/**
 * The scenario's regular end, as the persona's last message states it: its answer to a GitHub question, its "Stopp" at
 * the question to publish, or its "Danke!" when the agent says it is done; the persona may word them freely around
 * these. Its other end, "Danke, wir hören hier auf.", is for an agent that is stuck.
 */
const SCENARIO_END = /kein GitHub-Repo angelegt|Stopp, das reicht|Danke!/i;
const STUCK = /^\s*Danke, wir hören hier auf/i;
/** The persona's marker of its end (since 2026-10-21); a run without it falls back to the sentences above. */
const END_MARKER = /\[Ende:\s*(veröffentlichen|fertig|festgefahren)\]/i;
/** The phase a reply begins with ("**Plan · Checkpoint**"), as the plan template asks. */
const ANNOUNCED = /^[\s*_#>]*(explore|plan|code|commit)\b/i;

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
      for (const block of Array.isArray(content) ? content : []) {
        if (block.type !== "tool_result") continue;
        const tool = result.at(-1)?.tools.find((call) => call.id !== undefined && call.id === block.tool_use_id);
        if (!tool) continue;
        tool.result =
          typeof block.content === "string"
            ? block.content
            : (block.content ?? []).map((part) => part.text ?? "").join("\n");
      }
    } else if (entry.type === "assistant" && Array.isArray(content)) {
      const turn = result.at(-1);
      if (!turn) continue;
      for (const block of content) {
        if (block.type === "text") {
          turn.text += `${turn.text ? "\n" : ""}${block.text ?? ""}`;
          if (turn.opening === undefined && (block.text ?? "").trim() !== "")
            turn.opening = { text: block.text ?? "", toolsBefore: turn.tools.length };
        }
        if (block.type === "tool_use")
          turn.tools.push({
            name: toolName(block.name ?? ""),
            input: block.input ?? {},
            ...(block.id ? { id: block.id } : {}),
          });
      }
    }
  }
  return result;
}

const commandOf = (tool: Turn["tools"][number]) =>
  typeof tool.input["command"] === "string" ? tool.input["command"] : "";
const pathOf = (tool: Turn["tools"][number]) =>
  typeof tool.input["file_path"] === "string" ? tool.input["file_path"] : "";

const PHASES = ["explore", "plan", "code", "commit"];

const lastOf = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].at(-1)?.[1];

/**
 * The phase a plan holds after a tool call, if the call shows it: `phase: <name>` written into `.vibe/` (the last such
 * line), a command on `.vibe/` that writes it (`sed 's/^phase: plan$/phase: code/'` or a one-liner: the last value
 * named, which is the new one), or the output of the `grep '^phase:'` the plan template prescribes, which also covers
 * a helper script that changed the plan.
 */
const phaseSet = (tool: Turn["tools"][number]): string | undefined => {
  const written = [tool.input["new_string"], tool.input["content"]].filter((value) => typeof value === "string");
  const command = commandOf(tool);
  const inFile = /\.vibe\//.test(pathOf(tool))
    ? written.map((value) => lastOf(value as string, /^phase:\s*(explore|plan|code|commit)\b/gm)).find(Boolean)
    : undefined;
  const inCommand = /\.vibe\//.test(command) ? lastOf(command, /phase:\s*(explore|plan|code|commit)\b/g) : undefined;
  const shown =
    /\bgrep\b/.test(command) && /phase/.test(command) && tool.result
      ? lastOf(tool.result, /^(?:[^\n:]*:)?phase:\s*(explore|plan|code|commit)\b/gm)
      : undefined;
  return inFile ?? inCommand ?? shown;
};

/** Whether a tool call sets `phase: code` in a plan file: the agent's sign that the plan was confirmed. */
const setsPhaseCode = (tool: Turn["tools"][number]) => phaseSet(tool) === "code";

/** The skills a tool call loads in full: the Skill tool, a read of its SKILL.md, or a raw download of it. */
const skillsLoaded = (tool: Turn["tools"][number]): string[] => {
  const fromPath = (path: string) => /(?:^|\/)([\w-]+)\/SKILL\.md\b/.exec(path)?.[1];
  if (tool.name === "Skill" && typeof tool.input["skill"] === "string")
    return [tool.input["skill"].replace(/^.*:/, "")];
  if (tool.name === "Read") return [fromPath(pathOf(tool))].filter((name) => name !== undefined);
  const command = commandOf(tool);
  const reads = [...command.matchAll(/\b(?:cat|head|tail|less|sed -n [^ ]+)\s+([^\s;&|]+\/SKILL\.md)\b/g)].map(
    (match) => match[1] ?? "",
  );
  // `cd <skill folder> && cat SKILL.md`: the folder names the skill
  const folder = /\bcd\s+([^\s;&|]+)/.exec(command)?.[1]?.replace(/\/+$/, "");
  const inFolder =
    folder && /\b(?:cat|head|tail|less|sed -n [^ ]+)\s+SKILL\.md\b/.test(command) ? [`${folder}/SKILL.md`] : [];
  const downloads = /\b(curl|wget)\b/.test(command) ? urlsIn(command).filter((url) => url.endsWith("/SKILL.md")) : [];
  return [...reads, ...inFolder, ...downloads].map(fromPath).filter((name) => name !== undefined);
};

/**
 * A2: the skills of the guidance, loaded by the end of their phase. A phase runs from the call that sets it in the
 * plan (Explore from the start) to the call that sets the next one; only phases the trial reached count. Expected in
 * a phase: its skills, without those of another archetype and those the task leaves to a condition. A skill loaded
 * before its phase counts as loaded, and once as out of place, together with a skill of another archetype.
 */
export function scoreSkills(
  loads: { name: string; seq: number }[],
  starts: { phase: string; seq: number }[],
  context: SkillContext,
): { dimensions: Record<string, number>; evidence: Record<string, unknown> } {
  const reached = PHASES.map((phase) => ({
    phase,
    seq: phase === "explore" ? 0 : starts.find((start) => start.phase === phase)?.seq,
  })).filter((entry): entry is { phase: string; seq: number } => entry.seq !== undefined);
  reached.sort((a, b) => a.seq - b.seq);
  const otherArchetype = (name: string) => {
    const archetype = context.archetypes[name];
    return archetype !== undefined && archetype !== context.archetype;
  };
  const perPhase = reached.map(({ phase }, index) => {
    const end = reached[index + 1]?.seq ?? Number.POSITIVE_INFINITY;
    const expected = (context.phases[phase] ?? []).filter(
      (name) => !otherArchetype(name) && !context.conditional.includes(name),
    );
    const loaded = expected.filter((name) => loads.some((load) => load.name === name && load.seq < end));
    return { phase, expected, loaded, missing: expected.filter((name) => !loaded.includes(name)) };
  });
  const firstPhaseStart = (name: string) =>
    Math.min(
      ...Object.entries(context.phases)
        .filter(([, names]) => names.includes(name))
        .map(([phase]) => reached.find((entry) => entry.phase === phase)?.seq ?? Number.POSITIVE_INFINITY),
    );
  const known = new Set(Object.values(context.phases).flat());
  const outOfPlace = [
    ...new Set(
      loads
        .filter((load) => known.has(load.name) && (otherArchetype(load.name) || load.seq < firstPhaseStart(load.name)))
        .map((load) => load.name),
    ),
  ];
  const expected = perPhase.reduce((sum, phase) => sum + phase.expected.length, 0);
  const loaded = perPhase.reduce((sum, phase) => sum + phase.loaded.length, 0);
  return {
    dimensions: {
      ...(expected > 0 ? { skills_in_phase: Math.round((loaded / expected) * 100) / 100 } : {}),
      skills_out_of_place: outOfPlace.length,
    },
    evidence: { skillsByPhase: perPhase, skillsOutOfPlace: outOfPlace },
  };
}

export function scoreTurns(all: Turn[], skillContext?: SkillContext): TranscriptScore {
  // A11: creator turns after the confirmation of the plan (the last creator message before `phase: code` is set).
  // The creator's message that opens that turn is the confirmation, so a command in the same turn comes after it.
  const confirmedAt = all.findIndex((turn) => turn.tools.some(setsPhaseCode));
  const creatorTurns = all.length;
  const afterPlan = confirmedAt >= 0 ? creatorTurns - confirmedAt - 1 : undefined;
  // After the plan's yes, the creator's last message ends the scenario regularly (whether the agent had set
  // `phase: commit` or not). An answer to a GitHub question in the middle of Code is no end.
  const last = all.at(-1)?.creator ?? "";
  const marker = last.match(END_MARKER)?.[1]?.toLowerCase();
  const regular = marker ? marker !== "festgefahren" : SCENARIO_END.test(last) && !STUCK.test(last);
  const endAt = confirmedAt >= 0 && creatorTurns - 1 > confirmedAt && regular ? creatorTurns - 1 : -1;

  // The phase each reply begins with, against the phase the plan holds at that point of the turn.
  let held = "explore";
  const announced = all.map((turn) => {
    const opening = turn.opening;
    turn.tools.slice(0, opening?.toolsBefore).forEach((tool) => (held = phaseSet(tool) ?? held));
    const at = held;
    turn.tools.slice(opening?.toolsBefore ?? turn.tools.length).forEach((tool) => (held = phaseSet(tool) ?? held));
    return { phase: opening?.text.match(ANNOUNCED)?.[1]?.toLowerCase(), held: at, replied: opening !== undefined };
  });
  // The reply to the creator's last message is left out: the creator has ended and reads it no more.
  const replies = announced.slice(0, -1).filter((turn) => turn.replied);
  const withPhase = replies.filter((turn) => turn.phase !== undefined);

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
    readFiles.some((file) => file.path === `skill:${name}` || file.path.includes(`/${name}/SKILL.md`)) ||
    guidanceFetches.some((fetch) => fetch.via === "raw" && fetch.url.includes(`/${name}/SKILL.md`));
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
        .map(({ path }) => /skill:([\w-]+)|skills\/(?:[\w-]+\/)?([\w-]+)\/SKILL\.md/.exec(path))
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

  // A2: the skills loaded, and the phases set, in the order of the tool calls.
  const loads: { name: string; seq: number }[] = [];
  const starts: { phase: string; seq: number }[] = [];
  let seq = 0;
  for (const turn of all) {
    for (const tool of turn.tools) {
      seq += 1;
      for (const name of skillsLoaded(tool)) loads.push({ name, seq });
      const phase = phaseSet(tool);
      if (phase && !starts.some((start) => start.phase === phase)) starts.push({ phase, seq });
    }
  }
  const skillScore =
    skillContext && Object.keys(skillContext.phases).length > 0 ? scoreSkills(loads, starts, skillContext) : undefined;

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
    scenario_end: endAt >= 0 ? 1 : 0,
    phase_announced: replies.length ? Math.round((withPhase.length / replies.length) * 100) / 100 : 0,
  };
  if (afterPlan !== undefined) dimensions["creator_turns_after_plan"] = afterPlan;
  if (withPhase.length)
    dimensions["phase_announced_right"] =
      Math.round((withPhase.filter((turn) => turn.phase === turn.held).length / withPhase.length) * 100) / 100;
  Object.assign(dimensions, skillScore?.dimensions);
  return {
    dimensions,
    evidence: {
      ...skillScore?.evidence,
      planConfirmedAtCreatorTurn: confirmedAt >= 0 ? confirmedAt + 1 : null,
      scenarioEndAtCreatorTurn: endAt >= 0 ? endAt + 1 : null,
      scenarioEnd: marker ?? null,
      phasesAnnounced: announced.map((turn, index) => ({
        turn: index + 1,
        announced: turn.phase ?? null,
        plan: turn.held,
      })),
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

/**
 * The skill context of a trial: its job's skills-by-phase.json (written by evals/harbor/run.sh) and the archetype and
 * conditional skills of the job's task (evals/tasks/<task>/task.toml); undefined for a job without them.
 */
export function skillContext(trial: string): SkillContext | undefined {
  const job = dirname(trial);
  const file = join(job, "skills-by-phase.json");
  const configuration = join(job, "configuration.json");
  if (!existsSync(file) || !existsSync(configuration)) return undefined;
  const { phases, archetypes } = JSON.parse(readFileSync(file, "utf8")) as SkillsByPhase;
  const { task } = JSON.parse(readFileSync(configuration, "utf8")) as { task?: string };
  const toml = join(resolve(dirname(fileURLToPath(import.meta.url))), "tasks", task ?? "", "task.toml");
  if (!task || !existsSync(toml)) return undefined;
  const text = readFileSync(toml, "utf8");
  const archetype = /^archetype\s*=\s*"([\w-]+)"/m.exec(text)?.[1] ?? "";
  const conditional = [
    ...(/^skills_conditional\s*=\s*\[([^\]]*)\]/m.exec(text)?.[1] ?? "").matchAll(/"([\w-]+)"/g),
  ].map((match) => match[1] ?? "");
  return { phases, archetypes, archetype, conditional };
}

/** Scores one trial directory and writes its transcript-score.json; undefined when it has no session log. */
export function scoreTrial(trial: string, skills = skillContext(trial)): TranscriptScore | undefined {
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
  const score = scoreTurns(turns(entries), skills);
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
