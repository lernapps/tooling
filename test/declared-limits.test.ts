// The checks `accessible` and `usable-at-360px` as `lernapps check --entry` runs them: their findings are errors, and
// warnings when the entry declares what the app does not offer (`limits`, entry.v1.schema.json of lernapps/apps).
// On a visit given directly, without a browser: fast enough for every push.
import { describe, expect, test } from "vite-plus/test";
import accessible from "../check/rules/accessible.ts";
import usable from "../check/rules/usable-at-360px.ts";
import type { Check, Context, Entry, PageVisit, Problem } from "../check/check.ts";

const BASE = "https://example.org/tipp-spiel/";
/** A page with one violation of each rule. */
const PAGE: PageVisit = {
  page: BASE,
  requests: [],
  cookies: [],
  storage: [],
  access: [],
  overflow: { width: 720, elements: ["main > .keyboard"] },
  axe: [
    { id: "label", help: "Form elements must have labels", helpUrl: "https://example.org/label", targets: ["#input"] },
  ],
  links: [],
};
const context = (entry?: Partial<Entry>): Context => ({
  app: { base: BASE, pages: [PAGE], fitness: { storage: "none", thirdParty: "none" } },
  ...(entry ? { entry: { file: "entries/tipp-spiel.yaml", value: { url: BASE, ...entry } } } : {}),
});
/** The severity of each finding, as the report gives it: the problem's own, or the check's. */
const severities = (check: Check, ctx: Context) =>
  (check.run(ctx) as Problem[]).map((problem) => problem.severity ?? check.severity);

describe.each([accessible, usable])("$id", (check) => {
  test("finds an error without an entry, and with an entry without limits", () => {
    expect(severities(check, context())).toEqual(["error"]);
    expect(severities(check, context({}))).toEqual(["error"]);
    expect(severities(check, context({ limits: " " }))).toEqual(["error"]);
  });

  test("finds a warning when the entry declares the app's limits", () => {
    const limits = "Nicht mit Screenreader bedienbar; auf dem Handy nicht sinnvoll, weil eine Tastatur nötig ist.";
    expect(severities(check, context({ limits }))).toEqual(["warning"]);
  });
});
