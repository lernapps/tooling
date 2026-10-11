// The contract of the app publish action (actions/app-publish), whose logic is publish/publish.ts: the script runs as
// the action runs it, against a local server that answers like the GitHub API and like GitHub Pages.
//   - before the deploy: the branch gh-pages missing (the first deploy goes ahead), Pages off, Pages serving another
//     branch or folder, Pages built by a workflow, and a token that may not read the settings; where the token may,
//     it sets Pages itself; where not, it fails with what is wrong, the clicks, why, and the rule link;
//   - after the deploy: it waits until the app's address serves the marker of this commit, then prints the address;
//     when the address keeps serving an older bundle, it fails with a message;
//   - it writes the marker file into the bundle and refuses a bundle without index.html.
// The deploy itself (the branch push) is a published action and is not run here; .github/workflows/app-publish.yml
// runs `before` against the real API of this repo.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { repoRoot, runAsync, tempDir, type Result } from "./support.ts";

const SCRIPT = join(repoRoot, "publish/publish.ts");
const SHA = "0123456789abcdef0123456789abcdef01234567";
const REPO = "lernapps/bruch-trainer";
const RULE = "https://lernapps.net/tooling/rules/#pages-from-gh-pages";

/** What the fake GitHub answers, per scenario; each test sets it. */
interface World {
  branch: boolean;
  pages: { build_type: string; source: { branch: string; path: string } } | undefined;
  /** the status of a write to the Pages settings: 201/204 when the token may, 403 when not */
  write: number;
  /** the status of reading the Pages settings */
  read: number;
  /** how many requests for the marker answer with the old bundle before the new one is served */
  delay: number;
  served: string;
}

let world: World;
const requests: string[] = [];
let server: Server;
let base = "";

function handle(request: IncomingMessage, response: ServerResponse): void {
  const url = new URL(request.url ?? "/", base);
  requests.push(`${request.method} ${url.pathname}`);
  const json = (status: number, body?: unknown) => {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(body === undefined ? "" : JSON.stringify(body));
  };
  const site = { html_url: `${base}/site/`, ...world.pages };
  let body = "";
  request.on("data", (chunk: Buffer) => (body += chunk.toString()));
  request.on("end", () => {
    if (url.pathname === `/api/repos/${REPO}/branches/gh-pages`) {
      return world.branch ? json(200, { name: "gh-pages" }) : json(404, { message: "Branch not found" });
    }
    if (url.pathname === `/api/repos/${REPO}/pages`) {
      if (request.method === "GET") {
        if (world.read !== 200) return json(world.read, { message: "Resource not accessible by integration" });
        return world.pages === undefined ? json(404, { message: "Not Found" }) : json(200, site);
      }
      if (world.write >= 400) return json(world.write, { message: "Resource not accessible by integration" });
      const wanted = JSON.parse(body) as NonNullable<World["pages"]>;
      world.pages = wanted;
      return request.method === "POST" ? json(201, { html_url: `${base}/site/`, ...wanted }) : json(204);
    }
    if (url.pathname === "/site/lernapps-publish.txt") {
      response.writeHead(200);
      if (world.delay > 0) {
        world.delay--;
        return response.end("an-older-commit\n");
      }
      return response.end(`${world.served}\n`);
    }
    if (url.pathname === "/site/") {
      response.writeHead(200, { "content-type": "text/html" });
      return response.end("<!doctype html><title>Bruch-Trainer</title>");
    }
    json(404, { message: "Not Found" });
  });
}

const RIGHT = { build_type: "legacy", source: { branch: "gh-pages", path: "/" } };

beforeAll(async () => {
  server = createServer(handle);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => server.close());
afterEach(() => {
  requests.length = 0;
});

function publish(args: string[], extra: Record<string, string> = {}): Promise<Result & { outputs: string }> {
  const dir = tempDir("publish");
  const outputs = join(dir, "outputs");
  writeFileSync(outputs, "");
  const env = {
    GITHUB_API_URL: `${base}/api`,
    GITHUB_REPOSITORY: REPO,
    GITHUB_TOKEN: "fixture-token",
    GITHUB_SHA: SHA,
    GITHUB_OUTPUT: outputs,
    LERNAPPS_PUBLISH_INTERVAL: "0",
    ...extra,
  };
  return runAsync("node", [SCRIPT, ...args], repoRoot, env).then((result) => ({
    ...result,
    outputs: readFileSync(outputs, "utf8"),
  }));
}

const setWorld = (changes: Partial<World>) => {
  world = { branch: true, pages: RIGHT, write: 403, read: 200, delay: 0, served: SHA, ...changes };
};

describe("before the deploy", () => {
  test("the right setup passes and writes nothing", async () => {
    setWorld({});
    const result = await publish(["before"]);
    expect(result.code, result.stderr).toBe(0);
    expect(result.stdout).toContain("GitHub Pages serves the branch gh-pages from its root: ready to deploy");
    expect(result.outputs).toBe("first=false\n");
    expect(requests.filter((line) => !line.startsWith("GET"))).toEqual([]);
  });

  test("without the branch, the first deploy goes ahead and creates it", async () => {
    setWorld({ branch: false, pages: undefined });
    const result = await publish(["before"]);
    expect(result.code, result.stderr).toBe(0);
    expect(result.stdout).toContain("the branch gh-pages does not exist yet: this first deploy creates it");
    expect(result.outputs).toBe("first=true\n");
  });

  test("Pages off, with a token that may not change it, fails with the clicks and the rule", async () => {
    setWorld({ pages: undefined });
    const result = await publish(["before"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(
      `::error::lernapps app-publish: GitHub Pages of ${REPO} does not serve the branch gh-pages from its root (/).`,
    );
    expect(result.stderr).toContain("  found: GitHub Pages is off");
    expect(result.stderr).toContain(
      "  tried: to turn it on through the API: HTTP 403: Resource not accessible by integration",
    );
    expect(result.stderr).toContain(
      "Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages, folder: / (root) → Save",
    );
    expect(result.stderr).toContain("previews of pull requests will go below pr-preview/");
    expect(result.stderr).toContain(`  link: ${RULE}`);
    expect(result.outputs).toBe("");
  });

  test.each([
    [
      "another branch",
      { build_type: "legacy", source: { branch: "main", path: "/" } },
      "Pages serves the branch main, folder /",
    ],
    [
      "the folder /docs",
      { build_type: "legacy", source: { branch: "gh-pages", path: "/docs" } },
      "Pages serves the branch gh-pages, folder /docs",
    ],
    [
      "a workflow",
      { build_type: "workflow", source: { branch: "main", path: "/" } },
      "Pages is built by a GitHub Actions workflow",
    ],
  ])("Pages serving %s fails, naming what it serves", async (_name, pages, found) => {
    setWorld({ pages });
    const result = await publish(["before"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`  found: ${found}`);
    expect(result.stderr).toContain("  tried: to change it through the API: HTTP 403");
    expect(result.stderr).toContain(`  link: ${RULE}`);
  });

  test("with a token that may change the settings, it turns Pages on or sets its source itself", async () => {
    setWorld({ pages: undefined, write: 201 });
    const off = await publish(["before"]);
    expect(off.code, off.stderr).toBe(0);
    expect(off.stdout).toContain("turned GitHub Pages on: the branch gh-pages, folder / (root)");
    setWorld({ pages: { build_type: "legacy", source: { branch: "main", path: "/" } }, write: 204 });
    const wrong = await publish(["before"]);
    expect(wrong.code, wrong.stderr).toBe(0);
    expect(wrong.stdout).toContain(
      "GitHub Pages now serves the branch gh-pages, folder / (root); before: Pages serves the branch main, folder /",
    );
    expect(world.pages).toEqual(RIGHT);
  });

  test("a token that may not read the settings fails, naming the permissions", async () => {
    setWorld({ read: 403 });
    const result = await publish(["before"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("this token may not read the Pages settings");
    expect(result.stderr).toContain("contents: write and pages: write");
  });

  test("it writes the marker of the commit into the bundle, and refuses a bundle without index.html", async () => {
    setWorld({});
    const bundle = join(tempDir("bundle"), "_site");
    mkdirSync(bundle);
    const empty = await publish(["before", "--dir", bundle]);
    expect(empty.code).toBe(1);
    expect(empty.stderr).toContain(
      'has no index.html: the artifact "site" of the app check action is missing or empty',
    );
    writeFileSync(join(bundle, "index.html"), "<!doctype html>");
    const result = await publish(["before", "--dir", bundle]);
    expect(result.code, result.stderr).toBe(0);
    expect(readFileSync(join(bundle, "lernapps-publish.txt"), "utf8")).toBe(`${SHA}\n`);
  });
});

describe("after the deploy", () => {
  test("it waits until the address serves this commit, then prints the address", async () => {
    setWorld({ delay: 3 });
    const result = await publish(["after"]);
    expect(result.code, result.stderr).toBe(0);
    expect(result.stdout).toContain(`lernapps app-publish: published at ${base}/site/`);
    expect(result.outputs).toBe(`url=${base}/site/\n`);
    expect(requests.filter((line) => line === "GET /site/lernapps-publish.txt")).toHaveLength(4);
  });

  test("after a first deploy, it checks the Pages settings too", async () => {
    setWorld({ pages: undefined });
    const result = await publish(["after"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("  found: GitHub Pages is off");
  });

  test("an address that keeps serving an older bundle fails after the timeout, saying where to look", async () => {
    setWorld({ served: "an-older-commit" });
    const result = await publish(["after"], { LERNAPPS_PUBLISH_TIMEOUT: "0" });
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(
      `does not serve this commit (${SHA.slice(0, 7)}) after 0 s; last: an older bundle (an-older-com)`,
    );
    expect(result.stderr).toContain('the run "pages build and deployment"');
    expect(result.stderr).toContain(`  link: ${RULE}`);
  });
});

test("a wrong call is a usage error", async () => {
  setWorld({});
  const result = await publish(["deploy"]);
  expect(result.code).toBe(2);
});
