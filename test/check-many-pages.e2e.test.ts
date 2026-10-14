// How far `lernapps check` visits a built app, end to end, on a generated app of more pages than a check of an app on
// a URL visits (100):
//   - a bundle is visited completely, however many pages it has: first the pages linked from the start page, then
//     every other .html file; a page no link from the start page reaches is an error of pages-reachable;
//   - 404.html at the root is no page and is not visited; a page marked noindex is checked, but need not be reached;
//   - on a URL the check stops after 100 pages and says so in a hint of pages-reachable: how many pages it checked,
//     that further pages were not visited; it fails nothing.
// Heavy (scripts/pre-push.ts): each check opens more than 100 pages.
import { mkdirSync, writeFileSync } from "node:fs";
import type { Server } from "node:http";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { serve } from "../check/visit.ts";
import { checkAsync, findingsOf, output, report } from "./check-report.ts";
import { tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 5 * 60 * 1000;
/** More pages than a check of an app on a URL visits. */
const MANY = 120;

/** A page of the app, valid and accessible: its title as the heading, then `body`. */
const page = (title: string, body: string, head = "") =>
  `<!doctype html>\n<html lang="de">\n<head>\n  <meta charset="utf-8">\n` +
  `  <meta name="viewport" content="width=device-width, initial-scale=1">\n${head}  <title>${title}</title>\n` +
  `</head>\n<body>\n  <main>\n    <h1>${title}</h1>\n${body}  </main>\n</body>\n</html>\n`;
const link = (href: string, text: string) => `    <p><a href="${href}">${text}</a></p>\n`;

/**
 * A built app of MANY pages: the start page links to seite-001/ ... seite-119/, each links back. The last one, the
 * page verwaist/, which no page links to, and entwurf.html, marked noindex, each have a broken link: its finding
 * shows that the page was visited. 404.html is no page: its broken link shows that it was not visited.
 */
function manyPages(): string {
  const dir = tempDir("many-pages");
  const names = Array.from({ length: MANY - 1 }, (_, index) => `seite-${String(index + 1).padStart(3, "0")}`);
  writeFileSync(join(dir, "index.html"), page("Viele Seiten", names.map((name) => link(`${name}/`, name)).join("")));
  for (const name of names) {
    mkdirSync(join(dir, name));
    const broken = name === names.at(-1) ? link("../fehlt/", "Fehlt") : "";
    writeFileSync(join(dir, name, "index.html"), page(name, `${broken}${link("../", "Start")}`));
  }
  mkdirSync(join(dir, "verwaist"));
  writeFileSync(join(dir, "verwaist", "index.html"), page("Verwaist", link("../fehlt/", "Fehlt")));
  writeFileSync(join(dir, "404.html"), page("Nicht gefunden", link("/fehlt/", "Fehlt")));
  const noindex = `  <meta name="robots" content="noindex">\n`;
  writeFileSync(join(dir, "entwurf.html"), page("Entwurf", link("fehlt/", "Fehlt"), noindex));
  return dir;
}

describe.skipIf(inner)("lernapps check on an app of more than 100 pages", () => {
  let server: Server | undefined;
  const runs: { bundle?: Result; url?: Result } = {};

  beforeAll(async () => {
    const bundle = manyPages();
    const served = await serve(bundle, "/");
    server = served.server;
    [runs.bundle, runs.url] = await Promise.all([checkAsync(bundle), checkAsync(served.base)]);
  }, SLOW);
  afterAll(() => server?.close());

  test("a bundle is visited completely; a page not linked from the start page is an error", () => {
    const result = runs.bundle as Result;
    expect(result.code, output(result)).toBe(1);
    const where = (rule: string) => findingsOf(result, rule).map((finding) => `${finding.severity} ${finding.where}`);
    // seite-119/ is the 120th page; verwaist/ and entwurf.html are linked from nowhere: all three were visited
    expect(where("links-resolve")).toEqual([
      "error entwurf.html",
      "error seite-119/index.html",
      "error verwaist/index.html",
    ]);
    // entwurf.html is marked noindex: no link needs to reach it; 404.html is no page and was not visited
    expect(where("pages-reachable")).toEqual(["error verwaist/index.html"]);
    expect(findingsOf(result, "pages-reachable")[0]?.found).toContain("unreachable from the start page");
    expect(new Set(report(result).findings.map((finding) => finding.rule))).toEqual(
      new Set(["links-resolve", "pages-reachable"]),
    );
  });

  test("on a URL the check stops after 100 pages and says so in a hint: how many it checked, that others were not visited", () => {
    const result = runs.url as Result;
    expect(result.code, output(result)).toBe(0);
    const found = findingsOf(result, "pages-reachable");
    expect(found, output(result)).toHaveLength(1);
    expect(found[0]?.severity).toBe("hint");
    // the start page and seite-001/ ... seite-099/ were checked; seite-100/ ... seite-119/ were not
    expect(found[0]?.found).toContain("checked 100 pages");
    expect(found[0]?.found).toContain("20 further pages");
    expect(found[0]?.found).toContain("not visited");
    expect(report(result).findings).toHaveLength(1);
  });
});
