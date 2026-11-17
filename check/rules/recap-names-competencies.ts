// A recap page of an explainer in format 2 names each competency it repeats in its own text. The runtime writes at its
// top only a link to the map for each competency, with the id as the link's text (dec-explainer-recap-page of
// lernapps/app-templates); what the learner should already know, the page's text says. So for each competency in
// `recap` (one, or a list of several), the competency's short name (`name.de` in the map) or its "Ich kann …" sentence
// (`iCan`, without its final full stop) occurs in the page's YAML, ignoring case and line breaks. Missing: a warning
// at the page. The map of each recapped competency's subject is loaded as competencies-on-map loads it (one request per
// map and run). A map that cannot be loaded, or a competency that is not on it: no finding here; competencies-on-map
// says so. It needs the app's repo: src/app.yaml with `format: 2`.
import type { Check, Problem } from "../check.ts";
import { germanOf, loadMap, mapUrl, readExplainer, type MapCompetency } from "../explainer-map.ts";

const RECAP = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

/** `text` for a comparison: lower case, each run of white space one space, no final full stop. */
const plain = (text: string): string => text.toLowerCase().replace(/\s+/g, " ").trim().replace(/[.!]$/, "");

export default {
  id: "recap-names-competencies",
  url: "https://lernapps.net/tooling/rules/#recap-names-competencies",
  description:
    "The text of every recap page of an explainer in format 2 names each competency it repeats: its name on the learning map or its “Ich kann …” sentence.",
  severity: "warning",
  run: async ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined) return undefined;
    const problems: Problem[] = [];
    for (const page of explainer.pages) {
      const text = plain(page.text);
      for (const recap of page.recap ?? []) {
        const [, subject = "", id = ""] = RECAP.exec(recap) ?? [];
        if (subject === "") continue;
        const loaded = await loadMap(mapUrl(subject));
        if ("failed" in loaded) continue;
        const competency: MapCompetency | undefined = loaded.map.strands
          .flatMap((strand) => strand.competencies)
          .find((candidate) => candidate.id === id);
        if (competency === undefined) continue;
        const name = germanOf(competency.name);
        const iCan = germanOf(competency.iCan);
        const named = [name, iCan].some((words) => words !== undefined && text.includes(plain(words)));
        if (named) continue;
        const what = [name === undefined ? undefined : `„${name}“`, iCan === undefined ? undefined : `„${iCan}“`]
          .filter((words) => words !== undefined)
          .join(" or ");
        problems.push({
          where: page.where,
          found: `the recap page does not name ${recap} in its text`,
          fix: `Name the competency in the page's text, best in the short self-check at its start: ${what === "" ? `its name or its "Ich kann …" sentence from ${mapUrl(subject)}` : what}`,
        });
      }
    }
    return problems;
  },
} satisfies Check;
