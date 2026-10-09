// The id test of the rule catalog (docs/arc42 ch. 8, concept "Rule catalog") on this repo: it reads every
// artifact that carries a rule (skill sections, rubric items, checks, lint rules) and fails on an id used twice in
// the same kind of artifact, or on a check or lint rule whose messages do not link to where its rule is explained.
// It runs with the tests, so in `lernapps check`: the pre-push hook and CI.
import { expect, test } from "vite-plus/test";
import { repoRoot, run } from "./support.ts";

test("the rule ids of all artifacts are consistent", () => {
  const result = run("node", ["scripts/rules.ts", "test"], repoRoot);
  expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(0);
});
