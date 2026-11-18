// One command for the whole analysis of a Claude Code session: find the log, count where the information came from,
// write the numbers (JSON), a summary (Markdown) and, if asked, the page for lernapps.net.
//
// Usage: node scripts/session-analysis-run.ts [options]
//   --session <file|id>   a session log (.jsonl) or a session id; default: the newest log of the current directory's project
//   --projects-dir <dir>  where Claude Code keeps its logs; default ~/.claude/projects
//   --cwd <dir>           the project whose newest log is taken; default the current directory
//   --out <dir>           where analysis.json and summary.md go; default ./session-analysis
//   --page <index.html>   also write the page (see session-analysis-page.ts)
//   --notes <notes.json>  texts of the session for the page (title, lead, findings, limits)
//   --leave-out <a,b>     tools whose results are not counted; default Artifact; "none" counts every tool
//   --max-gap <minutes>   a wait longer than this counts as one minute; default 15
//   --task-pattern <re>   a message of the creator's session that starts like this is a task, else an answer (case-insensitive)
//   --events              also print one line per event: minute, source, kind, detail, characters (no session text)
//   --list                list the logs of the project and stop
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { analyse, SOURCES, type Analysis, type Source } from "./session-analysis.ts";
import { page, type PageNotes } from "./session-analysis-page.ts";

const FLAGS_WITH_VALUE = ["--session", "--projects-dir", "--cwd", "--out", "--page", "--notes", "--leave-out", "--max-gap", "--task-pattern"];

function parseArgs(argv: readonly string[]): { values: Map<string, string>; list: boolean; help: boolean; events: boolean } {
  const values = new Map<string, string>();
  let list = false;
  let help = false;
  let events = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? "";
    if (arg === "--list") list = true;
    else if (arg === "--events") events = true;
    else if (arg === "--help" || arg === "-h") help = true;
    else if (FLAGS_WITH_VALUE.includes(arg)) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) throw new Error(`${arg} needs a value`);
      values.set(arg, value);
      i += 1;
    } else throw new Error(`unknown option ${arg}`);
  }
  return { values, list, help, events };
}

/** Claude Code names the folder of a project after its path: every character other than a letter or digit becomes "-". */
const projectFolder = (cwd: string): string => resolve(cwd).replace(/[^A-Za-z0-9]/g, "-");

interface Log {
  file: string;
  modified: number;
  bytes: number;
}

function logsIn(dir: string): Log[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => {
      const file = join(dir, f);
      const s = statSync(file);
      return { file, modified: s.mtimeMs, bytes: s.size };
    })
    .sort((a, b) => b.modified - a.modified);
}

function findLog(session: string | undefined, projectsDir: string, cwd: string): Log {
  if (session !== undefined && existsSync(session) && statSync(session).isFile()) {
    const s = statSync(session);
    return { file: resolve(session), modified: s.mtimeMs, bytes: s.size };
  }
  if (session !== undefined) {
    for (const d of existsSync(projectsDir) ? readdirSync(projectsDir) : []) {
      const file = join(projectsDir, d, `${session}.jsonl`);
      if (existsSync(file)) return { file, modified: statSync(file).mtimeMs, bytes: statSync(file).size };
    }
    throw new Error(`no log for session ${session} under ${projectsDir}`);
  }
  const mine = logsIn(join(projectsDir, projectFolder(cwd)));
  const first = mine[0];
  if (first) return first;
  throw new Error(`no .jsonl log in ${join(projectsDir, projectFolder(cwd))}; give --session or --cwd`);
}

const kchars = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function summary(a: Analysis, file: string): string {
  const total = SOURCES.reduce((n, s) => n + a.bySource[s].chars, 0);
  const pct = (s: Source) => `${((a.bySource[s].chars / Math.max(total, 1)) * 100).toFixed(0)} %`;
  const lines: string[] = [];
  lines.push(`# Session analysis`, ``, `Log: \`${file}\` (numbers only; no text of the session is kept).`, ``);
  lines.push(
    `- Active time: ${a.minutes.toFixed(0)} minutes (waits longer than the set gap count as one minute)`,
    `- Tool calls of the assistant: ${a.toolCalls}`,
    `- Creator's session: ${a.creatorAnswers} answers, ${a.creatorTasks} tasks; ${a.relayedFiles} files passed on`,
    `- Sub-agent runs: ${a.agents.length}`,
    `- Longest run without a message of the creator's session: ${a.longestRun} results (average ${a.averageRun})`,
    ``,
  );
  lines.push(`| Source | Events | Characters | Share |`, `|---|---|---|---|`);
  for (const s of SOURCES) lines.push(`| ${s} | ${a.bySource[s].events} | ${kchars(a.bySource[s].chars)} | ${pct(s)} |`);
  const web = a.events.filter((e) => e.source === "retrieval" && e.detail === "web");
  const own = a.events.filter((e) => e.source === "retrieval" && e.detail === "own files");
  lines.push(
    ``,
    `Retrieval: ${web.length} results from the web or GitHub, ${own.length} from reading own files.`,
    ``,
  );
  if (a.agents.length > 0) {
    lines.push(`| Sub-agent run | Minutes | Tool calls | Tokens |`, `|---|---|---|---|`);
    for (const r of a.agents) lines.push(`| ${r.description} | ${r.minutes.toFixed(1)} | ${r.toolUses} | ${kchars(r.tokens)} |`);
    lines.push(``);
  }
  for (const v of a.verdicts) {
    lines.push(`Review verdict: ${v.outcome}, ${v.errors} errors, ${v.warnings} warnings, ${v.hints} hints, ${v.proposals} proposals.`);
  }
  return lines.join("\n") + "\n";
}

function main(): void {
  const { values, list, help, events } = parseArgs(process.argv.slice(2));
  if (help) {
    console.log(readFileSync(new URL(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).map((l) => l.slice(3)).join("\n"));
    return;
  }
  const projectsDir = values.get("--projects-dir") ?? join(homedir(), ".claude", "projects");
  const cwd = values.get("--cwd") ?? process.cwd();
  if (list) {
    for (const l of logsIn(join(projectsDir, projectFolder(cwd)))) {
      console.log(`${new Date(l.modified).toISOString()}  ${(l.bytes / 1024).toFixed(0).padStart(6)} kB  ${l.file}`);
    }
    return;
  }
  const log = findLog(values.get("--session"), projectsDir, cwd);
  const leaveOutArg = values.get("--leave-out");
  const leaveOut = leaveOutArg === undefined ? ["Artifact"] : leaveOutArg === "none" ? [] : leaveOutArg.split(",");
  const maxGapMinutes = Number(values.get("--max-gap") ?? 15);
  const taskArg = values.get("--task-pattern");
  const result = analyse(readFileSync(log.file, "utf8"), {
    leaveOut,
    maxGapMinutes,
    ...(taskArg === undefined ? {} : { taskPattern: new RegExp(taskArg, "i") }),
  });

  const out = resolve(values.get("--out") ?? "session-analysis");
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "analysis.json"), JSON.stringify(result, null, 2) + "\n");
  writeFileSync(join(out, "summary.md"), summary(result, log.file));
  console.log(`log: ${log.file} (changed ${new Date(log.modified).toISOString()}, ${(log.bytes / 1024).toFixed(0)} kB)`);
  console.log(`wrote ${join(out, "analysis.json")} and ${join(out, "summary.md")}`);

  const pageFile = values.get("--page");
  if (pageFile !== undefined) {
    const notesFile = values.get("--notes");
    const notes = notesFile ? (JSON.parse(readFileSync(notesFile, "utf8")) as PageNotes) : {};
    mkdirSync(dirname(resolve(pageFile)), { recursive: true });
    writeFileSync(pageFile, page(result, notes));
    console.log(`wrote ${pageFile}`);
  }
  console.log(summary(result, log.file));
  if (events) {
    for (const e of result.events) {
      console.log(`${e.t.toFixed(1).padStart(6)}  ${e.source.padEnd(10)} ${e.kind.padEnd(34)} ${(e.detail ?? "").padEnd(16)} ${e.chars}`);
    }
  }
}

try {
  main();
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(2);
}
