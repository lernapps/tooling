---
name: session-analysis
description: Measure a Claude Code session from its log and publish the result as an example. Use when asked how autonomous a session was, where its information came from (creator, AGENTS.md, skills, check tool, web, own writes), what its reviews and sub-agents found, or when the example page autonomy-example must be made again.
metadata:
  internal: true
---

# Analyse a Claude Code session

The session log records every tool call and result as one JSON line. A script counts them by where the information
came from and writes numbers only. You then check the counts and, if asked, publish them as a page of lernapps.net.

## What it measures

- **Sources** of the text that reached the assistant: the creator's session (answers and tasks), AGENTS.md and plan,
  skills, platform data (learning map, schemas), the check tool and hooks, sub-agents, information retrieval (web and
  GitHub; reading the app's own files), and own writes and runs.
- **Autonomy:** active time, tool calls, answers and tasks of the creator, the longest run of results without a message
  of the creator's session, sub-agent runs with their cost, severities of review verdicts.
- Not measured: how good the app is, and what the assistant wrote itself.

## Rules

- **Numbers only.** The output holds counts, sizes and kinds, never text of the session. Do not paste log lines into a
  pull request, a page or a message.
- **Count the creator's session, not administrative help.** Chat messages of a person who only supported the test
  (approvals, starting tools) are not counted and not mentioned, if the person asks for that. Ask who counts as the
  creator before you publish; the script counts messages of another session (`ReadNotifications`) as the creator's.
- **Say what is left out.** The script leaves out results of the Artifact tool (its built-in guidance decides
  nothing). Name every other `--leave-out` on the page.
- **Do not publish to `main`.** A page goes into a feature branch and a pull request. The owner merges.

## Steps

1. **Find the log.** `node scripts/session-analysis-run.ts --list` lists the logs of the current directory's project
   (default `~/.claude/projects/<path with every non-alphanumeric character as "-">/<session id>.jsonl`), newest first.
   The newest one is the running session, unless several run. Pass `--session <file|id>` for another.
2. **Run it.** From any directory:

   ```
   node scripts/session-analysis-run.ts --out analysis --events [--page site/prompt-engineering/<name>/index.html --notes <notes.json>]
   ```

   It writes `analysis/analysis.json` and `analysis/summary.md` and prints the summary. `--events` adds one line per
   event (minute, source, kind, detail, characters). Options: `node scripts/session-analysis-run.ts --help`.
3. **Check the counts** before you trust them. The script classifies by patterns, and a pattern can be wrong:
   - `summary.md`: does the number of sub-agent runs equal the number of `Agent` calls of the session? Is the verdict
     (outcome, errors, warnings, hints) the one the review wrote?
   - `--events`: are the large events in the right row? A big `retrieval` or `writes` result is often one file shown
     for another purpose (for example a file printed to send it on). A big `skills` result must be a skill file.
   - Messages of the creator's session: files passed on are told from its own words by their first line (`#`, `---`,
     `{`, `<svg`). A task is told from an answer by `--task-pattern` (default: words such as "Auftrag", "Task").
     The messages are in the session you are working in: read them there and set the pattern to match the creator's phrasing.
   - Time: a wait longer than 15 minutes counts as one minute (`--max-gap`). A session that waited overnight is
     otherwise a day long.
   - Fix a wrong pattern in `scripts/session-analysis.ts` (`classifyTool`, `classifyCrossSession`, `relayedKind`), not in
     the output.
4. **Write the notes for the page** (optional): `notes.json` with `title`, `lead`, `findings` (one HTML item per review
   or check; `{{verdict}}` becomes the counts of the first verdict), `findingsNote`, `limits`, `retrievalNote`. The
   findings come from the reports of the sub-agents, which you read, not from the log. Mark what they did not cover.
   The notes of the example are `site/prompt-engineering/autonomy-example/notes.json`.
5. **Look at the page** in a browser at 1100 px and 380 px: no clipped labels, no horizontal scroll, both themes.
6. **Publish.** Put the page under `site/prompt-engineering/<name>/`, link it from
   `site/prompt-engineering/index.html`, commit on a feature branch, push, open a pull request as a draft. In its text:
   the numbers (time, tool calls, answers and tasks, longest run, shares per source), what each check found, and what
   is not measured or not checked. Write it in the language of the person who asked. Run `vp check` before merging; the
   scripts were written for the strict `tsconfig.json` of this repository but were not type-checked where they were
   made.

## Pitfalls met so far

- A review verdict counted twice: the severity of a proposed rule sits inside the finding. Count the severity at the
  finding's own indent only.
- The example verdict in `review/prompt.md` looked like a verdict. Count only results of commands that read a
  `verdict.yaml`.
- Sub-agent cost is not in the results. It is in the notification that arrives when the run ends (`queue-operation`
  entries with `<subagent_tokens>`, `<tool_uses>`, `<duration_ms>`).
- A session that waited overnight reported 588 minutes. Use active time.
- The log keeps growing while the session runs. Numbers are the state of the log at the time of the run; say so.
- Results of the tool that attaches a repository are mostly instructions, not retrieved information. The script counts
  them as GitHub retrieval; say so, or pass `--leave-out mcp__claude-code-remote__add_repo`.
