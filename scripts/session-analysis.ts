// Reads the log of a Claude Code session (JSON lines) and counts where the information came from that reached the
// assistant: the creator, the owner in the chat, AGENTS.md and the plan, the skills, the check tool, a sub-agent,
// or the working environment. It writes numbers only (no texts of the session) as JSON.
//
// Usage: node scripts/session-analysis.ts <session.jsonl> <out.json>
import { readFileSync, writeFileSync } from "node:fs";

export type Source =
  | "creator"
  | "owner"
  | "guidance"
  | "skills"
  | "data"
  | "check"
  | "subagent"
  | "environment";

export const SOURCES: readonly Source[] = [
  "creator",
  "owner",
  "guidance",
  "skills",
  "data",
  "check",
  "subagent",
  "environment",
];

export interface Event {
  /** Minutes since the first message. */
  t: number;
  source: Source;
  /** Characters of the text that reached the assistant. */
  chars: number;
  /** Short kind, e.g. "ReadNotifications", "Bash:lernapps check". No session text. */
  kind: string;
  /** For files the creator's session passed on: what kind of file it was. */
  detail?: string;
  /** The file reached the assistant through the creator's session, not from a file of the app. */
  relayed?: boolean;
}

export interface Analysis {
  minutes: number;
  toolCalls: number;
  toolCallsByName: Record<string, number>;
  humanMessages: number;
  creatorAnswers: number;
  relayedFiles: number;
  events: Event[];
  bySource: Record<Source, { events: number; chars: number }>;
  /** Tool calls between two inputs of people (owner or creator answer), longest and average. */
  longestRun: number;
  averageRun: number;
}

/** An object of the log. The keys the code reads are declared, so that they can be read with a dot. */
interface Json {
  [key: string]: unknown;
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
  const rest = body.slice(i).replace(/^[^\n]*\n/, "");
  return rest;
}

function classifyCrossSession(raw: string): { source: Source; detail?: string; relayed?: boolean } {
  const body = innerMessage(raw);
  const b = body.replace(/^\s+/gm, "").trim();
  if (/^(Antworten der Creatorin|Ja[,.]|Danke|Hinweis|Die Skizzen|Die Antwort der Creatorin|Zu Frage)/.test(b)) {
    return { source: "creator" };
  }
  const relayed = true;
  const detail = relayedKind(body);
  const source: Source =
    detail === "entry file llms.txt" ? "guidance" : detail === "learning map" || detail === "schema" || detail === "figure" ? "data" : "skills";
  return { source, detail, relayed };
}

function classifyTool(name: string, input: Json): { source: Source; kind: string } {
  const command = asString(input.command);
  const path = asString(input.file_path) || asString(input.path);
  if (name === "Read" || name === "Bash" || name === "Grep" || name === "Glob") {
    const target = name === "Bash" ? command : path;
    const toolRun = /lernapps(_audio)?[ .a-z_-]*\b(check|create|screenshots)\b|lernapps_audio\.py|@lernapps\/tooling|vp (build|test)|git commit/.test(command);
    const writes = name === "Bash" && !toolRun && !readsOnly(command);
    if (writes) return { source: "environment", kind: "Bash:own work" };
    if (/\.agents\/skills\/|\.claude\/skills\//.test(target)) return { source: "skills", kind: `${name}:skill file` };
    if (/AGENTS\.md|CLAUDE\.md|\.vibe\/plans\//.test(target)) return { source: "guidance", kind: `${name}:AGENTS.md or plan` };
  }
  if (name === "Skill") return { source: "skills", kind: "Skill" };
  if (name === "Bash") {
    if (/lernapps(_audio)?[ .a-z_-]*\b(check|create|screenshots)\b/.test(command)) {
      return { source: "check", kind: "Bash:lernapps " + (/check/.test(command) ? "check" : /create/.test(command) ? "create" : "screenshots") };
    }
    if (/lernapps_audio\.py/.test(command)) return { source: "skills", kind: "Bash:audio script of a skill" };
    if (/lernapps\/tooling|@lernapps\/tooling/.test(command)) return { source: "check", kind: "Bash:lernapps init" };
    if (/vp build|vp test/.test(command)) return { source: "check", kind: "Bash:build" };
    if (/git commit/.test(command)) return { source: "check", kind: "Bash:git commit (hooks)" };
  }
  if (name === "Agent") return { source: "subagent", kind: "Agent" };
  return { source: "environment", kind: name };
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
  const times = rows.map(stamp).filter((n) => !Number.isNaN(n));
  const start = Math.min(...times);
  const end = Math.max(...times);

  const uses = new Map<string, { name: string; input: Json }>();
  const toolCallsByName: Record<string, number> = {};
  const events: Event[] = [];
  let humanMessages = 0;
  let creatorAnswers = 0;
  let relayedFiles = 0;
  let toolCalls = 0;

  for (const o of rows) {
    const message = isObject(o.message) ? o.message : null;
    if (o.type === "assistant" && message && Array.isArray(message.content)) {
      for (const b of message.content) {
        if (isObject(b) && b.type === "tool_use") {
          const name = asString(b.name);
          uses.set(asString(b.id), { name, input: isObject(b.input) ? b.input : {} });
          toolCallsByName[name] = (toolCallsByName[name] ?? 0) + 1;
          toolCalls += 1;
        }
      }
      continue;
    }
    if (o.type !== "user" || !message) continue;
    const t = (stamp(o) - start) / 60000;
    const origin = isObject(o.origin) ? asString(o.origin.kind) : "";
    const content = message.content;
    const parts = Array.isArray(content) ? content : [{ type: "text", text: content }];
    for (const b of parts) {
      if (!isObject(b)) continue;
      if (b.type === "tool_result") {
        const use = uses.get(asString(b.tool_use_id));
        const text = textOf(b.content);
        if (!use) continue;
        if (use.name === "ReadNotifications") {
          const bodies = text.split(/<cross-session-message[^>]*>/).slice(1);
          for (const body of bodies) {
            const c = classifyCrossSession(body.split("</cross-session-message>")[0] ?? "");
            events.push({
              t,
              source: c.source,
              chars: body.length,
              kind: "message of the creator's session",
              ...(c.detail !== undefined ? { detail: c.detail } : {}),
              ...(c.relayed ? { relayed: true } : {}),
            });
            if (c.source === "creator") creatorAnswers += 1;
            else relayedFiles += 1;
          }
          continue;
        }
        const c = classifyTool(use.name, use.input);
        events.push({ t, source: c.source, chars: text.length, kind: c.kind });
      } else if (b.type === "text") {
        const text = asString(b.text);
        if (origin === "human") {
          humanMessages += 1;
          events.push({ t, source: "owner", chars: text.length, kind: "message in the chat" });
        } else if (origin === "peer") {
          events.push({ t, source: "subagent", chars: text.length, kind: "report of a sub-agent" });
        }
      }
    }
  }
  events.sort((a, b) => a.t - b.t);

  const bySource = Object.fromEntries(SOURCES.map((s) => [s, { events: 0, chars: 0 }])) as Analysis["bySource"];
  for (const e of events) {
    bySource[e.source].events += 1;
    bySource[e.source].chars += e.chars;
  }

  // Runs: tool results between two inputs of people.
  const runs: number[] = [];
  let run = 0;
  for (const e of events) {
    if (e.source === "owner" || e.source === "creator") {
      runs.push(run);
      run = 0;
    } else run += 1;
  }
  runs.push(run);

  return {
    minutes: Math.round((end - start) / 600) / 100,
    toolCalls,
    toolCallsByName,
    humanMessages,
    creatorAnswers,
    relayedFiles,
    events,
    bySource,
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
