// The checks of an explainer in format 2 against the learning map, as `lernapps check` runs them in an app's repo:
// one-competency-per-page (a hint for every page with more than one competency) and competencies-on-map (the strand
// and the page competencies on the subject's map, loaded from LERNAPPS_TEST_MAP_URL: here a local server with a fixture
// map; a map that cannot be loaded is one hint, never more). On files alone, without installing or building anything.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import onePerPage from "../check/rules/one-competency-per-page.ts";
import onMap from "../check/rules/competencies-on-map.ts";
import { mapUrl, readExplainer } from "../check/explainer-map.ts";
import type { Problem } from "../check/check.ts";
import { repoRoot, tempDir } from "./support.ts";

const MAP = readFileSync(join(repoRoot, "test/fixtures/map/mathematik.json"), "utf8");

/** An explainer's repo: src/app.yaml with the strand, one chapter "kapitel" with the pages given (id → competencies). */
function explainer(strand: string | undefined, pages: Record<string, string[] | undefined>, format = 2): string {
  const dir = tempDir("explainer-map");
  const files: Record<string, string> = {
    "src/app.yaml": [
      "# yaml-language-server: $schema=../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v2.schema.json",
      ...(format === 2 ? ["format: 2"] : []),
      ...(strand === undefined ? [] : [`strand: ${strand}`]),
      "title: Test",
      "intro: Ein Test.",
      "languages: [de]",
      "chapters: [kapitel]",
      "",
    ].join("\n"),
    "src/kapitel/chapter.yaml": `title: Kapitel\npages: [${Object.keys(pages).join(", ")}]\n`,
  };
  for (const [page, competencies] of Object.entries(pages)) {
    files[`src/kapitel/${page}.yaml`] = [
      `title: ${page}`,
      ...(competencies === undefined ? [] : [`competencies: [${competencies.join(", ")}]`]),
      "blocks: []",
      "",
    ].join("\n");
  }
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  return dir;
}

const hints = (project: string) => onePerPage.run({ project }) as Problem[] | undefined;
const onMapOf = async (project: string) => (await onMap.run({ project })) as Problem[] | undefined;

let server: Server;
let previous: string | undefined;

beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === "/map/mathematik.json") {
      response.writeHead(200, { "content-type": "application/json" }).end(MAP);
    } else if (request.url === "/map/kaputt.json") {
      response.writeHead(200, { "content-type": "application/json" }).end("{ nicht json");
    } else {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  previous = process.env["LERNAPPS_TEST_MAP_URL"];
  process.env["LERNAPPS_TEST_MAP_URL"] = `http://127.0.0.1:${(server.address() as AddressInfo).port}/map/`;
});

afterAll(async () => {
  if (previous === undefined) delete process.env["LERNAPPS_TEST_MAP_URL"];
  else process.env["LERNAPPS_TEST_MAP_URL"] = previous;
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe("an explainer in format 2", () => {
  test("is read with its strand and every page's competencies, at their lines; format 1 and other apps are none", () => {
    const dir = explainer("mathematik/stochastik", { laplace: ["laplace"], baum: ["baumdiagramm"] });
    expect(readExplainer(dir)).toEqual({
      strand: "mathematik/stochastik",
      strandAt: "src/app.yaml:3",
      pages: [
        { where: "src/kapitel/laplace.yaml:2", competencies: ["laplace"] },
        { where: "src/kapitel/baum.yaml:2", competencies: ["baumdiagramm"] },
      ],
    });
    expect(readExplainer(explainer(undefined, { seite: undefined }, 1))).toBeUndefined();
    expect(readExplainer(tempDir("no-app"))).toBeUndefined();
  });

  test("the map's address is lernapps.net unless LERNAPPS_TEST_MAP_URL names another", () => {
    expect(mapUrl("mathematik", {})).toBe("https://lernapps.net/apps/map/mathematik.json");
    expect(mapUrl("physik", { LERNAPPS_TEST_MAP_URL: "http://localhost:1/m" })).toBe(
      "http://localhost:1/m/physik.json",
    );
  });
});

describe("one-competency-per-page", () => {
  test("checks nothing without an explainer in format 2", () => {
    expect(hints(tempDir("no-app"))).toBeUndefined();
    expect(hints(explainer(undefined, { seite: undefined }, 1))).toBeUndefined();
  });

  test("a page per competency passes, also several pages for one competency and pages without any", () => {
    expect(hints(explainer("mathematik/stochastik", { a: ["laplace"], b: ["laplace"] }))).toEqual([]);
    expect(hints(explainer("none", { a: undefined }))).toEqual([]);
  });

  test("a page with two competencies is a hint that names the page and both ids", () => {
    const problems = hints(explainer("mathematik/stochastik", { a: ["laplace"], b: ["laplace", "baumdiagramm"] }));
    expect(problems).toEqual([
      expect.objectContaining({
        where: "src/kapitel/b.yaml:2",
        found: "the page names 2 competencies (laplace, baumdiagramm)",
      }),
    ]);
    expect(onePerPage.severity).toBe("hint");
  });
});

describe("competencies-on-map", () => {
  test("checks nothing without an explainer in format 2, or with strand none", async () => {
    expect(await onMapOf(tempDir("no-app"))).toBeUndefined();
    expect(await onMapOf(explainer(undefined, { seite: undefined }, 1))).toBeUndefined();
    expect(await onMapOf(explainer("none", { seite: undefined }))).toBeUndefined();
  });

  test("a strand of the map with its own competencies passes", async () => {
    const dir = explainer("mathematik/stochastik", { a: ["haeufigkeiten"], b: ["laplace", "baumdiagramm"] });
    expect(await onMapOf(dir)).toEqual([]);
  });

  test("an unknown id and an id of another strand are warnings at the page", async () => {
    const problems = await onMapOf(
      explainer("mathematik/stochastik", { a: ["laplace"], b: ["erfunden"], c: ["prozent-prozentwert"] }),
    );
    expect(problems?.map(({ where, found, severity }) => ({ where, found, severity }))).toEqual([
      {
        where: "src/kapitel/b.yaml:2",
        found: "the competency erfunden is not on the map of mathematik",
        severity: undefined,
      },
      {
        where: "src/kapitel/c.yaml:2",
        found:
          "the competency prozent-prozentwert belongs to the strand mathematik/arithmetik, not to the app's strand mathematik/stochastik",
        severity: undefined,
      },
    ]);
    expect(problems?.[0]?.fix).toContain("lernapps/apps (map/mathematik.yaml)");
    expect(onMap.severity).toBe("warning");
  });

  test("a strand the map lacks is a warning at the strand", async () => {
    const problems = await onMapOf(explainer("mathematik/geometrie", { a: ["laplace"] }));
    expect(problems).toEqual([
      expect.objectContaining({
        where: "src/app.yaml:3",
        found: "the strand mathematik/geometrie is not on the map of mathematik (its strands: stochastik, arithmetik)",
      }),
    ]);
  });

  test("a map that does not exist or cannot be read is one hint that it could not check, never a warning", async () => {
    for (const strand of ["physik/mechanik", "kaputt/teil"]) {
      const problems = await onMapOf(explainer(strand, { a: ["kraft"], b: ["masse"] }));
      expect(problems, strand).toHaveLength(1);
      expect(problems?.[0]).toEqual(expect.objectContaining({ where: "src/app.yaml:3", severity: "hint" }));
      expect(problems?.[0]?.found).toMatch(/could not be checked/);
    }
  });

  test("without network: one hint, never a warning", async () => {
    const saved = process.env["LERNAPPS_TEST_MAP_URL"];
    process.env["LERNAPPS_TEST_MAP_URL"] = "http://127.0.0.1:1/map/"; // nothing listens on port 1
    try {
      const problems = await onMapOf(explainer("mathematik/stochastik", { a: ["laplace"] }));
      expect(problems).toEqual([expect.objectContaining({ severity: "hint" })]);
      expect(problems?.[0]?.found).toMatch(/could not be reached/);
    } finally {
      process.env["LERNAPPS_TEST_MAP_URL"] = saved;
    }
  });
});
