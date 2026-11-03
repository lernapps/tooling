# Calibration of the juror

Before its scores count, the juror (`prompt.md`) has to find what people already found in an app. The app is
lernapps/bruchrechnung (PR #1, class 6, 20–21 pages), whose retro and simulated child audit are in
lernapps/tooling#257. Juror: Claude Opus 5.5 as a sub-agent of the session that planned this, 2026-11-03, one run per
stand, and Sonnet 5.5 on the audit stand (below), the model the eval juror uses by default.

## The three stands

| Stand | Commit | What it is | Juror mean | Units at 0 |
|---|---|---|---|---|
| early | `2f0726d` | first complete draft, all chapters, before the creator's browser remarks | 1.26 | 36 |
| audit | `9cc93f6` | the stand of the child audit (its `791940f` is not in the PR; `9cc93f6` is the last commit before the fixes the audit led to) | 1.34 | 37 |
| final | `7ffa8b9` | accepted by the creator, 21 pages | 1.65 | 12 |

The means rise in the order of the stands. The largest change is the item the retro is about:
`explainer-representation-explained` 0.47 → 0.56 → 1.60, `explainer-control-purpose` 1.12 → 1.58 → 1.81,
`explainer-text-figure-agree` 1.08 → 1.11 → 1.68. `explainer-one-step` stays low (1.05 → 1.00 → 0.95): the final app
still has several competencies on some pages (ggT and kgV on one page), which the creator asked to split after the
retro. The judgments are next to this file (`bruchrechnung-<stand>.learning.yaml`).

## Against the audit's labels

`node evals/juror/calibrate.ts bruchrechnung-audit.learning.yaml bruchrechnung-audit.yaml` compares the juror at the
audit stand with the audit's levels per page (klar 2, teilweise 1, unklar 0): "Einstieg" with
`explainer-learner-start`, "Bedienung / Handlung" with the mean of the three action items.

| Target (plan) | Result |
|---|---|
| start within one level on ≥ 80 % of the pages | 20/20 |
| action within one level on ≥ 80 % of the pages | 19/20 |
| never clear (≥ 1.5) where the audit says unclear | 1 page: `/teilbarkeit/teiler-vielfache/` |
| the audit's blockers (text names a tool or view the page lacks) found as level 0 of `explainer-text-figure-agree` | 6/6 pages |

The one page: the audit calls its action unclear because no search for common numbers is guided; the juror rates the
divisor table as explained (2) and finds the problems under other items: two competencies on one page (one-step 0),
"Ausprobieren" over a table (headings 0), text about multiples next to a table of divisors (agree 1). The juror is
stricter than the audit on the action of most pages (it is often lower, never higher by more than one level except
there).

## Sonnet as juror

The evals run the juror with Sonnet (`JUROR_MODEL`). Sonnet 5.5 on the audit stand
(`bruchrechnung-audit-sonnet.learning.yaml`): mean 1.40 (Opus 1.34), 28 units at level 0 (Opus 37); against the
audit: start within one level 20/20, action within one level 20/20, never clear where the audit says unclear, blockers
6/6. It is a little milder than Opus on `explainer-representation-explained` (0.86 against 0.56) and finds the same
blockers. Sonnet is calibrated as well as Opus for these targets.

## Verdict

Calibrated for the evals of this feature: the juror orders the stands right, agrees with the audit within one level
almost everywhere and finds every blocker. Limits: one run per stand (no spread measured), one app, one subject, the
same model family as the builder. Read its evidence, not only its numbers.
