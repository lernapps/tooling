// Every link and resource of a page below the app's base URL answers without an error.
import type { Check } from "../check.ts";

export default {
  id: "links-resolve",
  url: "https://lernapps.net/tooling/rules/#links-resolve",
  description: "Every link and resource of the built app below its address resolves.",
  severity: "error",
  run: ({ app }) =>
    app?.pages.flatMap(({ page, links }) =>
      links
        .filter(({ status }) => status === 0 || status >= 400)
        .map(({ url, status }) => ({
          where: page,
          found: `${url.slice(app.base.length) || "./"} ${status === 0 ? "cannot be fetched" : `answers ${status}`}`,
          fix: "Point the link to a page or file the build writes, or remove it",
        })),
    ),
} satisfies Check;
