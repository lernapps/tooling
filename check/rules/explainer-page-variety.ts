// Pages that all practise the same way, with the same few kinds of exercise, make an app a drill: the first page may
// be varied, the rest copies it. The check looks across the pages of an explainer in format 2 for one set of exercise
// kinds that half of them or more share (check/explainer-structure.ts). It needs the app's repo, with `format: 2` in
// src/app.yaml.
import type { Check } from "../check.ts";
import { readExplainer } from "../explainer-map.ts";
import { measurePage } from "../explainer-structure.ts";

/** From this many pages on, the app is looked at as a whole. */
export const MIN_PAGES = 4;
/** Share of the pages with exercises that may have the same set of exercise kinds. */
export const MAX_SAME_SHARE = 0.5;

export default {
  id: "explainer-page-variety",
  url: "https://lernapps.net/tooling/rules/#explainer-page-variety",
  description: "The pages of an explainer in format 2 do not all practise with the same set of exercise kinds.",
  severity: "hint",
  run: ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined) return undefined;
    const sets = explainer.pages
      .map((page) => ({ page, kinds: [...new Set(measurePage(page.text).exercises)].sort().join(", ") }))
      .filter(({ kinds }) => kinds !== "");
    if (sets.length < MIN_PAGES) return [];
    const count = new Map<string, number>();
    for (const { kinds } of sets) count.set(kinds, (count.get(kinds) ?? 0) + 1);
    const [kinds, n] = [...count].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
    if (n / sets.length < MAX_SAME_SHARE || n < 3) return [];
    return [
      {
        where: "src/app.yaml",
        found: `${n} of ${sets.length} pages practise with the same exercise kinds (${kinds})`,
        fix: "Vary what learners do from page to page: match, order, a dictation, a generated task, a figure to label, speaking; let a page practise the way its competency is used",
      },
    ];
  },
} satisfies Check;
