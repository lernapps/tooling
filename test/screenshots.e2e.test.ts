// The contract of `lernapps screenshots`, end to end: the real CLI on the built example apps of app-templates (an
// explainer, a quiz and an interactive app, made by `lernapps create` from the commit pinned in package.json).
//   - explainer and quiz: one PNG per page of the bundle, named by its order and path, as wide as asked and as tall as
//     the page, and an index.html that lists them in the same order and loads nothing from the network;
//   - another archetype, a missing build and a browser that cannot start fail with their message and write no folder;
//   - --out names the folder, and an existing folder is emptied first; --desktop adds an image 1280 px wide per page.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import { bundlePages, launch, serve } from "../check/visit.ts";
import { archetypeOf, imageName } from "../src/screenshots.ts";
import { output } from "./check-report.ts";
import { appTemplates, confirmedPlan, ok, repoRoot, run, runAsync, tempDir, type Result } from "./support.ts";

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
  ok("node", [cli, "create", "--archetype", archetype, app, "--templates", appTemplates()], parent);
  ok("git", ["init", "--quiet", "--initial-branch=main"], app);
  const installed = await runAsync("npm", ["install", "--no-audit", "--no-fund"], app);
  if (installed.code !== 0) throw new Error(output(installed));
  const built = await runAsync("npx", ["--no", "--", "vp", "build"], app);
  if (built.code !== 0) throw new Error(output(built));
  apps[archetype] = app;
}

/** The images of a folder, and the pages index.html shows, in its order: <img src> and <code>path</code>. */
function indexed(folder: string): { images: string[]; pages: string[]; html: string } {
  const html = readFileSync(join(folder, "index.html"), "utf8");
  return {
    html,
    images: [...html.matchAll(/<img src="([^"]+)"/g)].map((match) => match[1] ?? ""),
    pages: [...html.matchAll(/<code>([^<]+)<\/code>/g)].map((match) => match[1] ?? ""),
  };
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
    expect(listed.images).toHaveLength(pages.length * widths.length);
    // it loads nothing from the network: every reference is a file of the folder
    expect(listed.html).not.toMatch(/(?:src|href)\s*=\s*["'](?:[a-z]+:)?\/\//i);
    expect(listed.html).not.toMatch(/url\(/i);

    const browser = await launch();
    const { server, base } = await serve(join(app, "dist"), "/");
    try {
      for (const [index, page] of listed.pages.entries()) {
        for (const [at, width] of widths.entries()) {
          const image = listed.images[index * widths.length + at] ?? "";
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

  test("the example explainer: one PNG per page and an index.html in the same order", { timeout: SLOW }, async () => {
    const folder = join(apps.explainer, "screenshots");
    const result = screenshots(apps.explainer);
    await expectEveryPage("explainer", result, folder, [390]);
    expect(indexed(folder).images[0]).toBe("01-index.png");
  });

  test("the example quiz: the same", { timeout: SLOW }, async () => {
    const result = screenshots(apps.quiz);
    await expectEveryPage("quiz", result, join(apps.quiz, "screenshots"), [390]);
  });

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

  test("a folder that holds the working folder or the app is never emptied", () => {
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
    expect(indexed(folder).images.slice(0, 2)).toEqual(["01-index-390.png", "01-index-1280.png"]);
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
