// A competency an explainer's page practises may require one the app does not practise: of another strand (the map's
// `requires` crosses strands; one app, one strand) or of its own strand outside the app's scope (KD-27 of the learning
// map). Learners need to find it: a recap page of the app repeats it (`recap: <subject>/<competency>`, the runtime
// links its page on the map), or the page's text links its page on the map (…/apps/map/<subject>/c/<id>/). The check
// loads the subject's map and gives a hint for each prerequisite the app does not practise with neither (skill
// lernapps-explainer-design). The map not reachable: no finding, since
// competencies-on-map already says it could not check. It needs the app's repo: src/app.yaml with `format: 2` and a
// strand other than `none`.
import type { Check, Problem } from "../check.ts";
import { competencyPage, loadMap, mapUrl, readExplainer, strandsOf } from "../explainer-map.ts";

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default {
  id: "prerequisites-linked",
  url: "https://lernapps.net/tooling/rules/#prerequisites-linked",
  description:
    "Every prerequisite that a page's competencies require and the app does not practise has a recap page in the app or a link to its page on the learning map.",
  severity: "hint",
  run: async ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined || explainer.strand === "none") return undefined;
    const [subject = ""] = explainer.strand.split("/");
    const loaded = await loadMap(mapUrl(subject));
    if ("failed" in loaded) return [];
    const strandOf = strandsOf(loaded.map);
    const requires = new Map(
      loaded.map.strands.flatMap((strand) =>
        strand.competencies.map((competency) => [competency.id, competency.requires ?? []] as const),
      ),
    );
    const practised = new Set(explainer.pages.flatMap((page) => page.competencies));
    const recapped = new Set(explainer.pages.flatMap((page) => (page.recap === undefined ? [] : [page.recap])));
    const problems: Problem[] = [];
    for (const page of explainer.pages) {
      const named = new Set<string>();
      for (const id of page.competencies) {
        for (const prerequisite of requires.get(id) ?? []) {
          const of = strandOf.get(prerequisite);
          if (of === undefined || practised.has(prerequisite) || named.has(prerequisite)) continue;
          named.add(prerequisite);
          if (recapped.has(`${subject}/${prerequisite}`)) continue;
          const link = new RegExp(`/apps/map/${escape(subject)}/c/${escape(prerequisite)}(?:/|\\b)`);
          if (link.test(page.text)) continue;
          problems.push({
            where: page.where,
            found: `${id} requires ${subject}/${prerequisite} (strand ${subject}/${of}), which the app does not practise; no recap page repeats it and the page does not link it`,
            fix: `Name it in the page's text with a link to ${competencyPage(subject, prerequisite)}, or add a recap page (recap: ${subject}/${prerequisite}, descriptive blocks only) before this page`,
          });
        }
      }
    }
    return problems;
  },
} satisfies Check;
