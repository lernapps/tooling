// An explainer in format 2 and the learning map of the catalog, for the checks one-competency-per-page,
// competencies-on-map and prerequisites-linked. An explainer is in format 2 when its src/app.yaml says `format: 2`; it
// names the app's strand (`<subject>/<strand>` or `none`) and every page the competencies of the map it practises
// (`competencies`, ids of the subject), or, on a recap page, the one competency of another strand it repeats
// (`recap: <subject>/<competency>`). The map of a subject is data at https://lernapps.net/apps/map/<subject>.json (lernapps/apps,
// docs/learning-map-contract.md, section 5).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/** The app's description, relative to its repo. */
export const APP_YAML = "src/app.yaml";

/** Where the maps are, each at <base><subject>.json. */
export const MAP_BASE = "https://lernapps.net/apps/map/";

/** The longest wait for a map: a check without network says it could not check, it never hangs. */
const TIMEOUT = 10_000;

/** One page of the explainer: its file, the line of its competencies, and their ids in the order written. */
export interface ExplainerPage {
  /** `src/<chapter>/<page>.yaml`, with `:<line>` of the competencies (or of the recap) when the page has them. */
  where: string;
  competencies: string[];
  /** A recap page: the `<subject>/<competency>` it repeats, as written. */
  recap?: string;
  /** The page's YAML as written, for the links in its text. */
  text: string;
}

export interface Explainer {
  /** `<subject>/<strand>` or `none`, as src/app.yaml writes it. */
  strand: string;
  /** `src/app.yaml:<line>` of the strand. */
  strandAt: string;
  /** Every page the chapters list, in the app's order; a file that is missing is left out (the build names it). */
  pages: ExplainerPage[];
}

const read = (file: string): unknown => {
  try {
    return parse(readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
};

const ids = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/** The 1-based line of the first top-level `key:` in `text`, or undefined. */
function lineOf(text: string, ...keys: string[]): number | undefined {
  const index = text.split("\n").findIndex((line) => keys.some((key) => line.startsWith(`${key}:`)));
  return index === -1 ? undefined : index + 1;
}

/**
 * The explainer in format 2 in the repo `project`, or undefined when there is none: no src/app.yaml, or one without
 * `format: 2` (format 1, which has no strand), or one the build cannot read.
 */
export function readExplainer(project: string): Explainer | undefined {
  const appFile = join(project, APP_YAML);
  if (!existsSync(appFile)) return undefined;
  const app = read(appFile) as { format?: unknown; strand?: unknown; chapters?: unknown } | undefined;
  if (app?.format !== 2 || typeof app.strand !== "string") return undefined;
  const pages: ExplainerPage[] = [];
  for (const chapter of ids(app.chapters)) {
    const chapterYaml = read(join(project, "src", chapter, "chapter.yaml")) as { pages?: unknown } | undefined;
    for (const page of ids(chapterYaml?.pages)) {
      const file = `src/${chapter}/${page}.yaml`;
      if (!existsSync(join(project, file))) continue;
      const text = readFileSync(join(project, file), "utf8");
      const value = read(join(project, file)) as
        | { competencies?: unknown; competency?: unknown; recap?: unknown }
        | undefined;
      // `competencies` is a list; a single `competency` (an id) is read the same, so either spelling is checked.
      const competencies = typeof value?.competency === "string" ? [value.competency] : ids(value?.competencies);
      const recap = typeof value?.recap === "string" ? value.recap : undefined;
      const line =
        lineOf(text, "competencies", "competency") ?? (recap === undefined ? undefined : lineOf(text, "recap"));
      pages.push({
        where: line === undefined ? file : `${file}:${line}`,
        competencies,
        ...(recap === undefined ? {} : { recap }),
        text,
      });
    }
  }
  const strandLine = lineOf(readFileSync(appFile, "utf8"), "strand");
  return { strand: app.strand, strandAt: strandLine === undefined ? APP_YAML : `${APP_YAML}:${strandLine}`, pages };
}

/** A subject's map as the catalog serves it: its strands, each with the ids of its competencies. */
export interface SubjectMap {
  id: string;
  strands: { id: string; competencies: { id: string; requires?: string[] }[] }[];
}

/** The strand of each competency of the map, by its id. */
export const strandsOf = (map: SubjectMap): Map<string, string> =>
  new Map(
    map.strands.flatMap((strand) => strand.competencies.map((competency) => [competency.id, strand.id] as const)),
  );

/** The address of a competency's page on the map, as a page links it: …/apps/map/<subject>/c/<id>/. */
export const competencyPage = (subject: string, id: string): string =>
  `https://lernapps.net/apps/map/${subject}/c/${id}/`;

/**
 * The address of the map of `subject`. For the tooling's own tests only, not for users: LERNAPPS_TEST_MAP_URL replaces
 * the base (test/explainer-map.test.ts). Not in the help.
 */
export function mapUrl(subject: string, env: NodeJS.ProcessEnv = process.env): string {
  const base = env["LERNAPPS_TEST_MAP_URL"] ?? MAP_BASE;
  return `${base.endsWith("/") ? base : `${base}/`}${subject}.json`;
}

const isMap = (value: unknown): value is SubjectMap =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as { strands?: unknown }).strands) &&
  (value as SubjectMap).strands.every((strand) => typeof strand?.id === "string" && Array.isArray(strand.competencies));

type Loaded = { map: SubjectMap } | { failed: string };

/** The maps loaded in this run, by address: the checks of one run share one request per map. */
const loaded = new Map<string, Promise<Loaded>>();

/** The map at `url`, or why it could not be loaded: no network, a status other than 200, not a map. */
export function loadMap(url: string): Promise<Loaded> {
  let pending = loaded.get(url);
  if (pending === undefined) {
    pending = fetchMap(url);
    loaded.set(url, pending);
  }
  return pending;
}

async function fetchMap(url: string): Promise<Loaded> {
  let response: Response;
  try {
    response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(TIMEOUT) });
  } catch (error) {
    return { failed: `${url} could not be reached (${error instanceof Error ? error.message : String(error)})` };
  }
  if (!response.ok) {
    await response.body?.cancel();
    return {
      failed:
        response.status === 404
          ? `${url} does not exist (404): the subject has no map yet, or it is not the subject's id`
          : `${url} answers ${response.status}`,
    };
  }
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    return { failed: `${url} is not JSON` };
  }
  return isMap(value) ? { map: value } : { failed: `${url} is not the map of a subject (no strands)` };
}
