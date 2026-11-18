// A page that is mostly text to read loses young learners: long, with nothing to look at or do before the learner has
// read on. The numbers come from the YAML (check/explainer-structure.ts); the limits are the ones real explainers keep
// to, measured on two apps (skill lernapps-explainer-design, rule explainer-text-load). It needs the app's repo, with
// `format: 2` in src/app.yaml.
import type { Check } from "../check.ts";
import { readExplainer } from "../explainer-map.ts";
import { measurePage } from "../explainer-structure.ts";

/** Words of text to read on a page; more is a hint. */
export const MAX_PROSE_WORDS = 350;
/** Words of tasks, explanations, background, hints and messages on a page. */
export const MAX_FEEDBACK_WORDS = 350;
/** Text blocks one after the other, with no figure, table, exercise or component between. */
export const MAX_PROSE_RUN = 4;
/** Where the first figure, table, exercise or component stands, counted in blocks; later means a wall of text first. */
export const MAX_BLOCKS_BEFORE_ACTIVITY = 4;

export default {
  id: "explainer-text-load",
  url: "https://lernapps.net/tooling/rules/#explainer-text-load",
  description: "A page of an explainer in format 2 is not mostly text: short, with something to look at or do early.",
  severity: "hint",
  run: ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined) return undefined;
    return explainer.pages.flatMap((page) => {
      const m = measurePage(page.text);
      const found: string[] = [];
      if (m.proseWords > MAX_PROSE_WORDS)
        found.push(`${m.proseWords} words of text to read (more than ${MAX_PROSE_WORDS})`);
      if (m.feedbackWords > MAX_FEEDBACK_WORDS)
        found.push(`${m.feedbackWords} words in tasks, explanations and messages (more than ${MAX_FEEDBACK_WORDS})`);
      if (m.longestProseRun > MAX_PROSE_RUN)
        found.push(`${m.longestProseRun} text blocks in a row with nothing to look at or do between them`);
      if (m.firstActivity > MAX_BLOCKS_BEFORE_ACTIVITY)
        found.push(`the first figure, table or exercise is block ${m.firstActivity}`);
      return found.length === 0
        ? []
        : [
            {
              where: page.where,
              found: found.join("; "),
              fix: "Cut text the figure or the task already carries, move a figure or an exercise up between the text blocks, and keep the explanation of a right answer to one sentence",
            },
          ];
    });
  },
} satisfies Check;
