/// <reference lib="dom" />
// Opens the built app in a browser, as a learner would, and records what each page does before any click: requests,
// cookies and storage, width at 360 px, axe-core's findings, its links. A page the explainer runtime marks as its own
// (<meta name="lernapps-archetype" content="explainer">) is opened a second time with JavaScript off, in one more
// browser context for all of them, to read what it shows without it; other pages get no second visit. A bundle is
// served on 127.0.0.1 under its base path; an app on a URL is opened there. Requests to other hosts are recorded
// and blocked, so a check never depends on another server. The checks in check/rules/ read the visits.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import type { AddressInfo } from "node:net";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { chromium, type Browser, type BrowserContext } from "playwright";
import type { PageVisit, WithoutJavaScript } from "./check.ts";
import { linkStatus } from "./status.ts";

const require = createRequire(import.meta.url);
const WIDTH = 360;
const WCAG_21_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** A browser cannot start here; the message says how to make it run. */
export class BrowserError extends Error {}

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

/** Serves a bundle at http://127.0.0.1:<port><path>, as a static host does; nothing outside the path. */
export async function serve(bundle: string, path: string): Promise<{ server: Server; base: string }> {
  const root = resolve(bundle);
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const file = pathname.startsWith(path) ? join(root, pathname.slice(path.length)) : "";
    if (file === "" || (file !== root && !file.startsWith(root + sep)) || !existsSync(file)) {
      response.writeHead(404, { "content-type": "text/plain" }).end("not found");
    } else if (statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) {
        response.writeHead(301, { location: `${pathname}/${url.search}` }).end();
      } else if (existsSync(join(file, "index.html"))) {
        response.writeHead(200, { "content-type": TYPES[".html"] }).end(readFileSync(join(file, "index.html")));
      } else {
        response.writeHead(404, { "content-type": "text/plain" }).end("not found");
      }
    } else {
      const type = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
      response.writeHead(200, { "content-type": type }).end(readFileSync(file));
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  return { server, base: `http://127.0.0.1:${(server.address() as AddressInfo).port}${path}` };
}

/** A page of a bundle: its path below it ("kuerzen/index.html"), and whether a link from the start page must reach it. */
export interface BundlePage {
  name: string;
  navigable: boolean;
}

/**
 * The pages of a bundle: its .html files, sorted. Left out, as no pages: the 404 page at the root, which a static host
 * serves at any address that does not exist, so its links work only from there (a link that leads to it makes it a
 * page like any other); and a file without <!doctype html>, which is no document (a fragment, a host's verification
 * file). Not navigable: a page the app marks with <meta name="robots" content="noindex">, reached another way on
 * purpose; it is checked like any page, but no link needs to reach it.
 */
export function bundlePages(bundle: string): BundlePage[] {
  const root = resolve(bundle);
  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return files(path);
      return entry.isFile() && entry.name.toLowerCase().endsWith(".html") ? [path] : [];
    });
  const doctype = /^\uFEFF?\s*<!doctype html\b/i;
  const noindex = /<meta\b(?=[^>]*\bname\s*=\s*["']?robots\b)(?=[^>]*\bcontent\s*=\s*["'][^"']*\bnoindex\b)[^>]*>/i;
  return files(root)
    .map((file) => ({ name: relative(root, file).split(sep).join("/"), html: readFileSync(file, "utf8") }))
    .filter(({ name, html }) => name !== "404.html" && doctype.test(html))
    .map(({ name, html }) => ({ name, navigable: !noindex.test(html) }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

/** How the checks get their browser, when Playwright's own build of Chromium is not installed. */
export type BrowserChoice = { use: "installed"; executablePath: string } | { use: "download" };

/**
 * Where Playwright's own Chromium is missing: another Chromium installed in the browser folder, where the environment
 * asks for no downloads (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD, as a sandbox with a preinstalled browser sets it), the
 * newest first; else a download of Playwright's own. CI sets no such variable, so it downloads (and caches) as before.
 */
export function chooseBrowsers(env: NodeJS.ProcessEnv, installed: readonly string[]): BrowserChoice[] {
  const skip = (env["PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD"] ?? "").toLowerCase();
  const noDownloads = skip !== "" && skip !== "0" && skip !== "false";
  return [
    ...(noDownloads ? installed.map((executablePath) => ({ use: "installed" as const, executablePath })) : []),
    { use: "download" },
  ];
}

/** Playwright's browser folder: PLAYWRIGHT_BROWSERS_PATH, else its cache; undefined where it is node_modules ("0"). */
function browsersFolder(env: NodeJS.ProcessEnv): string | undefined {
  const path = env["PLAYWRIGHT_BROWSERS_PATH"];
  if (path === "0") return undefined;
  if (path !== undefined && path !== "") return path;
  if (process.platform === "win32") return join(env["LOCALAPPDATA"] ?? homedir(), "ms-playwright");
  if (process.platform === "darwin") return join(homedir(), "Library", "Caches", "ms-playwright");
  return join(env["XDG_CACHE_HOME"] ?? join(homedir(), ".cache"), "ms-playwright");
}

/** The Chromium executables of any version in a browser folder, newest first; the headless shell before the full one. */
function installedChromiums(folder: string | undefined): string[] {
  if (folder === undefined || !existsSync(folder)) return [];
  const names = ["chrome-headless-shell", "headless_shell", "chrome", "chrome.exe", "chrome-headless-shell.exe"];
  return readdirSync(folder)
    .flatMap((name) => {
      const match = /^chromium(_headless_shell)?-(\d+)$/.exec(name);
      if (match === null) return [];
      const rank = Number(match[2]) * 2 + (match[1] === undefined ? 0 : 1);
      return readdirSync(join(folder, name), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) => names.map((file) => join(folder, name, entry.name, file)))
        .filter((file) => existsSync(file))
        .map((file) => ({ file, rank }));
    })
    .sort((a, b) => b.rank - a.rank)
    .map(({ file }) => file);
}

/** The browser that started last in this run: Playwright's own (undefined path) or another installed Chromium. */
let started: { executablePath?: string } | undefined;

/**
 * Starts Chromium: Playwright's own build; where that is missing, another one that is installed (chooseBrowsers), or
 * Playwright's own, installed once (Playwright caches it). Each says so in one line.
 */
export async function launch(): Promise<Browser> {
  const missing = (error: unknown) => /Executable doesn't exist|playwright install/i.test(String(error));
  try {
    const browser = await chromium.launch(started?.executablePath ? { executablePath: started.executablePath } : {});
    started ??= {};
    return browser;
  } catch (error) {
    if (!missing(error)) throw cannotRun(error);
  }
  for (const choice of chooseBrowsers(process.env, installedChromiums(browsersFolder(process.env)))) {
    if (choice.use === "installed") {
      try {
        const browser = await chromium.launch({ executablePath: choice.executablePath });
        process.stderr.write(
          `lernapps check: Playwright's Chromium is not installed, using the installed ${choice.executablePath}\n`,
        );
        started = { executablePath: choice.executablePath };
        return browser;
      } catch {
        continue;
      }
    }
  }
  const cli = join(dirname(require.resolve("playwright/package.json")), "cli.js");
  process.stderr.write("lernapps check: no usable Chromium installed, downloading Playwright's (once; it is cached)\n");
  const install = spawnSync(process.execPath, [cli, "install", "chromium"], { stdio: ["ignore", 2, 2] });
  if (install.status !== 0) throw cannotRun(new Error("npx playwright install chromium failed"));
  try {
    const browser = await chromium.launch();
    started = {};
    return browser;
  } catch (error) {
    throw cannotRun(error);
  }
}

/**
 * The environment of the end-to-end tests, once a browser has started in this run (else it starts one): the
 * executable of an installed Chromium in LERNAPPS_CHROMIUM, which the Playwright preset launches
 * (archetypes/shared/playwright.ts); nothing for Playwright's own.
 */
export async function browserForTests(): Promise<Record<string, string>> {
  if (started === undefined) await (await launch()).close();
  return started?.executablePath ? { LERNAPPS_CHROMIUM: started.executablePath } : {};
}

function cannotRun(error: unknown): BrowserError {
  const first = (error instanceof Error ? error.message : String(error)).split("\n")[0] ?? "";
  return new BrowserError(`no browser can run here: ${first.trim()}`);
}

/** The status of every link, fetched once per URL (a rate-limited one with a short, bounded backoff). */
class Links {
  private readonly known = new Map<string, Promise<{ status: number; html: boolean }>>();
  get(url: string): Promise<{ status: number; html: boolean }> {
    let result = this.known.get(url);
    if (result === undefined) {
      result = linkStatus(url);
      this.known.set(url, result);
    }
    return result;
  }
}

const withoutHash = (url: string) => url.replace(/#.*$/, "");
/**
 * The page a link leads to: without query and fragment. A static host serves the same file for any query, so a link
 * that only changes it (a quiz's "start again" with a random seed) is the same page, and the report stays the same.
 */
const pageOf = (url: string) => url.replace(/[?#].*$/, "");

/** The most pages a check of an app on a URL visits; a bundle's pages are all visited. */
export const URL_PAGE_LIMIT = 100;
/**
 * For the tooling's own tests only, not for users: LERNAPPS_TEST_URL_PAGE_LIMIT lowers the limit, so a test reaches it
 * with a few pages (test/check-pages.e2e.test.ts). Not in the help; any other value keeps URL_PAGE_LIMIT.
 */
export function urlPageLimit(env: NodeJS.ProcessEnv = process.env): number {
  const value = Number(env["LERNAPPS_TEST_URL_PAGE_LIMIT"]);
  return Number.isInteger(value) && value > 0 ? value : URL_PAGE_LIMIT;
}
/** Pages visited at the same time, each in its own browser context. */
const PARALLEL = 4;

/** The pages of a visit, and what it could not reach or did not visit. */
export interface Visited {
  pages: PageVisit[];
  /** Navigable pages of the bundle that no link from the start page reaches, by name; visited too. */
  unreachable: string[];
  /** Set when the visit stopped at `limit` pages, with at least `more` further pages linked from them. */
  stopped?: { limit: number; more: number };
}

/**
 * Visits the start page and every page of the app reachable from it by links below `base`, breadth first, in a fixed
 * order, a few at a time; the result does not depend on how long a page takes. `name` turns a page's URL into what
 * the messages call it. For a bundle, `pages` are its pages (bundlePages): those the links do not reach, nor a page
 * embeds (an iframe), are visited afterwards, and unreachable unless they are not navigable. Without `pages` (an app
 * on a URL), it stops after `limit` pages and says so.
 */
export async function visitApp(
  browser: Browser,
  base: string,
  name: (url: string) => string,
  options: { start?: string; pages?: readonly BundlePage[]; limit?: number } = {},
): Promise<Visited> {
  const { start = base, pages, limit = Infinity } = options;
  const axe = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  const links = new Links();
  const queue = [withoutHash(start)];
  const seen = new Set([pageOf(start)]);
  const visits: PageVisit[] = [];
  // the browser context without JavaScript, made at the first page marked as an explainer page
  let withoutJs: Promise<BrowserContext> | undefined;
  const noJs = () => (withoutJs ??= newContext(browser, new URL(base).origin, [], false));
  const visitAll = async (urls: string[]) => {
    const done = await Promise.all(urls.map((url) => visitPage(browser, url, base, axe, links, noJs)));
    return done.map((visit, index) => ({ ...visit, page: name(urls[index] ?? "") }));
  };
  try {
    while (queue.length > 0 && visits.length < limit) {
      // in the order of the queue, as one page at a time would: the links of each are queued after it
      for (const visit of await visitAll(queue.splice(0, Math.min(PARALLEL, limit - visits.length)))) {
        const { anchors, ...rest } = visit;
        visits.push(rest);
        for (const link of anchors) {
          const next = pageOf(link);
          if (seen.has(next) || !next.startsWith(base)) continue;
          seen.add(next);
          const { status, html } = await links.get(next);
          if (status > 0 && status < 400 && html) queue.push(next);
        }
      }
    }
    const reached = new Set(
      visits.flatMap((visit) => [visit.page, ...visit.links.map((link) => name(pageOf(link.url)))]),
    );
    const rest = (pages ?? []).filter((page) => !reached.has(page.name));
    for (let index = 0; index < rest.length; index += PARALLEL) {
      const urls = rest.slice(index, index + PARALLEL).map((page) => base + encodeURI(page.name));
      visits.push(...(await visitAll(urls)).map(({ anchors: _anchors, ...visit }) => visit));
    }
    return {
      pages: visits.sort((a, b) => a.page.localeCompare(b.page)),
      unreachable: rest.filter((page) => page.navigable).map((page) => page.name),
      ...(queue.length > 0 ? { stopped: { limit, more: queue.length } } : {}),
    };
  } finally {
    if (withoutJs !== undefined) await (await withoutJs).close();
  }
}

async function newContext(browser: Browser, origin: string, requests: PageVisit["requests"], javaScriptEnabled = true) {
  const context = await browser.newContext({ viewport: { width: WIDTH, height: 800 }, javaScriptEnabled });
  await context.route("**/*", async (route) => {
    const request = route.request();
    requests.push({ url: request.url(), method: request.method() });
    if (new URL(request.url()).origin === origin) await route.continue();
    else await route.abort("blockedbyclient");
  });
  return context;
}

async function settle(context: BrowserContext, url: string) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => undefined);
  return page;
}

async function visitPage(
  browser: Browser,
  url: string,
  base: string,
  axe: string,
  links: Links,
  noJs: () => Promise<BrowserContext>,
): Promise<Omit<PageVisit, "page"> & { anchors: string[] }> {
  const origin = new URL(base).origin;
  const requests: PageVisit["requests"] = [];
  const context = await newContext(browser, origin, requests);
  try {
    const page = await settle(context, url);
    // a page marked as an explainer page is read without JavaScript too, at the same time as the rest of this visit
    const withoutJavaScript =
      (await page.locator(EXPLAINER_MARKER).count()) > 0
        ? noJs().then((noJsContext) => readWithoutJavaScript(noJsContext, url))
        : undefined;
    withoutJavaScript?.catch(() => undefined); // awaited below; not unhandled when this visit fails first
    const loaded = [...requests];
    const cookies = (await context.cookies()).map((cookie) => cookie.name).sort();
    const storage = await page.evaluate(async () => {
      const databases = typeof indexedDB.databases === "function" ? await indexedDB.databases() : [];
      return [
        ...Object.keys(localStorage).map((key) => `localStorage ${key}`),
        ...Object.keys(sessionStorage).map((key) => `sessionStorage ${key}`),
        ...databases.map((database) => `IndexedDB ${database.name ?? ""}`),
      ].sort();
    });
    const overflow = await page.evaluate((width) => {
      const selector = (element: Element): string => {
        const id = element.id === "" ? "" : `#${element.id}`;
        const classes = [...element.classList].map((name) => `.${name}`).join("");
        return `${element.tagName.toLowerCase()}${id}${classes}`;
      };
      const wide = (element: Element) => element.getBoundingClientRect().right > width + 1;
      const elements = [...document.body.querySelectorAll("*")]
        .filter((element) => wide(element) && !(element.parentElement && wide(element.parentElement)))
        .slice(0, 5)
        .map(selector);
      return { width: document.documentElement.scrollWidth, elements };
    }, WIDTH);
    const anchors = await page.evaluate(() =>
      [...document.querySelectorAll("a[href]")].map((element) => (element as HTMLAnchorElement).href),
    );
    const resources = await page.evaluate(() =>
      [...document.querySelectorAll("[src], link[href]")]
        .map((element) => (element as HTMLImageElement).src || (element as HTMLLinkElement).href)
        .filter((value) => typeof value === "string" && value !== ""),
    );
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(
      async (tags) => {
        const engine = (window as unknown as { axe: { run: (context: Document, options: object) => Promise<unknown> } })
          .axe;
        const results = (await engine.run(document, {
          runOnly: { type: "tag", values: tags },
          resultTypes: ["violations"],
        })) as { violations: { id: string; help: string; helpUrl: string; nodes: { target: unknown[] }[] }[] };
        return results.violations.map((violation) => ({
          id: violation.id,
          help: violation.help,
          helpUrl: violation.helpUrl,
          targets: violation.nodes.map((node) => node.target.map(String).join(" ")),
        }));
      },
      [...WCAG_21_AA],
    );
    const own = [...new Set([...anchors, ...resources].map(withoutHash))]
      .filter((link) => link.startsWith(base))
      .sort();
    const statuses = await Promise.all(
      own.map(async (link) => ({ url: link, status: (await links.get(link)).status })),
    );
    return {
      requests: loaded,
      cookies,
      storage,
      overflow,
      axe: violations.sort((a, b) => a.id.localeCompare(b.id)),
      links: statuses,
      ...(withoutJavaScript ? { withoutJavaScript: await withoutJavaScript } : {}),
      anchors,
    };
  } finally {
    await context.close();
  }
}

/** The marker of a page the explainer runtime renders; only such a page is visited again without JavaScript. */
const EXPLAINER_MARKER = 'meta[name="lernapps-archetype"][content="explainer"]';
/**
 * The parts of an explainer page that only JavaScript shows, hidden without it: a component's island, a generated
 * exercise's live task, a question's controls and its reveal after "Prüfen". What is inside is not read.
 */
const ONLY_WITH_JAVASCRIPT = [".explainer-island", ".explainer-live", ".quiz-reveal", ".quiz-actions"];

/**
 * What an explainer page shows with JavaScript off (in `context`, made with JavaScript disabled): its h1, headings,
 * formulas and figures, each exercise's "Lösung" and each component's nojs text, with every <details> opened, as a
 * learner opens a "Lösung". Visible means rendered, not hidden by an attribute or a style.
 */
async function readWithoutJavaScript(context: BrowserContext, url: string): Promise<WithoutJavaScript> {
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "load" });
    return await page.evaluate((skip) => {
      const fold = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ").trim();
      for (const details of document.querySelectorAll("details")) details.open = true;
      const read = (selector: string, root: ParentNode = document) =>
        [...root.querySelectorAll(selector)].filter((element) => element.closest(skip) === null);
      const visible = (element: Element) =>
        element.checkVisibility({ opacityProperty: true, visibilityProperty: true });
      // what an element shows: innerText for HTML, the text of MathML and SVG; nothing when it is not visible
      const shown = (element: Element) =>
        visible(element) ? fold(element instanceof HTMLElement ? element.innerText : element.textContent) : "";
      // the section an element is in: the closest heading with an id before it
      const section = (element: Element) => {
        const heading = document.evaluate(
          "preceding::*[self::h2 or self::h3 or self::h4][@id][1]",
          element,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null,
        ).singleNodeValue;
        return heading instanceof Element ? ` in #${heading.id}` : "";
      };
      const labelledBy = (element: Element) =>
        (element.getAttribute("aria-labelledby") ?? "")
          .split(/\s+/)
          .map((id) => fold(id === "" ? "" : document.getElementById(id)?.textContent))
          .join(" ")
          .trim();
      const own = (element: Element) =>
        element.localName === "img"
          ? element.getAttribute("alt")
          : element.localName === "figure"
            ? element.querySelector(":scope > figcaption")?.textContent
            : element.querySelector(":scope > title")?.textContent;
      const accessibleName = (element: Element) =>
        fold(element.getAttribute("aria-label")) ||
        labelledBy(element) ||
        fold(own(element)) ||
        fold(element.getAttribute("title"));
      const headings = read("h1, h2, h3, h4, h5, h6").map((element) => ({
        kind: "heading" as const,
        where: `${element.localName}${element.id === "" ? ` "${fold(element.textContent).slice(0, 40)}"` : `#${element.id}`}`,
        visible: visible(element),
        text: shown(element),
      }));
      const formulas = read("math").map((element, index) => ({
        kind: "formula" as const,
        where: `formula ${index + 1}${section(element)}`,
        visible: visible(element),
        text: shown(element),
      }));
      const figures = read('figure, img, [role="img"]').map((element, index) => ({
        kind: "figure" as const,
        where: `figure ${index + 1} (${element.localName})${section(element)}`,
        visible: visible(element),
        text: accessibleName(element),
      }));
      return {
        h1: headings.find((heading) => heading.where.startsWith("h1") && heading.text !== "")?.text ?? "",
        parts: [...headings, ...formulas, ...figures],
        exercises: read(".explainer-exercise").map((element, index) => ({
          where: `exercise ${element.id === "" ? String(index + 1) : `#${element.id}`}`,
          solutions: read("details.explainer-solution", element).map((details) =>
            visible(details)
              ? fold(
                  [...details.childNodes]
                    .filter((node) => !(node instanceof Element && node.localName === "summary"))
                    .map((node) => (node instanceof HTMLElement ? node.innerText : node.textContent))
                    .join(" "),
                )
              : "",
          ),
        })),
        components: read(".explainer-component").map((element) => {
          const nojs = element.querySelector(":scope > .explainer-nojs");
          return {
            where: `component ${element.getAttribute("data-component") ?? ""}${section(element)}`,
            ...(nojs === null ? {} : { nojs: shown(nojs) }),
          };
        }),
      };
    }, ONLY_WITH_JAVASCRIPT.join(", "));
  } finally {
    await page.close();
  }
}
