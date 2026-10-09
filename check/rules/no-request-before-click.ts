// Requests to other hosts while a page loads, before the learner clicks anything (the requests are blocked and
// recorded by the visit, see check/visit.ts).
import type { Check } from "../check.ts";

export default {
  id: "no-request-before-click",
  url: "https://lernapps.net/tooling/rules/#no-request-before-click",
  description: "No page of the built app requests anything from another host before a click.",
  severity: "error",
  run: ({ app }) => {
    if (!app) return undefined;
    const origin = new URL(app.base).origin;
    return app.pages.flatMap(({ page, requests }) =>
      [...new Set(requests.map((request) => request.url).filter((url) => new URL(url).origin !== origin))].map(
        (url) => ({
          where: page,
          found: `requests ${url} before a click`,
          fix: "Bundle it with the app at build time; load content of another server only after the learner clicks for it",
        }),
      ),
    );
  },
} satisfies Check;
