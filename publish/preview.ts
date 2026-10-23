#!/usr/bin/env node
// The logic of the app preview action (actions/app-preview): a preview of a pull request's checked bundle, at
// <the app's address>pr-preview/pr-<number>/ on the branch gh-pages, for the creator to look at before it goes online.
// The action deploys and removes the folder (rossjrw/pr-preview-action); this file does the rest, in two commands:
//   before  [--dir <bundle>] finds the app's address and the preview's (outputs app, url, base). With --dir it marks
//           every page of the bundle noindex (a preview is not for search engines) and writes the marker file
//           lernapps-preview.txt (the commit) into it.
//   after   on a pull request that is open, makes sure gh-pages has .nojekyll at its root (without it Pages runs
//           Jekyll, which does not serve files starting with _, and a preview before the first deploy breaks), waits
//           until the preview's address serves the marker of this commit; then it writes the one comment of the
//           preview on the pull request, in German for the creator, or updates it in place. On a closed pull request it updates that comment to say the preview is gone.
// Only Node's own modules: the action runs it without installing anything. The bundle's URLs are relative (the preset
// builds with base "./", the runtime's pages link relatively), so the checked bundle works below pr-preview/ as is.
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const PREFIX = "lernapps app-preview";
const MARKER = "lernapps-preview.txt";
/** Marks the comment of the preview, so every run updates the same one. */
export const COMMENT_MARKER = "<!-- lernapps-app-preview -->";
export const NOINDEX = '<meta name="robots" content="noindex" />';

const USAGE = `Usage: node publish/preview.ts before [--dir <bundle>]
       node publish/preview.ts after

Environment: GITHUB_REPOSITORY (owner/name), GITHUB_TOKEN, GITHUB_SHA, GITHUB_EVENT_PATH (a pull_request event);
GITHUB_API_URL (default https://api.github.com); LERNAPPS_PREVIEW_TIMEOUT in seconds (default 600): how long \`after\`
waits for the preview's address. Exit code 0 when done, 1 when not, 2 on a usage error.
`;

/** The page with the robots meta tag noindex in its <head>, unless it has a robots meta tag already. */
export function noindex(html: string): string {
  if (/<meta\s[^>]*name=["']?robots["']?/i.test(html)) return html;
  return html.replace(/<\/head>/i, `  ${NOINDEX}\n  </head>`);
}

/** Every .html file below `dir`, marked noindex; the number of files. */
export function noindexAll(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const file = join(entry.parentPath, entry.name);
    writeFileSync(file, noindex(readFileSync(file, "utf8")));
    count++;
  }
  return count;
}

/**
 * The app's address from the repo alone, as app-publish describes it: https://lernapps.net/<repo>/ for a repo of the
 * lernapps organisation, else https://<owner>.github.io/<repo>/ (the root for the repo <owner>.github.io).
 */
export function derivedAddress(repository: string): string {
  const [owner = "", name = ""] = repository.split("/");
  if (owner.toLowerCase() === "lernapps") return `https://lernapps.net/${name}/`;
  const host = `${owner.toLowerCase()}.github.io`;
  return name.toLowerCase() === host ? `https://${host}/` : `https://${host}/${name}/`;
}

/** The preview's address below the app's. */
export const previewAddress = (app: string, number: number): string =>
  `${app.endsWith("/") ? app : `${app}/`}pr-preview/pr-${number}/`;

/** What the comment says: the preview is there (or may still be on its way), or it is gone. */
export type CommentState =
  | { state: "open"; preview: string; app: string; ready: boolean }
  | { state: "closed"; app: string; merged: boolean };

/** The comment of the preview, in German, for a creator who is not a developer. */
export function commentBody(c: CommentState): string {
  const lines = [COMMENT_MARKER, "### Vorschau der App", ""];
  if (c.state === "open") {
    lines.push(
      "Hier siehst du die App mit den Änderungen dieses Pull Requests. Die Vorschau ist nur vorübergehend da, " +
        "damit du dir alles ansehen kannst, bevor es online geht:",
      "",
      `**<${c.preview}>**`,
      "",
    );
    if (!c.ready) lines.push("Falls die Seite noch nicht lädt, versuch es in ein paar Minuten noch einmal.", "");
    lines.push(
      "Schau dir die neuen und geänderten Seiten an und probier die Aufgaben aus, am besten auch auf dem Handy.",
      "",
      "Lernende sehen die Vorschau nicht, und sie steht nicht im Katalog. Sie verschwindet, sobald der Pull Request " +
        `geschlossen oder zusammengeführt wird. Erst mit dem Zusammenführen gehen die Änderungen online, unter der Adresse der App: <${c.app}>`,
    );
  } else if (c.merged) {
    lines.push(
      "Der Pull Request ist zusammengeführt, die Vorschau ist entfernt. Die Änderungen gehen jetzt online, " +
        `unter der Adresse der App: <${c.app}>`,
    );
  } else {
    lines.push(
      "Der Pull Request ist geschlossen, ohne zusammengeführt zu werden. Die Vorschau ist entfernt; an der App " +
        `unter <${c.app}> hat sich nichts geändert.`,
    );
  }
  return `${lines.join("\n")}\n`;
}

/** The command was called wrongly. */
class UsageFailure extends Error {}

interface Env {
  api: string;
  repo: string;
  token: string;
  sha: string;
  number: number;
  closed: boolean;
  merged: boolean;
}

function env(): Env {
  const need = (name: string): string => {
    const value = process.env[name];
    if (value === undefined || value === "") throw new UsageFailure(`${name} is not set`);
    return value;
  };
  const event = JSON.parse(readFileSync(need("GITHUB_EVENT_PATH"), "utf8")) as {
    action?: string;
    pull_request?: { number?: number; merged?: boolean };
  };
  const number = event.pull_request?.number;
  if (typeof number !== "number") throw new UsageFailure("the event is not a pull request");
  return {
    api: (process.env["GITHUB_API_URL"] || "https://api.github.com").replace(/\/+$/, ""),
    repo: need("GITHUB_REPOSITORY"),
    token: need("GITHUB_TOKEN"),
    sha: need("GITHUB_SHA"),
    number,
    closed: event.action === "closed",
    merged: event.pull_request?.merged === true,
  };
}

async function request(
  e: { api: string; token: string },
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${e.api}${path}`, {
    method,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${e.token}`,
      "x-github-api-version": "2022-11-28",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let parsed: unknown = undefined;
  try {
    parsed = text === "" ? undefined : JSON.parse(text);
  } catch {
    parsed = undefined;
  }
  return { status: response.status, body: parsed };
}

/** The app's address: the Pages settings' html_url where the token may read them, else derived from the repo. */
async function appAddress(e: Env): Promise<string> {
  try {
    const pages = await request(e, "GET", `/repos/${e.repo}/pages`);
    const url = (pages.body as { html_url?: unknown } | undefined)?.html_url;
    if (pages.status === 200 && typeof url === "string") return url.endsWith("/") ? url : `${url}/`;
  } catch {
    // the derived address below
  }
  return derivedAddress(e.repo);
}

function output(name: string, value: string): void {
  const file = process.env["GITHUB_OUTPUT"];
  if (file) appendFileSync(file, `${name}=${value}\n`);
}

async function before(e: Env, dir: string | undefined): Promise<void> {
  const app = await appAddress(e);
  const preview = previewAddress(app, e.number);
  output("app", app);
  output("url", preview);
  output("base", app.replace(/^https?:\/\//, "").replace(/\/$/, "")); // for pr-preview-action: host and path
  if (dir === undefined) return;
  if (!existsSync(join(dir, "index.html"))) {
    throw new Error(`${dir} has no index.html: the artifact "app" of the app check action is missing or empty`);
  }
  const pages = noindexAll(dir);
  writeFileSync(join(dir, MARKER), `${e.sha}\n`);
  console.log(`${PREFIX}: ${pages} pages marked noindex; the preview goes to ${preview}`);
}

/**
 * Makes sure the branch gh-pages has .nojekyll at its root: app-publish writes it with every deploy, but a preview
 * can come first (the first pull request of a new repo). Without it Pages runs Jekyll for the whole branch, which
 * does not serve files starting with _ (Vite's _plugin-vue_export-helper-*.js). Returns whether the file is there.
 */
export async function ensureNoJekyll(e: { api: string; repo: string; token: string }): Promise<boolean> {
  const path = `/repos/${e.repo}/contents/.nojekyll`;
  const found = await request(e, "GET", `${path}?ref=gh-pages`);
  if (found.status === 200) return true;
  if (found.status !== 404) return false;
  const written = await request(e, "PUT", path, {
    message: "chore: .nojekyll, so Pages serves files that start with _",
    content: "",
    branch: "gh-pages",
  });
  return written.status === 200 || written.status === 201;
}

/** Whether the preview's address serves the marker of this commit within the timeout. */
async function served(preview: string, sha: string): Promise<boolean> {
  const value = Number(process.env["LERNAPPS_PREVIEW_TIMEOUT"]);
  const timeout = (Number.isFinite(value) && value >= 0 ? value : 600) * 1000;
  const start = Date.now();
  for (;;) {
    try {
      const response = await fetch(`${preview}${MARKER}?commit=${sha}`, { headers: { "cache-control": "no-cache" } });
      if (response.ok && (await response.text()).trim() === sha) return true;
    } catch {
      // not yet
    }
    if (Date.now() - start >= timeout) return false;
    await new Promise((done) => setTimeout(done, 15_000));
  }
}

async function after(e: Env): Promise<void> {
  const app = await appAddress(e);
  const path = `/repos/${e.repo}/issues/${e.number}/comments`;
  let existing: number | undefined;
  for (let page = 1; existing === undefined; page++) {
    const listed = await request(e, "GET", `${path}?per_page=100&page=${page}`);
    if (listed.status !== 200) throw new Error(`cannot read the comments of the pull request (${listed.status})`);
    const comments = listed.body as { id: number; body?: string; user?: { type?: string } }[];
    existing = comments.find((c) => c.user?.type === "Bot" && c.body?.includes(COMMENT_MARKER))?.id;
    if (comments.length < 100) break;
  }
  let body: string;
  if (e.closed) {
    if (existing === undefined) return; // there was no preview
    body = commentBody({ state: "closed", app, merged: e.merged });
  } else {
    const preview = previewAddress(app, e.number);
    if (!(await ensureNoJekyll(e))) {
      console.log(
        `::warning::${PREFIX}: cannot add .nojekyll to gh-pages; Pages may not serve files that start with _`,
      );
    }
    const ready = await served(preview, e.sha);
    if (!ready) console.log(`::warning::${PREFIX}: ${preview} does not serve this commit yet; the comment says so`);
    body = commentBody({ state: "open", preview, app, ready });
  }
  const written =
    existing === undefined
      ? await request(e, "POST", path, { body })
      : await request(e, "PATCH", `/repos/${e.repo}/issues/comments/${existing}`, { body });
  if (written.status !== 200 && written.status !== 201) {
    throw new Error(`cannot write the comment of the preview (${written.status})`);
  }
  console.log(`${PREFIX}: the comment on pull request #${e.number} says the preview is ${e.closed ? "gone" : "there"}`);
}

async function main(args: string[]): Promise<number> {
  try {
    const { values, positionals } = parseArgs({
      args,
      options: { dir: { type: "string" }, help: { type: "boolean", short: "h", default: false } },
      allowPositionals: true,
    });
    if (values.help) {
      process.stdout.write(USAGE);
      return 0;
    }
    const [command, ...rest] = positionals;
    if (rest.length > 0 || (command !== "before" && command !== "after")) throw new UsageFailure("before or after");
    const e = env();
    if (command === "before") await before(e, values.dir);
    else await after(e);
    return 0;
  } catch (error) {
    if (error instanceof UsageFailure || (error instanceof TypeError && "code" in error)) {
      console.error(`${PREFIX}: ${error.message}\n\n${USAGE}`);
      return 2;
    }
    console.error(`::error::${PREFIX}: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
