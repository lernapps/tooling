// The check own-data-only on visits given directly, without a browser: the app's own prefix comes from the entry's
// name, or without an entry from what the app writes; anything else it touches is a finding. Fast enough for every push.
import { describe, expect, test } from "vite-plus/test";
import check from "../check/rules/own-data-only.ts";
import type { Context, PageVisit, Problem, StorageAccess } from "../check/check.ts";

const BASE = "https://lernapps.net/brueche/";
const visit = (storage: string[], access: StorageAccess[]): PageVisit => ({
  page: BASE,
  requests: [],
  cookies: [],
  storage,
  access,
  overflow: { width: 360, elements: [] },
  axe: [],
  links: [],
});
const context = (page: PageVisit, entryFile?: string): Context => ({
  app: { base: BASE, pages: [page], fitness: { storage: "device", thirdParty: "none" } },
  ...(entryFile ? { entry: { file: entryFile, value: { url: BASE } } } : {}),
});
const found = (ctx: Context) => (check.run(ctx) as Problem[]).map((problem) => problem.found);

describe("own-data-only", () => {
  test("has nothing to check without a built app", () => {
    expect(check.run({})).toBeUndefined();
  });

  test("an app that touches only keys under the prefix of its entry passes", () => {
    const page = visit(
      ["localStorage lernapps:brueche:fortschritt"],
      [
        { area: "localStorage", action: "read", name: "lernapps:brueche:fortschritt" },
        { area: "localStorage", action: "write", name: "lernapps:brueche:fortschritt" },
        { area: "IndexedDB", action: "open", name: "lernapps:brueche:aufgaben" },
      ],
    );
    expect(found(context(page, "entries/brueche.yaml"))).toEqual([]);
  });

  test("the prefix is the entry's name: another app's prefix is not the app's own", () => {
    const page = visit(["localStorage lernapps:andere:fortschritt"], []);
    expect(found(context(page, "entries/brueche.yaml"))).toEqual([
      'writes localStorage "lernapps:andere:fortschritt", which is not its own',
    ]);
  });

  test("reading another app's key, a key without prefix, clearing and looking up every cache are findings", () => {
    const page = visit(
      ["localStorage theme"],
      [
        { area: "localStorage", action: "read", name: "lernapps:andere-app:fortschritt" },
        { area: "sessionStorage", action: "clear", name: "" },
        { area: "Cache", action: "match", name: "" },
        { area: "IndexedDB", action: "delete", name: "andere" },
      ],
    );
    expect(found(context(page, "entries/brueche.yaml"))).toEqual([
      'reads localStorage "lernapps:andere-app:fortschritt", which is not its own',
      "clears all of sessionStorage, the data of every app on lernapps.net",
      "looks up a request in every cache, also in those of other apps",
      'deletes IndexedDB "andere", which is not its own',
      'writes localStorage "theme", which is not its own',
    ]);
  });

  test("without an entry, the prefix of what the app writes is its own, and what it reads of others is a finding", () => {
    const page = visit(
      ["localStorage lernapps:brueche:fortschritt"],
      [
        { area: "localStorage", action: "read", name: "lernapps:andere-app:fortschritt" },
        { area: "localStorage", action: "write", name: "lernapps:brueche:fortschritt" },
      ],
    );
    const problems = check.run(context(page)) as Problem[];
    expect(problems.map((problem) => problem.found)).toEqual([
      'reads localStorage "lernapps:andere-app:fortschritt", which is not its own',
    ]);
    expect(problems[0]?.fix).toContain('createStorage("brueche")');
  });

  test("without an entry, an app that only reads its own key on load passes; the other app's data is never its own", () => {
    const page = visit(
      [],
      [
        { area: "localStorage", action: "read", name: "lernapps:andere-app:fortschritt" },
        { area: "localStorage", action: "read", name: "lernapps:prozent:tutor-way" },
      ],
    );
    expect(found(context(page))).toEqual([
      'reads localStorage "lernapps:andere-app:fortschritt", which is not its own',
    ]);
    expect(found(context(visit([], [{ area: "localStorage", action: "read", name: "lernapps:prozent:a" }])))).toEqual(
      [],
    );
  });

  test("without an entry and without any prefix, every name the app touches is a finding", () => {
    const page = visit(["localStorage fortschritt"], [{ area: "localStorage", action: "write", name: "fortschritt" }]);
    expect(found(context(page))).toEqual(['writes localStorage "fortschritt", which is not its own']);
  });

  test("the learner's settings for every app and for the page's archetype are every app's, another archetype's not", () => {
    const page = {
      ...visit(
        ["localStorage lernapps:settings:schrift", "localStorage lernapps:settings:explainer:bedarf"],
        [
          { area: "localStorage", action: "read", name: "lernapps:settings:schrift" },
          { area: "localStorage", action: "read", name: "lernapps:settings:explainer:bedarf" },
          { area: "localStorage", action: "read", name: "lernapps:settings:quiz:bedarf" },
        ],
      ),
      archetype: "explainer",
    };
    expect(found(context(page, "entries/brueche.yaml"))).toEqual([
      'reads localStorage "lernapps:settings:quiz:bedarf", which is not its own',
    ]);
  });

  test("without an archetype, only the settings for every app are the page's", () => {
    const page = visit(
      [],
      [
        { area: "localStorage", action: "read", name: "lernapps:settings:schrift" },
        { area: "localStorage", action: "read", name: "lernapps:settings:explainer:bedarf" },
      ],
    );
    expect(found(context(page, "entries/brueche.yaml"))).toEqual([
      'reads localStorage "lernapps:settings:explainer:bedarf", which is not its own',
    ]);
  });

  test("without an entry, settings are never the app's own prefix; an entry named settings is a finding", () => {
    const page = visit(
      ["localStorage lernapps:settings:schrift", "localStorage lernapps:brueche:stand"],
      [{ area: "localStorage", action: "write", name: "lernapps:settings:schrift" }],
    );
    const problems = check.run(context(page)) as Problem[];
    expect(problems).toEqual([]);
    expect(found(context(page, "entries/settings.yaml"))).toEqual([
      "has the id settings, the prefix of the learner's settings for every app",
      'writes localStorage "lernapps:brueche:stand", which is not its own',
    ]);
  });
});
