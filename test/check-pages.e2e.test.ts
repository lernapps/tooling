// How far `lernapps check` visits a built app, end to end, on a tiny app of more pages than the limit of a check of
// an app on a URL, lowered for this test only (LERNAPPS_TEST_URL_PAGE_LIMIT, check/visit.ts urlPageLimit):
//   - a bundle is visited completely, beyond the limit: first the pages linked from the start page, then every other
//     .html file; a page no link from the start page reaches is an error of pages-reachable;
//   - 404.html at the root is no page and is not visited; a page marked noindex is checked, but need not be reached;
//   - on a URL the check stops at the limit and says so in a hint of pages-reachable: how many pages it checked,
//     that further pages were not visited; it fails nothing.
import { mkdirSync, writeFileSync } from "node:fs";
import type { Server } from "node:http";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { serve } from "../check/visit.ts";
import { findingsOf, output, report } from "./check-report.ts";
import { repoRoot, runAsync, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
/** The limit for this test: the app has more pages linked from its start page. */
const LIMIT = 3;
const PAGES = ["a", "b", "c", "d"];

/** A page, valid and accessible: its title as the heading, then `body`. */
const page = (title: string, body: string, head = "") =>
  `<!doctype html>\n<html lang="de">\n<head>\n  <meta charset="utf-8">\n` +
  `  <meta name="viewport" content="width=device-width, initial-scale=1">\n${head}  <title>${title}</title>\n` +
  `</head>\n<body>\n  <main>\n    <h1>${title}</h1>\n${body}  </main>\n</body>\n</html>\n`;
const link = (href: string, text: string) => `    <p><a href="${href}">${text}</a></p>\n`;

/**
 * The start page links to a/ ... d/, five pages in all. d/ (beyond the limit), verwaist/ (linked from nowhere) and
 * entwurf.html (marked noindex) each have a broken link: its finding shows that the page was visited. 404.html is no
 * page: its broken link shows that it was not visited.
 */
function tinyApp(): string {
  const dir = tempDir("pages");
  writeFileSync(join(dir, "index.html"), page("Start", PAGES.map((name) => link(`${name}/`, name)).join("")));
  for (const name of [...PAGES, "verwaist"]) {
    mkdirSync(join(dir, name));
    const broken = name === "d" || name === "verwaist" ? link("../fehlt/", "Fehlt") : "";
    writeFileSync(join(dir, name, "index.html"), page(name, `${broken}${link("../", "Start")}`));
  }
  writeFileSync(join(dir, "404.html"), page("Nicht gefunden", link("/fehlt/", "Fehlt")));
  const noindex = `  <meta name="robots" content="noindex">\n`;
  writeFileSync(join(dir, "entwurf.html"), page("Entwurf", link("fehlt/", "Fehlt"), noindex));
  return dir;
}

const check = (target: string) =>
  runAsync("node", [join(repoRoot, "src/cli.ts"), "check", target], repoRoot, {
    LERNAPPS_TEST_URL_PAGE_LIMIT: String(LIMIT),
  });

describe.skipIf(inner)("lernapps check on an app of more pages than the limit on a URL", () => {
  let server: Server | undefined;
  const runs: { bundle?: Result; url?: Result } = {};

  beforeAll(async () => {
    const bundle = tinyApp();
    const served = await serve(bundle, "/");
    server = served.server;
    [runs.bundle, runs.url] = await Promise.all([check(bundle), check(served.base)]);
  }, 60_000);
  afterAll(() => server?.close());

  test("a bundle is visited completely, beyond the limit; a page not linked from the start page is an error", () => {
    const result = runs.bundle as Result;
    expect(result.code, output(result)).toBe(1);
    const where = (rule: string) => findingsOf(result, rule).map((finding) => `${finding.severity} ${finding.where}`);
    // d/ is beyond the limit; verwaist/ and entwurf.html are linked from nowhere: all three were visited
    expect(where("links-resolve")).toEqual(["error d/index.html", "error entwurf.html", "error verwaist/index.html"]);
    // entwurf.html is marked noindex: no link needs to reach it; 404.html is no page and was not visited
    expect(where("pages-reachable")).toEqual(["error verwaist/index.html"]);
    expect(findingsOf(result, "pages-reachable")[0]?.found).toContain("unreachable from the start page");
    expect(new Set(report(result).findings.map((finding) => finding.rule))).toEqual(
      new Set(["links-resolve", "pages-reachable"]),
    );
  });

  test("on a URL the check stops at the limit and says so in a hint: how many it checked, that others were not visited", () => {
    const result = runs.url as Result;
    expect(result.code, output(result)).toBe(0);
    const found = findingsOf(result, "pages-reachable");
    expect(found, output(result)).toHaveLength(1);
    expect(found[0]?.severity).toBe("hint");
    // the start page, a/ and b/ were checked; c/ and d/ were not (d/'s broken link is not found)
    expect(found[0]?.found).toContain(`checked ${LIMIT} pages`);
    expect(found[0]?.found).toContain("2 further pages");
    expect(found[0]?.found).toContain("not visited");
    expect(report(result).findings).toHaveLength(1);
  });
});
