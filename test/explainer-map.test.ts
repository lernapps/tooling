// The checks of an explainer in format 2 against the learning map, as `lernapps check` runs them in an app's repo:
// one-competency-per-page (a hint for every page with more than one competency), competencies-on-map (the strand or
// subject, the page competencies and the recap pages on the subject's map; a unit app with `subject` only in a subject
// with explainerFocus competency, one strand per page) and prerequisites-in-order (each prerequisite practised or
// recapped before, or linked: order, gap, entry), the maps loaded from LERNAPPS_TEST_MAP_URL (here a local server with
// the fixture maps, mathematik without explainerFocus as an older map, franzoesisch with competency, or the fixtures'
// directory on disk; a map that cannot be loaded is one hint, never more). On files alone, without installing or
// building anything.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import onePerPage from "../check/rules/one-competency-per-page.ts";
import onMap from "../check/rules/competencies-on-map.ts";
import inOrder from "../check/rules/prerequisites-in-order.ts";
import { loadMap, mapUrl, readExplainer } from "../check/explainer-map.ts";
import type { Problem } from "../check/check.ts";
import { repoRoot, tempDir } from "./support.ts";

const MAPS: Record<string, string> = Object.fromEntries(
  ["mathematik", "franzoesisch"].map((subject) => [
    `/map/${subject}.json`,
    readFileSync(join(repoRoot, `test/fixtures/map/${subject}.json`), "utf8"),
  ]),
);

/**
 * An explainer's repo: src/app.yaml with the strand (or `{ subject }` for a unit app), one chapter "kapitel" with the
 * pages given (id → competencies, or the lines of the page after its title as a string, e.g. a recap page).
 */
function explainer(
  strand: string | { subject: string } | undefined,
  pages: Record<string, string[] | string | undefined>,
  format = 2,
): string {
  const dir = tempDir("explainer-map");
  const files: Record<string, string> = {
    "src/app.yaml": [
      "# yaml-language-server: $schema=../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v2.schema.json",
      ...(format === 2 ? ["format: 2"] : []),
      ...(strand === undefined
        ? []
        : [typeof strand === "string" ? `strand: ${strand}` : `subject: ${strand.subject}`]),
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
      ...(typeof competencies === "string"
        ? [competencies]
        : [...(competencies === undefined ? [] : [`competencies: [${competencies.join(", ")}]`]), "blocks: []"]),
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
const inOrderOf = async (project: string) => (await inOrder.run({ project })) as Problem[] | undefined;
const short = (problems: Problem[] | undefined) =>
  problems?.map(({ where, found, severity }) => ({ where, found, severity }));
const onMapOf = async (project: string) => (await onMap.run({ project })) as Problem[] | undefined;

let server: Server;
let previous: string | undefined;

beforeAll(async () => {
  server = createServer((request, response) => {
    const map = MAPS[request.url ?? ""];
    if (map !== undefined) {
      response.writeHead(200, { "content-type": "application/json" }).end(map);
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
        expect.objectContaining({ where: "src/kapitel/laplace.yaml:2", competencies: ["laplace"] }),
        expect.objectContaining({ where: "src/kapitel/baum.yaml:2", competencies: ["baumdiagramm"] }),
      ],
    });
    expect(readExplainer(explainer(undefined, { seite: undefined }, 1))).toBeUndefined();
    expect(readExplainer(explainer(undefined, { seite: undefined }))).toBeUndefined();
    expect(readExplainer(tempDir("no-app"))).toBeUndefined();
  });

  test("a unit app is read with its subject, at its line", () => {
    const dir = explainer({ subject: "franzoesisch" }, { a: ["essen"] });
    expect(readExplainer(dir)).toEqual({
      subject: "franzoesisch",
      subjectAt: "src/app.yaml:3",
      pages: [expect.objectContaining({ where: "src/kapitel/a.yaml:2", competencies: ["essen"] })],
    });
  });

  test("a map without explainerFocus (an older one) counts as strand; the map says competency where it is", async () => {
    const math = await loadMap(mapUrl("mathematik"));
    expect("map" in math && math.map.explainerFocus).toBe("strand");
    const french = await loadMap(mapUrl("franzoesisch"));
    expect("map" in french && french.map.explainerFocus).toBe("competency");
  });

  test("the map's address is lernapps.net unless LERNAPPS_TEST_MAP_URL names another", () => {
    expect(mapUrl("mathematik", {})).toBe("https://lernapps.net/apps/map/mathematik.json");
    expect(mapUrl("physik", { LERNAPPS_TEST_MAP_URL: "http://localhost:1/m" })).toBe(
      "http://localhost:1/m/physik.json",
    );
  });

  test("LERNAPPS_TEST_MAP_URL may name a file: URL or a local directory: the map is read from disk", async () => {
    const dir = join(repoRoot, "test/fixtures/map");
    const href = pathToFileURL(join(dir, "mathematik.json")).href;
    expect(mapUrl("mathematik", { LERNAPPS_TEST_MAP_URL: pathToFileURL(dir).href })).toBe(href);
    expect(mapUrl("mathematik", { LERNAPPS_TEST_MAP_URL: dir })).toBe(href);
    expect(mapUrl("mathematik", { LERNAPPS_TEST_MAP_URL: "test/fixtures/map" })).toBe(
      pathToFileURL(join(process.cwd(), "test/fixtures/map/mathematik.json")).href,
    );
    const loaded = await loadMap(href);
    expect("map" in loaded && loaded.map.id).toBe("mathematik");
    expect(await loadMap(pathToFileURL(join(dir, "physik.json")).href)).toEqual({
      failed: expect.stringMatching(/physik\.json does not exist/),
    });
  });

  test("the checks run against a map on disk, without a server", async () => {
    const saved = process.env["LERNAPPS_TEST_MAP_URL"];
    process.env["LERNAPPS_TEST_MAP_URL"] = join(repoRoot, "test/fixtures/map");
    try {
      expect(await onMapOf(explainer("mathematik/stochastik", { a: ["laplace"], b: ["erfunden"] }))).toEqual([
        expect.objectContaining({ found: "the competency erfunden is not on the map of mathematik" }),
      ]);
    } finally {
      process.env["LERNAPPS_TEST_MAP_URL"] = saved;
    }
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
    const dir = explainer("mathematik/stochastik", {
      a: ["haeufigkeiten"],
      r: "recap: mathematik/brueche-anteile\nblocks: []",
      b: ["laplace", "baumdiagramm"],
    });
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

  test("a recap of the app's own strand that the app does not practise passes", async () => {
    const dir = explainer("mathematik/stochastik", {
      r: "recap: mathematik/haeufigkeiten\nblocks: []",
      b: ["laplace"],
    });
    expect(await onMapOf(dir)).toEqual([]);
  });

  test("a recap the app also practises, one not on the map or not <subject>/<id> is a warning at the page", async () => {
    const problems = await onMapOf(
      explainer("mathematik/stochastik", {
        a: "recap: mathematik/haeufigkeiten\nblocks: []",
        b: "recap: mathematik/erfunden\nblocks: []",
        c: "recap: brueche\nblocks: []",
        d: ["haeufigkeiten"],
      }),
    );
    expect(problems?.map(({ where, found, severity }) => ({ where, found, severity }))).toEqual([
      {
        where: "src/kapitel/a.yaml:2",
        found: "the recap mathematik/haeufigkeiten is a competency the app also practises (src/kapitel/d.yaml:2)",
        severity: undefined,
      },
      {
        where: "src/kapitel/b.yaml:2",
        found: "the recap mathematik/erfunden is not on the map of mathematik",
        severity: undefined,
      },
      { where: "src/kapitel/c.yaml:2", found: "the recap brueche is not <subject>/<competency>", severity: undefined },
    ]);
  });

  test("a recap of another subject whose map cannot be loaded is a hint that it could not be checked", async () => {
    const problems = await onMapOf(explainer("mathematik/stochastik", { a: "recap: physik/kraft\nblocks: []" }));
    expect(problems).toEqual([expect.objectContaining({ where: "src/kapitel/a.yaml:2", severity: "hint" })]);
    expect(problems?.[0]?.found).toMatch(/^the recap physik\/kraft could not be checked/);
  });
});

describe("competencies-on-map, a unit app (subject)", () => {
  test("in a subject with explainerFocus competency, competencies of every strand pass, one strand per page", async () => {
    const dir = explainer(
      { subject: "franzoesisch" },
      { a: ["essen"], b: ["artikel"], c: ["einkaufen"], d: ["teilungsartikel", "mengen"], e: ["bestellen"] },
    );
    expect(await onMapOf(dir)).toEqual([]);
  });

  test("in a subject whose map has explainerFocus strand (or none), the subject is a warning at its line", async () => {
    const problems = await onMapOf(explainer({ subject: "mathematik" }, { a: ["laplace"], b: ["brueche-anteile"] }));
    expect(short(problems)).toEqual([
      {
        where: "src/app.yaml:3",
        found:
          "the app names subject: mathematik, but the map of mathematik has explainerFocus strand: its explainers practise one strand each",
        severity: undefined,
      },
    ]);
    expect(problems?.[0]?.fix).toContain("strand: mathematik/<strand>, one of stochastik, arithmetik");
  });

  test("a page that practises competencies of two strands is a warning at the page (KD-07)", async () => {
    const problems = await onMapOf(explainer({ subject: "franzoesisch" }, { a: ["essen", "artikel"] }));
    expect(short(problems)).toEqual([
      {
        where: "src/kapitel/a.yaml:2",
        found:
          "the page practises competencies of 2 strands (franzoesisch/wortschatz: essen; franzoesisch/grammatik: artikel)",
        severity: undefined,
      },
    ]);
  });

  test("an id not on the map is a warning; a map that cannot be loaded is a hint at the subject", async () => {
    expect(short(await onMapOf(explainer({ subject: "franzoesisch" }, { a: ["erfunden"] })))).toEqual([
      {
        where: "src/kapitel/a.yaml:2",
        found: "the competency erfunden is not on the map of franzoesisch",
        severity: undefined,
      },
    ]);
    const problems = await onMapOf(explainer({ subject: "physik" }, { a: ["kraft"] }));
    expect(problems).toEqual([expect.objectContaining({ where: "src/app.yaml:3", severity: "hint" })]);
    expect(problems?.[0]?.found).toMatch(/^the subject and the competencies could not be checked/);
  });
});

describe("prerequisites-in-order", () => {
  test("checks nothing without an explainer in format 2 with a strand or a subject", async () => {
    expect(await inOrderOf(tempDir("no-app"))).toBeUndefined();
    expect(await inOrderOf(explainer("none", { seite: undefined }))).toBeUndefined();
    expect(inOrder.severity).toBe("warning");
  });

  test("every prerequisite practised on an earlier page or the same page passes", async () => {
    const dir = explainer(
      { subject: "franzoesisch" },
      { a: ["essen"], b: ["artikel"], c: ["einkaufen"], d: ["teilungsartikel", "mengen"], e: ["bestellen"] },
    );
    expect(await inOrderOf(dir)).toEqual([]);
  });

  test("a prerequisite practised only on a later page is order, a warning with explainerFocus competency", async () => {
    const dir = explainer({ subject: "franzoesisch" }, { a: ["essen"], b: ["einkaufen"], c: ["artikel"] });
    expect(await inOrderOf(dir)).toEqual([]);
    const problems = await inOrderOf(explainer({ subject: "franzoesisch" }, { a: ["einkaufen"], b: ["essen"] }));
    expect(short(problems)).toEqual([
      {
        where: "src/kapitel/a.yaml:2",
        found:
          "einkaufen requires franzoesisch/essen (strand franzoesisch/wortschatz), which the app practises only later (src/kapitel/b.yaml:2): order",
        severity: "warning",
      },
    ]);
  });

  test("a page ahead of a prerequisite on purpose passes when the app practises it on another page", async () => {
    const ahead = "competencies: [einkaufen]\nahead: [essen]\nblocks: []";
    expect(await inOrderOf(explainer({ subject: "franzoesisch" }, { a: ahead, b: ["essen"] }))).toEqual([]);
    const problems = await inOrderOf(explainer({ subject: "franzoesisch" }, { a: ahead }));
    expect(short(problems)).toEqual([
      {
        where: "src/kapitel/a.yaml:2",
        found:
          "einkaufen comes ahead of franzoesisch/essen on purpose (ahead), but the app practises essen on no page: ahead",
        severity: "warning",
      },
    ]);
  });

  test("a recap page after the page that needs it is order too", async () => {
    const problems = await inOrderOf(
      explainer({ subject: "franzoesisch" }, { a: ["einkaufen"], r: "recap: franzoesisch/essen\nblocks: []" }),
    );
    expect(problems?.map(({ found }) => found)).toEqual([
      "einkaufen requires franzoesisch/essen (strand franzoesisch/wortschatz), which the app repeats only later (src/kapitel/r.yaml:2): order",
    ]);
  });

  test("a prerequisite missing between two competencies of the app is a gap", async () => {
    // mengen requires teilungsartikel, which requires artikel: the app practises artikel and mengen, not teilungsartikel
    const problems = await inOrderOf(explainer({ subject: "franzoesisch" }, { a: ["artikel"], b: ["mengen"] }));
    expect(short(problems)).toEqual([
      {
        where: "src/kapitel/b.yaml:2",
        found:
          "mengen requires franzoesisch/teilungsartikel (strand franzoesisch/grammatik), which the app does not practise, though it practises artikel that teilungsartikel builds on (src/kapitel/a.yaml:2): gap",
        severity: "warning",
      },
    ]);
    expect(problems?.[0]?.fix).toContain("practise it on a page before this one");
  });

  test("a prerequisite with nothing of its chain in the app is the entry; a recap page before it passes", async () => {
    const problems = await inOrderOf(explainer({ subject: "franzoesisch" }, { a: ["teilungsartikel"] }));
    expect(short(problems)).toEqual([
      {
        where: "src/kapitel/a.yaml:2",
        found:
          "teilungsartikel requires franzoesisch/artikel (strand franzoesisch/grammatik), which the app does not practise; no recap page before this page repeats it and the page does not link it: entry",
        severity: "warning",
      },
    ]);
    expect(problems?.[0]?.fix).toContain("recap: franzoesisch/artikel");
    expect(problems?.[0]?.fix).toContain("https://lernapps.net/apps/map/franzoesisch/c/artikel/");
    const recapped = explainer(
      { subject: "franzoesisch" },
      { r: "recap: franzoesisch/artikel\nblocks: []", a: ["teilungsartikel"], b: ["mengen"] },
    );
    expect(await inOrderOf(recapped)).toEqual([]);
  });

  test("a link in the page's text to the prerequisite's page on the map passes", async () => {
    const link = explainer(
      { subject: "franzoesisch" },
      {
        a: [
          "competencies: [teilungsartikel]",
          "blocks:",
          '  - "Du brauchst den [Artikel](https://lernapps.net/apps/map/franzoesisch/c/artikel/)."',
        ].join("\n"),
      },
    );
    expect(await inOrderOf(link)).toEqual([]);
  });

  test("each prerequisite is reported once, at the first page that needs it", async () => {
    const problems = await inOrderOf(
      explainer({ subject: "franzoesisch" }, { a: ["teilungsartikel"], b: ["teilungsartikel"] }),
    );
    expect(problems?.map(({ where }) => where)).toEqual(["src/kapitel/a.yaml:2"]);
  });

  test("with explainerFocus strand (a map without it) every finding is a hint; a prerequisite of another strand is the entry", async () => {
    // laplace requires haeufigkeiten (the app's strand) and brueche-anteile (arithmetik)
    const problems = await inOrderOf(explainer("mathematik/stochastik", { b: ["laplace"] }));
    expect(short(problems)).toEqual([
      {
        where: "src/kapitel/b.yaml:2",
        found:
          "laplace requires mathematik/haeufigkeiten (strand mathematik/stochastik), which the app does not practise; no recap page before this page repeats it and the page does not link it: entry",
        severity: "hint",
      },
      {
        where: "src/kapitel/b.yaml:2",
        found:
          "laplace requires mathematik/brueche-anteile (strand mathematik/arithmetik), which the app does not practise; no recap page before this page repeats it and the page does not link it: entry",
        severity: "hint",
      },
    ]);
    const ordered = explainer("mathematik/stochastik", {
      a: ["haeufigkeiten"],
      r: "recap: mathematik/brueche-anteile\nblocks: []",
      b: ["laplace"],
      c: ["baumdiagramm"],
    });
    expect(await inOrderOf(ordered)).toEqual([]);
    const late = await inOrderOf(explainer("mathematik/stochastik", { c: ["baumdiagramm"], b: ["laplace"] }));
    expect(short(late)?.[0]).toEqual(
      expect.objectContaining({
        where: "src/kapitel/c.yaml:2",
        severity: "hint",
        found: expect.stringMatching(/: order$/),
      }),
    );
  });

  test("without the map: no finding, competencies-on-map says it could not check", async () => {
    expect(await inOrderOf(explainer("physik/mechanik", { a: ["kraft"] }))).toEqual([]);
    expect(await inOrderOf(explainer({ subject: "physik" }, { a: ["kraft"] }))).toEqual([]);
  });
});
