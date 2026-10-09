// What a page shows with JavaScript off: a title, a heading and at least a sentence besides it.
import type { Check } from "../check.ts";

/** Characters of text besides the heading: about one sentence on what the app does. */
const SENTENCE = 40;

export default {
  id: "readable-without-javascript",
  url: "https://lernapps.net/tooling/rules/#readable-without-javascript",
  description: "Every page of the built app has a title, a heading and a sentence of text without JavaScript.",
  severity: "error",
  run: ({ app }) =>
    app?.pages.flatMap(({ page, withoutJavaScript: { title, heading, text } }) => {
      const missing = [
        ...(title === "" ? ["no title"] : []),
        ...(heading === "" ? ["no h1 heading"] : []),
        ...(text.replace(heading, "").trim().length < SENTENCE ? ["no sentence of text"] : []),
      ];
      if (missing.length === 0) return [];
      return [
        {
          where: page,
          found: `without JavaScript the page shows ${missing.join(", ")}`,
          fix: "Write the title, the h1 and a sentence on what the page or app does into the HTML at build time; explain in <noscript> what needs JavaScript",
        },
      ];
    }),
} satisfies Check;
