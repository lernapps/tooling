/// <reference lib="dom" />
// The command `lernapps screenshots`: one full-page image of every page of a built explainer or quiz, and an index.html
// that shows them in page order, so that a creator, and an assistant that can only send images, sees what a learner
// sees. It uses the building blocks of the check (check/visit.ts): the browser, the bundle served on 127.0.0.1 and the
// list of the bundle's pages. The options and the behaviour are described in usage.ts.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import type { Browser } from "playwright";
import { BrowserError, bundlePages, launch, serve } from "../check/visit.ts";
import { SCREENSHOTS_OPTIONS, UsageError } from "./usage.ts";

/** The archetypes whose pages are shown to a creator before a submission. */
const SUPPORTED = ["explainer", "quiz"];
const DESKTOP = 1280;
const HEIGHT = 800;

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

/** The file name of a page's image: its place in the order and its path (`02-plan-selbsteinschaetzung`). */
export function imageName(order: number, page: string, width?: number): string {
  const path = page.replace(/(^|\/)index\.html$/i, "").replace(/\.html$/i, "");
  const slug =
    (path === "" ? "index" : path)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "page";
  return `${String(order).padStart(2, "0")}-${slug}${width === undefined ? "" : `-${width}`}.png`;
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Shot {
  page: string;
  title: string;
  images: { file: string; width: number }[];
}

/** The index.html of the folder: every image in page order with the page's title and path; one file, no network. */
function indexPage(shots: readonly Shot[]): string {
  const sections = shots
    .map(
      ({ page, title, images }) =>
        `    <section>\n      <h2>${escape(title)}</h2>\n      <p><code>${escape(page)}</code></p>\n` +
        images
          .map(
            ({ file, width }) =>
              `      <figure><img src="${escape(file)}" width="${width}" alt="${escape(`${title} (${page}), ${width} px wide`)}"><figcaption>${width} px</figcaption></figure>\n`,
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

/** A page as a learner first sees it: loaded, fonts and images there, no animation, nothing answered or hovered. */
async function shoot(browser: Browser, base: string, page: string, width: number, file: string): Promise<string> {
  const context = await browser.newContext({
    viewport: { width, height: HEIGHT },
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
    const title = (await tab.title()).trim();
    await tab.screenshot({ path: file, fullPage: true, animations: "disabled" });
    return title;
  } finally {
    await context.close();
  }
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
  try {
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    const shots: Shot[] = [];
    for (const [index, page] of pages.entries()) {
      const images: Shot["images"] = [];
      let title = "";
      for (const width of widths) {
        const file = imageName(index + 1, page, widths.length > 1 ? width : undefined);
        title = await shoot(browser, base, page, width, join(out, file));
        images.push({ file, width });
      }
      shots.push({ page, title: title || page, images });
    }
    writeFileSync(join(out, "index.html"), indexPage(shots));
  } finally {
    server.close();
    await browser.close();
  }
  const count = readdirSync(out).filter((file) => file.endsWith(".png")).length;
  return `lernapps screenshots: ${pages.length} page${pages.length === 1 ? "" : "s"}, ${count} image${count === 1 ? "" : "s"} in ${relative(resolve("."), out) || "."}/ (open index.html)\n`;
}
