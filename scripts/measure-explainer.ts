// Measures the pages of explainers in format 2 with the numbers of check/explainer-structure.ts, to set the thresholds
// of the structure checks from real apps.
//
//   node scripts/measure-explainer.ts <repo> [<repo> …]
import { readExplainer } from "../check/explainer-map.ts";
import { measurePage } from "../check/explainer-structure.ts";

for (const repo of process.argv.slice(2)) {
  const explainer = readExplainer(repo);
  if (explainer === undefined) {
    console.log(`${repo}: not an explainer in format 2`);
    continue;
  }
  console.log(`${repo}`);
  console.log("page".padEnd(38), "prose feedb run first exer choice comp rep kinds");
  for (const page of explainer.pages) {
    const m = measurePage(page.text);
    const kinds = [...new Set(m.exercises)].join(",");
    console.log(
      page.where.replace(/:\d+$/, "").padEnd(38),
      String(m.proseWords).padStart(5),
      String(m.feedbackWords).padStart(5),
      String(m.longestProseRun).padStart(3),
      String(m.firstActivity).padStart(5),
      String(m.exercises.length).padStart(4),
      String(m.choiceExercises).padStart(6),
      String(m.components).padStart(4),
      String(m.repeated.length).padStart(3),
      kinds,
    );
  }
}
