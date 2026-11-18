// Reads the log of a Claude Code session (JSON lines) and counts where the information came from that reached the
// assistant: the creator's session, AGENTS.md and the plan, the skills, the check tool, a sub-agent, or the working
// environment. It also lists the sub-agent runs (reviews, learner checks) and the severities of review verdicts.
// It writes numbers only (no texts of the session) as JSON.
//
// Messages that a person typed in the chat to support the session administratively are not counted.
//
// Usage: node scripts/session-analysis.ts <session.jsonl> <out.json>
import { readFileSync, writeFileSync } from "node:fs";

export type Source = "creator" | "guidance" | "skills" | "data" | "check" | "subagent" | "retrieval" | "writes";

export const SOURCES: readonly Source[] = ["creator", "guidance", "skills", "data", "check", "subagent", "retrieval", "writes"];

export interface Event {
  /** Minutes since the first message. */
  t: number;
  source: Source;
  /** Characters of the text that reached the assistant. */
  chars: number;
  /** Short kind, e.g. "ReadNotifications", "Bash:lernapps check". No session text. */
  kind: string;
  /** For messages of the creator's session: "answer", "task" or the kind of file it passed on. For retrieval: "web" (web, GitHub) or "own files". */
  detail?: string;
  /** The file reached the assistant through the creator's session, not from a file of the app. */
  relayed?: boolean;
}

export interface AgentRun {
  description: string;
  /** Minutes the run took (its own report). */
  minutes: number;
  toolUses: number;
  tokens: number;
}

export interface Verdict {
  outcome: string;
  errors: number;
  warnings: number;
  hints: number;
  proposals: number;
}

export interface Analysis {
  minutes: number;
  toolCalls: number;
  toolCallsByName: Record<string, number>;
  creatorAnswers: number;
  creatorTasks: number;
  relayedFiles: number;
  events: Event[];
  bySource: Record<Source, { events: number; chars: number }>;
  agents: AgentRun[];
  verdicts: Verdict[];
  /** Results between two messages of the creator's session, longest and average. */
  longestRun: number;
  averageRun: number;
}

/** An object of the log. The keys the code reads are declared, so that they can be read with a dot. */
interface Json {
  [key: string]: unknown;
  operation?: unknown;
  type?: unknown;
  message?: unknown;
  timestamp?: unknown;
  origin?: unknown;
  content?: unknown;
  text?: unknown;
  name?: unknown;
  id?: unknown;
  input?: unknown;
  tool_use_id?: unknown;
  kind?: unknown;
  command?: unknown;
  file_path?: unknown;
  path?: unknown;
  description?: unknown;
}

/** A command that only reads: cat, head, sed -n, grep, ls; never one that writes a file. */
const readsOnly = (command: string): boolean => {
  const c = command.replace(/\d*>&\d+|\d*>\s*\/dev\/null/g, "");
  return /(^|[\s;&|(])(cat|head|tail|sed -n|grep|ls|wc)\b/.test(c) && !/python3|sed -i|<<|>\s*\S|tee\b/.test(c);
};

const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const asString = (v: unknown): string => (typeof v === "string" ? v : "");

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((b) => (isObject(b) ? asString(b.text) || textOf(b.content) : ""))
    .join("\n");
}

function relayedKind(body: string): string {
  const b = body.replace(/^\s+/gm, "");
  if (/^# lernapps\.net tooling/m.test(b)) return "entry file llms.txt";
  if (/^name: lernapps-/m.test(b)) return "skill";
  if (/^# Archetype /m.test(b)) return "template README";
  if (/"\$schema"/.test(b)) return "schema";
  if (/Lernlandkarte|^- strand: /m.test(b)) return "learning map";
  if (/^```rule/m.test(b) || /^## `[a-z-]+`:/m.test(b)) return "rules";
  if (/^# (Blocks|Exercises|Structure|Language tasks|Explainer runtime|Sub-agent brief)/m.test(b)) return "skill reference";
  if (/<svg /.test(b)) return "figure";
  return "file";
}

/** The text of a message of another session, without the frame the harness puts around it. */
function innerMessage(body: string): string {
  const i = body.search(/To reply, call the send_message tool[^\n]*\n/);
  if (i < 0) return body;
  return body.slice(i).replace(/^[^\n]*\n/, "");
}

/** A message of the creator's session is a document it passed on, or the creator's own word: an answer or a task. */
function classifyCrossSession(raw: string): { source: Source; detail: string; relayed?: boolean } {
  const body = innerMessage(raw);
  const b = body.replace(/^\s+/gm, "").trim();
  if (/^Hinweis: Die Original-Datei/.test(b)) return { source: "data", detail: "learning map", relayed: true };
  if (/^(#|---|\{|<svg)/.test(b)) {
    const detail = relayedKind(body);
    const source: Source =
      detail === "entry file llms.txt"
        ? "guidance"
        : detail === "learning map" || detail === "schema" || detail === "figure"
          ? "data"
          : "skills";
    return { source, detail, relayed: true };
  }
  return { source: "creator", detail: /^(Auftrag|Ergänzung)/.test(b) ? "task" : "answer" };
}

/** Reaching out for information on the web or on GitHub: a clone, a fetch, a read-only API call, a page. */
const reachesOut = (command: string): boolean =>
  /git (clone|fetch|ls-remote)\b/.test(command) ||
  (/\bgh api\b/.test(command) && !/-X\s*(POST|PATCH|PUT|DELETE)|--input|-f\s|-F\s/.test(command)) ||
  /curl[^|;&]*https?:\/\/(?!localhost|127\.|0\.0\.0\.0)/.test(command);

function classifyTool(name: string, input: Json): { source: Source; kind: string; detail?: string } {
  const command = asString(input.command);
  const path = asString(input.file_path) || asString(input.path);
  if (name === "Read" || name === "Bash" || name === "Grep" || name === "Glob") {
    const target = name === "Bash" ? command : path;
    const toolRun =
      /lernapps(_audio)?[ .a-z_-]*\b(check|create|screenshots)\b|lernapps_audio\.py|@lernapps\/tooling|vp (build|test)|git commit/.test(
        command,
      );
    if (name === "Bash" && !toolRun && reachesOut(command)) return { source: "retrieval", kind: "Bash:web or GitHub", detail: "web" };
    const writes = name === "Bash" && !toolRun && !readsOnly(command);
    if (writes) return { source: "writes", kind: "Bash:own work" };
    if (/\.agents\/skills\/|\.claude\/skills\//.test(target)) return { source: "skills", kind: `${name}:skill file` };
    if (/AGENTS\.md|CLAUDE\.md|\.vibe\/plans\//.test(target)) return { source: "guidance", kind: `${name}:AGENTS.md or plan` };
  }
  if (name === "Skill") return { source: "skills", kind: "Skill" };
  if (name === "Bash") {
    if (/lernapps(_audio)?[ .a-z_-]*\b(check|create|screenshots)\b/.test(command)) {
      return {
        source: "check",
        kind: "Bash:lernapps " + (/check/.test(command) ? "check" : /create/.test(command) ? "create" : "screenshots"),
      };
    }
    if (/lernapps_audio\.py/.test(command)) return { source: "skills", kind: "Bash:audio script of a skill" };
    if (/lernapps\/tooling|@lernapps\/tooling/.test(command)) return { source: "check", kind: "Bash:lernapps init" };
    if (/vp build|vp test/.test(command)) return { source: "check", kind: "Bash:build" };
    if (/git commit/.test(command)) return { source: "check", kind: "Bash:git commit (hooks)" };
    return { source: "retrieval", kind: "Bash:read", detail: "own files" };
  }
  if (name === "Agent") return { source: "subagent", kind: "Agent" };
  if (name === "Read" || name === "Grep" || name === "Glob") return { source: "retrieval", kind: name, detail: "own files" };
  if (name === "WebFetch" || name === "WebSearch" || /^mcp__claude-code-remote__(list_repos|add_repo)$/.test(name)) {
    return { source: "retrieval", kind: name, detail: "web" };
  }
  if (name === "ToolSearch" || name === "ListAgents") return { source: "retrieval", kind: name, detail: "own files" };
  return { source: "writes", kind: name };
}

function countVerdict(text: string): Verdict | null {
  if (!/^reviewed:\s*\n\s+commit:/m.test(text) || !/^outcome:/m.test(text)) return null;
  const outcome = /^outcome:\s*(\w+)/m.exec(text)?.[1] ?? "";
  const count = (s: string) => (text.match(new RegExp(`^ {4}severity: ${s}$`, "gm")) ?? []).length;
  return {
    outcome,
    errors: count("error"),
    warnings: count("warning"),
    hints: count("hint"),
    proposals: (text.match(/^ {2}- proposal:/gm) ?? []).length,
  };
}

export function analyse(raw: string): Analysis {
  const rows: Json[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const o: unknown = JSON.parse(line);
      if (isObject(o)) rows.push(o);
    } catch {
      /* a broken line is skipped */
    }
  }
  const stamp = (o: Json) => Date.parse(asString(o.timestamp));
  // Active time: a gap of more than 15 minutes between two entries (the session waited) counts as one minute.
  const MAX_GAP = 15 * 60000;
  const sorted = rows.map(stamp).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
  const start = sorted[0] ?? 0;
  const active: number[] = [];
  let sum = 0;
  sorted.forEach((n, i) => {
    const gap = i === 0 ? 0 : n - (sorted[i - 1] ?? n);
    sum += gap > MAX_GAP ? 60000 : gap;
    active.push(sum);
  });
  const activeAt = (ms: number): number => {
    let lo = 0;
    for (let i = 0; i < sorted.length; i += 1) if ((sorted[i] ?? 0) <= ms) lo = i;
    return (active[lo] ?? 0) / 60000;
  };

  const uses = new Map<string, { name: string; input: Json }>();
    const toolCallsByName: Record<string, number> = {};
  const events: Event[] = [];
  const agents: AgentRun[] = [];
  const verdicts: Verdict[] = [];
  let creatorAnswers = 0;
  let creatorTasks = 0;
  let relayedFiles = 0;
  let toolCalls = 0;

  for (const o of rows) {
    const message = isObject(o.message) ? o.message : null;
    if (o.type === "assistant" && message && Array.isArray(message.content)) {
      for (const b of message.content) {
        if (isObject(b) && b.type === "tool_use") {
          const name = asString(b.name);
          const input = isObject(b.input) ? b.input : {};
          uses.set(asString(b.id), { name, input });
          toolCallsByName[name] = (toolCallsByName[name] ?? 0) + 1;
          toolCalls += 1;
        }
      }
      continue;
    }
    if (o.type === "queue-operation" && o.operation === "enqueue") {
      const text = asString(o.content);
      const done = /<summary>Agent "([^"]+)" finished<\/summary>/.exec(text);
      if (done?.[1]) {
        const usage = (tag: string) => Number(new RegExp(`<${tag}>(\\d+)</${tag}>`).exec(text)?.[1] ?? 0);
        agents.push({
          description: done[1],
          minutes: Math.round(usage("duration_ms") / 600) / 100,
          toolUses: usage("tool_uses"),
          tokens: usage("subagent_tokens"),
        });
      }
      continue;
    }
    if (o.type !== "user" || !message) continue;
    const t = activeAt(stamp(o));
    const origin = isObject(o.origin) ? asString(o.origin.kind) : "";
    const content = message.content;
    const parts = Array.isArray(content) ? content : [{ type: "text", text: content }];
    for (const b of parts) {
      if (!isObject(b)) continue;
      if (b.type === "tool_result") {
        const use = uses.get(asString(b.tool_use_id));
        const text = textOf(b.content);
        if (!use) continue;
        const verdict = /verdict\.yaml/.test(asString(use.input.command)) ? countVerdict(text) : null;
        if (verdict) verdicts.push(verdict);
        if (use.name === "ReadNotifications") {
          const bodies = text.split(/<cross-session-message[^>]*>/).slice(1);
          for (const body of bodies) {
            const c = classifyCrossSession(body.split("</cross-session-message>")[0] ?? "");
            events.push({
              t,
              source: c.source,
              chars: body.length,
              kind: "message of the creator's session",
              detail: c.detail,
              ...(c.relayed ? { relayed: true } : {}),
            });
            if (c.relayed) relayedFiles += 1;
            else if (c.detail === "task") creatorTasks += 1;
            else creatorAnswers += 1;
          }
          continue;
        }
        // Results of the Artifact tool are left out: its built-in design guidance was not used to decide anything.
        if (use.name === "Artifact") continue;
        const c = classifyTool(use.name, use.input);
        events.push({ t, source: c.source, chars: text.length, kind: c.kind, ...(c.detail !== undefined ? { detail: c.detail } : {}) });
      } else if (b.type === "text") {
        const text = asString(b.text);
        // A person's own chat messages are left out. A report of a sub-agent is counted.
        if (origin === "peer") events.push({ t, source: "subagent", chars: text.length, kind: "report of a sub-agent" });
      }
    }
  }
  events.sort((a, b) => a.t - b.t);

  const bySource = Object.fromEntries(SOURCES.map((s) => [s, { events: 0, chars: 0 }])) as Analysis["bySource"];
  for (const e of events) {
    bySource[e.source].events += 1;
    bySource[e.source].chars += e.chars;
  }

  // Runs: results between two messages of the creator's session.
  const runs: number[] = [];
  let run = 0;
  for (const e of events) {
    if (e.source === "creator") {
      runs.push(run);
      run = 0;
    } else run += 1;
  }
  runs.push(run);

  return {
    minutes: Math.round(sum / 600) / 100,
    toolCalls,
    toolCallsByName,
    creatorAnswers,
    creatorTasks,
    relayedFiles,
    events,
    bySource,
    agents,
    verdicts,
    longestRun: Math.max(...runs),
    averageRun: Math.round((runs.reduce((a, b) => a + b, 0) / runs.length) * 10) / 10,
  };
}

if (process.argv[1]?.endsWith("session-analysis.ts")) {
  const [, , input, output] = process.argv;
  if (!input || !output) {
    console.error("Usage: node scripts/session-analysis.ts <session.jsonl> <out.json>");
    process.exit(2);
  }
  const result = analyse(readFileSync(input, "utf8"));
  writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
  console.log(`${result.events.length} events, ${result.toolCalls} tool calls, ${result.minutes} minutes`);
}
