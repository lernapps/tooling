// An explainer in format 2 teaches, as a rule, one competency of the learning map per page; a large competency may
// take several pages. The schema allows several competencies on a page; this check gives a hint for each such page
// (skill lernapps-explainer-design). It needs the app's repo: src/app.yaml with `format: 2`.
import type { Check } from "../check.ts";
import { readExplainer } from "../explainer-map.ts";

export default {
  id: "one-competency-per-page",
  url: "https://lernapps.net/tooling/rules/#one-competency-per-page",
  description: "Each page of an explainer in format 2 names at most one competency of the learning map.",
  severity: "hint",
  run: ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined) return undefined;
    return explainer.pages
      .filter((page) => page.competencies.length > 1)
      .map((page) => ({
        where: page.where,
        found: `the page names ${page.competencies.length} competencies (${page.competencies.join(", ")})`,
        fix: "Give each competency a page of its own, and keep one id in competencies on each; several pages for one large competency are fine",
      }));
  },
} satisfies Check;
