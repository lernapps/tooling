// The strand or subject of an explainer in format 2 and the competencies of its pages are on the learning map: the
// check loads the map of the subject (https://lernapps.net/apps/map/<subject>.json; of a strand app the part of the
// strand before "/") and warns before the push about a strand the subject does not have, an id it does not have, and
// an id of another strand, and about a recap page whose `recap` is not on the map or that the app also practises on a
// page of its own (a recap repeats a competency the app does not practise, of any strand, maybe of another subject,
// whose map is then loaded too; KD-27 of the learning map). A unit app (`subject: <subject>`) may practise competencies
// of every strand of its subject, but only when the subject's map has `explainerFocus: competency`; then each page
// practises competencies of one strand only (KD-07 of lernapps/apps#226). Advice: at the listing the catalog checks the
// same as an error (entry-learning-map of lernapps/apps). The map not reachable (no network, not deployed yet) is one
// hint that it could not check. It needs the app's repo: src/app.yaml with `format: 2` and a strand other than `none`,
// or a subject.
import type { Check, Problem } from "../check.ts";
import { loadMap, mapUrl, readExplainer, strandsOf, subjectOf, type SubjectMap } from "../explainer-map.ts";

const RECAP = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;

export default {
  id: "competencies-on-map",
  url: "https://lernapps.net/tooling/rules/#competencies-on-map",
  description:
    "The strand or subject of an explainer in format 2 is on its subject's learning map (a subject only when the map's explainerFocus is competency), every page's competencies belong to the strand, or of a subject to one strand per page, and every recap page repeats a competency of the map that the app does not practise.",
  severity: "warning",
  run: async ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    const of = explainer === undefined ? undefined : subjectOf(explainer);
    if (explainer === undefined || of === undefined) return undefined;
    const { subject, at } = of;
    const url = mapUrl(subject);
    const loaded = await loadMap(url);
    if ("failed" in loaded) {
      const what = "subject" in explainer ? "the subject" : "the strand";
      return [
        {
          where: at,
          found: `${what} and the competencies could not be checked: ${loaded.failed}`,
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
    // A strand app: only its strand's competencies (undefined when the map lacks the strand). A unit app: any strand.
    let strandId: string | undefined;
    if ("subject" in explainer) {
      if (loaded.map.explainerFocus !== "competency") {
        problems.push({
          where: at,
          found: `the app names subject: ${subject}, but the map of ${subject} has explainerFocus ${loaded.map.explainerFocus}: its explainers practise one strand each`,
          fix: `Name one strand instead (strand: ${subject}/<strand>, one of ${strands.map((s) => s.id).join(", ")}) and practise only its competencies; a unit app across strands is for subjects whose map has explainerFocus: competency`,
        });
      }
    } else {
      const [, id = ""] = explainer.strand.split("/");
      if (strands.some((candidate) => candidate.id === id)) strandId = id;
      else {
        problems.push({
          where: at,
          found: `the strand ${explainer.strand} is not on the map of ${subject} (its strands: ${strands.map((s) => s.id).join(", ")})`,
          fix: `Name a strand of ${url} as <subject>/<strand>, or strand: none; a strand the map lacks is proposed to lernapps/apps (map/${subject}.yaml)`,
        });
      }
    }
    const ofWhat = "subject" in explainer ? `the subject ${subject}` : `the strand ${explainer.strand}`;
    for (const page of explainer.pages) {
      const pageStrands = new Map<string, string[]>();
      for (const id of page.competencies) {
        const strand = strandOf.get(id);
        if (strand === undefined) {
          problems.push({
            where: page.where,
            found: `the competency ${id} is not on the map of ${subject}`,
            fix: `Use an id of ${ofWhat} from ${url}; a competency the map lacks is proposed to lernapps/apps (map/${subject}.yaml), never invented in the app`,
          });
          continue;
        }
        pageStrands.set(strand, [...(pageStrands.get(strand) ?? []), id]);
        if (!("subject" in explainer) && strandId !== undefined && strand !== strandId) {
          problems.push({
            where: page.where,
            found: `the competency ${id} belongs to the strand ${subject}/${strand}, not to the app's strand ${explainer.strand}`,
            fix: `Practise only competencies of ${explainer.strand}; a page of ${subject}/${strand} belongs in an app of that strand`,
          });
        }
      }
      if ("subject" in explainer && loaded.map.explainerFocus === "competency" && pageStrands.size > 1) {
        const list = [...pageStrands].map(([strand, ids]) => `${subject}/${strand}: ${ids.join(", ")}`).join("; ");
        problems.push({
          where: page.where,
          found: `the page practises competencies of ${pageStrands.size} strands (${list})`,
          fix: "Give each strand a page of its own: a page practises competencies of one strand, so the method of each strand stays the same",
        });
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
