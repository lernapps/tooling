// An explainer for children that is tables and text has nothing to look at. The check counts the pages with a figure,
// a labelled figure, a timeline, a video or a component (not a table, not a formula) and hints when fewer than half
// have one (check/explainer-structure.ts). It needs the app's repo, with `format: 2` in src/app.yaml.
import type { Check } from "../check.ts";
import { readExplainer } from "../explainer-map.ts";
import { measurePage } from "../explainer-structure.ts";

/** From this many pages on, the app is looked at as a whole. */
export const MIN_PAGES = 4;
/** Share of the pages that need a picture. */
export const MIN_SHARE = 0.5;

export default {
  id: "explainer-visual",
  url: "https://lernapps.net/tooling/rules/#explainer-visual",
  description:
    "At least half of the pages of an explainer in format 2 have a figure, a timeline, a video or a component.",
  severity: "hint",
  run: ({ project }) => {
    const explainer = project === undefined ? undefined : readExplainer(project);
    if (explainer === undefined || explainer.pages.length < MIN_PAGES) return undefined;
    const withPicture = explainer.pages.filter((page) => measurePage(page.text).pictures > 0).length;
    if (withPicture / explainer.pages.length >= MIN_SHARE) return [];
    return [
      {
        where: "src/app.yaml",
        found: `${withPicture} of ${explainer.pages.length} pages have a figure, a timeline, a video or a component`,
        fix: "Give each page something to look at that carries the idea: a scene of the story, a labelled figure, a drawing; or leave out a story that only the text tells",
      },
    ];
  },
} satisfies Check;
