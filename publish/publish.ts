#!/usr/bin/env node
// The logic of the app publish action (actions/app-publish): it publishes an app's checked bundle to the app repo's
// GitHub Pages, the branch gh-pages served from its root (/). The action is a thin wrapper around two commands:
//   before  checks the setup before the deploy: the branch gh-pages exists and Pages serves it from its root; where
//           Pages is off or serves something else, it sets it through the API if the token may. Where it may not, it
//           warns and the deploy goes on: the newest bundle is on gh-pages, so the creator's click shows it without a
//           new run, and `after` fails until the setting is made. On the first deploy the branch does not exist yet:
//           the deploy creates it, and `after` checks Pages. It also writes the marker
//           file lernapps-publish.txt (the commit) into the bundle, and warns when the repo's default branch is not
//           main (the token may not change it; the deploy goes on, also when it cannot be read).
//   after   checks Pages again (it may be the first deploy), then waits until the app's address serves the marker of
//           this commit, and prints the address.
// Only Node's own modules: the action runs it without installing anything. Every failure says what is wrong, how to
// fix it, why, and links the rule, like the messages of `lernapps check`: the creator's assistant reads them first.
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const RULE = "https://lernapps.net/tooling/rules/#pages-from-gh-pages";
const BRANCH = "gh-pages";
const MARKER = "lernapps-publish.txt";
const PREFIX = "lernapps app-publish";

const USAGE = `Usage: node publish/publish.ts before [--dir <bundle>]
       node publish/publish.ts after

Environment: GITHUB_REPOSITORY (owner/name), GITHUB_TOKEN, GITHUB_SHA; GITHUB_API_URL (default https://api.github.com);
LERNAPPS_PUBLISH_TIMEOUT and LERNAPPS_PUBLISH_INTERVAL in seconds (default 600 and 15): how long \`after\` waits for
the app's address. Exit code 0 when the setup is right (and the app is served), 1 when not, 2 on a usage error.
`;

/** The setup or the deploy is wrong; the message says what to do. */
class Failure extends Error {}
/** The Pages settings are wrong and this run may not change them: only a repository admin's click fixes it. */
class SetupFailure extends Failure {}
/** The command was called wrongly. */
class UsageFailure extends Error {}

interface Env {
  api: string;
  repo: string;
  token: string;
  sha: string;
}

function env(): Env {
  const need = (name: string): string => {
    const value = process.env[name];
    if (value === undefined || value === "") throw new UsageFailure(`${name} is not set`);
    return value;
  };
  return {
    api: (process.env["GITHUB_API_URL"] || "https://api.github.com").replace(/\/+$/, ""),
    repo: need("GITHUB_REPOSITORY"),
    token: need("GITHUB_TOKEN"),
    sha: need("GITHUB_SHA"),
  };
}

interface Response {
  status: number;
  body: unknown;
  text: string;
}

async function request(e: Env, method: string, path: string, body?: unknown): Promise<Response> {
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
  return { status: response.status, body: parsed, text };
}

const field = (value: unknown, key: string): unknown =>
  typeof value === "object" && value !== null && key in value ? (value as Record<string, unknown>)[key] : undefined;

/** GitHub's message in an error response, e.g. "Resource not accessible by integration". */
const apiMessage = (response: Response) => {
  const message = field(response.body, "message");
  return `HTTP ${response.status}${typeof message === "string" ? `: ${message}` : ""}`;
};

const CLICKS =
  "Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages, folder: / (root) → Save";
const WHY =
  "the app is published from the branch gh-pages; previews of pull requests will go below pr-preview/ on the same branch, so Pages must serve the whole branch from its root";

/** The message of a setup that is wrong and that this run could not fix. */
function setupFailure(e: Env, found: string, tried: string): SetupFailure {
  return new SetupFailure(
    [
      `${PREFIX}: GitHub Pages of ${e.repo} does not serve the branch ${BRANCH} from its root (/).`,
      `  found: ${found}`,
      `  tried: ${tried}`,
      `  fix: a repository admin sets it once: ${CLICKS}. The deploy has put the newest app on the branch ${BRANCH} already, so Pages serves it right after the click, without a new run. Never push a change only to start a run. Or give the action a token that may change the Pages settings (input token: a fine-grained token with the repository permissions Administration: write and Pages: write).`,
      `  why: ${WHY}`,
      `  link: ${RULE}`,
    ].join("\n"),
  );
}

/** What Pages serves now, in words, or undefined when it serves gh-pages from its root. */
function wrongSource(pages: unknown): string | undefined {
  const buildType = field(pages, "build_type");
  const source = field(pages, "source");
  const branch = field(source, "branch");
  const path = field(source, "path");
  if (buildType === "workflow") return "Pages is built by a GitHub Actions workflow, not deployed from a branch";
  if (branch === BRANCH && path === "/") return undefined;
  return `Pages serves the branch ${String(branch)}, folder ${String(path)}`;
}

const WANTED = { build_type: "legacy", source: { branch: BRANCH, path: "/" } };

const MAIN = "main";
const DEFAULT_BRANCH_CLICKS =
  "Settings → General → Default branch → ⇄ (Switch to another branch) → main → Update → I understand, update the default branch";

/**
 * Warns when the repo's default branch is not main, with the clicks that set it: the app is published only from main,
 * but update pull requests (Renovate) and new pull requests target the default branch. Best-effort: a request that
 * fails or a token that may not read the repo is a notice, and the deploy goes on either way.
 */
async function checkDefaultBranch(e: Env): Promise<void> {
  let repo: Response;
  try {
    repo = await request(e, "GET", `/repos/${e.repo}`);
  } catch (error) {
    repo = { status: 0, body: undefined, text: String(error) };
  }
  const branch = field(repo.body, "default_branch");
  if (repo.status !== 200 || typeof branch !== "string") {
    const why = repo.status === 0 ? repo.text : apiMessage(repo);
    console.log(`::notice::${PREFIX}: could not read the default branch of ${e.repo} (${why}); the deploy goes on`);
    return;
  }
  if (branch === MAIN) return;
  console.log(
    [
      `::warning::${PREFIX}: the default branch of ${e.repo} is ${branch}, not ${MAIN}.`,
      `  fix: a repository admin sets it once: ${DEFAULT_BRANCH_CLICKS}. Or, with the GitHub CLI and admin rights: gh api -X PATCH repos/${e.repo} -f default_branch=${MAIN}. Branch ${branch} stays.`,
      `  why: the app is published only from ${MAIN}; update pull requests (Renovate) and new pull requests target the default branch, so what they change would not be published`,
      `  link: ${RULE}`,
    ].join("\n"),
  );
}

/** Checks that Pages serves gh-pages from its root; sets it if the token may. Returns the Pages site. */
async function ensurePages(e: Env): Promise<unknown> {
  const got = await request(e, "GET", `/repos/${e.repo}/pages`);
  if (got.status === 404) {
    const created = await request(e, "POST", `/repos/${e.repo}/pages`, WANTED);
    if (created.status === 201) {
      console.log(`${PREFIX}: turned GitHub Pages on: the branch ${BRANCH}, folder / (root)`);
      return created.body;
    }
    throw setupFailure(e, "GitHub Pages is off", `to turn it on through the API: ${apiMessage(created)}`);
  }
  if (got.status === 401 || got.status === 403) {
    throw new Failure(
      [
        `${PREFIX}: this token may not read the Pages settings of ${e.repo} (${apiMessage(got)}).`,
        "  fix: give the job the permissions contents: write and pages: write, as the generated .github/workflows/pages.yml does.",
        `  link: ${RULE}`,
      ].join("\n"),
    );
  }
  if (got.status !== 200)
    throw new Failure(`${PREFIX}: cannot read the Pages settings of ${e.repo}: ${apiMessage(got)}`);
  const found = wrongSource(got.body);
  if (found === undefined) return got.body;
  const updated = await request(e, "PUT", `/repos/${e.repo}/pages`, WANTED);
  if (updated.status === 204 || updated.status === 200) {
    console.log(`${PREFIX}: GitHub Pages now serves the branch ${BRANCH}, folder / (root); before: ${found}`);
    return (await request(e, "GET", `/repos/${e.repo}/pages`)).body;
  }
  throw setupFailure(e, found, `to change it through the API: ${apiMessage(updated)}`);
}

function output(name: string, value: string): void {
  const file = process.env["GITHUB_OUTPUT"];
  if (file) appendFileSync(file, `${name}=${value}\n`);
}

async function before(e: Env, dir: string | undefined): Promise<void> {
  if (dir !== undefined) {
    if (!existsSync(join(dir, "index.html"))) {
      throw new Failure(
        `${PREFIX}: ${dir} has no index.html: the artifact "app" of the app check action is missing or empty`,
      );
    }
    writeFileSync(join(dir, MARKER), `${e.sha}\n`);
  }
  await checkDefaultBranch(e);
  const branch = await request(e, "GET", `/repos/${e.repo}/branches/${BRANCH}`);
  if (branch.status === 404) {
    console.log(
      `${PREFIX}: the branch ${BRANCH} does not exist yet: this first deploy creates it; then the Pages settings are checked`,
    );
    output("first", "true");
    return;
  }
  if (branch.status !== 200)
    throw new Failure(`${PREFIX}: cannot read the branch ${BRANCH} of ${e.repo}: ${apiMessage(branch)}`);
  try {
    await ensurePages(e);
    console.log(`${PREFIX}: GitHub Pages serves the branch ${BRANCH} from its root: ready to deploy`);
  } catch (error) {
    // the deploy goes on: once the admin's click is made, Pages serves the newest bundle; `after` fails until then
    if (!(error instanceof SetupFailure)) throw error;
    console.log(`::warning::${error.message.split("\n")[0]}`);
    console.log(error.message);
    console.log(`${PREFIX}: deploying anyway; the check after the deploy fails until the setting is made`);
  }
  output("first", "false");
}

const seconds = (name: string, fallback: number) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
};

async function fetchText(url: string): Promise<{ status: number; text: string } | undefined> {
  try {
    const response = await fetch(url, { headers: { "cache-control": "no-cache" }, redirect: "follow" });
    return { status: response.status, text: await response.text() };
  } catch {
    return undefined;
  }
}

async function after(e: Env): Promise<void> {
  const pages = await ensurePages(e);
  const address = field(pages, "html_url");
  if (typeof address !== "string")
    throw new Failure(`${PREFIX}: the Pages settings of ${e.repo} name no address (html_url)`);
  const base = address.endsWith("/") ? address : `${address}/`;
  const timeout = seconds("LERNAPPS_PUBLISH_TIMEOUT", 600) * 1000;
  const interval = seconds("LERNAPPS_PUBLISH_INTERVAL", 15) * 1000;
  // the query string passes the cache of GitHub Pages, which keeps a file for up to ten minutes
  const marker = `${base}${MARKER}?commit=${e.sha}`;
  const start = Date.now();
  let last = "no answer yet";
  for (;;) {
    const served = await fetchText(marker);
    if (served?.status === 200 && served.text.trim() === e.sha) {
      const page = await fetchText(`${base}?commit=${e.sha}`);
      if (page?.status === 200) {
        console.log(`${PREFIX}: published at ${base}`);
        output("url", base);
        const summary = process.env["GITHUB_STEP_SUMMARY"];
        if (summary) appendFileSync(summary, `The app is published at <${base}> (commit ${e.sha}).\n`);
        return;
      }
      last = `the start page answers ${page ? `HTTP ${page.status}` : "nothing"}`;
    } else {
      last =
        served === undefined
          ? "no answer"
          : served.status === 200
            ? `an older bundle (${served.text.trim().slice(0, 12) || "no commit"})`
            : `HTTP ${served.status}`;
    }
    if (Date.now() - start >= timeout) break;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Failure(
    [
      `${PREFIX}: ${base} does not serve this commit (${e.sha.slice(0, 7)}) after ${Math.round(timeout / 1000)} s; last: ${last}.`,
      `  fix: open the repo's Actions tab: the run "pages build and deployment" builds the site after each deploy; read its error if it failed. Then run this workflow again. Check the Pages settings too: ${CLICKS}.`,
      `  link: ${RULE}`,
    ].join("\n"),
  );
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
    if (error instanceof Failure) {
      console.error(`::error::${error.message.split("\n")[0]}`);
      console.error(error.message);
      return 1;
    }
    if (error instanceof UsageFailure || (error instanceof TypeError && "code" in error)) {
      console.error(`${PREFIX}: ${error.message}\n\n${USAGE}`);
      return 2;
    }
    // e.g. the API cannot be reached
    console.error(`::error::${PREFIX}: ${String(error)}`);
    return 1;
  }
}

process.exitCode = await main(process.argv.slice(2));
