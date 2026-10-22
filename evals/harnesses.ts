// The harnesses an eval can run (HARNESS in evals/harbor/run.sh), and for each a small adapter: how its tool calls map
// onto the names the transcript score reads (Bash, Read, Write, Edit, WebFetch, Skill; Claude Code's names), and where
// its token numbers come from.
// The score reads every harness from the ACP session export Harbor writes for the agent under test
// (<trial>/agent/bridge-trajectory.json); only the tool names and their input fields differ between harnesses.

import { existsSync } from "node:fs";
import { join } from "node:path";

/** A tool call as the score reads it. */
export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface Harness {
  /** Maps a tool call of the harness, as its ACP updates name it, onto the score's names. */
  tool: (name: string, input: Record<string, unknown>) => ToolCall;
  /** Whether the usage the harness returns with each ACP prompt is the whole turn's (else only its last model call). */
  acpUsage: boolean;
  /** The tokens of the agent from the harness's own record in the trial; undefined where it has none. */
  usage?: (trial: string) => Record<string, number> | undefined;
}

/** Claude Code over ACP names its own tools, and those it runs through the client with the prefix `mcp__acp__`. */
const claudeCode: Harness = {
  tool: (name, input) => ({ name: name.replace(/^mcp__acp__/, ""), input }),
  acpUsage: true,
};

const OPENCODE_TOOLS: Record<string, string> = {
  bash: "Bash",
  read: "Read",
  write: "Write",
  edit: "Edit",
  webfetch: "WebFetch",
  websearch: "WebSearch",
  skill: "Skill",
  glob: "Glob",
  grep: "Grep",
  list: "LS",
  task: "Task",
  todowrite: "TodoWrite",
};
const OPENCODE_INPUT: Record<string, string> = {
  filePath: "file_path",
  oldString: "old_string",
  newString: "new_string",
};

/** One message of OpenCode's session database, as far as its tokens go. */
interface OpenCodeMessage {
  role?: string;
  tokens?: { input?: number; output?: number; reasoning?: number; cache?: { read?: number; write?: number } };
}

/**
 * The tokens of an OpenCode trial, summed over the model's messages in OpenCode's own database
 * (<trial>/agent/opencode/xdg-data/opencode/opencode.db, which Harbor keeps). Over ACP, OpenCode returns with each
 * prompt only the usage of its last model call. The reasoning counts as output, as in Claude Code's log.
 */
export function openCodeUsage(trial: string): Record<string, number> | undefined {
  const file = join(trial, "agent", "opencode", "xdg-data", "opencode", "opencode.db");
  if (!existsSync(file)) return undefined;
  // Loaded only for OpenCode trials: node:sqlite still warns that it is experimental in Node 22.
  const { DatabaseSync } = process.getBuiltinModule("node:sqlite");
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const sum = { agent_input_tokens: 0, agent_cache_read_tokens: 0, agent_output_tokens: 0 };
    for (const row of db.prepare("SELECT data FROM message").all()) {
      const message = JSON.parse(String(row["data"])) as OpenCodeMessage;
      if (message.role !== "assistant") continue;
      const tokens = message.tokens ?? {};
      sum.agent_input_tokens += (tokens.input ?? 0) + (tokens.cache?.write ?? 0);
      sum.agent_cache_read_tokens += tokens.cache?.read ?? 0;
      sum.agent_output_tokens += (tokens.output ?? 0) + (tokens.reasoning ?? 0);
    }
    return sum;
  } finally {
    db.close();
  }
}

/** OpenCode names its tools in lower case and its file fields in camel case; its skill tool takes `name`. */
const openCode: Harness = {
  acpUsage: false,
  usage: openCodeUsage,
  tool: (name, input) => {
    const renamed = Object.fromEntries(
      Object.entries(input).map(([key, value]) => [OPENCODE_INPUT[key] ?? key, value]),
    );
    if (name === "skill" && renamed["skill"] === undefined && renamed["name"] !== undefined)
      renamed["skill"] = renamed["name"];
    return { name: OPENCODE_TOOLS[name] ?? name, input: renamed };
  },
};

export const HARNESSES: Record<string, Harness> = { "claude-code": claudeCode, opencode: openCode };
