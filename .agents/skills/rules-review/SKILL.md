---
name: rules-review
description: Review the rule catalog of lernapps/tooling across skills, lint rules, checks and rubric. Use when asked to review the rules, before a release of the guidance, or after rules were added or moved.
---

# Review the rule catalog

A rule lives in the artifacts where it acts: a skill section, a lint rule, a check, a rubric item. The same id in
several artifacts is one rule. No program compares them; you do.

1. Run `npm run --silent rules`. It prints every rule, grouped by id, with what each artifact says (`in`, `file`,
   `title`, `scope`, `severity`, `text`).
2. For each id, compare its artifacts and report:
   - **Drift**: the artifacts describe different requirements, scopes or severities (e.g. the skill says `error`,
     the lint rule only reports a hint).
   - **Gap**: an id only a program or the rubric carries, which no skill tells the assistant, when the assistant
     could prevent the problem; or a skill rule a program could decide but nothing checks.
   - **Move**: a rubric item or skill rule that a lint rule or check could decide.
   - **Overlap**: two ids for the same requirement.
3. Report in YAML, one entry per finding: `id`, `kind` (drift, gap, move, overlap), `files`, `finding`,
   `proposal`. Nothing else; no finding, print `findings: []`.

Do not change artifacts during the review. Every proposal becomes its own pull request.
