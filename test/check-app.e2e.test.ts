// The contract of `lernapps check` on a built app, end to end: the real CLI on fixture apps, one passing and one per
// broken rule (test/fixtures/apps/), on a bundle and on a URL, without the app's repo. Fast enough for every push.
//   - exit code 0 when no rule of severity error fails, 1 when one does;
//   - a passing check prints one line; otherwise the validation report in YAML, valid against its JSON Schema;
//   - every finding: rule id, severity, where, what was found, how to fix it, the link to the rule;
//   - `--entry <file>`: the app's URL and every topic link resolve, the fitness values match;
//   - `--site <path>`: the site rules, by lernapps-check of the site frame.
// In an app's repo: check-repo.e2e.test.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { app, check, checkAsync, findingsOf, output, report, type Report } from "./check-report.ts";
import { tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 5 * 60 * 1000;

const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml" };

/** Serves a fixture app at http://127.0.0.1:<port>/, as a host would. */
async function serve(dir: string): Promise<{ server: Server; url: string }> {
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const file = join(dir, path.endsWith("/") ? `${path}index.html` : path);
    try {
      const body = readFileSync(file);
      response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404).end("not found");
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/` };
}

/** Runs `jobs` with at most `limit` at a time; each check starts its own browser. */
async function pooled<T>(jobs: (() => Promise<T>)[], limit = 4): Promise<T[]> {
  const results: T[] = [];
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const index = next++;
      results[index] = await (jobs[index] as () => Promise<T>)();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, jobs.length) }, worker));
  return results;
}

const BROKEN = [
  ["request-before-click", "no-request-before-click", "fonts.example.org"],
  ["cookie", "no-tracking", "besuch"],
  ["no-javascript", "readable-without-javascript", "index.html"],
  ["overflow", "usable-at-360px", "index.html"],
  ["inaccessible", "accessible", "img"],
  ["broken-link", "links-resolve", "erweitern/"],
] as const;

describe.skipIf(inner)("lernapps check on a built app", () => {
  // Every check of a bundle is independent of the others: they run at the same time, once each, before the tests.
  const runs = new Map<string, Result>();
  const reports = { passing: "", storing: "" };
  const ran = (key: string): Result => {
    const result = runs.get(key);
    if (result === undefined) throw new Error(`no run ${key}`);
    return result;
  };

  beforeAll(async () => {
    reports.passing = join(tempDir("report"), "report.yaml");
    reports.storing = join(tempDir("report"), "report.yaml");
    const jobs: [string, string[]][] = [
      ["passing", [app("passing"), "--report", reports.passing]],
      ...BROKEN.map(([name]): [string, string[]] => [name, [app(name)]]),
      ["broken-link again", [app("broken-link")]],
      ["query-link", [app("query-link")]],
      ["query-link again", [app("query-link")]],
      ["local-storage", [app("local-storage"), "--report", reports.storing]],
      ["passing --site", [app("passing"), "--site", "/brueche/"]],
      ["on-lernapps --site", [app("on-lernapps"), "--site", "/brueche/"]],
    ];
    const results = await pooled(
      jobs.map(
        ([, args]) =>
          () =>
            checkAsync(...args),
      ),
    );
    for (const [index, [key]] of jobs.entries()) runs.set(key, results[index] as Result);
  }, SLOW);

  test("a passing app prints one line, exits 0, and --report writes its full report, with the measured fitness", () => {
    const result = ran("passing");
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
    const written = report({ code: 0, stdout: readFileSync(reports.passing, "utf8"), stderr: "" });
    expect(written.findings).toEqual([]);
    expect(written.checked["bundle"]).toBe(app("passing"));
    expect(written.rules).toEqual(
      expect.arrayContaining([
        "no-request-before-click",
        "no-tracking",
        "readable-without-javascript",
        "usable-at-360px",
        "accessible",
        "links-resolve",
      ]),
    );
    expect(written.fitness).toEqual({ storage: "none", thirdParty: "none" });
  });

  test.each(BROKEN)("the fixture %s breaks %s: exit 1 and a finding that names it", (name, rule, mention) => {
    const result = ran(name);
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, rule);
    expect(found.length, output(result)).toBeGreaterThan(0);
    expect(found[0]?.severity).toBe("error");
    expect(`${found[0]?.where} ${found[0]?.found}`).toContain(mention);
    // the other fixtures' rules stay quiet: one broken rule per fixture
    expect(new Set(report(result).findings.map((finding) => finding.rule))).toEqual(new Set([rule]));
  });

  test("the same input gives the same report", () => {
    expect(ran("broken-link again").stdout).toBe(ran("broken-link").stdout);
  });

  test("a link that only changes the query is the same page: the report does not depend on it", () => {
    // the start page links to itself with a random ?seed=, as a quiz does to start again
    const first = ran("query-link");
    expect(first.code, output(first)).toBe(1);
    expect(findingsOf(first, "no-request-before-click").map((finding) => finding.where)).toEqual(["index.html"]);
    expect(ran("query-link again").stdout).toBe(first.stdout);
  });

  test("an app that stores on the device is measured as storage: device", () => {
    const result = ran("local-storage");
    expect(result.code, output(result)).toBe(0);
    const written = parse(readFileSync(reports.storing, "utf8")) as Report;
    expect(written.fitness).toEqual({ storage: "device", thirdParty: "none" });
  });

  test("--site runs lernapps-check of the site frame: a page without imprint and privacy links fails", () => {
    const result = ran("passing --site");
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, "site-check");
    expect(found.map((finding) => finding.found).join("\n")).toContain("/imprint/");
  });

  test("--site with a page that links imprint and privacy passes", () => {
    const result = ran("on-lernapps --site");
    expect(result.code, output(result)).toBe(0);
  });

  test("a directory without index.html is a usage error", () => {
    const result = check(tempDir("empty"));
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("index.html");
  });
});

describe.skipIf(inner)("lernapps check on a URL, with --entry", () => {
  let server: Server | undefined;
  let url = "";
  let storing: Server | undefined;
  let storingUrl = "";

  beforeAll(async () => {
    ({ server, url } = await serve(app("passing")));
    ({ server: storing, url: storingUrl } = await serve(app("local-storage")));
  });
  afterAll(() => {
    server?.close();
    storing?.close();
  });

  const entry = (fields: { url: string; topics: string[]; storage: string }) => {
    const file = join(tempDir("entry"), "entry.yaml");
    const topics = fields.topics.map((path) => `  - title: Thema\n    path: ${path}\n`).join("");
    writeFileSync(
      file,
      `title: Brüche üben\nsubject: Mathematik\ngrades: [6]\nsummary: Brüche kürzen.\nurl: ${fields.url}\n` +
        `topics:\n${topics}creator:\n  name: Test\nfitness:\n  account: false\n  install: false\n` +
        `  storage: ${fields.storage}\n  thirdParty: none\n  checked: false\n`,
    );
    return file;
  };

  test(
    "a URL is checked like a bundle; the report names the URL and the time",
    { timeout: SLOW, concurrent: true },
    async () => {
      const file = join(tempDir("report"), "report.yaml");
      const result = await checkAsync(url, "--report", file);
      expect(result.code, output(result)).toBe(0);
      const written = parse(readFileSync(file, "utf8")) as Report;
      expect(written.checked["url"]).toBe(url);
      expect(written.checked["at"]).toMatch(/^\d{4}-\d\d-\d\dT/);
    },
  );

  test(
    "an entry whose URL and topics resolve and whose fitness matches passes",
    { timeout: SLOW, concurrent: true },
    async () => {
      const result = await checkAsync("--entry", entry({ url, topics: ["kuerzen/"], storage: "none" }));
      expect(result.code, output(result)).toBe(0);
    },
  );

  test("an entry with a broken topic link fails and names the topic", { timeout: SLOW, concurrent: true }, async () => {
    const result = await checkAsync("--entry", entry({ url, topics: ["kuerzen/", "erweitern/"], storage: "none" }));
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, "entry-links-resolve");
    expect(found).toHaveLength(1);
    expect(`${found[0]?.where} ${found[0]?.found}`).toContain("erweitern/");
  });

  test(
    "an entry that says storage: none for an app that stores on the device fails",
    { timeout: SLOW, concurrent: true },
    async () => {
      const result = await checkAsync("--entry", entry({ url: storingUrl, topics: ["kuerzen/"], storage: "none" }));
      expect(result.code, output(result)).toBe(1);
      const found = findingsOf(result, "entry-fitness-matches");
      expect(found[0]?.found).toContain("storage");
    },
  );
});
