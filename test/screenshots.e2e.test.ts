// The contract of `lernapps screenshots`, end to end: the real CLI on the built example apps of app-templates (an
// explainer, a quiz and an interactive app, made by `lernapps create` from the commit pinned in package.json).
//   - explainer and quiz: one PNG per page of the bundle, named by its order and path, as wide as asked and as tall as
//     the page, one PNG per figure of the page, named by the page and its place, at twice its size, also the figures of
//     a quiz's questions that the quiz shows only later, and an index.html that lists them in the same order, each
//     figure with its page, and loads nothing from the network;
//   - another archetype, a missing build and a browser that cannot start fail with their message and write no folder;
//   - --out names the folder, and an existing folder is emptied first; --desktop adds an image 1280 px wide per page.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import { bundlePages, launch, serve } from "../check/visit.ts";
import { archetypeOf, imageName } from "../src/screenshots.ts";
import { output } from "./check-report.ts";
import {
  appTemplates,
  confirmedPlan,
  ok,
  packedTooling,
  repoRoot,
  run,
  runAsync,
  tempDir,
  type Result,
} from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const cli = join(repoRoot, "src/cli.ts");
const screenshots = (cwd: string, ...args: string[]) => run("node", [cli, "screenshots", ...args], cwd);

/** The width and height of a PNG, from its header. */
function size(file: string): { width: number; height: number } {
  const png = readFileSync(file);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

/** The apps, as `lernapps create` writes them, installed and built into dist/. */
const apps: Record<"explainer" | "quiz" | "interactive", string> = { explainer: "", quiz: "", interactive: "" };

async function makeApp(archetype: keyof typeof apps): Promise<void> {
  const parent = tempDir(archetype);
  const app = join(parent, "app");
  confirmedPlan(app, archetype);
  ok(
    "node",
    [
      cli,
      "create",
      "--archetype",
      archetype,
      app,
      "--templates",
      appTemplates(),
      "--tooling",
      `file:${packedTooling()}`,
    ],
    parent,
  );
  ok("git", ["init", "--quiet", "--initial-branch=main"], app);
  const installed = await runAsync("npm", ["install", "--no-audit", "--no-fund"], app);
  if (installed.code !== 0) throw new Error(output(installed));
  const built = await runAsync("npx", ["--no", "--", "vp", "build"], app);
  if (built.code !== 0) throw new Error(output(built));
  apps[archetype] = app;
}

/**
 * The images of a folder, and the pages index.html shows, in its order: <img src> and <code>path</code>; the images
 * of the pages and of the figures apart, and the figures by page.
 */
function indexed(folder: string): {
  images: string[];
  pages: string[];
  html: string;
  pageImages: string[];
  figures: string[][];
} {
  const html = readFileSync(join(folder, "index.html"), "utf8");
  const sources = (part: string) => [...part.matchAll(/<img src="([^"]+)"/g)].map((match) => match[1] ?? "");
  const images = sources(html);
  return {
    html,
    images,
    pages: [...html.matchAll(/<code>([^<]+)<\/code>/g)].map((match) => match[1] ?? ""),
    pageImages: images.filter((image) => !image.includes("-figure-")),
    figures: html
      .split("<section>")
      .slice(1)
      .map((section) => sources(section).filter((image) => image.includes("-figure-"))),
  };
}

/**
 * The figures with a picture in a built page, as the build writes it: a <figure> that holds an <img> or an <svg>. One in
 * a <template> is not on the page without JavaScript, such as one of a self-assessment's exercises.
 */
function figuresIn(file: string): number {
  const page = readFileSync(file, "utf8").replace(/<template\b[\s\S]*?<\/template>/g, "");
  return [...page.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].filter((match) => /<(?:img|svg)\b/.test(match[0])).length;
}

/** Whether the folder holds exactly the images and the index.html, nothing else. */
const files = (folder: string) => readdirSync(folder).sort();

describe("the names of the images", () => {
  test("a page is named by its order and its path", () => {
    expect(imageName(1, "index.html")).toBe("01-index.png");
    expect(imageName(2, "plan/selbsteinschaetzung/index.html")).toBe("02-plan-selbsteinschaetzung.png");
    expect(imageName(12, "entwurf.html")).toBe("12-entwurf.png");
    expect(imageName(1, "index.html", 390)).toBe("01-index-390.png");
  });

  test("a figure is named by its page and its place on the page", () => {
    expect(imageName(2, "plan/selbsteinschaetzung/index.html", undefined, 1)).toBe(
      "02-plan-selbsteinschaetzung-figure-1.png",
    );
    expect(imageName(1, "index.html", 1280, 3)).toBe("01-index-figure-3-1280.png");
  });

  test("the archetype is read from the start page: the marker, else the quiz's main element", () => {
    expect(archetypeOf('<head><meta name="lernapps-archetype" content="explainer" /></head>')).toBe("explainer");
    expect(archetypeOf('<meta name="lernapps-archetype" content="interactive" />')).toBe("interactive");
    expect(archetypeOf('<body><main class="quiz" id="quiz"><h1>Q</h1>')).toBe("quiz");
    expect(archetypeOf("<body><main><h1>Something else</h1>")).toBeUndefined();
  });
});

describe.skipIf(inner)("lernapps screenshots on the built example apps of app-templates", () => {
  beforeAll(async () => {
    await Promise.all([makeApp("explainer"), makeApp("quiz"), makeApp("interactive")]);
  }, SLOW);

  /** One image per page of the bundle, as wide as asked and as tall as the page; index.html lists them in order. */
  async function expectEveryPage(archetype: "explainer" | "quiz", result: Result, folder: string, widths: number[]) {
    expect(result.code, output(result)).toBe(0);
    const app = apps[archetype];
    const pages = bundlePages(join(app, "dist")).map(({ name }) => name);
    const listed = indexed(folder);
    expect(new Set(listed.pages)).toEqual(new Set(pages));
    expect(listed.pages[0]).toBe("index.html");
    expect(result.stdout).toContain(`${pages.length} page`);
    expect(result.stdout).toContain(`${folder.split("/").at(-1)}/`);
    // every image of the folder is in the index, in page order, and the folder has nothing else
    expect(files(folder)).toEqual([...listed.images, "index.html"].sort());
    expect(listed.pageImages).toHaveLength(pages.length * widths.length);
    // every figure of every page, at every width, in the section of its page, numbered on the page
    const figures = listed.pages.map((page) => figuresIn(join(app, "dist", page)));
    const total = figures.reduce((sum, count) => sum + count, 0);
    expect(total, "the example app has figures").toBeGreaterThan(0);
    expect(result.stdout).toContain(`${total} figure`);
    for (const [index, page] of listed.pages.entries()) {
      const expected = widths.flatMap((width) =>
        Array.from({ length: figures[index] ?? 0 }, (_, at) =>
          imageName(index + 1, page, widths.length > 1 ? width : undefined, at + 1),
        ),
      );
      expect(listed.figures[index], page).toEqual(expected);
      for (const [at, image] of expected.entries()) {
        const { width: wide, height } = size(join(folder, image));
        const width = widths[Math.floor(at / (figures[index] ?? 1))] ?? 0;
        // twice its size on screen: at most twice as wide as the page
        expect(wide, image).toBeGreaterThan(0);
        expect(wide, image).toBeLessThanOrEqual(2 * width);
        expect(height, image).toBeGreaterThan(0);
      }
    }
    // it loads nothing from the network: every reference is a file of the folder
    expect(listed.html).not.toMatch(/(?:src|href)\s*=\s*["'](?:[a-z]+:)?\/\//i);
    expect(listed.html).not.toMatch(/url\(/i);

    const browser = await launch();
    const { server, base } = await serve(join(app, "dist"), "/");
    try {
      for (const [index, page] of listed.pages.entries()) {
        for (const [at, width] of widths.entries()) {
          const image = listed.pageImages[index * widths.length + at] ?? "";
          expect(image, page).toMatch(new RegExp(`^${String(index + 1).padStart(2, "0")}-`));
          const { width: wide, height } = size(join(folder, image));
          expect(wide, image).toBeGreaterThan(0);
          const tab = await browser.newPage({ viewport: { width, height: 800 } });
          try {
            await tab.goto(new URL(page.replace(/(^|\/)index\.html$/, "$1"), base).href);
            await tab.waitForLoadState("networkidle");
            const scroll = await tab.evaluate(() => document.documentElement.scrollHeight);
            // as tall as the page, as a learner sees it, with a margin for what loads later
            expect(height, `${image} for ${page}`).toBeGreaterThanOrEqual(scroll * 0.9);
          } finally {
            await tab.close();
          }
          expect(wide, image).toBe(width);
        }
      }
    } finally {
      server.close();
      await browser.close();
    }
  }

  test(
    "the example explainer: one PNG per page and per figure, and an index.html in the same order",
    { timeout: SLOW },
    async () => {
      const folder = join(apps.explainer, "screenshots");
      const result = screenshots(apps.explainer);
      await expectEveryPage("explainer", result, folder, [390]);
      expect(indexed(folder).images[0]).toBe("01-index.png");
      // on a phone a figure fills the column: its image is sharper than the page's, wider than the page itself
      const figure = indexed(folder).figures.flat()[0] ?? "";
      expect(size(join(folder, figure)).width, figure).toBeGreaterThan(390);
    },
  );

  test(
    "the example quiz: the same, with the figures of the questions it shows only later",
    { timeout: SLOW },
    async () => {
      const result = screenshots(apps.quiz);
      await expectEveryPage("quiz", result, join(apps.quiz, "screenshots"), [390]);
    },
  );

  test("an interactive app is not supported: a message, exit 1, no folder", { timeout: SLOW }, () => {
    const result = screenshots(apps.interactive);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("screenshots support explainer and quiz");
    expect(existsSync(join(apps.interactive, "screenshots"))).toBe(false);
  });

  test("without a build: the message of the check to build first, exit 2, no folder", () => {
    const empty = tempDir("unbuilt");
    const result = screenshots(empty);
    expect(result.code, output(result)).toBe(2);
    expect(result.stderr).toContain("build the app first");
    expect(existsSync(join(empty, "screenshots"))).toBe(false);
    // the message is the one of lernapps check on a directory without index.html
    expect(run("node", [cli, "check", empty], repoRoot).stderr).toContain("build the app first");
  });

  test("--out names the folder; an existing folder is emptied first", { timeout: SLOW }, async () => {
    const folder = join(apps.quiz, "x");
    mkdirSync(join(folder, "old"), { recursive: true });
    writeFileSync(join(folder, "old/image.png"), "old");
    writeFileSync(join(folder, "stale.txt"), "old");
    const result = screenshots(apps.quiz, "--out", "x");
    await expectEveryPage("quiz", result, folder, [390]);
    expect(files(folder)).not.toContain("old");
    expect(files(folder)).not.toContain("stale.txt");
  });

  test("a folder that holds the working folder or the app is never emptied", { timeout: SLOW }, () => {
    for (const out of [".", "..", "dist"]) {
      const result = screenshots(apps.quiz, "--out", out);
      expect(result.code, `${out}: ${output(result)}`).toBe(2);
    }
    expect(existsSync(join(apps.quiz, "dist/index.html"))).toBe(true);
    expect(existsSync(join(apps.quiz, "package.json"))).toBe(true);
  });

  test("--desktop: two images per page, named with their widths, both in index.html", { timeout: SLOW }, async () => {
    const folder = join(apps.explainer, "both");
    const result = screenshots(apps.explainer, "--desktop", "--out", "both");
    await expectEveryPage("explainer", result, folder, [390, 1280]);
    expect(indexed(folder).pageImages.slice(0, 2)).toEqual(["01-index-390.png", "01-index-1280.png"]);
  });

  test("where no browser can start: the finding of the check, exit 1, no folder", { timeout: SLOW }, async () => {
    const result = await runAsync("node", [cli, "screenshots", "--out", "nobrowser"], apps.quiz, {
      PLAYWRIGHT_BROWSERS_PATH: tempDir("no-browsers"),
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1",
      PLAYWRIGHT_DOWNLOAD_HOST: "http://127.0.0.1:9",
    });
    expect(result.code, output(result)).toBe(1);
    expect(result.stdout).toContain("rule: app-checkable");
    expect(result.stdout).toContain("no browser can run here: ");
    expect(result.stdout).toContain("npx playwright install --with-deps chromium");
    expect(existsSync(join(apps.quiz, "nobrowser"))).toBe(false);
  });
});
