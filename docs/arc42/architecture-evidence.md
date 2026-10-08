# Architecture evidence

Traces the facts in the arc42 chapters to their sources (format: `arc42 guide evidence`). Not parsed by the
validator. Rows marked `OPEN:` need a decision by the platform owner before the chapter is final.

| Source path:line, symbol, or command | Derived fact or relationship | Used in | Confidence | Open question / human decision |
| --- | --- | --- | --- | --- |
| lernapps/docs `docs/pdt42/2-design/d6-learning-engine.pdt42.md` `s-building-guidance` | The tooling serves the service "Guidance for building apps" for creators, stage onboarding, kind empowering | ch.1 intro | high | — |
| lernapps/docs `docs/pdt42/2-design/d1-ecosystem.pdt42.md:16,31` | GitHub is the means of production; "Agent guidance and starter templates" are part of the platform's infrastructure | ch.1 intro | high | — |
| lernapps/.github issue #12 | Goal: a creator builds an app with their AI assistant, and it comes out static, frontend-only, collecting nothing, and ready to list | ch.1 1.1 | high | — |
| `.vibe/development-plan-agentic-app-creation.md` KD-01 | Five layers: process guidance, scaffolding, conventions, deterministic verification, formal validation | ch.1 UC-1 – UC-5 | high | — |
| plan KD-02, owner 2026-10-08 | Archetypes `explainer` (Mathe-Karte as inspiration), `interactive`, `quiz` (deep scaffold: only questions and options supplied); named after their character; TypeScript everywhere, strictly enforced | ch.1 1.1 | high | — |
| plan KD-03 | EPCC plan in a Markdown file; agent asks the creator what the catalog needs | ch.1 UC-1 | high | — |
| plan KD-04; lernapps/apps `schemas/entry.js` | The agent fetches the entry schema and fills it; the guidance does not repeat its fields | ch.1 UC-6 | high | — |
| plan KD-13, KD-15 | Fact sheet with deployment from the entry's commit, and re-validation, are later increments | ch.1 1.1 out of scope | high | — |
| lernapps/docs `d8-mvp.pdt42.md` `a-creators-list` | Creators list an app when it costs minutes; 5–10 creators the owner knows | ch.1 1.3, ch.10 qg-list-in-minutes | high | — |
| lernapps/docs `.vibe/development-plan-feat-platform-design.md` KD-11 | AI assistants seek to reach a working app with fewer iterations; instructions and scaffolding are the platform's offer to them | ch.1 1.3, ch.10 qg-few-iterations | high | — |
| lernapps/docs plan KD-18; lernapps/.github `ORGANIZATION.md` "Every page, in every repo" | No cookies, no tracking, no requests to other servers before a click | ch.10 qg-nothing-collected, qs-external-request | high | — |
| lernapps/.github `ORGANIZATION.md` "Where to find what", `GOVERNANCE.md` | Oliver Jägle owns the platform and decides listing; Ralf D. Müller authors the Mathe-Karte | ch.1 1.3 | high | — |
| lernapps/mathe-karte `werkzeuge/skill/lern-app/SKILL.md`, `werkzeuge/review/ki-review.md`, `e2e/` | Source of the skill, the review procedure and the browser checks to generalise | ch.1 1.3 | high | — |
| lernapps/docs `d7-experiences.pdt42.md` `x-list-and-hear-back` value proposition, activities, costs | "Build your app faster with good guidance, list it in minutes"; maintaining the guidance costs the owner's time | ch.10 qg-simple-to-build, qg-list-in-minutes, qg-guidance-evolves | high | — |
| lernapps/docs `e2-scan.pdt42.md` `e-ai-assistants` | Convenience gain "fewer iterations and less guessing"; "whatever lernapps.net offers creators has to work through their AI assistants"; providers compete | ch.10 qg-few-iterations, qg-any-assistant | high | — |
| lernapps/docs `d5-transactions.pdt42.md` `ch-listing`, `ch-fitness-signal`, `ch-feedback` | Listing takes minutes; fitness checked rather than declared; only explicit clicks and totals, no free text | ch.10 qg-list-in-minutes, qg-checked-not-declared, qg-nothing-collected | high | — |
| lernapps/docs `d6-learning-engine.pdt42.md` `s-contribute-practices` | Experienced creators bring their practices into the guidance | ch.10 qg-guidance-evolves, qs-practice-contributed | high | — |
| lernapps/docs `d8-mvp.pdt42.md` intro, `a-creators-unpaid` | Learning tests with small absolute numbers; conversations with creators are the main source | ch.10 measurement sources, qs-guidance-named | high | — |
| owner, 2026-10-08 | Simplicity (qg-simple-to-build) and cost (qg-few-iterations) stay separate goals; the plan file ends with a retrospective section; agent feedback with consent is deferred (#8) | ch.10 | high | — |
| owner, 2026-10-08 | Priorities: four high, three medium | ch.10 10.1 | high | — |
| owner, 2026-10-08 | Half of the listing PRs pass validation on the first run; 7 of 8 on the second run, after a comment with the deterministic check results | ch.10 qs-first-listings | high | — |
| owner, 2026-10-08 | Turns before the plan is agreed are good assistance and not counted; at most 3 creator turns after the confirmed plan | ch.10 qs-few-turns-after-plan | high | — |
| owner, 2026-10-08 | The pre-push hook counts its failed runs in the plan's front matter | ch.10 qs-eval-iterations, measurement sources | high | — |
| agent inference | At most N failed pre-push runs per app | ch.10 qs-eval-iterations | low | OPEN: set N after the first eval runs |
| owner, 2026-10-08 | Evals by hand with Claude Code, Codex and Gemini CLI, each with the latest model | ch.10 qs-other-assistant, measurement sources | high | — |
| owner, 2026-10-08 | The Mathe-Karte's compliance with the tooling is out of scope for now; it is the inspiration for the content archetype | ch.1 1.3 | high | — |
