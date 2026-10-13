// Every link and resource of a page below the app's base URL answers without an error. A link whose server is rate
// limited (429) could not be checked: a hint that names it, never an error.
import type { Check } from "../check.ts";
import { linkProblem } from "../status.ts";

export default {
  id: "links-resolve",
  url: "https://lernapps.net/tooling/rules/#links-resolve",
  description: "Every link and resource of the built app below its address resolves.",
  severity: "error",
  run: ({ app }) =>
    app?.pages.flatMap(({ page, links }) =>
      links.flatMap(
        ({ url, status }) =>
          linkProblem(
            page,
            url.slice(app.base.length) || "./",
            status,
            "Point the link to a page or file the build writes, or remove it",
          ) ?? [],
      ),
    ),
} satisfies Check;
