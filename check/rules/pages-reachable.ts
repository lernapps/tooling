// Every page of the built app is reachable from its start page by links. On a bundle the check knows every page (its
// HTML files without the 404 page; check/visit.ts, bundlePages) and visits them all; a page no link from the start
// page reaches is an error, unless it is marked noindex. On a URL it cannot know the pages no link reaches: it follows
// the links up to a limit, and a visit that stops there is a hint that says how many pages it checked, never an error.
import type { Check } from "../check.ts";

export default {
  id: "pages-reachable",
  url: "https://lernapps.net/tooling/rules/#pages-reachable",
  description:
    "Every page of the built app is reachable from the start page by links; on a URL, at most 100 pages are checked.",
  severity: "error",
  run: ({ app }) => {
    if (app === undefined) return undefined;
    if (app.stopped !== undefined) {
      const { limit, more } = app.stopped;
      return [
        {
          where: app.base,
          found: `checked ${limit} pages, the most a check of an app on a URL visits; at least ${more} further pages linked from them were not visited, and no check ran on them`,
          fix: "Nothing to fix for this: to check every page, check the built app itself (lernapps check in its repo, or lernapps check <dir> on its bundle)",
          severity: "hint",
        },
      ];
    }
    return (app.unreachable ?? []).map((page) => ({
      where: page,
      found: "no link leads to this page from the start page: it is unreachable from the start page",
      fix: 'Link the page from a page learners reach, or leave it out of the build. A page reached another way on purpose gets <meta name="robots" content="noindex">',
    }));
  },
} satisfies Check;
