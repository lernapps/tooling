// The width of each page in a 360 px wide browser window.
import type { Check } from "../check.ts";

const WIDTH = 360;

export default {
  id: "usable-at-360px",
  url: "https://lernapps.net/tooling/rules/#usable-at-360px",
  description: "No page of the built app is wider than 360 px in a 360 px wide window.",
  severity: "error",
  run: ({ app }) =>
    app?.pages
      .filter(({ overflow }) => overflow.width > WIDTH)
      .map(({ page, overflow }) => ({
        where: page,
        found:
          `at ${WIDTH} px the page is ${overflow.width} px wide` +
          (overflow.elements.length > 0 ? `; too wide: ${overflow.elements.join(", ")}` : ""),
        fix: "Let the element shrink or wrap (max-width: 100%, flexible widths); give wide content like tables its own overflow-x: auto",
      })),
} satisfies Check;
