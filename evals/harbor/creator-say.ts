// The simulated creator's one way to talk to the agent under test: it decides in structured output, this sends only
// the reply. Runs in the task's container as /opt/creator/say.ts (evals/harbor/setup.sh copies it into each task's
// environment), on the Node of the image; it imports nothing but Node, so that it runs there as it is.
//   node /opt/creator/say.ts <<'EOF'
//   {"asked": ["plan_confirm"], "answers": ["plan_confirm"], "reply": "Ja, passt so.", "end": null}
//   EOF
// It appends the record, with the message as sent, to /logs/user-agent/creator-turns.jsonl (the trial's
// user-agent/ folder, which evals/score-transcript.ts reads), then sends the message with `acpx prompt --file` and
// prints the agent's answer. A record it cannot read is not sent: it says why and exits 2, and the creator tries again.
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/** What the agent's last message asked of the creator, and what the creator's reply answers. */
export const KINDS = [
  "plan_confirm",
  "confirm",
  "archetype",
  "content",
  "github",
  "publish",
  "permission",
  "technical",
  "go_on",
  "other",
] as const;
export type Kind = (typeof KINDS)[number];
/** The scenario's end, as the persona names it; `[Ende: <end>]` goes on the message's last line. */
export const ENDS = ["veröffentlichen", "fertig", "festgefahren"] as const;
export type End = (typeof ENDS)[number];

/** One message of the creator: its decision, the reply as it wrote it, and the message as sent. */
export interface CreatorTurn {
  asked: Kind[];
  answers: Kind[];
  reply: string;
  end: End | null;
  /** The text the agent received: the reply, and the end marker on its own last line. */
  message: string;
}

export const RECORDS = "/logs/user-agent/creator-turns.jsonl";

/** The record of a decision, or the problems that keep it from being sent. */
export function parseTurn(input: string): CreatorTurn | { problems: string[] } {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch (error) {
    return { problems: [`not JSON: ${(error as Error).message}`] };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { problems: ["not a JSON object"] };
  const record = value as Record<string, unknown>;
  const problems: string[] = [];
  const kinds = (key: string): Kind[] => {
    const list = record[key];
    if (!Array.isArray(list) || list.some((kind) => !(KINDS as readonly unknown[]).includes(kind))) {
      problems.push(`"${key}" must be a list of ${KINDS.join(", ")} (empty when there is none)`);
      return [];
    }
    return [...new Set(list as Kind[])];
  };
  const asked = kinds("asked");
  const answers = kinds("answers");
  const reply = typeof record["reply"] === "string" ? record["reply"].trim() : "";
  if (reply === "") problems.push(`"reply" must be the text of your message`);
  const end = ENDS.find((name) => name === record["end"]) ?? null;
  if (end === null && (record["end"] ?? null) !== null)
    problems.push(`"end" must be null or one of ${ENDS.join(", ")}`);
  const unknown = Object.keys(record).filter((key) => !["asked", "answers", "reply", "end"].includes(key));
  if (unknown.length) problems.push(`unknown keys: ${unknown.join(", ")}`);
  if (/\[Ende:/i.test(reply)) problems.push(`no end marker in "reply": set "end", the marker is added`);
  if (problems.length) return { problems };
  const message = end === null ? reply : `${reply}\n[Ende: ${end}]`;
  return { asked, answers, reply, end, message };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const turn = parseTurn(readFileSync(0, "utf8"));
  if ("problems" in turn) {
    process.stderr.write(`Not sent. ${turn.problems.join("; ")}.\n`);
    process.exit(2);
  }
  mkdirSync(dirname(RECORDS), { recursive: true });
  appendFileSync(RECORDS, `${JSON.stringify({ at: new Date().toISOString(), ...turn })}\n`);
  const file = join(mkdtempSync(join(tmpdir(), "creator-")), "message.txt");
  writeFileSync(file, turn.message);
  const sent = spawnSync("acpx", ["prompt", "--file", file], { stdio: "inherit" });
  process.exit(sent.status ?? 1);
}
