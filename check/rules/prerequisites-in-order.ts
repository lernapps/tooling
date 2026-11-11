// The prerequisites of an explainer's pages come in the order of the app (KD-03, KD-03a and KD-04 of lernapps/apps#226).
// For each page, each competency it practises and each direct prerequisite r of it (`requires` in the subject's map):
//   - fine: r is practised on this page or an earlier one, or repeated on a recap page before it
//     (`recap: <subject>/<r>`), or the page's text links r's page on the map (…/apps/map/<subject>/c/<r>/);
//   - order: the app practises or repeats r, but only after this page;
//   - gap: the app neither practises nor repeats r, but practises a competency r builds on (an ancestor of r, through
//     `requires`): r is missing between two competencies of the app;
//   - entry: the app has nothing of r's chain: the app starts here, and a recap page before the page helps;
//   - ahead: the page names r in `ahead` (it comes before r on purpose, e.g. a fixed phrase before the grammar behind
//     it) but the app practises r on no page. Named in `ahead` and practised on any page: fine;
//   - ahead not needed: a page names r in `ahead`, but none of its competencies requires r, or the app already
//     practises r on this or an earlier page, or repeats it before.
// Only direct prerequisites are followed; the chain follows step by step. A recapped competency's own prerequisites
// are not followed. Each prerequisite is judged once, at the first page that needs it. Severity by the subject's
// map: `explainerFocus: competency` a warning, `strand` a hint (at the listing an error for order and gap, or a
// warning; entry-learning-map of lernapps/apps). The map not reachable: no finding, since competencies-on-map already
// says it could not check. It needs the app's repo: src/app.yaml with `format: 2` and a strand other than `none`, or a
// subject.
import type { Check, Problem } from "../check.ts";
import { competencyPage, loadMap, mapUrl, readExplainer, strandsOf, subjectOf } from "../explainer-map.ts";

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default {
  id: "prerequisites-in-order",
  url: "https://lernapps.net/tooling/rules/#prerequisites-in-order",
  description:
    "Every prerequisite of a page's competencies is practised on that page or an earlier one, repeated on a recap page before it, or linked in the page's text; none comes only later, unless the page names it in ahead and the app practises it on another page; none is missing inside the app's chain.",
  severity: "warning",
  run: async ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    const of = explainer === undefined ? undefined : subjectOf(explainer);
    if (explainer === undefined || of === undefined) return undefined;
    const { subject } = of;
    const loaded = await loadMap(mapUrl(subject));
    if ("failed" in loaded) return [];
    const severity = loaded.map.explainerFocus === "competency" ? "warning" : "hint";
    const strandOf = strandsOf(loaded.map);
    const requires = new Map(
      loaded.map.strands.flatMap((strand) =>
        strand.competencies.map((competency) => [competency.id, competency.requires ?? []] as const),
      ),
    );
    // The index of the first page that practises a competency, and of the first recap page that repeats it.
    const practised = new Map<string, number>();
    const recapped = new Map<string, number>();
    explainer.pages.forEach((page, index) => {
      for (const id of page.competencies) if (!practised.has(id)) practised.set(id, index);
      const id = page.recap?.startsWith(`${subject}/`) ? page.recap.slice(subject.length + 1) : undefined;
      if (id !== undefined && !recapped.has(id)) recapped.set(id, index);
    });
    /** A competency r builds on (transitively) that the app practises, or undefined. */
    const practisedAncestor = (id: string): string | undefined => {
      const seen = new Set<string>();
      const queue = [...(requires.get(id) ?? [])];
      while (queue.length > 0) {
        const next = queue.shift() as string;
        if (seen.has(next)) continue;
        seen.add(next);
        if (practised.has(next)) return next;
        queue.push(...(requires.get(next) ?? []));
      }
      return undefined;
    };
    // A strand app may practise competencies of its strand only; a unit app those of every strand of its subject.
    const mayPractise = (id: string) =>
      "subject" in explainer || explainer.strand === `${subject}/${strandOf.get(id) ?? ""}`;
    const judged = new Set<string>();
    const problems: Problem[] = [];
    explainer.pages.forEach((page, index) => {
      // `ahead` only where it is needed: a direct prerequisite of the page that the app practises only after it.
      for (const prerequisite of page.ahead) {
        const needed = page.competencies.some((id) => requires.get(id)?.includes(prerequisite));
        const at = practised.get(prerequisite);
        const recap = recapped.get(prerequisite);
        if (needed && !((at !== undefined && at <= index) || (recap !== undefined && recap < index))) continue;
        problems.push({
          where: page.where,
          found: needed
            ? `the page names ${subject}/${prerequisite} in ahead, but the app has it before or on this page: ahead not needed`
            : `the page names ${subject}/${prerequisite} in ahead, but no competency of the page requires it: ahead not needed`,
          fix: `Remove ${prerequisite} from ahead`,
          severity,
        });
      }
      for (const id of page.competencies) {
        for (const prerequisite of requires.get(id) ?? []) {
          const strand = strandOf.get(prerequisite);
          if (strand === undefined || judged.has(prerequisite)) continue;
          judged.add(prerequisite);
          const at = practised.get(prerequisite);
          const recap = recapped.get(prerequisite);
          if (page.ahead.includes(prerequisite)) {
            if (at === undefined)
              problems.push({
                where: page.where,
                found: `${id} comes ahead of ${subject}/${prerequisite} on purpose (ahead), but the app practises ${prerequisite} on no page: ahead`,
                fix: `Practise ${prerequisite} on a page of the app, or remove it from ahead`,
                severity,
              });
            continue;
          }
          if ((at !== undefined && at <= index) || (recap !== undefined && recap < index)) continue;
          const link = new RegExp(`/apps/map/${escape(subject)}/c/${escape(prerequisite)}(?:/|\\b)`);
          if (link.test(page.text)) continue;
          const name = `${subject}/${prerequisite} (strand ${subject}/${strand})`;
          const url = competencyPage(subject, prerequisite);
          const recapFix = `a recap page (recap: ${subject}/${prerequisite}, descriptive blocks only) before this page`;
          if (at !== undefined || recap !== undefined) {
            const later = explainer.pages[at ?? recap ?? 0]?.where ?? "";
            problems.push({
              where: page.where,
              found: `${id} requires ${name}, which the app ${at === undefined ? "repeats" : "practises"} only later (${later}): order`,
              fix: `Move the page ${later} before this page, or this page after it; a prerequisite comes first`,
              severity,
            });
            continue;
          }
          const ancestor = practisedAncestor(prerequisite);
          const practise = mayPractise(prerequisite) ? `practise it on a page before this one, add ` : "add ";
          if (ancestor !== undefined) {
            problems.push({
              where: page.where,
              found: `${id} requires ${name}, which the app does not practise, though it practises ${ancestor} that ${prerequisite} builds on (${explainer.pages[practised.get(ancestor) ?? 0]?.where ?? ""}): gap`,
              fix: `Close the gap: ${practise}${recapFix}, or name it in the page's text with a link to ${url}`,
              severity,
            });
          } else {
            problems.push({
              where: page.where,
              found: `${id} requires ${name}, which the app does not practise; no recap page before this page repeats it and the page does not link it: entry`,
              fix: `The app starts here: add ${recapFix}, or name it in the page's text with a link to ${url}`,
              severity,
            });
          }
        }
      }
    });
    return problems;
  },
} satisfies Check;
