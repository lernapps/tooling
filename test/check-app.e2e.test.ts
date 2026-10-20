// The contract of `lernapps check` on a built app, end to end: the real CLI on fixture apps, one passing and one per
// broken rule (test/fixtures/apps/), on a bundle and on a URL, without the app's repo. Fast enough for every push.
//   - exit code 0 when no rule of severity error fails, 1 when one does;
//   - a passing check prints one line; otherwise the validation report in YAML, valid against its JSON Schema;
//   - every finding: rule id, severity, where, what was found, how to fix it, the link to the rule;
//   - `--entry <file>`: the app's URL and every topic link resolve, the fitness values match;
//   - a link whose server answers 429 (rate limited) fails nothing: after a short, bounded backoff it is a finding of
//     severity hint that names the link and why it could not be checked;
//   - no site rules: an app's pages need not be readable without JavaScript, except the pages the explainer runtime
//     marks as its own (<meta name="lernapps-archetype" content="explainer">): only those are visited a second time,
//     without JavaScript, by explainer-readable-without-js; an app without the marker pays no extra visit;
//   - an entry's topic `<page>#<section>` must name an element id of that page.
// In an app's repo: check-repo.e2e.test.ts. How far it visits (the limit on a URL): check-pages.e2e.test.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { app, check, checkAsync, findingsOf, output, report, type Report } from "./check-report.ts";
import { repoRoot, runAsync, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
// The pre-push hook (scripts/pre-push.ts) sets LERNAPPS_PRE_PUSH=1. The test of a browser that cannot start is skipped
// there on purpose: starting and refusing Playwright's browser takes longer than its 5 s under the hook's load (the
// whole suite runs in parallel) and failed pushes that did not touch it. CI and every other run play it.
const inHook = process.env["LERNAPPS_PRE_PUSH"] === "1";
const SLOW = 5 * 60 * 1000;

const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml" };

/**
 * Serves a fixture app at http://127.0.0.1:<port>/, as a host would. The paths in `limited` answer 429 Too Many
 * Requests with a Retry-After of an hour, as a rate-limited host does; each request for them is counted in `asked`.
 * What the browser of the check asks for is listed in `browsed`.
 */
async function serve(
  dir: string,
  limited: readonly string[] = [],
  asked: string[] = [],
  /** Every request a browser made (not the check's own fetch of a link's status), by path. */
  browsed: string[] = [],
): Promise<{ server: Server; url: string }> {
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    if ((request.headers["user-agent"] ?? "").includes("Chrome")) browsed.push(path);
    if (limited.includes(path)) {
      asked.push(path);
      response.writeHead(429, { "retry-after": "3600", "content-type": "text/plain" }).end("too many requests");
      return;
    }
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
  ["overflow", "usable-at-360px", "index.html"],
  ["inaccessible", "accessible", "img"],
  ["broken-link", "links-resolve", "erweitern/"],
] as const;

describe.skipIf(inner)("lernapps check on a built app", () => {
  // Every check of a bundle is independent of the others: they run at the same time, once each, before the tests.
  const runs = new Map<string, Result>();
  const reports = { passing: "", storing: "", explainer: "" };
  const ran = (key: string): Result => {
    const result = runs.get(key);
    if (result === undefined) throw new Error(`no run ${key}`);
    return result;
  };

  beforeAll(async () => {
    reports.passing = join(tempDir("report"), "report.yaml");
    reports.storing = join(tempDir("report"), "report.yaml");
    reports.explainer = join(tempDir("report"), "report.yaml");
    const jobs: [string, string[]][] = [
      ["passing", [app("passing"), "--report", reports.passing]],
      ...BROKEN.map(([name]): [string, string[]] => [name, [app(name)]]),
      ["broken-link again", [app("broken-link")]],
      ["query-link", [app("query-link")]],
      ["query-link again", [app("query-link")]],
      ["local-storage", [app("local-storage"), "--report", reports.storing]],
      ["no-javascript", [app("no-javascript")]],
      ["explainer", [app("explainer"), "--report", reports.explainer]],
      ["explainer-broken", [app("explainer-broken")]],
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
        "usable-at-360px",
        "accessible",
        "links-resolve",
      ]),
    );
    expect(written.rules).not.toContain("readable-without-javascript");
    // no page carries the explainer's marker: the check without JavaScript has nothing to check
    expect(written.rules).not.toContain("explainer-readable-without-js");
    expect(written.rules).not.toContain("site-check");
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

  test("an app whose page shows nothing without JavaScript passes: that is a rule of the site, not of apps", () => {
    const result = ran("no-javascript");
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
  });

  test("an explainer bundle passes: two language trees, chapter pages and the glossary are reachable, and each page reads without JavaScript", () => {
    const result = ran("explainer");
    expect(result.code, output(result)).toBe(0);
    const written = report({ code: 0, stdout: readFileSync(reports.explainer, "utf8"), stderr: "" });
    expect(written.findings).toEqual([]);
    expect(written.rules).toEqual(expect.arrayContaining(["explainer-readable-without-js", "pages-reachable"]));
  });

  // explainer-broken: its start page is empty without JavaScript; its content page has an empty nojs text and Lösung
  const broken = () => findingsOf(ran("explainer-broken"), "explainer-readable-without-js");

  test("an explainer page that is empty without JavaScript fails explainer-readable-without-js", () => {
    const result = ran("explainer-broken");
    expect(result.code, output(result)).toBe(1);
    const page = broken().filter((finding) => finding.where === "index.html");
    expect(page, output(result)).toHaveLength(1);
    expect(page[0]?.severity).toBe("error");
    expect(page[0]?.found).toContain("no h1 heading");
    // the only rule it breaks
    expect(new Set(report(result).findings.map((finding) => finding.rule))).toEqual(
      new Set(["explainer-readable-without-js"]),
    );
  });

  test("an empty nojs text of a component and an empty Lösung fail explainer-readable-without-js", () => {
    const found = broken()
      .filter((finding) => finding.where !== "index.html")
      .map((finding) => `${finding.where}: ${finding.found}`);
    expect(found).toEqual([
      "bruch/kuerzen/index.html component FarbStreifen in #uebung: the component's nojs text is empty, or hidden, without JavaScript",
      "bruch/kuerzen/index.html exercise #kuerzen-4-8: the Lösung is empty without JavaScript",
    ]);
  });

  test.skipIf(inHook)(
    "where no browser can start, the app could not be checked: one finding of app-checkable",
    { timeout: SLOW },
    async () => {
      // no Chromium in the browser folder, none to fall back to, and the download refused at once
      const result = await runAsync("node", [join(repoRoot, "src/cli.ts"), "check", app("passing")], repoRoot, {
        PLAYWRIGHT_BROWSERS_PATH: tempDir("no-browsers"),
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1",
        PLAYWRIGHT_DOWNLOAD_HOST: "http://127.0.0.1:9",
      });
      expect(result.code, output(result)).toBe(1);
      const [finding, ...more] = findingsOf(result, "app-checkable");
      expect(more).toEqual([]);
      expect(finding).toMatchObject({ severity: "error", where: "browser" });
      expect(finding?.found).toMatch(/^no browser can run here: /);
      expect(finding?.fix).toContain("https://github.com/lernapps/tooling/issues");
      expect(findingsOf(result, "checks-pass")).toEqual([]);
      expect(report(result).rules).toContain("app-checkable");
    },
  );

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
  let limited: Server | undefined;
  let limitedUrl = "";
  const limitedAsked: string[] = [];
  // the explainer fixture and an app without the marker, each on a server that lists what the browser asks for
  const counted: { servers: Server[]; explainer: string; plain: string; browsed: Record<string, string[]> } = {
    servers: [],
    explainer: "",
    plain: "",
    browsed: { explainer: [], plain: [] },
  };

  beforeAll(async () => {
    ({ server, url } = await serve(app("passing")));
    ({ server: storing, url: storingUrl } = await serve(app("local-storage")));
    ({ server: limited, url: limitedUrl } = await serve(app("passing"), ["/kuerzen/"], limitedAsked));
    for (const [key, name] of [
      ["explainer", "explainer"],
      ["plain", "passing"],
    ] as const) {
      const served = await serve(app(name), [], [], counted.browsed[key]);
      counted.servers.push(served.server);
      counted[key] = served.url;
    }
  });
  afterAll(() => {
    server?.close();
    storing?.close();
    limited?.close();
    for (const served of counted.servers) served.close();
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

  // One check of the explainer fixture on a URL, with an entry whose topics name sections, present and missing, and one
  // of an app without the marker (also the check of a URL like a bundle); each on its own server, whose list of what the browser asked for shows the visits.
  let explainerRuns: Promise<{ marked: Result; plain: Result; plainReport: string }> | undefined;
  const explainerRun = () =>
    (explainerRuns ??= (async () => {
      const topics = [
        "bruch/kuerzen/#regel",
        "bruch/kuerzen/#regel/beispiel",
        "en/bruch/kuerzen/#uebung",
        "glossar/",
        "bruch/kuerzen/#fehlt",
      ];
      const plainReport = join(tempDir("report"), "report.yaml");
      const [marked, plain] = await Promise.all([
        checkAsync("--entry", entry({ url: counted.explainer, topics, storage: "none" })),
        checkAsync(counted.plain, "--report", plainReport),
      ]);
      return { marked, plain, plainReport };
    })());

  test(
    "a URL is checked like a bundle; the report names the URL and the time",
    { timeout: SLOW, concurrent: true },
    async () => {
      const { plain, plainReport } = await explainerRun();
      expect(plain.code, output(plain)).toBe(0);
      const written = parse(readFileSync(plainReport, "utf8")) as Report;
      expect(written.checked["url"]).toBe(counted.plain);
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
    "on a URL, each explainer page is visited once more, without JavaScript; an app without the marker is not",
    { timeout: SLOW, concurrent: true },
    async () => {
      const { marked } = await explainerRun();
      expect(report(marked).rules).toContain("explainer-readable-without-js");
      expect(findingsOf(marked, "explainer-readable-without-js")).toEqual([]);
      // how often the browser opened each page (a folder's index.html): twice when marked, else once
      const visits = (paths: string[]) => {
        const count: Record<string, number> = {};
        for (const path of paths.filter((path) => path.endsWith("/"))) count[path] = (count[path] ?? 0) + 1;
        return count;
      };
      const pages = ["/", "/bruch/", "/bruch/kuerzen/", "/glossar/"].flatMap((path) => [path, `/en${path}`]);
      expect(visits(counted.browsed["explainer"] ?? [])).toEqual(Object.fromEntries(pages.map((path) => [path, 2])));
      expect(visits(counted.browsed["plain"] ?? [])).toEqual({ "/": 1, "/kuerzen/": 1 });
    },
  );

  test(
    "an entry's topic #<section> or #<section>/<sub> must be an element id of its page: a missing one fails and is named",
    { timeout: SLOW, concurrent: true },
    async () => {
      const { marked } = await explainerRun();
      expect(marked.code, output(marked)).toBe(1);
      // the four topics whose page and section exist pass; only the missing section is a finding
      expect(report(marked).findings, output(marked)).toHaveLength(1);
      const found = findingsOf(marked, "entry-links-resolve");
      expect(found).toHaveLength(1);
      expect(found[0]?.where).toContain("topics[4]");
      expect(found[0]?.found).toContain("#fehlt");
      expect(found[0]?.found).toContain('no element with the id "fehlt"');
    },
  );

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

  test(
    "a link whose server answers 429 is not checked, says so as a hint, and fails nothing, without waiting long",
    { timeout: SLOW, concurrent: true },
    async () => {
      const start = Date.now();
      const result = await checkAsync("--entry", entry({ url: limitedUrl, topics: ["kuerzen/"], storage: "none" }));
      // the server asks to come back in an hour; the check backs off briefly, a bounded number of times
      expect(Date.now() - start).toBeLessThan(60_000);
      expect(limitedAsked.length).toBeGreaterThanOrEqual(4);
      expect(limitedAsked.length).toBeLessThanOrEqual(8);
      expect(result.code, output(result)).toBe(0);
      for (const rule of ["links-resolve", "entry-links-resolve"]) {
        const found = findingsOf(result, rule);
        expect(found, `${rule}\n${output(result)}`).toHaveLength(1);
        expect(found[0]?.severity).toBe("hint");
        expect(found[0]?.found).toContain("kuerzen/");
        expect(found[0]?.found).toContain("could not be checked");
        expect(found[0]?.found).toContain("429");
        expect(found[0]?.fix).toContain("again later");
      }
      expect(report(result).findings.every((finding) => finding.severity === "hint")).toBe(true);
    },
  );
});
