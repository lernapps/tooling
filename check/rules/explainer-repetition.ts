// A page that says the same thing in the text, the table, the note, the explanation and the message of a wrong answer
// repeats itself. The check finds phrases of five words that two blocks of the page both say (check/explainer-structure.ts).
// It needs the app's repo, with `format: 2` in src/app.yaml.
import type { Check } from "../check.ts";
import { readExplainer } from "../explainer-map.ts";
import { measurePage } from "../explainer-structure.ts";

/** Phrases of five words said twice on a page; a repeated sentence of n words gives n - 4 of them. */
export const MAX_REPEATED_PHRASES = 20;

export default {
  id: "explainer-repetition",
  url: "https://lernapps.net/tooling/rules/#explainer-repetition",
  description: "A page of an explainer in format 2 says each thing once: no phrase repeated between its blocks.",
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
          found: `${repeated.length} phrases of five words appear in more than one block, e.g. "${repeated[0]}"`,
          fix: "Say it once: the explanation says the rule, a wrong option's info says why it does not fit, the message of a mistake says what to do, and a right answer needs no repetition of the table or the text",
        },
      ];
    });
  },
} satisfies Check;
