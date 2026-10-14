// What an explainer page shows with JavaScript off (KD-02; the explainer's no-JS contract): only of the pages the
// explainer runtime marks as its own (<meta name="lernapps-archetype" content="explainer">), which check/visit.ts
// visits a second time with JavaScript off. Each page has its h1; every heading, formula and figure is visible, a
// figure with its accessible name; every exercise has a "Lösung" that is not empty; every component's nojs text is
// visible and not empty. An app with no marked page has nothing to check here: the rule is left out of its report.
import type { Check, Problem } from "../check.ts";

const RUNTIME_ISSUES = "https://github.com/lernapps/app-templates/issues";
/** For what the content cannot cause: the runtime writes it into the page, visible without JavaScript. */
const RUNTIME_BUG = `The explainer runtime writes it into the page, visible without JavaScript: build with it (vp build), change no page after the build, and add no script or style that hides content. If that is so, this is a bug of the runtime: open an issue at ${RUNTIME_ISSUES} with this report`;

const WHAT = { heading: "the heading", formula: "the formula", figure: "the figure" } as const;

export default {
  id: "explainer-readable-without-js",
  url: "https://lernapps.net/tooling/rules/#explainer-readable-without-js",
  description:
    "Each explainer page shows its headings, formulas, named figures, every Lösung and every nojs text without JavaScript.",
  severity: "error",
  run: ({ app }) => {
    const marked = app?.pages.filter((page) => page.withoutJavaScript !== undefined) ?? [];
    if (marked.length === 0) return undefined;
    return marked.flatMap(({ page, withoutJavaScript }): Problem[] => {
      if (withoutJavaScript === undefined) return [];
      const { h1, parts, exercises, components } = withoutJavaScript;
      const problems: Problem[] = [];
      if (h1 === "") {
        problems.push({
          where: page,
          found: "without JavaScript the page shows no h1 heading: its content is not in the HTML, or hidden",
          fix: RUNTIME_BUG,
        });
      }
      for (const part of parts) {
        const what = WHAT[part.kind];
        if (!part.visible) {
          problems.push({
            where: `${page} ${part.where}`,
            found: `${what} is hidden without JavaScript`,
            fix: RUNTIME_BUG,
          });
        } else if (part.text === "") {
          problems.push({
            where: `${page} ${part.where}`,
            found: part.kind === "figure" ? `${what} has no accessible name` : `${what} is empty`,
            fix:
              part.kind === "figure"
                ? "Give the figure its alt text and caption in every language (the block's alt and caption)"
                : RUNTIME_BUG,
          });
        }
      }
      for (const { where, solutions } of exercises) {
        if (solutions.length === 0) {
          problems.push({ where: `${page} ${where}`, found: "the exercise has no Lösung", fix: RUNTIME_BUG });
        }
        solutions.forEach((solution, index) => {
          if (solution !== "") return;
          problems.push({
            where: `${page} ${where}`,
            found: `${solutions.length > 1 ? `Lösung ${index + 1}` : "the Lösung"} is empty without JavaScript`,
            fix: `Give the exercise its right answer in the content. ${RUNTIME_BUG}`,
          });
        });
      }
      for (const { where, nojs } of components) {
        if (nojs !== undefined && nojs !== "") continue;
        problems.push({
          where: `${page} ${where}`,
          found:
            nojs === undefined
              ? "the component has no nojs text"
              : "the component's nojs text is empty, or hidden, without JavaScript",
          fix: "Give the vue-component block a nojs text in every language: what the component shows and does, with its content (vue-component-nojs)",
        });
      }
      return problems;
    });
  },
} satisfies Check;
