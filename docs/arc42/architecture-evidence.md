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
| lernapps/docs `d8-mvp.pdt42.md` `a-creators-list` | Creators list an app when it costs minutes; 5–10 creators the owner knows | ch.1 1.3, ch.10 qg-low-effort | high | — |
| lernapps/docs `.vibe/development-plan-feat-platform-design.md` KD-11 | AI assistants seek to reach a working app with fewer iterations; instructions and scaffolding are the platform's offer to them | ch.1 1.3, ch.10 qg-agent-neutral | high | — |
| lernapps/docs plan KD-18; lernapps/.github `ORGANIZATION.md` "Every page, in every repo" | No cookies, no tracking, no requests to other servers before a click | ch.10 qg-no-hidden-collection, qs-external-request | high | — |
| lernapps/.github `ORGANIZATION.md` "Where to find what", `GOVERNANCE.md` | Oliver Jägle owns the platform and decides listing; Ralf D. Müller authors the Mathe-Karte | ch.1 1.3 | high | — |
| lernapps/mathe-karte `werkzeuge/skill/lern-app/SKILL.md`, `werkzeuge/review/ki-review.md`, `e2e/` | Source of the skill, the review procedure and the browser checks to generalise | ch.1 1.3 | high | — |
| lernapps/mathe-karte `werkzeuge/skill/lern-app/SKILL.md` "Rough effort" | An app with 6 competencies takes about 25–40 minutes of agent time | ch.10 qs-first-app | medium | OPEN: confirm the metric "at most 4 creator decisions, under one hour of agent time for up to 6 topics" |
| agent inference | An agent fixes a failing check by itself in at least 9 of 10 cases in the evals | ch.10 qs-actionable-failure | low | OPEN: confirm the metric |
| agent inference | The evals pass with at least two different agents | ch.10 qs-other-agent | low | OPEN: confirm the metric and which agents |
| agent inference | Ranking of the quality goals (four high, rules-stay-current medium) | ch.10 10.1 | low | OPEN: confirm the ranking and that the list is complete |
| agent inference | The Mathe-Karte may adopt the shared checks without moving onto a scaffold | ch.1 1.3 | low | OPEN: confirm with the Mathe-Karte author |
