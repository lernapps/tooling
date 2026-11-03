// The strand of an explainer in format 2 and the competencies of its pages are on the learning map: the check loads
// the map of the subject (https://lernapps.net/apps/map/<subject>.json, the subject the part of the strand before
// "/") and warns before the push about a strand the subject does not have, an id it does not have, and an id of
// another strand, and about a recap page whose `recap` is not on the map or that the app also practises on a page of
// its own (a recap repeats a competency the app does not practise, of any strand, maybe of another subject, whose map
// is then loaded too; KD-27 of the learning map). Advice: at
// the listing the catalog checks the same as an error (entry-learning-map of
// lernapps/apps). The map not reachable (no network, not deployed yet) is one hint that it could not check. It needs
// the app's repo: src/app.yaml with `format: 2` and a strand other than `none`.
import type { Check, Problem } from "../check.ts";
import { loadMap, mapUrl, readExplainer, strandsOf, type SubjectMap } from "../explainer-map.ts";

const RECAP = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

export default {
  id: "competencies-on-map",
  url: "https://lernapps.net/tooling/rules/#competencies-on-map",
  description:
    "The strand of an explainer in format 2 is a strand of its subject's learning map, every page's competencies belong to it, and every recap page repeats a competency of the map that the app does not practise.",
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
    const strandOf = strandsOf(loaded.map);
    const problems: Problem[] = [];
    const practised = new Map<string, string>();
    for (const page of explainer.pages)
      for (const id of page.competencies) if (!practised.has(id)) practised.set(id, page.where);
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
      if (page.recap !== undefined)
        problems.push(...(await recapProblems(page.where, page.recap, { subject, map: loaded.map, url, practised })));
    }
    return problems;
  },
} satisfies Check;

/** A recap page's `recap`: a competency of a map, of any strand, that the app does not practise on a page of its own. */
async function recapProblems(
  where: string,
  recap: string,
  app: { subject: string; map: SubjectMap; url: string; practised: Map<string, string> },
): Promise<Problem[]> {
  const { subject, url, practised } = app;
  const [, recapSubject = "", id = ""] = RECAP.exec(recap) ?? [];
  if (recapSubject === "") {
    return [
      {
        where,
        found: `the recap ${recap} is not <subject>/<competency>`,
        fix: `Name the competency the page repeats as <subject>/<competency>, e.g. ${subject}/<id> from ${url}`,
      },
    ];
  }
  const other = recapSubject === subject ? { map: app.map } : await loadMap(mapUrl(recapSubject));
  if ("failed" in other) {
    return [
      {
        where,
        found: `the recap ${recap} could not be checked: ${other.failed}`,
        fix: "Nothing to fix for this here: check again later (lernapps check); the listing checks the recap against the map",
        severity: "hint",
      },
    ];
  }
  const of = strandsOf(other.map).get(id);
  if (of === undefined) {
    return [
      {
        where,
        found: `the recap ${recap} is not on the map of ${recapSubject}`,
        fix: `Name a competency of ${mapUrl(recapSubject)} that a page of this app requires; a competency the map lacks is proposed to lernapps/apps (map/${recapSubject}.yaml)`,
      },
    ];
  }
  const page = recapSubject === subject ? practised.get(id) : undefined;
  if (page !== undefined) {
    return [
      {
        where,
        found: `the recap ${recap} is a competency the app also practises (${page})`,
        fix: `A competency the app practises needs no recap: remove this recap page, or the competency ${id} from the page that practises it`,
      },
    ];
  }
  return [];
}
