# Architecture evidence

Traces the facts in the arc42 chapters to their sources (format: `arc42 guide evidence`). Not parsed by the
validator. Rows marked `OPEN:` need a decision by the platform owner before the chapter is final.

| Source path:line, symbol, or command | Derived fact or relationship | Used in | Confidence | Open question / human decision |
| --- | --- | --- | --- | --- |
| lernapps/docs `docs/pdt42/2-design/d6-learning-engine.pdt42.md` `s-building-guidance` | The tooling serves the service "Guidance for building apps" for creators, stage onboarding, kind empowering | ch.1 intro | high | — |
| lernapps/docs `docs/pdt42/2-design/d1-ecosystem.pdt42.md:16,31` | GitHub is the means of production; "Agent guidance and starter templates" are part of the platform's infrastructure | ch.1 intro | high | — |
| lernapps/.github issue #12 | Goal: a creator builds an app with their AI assistant, and it comes out static, frontend-only, collecting nothing, and ready to list | ch.1 1.1 | high | — |
| `.vibe/development-plan-agentic-app-creation.md` KD-01 | Five layers: process guidance, scaffolding, conventions, deterministic verification, formal validation | ch.1 UC-1 – UC-5 | high | — |
| plan KD-02 | Archetypes: content app (Mathe-Karte-like) and playful SPA (typing trainer) | ch.1 1.1 | high | OPEN: final names and list of archetypes |
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
| agent inference | Priorities: four high, three medium | ch.10 10.1 | low | OPEN: confirm the priorities |
| agent inference | At most 4 creator decisions in 4 of the first 5 listings; 4 of the first 5 listing PRs pass validation on the first run | ch.10 qs-few-decisions, qs-first-listings | low | OPEN: confirm the thresholds |
| agent inference | At most N failed pre-push runs per app in the evals | ch.10 qs-eval-iterations | low | OPEN: set N after the first eval runs |
| agent inference | The evals pass with at least two assistants of different providers | ch.10 qs-other-assistant | low | OPEN: which assistants |
| agent inference | The Mathe-Karte may adopt the shared checks without moving onto a scaffold | ch.1 1.3 | low | OPEN: confirm with the Mathe-Karte author |
