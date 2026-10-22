// The links of the guidance an eval ran with: every URL in its plan templates, skills and llms.txt at the guidance
// commit. evals/harbor/run.sh writes them into the job as guidance-links.json; evals/score-transcript.ts counts a
// fetch of a linked URL as guidance, beside its fixed patterns, so that what the guidance sends the agent to never
// counts as a read outside it (the README of an app template is linked by the archetype's design skill).
//   node evals/guidance-links.ts <commit> <out.json>
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/** What the guidance consists of, as paths of this repo. */
const SOURCES = ["guidance", "skills", "site/llms.txt"];

export interface GuidanceLinks {
  guidanceCommit: string;
  links: string[];
}

/** The URLs in a text, without the punctuation that closes a sentence or a Markdown link. */
export function linksIn(text: string): string[] {
  return [...text.matchAll(/https?:\/\/[^\s)\]>`"'|]+/g)].map((match) => match[0].replace(/[.,;:!?*]+$/, ""));
}

/**
 * A URL as it compares: without fragment, a file on GitHub by its repository and path whatever the branch or commit
 * (`github.com/<o>/<r>/blob/<ref>/<path>` and `raw.githubusercontent.com/<o>/<r>/<ref>/<path>` alike), and a link
 * with a placeholder (`…/start/<id>`) or ending in `/` as the start of the URLs it stands for. A placeholder after
 * fewer than two path segments (`lernapps.net/<repo>`, `api.github.com/repos/<owner>`) stands for too much and counts
 * not at all.
 */
export function linkKey(url: string): { key: string; prefix: boolean; broad: boolean } {
  const placeholder = url.indexOf("<");
  let key = (placeholder >= 0 ? url.slice(0, placeholder) : url).replace(/#.*$/, "").replace(/^http:/, "https:");
  key = key
    .replace(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/[^/]+\//, "github:$1/$2/")
    .replace(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/[^/]+\//, "github:$1/$2/");
  const prefix = placeholder >= 0 || key.endsWith("/");
  const segments = key
    .replace(/^(https:\/\/[^/]+|github:[^/]+\/[^/]+)\/?/, "")
    .split("/")
    .filter(Boolean).length;
  return { key, prefix, broad: placeholder >= 0 && segments < 2 };
}

/** A shell variable in a fetched URL (`…/main/$a/README.md` in a loop over the archetypes): any one segment. */
const VARIABLE = /\$\{?\w+\}?/;

/**
 * Whether a URL the agent fetched is one the guidance links, or under a link that stands for many. A shell variable
 * in the fetched URL matches any one path segment of a link.
 */
export function isLinked(url: string, links: string[]): boolean {
  const key = linkKey(url.replace(/[;,]+$/, "")).key;
  const pattern = VARIABLE.test(key)
    ? new RegExp(
        `^${key
          .split(new RegExp(VARIABLE.source, "g"))
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("[^/]+")}$`,
      )
    : undefined;
  return links.some((link) => {
    const linked = linkKey(link);
    if (linked.broad) return false;
    if (pattern) return pattern.test(linked.key);
    return linked.prefix ? key.startsWith(linked.key) : key === linked.key;
  });
}

const filesIn = (path: string): string[] =>
  statSync(path).isDirectory() ? readdirSync(path).flatMap((name) => filesIn(join(path, name))) : [path];

/** The links of the guidance at a commit of this repo (fetched from origin when it is not here). */
export function linksAt(commit: string): string[] {
  const git = (...args: string[]) => execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" });
  try {
    git("cat-file", "-e", `${commit}^{commit}`);
  } catch {
    git("fetch", "--quiet", "origin", commit);
  }
  const dir = mkdtempSync(join(tmpdir(), "guidance-links-"));
  try {
    // $0 the repo, $1 the commit, $2 the folder, then the sources
    execFileSync("sh", [
      "-c",
      `c="$1" d="$2"; shift 2; git -C "$0" archive "$c" "$@" | tar -x -C "$d"`,
      ROOT,
      commit,
      dir,
      ...SOURCES,
    ]);
    const files = SOURCES.flatMap((source) => filesIn(join(dir, source))).filter((file) => /\.(md|txt)$/.test(file));
    return [...new Set(files.flatMap((file) => linksIn(readFileSync(file, "utf8"))))].sort();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [commit, out] = process.argv.slice(2);
  if (!commit || !out) {
    process.stderr.write("usage: node evals/guidance-links.ts <commit> <out.json>\n");
    process.exit(2);
  }
  const result: GuidanceLinks = { guidanceCommit: commit, links: linksAt(commit) };
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${out}: ${result.links.length} links\n`);
}
