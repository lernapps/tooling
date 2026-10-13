// Every link and resource of a page below the app's base URL answers without an error. A link whose server is rate
// limited (429) could not be checked: a hint that names it, never an error.
import type { Check } from "../check.ts";
import { CHECK_AGAIN_LATER, linkProblem } from "../status.ts";

export default {
  id: "links-resolve",
  url: "https://lernapps.net/tooling/rules/#links-resolve",
  description: "Every link and resource of the built app below its address resolves.",
  severity: "error",
  run: ({ app }) =>
    app?.pages.flatMap(({ page, links }) =>
      links.flatMap(({ url, status }) => {
        const problem = linkProblem(status);
        if (problem === undefined) return [];
        return [
          {
            where: page,
            found: `${url.slice(app.base.length) || "./"} ${problem.found}`,
            fix: problem.hint ? CHECK_AGAIN_LATER : "Point the link to a page or file the build writes, or remove it",
            ...(problem.hint ? { severity: "hint" as const } : {}),
          },
        ];
      }),
    ),
} satisfies Check;
