// The contract of `lernapps check` on an app, end to end: the real CLI on fixture apps, one passing and one per
// broken rule (test/fixtures/apps/), on a bundle, on a URL and in an app's repo.
//   - exit code 0 when no rule of severity error fails, 1 when one does;
//   - a passing check prints one line; otherwise the validation report in YAML, valid against its JSON Schema;
//   - every finding: rule id, severity, where, what was found, how to fix it, the link to the rule;
//   - `--entry <file>`: the app's URL and every topic link resolve, the fitness values match;
//   - `--site <path>`: the site rules, by lernapps-check of the site frame;
//   - in a repo: `--pre-push` builds, checks the built app, runs the Playwright tests and the dependency licences,
//     and counts a failed run in the plan's front matter.
import { cpSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, extname, join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { ok, repoRoot, run, runAsync, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 5 * 60 * 1000;
const RULES = "https://lernapps.net/tooling/rules/#";
const SCHEMA = join(repoRoot, "check/validation-report.v1.schema.json");

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;
const app = (name: string) => join(repoRoot, "test/fixtures/apps", name);
const cli = join(repoRoot, "src/cli.ts");
const lernapps = (args: readonly string[], cwd = repoRoot) => run("node", [cli, ...args], cwd);
/** `lernapps check` on a bundle, a URL or an entry, from the tooling's repo. */
const check = (...args: string[]) => lernapps(["check", ...args]);
const checkAsync = (...args: string[]) => runAsync("node", [cli, "check", ...args], repoRoot);

interface Finding {
  rule: string;
  severity: string;
  where: string;
  found: string;
  fix: string;
  link: string;
}
interface Report {
  checked: Record<string, string>;
  rules: string[];
  findings: Finding[];
  fitness?: Record<string, string>;
}

const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
  JSON.parse(readFileSync(SCHEMA, "utf8")) as object,
);

/** The report on standard output, validated against the published schema. */
function report(result: Result): Report {
  const value: unknown = parse(result.stdout);
  expect(validate(value), `${JSON.stringify(validate.errors)}\n${output(result)}`).toBe(true);
  return value as Report;
}

/** The findings of one rule; each has the shape every message has, with the link to its rule. */
function findingsOf(result: Result, rule: string): Finding[] {
  const found = report(result).findings.filter((finding) => finding.rule === rule);
  for (const finding of found) {
    expect(finding.link).toBe(`${RULES}${rule}`);
    for (const key of ["severity", "where", "found", "fix"] as const) expect(finding[key], key).not.toBe("");
  }
  return found;
}

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

describe.skipIf(inner)("lernapps check on a built app", () => {
  test("a passing app prints one line and exits 0", { timeout: SLOW }, () => {
    const result = check(app("passing"));
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
  });

  test("--report writes the full report of a passing app, with the measured fitness", { timeout: SLOW }, () => {
    const file = join(tempDir("report"), "report.yaml");
    const result = check(app("passing"), "--report", file);
    expect(result.code, output(result)).toBe(0);
    const written = report({ code: 0, stdout: readFileSync(file, "utf8"), stderr: "" });
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

  test.each([
    ["request-before-click", "no-request-before-click", "fonts.example.org"],
    ["cookie", "no-tracking", "besuch"],
    ["no-javascript", "readable-without-javascript", "index.html"],
    ["overflow", "usable-at-360px", "index.html"],
    ["inaccessible", "accessible", "img"],
    ["broken-link", "links-resolve", "erweitern/"],
  ])("the fixture %s breaks %s: exit 1 and a finding that names it", { timeout: SLOW }, (name, rule, mention) => {
    const result = check(app(name));
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, rule);
    expect(found.length, output(result)).toBeGreaterThan(0);
    expect(found[0]?.severity).toBe("error");
    expect(`${found[0]?.where} ${found[0]?.found}`).toContain(mention);
    // the other fixtures' rules stay quiet: one broken rule per fixture
    expect(new Set(report(result).findings.map((finding) => finding.rule))).toEqual(new Set([rule]));
  });

  test("the same input gives the same report", { timeout: SLOW }, () => {
    const first = check(app("broken-link"));
    const second = check(app("broken-link"));
    expect(second.stdout).toBe(first.stdout);
  });

  test("an app that stores on the device is measured as storage: device", { timeout: SLOW }, () => {
    const file = join(tempDir("report"), "report.yaml");
    const result = check(app("local-storage"), "--report", file);
    expect(result.code, output(result)).toBe(0);
    const written = parse(readFileSync(file, "utf8")) as Report;
    expect(written.fitness).toEqual({ storage: "device", thirdParty: "none" });
  });

  test(
    "--site runs lernapps-check of the site frame: a page without imprint and privacy links fails",
    {
      timeout: SLOW,
    },
    () => {
      const result = check(app("passing"), "--site", "/brueche/");
      expect(result.code, output(result)).toBe(1);
      const found = findingsOf(result, "site-check");
      expect(found.map((finding) => finding.found).join("\n")).toContain("/imprint/");
    },
  );

  test("--site with a page that links imprint and privacy passes", { timeout: SLOW }, () => {
    const result = check(app("on-lernapps"), "--site", "/brueche/");
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

  test("a URL is checked like a bundle; the report names the URL and the time", { timeout: SLOW }, async () => {
    const file = join(tempDir("report"), "report.yaml");
    const result = await checkAsync(url, "--report", file);
    expect(result.code, output(result)).toBe(0);
    const written = parse(readFileSync(file, "utf8")) as Report;
    expect(written.checked["url"]).toBe(url);
    expect(written.checked["at"]).toMatch(/^\d{4}-\d\d-\d\dT/);
  });

  test("an entry whose URL and topics resolve and whose fitness matches passes", { timeout: SLOW }, async () => {
    const result = await checkAsync("--entry", entry({ url, topics: ["kuerzen/"], storage: "none" }));
    expect(result.code, output(result)).toBe(0);
  });

  test("an entry with a broken topic link fails and names the topic", { timeout: SLOW }, async () => {
    const result = await checkAsync("--entry", entry({ url, topics: ["kuerzen/", "erweitern/"], storage: "none" }));
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, "entry-links-resolve");
    expect(found).toHaveLength(1);
    expect(`${found[0]?.where} ${found[0]?.found}`).toContain("erweitern/");
  });

  test("an entry that says storage: none for an app that stores on the device fails", { timeout: SLOW }, async () => {
    const result = await checkAsync("--entry", entry({ url: storingUrl, topics: ["kuerzen/"], storage: "none" }));
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, "entry-fitness-matches");
    expect(found[0]?.found).toContain("storage");
  });
});

/**
 * An app's repo: the fixture's built files as its source (index.html), the toolchain from the tooling's own
 * node_modules (linked), a plan file, and the files given. `git init` so the report names a commit.
 */
function project(files: Record<string, string>, source = app("passing")): string {
  const dir = tempDir("app");
  cpSync(source, dir, { recursive: true });
  mkdirSync(join(dir, "node_modules"));
  for (const name of readdirSync(join(repoRoot, "node_modules"))) {
    symlinkSync(join(repoRoot, "node_modules", name), join(dir, "node_modules", name));
  }
  const all: Record<string, string> = {
    "package.json": `${JSON.stringify({ name: "app", private: true, type: "module" }, null, 2)}\n`,
    "vite.config.ts": [
      'import { defineConfig } from "vite-plus";',
      "",
      "export default defineConfig({",
      '  build: { rollupOptions: { input: ["index.html", "kuerzen/index.html"] } },',
      "});",
      "",
    ].join("\n"),
    ".vibe/plan.md": "---\narchetype: quiz\nphase: code\nprePushFailures: 0\n---\n\n# Plan\n",
    ...files,
  };
  for (const [file, content] of Object.entries(all)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  writeFileSync(join(dir, ".gitignore"), "node_modules/\ndist/\n");
  ok(join(dir, "node_modules", ".bin", "vp"), ["fmt"], dir); // the fixture's pages as the app's formatted source
  ok("git", ["init", "--quiet", "--initial-branch=main"], dir);
  ok("git", ["add", "--all"], dir);
  ok("git", ["commit", "--quiet", "--no-verify", "--message", "app"], dir);
  return dir;
}

const failures = (dir: string) => /prePushFailures: (\d+)/.exec(readFileSync(join(dir, ".vibe/plan.md"), "utf8"))?.[1];

describe.skipIf(inner)("lernapps check in an app's repo", () => {
  test("--pre-push builds and checks the built app; passing, it prints one line", { timeout: SLOW }, () => {
    const dir = project({});
    const result = lernapps(["check", "--pre-push"], dir);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
    expect(failures(dir)).toBe("0");
  });

  test(
    "a failed --pre-push reports the built app's finding and counts the failure in the plan",
    {
      timeout: SLOW,
    },
    () => {
      const dir = project({}, app("request-before-click"));
      const result = lernapps(["check", "--pre-push"], dir);
      expect(result.code, output(result)).toBe(1);
      expect(findingsOf(result, "no-request-before-click").length).toBeGreaterThan(0);
      expect(report(result).checked["commit"]).toMatch(/^[0-9a-f]{40}$/);
      expect(failures(dir)).toBe("1");
      lernapps(["check", "--pre-push"], dir);
      expect(failures(dir)).toBe("2");
    },
  );

  test(
    "the fast part does not build and does not count; without a flag a failure is not counted",
    {
      timeout: SLOW,
    },
    () => {
      const dir = project({}, app("request-before-click"));
      const fast = lernapps(["check", "--pre-commit"], dir);
      expect(fast.code, output(fast)).toBe(0);
      expect(readdirSync(dir)).not.toContain("dist");
      const all = lernapps(["check"], dir);
      expect(all.code, output(all)).toBe(1);
      expect(failures(dir)).toBe("0");
    },
  );

  test("a failing Playwright test turns --pre-push red, with a finding that names the step", { timeout: SLOW }, () => {
    const dir = project({
      "playwright.config.ts": [
        'import { defineConfig } from "playwright/test";',
        "",
        "export default defineConfig({",
        '  testDir: "e2e",',
        '  testMatch: "*.e2e.ts",',
        '  use: { baseURL: "http://127.0.0.1:4179/" },',
        '  webServer: { command: "vp preview --port 4179 --strictPort", url: "http://127.0.0.1:4179/" },',
        "});",
        "",
      ].join("\n"),
      "e2e/start.e2e.ts": [
        'import { expect, test } from "playwright/test";',
        "",
        'test("the start page names the planted topic", async ({ page }) => {',
        '  await page.goto("/");',
        '  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Brüche erweitern");',
        "});",
        "",
      ].join("\n"),
    });
    const result = lernapps(["check", "--pre-push"], dir);
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, "checks-pass");
    expect(found.map((finding) => finding.where)).toContain("playwright test");
    expect(result.stderr).toContain("Brüche erweitern");
  });

  test("a dependency with a licence outside the allowlist turns --pre-push red", { timeout: SLOW }, () => {
    const dir = project({
      "package.json": `${JSON.stringify({ name: "app", private: true, type: "module", dependencies: { "copyleft-lib": "1.0.0" } }, null, 2)}\n`,
      "node_modules/copyleft-lib/package.json": `${JSON.stringify({ name: "copyleft-lib", version: "1.0.0", license: "GPL-3.0-only" })}\n`,
    });
    const result = lernapps(["check", "--pre-push"], dir);
    expect(result.code, output(result)).toBe(1);
    const found = findingsOf(result, "dependency-licence");
    expect(found).toHaveLength(1);
    expect(`${found[0]?.where} ${found[0]?.found}`).toContain("copyleft-lib");
    expect(found[0]?.found).toContain("GPL-3.0-only");
  });
});
