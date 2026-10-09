// The id test of the rule catalog (docs/arc42 ch. 8, concept "Rule catalog") on this repo: it reads every
// artifact that declares or implements a rule (skill sections, rubric items, checks, lint rules) and fails on a
// duplicate id, a `checked` rule without implementation, or an implementation whose messages do not link to
// where its rule is explained. It runs with the tests, so in `lernapps check`: the pre-push hook and CI.
import { expect, test } from "vite-plus/test";
import { repoRoot, run } from "./support.ts";

test("the rule ids of all artifacts are consistent", () => {
  const result = run("node", ["scripts/rules.ts", "test"], repoRoot);
  expect(result.code, `${result.stdout}\n${result.stderr}`).toBe(0);
});
