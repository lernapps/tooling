/// <reference lib="dom" />
// The command `lernapps screenshots`: one full-page image of every page of a built explainer or quiz, one image of
// every figure on it, and an index.html that shows them in page order, so that a creator, and an assistant that can
// only send images, sees what a learner sees. A page image is scaled down to be shown whole, so the details of a
// drawing are only checked in the image of its figure. It uses the building blocks of the check (check/visit.ts): the
// browser, the bundle served on 127.0.0.1 and the list of the bundle's pages. The options and the behaviour are
// described in usage.ts.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import type { Browser, Page } from "playwright";
import { BrowserError, bundlePages, launch, serve } from "../check/visit.ts";
import { SCREENSHOTS_OPTIONS, UsageError } from "./usage.ts";

/** The archetypes whose pages are shown to a creator before a submission. */
const SUPPORTED = ["explainer", "quiz"];
const DESKTOP = 1280;
const HEIGHT = 800;
/** A figure is shot at twice its size on screen, as a phone with a sharp display shows it. */
const FIGURE_SCALE = 2;
/** A figure: the blocks figure and labelled-figure (an image or a drawing), and any other figure with a picture. */
const FIGURES = "figure:has(img, svg)";

/** The command cannot be done for the app it was given (not a usage error): printed as it is, exit code 1. */
export class ScreenshotsError extends Error {}

/** No browser can run here: the finding of `lernapps check` for it, about the bundle it was to photograph. */
export class NoBrowser extends Error {
  readonly error: BrowserError;
  readonly bundle: string;
  constructor(error: BrowserError, bundle: string) {
    super(error.message);
    this.error = error;
    this.bundle = bundle;
  }
}

/**
 * The archetype of a built app, from its start page: the explainer and interactive runtimes mark their pages with
 * <meta name="lernapps-archetype">; a quiz has no marker but is the one page with <main class="quiz">.
 */
export function archetypeOf(startPage: string): string | undefined {
  const marker = /<meta\b(?=[^>]*\bname\s*=\s*["']lernapps-archetype["'])[^>]*\bcontent\s*=\s*["']([^"']*)["']/i.exec(
    startPage,
  );
  if (marker !== null) return marker[1];
  return /<main\b[^>]*\bclass\s*=\s*["'][^"']*\bquiz\b/i.test(startPage) ? "quiz" : undefined;
}

/**
 * The file name of a page's image: its place in the order and its path (`02-plan-selbsteinschaetzung`); of a figure on
 * the page, also its place on the page (`02-plan-selbsteinschaetzung-figure-1`).
 */
export function imageName(order: number, page: string, width?: number, figure?: number): string {
  const path = page.replace(/(^|\/)index\.html$/i, "").replace(/\.html$/i, "");
  const slug =
    (path === "" ? "index" : path)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "page";
  const name = `${String(order).padStart(2, "0")}-${slug}${figure === undefined ? "" : `-figure-${figure}`}`;
  return `${name}${width === undefined ? "" : `-${width}`}.png`;
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Shot {
  page: string;
  title: string;
  images: { file: string; width: number }[];
  figures: { file: string; width: number; figure: number }[];
}

/** The index.html of the folder: every image in page order with the page's title and path; one file, no network. */
function indexPage(shots: readonly Shot[]): string {
  const sections = shots
    .map(
      ({ page, title, images, figures }) =>
        `    <section>\n      <h2>${escape(title)}</h2>\n      <p><code>${escape(page)}</code></p>\n` +
        images
          .map(
            ({ file, width }) =>
              `      <figure><img src="${escape(file)}" width="${width}" alt="${escape(`${title} (${page}), ${width} px wide`)}"><figcaption>${width} px</figcaption></figure>\n`,
          )
          .join("") +
        (figures.length === 0 ? "" : `      <h3>Figures</h3>\n`) +
        figures
          .map(
            ({ file, width, figure }) =>
              `      <figure><a href="${escape(file)}"><img src="${escape(file)}" alt="${escape(`Figure ${figure} of ${title} (${page}), ${width} px wide page`)}"></a><figcaption>Figure ${figure}, ${width} px</figcaption></figure>\n`,
          )
          .join("") +
        `    </section>\n`,
    )
    .join("");
  return (
    `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n` +
    `  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Screenshots</title>\n` +
    `  <style>\n    body { font-family: system-ui, sans-serif; margin: 1rem; background: #f4f4f4; color: #111; }\n` +
    `    section { margin: 0 0 3rem; }\n    figure { display: inline-block; margin: 0 1rem 1rem 0; vertical-align: top; }\n` +
    `    img { max-width: 100%; height: auto; border: 1px solid #888; background: #fff; }\n  </style>\n</head>\n<body>\n` +
    `  <main>\n    <h1>Screenshots</h1>\n${sections}  </main>\n</body>\n</html>\n`
  );
}

/** Whether `out` may be emptied: not the working folder, one of its parents, the bundle, or a folder that holds it. */
function checkOut(out: string, bundle: string): void {
  const inside = (outer: string, inner: string) => inner === outer || inner.startsWith(outer + sep);
  const cwd = resolve(".");
  if (inside(out, cwd) || inside(out, bundle) || inside(bundle, out) || dirname(out) === out) {
    throw new UsageError(
      `--out ${relative(cwd, out) || "."}: this folder is emptied first, and it holds the working folder or the built app; choose another`,
    );
  }
}

/**
 * Opens a page in a new context, loaded, fonts and images there, no animation, nothing answered or hovered, and gives it
 * to `use`.
 */
async function opened<T>(
  browser: Browser,
  base: string,
  page: string,
  options: { width: number; scale?: number; javaScript?: boolean },
  use: (tab: Page) => Promise<T>,
): Promise<T> {
  const context = await browser.newContext({
    viewport: { width: options.width, height: HEIGHT },
    deviceScaleFactor: options.scale ?? 1,
    javaScriptEnabled: options.javaScript ?? true,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  try {
    // like the check: requests to other hosts are blocked, so a screenshot never depends on another server
    const origin = new URL(base).origin;
    await context.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort("blockedbyclient"),
    );
    const tab = await context.newPage();
    await tab.goto(new URL(page.replace(/(^|\/)index\.html$/i, "$1"), base).href, { waitUntil: "load" });
    // images below the fold are loaded lazily; a full-page image must show them
    await tab.evaluate(() => {
      for (const image of document.images) image.loading = "eager";
    });
    await tab.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => undefined);
    await tab.evaluate(() =>
      Promise.all([
        document.fonts.ready,
        ...[...document.images].map((image) => image.decode().catch(() => undefined)),
      ]),
    );
    return await use(tab);
  } finally {
    await context.close();
  }
}

/** A page as a learner first sees it, whole: returns its title. */
async function shoot(browser: Browser, base: string, page: string, width: number, file: string): Promise<string> {
  return opened(browser, base, page, { width }, async (tab) => {
    await tab.screenshot({ path: file, fullPage: true, animations: "disabled" });
    return (await tab.title()).trim();
  });
}

/**
 * Every figure of a page, each with its caption, at twice its size: `file` names the image of the figure with its place
 * on the page. The page is opened without JavaScript, as the build writes it, so that the figures are there that a
 * script shows only later, such as those of a quiz's questions. A figure that takes no space, such as one in a closed
 * details element, is left out. Returns the number of figures shot.
 */
async function shootFigures(
  browser: Browser,
  base: string,
  page: string,
  width: number,
  file: (figure: number) => string,
): Promise<number> {
  return opened(browser, base, page, { width, scale: FIGURE_SCALE, javaScript: false }, async (tab) => {
    let count = 0;
    for (const figure of await tab.locator(FIGURES).all()) {
      const box = await figure.boundingBox();
      if (box === null || box.width === 0 || box.height === 0) continue;
      count += 1;
      await figure.screenshot({ path: file(count), animations: "disabled", scale: "device" });
    }
    return count;
  });
}

/**
 * Writes the images and the index.html. Everything that can fail before is checked before the folder is touched, so a
 * failed run writes nothing. Returns the line to print.
 */
export async function screenshots(args: string[]): Promise<string> {
  const { values, positionals } = parseArgs({
    args,
    options: SCREENSHOTS_OPTIONS,
    strict: true,
    allowPositionals: true,
  });
  if (positionals.length > 1) throw new UsageError(`one <dir> at most, not ${positionals.join(" ")}`);
  if (!/^\d+$/.test(values.width) || Number(values.width) < 200 || Number(values.width) > 4000) {
    throw new UsageError(`--width ${values.width}: a number of pixels from 200 to 4000`);
  }
  const widths = [...new Set([Number(values.width), ...(values.desktop ? [DESKTOP] : [])])];
  const bundle = resolve(positionals[0] ?? "dist");
  if (!existsSync(bundle) || !statSync(bundle).isDirectory() || !existsSync(join(bundle, "index.html"))) {
    throw new UsageError(`${positionals[0] ?? "dist"}: not a directory with index.html (build the app first)`);
  }
  const archetype = archetypeOf(readFileSync(join(bundle, "index.html"), "utf8"));
  if (archetype === undefined || !SUPPORTED.includes(archetype)) {
    throw new ScreenshotsError(
      `screenshots support explainer and quiz, not ${archetype === undefined ? "this app" : `the ${archetype} archetype`}`,
    );
  }
  const out = resolve(values.out);
  checkOut(out, bundle);

  // the start page first, then the pages in the order of the check
  const pages = bundlePages(bundle).map(({ name }) => name);
  pages.sort((a, b) => Number(b === "index.html") - Number(a === "index.html"));

  const browser = await launch().catch((error: unknown) => {
    throw error instanceof BrowserError ? new NoBrowser(error, relative(resolve("."), bundle) || ".") : error;
  });
  const { server, base } = await serve(bundle, "/");
  let figureCount = 0;
  try {
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    const shots: Shot[] = [];
    for (const [index, page] of pages.entries()) {
      const images: Shot["images"] = [];
      const figures: Shot["figures"] = [];
      let title = "";
      for (const width of widths) {
        const named = widths.length > 1 ? width : undefined;
        const file = imageName(index + 1, page, named);
        title = await shoot(browser, base, page, width, join(out, file));
        images.push({ file, width });
        const count = await shootFigures(browser, base, page, width, (figure) =>
          join(out, imageName(index + 1, page, named, figure)),
        );
        for (let figure = 1; figure <= count; figure += 1) {
          figures.push({ file: imageName(index + 1, page, named, figure), width, figure });
        }
      }
      figureCount += figures.filter(({ width }) => width === widths[0]).length;
      shots.push({ page, title: title || page, images, figures });
    }
    writeFileSync(join(out, "index.html"), indexPage(shots));
  } finally {
    server.close();
    await browser.close();
  }
  const count = readdirSync(out).filter((file) => file.endsWith(".png")).length;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return `lernapps screenshots: ${plural(pages.length, "page")}, ${plural(figureCount, "figure")}, ${plural(count, "image")} in ${relative(resolve("."), out) || "."}/ (open index.html; check every figure in its own image)\n`;
}
