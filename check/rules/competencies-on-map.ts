// The strand of an explainer in format 2 and the competencies of its pages are on the learning map: the check loads
// the map of the subject (https://lernapps.net/apps/map/<subject>.json, the subject the part of the strand before
// "/") and warns before the push about a strand the subject does not have, an id it does not have, and an id of
// another strand. Advice: at the listing the catalog checks the same as an error (entry-learning-map of
// lernapps/apps). The map not reachable (no network, not deployed yet) is one hint that it could not check. It needs
// the app's repo: src/app.yaml with `format: 2` and a strand other than `none`.
import type { Check, Problem } from "../check.ts";
import { loadMap, mapUrl, readExplainer } from "../explainer-map.ts";

export default {
  id: "competencies-on-map",
  url: "https://lernapps.net/tooling/rules/#competencies-on-map",
  description:
    "The strand of an explainer in format 2 is a strand of its subject's learning map, and every page's competencies belong to it.",
  severity: "warning",
  run: async ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined || explainer.strand === "none") return undefined;
    const [subject = "", strandId = ""] = explainer.strand.split("/");
    const url = mapUrl(subject);
    const loaded = await loadMap(url);
    if ("failed" in loaded) {
      return [
        {
          where: explainer.strandAt,
          found: `the strand and the competencies could not be checked: ${loaded.failed}`,
          fix: "Nothing to fix for this here: check again later (lernapps check); the listing checks the ids against the map",
          severity: "hint",
        },
      ];
    }
    const strands = loaded.map.strands;
    const strandOf = new Map(
      strands.flatMap((strand) => strand.competencies.map((competency) => [competency.id, strand.id] as const)),
    );
    const problems: Problem[] = [];
    const strand = strands.find((candidate) => candidate.id === strandId);
    if (strand === undefined) {
      problems.push({
        where: explainer.strandAt,
        found: `the strand ${explainer.strand} is not on the map of ${subject} (its strands: ${strands.map((s) => s.id).join(", ")})`,
        fix: `Name a strand of ${url} as <subject>/<strand>, or strand: none; a strand the map lacks is proposed to lernapps/apps (map/${subject}.yaml)`,
      });
    }
    for (const page of explainer.pages) {
      for (const id of page.competencies) {
        const of = strandOf.get(id);
        if (of === undefined) {
          problems.push({
            where: page.where,
            found: `the competency ${id} is not on the map of ${subject}`,
            fix: `Use an id of the strand ${explainer.strand} from ${url}; a competency the map lacks is proposed to lernapps/apps (map/${subject}.yaml), never invented in the app`,
          });
        } else if (strand !== undefined && of !== strandId) {
          problems.push({
            where: page.where,
            found: `the competency ${id} belongs to the strand ${subject}/${of}, not to the app's strand ${explainer.strand}`,
            fix: `Practise only competencies of ${explainer.strand}; a page of ${subject}/${of} belongs in an app of that strand`,
          });
        }
      }
    }
    return problems;
  },
} satisfies Check;
