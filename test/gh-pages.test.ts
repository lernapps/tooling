// The contract of publish/gh-pages.ts, the writer of the previews on gh-pages (issue #275): a preview goes in and
// out as a whole folder, a push that another run beat starts over from the newer branch and keeps both changes, and
// the cleanup removes exactly the previews whose pull request is not open. Against a real git repo as the remote.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import {
  backoff,
  cleanupChange,
  deployChange,
  previewNumbers,
  removeChange,
  stalePreviews,
  write,
  type Remote,
} from "../publish/gh-pages.ts";
import { ok, tempDir } from "./support.ts";

const noWait = async () => {};
const quiet = { wait: noWait, log: () => {} };

/** A bare repo as the remote, and a function that reads a file of its gh-pages (undefined when missing). */
function remote(): { remote: Remote; read: (path: string) => string | undefined; commits: () => number } {
  const bare = tempDir("gh-pages-remote");
  ok("git", ["init", "--quiet", "--bare", bare], bare);
  const read = (path: string): string | undefined => {
    const shown = ok("git", ["ls-tree", "-r", "--name-only", "gh-pages"], bare).stdout.split("\n");
    if (!shown.includes(path)) return undefined;
    return ok("git", ["show", `gh-pages:${path}`], bare).stdout;
  };
  const commits = () => Number(ok("git", ["rev-list", "--count", "gh-pages"], bare).stdout.trim());
  return { remote: { url: bare, env: {} }, read, commits };
}

/** A folder with the given files. */
function folder(files: Record<string, string>): string {
  const dir = tempDir("preview");
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

describe("the names below pr-preview/", () => {
  test("are previews only as pr-<number>", () => {
    expect(previewNumbers(["pr-12", "pr-3", "pr-x", "pr-0", "pr-07", ".nojekyll", "other"])).toEqual([3, 12]);
  });

  test("are stale when their pull request is not open", () => {
    expect(stalePreviews([3, 12, 40], new Set([12]))).toEqual([3, 40]);
  });
});

describe("a rejected push", () => {
  test("waits a random, growing time, at most 30 seconds", () => {
    expect(backoff(1, () => 0)).toBe(1000);
    expect(backoff(1, () => 1)).toBe(2000);
    expect(backoff(3, () => 1)).toBe(8000);
    expect(backoff(9, () => 1)).toBe(30_000);
  });

  test("starts over from the newer branch and keeps the other run's change", async () => {
    const r = remote();
    await write(r.remote, deployChange(1, folder({ "index.html": "one" })), quiet);
    let other = false;
    const done = await write(r.remote, deployChange(2, folder({ "index.html": "two" })), {
      ...quiet,
      beforePush: (attempt) => {
        if (attempt !== 1 || other) return;
        other = true; // another run pushes first
        void write(r.remote, deployChange(3, folder({ "index.html": "three" })), quiet);
      },
    });
    expect(done).toBe("pushed");
    expect(r.read("pr-preview/pr-1/index.html")).toBe("one");
    expect(r.read("pr-preview/pr-2/index.html")).toBe("two");
    expect(r.read("pr-preview/pr-3/index.html")).toBe("three");
  });

  test("fails after the last attempt", async () => {
    const r = remote();
    await write(r.remote, deployChange(1, folder({ "index.html": "one" })), quiet);
    let n = 10;
    const always = write(r.remote, deployChange(2, folder({ "index.html": "two" })), {
      ...quiet,
      attempts: 2,
      beforePush: () => void write(r.remote, deployChange(++n, folder({ "a.html": "x" })), quiet),
    });
    await expect(always).rejects.toThrow(/cannot push to gh-pages/);
  });
});

describe("a preview", () => {
  test("in a repo without gh-pages starts the branch, with .nojekyll at its root", async () => {
    const r = remote();
    expect(await write(r.remote, deployChange(5, folder({ "index.html": "hi", "_a.js": "x" })), quiet)).toBe("pushed");
    expect(r.read(".nojekyll")).toBe("");
    expect(r.read("pr-preview/pr-5/_a.js")).toBe("x");
  });

  test("replaces the files of its last push and leaves the site alone", async () => {
    const r = remote();
    await write(r.remote, deployChange(5, folder({ "index.html": "v1", "old.html": "gone" })), quiet);
    await write(r.remote, (dir) => (writeFileSync(join(dir, "index.html"), "site"), "the site"), quiet);
    await write(r.remote, deployChange(5, folder({ "index.html": "v2" })), quiet);
    expect(r.read("pr-preview/pr-5/index.html")).toBe("v2");
    expect(r.read("pr-preview/pr-5/old.html")).toBeUndefined();
    expect(r.read("index.html")).toBe("site");
  });

  test("is removed as a whole folder, .nojekyll too; removing it again changes nothing", async () => {
    const r = remote();
    await write(r.remote, deployChange(5, folder({ "index.html": "hi", ".nojekyll": "" })), quiet);
    expect(await write(r.remote, removeChange(5), quiet)).toBe("pushed");
    expect(r.read("pr-preview/pr-5/.nojekyll")).toBeUndefined();
    expect(r.read(".nojekyll")).toBe("");
    const before = r.commits();
    expect(await write(r.remote, removeChange(5), quiet)).toBe("unchanged");
    expect(r.commits()).toBe(before);
  });
});

describe("the cleanup", () => {
  test("removes the previews of pull requests that are not open, in one commit, and nothing else", async () => {
    const r = remote();
    for (const n of [3, 7, 12]) await write(r.remote, deployChange(n, folder({ "index.html": `${n}` })), quiet);
    await write(r.remote, (dir) => (writeFileSync(join(dir, "pr-preview", "notes.txt"), "keep"), "notes"), quiet);
    const before = r.commits();
    const removed: number[] = [];
    expect(await write(r.remote, cleanupChange(new Set([7]), removed), quiet)).toBe("pushed");
    expect(removed).toEqual([3, 12]);
    expect(r.commits()).toBe(before + 1);
    expect(r.read("pr-preview/pr-3/index.html")).toBeUndefined();
    expect(r.read("pr-preview/pr-12/index.html")).toBeUndefined();
    expect(r.read("pr-preview/pr-7/index.html")).toBe("7");
    expect(r.read("pr-preview/notes.txt")).toBe("keep");
  });

  test("as a dry run only reports", async () => {
    const r = remote();
    await write(r.remote, deployChange(3, folder({ "index.html": "3" })), quiet);
    const removed: number[] = [];
    expect(await write(r.remote, cleanupChange(new Set(), removed, true), quiet)).toBe("unchanged");
    expect(removed).toEqual([3]);
    expect(r.read("pr-preview/pr-3/index.html")).toBe("3");
  });
});

test("the preview actions write gh-pages with this script, and the deploys try more than three times", () => {
  const read = (path: string) => readFileSync(join(import.meta.dirname, "..", path), "utf8");
  for (const action of ["site-preview", "app-preview"]) {
    const text = read(`actions/${action}/action.yml`);
    expect(text, action).toContain("publish/gh-pages.ts");
    expect(text, action).not.toContain("rossjrw/pr-preview-action");
  }
  for (const action of ["site-deploy", "app-publish"]) {
    expect(read(`actions/${action}/action.yml`), action).toMatch(/attempt-limit: 10\b/);
  }
  expect(existsSync(join(import.meta.dirname, "..", ".github/workflows/preview-cleanup.yml"))).toBe(true);
});
