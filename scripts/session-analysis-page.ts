// Writes the page "A highly autonomous run, measured" from the numbers of scripts/session-analysis.ts.
//
// Usage: node scripts/session-analysis-page.ts <analysis.json> <index.html>
import { readFileSync, writeFileSync } from "node:fs";
import { SOURCES, type Analysis, type Source } from "./session-analysis.ts";

const LABEL: Record<Source, string> = {
  creator: "Creator's session",
  guidance: "AGENTS.md, plan, entry file",
  skills: "Skills and their references",
  data: "Platform data (map, schemas)",
  check: "Check tool and hooks",
  subagent: "Sub-agent",
  retrieval: "Information retrieval",
  writes: "Own writes and runs",
};

const NOTE: Record<Source, string> = {
  creator: "What the creator decided or answered, and the tasks it gave (a review, changes, measurements).",
  guidance: "AGENTS.md, the plan file and the entry file llms.txt.",
  skills: "Skill files read in the app, and skill files and references that the creator's session passed on.",
  data: "The learning map and schemas.",
  check: "Output of lernapps init, create, check, screenshots, the build and the git hooks.",
  subagent: "Reports of the learner checks and of the review.",
  retrieval:
    "Looking things up: the web and GitHub (clone, fetch, read-only API calls, repository lists), and reading or listing the app's own files.",
  writes:
    "Results of what the assistant did: files written or edited, commands that change or run the app, messages sent.",
};

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const kchars = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const pct = (n: number, total: number): string => `${((n / total) * 100).toFixed(0)} %`;

function timeline(a: Analysis): string {
  const W = 760;
  const left = 190;
  const lane = 34;
  const H = 30 + lane * SOURCES.length + 38;
  const x = (t: number) => left + (t / a.minutes) * (W - left - 16);
  const out: string[] = [];
  out.push(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="tl-t tl-d" class="chart">`);
  out.push(`<title id="tl-t">When which information reached the assistant</title>`);
  out.push(
    `<desc id="tl-d">One row per source, one dot per result or message, over ${a.minutes} minutes. A larger dot is a longer text. The table below gives the same numbers.</desc>`,
  );
  SOURCES.forEach((s, i) => {
    const y = 24 + i * lane;
    out.push(`<line x1="${left}" y1="${y + lane / 2}" x2="${W - 16}" y2="${y + lane / 2}" class="grid"/>`);
    out.push(`<text x="${left - 10}" y="${y + lane / 2 + 4}" text-anchor="end" class="lbl">${esc(LABEL[s])}</text>`);
  });
  for (const e of a.events) {
    const i = SOURCES.indexOf(e.source);
    const y = 24 + i * lane + lane / 2;
    const r = Math.max(2.5, Math.min(11, Math.sqrt(e.chars) / 9));
    out.push(
      `<circle cx="${x(e.t).toFixed(1)}" cy="${y}" r="${r.toFixed(1)}" class="dot s-${e.source}"><title>${esc(
        `${LABEL[e.source]}, minute ${e.t.toFixed(0)}, ${e.chars} characters`,
      )}</title></circle>`,
    );
  }
  const base = 24 + SOURCES.length * lane + 6;
  for (let m = 0; m <= a.minutes; m += 10) {
    out.push(`<line x1="${x(m)}" y1="20" x2="${x(m)}" y2="${base - 4}" class="tick"/>`);
    out.push(`<text x="${x(m)}" y="${base + 12}" text-anchor="middle" class="lbl">${m}</text>`);
  }
  out.push(`<text x="${W - 16}" y="${base + 28}" text-anchor="end" class="lbl">minutes of work</text>`);
  out.push(`</svg>`);
  return out.join("\n");
}

function bars(a: Analysis): string {
  const total = SOURCES.reduce((n, s) => n + a.bySource[s].chars, 0);
  const W = 760;
  const left = 190;
  const row = 28;
  const H = SOURCES.length * row + 10;
  const out: string[] = [];
  out.push(`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="bar-t bar-d" class="chart">`);
  out.push(`<title id="bar-t">How much text each source gave</title>`);
  out.push(
    `<desc id="bar-d">One bar per source, as a share of all ${total} characters that reached the assistant.</desc>`,
  );
  SOURCES.forEach((s, i) => {
    const y = 4 + i * row;
    const w = (a.bySource[s].chars / total) * (W - left - 70);
    out.push(`<text x="${left - 10}" y="${y + 17}" text-anchor="end" class="lbl">${esc(LABEL[s])}</text>`);
    out.push(
      `<rect x="${left}" y="${y + 3}" width="${Math.max(1, w).toFixed(1)}" height="18" rx="3" class="bar s-${s}"/>`,
    );
    out.push(
      `<text x="${left + Math.max(1, w) + 8}" y="${y + 17}" class="lbl">${pct(a.bySource[s].chars, total)}</text>`,
    );
  });
  out.push(`</svg>`);
  return out.join("\n");
}

/** Text of one session that the counts cannot give; every part is optional and is HTML. */
export interface PageNotes {
  title?: string;
  lead?: string;
  /** One list item each: what a review or check of the run found. `{{verdict}}` becomes the counts of the first verdict. */
  findings?: string[];
  /** A paragraph after the findings. */
  findingsNote?: string;
  /** List items added to "What this does and does not show". */
  limits?: string[];
  /** A sentence added after the retrieval counts. */
  retrievalNote?: string;
}

export function page(a: Analysis, notes: PageNotes = {}): string {
  const total = SOURCES.reduce((n, s) => n + a.bySource[s].chars, 0);
  const rows = SOURCES.map(
    (s) =>
      `<tr><th scope="row"><span class="sw s-${s}" aria-hidden="true"></span>${esc(LABEL[s])}</th><td>${a.bySource[s].events}</td><td>${kchars(
        a.bySource[s].chars,
      )}</td><td>${pct(a.bySource[s].chars, total)}</td><td>${esc(NOTE[s])}</td></tr>`,
  ).join("\n");
  const sum = (d: string) => {
    const e = a.events.filter((x) => x.source === "retrieval" && x.detail === d);
    return { n: e.length, chars: e.reduce((n, x) => n + x.chars, 0) };
  };
  const web = sum("web");
  const own = sum("own files");
  const retrievalText = `Information retrieval splits into ${web.n} results from the web or GitHub (${kchars(web.chars)} characters) and ${own.n} from reading the app's own files (${kchars(own.chars)}). The web and GitHub results are repository access, listings and read-only calls.${notes.retrievalNote ? " " + notes.retrievalNote : ""}`;

  const agentRows = a.agents
    .map(
      (r) =>
        `<tr><th scope="row">${esc(r.description)}</th><td>${r.minutes.toFixed(1)}</td><td>${r.toolUses}</td><td>${(r.tokens / 1000).toFixed(0)}k</td></tr>`,
    )
    .join("\n");
  const v = a.verdicts[0];
  const verdictText = v
    ? `verdict <b>${esc(v.outcome)}</b> with ${v.errors} errors, ${v.warnings} warnings and ${v.hints} hints (one warning is a proposed new rule).`
    : "no verdict was found in the log.";
  const findings = (notes.findings ?? []).map((f) => f.replace("{{verdict}}", verdictText));
  const css = SOURCES.map((s, i) => `.s-${s}{--c:var(--c${i})}`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="color-scheme" content="light dark">
  <title>${esc(notes.title ?? "A session, measured")} – lernapps.net</title>
  <meta name="description" content="One real session of an assistant that built a French explainer with a simulated creator: how many people's messages it needed, and where its information came from: the creator, AGENTS.md, skills or the check tool.">
  <link rel="canonical" href="https://lernapps.net/tooling/prompt-engineering/autonomy-example/">
  <link rel="stylesheet" href="../../lernapps-page.css">
  <style>
    :root {
      --au-bg: #ffffff; --au-text: var(--la-text, #1e293b); --au-muted: var(--la-muted, #475569);
      --au-link: var(--la-link, #1d4ed8); --au-panel: var(--la-surface, #f8fafc); --au-border: var(--la-border, #e2e8f0);
      --c0: #b45309; --c1: #7c3aed; --c2: #1d4ed8; --c3: #0f766e; --c4: #64748b; --c5: #be185d; --c6: #a16207; --c7: #94a3b8;
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --au-bg: #111827; --au-text: #e5e7eb; --au-muted: #a3adbd; --au-link: #93c5fd; --au-panel: #1b2433; --au-border: #2c3747;
        --c0: #fbbf24; --c1: #c4b5fd; --c2: #93c5fd; --c3: #5eead4; --c4: #cbd5e1; --c5: #f9a8d4; --c6: #fde047; --c7: #64748b;
      }
    }
    :root[data-theme="dark"] {
      --au-bg: #111827; --au-text: #e5e7eb; --au-muted: #a3adbd; --au-link: #93c5fd; --au-panel: #1b2433; --au-border: #2c3747;
      --c0: #fbbf24; --c1: #c4b5fd; --c2: #93c5fd; --c3: #5eead4; --c4: #cbd5e1; --c5: #f9a8d4; --c6: #fde047; --c7: #64748b;
    }
    body { background: var(--au-bg); color: var(--au-text); }
    main { color: var(--au-text); max-width: 48rem; }
    main a { color: var(--au-link); }
    main a:focus-visible { outline: 3px solid var(--au-link); outline-offset: 2px; }
    h2 { margin-top: 2.5rem; line-height: 1.3; }
    .lead { font-size: 1.1rem; }
    .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr)); gap: .75rem; margin: 1.5rem 0; padding: 0; list-style: none; }
    .facts li { background: var(--au-panel); border: 1px solid var(--au-border); border-radius: .5rem; padding: .7rem .8rem; }
    .facts b { display: block; font-size: 1.6rem; line-height: 1.1; font-variant-numeric: tabular-nums; }
    .facts span { color: var(--au-muted); font-size: .9rem; }
    figure { margin: 1.5rem 0; }
    figcaption { color: var(--au-muted); font-size: .9rem; margin-top: .4rem; }
    .chart { width: 100%; height: auto; display: block; }
    .chart .lbl { fill: var(--au-text); font: 12px system-ui, sans-serif; }
    .chart .grid { stroke: var(--au-border); stroke-width: 1; }
    .chart .tick { stroke: var(--au-border); stroke-width: 1; stroke-dasharray: 2 3; }
    .chart .dot { fill: var(--c); fill-opacity: .8; stroke: var(--au-bg); stroke-width: 1; }
    .chart .bar { fill: var(--c); }
    ${css}
    .sw { display: inline-block; width: .8rem; height: .8rem; border-radius: 2px; background: var(--c); margin-right: .5rem; vertical-align: -1px; }
    .scroll, pre { overflow-x: auto; max-width: 100%; }
    table { border-collapse: collapse; width: 100%; font-size: .93rem; min-width: 34rem; }
    th, td { border: 1px solid var(--au-border); padding: .45rem .6rem; text-align: left; vertical-align: top; }
    td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    thead th { background: var(--au-panel); }
  </style>
</head>
<body>
  <main id="main-content" tabindex="-1">
    <h1>${esc(notes.title ?? "A session, measured")}</h1>
    <p class="lead">${notes.lead ?? "One session of an assistant working with the guidance of this repository. This page counts how much the creator's session had to say, where the assistant got its information, and what the sub-agent runs found."}</p>

    <ul class="facts">
      <li><b>${a.minutes.toFixed(0)} min</b><span>of work (waits longer than 15 minutes count as one)</span></li>
      <li><b>${a.toolCalls}</b><span>tool calls by the assistant</span></li>
      <li><b>${a.creatorAnswers}</b><span>answers of the creator, plus ${a.creatorTasks} tasks</span></li>
      <li><b>${a.agents.length}</b><span>sub-agent runs: a learner check, a review, a walkthrough</span></li>
      <li><b>${a.longestRun}</b><span>results in a row without a message of the creator's session (longest run, average ${a.averageRun})</span></li>
    </ul>

    <h2>When information arrived</h2>
    <figure>
${timeline(a)}
      <figcaption>Each dot is one tool result or message. The row says where it came from; a larger dot is a longer text. The creator's session (first row) speaks rarely; most of the time the assistant reads guidance, runs checks and works on the app.</figcaption>
    </figure>

    <h2>How much each source gave</h2>
    <figure>
${bars(a)}
      <figcaption>Share of the ${kchars(total)} characters that reached the assistant as tool results or messages. Text the assistant wrote itself is not counted.</figcaption>
    </figure>

    <div class="scroll">
      <table>
        <thead><tr><th scope="col">Source</th><th scope="col">Events</th><th scope="col">Characters</th><th scope="col">Share</th><th scope="col">What counts</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>
    </div>

    <p>${retrievalText}</p>

    <h2>Reviews and checks in this run</h2>
    <p>${a.agents.length} sub-agent runs, each in a fresh context. The numbers come from the log${findings.length > 0 ? "; what they found is from their reports" : ""}.</p>
    <div class="scroll">
      <table>
        <thead><tr><th scope="col">Run</th><th scope="col">Minutes</th><th scope="col">Tool calls</th><th scope="col">Tokens</th></tr></thead>
        <tbody>
${agentRows}
        </tbody>
      </table>
    </div>
${findings.length > 0 ? `    <ul>\n${findings.map((f) => `      <li>${f}</li>`).join("\n")}\n    </ul>` : ""}
${notes.findingsNote ? `    <p>${notes.findingsNote}</p>` : ""}

    <h2>What this does and does not show</h2>
    <ul>
      <li>The counts come from the session log, with <a href="https://github.com/lernapps/tooling/blob/main/scripts/session-analysis.ts"><code>scripts/session-analysis.ts</code></a>. They contain no text of the session.</li>
      ${a.relayedFiles > 0 ? `<li>The creator's session passed on ${a.relayedFiles} files (entry file, skills, references, rules, template README, schema). They are counted as skills, guidance or data, not as the creator's decisions. The creator's own messages are counted as answers (to the assistant's questions) or tasks (a review, changes to the app, measurements).</li>` : ""}
      <li>"Characters" measure how much text arrived, not how much it helped. A long skill file counts more than a short answer that decided the content.</li>
      <li>Results of tools named with <code>--leave-out</code> (by default the Artifact tool, whose built-in guidance decides nothing) are not counted. The text of the tool that attaches a repository is counted as GitHub retrieval.</li>
      <li>Time is active time: a wait of more than 15 minutes between two entries of the log counts as one minute.</li>
${(notes.limits ?? []).map((l) => `      <li>${l}</li>`).join("\n")}
      <li>One run is an example, not a result. The evals described under <a href="../how-evals-work/">How we evaluate the guidance</a> repeat runs and score them.</li>
    </ul>

    <h2>Repeat it</h2>
    <pre><code>node scripts/session-analysis-run.ts --page index.html [--notes notes.json]</code></pre>
  </main>
</body>
</html>
`;
}

if (process.argv[1]?.endsWith("session-analysis-page.ts")) {
  const [, , input, output, notesFile] = process.argv;
  if (!input || !output) {
    console.error("Usage: node scripts/session-analysis-page.ts <analysis.json> <index.html> [notes.json]");
    process.exit(2);
  }
  const a = JSON.parse(readFileSync(input, "utf8")) as Analysis;
  const notes = notesFile ? (JSON.parse(readFileSync(notesFile, "utf8")) as PageNotes) : {};
  writeFileSync(output, page(a, notes));
  console.log(`wrote ${output}`);
}
