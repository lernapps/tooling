// A page with few exercises, whose exercises are all of one kind, or are all choices a learner can guess, is static. A
// component, a generated task, a language task, a speaking task, an ordering or a matching asks for more
// (check/explainer-structure.ts).
// It needs the app's repo, with `format: 2` in src/app.yaml.
import type { Check } from "../check.ts";
import { readExplainer } from "../explainer-map.ts";
import { measurePage } from "../explainer-structure.ts";

/** Fewer exercises (components count) on a page practise too little; a recap page has none and is left out. */
/** The minimum applies from this many pages on: the placeholder `create` writes is not judged. */
export const MIN_PAGES = 4;
export const MIN_PRACTICE = 4;
/** From this many exercises on a page the check looks at their kinds. */
export const MIN_EXERCISES = 3;
/** Share of choice exercises (single choice, multiple choice, true or false) from which a page is static. */
export const MAX_CHOICE_SHARE = 0.75;

const FIX =
  "Let learners do more than tick, and enough: at least four tasks, e.g. a generated task, a number, an ordering or matching, a language task, a figure to label, or a component, in varied kinds";

export default {
  id: "explainer-interaction",
  url: "https://lernapps.net/tooling/rules/#explainer-interaction",
  description:
    "A page of an explainer in format 2 has at least four exercises, not all guessable choices and not all of one kind.",
  severity: "hint",
  run: ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined) return undefined;
    return explainer.pages.flatMap((page) => {
      const m = measurePage(page.text);
      const found: string[] = [];
      const practice = m.exercises.length + m.components;
      if (page.recap === undefined && explainer.pages.length >= MIN_PAGES && practice < MIN_PRACTICE)
        found.push(`only ${practice} exercises (fewer than ${MIN_PRACTICE})`);
      if (m.exercises.length < MIN_EXERCISES)
        return found.length === 0 ? [] : [{ where: page.where, found: found.join("; "), fix: FIX }];
      const kinds = new Set(m.exercises).size;
      const share = m.choiceExercises / m.exercises.length;
      if (share >= MAX_CHOICE_SHARE && m.components === 0)
        found.push(
          `${m.choiceExercises} of ${m.exercises.length} exercises are choices a learner can guess, and the page has no component`,
        );
      if (kinds === 1) found.push(`all ${m.exercises.length} exercises are of one kind (${m.exercises[0]})`);
      return found.length === 0 ? [] : [{ where: page.where, found: found.join("; "), fix: FIX }];
    });
  },
} satisfies Check;
