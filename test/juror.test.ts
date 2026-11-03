// The eval juror's file (evals/juror.ts): which items it judges, what it rejects, and how it scores.
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { jurorItems, readJudgment, score, type Judgment } from "../evals/juror.ts";

const judgment: Judgment = {
  url: "http://127.0.0.1:4173/app/",
  grade: "6",
  pages: ["/a/", "/b/"],
  units: [
    { item: "explainer-representation-explained", page: "/a/", unit: "Kreis", level: 2, evidence: "x" },
    { item: "explainer-representation-explained", page: "/b/", unit: "Streifen", level: 0, evidence: "x" },
    { item: "explainer-learner-start", page: "/a/", unit: "Seite", level: 1, evidence: "x" },
    { item: "explainer-figure-hides-answer", page: "/b/", unit: "Übung", level: 2, evidence: "x" },
  ],
};

test("the juror judges the learning-quality items of the explainer rubric and the answer item", () => {
  const items = jurorItems();
  expect(items[0]).toBe("explainer-figure-hides-answer");
  expect(items).toContain("explainer-representation-explained");
  expect(items).toContain("explainer-age-appropriate");
  expect(items).not.toContain("explainer-plausible-numbers");
});

test("the score weighs every item the same and counts the units at level 0", () => {
  const s = score(judgment);
  expect(s.items["explainer-representation-explained"]).toEqual({ units: 2, mean: 1, zeros: 1 });
  expect(s.items["explainer-one-step"]).toBeUndefined();
  expect(s.mean).toBe(1.33);
  expect(s.zeros).toBe(1);
  expect(s.pages).toBe(2);
});

test("a judgment with an unknown item, a page not listed or a level 1 for the answer item is rejected", () => {
  const dir = mkdtempSync(join(tmpdir(), "juror-"));
  const file = join(dir, "learning.yaml");
  const bad = {
    ...judgment,
    units: [
      { item: "explainer-plausible-numbers", page: "/a/", unit: "Seite", level: 2, evidence: "x" },
      { item: "explainer-learner-start", page: "/c/", unit: "Seite", level: 2, evidence: "x" },
      { item: "explainer-figure-hides-answer", page: "/a/", unit: "Übung", level: 1, evidence: "x" },
    ],
  };
  writeFileSync(file, JSON.stringify(bad));
  const { problems } = readJudgment(file);
  expect(problems).toHaveLength(3);
  writeFileSync(file, JSON.stringify({ ...judgment, units: [{ item: "x", level: 3 }] }));
  expect(readJudgment(file).judgment).toBeUndefined();
});
