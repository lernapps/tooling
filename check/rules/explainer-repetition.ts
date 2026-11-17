// A page that says the same thing twice in the same part, in two text blocks or in the feedback of two exercises of one
// type, repeats itself. The check finds phrases of five words that two such blocks both say (check/explainer-structure.ts).
// Repeating in another part (the text, then a task, then a table) is a way to teach and is not reported. It needs the
// app's repo, with `format: 2` in src/app.yaml.
import type { Check } from "../check.ts";
import { readExplainer } from "../explainer-map.ts";
import { measurePage } from "../explainer-structure.ts";

/** Phrases of five words said twice on a page; a repeated sentence of n words gives n - 4 of them. */
export const MAX_REPEATED_PHRASES = 10;

export default {
  id: "explainer-repetition",
  url: "https://lernapps.net/tooling/rules/#explainer-repetition",
  description:
    "A page of an explainer in format 2 does not say the same thing twice in the same part: text blocks, or exercises of one type.",
  severity: "hint",
  run: ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined) return undefined;
    return explainer.pages.flatMap((page) => {
      const { repeated } = measurePage(page.text);
      if (repeated.length <= MAX_REPEATED_PHRASES) return [];
      return [
        {
          where: page.where,
          found: `${repeated.length} phrases of five words appear in more than one block of the same kind, e.g. "${repeated[0]}"`,
          fix: "Say it once in this part. Repeating in another form (text, then a task, then a table) is fine and often wanted, to deepen it in a different way, but do it on purpose",
        },
      ];
    });
  },
} satisfies Check;
