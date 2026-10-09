// What a check of the check CLI is and what it gets. Each check lives in check/rules/<name>.ts and carries its rule
// id (docs/arc42 ch. 8, concept "Rule catalog"): `export default { id, url, description, severity, run } satisfies
// Check`. The CLI runs every check there; a check returns undefined when what it needs does not exist (no built
// app, no repo, no entry), and the report then leaves its rule out of the rules checked.

export type Severity = "error" | "warning" | "hint";

/** One problem, in the shape of every message: the CLI adds the rule id, severity and link. */
export interface Problem {
  /** File and line, page and element, or the command. */
  where: string;
  /** What was found. */
  found: string;
  /** How to fix it. */
  fix: string;
}

/** What one page of the built app did when a browser opened it, without a click. */
export interface PageVisit {
  /** The page: a file of the bundle (`kuerzen/index.html`) or, for an app on a URL, the URL. */
  page: string;
  /** Every request the page made while loading, before any click: absolute URL and method. */
  requests: { url: string; method: string }[];
  /** Names of the cookies the page set. */
  cookies: string[];
  /** Keys in localStorage and sessionStorage, names of IndexedDB databases. */
  storage: string[];
  /** At 360 px width: the document's width, and the elements that reach beyond 360 px. */
  overflow: { width: number; elements: string[] };
  /** Violations of WCAG 2.1 A and AA found by axe-core. */
  axe: { id: string; help: string; helpUrl: string; targets: string[] }[];
  /** The page with JavaScript off: its title and visible text. */
  withoutJavaScript: { title: string; heading: string; text: string };
  /** Links and resources of the app (below its base URL), with the HTTP status each one answers with. */
  links: { url: string; status: number }[];
}

/** The fields of a catalog entry (entry.v1.schema.json of lernapps/apps) that the checks compare with the app. */
export interface Entry {
  url: string;
  topics?: { title: string; path: string }[];
  fitness?: { storage?: string; thirdParty?: string };
}

/** The fitness values measured on the built app, in the entry's words. */
export interface Fitness {
  /** none: nothing stored; device: only in the browser. */
  storage: "none" | "device";
  /** none: no request to another host before a click; before-click: requests the listing does not allow. */
  thirdParty: "none" | "before-click";
}

/** The built app as a browser saw it; `bundle` is its directory when it was not checked on a URL. */
export interface App {
  base: string;
  pages: PageVisit[];
  fitness: Fitness;
  bundle?: string;
}

/** What exists for this run; anything may be missing. */
export interface Context {
  /** The built app, served at `base`: one visit per page reachable from its start page. */
  app?: App;
  /** The app's repo (`lernapps check` without a target), with its node_modules. */
  project?: string;
  /** `--site <path>`: the app is served on lernapps.net at this path. */
  site?: string;
  /** `--entry <file>`: the catalog entry to check against the app. */
  entry?: { file: string; value: Entry };
}

export interface Check {
  id: string;
  /** https://lernapps.net/tooling/rules/#<id>, the link of every message. */
  url: string;
  description: string;
  severity: Severity;
  run(context: Context): Problem[] | undefined | Promise<Problem[] | undefined>;
}

/** The fitness values of the visits. */
export function measure(pages: readonly PageVisit[], base: string): Fitness {
  const origin = new URL(base).origin;
  return {
    storage: pages.some((page) => page.cookies.length > 0 || page.storage.length > 0) ? "device" : "none",
    thirdParty: pages.some((page) => page.requests.some((request) => new URL(request.url).origin !== origin))
      ? "before-click"
      : "none",
  };
}
