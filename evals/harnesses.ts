// The harnesses an eval can run (HARNESS in evals/harbor/run.sh), and for each a small adapter: how its tool calls map
// onto the names the transcript score reads (Bash, Read, Write, Edit, WebFetch, Skill; Claude Code's names).
// The score reads every harness from the ACP session export Harbor writes for the agent under test
// (<trial>/agent/bridge-trajectory.json); only the tool names and their input fields differ between harnesses.

/** A tool call as the score reads it. */
export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface Harness {
  /** Maps a tool call of the harness, as its ACP updates name it, onto the score's names. */
  tool: (name: string, input: Record<string, unknown>) => ToolCall;
}

/** Claude Code over ACP names its own tools, and those it runs through the client with the prefix `mcp__acp__`. */
const claudeCode: Harness = {
  tool: (name, input) => ({ name: name.replace(/^mcp__acp__/, ""), input }),
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

/** OpenCode names its tools in lower case and its file fields in camel case; its skill tool takes `name`. */
const openCode: Harness = {
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
