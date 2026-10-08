# Development Plan: tooling for agentic app creation (claude/agentic-app-creation-tools-iyhb97 branch)

*Started on 2026-10-08, following the EPCC workflow (Explore, Plan, Code, Commit) of [codemcp/workflows](https://github.com/mrsimpson/responsible-vibe-mcp)*

## Goal

A creator builds a learning app with their AI assistant, and it comes out static, frontend-only, collecting nothing,
accessible and ready to list on lernapps.net. This increment designs and then builds the tooling for that: how the
agent is guided through the work, what it starts from, which conventions it follows, what it can check by itself, and
how the result is validated before listing. It implements the platform design's service for creators, D6
`s-building-guidance` ("Agent guidance and starter templates" in D1), tracked in
[lernapps/.github#12](https://github.com/lernapps/.github/issues/12).

The architecture is documented with arc42 ([doctoolchain/arc42-language](https://github.com/doctoolchain/arc42-language),
the skill `arc42-language` as in lernapps/docs) before anything is built.

---

## Key Decisions

### KD-01: Five layers support the creator's agent
1. **Process guidance**: the agent follows a plan with phases instead of running through all steps at once.
2. **Scaffolding**: a starting point per kind of app, with strict coding conventions and git hooks.
3. **Conventions**: general rules and type-specific guidance, packaged as skills.
4. **Deterministic verification**: the toolchain's lint, format, type and test checks plus our own linters and CLIs
   for lernapps-specific rules (e.g. no requests to other servers before a click).
5. **Formal validation**: a review run by an agent before listing. It re-uses the checks of layer 4 and spends its
   judgment on what they cannot decide.

Layers 1–4 help the creator while building; layer 5 is the platform's gate.

### KD-02: The app archetype is the axis across the layers
"Content app" (like the Mathe-Karte: pages, explanations, exercises, readable without JavaScript) and "playful app"
(like a ten-finger typing trainer: a classic SPA) differ in more than the scaffold. An archetype is a bundle:
scaffold + skills + check profile + review rubric. Example: the content archetype requires every page to be readable
without JavaScript; the SPA archetype requires a static page that says what the app does and a `<noscript>`
explanation instead.
- **Decision**: Every building block is designed per archetype from the start, with shared parts for what all
  archetypes have in common. The archetype is chosen in the Explore phase of the creator's plan, from the operator's
  answers, not before the conversation starts.
- **Decision** (2026-10-08): Three archetypes, named after their character:
  - **`explainer`**: content-heavy, inspired by the Mathe-Karte: many pages of explanation, pictures and generated
    exercises, every page readable without JavaScript.
  - **`interactive`**: one client-rendered app page plus a static start page, e.g. a ten-finger typing trainer.
  - **`quiz`**: a deep scaffold with the whole quiz architecture built in (engine, question types, feedback,
    scoring, order, accessibility, i18n, readable without JavaScript as far as possible). The implementer supplies
    only the questions and their options, as typed and validated data.
- **Open**: the question types of `quiz` and the order of building the three archetypes; decided in the
  architecture.

### KD-03: Process guidance is EPCC in AGENTS.md, with a Markdown plan
The agent writes a human-readable plan file with one section per phase (Explore, Plan, Code, Commit), tasks and key
decisions, like this file. It works through one phase at a time and stops at the human checkpoints: the scope (what
the app teaches or trains), the plan, publishing, listing.
- **Decision**: The workflow is written out in the scaffold's `AGENTS.md` as plain instructions, so it works with any
  agent and without an MCP server. `@codemcp/workflows` stays an option for creators who want it.
- **Decision**: In the Explore phase, the agent asks the operator what the catalog needs later (see KD-04), so the
  answers are in the plan when the app is listed.

### KD-04: The entry schema explains itself; the guidance only points to it
The entry model (`schemas/entry.js` in lernapps/apps, published as `entry.v1.schema.json`) was made in an earlier
version and may not yet serve the main job well: finding the right app. It will be tuned.
- **Decision**: The guidance never repeats or extends the entry's fields. It tells the agent to fetch the published
  schema and fill it in. Everything the agent needs to know about a field is in the schema's descriptions, so the
  schema has to be self-explanatory.
- **Consequence**: Tuning the entry model for discovery is work in lernapps/apps, outside this increment; the tooling
  keeps working because it only refers to the schema.

### KD-05: A generator with versioned packages instead of one template repo
A GitHub template repo is chosen before the conversation and copied once, then it drifts. With several archetypes it
also cannot be the single starting point.
- **Decision**: The scaffold is generated for the archetype chosen in the plan. The generated app holds thin files
  that refer to versioned packages (toolchain config, our lint rules and CLIs, the site frame), installed from git and
  kept current by Renovate, as `@lernapps/site` and the site actions already are.
- **Open**: what becomes of lernapps/app-template (archetype templates, the generator itself, or the starting point
  for the first archetype); how the generator is invoked (`vp create` with our templates or `npm create`).

### KD-06: vite-plus is the default toolchain, configured by the archetype
[Vite+](https://viteplus.dev/) (`vp`) chains lint (Oxlint), format (Oxfmt), type check, test (Vitest) and the
pre-commit run on staged files (`vp staged`, hooks installed with `vp config`) behind one CLI and one config file.
- **Decision**: Scaffolds use vite-plus with its defaults, made stricter where our conventions need it. The config is
  owned by the archetype package, not written by each app. The content-heavy archetype may render its pages with Eleventy and use
  `vp` for lint, format, type check, test and staged. i18n and accessibility are part of the scaffolds.
- **Decision** (2026-10-08): TypeScript everywhere, strictly enforced, in every archetype: `strict` and the stricter
  compiler options on, no `any`, no JavaScript sources, type check in the pre-commit hook and in CI.
- **Open**: how the content-heavy archetype renders its pages with TypeScript sources (Eleventy with a TypeScript
  loader, or pre-rendering with Vite); decided in the architecture.
- **Risk**: vite-plus is before 1.0 and its config format may still change; owning the config centrally keeps a
  change in one place.

### KD-07: Git hooks enforce, agent hooks are extra
Creators use different agents (Claude Code, Codex, Cursor, claude.ai without a shell).
- **Decision**: Enforcement lives in git hooks, which are agent-neutral: the fast checks on pre-commit (`vp staged`),
  the slower ones (build, our CLIs, browser checks) on pre-push. Agent-specific hooks may add the same checks earlier
  but never replace them.
- **Decision** (2026-10-08): The hooks also measure. A failed pre-push run increments a counter in the front
  matter of the plan file, so the number of failed pre-push runs is counted deterministically, not reported by the
  agent. The counter goes into the next commit; the retrospective and the review read it (`qs-eval-iterations`).

### KD-08: Conventions are skills, general and type-specific
- **Decision**: Rules are split into general rules for every app (privacy, accessibility, language, licensing,
  "rules that came from mistakes") and type-specific guidance: per archetype, and per topic, e.g. using third-party
  content in content-heavy apps (bundle it instead of fetching it, name source and license next to it), videos, curriculum
  references. Packaged as skills in the agentskills.io format, distributed from this repo (e.g. `npx skills add`, a
  Claude Code plugin marketplace).
- **Source**: the `lern-app` skill of the Mathe-Karte (`werkzeuge/skill/lern-app/`), generalised and freed of its
  monorepo layout.

### KD-09: Our own checks run outside our scaffolds too
- **Decision**: The lernapps-specific checks are a standalone CLI (and lint rules where a rule fits a linter), so they
  run in our scaffolds, in apps built otherwise (the Mathe-Karte builds with Eleventy) and in the formal validation.
  Error messages are written for an agent: what failed, where, how to fix it.
- **Scope**: no requests to other servers before a click, what is stored (cookies, local storage, IndexedDB,
  requests that send data), readable without JavaScript where the archetype requires it, 360 px without overflow,
  axe, links and legal links (today `lernapps-check` in the site frame), a dependency policy (license allowlist,
  audit, no runtime CDN).
- **Source**: `e2e/` (`extern`, `ohne-js`, `ueberlauf`, `axe`) and `lib/pruefe-*.js` of the Mathe-Karte,
  `lernapps-check` in lernapps.github.io.

### KD-10: Formal validation is an agent review that starts from the deterministic checks
- **Decision**: A review agent in a fresh context validates an app before listing. It runs the checks of KD-09
  first, then focuses on what they cannot decide: the built bundle and external dependencies, whether learners act
  themselves, ads, plain German, learner-specific data in public texts, the archetype's rubric. It works on a
  deployed URL or a built bundle alone, so it also covers apps not built with our tooling.
- **Decision**: The result is a report bound to the commit it reviewed. Its deterministic part provides the entry's
  `fitness` values, so they are measured, not self-declared.
- **Decision** (2026-10-08): When the validation of a listing pull request fails, it posts the deterministic check
  results as a comment, so the creator's assistant can fix the app from it. Target: half of the listing pull
  requests pass on the first run, 7 of 8 on the second (`qs-first-listings`).
- **Source**: `werkzeuge/review/ki-review.md` of the Mathe-Karte (verdict per head commit).

### KD-11: Content correctness is suggested, never a prerequisite
Whether content is correct can only be checked reliably where answers are computable: maths, partly the natural
sciences.
- **Decision**: The guidance suggests ways to support correctness (generator and checker tests for exercises, cited
  curriculum sources, verified video and article links, a content-error issue form in the scaffold). None of it is a
  condition for validation or listing.

### KD-12: Findings move down the layers
- **Decision**: A finding of the formal validation that recurs becomes a deterministic check (layer 4) where
  possible, otherwise a convention (layer 3); what is forgotten again and again becomes a step or a question in the
  process guidance (layer 1). Review findings name the layer they should move to. This is how the guidance improves,
  in the spirit of the learning engine (D6).

### KD-13: Apps live anywhere; the catalog entry is a fact sheet with a link (later)
Apps are meant to be deployed outside lernapps.net's GitHub Pages as well.
- **Decision**: A catalog entry renders a fact sheet of the app and links to where it is deployed. A mechanism has to
  make sure the deployed app comes from the same commit the entry (and its validation) refers to.
- **Deferred**: implemented in a later increment. This increment keeps the validation report bound to a commit
  (KD-10), so the mechanism can build on it.

### KD-14: The guidance itself is tested (evals)
- **Decision**: A small set of creator prompts, at least one per archetype, is run against the scaffolds and skills
  and scored with the checks and the review. This catches regressions when guidance changes and measures the MVP
  assumption `a-creators-list` ("creators list an app when it costs minutes"): time from the first prompt to an entry
  ready to list.
- **Decision** (2026-10-08): The evals are run by hand with Claude Code, Codex and Gemini CLI, each with its
  provider's latest model at the time of the run. No automated eval pipeline for now.

### KD-15: Re-validation of listed apps (later)
Apps change after they are listed; a validation does not stay true by itself.
- **Deferred**: listed apps are re-validated on a schedule and when they change, in lernapps/apps.

### KD-16: Quality goals are grounded in the platform design; metrics name their source
Seven goals, each traced to the platform design: simple to build with guidance (`x-list-and-hear-back`), list in
minutes (`ch-listing`, `a-creators-list`), checked not declared (`ch-fitness-signal`), nothing collected in secret,
also by the tooling (KD-18, `ch-feedback`); with medium priority fewer iterations for the assistant
(`e-ai-assistants`), works through any assistant, the guidance evolves (`s-contribute-practices`).
- **Decision**: Simplicity (creator) and cost (assistant's iterations) stay separate goals.
- **Decision**: Other people's assistants cannot be observed, and nothing is collected in secret. Metrics are
  learning tests with small numbers, as in the MVP, and each names its source: our evals, the listing reports, the
  retrospective in the plan file, conversations with creators.

### KD-17: The plan file ends with a retrospective
- **Decision**: The plan template of the process guidance ends with a retrospective section the agent fills at the
  end: phases reached, checks that failed and how often, the creator's turns after the plan was confirmed
  (`qs-few-turns-after-plan`: at most 3), where it had to guess. The failed pre-push runs are not reported
  by the agent: the hook counts them in the plan's front matter (KD-07). The
  template explains each part in comments, so the plan file itself guides the agent. It stays in the creator's repo
  and reaches the platform only with a listing, where the review reads it. Cheap, and collects nothing.
- **Deferred**: agent feedback sent to the platform with the creator's consent, as structured totals on the
  anonymous thanks service ([#8](https://github.com/lernapps/tooling/issues/8)); first a flow in the platform design
  in lernapps/docs.

## Notes

- **Existing building blocks**: site actions and Renovate preset (this repo); site frame with `lernapps-check`
  (lernapps.github.io `site-frame/`); entry schema, `llms.txt` listing guide and listing criteria (lernapps/apps,
  `schemas/entry.js`, `src/llms.njk`, `src/_data/de.js` `list.criteria`).
- **From the Mathe-Karte** (lernapps/mathe-karte): `werkzeuge/skill/lern-app/` (skill and sub-agent brief),
  `werkzeuge/review/ki-review.md`, `e2e/` (Playwright + axe), `lib/pruefe-ausgabe.js`, `lib/pruefe-links.js`,
  `lib/pruefe-lizenzen.js`, `CLAUDE.md` (project rules).
- **Org rules every app must meet** (ORGANIZATION.md): no cookies, no tracking, no requests to other servers before
  a click; readable without JavaScript, WCAG 2.1 AA, usable at 360 px; imprint and privacy notice linked. Shared
  infrastructure in English, texts for learners, teachers and parents in German.
- **Language of this plan**: English, as all shared infrastructure.
- **Issue #12** asked for a single app-template with `AGENTS.md`, the site frame and the site actions. KD-02 and
  KD-05 widen that to archetypes and a generator; update the issue once the architecture is agreed.

## Explore

### Tasks

### Completed
- [x] Read the platform design for creators (D1, D6 `s-building-guidance`, D8 `a-creators-list`,
  `a-creators-unpaid`) and issue lernapps/.github#12
- [x] Survey existing building blocks in tooling, lernapps.github.io (site frame), apps (entry schema, listing guide),
  app-template (empty)
- [x] Survey the Mathe-Karte's skill, review prompt, browser tests and checks as the source to generalise
- [x] Look at codemcp/workflows (EPCC, plan file) and vite-plus (`vp check`, `vp staged`, `vp config`)
- [x] Agree on the five layers and the missing aspects with the owner (KD-01 – KD-15)

## Plan

### Tasks
- [ ] Owner review of the remaining `OPEN:` rows in `docs/arc42/architecture-evidence.md` (N of failed
  pre-push runs after the first evals)
- [ ] Ch. 2 Constraints: org rules, GitHub as means of production, frontend-only, MIT, English infrastructure
- [ ] Ch. 3 Context: creator, creator's agent, operator answers, lernapps/apps (catalog), hosting, review agent
- [ ] Ch. 4 Solution strategy: five layers × archetypes (KD-01, KD-02), promotion path (KD-12)
- [ ] Ch. 5 Building blocks: process guidance, generator and archetype packages, skills, check CLI and lint rules,
  formal validation, evals; which repo holds what (tooling, app-template, apps)
- [ ] Ch. 6 Runtime: a creator from first prompt to listing; validation of a listing PR
- [ ] Ch. 7 Deployment: distribution from git with Renovate; hosting on lernapps.net or elsewhere (KD-13)
- [ ] Ch. 8 Cross-cutting concepts: plan file, human checkpoints, error messages for agents, i18n, a11y, third-party
  content
- [ ] Ch. 9 Decisions: carry KD-03 – KD-13 over as ADRs where they are architecture decisions
- [ ] Ch. 11 Risks (vite-plus before 1.0, agents skipping phases, schema drift)
- [ ] Settle the open points of KD-02 and KD-05 with the owner
- [ ] Order of building for the Code phase, smallest useful slice first

### Completed
- [x] Set up arc42 in this repo: skill `arc42-language` in `.agents/skills/` (`skills-lock.json`), CLI `@doctc/arc42`
  pinned in `package.json`, workspace `docs/arc42/` (`npm run arc42 -- <command>`, `npm run check` validates)
- [x] Ch. 1 Introduction and goals: use cases UC-1 – UC-6, stakeholders (draft)
- [x] Ch. 10 Quality requirements: seven goals grounded in the platform design, thirteen scenarios with their
  measurement source (KD-16)
- [x] Publish the architecture at lernapps.net/tooling/ (`pages.yml`) with a preview per pull request that
  contains the arc42 diff and one comment listing the changes (`pr-preview.yml`, `scripts/review-summary.mjs`),
  as in lernapps/docs

## Code

### Tasks
*To be filled from the architecture (Plan phase). Expected building blocks, order to be decided:*
- [ ] Check CLI and lint rules (KD-09)
- [ ] Archetype packages with vite-plus config and git hooks (KD-05 – KD-07)
- [ ] Generator and the first archetype scaffold with `AGENTS.md` and the plan template with its retrospective
  section (KD-03, KD-05, KD-17)
- [ ] Skills: general rules, per archetype, third-party content (KD-08)
- [ ] Formal validation: review prompt and report (KD-10)
- [ ] Evals (KD-14)
- [ ] Open points of the documentation site ([#6](https://github.com/lernapps/tooling/issues/6)): no shared header
  on the arc42 diff page, own actions not exercised by this repo's workflows, `/tooling/` missing from `SITES`

### Completed

## Commit

### Tasks
- [ ] Update the READMEs of tooling and app-template and ORGANIZATION.md "Where to find what"
- [ ] Update lernapps/.github#12 to the agreed scope
- [ ] Pull request per repo, previews green

### Completed
