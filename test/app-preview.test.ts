// The contract of the app preview (actions/app-preview, publish/preview.ts) and of the job `preview` in the workflow
// the generator writes: a pull request from the app's own repo gets the checked bundle as a preview, not indexed, with
// one comment in German for the creator; closing the pull request removes it. Deploying to GitHub Pages is not tested
// here: that is pr-preview-action's.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { parse } from "yaml";
import {
  COMMENT_MARKER,
  commentBody,
  derivedAddress,
  ensureNoJekyll,
  NOINDEX,
  noindex,
  noindexAll,
  previewAddress,
} from "../publish/preview.ts";
import { repoRoot, tempDir } from "./support.ts";

describe("the preview's pages", () => {
  test("get a robots noindex tag in their head, once", () => {
    const page = '<!doctype html>\n<html lang="de">\n  <head>\n    <title>App</title>\n  </head>\n<body></body></html>';
    const marked = noindex(page);
    expect(marked).toContain(`${NOINDEX}\n  </head>`);
    expect(noindex(marked)).toBe(marked);
    expect(noindex(page.replace("<title>", '<meta name="robots" content="none" /><title>'))).not.toContain(NOINDEX);
  });

  test("every page of the bundle, in every folder, and nothing else", () => {
    const dir = tempDir("preview-bundle");
    mkdirSync(join(dir, "en/kapitel"), { recursive: true });
    mkdirSync(join(dir, "assets"));
    for (const page of ["index.html", "en/index.html", "en/kapitel/index.html"]) {
      writeFileSync(join(dir, page), "<html><head></head><body></body></html>");
    }
    writeFileSync(join(dir, "assets/app.js"), "</head>");
    expect(noindexAll(dir)).toBe(3);
    expect(readFileSync(join(dir, "en/kapitel/index.html"), "utf8")).toContain(NOINDEX);
    expect(readFileSync(join(dir, "assets/app.js"), "utf8")).toBe("</head>");
  });
});

describe("the preview's address", () => {
  test("is below the app's address, which is derived from the repo where Pages cannot be read", () => {
    expect(derivedAddress("lernapps/naturwunder")).toBe("https://lernapps.net/naturwunder/");
    expect(derivedAddress("Jane/naturwunder")).toBe("https://jane.github.io/naturwunder/");
    expect(derivedAddress("jane/jane.github.io")).toBe("https://jane.github.io/");
    expect(previewAddress("https://lernapps.net/naturwunder/", 7)).toBe(
      "https://lernapps.net/naturwunder/pr-preview/pr-7/",
    );
    expect(previewAddress("https://example.org/app", 7)).toBe("https://example.org/app/pr-preview/pr-7/");
  });
});

describe("the comment for the creator", () => {
  const app = "https://lernapps.net/naturwunder/";
  const preview = previewAddress(app, 7);

  test("links the preview and the app's address, says what the preview is, and stays short and plain", () => {
    const body = commentBody({ state: "open", preview, app, ready: true });
    expect(body.startsWith(COMMENT_MARKER)).toBe(true);
    expect(body).toContain(preview);
    expect(body).toContain(app);
    for (const text of ["vorübergehend", "Handy", "Lernende sehen", "Katalog", "geschlossen oder zusammengeführt"]) {
      expect(body).toContain(text);
    }
    expect(body).not.toMatch(/artifact|bundle|\bCI\b|deploy|build/i);
    expect(body.split(/\s+/).length).toBeLessThanOrEqual(120);
    expect(body).not.toContain("noch nicht lädt");
    expect(commentBody({ state: "open", preview, app, ready: false })).toContain("noch nicht lädt");
  });

  test("says the preview is gone when the pull request is closed, and whether the changes go online", () => {
    const merged = commentBody({ state: "closed", app, merged: true });
    const closed = commentBody({ state: "closed", app, merged: false });
    for (const body of [merged, closed]) {
      expect(body.startsWith(COMMENT_MARKER)).toBe(true);
      expect(body).toContain("Vorschau ist entfernt");
      expect(body).not.toContain(preview);
    }
    expect(merged).toContain(`gehen jetzt online, unter der Adresse der App: <${app}>`);
    expect(closed).toContain("nichts geändert");
  });
});

interface Job {
  if?: string;
  needs?: string | string[];
  permissions?: Record<string, string>;
  steps?: { uses?: string }[];
}

describe("the job preview of the app's workflow", () => {
  const workflow = parse(readFileSync(join(repoRoot, "generator/app/.github/workflows/pages.yml"), "utf8")) as {
    on: { pull_request: { types: string[] } };
    permissions: Record<string, string>;
    jobs: Record<string, Job>;
  };
  const preview = workflow.jobs["preview"];

  test("runs on pull requests from the repo itself after a passed check, and on closing one without a check", () => {
    expect(workflow.on.pull_request.types).toEqual(["opened", "synchronize", "reopened", "closed"]);
    expect(workflow.jobs["app"]?.if).toBe("github.event.action != 'closed'");
    expect(preview?.needs).toBe("app");
    expect(preview?.if).toContain("always()");
    expect(preview?.if).toContain("github.event.pull_request.head.repo.full_name == github.repository");
    expect(preview?.if).toContain("github.event.action == 'closed' || needs.app.result == 'success'");
    expect(preview?.steps?.map((step) => step.uses)).toEqual(["lernapps/tooling/actions/app-preview@{{tooling}}"]);
  });

  test("alone may write the repo's contents and the pull request's comments", () => {
    expect(workflow.permissions).toEqual({ contents: "read" });
    expect(preview?.permissions).toEqual({ contents: "write", "pull-requests": "write", pages: "read" });
    for (const [name, job] of Object.entries(workflow.jobs)) {
      if (name !== "preview") expect(job.permissions?.["pull-requests"], name).toBeUndefined();
    }
  });

  test("previews the bundle the check uploaded, which app-check uploads on a pull request from the repo too", () => {
    const action = (name: string) =>
      parse(readFileSync(join(repoRoot, "actions", name, "action.yml"), "utf8")) as {
        inputs: Record<string, { default?: string }>;
        runs: { steps: { uses?: string; with?: Record<string, unknown> }[] };
      };
    expect(action("app-check").inputs["upload"]?.default).toContain(
      "github.event.pull_request.head.repo.full_name == github.repository",
    );
    const steps = action("app-preview").runs.steps;
    const download = steps.find((step) => step.uses?.startsWith("actions/download-artifact@"));
    const deploy = steps.find((step) => step.uses?.startsWith("rossjrw/pr-preview-action@"));
    expect(download?.with).toMatchObject({ name: "app", path: "_app" });
    expect(deploy?.with).toMatchObject({ "source-dir": "_app", "umbrella-dir": "pr-preview", comment: false });
    // app-publish keeps the previews when it publishes
    expect(JSON.stringify(action("app-publish").runs.steps)).toContain('"clean-exclude":"pr-preview/"');
  });
});

describe("the .nojekyll file at the root of gh-pages", () => {
  const e = { api: "https://api.test", repo: "lernapps/musik", token: "t" };
  afterEach(() => vi.unstubAllGlobals());
  /** Answers each call with the next status; returns the calls made as "METHOD path". */
  const answer = (...statuses: number[]) => {
    const calls: string[] = [];
    const bodies: unknown[] = [];
    vi.stubGlobal("fetch", async (url: string, init: { method?: string; body?: string }) => {
      calls.push(`${init.method ?? "GET"} ${url.replace(e.api, "")}`);
      if (init.body !== undefined) bodies.push(JSON.parse(init.body));
      return new Response("{}", { status: statuses.shift() ?? 500 });
    });
    return { calls, bodies };
  };

  test("is left alone when it is there", async () => {
    const { calls } = answer(200);
    expect(await ensureNoJekyll(e)).toBe(true);
    expect(calls).toEqual(["GET /repos/lernapps/musik/contents/.nojekyll?ref=gh-pages"]);
  });

  test("is written to gh-pages, empty, when it is missing (a preview before the first deploy)", async () => {
    const { calls, bodies } = answer(404, 201);
    expect(await ensureNoJekyll(e)).toBe(true);
    expect(calls[1]).toBe("PUT /repos/lernapps/musik/contents/.nojekyll");
    expect(bodies[0]).toMatchObject({ content: "", branch: "gh-pages" });
  });

  test("says no, without writing, when the token cannot read it, and when writing fails", async () => {
    expect((answer(403), await ensureNoJekyll(e))).toBe(false);
    const { calls } = answer(404, 403);
    expect(await ensureNoJekyll(e)).toBe(false);
    expect(calls).toHaveLength(2);
  });
});
