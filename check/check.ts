// What a check of the check CLI is and what it gets. Each check lives in check/rules/<name>.ts and carries its rule
// id (docs/arc42 ch. 8, concept "Rule catalog"): `export default { id, url, description, severity, run } satisfies
// Check`. The CLI runs every check there; a check returns undefined when what it needs does not exist (no built
// app, no repo, no entry), and the report then leaves its rule out of the rules checked.

/**
 * Data of another app, put into localStorage and sessionStorage before a page loads: on lernapps.net every app shares
 * one origin, so an app that reads what is not its own finds it (rule own-data-only). Left out of the storage a visit
 * records.
 */
export const FOREIGN_KEY = "lernapps:andere-app:fortschritt";

export type Severity = "error" | "warning" | "hint";

/** One problem, in the shape of every message: the CLI adds the rule id, severity and link. */
export interface Problem {
  /** File and line, page and element, or the command. */
  where: string;
  /** What was found. */
  found: string;
  /** How to fix it. */
  fix: string;
  /**
   * Lower than the check's severity, for what the check could not decide: a link the server would not answer
   * because of a rate limit is a hint, not an error.
   */
  severity?: Severity;
}

/** What one page of the built app did when a browser opened it, without a click. */
export interface PageVisit {
  /** The page: a file of the bundle (`kuerzen/index.html`) or, for an app on a URL, the URL. */
  page: string;
  /** Every request the page made while loading, before any click: absolute URL and method. */
  requests: { url: string; method: string }[];
  /** Names of the cookies the page set. */
  cookies: string[];
  /** Keys in localStorage and sessionStorage, names of IndexedDB databases and of caches (Cache API). */
  storage: string[];
  /**
   * What the page's scripts did with stored data while loading, by name (check/visit.ts records it): read, write or
   * remove a key of localStorage or sessionStorage, clear one of them, open or delete an IndexedDB database or a
   * cache, look something up in every cache. Listing the keys is not recorded: the app's own storage needs it.
   */
  access: StorageAccess[];
  /** At 360 px width: the document's width, and the elements that reach beyond 360 px. */
  overflow: { width: number; elements: string[] };
  /** Violations of WCAG 2.1 A and AA found by axe-core. */
  axe: { id: string; help: string; helpUrl: string; targets: string[] }[];
  /** Links and resources of the app (below its base URL), with the HTTP status each one answers with. */
  links: { url: string; status: number }[];
  /** The archetype the page marks as its own (`<meta name="lernapps-archetype" content="explainer">`), if any. */
  archetype?: string;
  /**
   * Only of a page the explainer runtime marks as its own (`<meta name="lernapps-archetype" content="explainer">`):
   * what it shows with JavaScript off, from a second visit (check/visit.ts). Other pages get no such visit.
   */
  withoutJavaScript?: WithoutJavaScript;
}

/** One access of a page to stored data, by name; `name` is "" for `clear` and for a lookup in every cache. */
export interface StorageAccess {
  area: "localStorage" | "sessionStorage" | "IndexedDB" | "Cache";
  action: "read" | "write" | "remove" | "clear" | "open" | "delete" | "match";
  name: string;
}

/**
 * An explainer page with JavaScript off, every "Lösung" opened. Left out: the parts the runtime fills only with
 * JavaScript, which stay hidden without it (a component's island, a generated exercise's live task, a question's
 * controls and reveal).
 */
export interface WithoutJavaScript {
  /** The visible text of the page's first visible h1, "" when it has none. */
  h1: string;
  /**
   * Its headings, formulas (`<math>`) and figures (`<figure>`, `<img>`, `role="img"`), each with where it is, whether
   * it is visible, and its text: of a heading or a formula what it shows, of a figure its accessible name.
   */
  parts: { kind: "heading" | "formula" | "figure"; where: string; visible: boolean; text: string }[];
  /** Each exercise (`.explainer-exercise`): the visible text of each of its "Lösung", none when it has none. */
  exercises: { where: string; solutions: string[] }[];
  /** Each component (`.explainer-component`): the visible text of its `nojs` text, undefined when it has none. */
  components: { where: string; nojs?: string }[];
}

/** The fields of a catalog entry (entry.v1.schema.json of lernapps/apps) that the checks compare with the app. */
export interface Entry {
  url: string;
  topics?: { title: string; path: string }[];
  fitness?: { storage?: string; thirdParty?: string };
  /** What the app does not offer of the platform's rules (WCAG 2.1 AA, usable at 360 px), because its idea needs it. */
  limits?: string;
}

/**
 * The severity of the findings of a rule an app may deviate from where its idea needs it (accessible,
 * usable-at-360px): a warning when the entry declares the app's limits, otherwise the check's own (undefined).
 */
export function declaredLimit(context: Context): Severity | undefined {
  const limits = context.entry?.value.limits;
  return typeof limits === "string" && limits.trim() !== "" ? "warning" : undefined;
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
  /** Of a bundle: its pages that no link from the start page reaches (visited too, and in `pages`). */
  unreachable?: string[];
  /** Of an app on a URL: the visit stopped at `limit` pages; at least `more` pages linked from them were not visited. */
  stopped?: { limit: number; more: number };
}

/** What exists for this run; anything may be missing. */
export interface Context {
  /** The built app, served at `base`: one visit per page (of a bundle: every page; on a URL: up to a limit). */
  app?: App;
  /** The app's repo (`lernapps check` without a target), with its node_modules. */
  project?: string;
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
