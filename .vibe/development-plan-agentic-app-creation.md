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
- **Decision** (2026-10-09): The architecture only fixes the archetype as a variation point (template, preset,
  skills, rules in scope); the archetypes themselves and their technology are part of this plan.
- **Decision** (2026-10-09, accepted by the owner): `explainer` renders its pages with Eleventy 3 from TypeScript sources (`.11ty.ts`, Node's type
  stripping), client modules bundled by vite-plus; alternative: pre-rendering with Vite only. Prove with a prototype.
  Superseded (2026-10-13, owner): `explainer` renders with a Vite plugin, Vite only, as the quiz does; the spike that
  opens the structure pull request decides, and Eleventy is the fallback if it fails.
  Result of the spike (2026-10-14, lernapps/app-templates#14): Vite alone works. `index.html` is Vite's only entry; in
  `generateBundle` the built page becomes the shell of every page, each in its folder with its asset URLs rewritten
  for its depth: 61 pages, one hashed client module, one stylesheet, no blockers. The Eleventy fallback is not needed
  (architecture: `dec-explainer-vite`).
- **Decision** (2026-10-09, accepted by the owner): question types of `quiz`: single choice, multiple choice, true/false, number (with tolerance and
  unit), ordering, matching; each with feedback per option and an explanation per question. Further types are
  engine extensions and never change the creator's data format.
- **Decision** (2026-10-13, owner): the `explainer` MVP as sketched under Code, step 11, with its decisions:
  content as YAML blocks; exercises beyond the quiz's types as `generated`, a native property-based notation;
  components starting with Vue as `vue-component`, rendered at build, hydrated as islands, with a required `nojs`
  text and required property tests of their exercise logic; language maps with German first and required; mandatory
  chapters, kept in the URL; structure only by sections, never by headings in text.

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
- **Decided** (2026-10-08): lernapps/app-templates holds the archetype templates (renamed from app-template).
- **Was open**: what becomes of lernapps/app-template (archetype templates, the generator itself, or the starting point
  for the first archetype); how the generator is invoked (`vp create` with our templates or `npm create`).

### KD-06: vite-plus is the default toolchain, configured by the archetype
[Vite+](https://viteplus.dev/) (`vp`) chains lint (Oxlint), format (Oxfmt), type check, test (Vitest) and the
pre-commit run on staged files (`vp staged`, hooks installed with `vp config`) behind one CLI and one config file.
- **Decision**: Scaffolds use vite-plus with its defaults, made stricter where our conventions need it. The config is
  owned by the archetype package, not written by each app. The content-heavy archetype may render its pages with Eleventy and use
  `vp` for lint, format, type check, test and staged. i18n and accessibility are part of the scaffolds.
- **Decision** (2026-10-08): TypeScript everywhere, strictly enforced, in every archetype: `strict` and the stricter
  compiler options on, no `any`, no JavaScript sources, type check in the pre-commit hook and in CI.
- **Decided** (2026-10-13, owner): the content-heavy archetype renders its pages with a Vite plugin (KD-02); its
  sources are YAML content and TypeScript, and Eleventy is the fallback.
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
- **Decision** (2026-10-09): One check command, `lernapps check`: `--pre-commit` runs the fast part (format, lint,
  types), `--pre-push` the heavy part (unit tests, build, checks of the built app, end-to-end tests with
  Playwright); no flag or both flags run everything. The hooks run the two parts, CI runs everything, so hooks and
  CI check the same. Playwright is part of the stack; heavy checks run at the creator, CI is only a safety net.

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

### KD-18: Rules live in their artifacts; the rule catalog is a concept
- **Decision** (2026-10-09): No central rule file and no compile step. Each rule lives where it acts: skill text
  (guided), Oxlint rule with its severity in the preset (checked on source), check of the check CLI (checked on the
  built app), rubric item (reviewed). Shared are the vocabulary (scope, severity) and stable rule ids (KD-22);
  the tooling's build reads the artifacts and tests the ids. Moving a rule is a pull request; it is expected to be
  rare.
- **Rejected**: a central catalog compiled into the artifacts - skill text cannot be generated well, the substance
  of checked rules is code anyway, and promotion is rare.

### KD-19: Discovery is a quality goal
- **Decision** (2026-10-09): "Listings help find the right app" (high), grounded in the platform's finding step.
  Explore asks what the entry needs to help adults find the app; the check CLI confirms with `--entry` that the app's
  URL and topic links resolve and the fitness values match. Listing is its own step of the solution strategy.

### KD-20: Review of the architecture, 2026-10-09
- The solution strategy follows the creator's journey and does not repeat the quality goals.
- The check CLI reports in YAML (schema as JSON Schema).
- Deployment: an environment for agents defined by lernapps (review agent, evals; today the owner's machine) and
  the creator's agent harness, into which `AGENTS.md` and the skills are deployed.
- Cross-cutting concepts are only those that affect several blocks: rule catalog, plain language, terse output,
  logging and traceability, stable contracts; the rest moved into the building blocks.
- The architecture names no single app, describes no progress and quotes no ids of other documents; direct cross
  references to the platform design are deep links.
- lernapps/app-template is renamed lernapps/app-templates.

### KD-21: How each step is built and committed
- **Decision** (2026-10-09, owner): Test-driven, from the consumer's contract: the test is written against what a
  consumer relies on (a command's output and exit code, `npm run check` on a fresh clone, a built bundle), seen
  failing, then the implementation follows. End-to-end first: tests run the real command on a real fixture (a
  temporary repo, a built bundle, a local server). No unit tests of internals; unit tests only where a piece of
  logic's own contract is consumed.
- **Decision** (2026-10-09, owner): Each issue is implemented by a fresh agent on its own branch, with a pull request
  that the owner merges.
- **Decision** (2026-10-09, owner): Commits follow Conventional Commits; the body has the sections `## Intent` (why),
  `## Key decisions` (the choices made and why) and `## Side effects (if any)` (what else changes, or "None"), then
  the attribution lines.

### KD-22: Rule ids are unique per artifact kind; agreement is reviewed, not checked
- **Decision** (2026-10-09, owner): The same rule may be told preventively in a skill and checked by a lint rule or
  check under the same id. Ids are unique within each kind of artifact (skills, checks, lint rules, rubric); the
  build does not cross-check the kinds, so a rule block has no `enforcement` key. `npm run rules` lists every rule
  grouped by id as YAML; the skill `rules-review` has an agent read that list and report drift, gaps and moves.
- **Rejected**: cross-checks between the artifacts (every implementation declared in a skill, enforcement matching
  the implementation) - they need extra metadata in every artifact and forbid a rule told and checked at once.

## Notes

- **Existing building blocks**: site actions and Renovate preset (this repo); site frame with `lernapps-check`
  (lernapps.github.io `site-frame/`); entry schema, `llms.txt` listing guide and listing criteria (lernapps/apps,
  `schemas/entry.js`, `src/llms.njk`, `src/_data/de.js` `list.criteria`).
- **From the Mathe-Karte** (lernapps/mathe-karte): `werkzeuge/skill/lern-app/` (skill and sub-agent brief),
  `werkzeuge/review/ki-review.md`, `e2e/` (Playwright + axe), `lib/pruefe-ausgabe.js`, `lib/pruefe-links.js`,
  `lib/pruefe-lizenzen.js`, `CLAUDE.md` (project rules).
- **Org rules for every page, in every repo** (ORGANIZATION.md): no cookies, no tracking, no requests to other servers
  before a click; WCAG 2.1 AA, usable at 360 px; imprint and privacy notice linked. Readable without JavaScript applies
  only to lernapps.net's own site (the site frame and the catalog), not to apps (#47, lernapps/.github#42); the
  explainer archetype promises it as its own rule. Shared infrastructure in English, texts for learners, teachers and
  parents in German.
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

### Completed
- [x] Set up arc42 in this repo: skill `arc42-language` in `.agents/skills/` (`skills-lock.json`), CLI `@doctc/arc42`
  pinned in `package.json`, workspace `docs/arc42/` (`npm run arc42 -- <command>`, `npm run check` validates)
- [x] Ch. 1 Introduction and goals: use cases, stakeholders
- [x] Ch. 10 Quality requirements: seven goals grounded in the platform design, thirteen scenarios with their
  measurement source (KD-16)
- [x] Publish the architecture at lernapps.net/tooling/ (`pages.yml`) with a preview per pull request that
  contains the arc42 diff and one comment listing the changes (`pr-preview.yml`, `scripts/review-summary.mjs`),
  as in lernapps/docs
- [x] Ch. 1 reworked as the five-step journey; ch. 2 constraints, ch. 3 context, ch. 4 solution strategy,
  ch. 5 building blocks (one package `@lernapps/tooling`, templates in app-templates, listing validation in apps),
  ch. 6 runtime (new app, failing push, listing validation, rule change), ch. 7 deployment, ch. 8 concepts (rule
  model, promotion path, plan file, messages for agents, validation report, versioned distribution, strict
  TypeScript, i18n and a11y, third-party content, measurement), ch. 9 decisions (21, three proposed), ch. 11 risks,
  ch. 12 glossary; `arc42 validate`: 0 errors, 0 warnings
- [x] Archetypes `explainer`, `interactive`, `quiz`; p90 of failed pre-push runs below 5
- [x] Owner review of the architecture (2026-10-09) and of the archetype proposals in KD-02 (accepted)
- [x] Order of building agreed with the owner (2026-10-09); each step is an issue under the tracking issue
  [#9](https://github.com/lernapps/tooling/issues/9)

## Code

### Tasks
*Order of building agreed with the owner (2026-10-09). Tracking issue: [#9](https://github.com/lernapps/tooling/issues/9).
Each step brings its rules in their artifacts and, where it touches the guidance, an eval run. To close the circle
with the quiz archetype first (owner, 2026-10-12): 9 → 13 → a first full run → 10, then 11 and 12. Done up to the
first run. Next (owner, 2026-10-13): an MVP of the explainer archetype based on the Mathe-Karte, to see that the
principles hold there (11, sketch below), before the evals (10); then 10 and 12.*
- [ ] 11 · The explainer archetype ([#19](https://github.com/lernapps/tooling/issues/19)): first an MVP based on the
  Mathe-Karte, sketched below and decided by the owner (2026-10-13). The issue's "prototype first" (Eleventy
  or Vite only) becomes the spike that opens the structure-and-blocks pull request (sketch, step 2 and Q1). Steps
  1–5 (app-templates) are done, see Completed, and 6 (tooling: the archetype `explainer`, merged in #59); 7 (the
  check at the gate) is in review in #64; next: 8
- [ ] 10 · Evals for the quiz archetype ([#18](https://github.com/lernapps/tooling/issues/18))
- [ ] 12 · The interactive archetype ([#20](https://github.com/lernapps/tooling/issues/20))
- [ ] Open points of the documentation site ([#6](https://github.com/lernapps/tooling/issues/6))

### Sketch: the explainer MVP (step 11, decided by the owner)

*Proposal of 2026-10-13, revised the same day after three reviews by the owner, who then decided it: subject-neutral blocks, the quiz's
question types as exercises, a structure of four levels, a second fixture that is not maths; then generated exercises
in a property-based notation, Vue components, several languages and mandatory chapters. Sources: KD-02, KD-06,
KD-09, KD-11, KD-21; issue #19; the Mathe-Karte (lernapps/mathe-karte: `src/prozent/`, `src/kern/`,
`src/_includes/kompetenz.njk`, `lib/bild.js`, `lib/pruefungen.js`, `e2e/`, `test/apps/vertrag.test.js`,
`werkzeuge/skill/lern-app/`, `werkzeuge/review/ki-review.md`); the quiz archetype (app-templates `quiz/`,
`runtime/quiz/`; tooling `generator/`, `archetypes/shared/`, skills, `review/`).*

**Decided** (owner, 2026-10-13): the owner agreed to every proposal of this sketch; the decisions are listed in 11.
Implementation starts from here, one pull request per step of 10.

**What the Mathe-Karte is.** Eleventy 3 over plain JavaScript, one shared kern, ~20 apps. Per app a config (`APP`,
`KOMPETENZEN`), per topic ("Kompetenz") a Markdown file with front matter only: `warum`, `regel`, `beispiel` as
free HTML, `bild`, `video`, `serlo`. One layout renders Warum, Regel, Beispiel, Bild, Video, Übung. Per topic a
generator and checker in free JS (`erzeugeAufgabe(zufall, vorgaben)`, `pruefeAntwort`): seeded "nice" numbers,
several contexts with text templates, typical mistakes diagnosed with their own message, a Rechenweg. Pictures: one
drawing function per topic renders static SVG at build (a mini DOM) and redraws it in the browser. Formulas: plain
text in `<code>` (`W = G · p / 100`), no renderer. Per app also a start page with self-assessment, a test page,
`llms.txt` and a tutor prompt. Its rules come from tests and build checks: generator contract for every topic
(deterministic per seed, the solution passes, nonsense fails), the picture does not give the answer away, plausible
numbers, files under 500 lines, no external resources, dead links, the tutor link allowlist; Playwright for no-JS,
360 px, axe, external requests.
- **Explainer** (static): Warum, Regel, Beispiel, the formulas, the picture of the example, sources.
- **Interactive**: the exercise (generator, input, checker, feedback, Rechenweg, picture of the task), self-assessment,
  test page, video embed after a click.
- Without JavaScript its exercises show only "Für die Übungsaufgaben brauchst du JavaScript". The MVP does better.
- Its page structure (Warum, Regel, Beispiel) is maths-shaped. The archetype must also carry biology, physics,
  chemistry, computer science and history, so the MVP takes the Mathe-Karte as its first content, not as its model.

#### 1. Scope of the MVP
- The content stays Mathe-Karte-based: an app with chapters; the chapter Prozent (Klasse 7/8) with three pages,
  Prozentwert, Prozentsatz and Grundwert; each page has the sections Warum, Regel, Beispiel and Übung.
- Blocks: the closed set of 2., all rendered at build. Data-drawn figure kinds in the MVP: `hundred-grid`
  (Hunderterfeld) and `bar` (Prozentstreifen).
- Exercises: the quiz's six question types, embedded as blocks, and `generated` (2.).
- Components: `vue-component`, with one component in the history fixture: a figure where the learner assigns the
  labels.
- Languages: German, plus any further languages the app declares; the fixtures use German and English.
- Generated navigation (3.) and `llms.txt` with the pages and deep links.
- Left out: test page, self-assessment, videos and other embeds after a click, the tutor prompt and its allowlist,
  component types other than Vue, variables as URL parameters (only `seed`), the curriculum map across apps, several
  apps in one repo, a search.

#### 2. The authoring model
The creator's assistant writes content as data. Code only comes in as a `vue-component`, under the contract in 2.,
"Components". A page is an ordered list of blocks from a closed set; a schema validates it at build.

| | A: YAML, a page as blocks, schema at build | B: Markdown with front matter and directives | C: Eleventy templates in TypeScript (`.11ty.ts`, KD-02) |
|---|---|---|---|
| Prose | restricted Markdown in `text` blocks | Markdown body | free templates |
| What a schema covers | everything | front matter only; the body needs a parser with rules | types only |
| Free HTML or code | none | needs HTML off and a directive per block type | anything |
| Deterministic validation | high | medium | low |

**Recommended: A.** YAML rather than JSON, because the content is long German prose (block scalars, no escaping).
The schema `explainer.v1.schema.json` is published at lernapps.net/tooling/schemas/, as the quiz's is, and the editor
finds it by a `yaml-language-server` comment. Raw HTML anywhere is a build error.

Every learner-facing text field takes restricted Markdown: bold, italics, lists, links, inline `$…$` and line breaks.
Headings in a text field (`#`, `##`, setext) are a build error, reported with file, block path and line; the message
says to make it a `section` block with that title. So there is one way to make structure, and the heading levels
stay derived from the nesting (`explainer-structure-by-sections`). Rejected: turning such headings into sections
silently.

Blocks (`type` and its fields):

| Block | Fields | Rendered at build to |
|---|---|---|
| `text` | restricted Markdown: paragraphs, bold, italics, lists, links, inline `$…$`, line breaks; no headings | HTML |
| `formula` | one formula in the LaTeX subset; `\ce{…}` for chemical equations and `\pu{…}` for units | MathML (Temml) |
| `figure` | a data-drawn `kind` with its parameters, or a bundled SVG/PNG; `caption`, `alt`; `source` and `licence` for files | inline SVG, or `<img>` of the bundled file |
| `labelled-figure` | a bundled image, numbered labels at positions, a legend, `alt`, `source`, `licence` | the image with numbered markers and an ordered legend, static |
| `table` | caption, header row, rows of restricted Markdown cells | `<table>` with `<caption>` and `scope` |
| `timeline` | dated events (date, title, text), in order | an ordered list with `<time>` |
| `definition` | term, explanation | `<dfn>` in place; collected into the app's glossary page |
| `quote` | source text, origin (author, work, year), `source`, `licence` where needed | `<blockquote>` with `<cite>` |
| `code` | language from a fixed list, the code | highlighted HTML (Shiki or Prism at build, no script in the page) |
| `example`, `note` | a title and blocks | a box with a heading |
| `section` | `id`, `title`, blocks | a heading and its blocks (3.) |
| exercises | the quiz's question types, `generated` | the exercise without JS, enhanced with JS (4.) |
| `vue-component` | `component` (a file in `src/components/`), `props`, `nojs` (required) | the `nojs` text in place, and the server-side render, hydrated as an island (4.) |

- **Formulas:** one notation, a LaTeX subset with a command list (`\frac`, `\cdot`, `\%`, `\text`, `^`, `_`,
  `\sqrt`, `\approx`, `\pm`, parentheses, `\ce`, `\pu`). A command outside the list or a parse error fails the build
  with file, block path and formula. MathML Core shows in current Chromium, Firefox and Safari, and screen readers
  read it. Chemistry: Temml (0.14.0, MIT, MathML only, no fonts, no script) ships the mhchem extension
  `contrib/mhchem/mhchem.js` (mhchem 3.3.0; MIT, adapted from MathJax's Apache-2.0 code, both on the licence
  allowlist). Tried in Node: `\ce{2H2 + O2 -> 2H2O}`, `\ce{CO2 + H2O <=> H2CO3}` and `\pu{123 kJ/mol}` render to
  MathML. The extension registers itself on a global `temml`, so the plugin loads it once at build.
- **"Warum / Regel / Beispiel"** is a recommended page structure in the skill (for maths and the sciences), not
  schema. The skill gives other recommendations per subject, e.g. for history: Quelle, Einordnung, Zeitleiste, Übung.
- **Data:** `src/data/<name>.yaml` holds lists of records (events with year and title, elements with their
  properties, organs with their function), validated against their schema at build. Blocks and `generated`
  exercises draw from them.

Exercises, as blocks:
- **The quiz's question types**: `single-choice`, `multiple-choice`, `true-false` (a statement), `ordering`,
  `matching` (pairs) and `number` (an estimate, with tolerance and unit). They have the same fields as in
  `quiz.json`, and the same `$defs/question` of the quiz's schema, the same validation (`validate.ts`), the same
  checker (`isCorrect`, `rightAnswer`, `wrongAnswer`) and the same feedback (`info` per option, `explanation`, links).
  The difference is the no-JS form: the solution sits under the exercise in a `<details>` "Lösung", not at the end
  of the page.
- **`generated`**: a property-based notation in the style of fast-check, declared in YAML, for any subject:
  - `given`: arbitraries. Integers and decimals in ranges with a step (`int`, `decimal`); a pick from a list
    (`oneOf`); picks of records from a list or a data file (`pick`, `from`), several and `distinct`; strings from a
    list; a shuffle of a list (`shuffle`);
  - `where`: preconditions, as fast-check's `pre`;
  - `task`: a text template using the values (`{G}`, `{e.name}`; placeholders are replaced before a formula is
    rendered), and an optional figure of a data-drawn kind bound to them;
  - `answer`: an expression or a selection, and a comparator from a fixed set: `number` (format, decimals,
    tolerance), `choice` (exact), `order`, `set`, `pairs`. The comparator decides the learner's controls, and it is
    the quiz's answer kind of the same name (`number`, `single-choice`, `ordering`, `multiple-choice`, `matching`), so
    controls, checker and feedback come from the quiz runtime;
  - `mistakes`: an expression and a message each;
  - `hint` and `steps`.

  The expressions are a small language, parsed by the runtime, with no eval:
  - arithmetic on exact fractions (`+ - * /`, parentheses), `round(x, n)`, `abs`;
  - comparisons, `and`, `or`, `not`;
  - record fields (`e.year`), list index (`xs[0]`);
  - list functions `len`, `map(xs, field)`, `sortBy(xs, field)`, `reverse`, `minBy` and `maxBy`, `contains`,
    `distinct`;
  - `decimals(x)`.

  Three examples:

  ```yaml
  # Maths: percentage
  - type: generated
    id: prozentwert-ueben
    given:
      G: { int: [150, 1500], step: 5 }
      p: { oneOf: [5, 10, 12, 15, 20, 25, 30, 40, 50] }
    where: ["decimals(G * p / 100) <= 2"]
    task:
      text: "Ein Fahrrad kostet {G} €. Im Angebot gibt es {p} % Rabatt. Wie viel Euro sparst du?"
      figure: { kind: hundred-grid, filled: p }
    answer: { value: "G * p / 100", compare: { number: { format: money } } }
    mistakes:
      - { value: "G * p", message: "Du hast vergessen, durch 100 zu teilen." }
      - { value: "G - G * p / 100", message: "Das ist der neue Preis, nicht der Rabatt." }
    hint: "Rechne erst 1 % aus: G geteilt durch 100."
    steps: ["$W = \\frac{G \\cdot p}{100}$", "$W = {G} \\cdot {p} : 100 = {answer}$"]
  ```

  ```yaml
  # History: order three events picked from a list of records
  - type: generated
    id: ereignisse-ordnen
    given:
      events: { pick: 3, distinct: true, from: { data: ereignisse } } # records: year, title
    where: ["distinct(map(events, year))"]
    task: { text: "Bringe die Ereignisse in die richtige Reihenfolge, das früheste zuerst." }
    answer: { value: "map(sortBy(events, year), title)", compare: order }
    mistakes:
      - { value: "map(reverse(sortBy(events, year)), title)", message: "Umgekehrt: Das früheste Ereignis kommt zuerst." }
  ```

  ```yaml
  # Chemistry: element to main group, from a list of records
  - type: generated
    id: hauptgruppe
    given:
      e: { pick: 1, from: { data: elemente } } # records: symbol, name, group, period
    where: ["e.group != e.period"]
    task: { text: "In welcher Hauptgruppe steht {e.name} ({e.symbol})?" }
    answer: { value: "e.group", compare: { choice: [1, 2, 3, 4, 5, 6, 7, 8] } }
    mistakes:
      - { value: "e.period", message: "Das ist die Periode, also die Zeile. Die Hauptgruppe ist die Spalte." }
  ```

  The build treats every `generated` block as a property test over 200 fixed seeds:
  - `where` holds often enough: at least one draw in ten passes, so the exercise does not starve;
  - the answer is defined and in its format, and it passes its own comparator;
  - no mistake equals the answer under the comparator;
  - the task is the same for the same seed, and no placeholder is left;
  - the unsolved figure does not show the answer.

  The Mathe-Karte's `prozentwert.js` becomes about 20 lines of YAML; the same notation carries the history and
  chemistry exercises above.

Components (`vue-component`):
- **Files:** single-file components in `src/components/<Name>.vue`, with `<script setup lang="ts">`, strict
  TypeScript and typed props (`defineProps<…>()`), and next to each a test file `<Name>.test.ts`.
- **Props:** the build reads each component's prop types (`vue-component-meta`) and validates every block's `props`
  against them.
- **`nojs`:** every `vue-component` block requires a `nojs` field: localisable restricted Markdown that says what the
  component does and gives the static alternative, e.g. the labelled diagram described, or the task with its
  solution in a `<details>`. The build renders it in place. A component's own rendering may be empty or meaningless
  without JS (a canvas, drag and drop), so the no-JS contract rests on `nojs`, not on it.
- **Rendering:** server-side rendering at build (`vue/server-renderer`) writes the component's markup into its island,
  `hidden` until it hydrates. When it hydrates, the component replaces the `nojs` text, or keeps it as a caption if
  the component declares so (`defineOptions`). Only components hydrate, as islands, so a page without components
  ships no client JS beyond what its other exercises need.
- **Exercise contract:** a component that emits `answered { correct }` is an exercise. Its logic sits in a pure
  TypeScript module next to it, `<Name>.ts`, with `generate(seed)` and `check(task, answer)`, plus `solution(task)`
  and `wrong(task)`, which the property test needs. The build runs property tests on it with fixed seeds: the task is
  deterministic, the solution passes, the wrong answer fails, and nothing throws. This is required (error) for
  interactive components.
- **What a component may do:** no network; storage only through the wrapper; no `eval`, `innerHTML` or `v-html`;
  imports only from `vue`, our runtime and `@lernapps/tooling` (`storage`, `i18n`, `a11y`); browser globals only in
  `onMounted`; a size budget per component (Q3). The build checks these on the SFC compiler's output, script and
  template alike; the lint plugin reports the same in the editor where oxlint reaches the `<script setup>`.
  Type-checking `.vue` files needs `vue-tsc` in the check's type step.
- **The skill says:** prefer a built-in block or `generated` exercise when one fits; a component is for what they
  cannot express.
- **Step 12:** the interactive archetype (#20) gets cheaper, because it can use the same component model, rules and
  checks.

Why: a schema and a parser decide all the content, and the runtime renders it. Readable without JavaScript,
accessible markup and working deep links then hold by construction for the built-in blocks and are tested once, in
the runtime; a component is readable without JavaScript through its required `nojs` text. What the
Mathe-Karte proves with per-topic tests becomes generic property tests: on the data for `generated`, on the logic
module for components. Code is allowed in exactly one place, under a contract the build checks.

#### 3. Structure
Four levels, no deeper:
- **App:** `src/app.yaml`: title, intro, sources, `languages`, and the order of the chapters.
- **Chapter:** a folder `src/<chapter>/` with `chapter.yaml`: title, summary, and the order of the pages.
- **Page:** `src/<chapter>/<page>.yaml`: title, blocks.
- **Sections:** `section` blocks inside a page (`id`, `title`, blocks), with at most one nested section level.

How it behaves:
- Chapters are mandatory. An app with one chapter hides it in the navigation: the breadcrumbs and contents skip the
  level, and the start page lists the pages. The URL keeps the chapter (`/<chapter>/<page>/`), so a second chapter
  added later breaks no deep link.
- Heading levels come from nesting: page h1, section h2, subsection h3. A deeper nesting is a build error; blocks
  carry no heading levels of their own (the boxes of `example` and `note` take the next level).
- The order lists are explicit and complete: every file listed exactly once, else a build error. Nothing is sorted
  by file name.
- Ids are paths, unique per level, lowercase letters, digits and hyphens, and stable, because the entry's topics
  link to them: `/<chapter>/<page>/#<section>`.
- The navigation is generated and works without JS:
  - tables of contents on the start page and on each chapter page;
  - breadcrumbs;
  - previous and next across chapters, in the order of the lists;
  - contents at the top of a page with 3 or more sections;
  - the glossary page, from the `definition` blocks, linked from each term;
  - the language switch (5.).

Checked:
- **Build:** the schema, the order lists complete, the depth.
- **`explainerTests()` without JS:** heading levels match the nesting, every anchor exists, and previous and next form
  one unbroken chain over all pages.
- **`lernapps check`:** every page is reachable from the start page. The check already visits what the start page
  reaches; new is that a page in the runtime's list of pages (the bundle's `llms.txt`) that it does not reach is a
  finding. The entry's topic links resolve to pages or sections: `entry-links-resolve` checks the page today and
  learns to check the section's anchor.

#### 4. The no-JS contract
- Every page is complete static HTML: all text, every formula as MathML, every figure, table, timeline, quote and code
  block, the navigation, links and sources. The script only adds; it hides and replaces nothing that is there
  without it.
- Exercises without JS:
  - a quiz-type exercise shows its question and options, and a `<details>` "Lösung" with the right answer, the
    background of every option, the explanation and the links (the quiz's worksheet form, per exercise);
  - a `generated` exercise shows three worked tasks from fixed seeds: task text, figure, and a `<details>` "Lösung"
    with the steps and the answer;
  - a `vue-component` shows its `nojs` text; its own markup stays `hidden` until it hydrates.

  Native `<details>` needs no script. With JS, the exercise becomes live: controls, "Prüfen", feedback in view with
  the focus (app-templates#10). A `generated` exercise also gets "Neue Aufgabe" and the deep link
  `/<chapter>/<page>/?seed=<n>#<exercise>`; a component hydrates in place. No `<noscript>` saying that JavaScript is
  needed.
- Checked deterministically:
  - by construction for the built-in blocks: the runtime renders everything the content says; for components, the
    schema requires `nojs` in every declared language;
  - by `explainerTests()` with JavaScript off, for every page in every language: each section heading is visible, the
    number of `<math>` elements equals the formulas in the data, every figure is visible with its name, each
    component's `nojs` text is visible and not empty, and every "Lösung" opens and shows the answer the checker
    accepts. This runs in `lernapps check --pre-push`, in the hooks and in CI;
  - at the gate (Q4, decided): a check of `lernapps check`, scoped to pages the runtime marks as explainer pages
    (`<meta name="lernapps-archetype" content="explainer">`). It visits them without JavaScript and finds the
    headings, formulas, figures, solutions and each component's `nojs` text, visible and not empty. It works on a
    deployed URL, so the listing validation and `/review` run it too.

#### 5. Languages
- Every learner-facing text field is either a string or a language map `{ de: …, en: … }`. This covers text, titles,
  captions, alt texts, `\text{}` in formulas, record fields in data files, exercise texts, messages and component
  props of text type.
- `app.yaml` declares `languages`, German first and required. A plain string is German, and valid only while German
  is the only language.
- The build fails on a missing translation for a declared language, and on a language that is not declared.
- Ids, paths, numbers, formulas and data-drawn figures are language-neutral.
- Output is one page tree per language: German at the root, others below `/<lang>/` (`/en/…`). Each page has `lang`
  and `hreflang` alternates, and a language switch that is a plain link, so it works without JS.
- The generic tests run per language.
- `learner-text-german` becomes "German always present; every other declared language complete". The build enforces
  it for the explainer.
- Embedded quiz-type exercises take the same text shape: the quiz's shared question schema accepts language maps
  (10., step 3), and plain-string banks stay valid. The quiz template itself becomes multi-language in step 4.

#### 6. Rules
The owner removed the site rules and readable-without-JavaScript for apps in general (#47, #49). For the explainer it
comes back as an **archetype rule** (`archetype:explainer`), because it is what the archetype promises (KD-02). Apps
of other archetypes stay unbound.

Generic, for every block and page:

| Id | Severity | Enforced by |
|---|---|---|
| `explainer-only-content`: write only the YAML of app, chapters, pages and data, bundled image files, and components with their logic and tests in `src/components/` | error | build (no other files in `src/`), skill, rubric; with `keep-the-preset` |
| `explainer-content-valid`: every block and exercise validates (schema, unique ids, every reference and placeholder declared, formulas in the command list) | error | build, one line per problem with file and block path |
| `explainer-structure-complete`: chapters present, every file listed exactly once in its order list | error | build |
| `explainer-structure-depth`: app, chapter, page, two section levels; heading levels from the nesting | error | build; `explainerTests()` |
| `explainer-stable-ids`: ids are lowercase paths, unique per level, kept once published | warning | build (form, uniqueness); skill, rubric (kept) |
| `explainer-navigation`: tables of contents, breadcrumbs, previous and next in one chain, every page reachable | error | `explainerTests()`; `lernapps check` (reachable, section anchors of the entry) |
| `explainer-languages`: German first, every declared language complete, no undeclared one; one page tree per language with `lang`, `hreflang` and a switch | error | build; `explainerTests()` |
| `explainer-readable-without-js`: every block is readable without JS; components through their required `nojs` text | error | schema (`nojs` required); `explainerTests()` and `lernapps check` (Q4): each `nojs` text visible and not empty; rubric: the `nojs` text carries the meaning |
| `explainer-structure-by-sections`: structure only by `section` blocks; no Markdown headings in text fields | error | build, with file, block path and line |
| `explainer-formulas-static`: formulas only in `formula` blocks or `$…$`, rendered at build | error | build; rubric for formulas left as plain text |

Type-specific, only for their block or exercise type:

| Id | Applies to | Severity | Enforced by |
|---|---|---|---|
| `explainer-generated-sound`: over 200 seeds `where` does not starve, the answer is defined, in format and passes its comparator, no mistake equals it, the task is deterministic | `generated` | error | build (property test with fixed seeds); `explainerTests()` in the browser |
| `explainer-figure-hides-answer`: the task's figure shows the answer only after a right answer | `generated` | error | build (the answer is not in the unsolved figure, sampled seeds) |
| `explainer-plausible-numbers`: ranges fit the thing in the text, no 90.91 people | `generated` with numbers | warning | skill, rubric; the format part by the build |
| `explainer-mistakes-diagnosed`: name the typical mistakes, and say in each message what went wrong | `generated` | hint | skill, rubric |
| `quiz-bank-valid`, `quiz-clear-question`, `quiz-plausible-options`, `quiz-feedback-explains`, `quiz-fitting-type`, `quiz-number-precision` | quiz-type exercises | as in the quiz | as in the quiz; their scope widens to `[archetype:quiz, archetype:explainer]` |
| `explainer-figure-explains`: the figure shows what the text says, the caption says what to see | `figure`, `labelled-figure` | hint | skill, rubric |
| `explainer-quote-sourced`: a quote names its origin and is quoted exactly | `quote` | warning | schema (origin required); rubric (exact) |

Components, scope `archetype:explainer` now and `archetype:interactive` with step 12:

| Id | Severity | Enforced by |
|---|---|---|
| `vue-component-props-valid`: every block's `props` match the component's prop types | error | build (`vue-component-meta`, schema) |
| `vue-component-nojs`: every block has a `nojs` text, in every declared language | error | schema; `explainerTests()` without JS |
| `vue-component-exercise-contract`: a component that emits `answered` has its logic module with `generate`, `check`, `solution` and `wrong`, and the property tests pass | error | build (property test with fixed seeds) |
| `vue-component-tested`: a test file per component, and it passes | error | build (file exists); `lernapps check` (unit tests) |
| `vue-component-no-network`: no `fetch`, XHR, WebSocket, EventSource, beacon, no import from a URL | error | build on the SFC compiler's output; lint |
| `vue-component-no-html-injection`: no `eval`, `new Function`, `innerHTML`, `v-html` | error | build; lint |
| `vue-component-imports`: imports only from `vue`, our runtime, `@lernapps/tooling` and the component's own folder | error | build; lint |
| `vue-component-browser-globals`: `window`, `document`, `localStorage` and the like only inside `onMounted` | error | build; lint; server-side rendering fails otherwise |
| `vue-component-size`: the component's own code within the budget (Q3) | error | build |
| `prefer-built-in-block`: a component only where no built-in block or `generated` exercise fits | hint | skill, rubric |

Storage in components is `storage-through-wrapper`, unchanged.

Reused unchanged: `keep-the-preset`, `strict-typescript`, `storage-through-wrapper`, `pages-from-gh-pages`,
`learners-act`, `accessible` (the schema requires `alt` and `caption`), `usable-at-360px`, `links-resolve`,
`entry-links-resolve`, `no-request-before-click`, `no-tracking`, `third-party-licence` (the schema requires `source`
and `licence` for every bundled image and for quotes under copyright), `correct-content-support`. Changed:
`learner-text-german` (5.). `topic-has-exercises` stays, from hint to **error**, per page: the schema requires an
exercise block on every page, except the glossary and the tables of contents. The rubric still judges whether the
exercise practises what the page explains.

#### 7. Instructions
- **Skill `lernapps-explainer`**, shaped like `lernapps-quiz`:
  - how the explainer works: what is built in, what you write, what the build checks, the page without and with JS,
    the deep links;
  - the structure: chapters (one is hidden), the order lists, ids as paths, when to split an app instead of nesting
    deeper;
  - the blocks, each with a short example; the formula command list, with `\ce` and `\pu` for chemistry;
  - recommended page structures per subject, e.g. Warum, Regel, Beispiel, Übung for maths and the sciences, and
    Quelle, Einordnung, Zeitleiste, Übung for history;
  - exercises: the quiz's types, pointing to `lernapps-quiz` for writing good questions; `generated` with the three
    examples (arbitraries, `where`, comparators, mistakes, the property test's messages);
  - components: prefer a built-in block; the files, the exercise contract, what a component may do, the test file;
  - languages: language maps, German first;
  - that each page's or section's path is a `topics` entry of the entry draft (`entry-links-resolve`);
  - for a failing runtime test, a pointer to `lernapps-app`;
  - the rules above.
- **Plan template:** no change. Its archetype choice already names `explainer`, and the skill carries the rest, so the
  template stays archetype-neutral.
- **Review rubric** `review/archetypes/explainer.md`: `topic-has-exercises` judged for fit, not presence; new items
  `explainer-mistakes-diagnosed`, `explainer-plausible-numbers`, `explainer-figure-explains`,
  `explainer-quote-sourced`, `explainer-formulas-static` (formulas as plain text), `explainer-readable-without-js`
  (meaning only inside an exercise, or a component's `nojs` text that does not carry the meaning),
  `explainer-stable-ids` (against the last listed version) and `prefer-built-in-block`. The quiz's rubric item `quiz-feedback-explains` also applies to quiz-type exercises.

#### 8. Tests and validation
Test first, end to end, on fixtures (KD-21, issue #19):
- app-templates: the template `explainer/` passes `lernapps check` in the CI matrix next to `quiz`.
- **Many pages:** a job `explainer-many-pages`, like `quiz-many-questions`, swaps in a fixture of 60 pages in several
  chapters, with two section levels, every block type and every exercise type, in German and English. It runs
  `lernapps check --pre-push` within the default timeouts.
- **Not maths:** a second fixture, a short history app with one hidden chapter. It has `timeline`, `quote`,
  `definition`, an `ordering` exercise, the `generated` events exercise, and one `vue-component`: a figure where the
  learner assigns the labels. It must pass the same checks; a maths bias of the runtime or the checks shows there.
- **Broken fixtures**, each failing the build with its one line:
  - unknown LaTeX command, raw HTML, a heading inside a text field, undeclared variable;
  - a mistake equal to the answer, a `where` that starves;
  - an image without licence, a quote without origin;
  - a file missing from an order list or listed twice, a third section level;
  - a missing translation, an undeclared language;
  - props that do not match the component's types, a `vue-component` without `nojs`, a missing component test
    file, an interactive component without its logic module;
  - a component that fetches, imports another package or touches `window` outside `onMounted`;
  - an extra file in `src/`.
- `explainerTests()`, for every page in every language:
  - without JS: as in 3. and 4.;
  - with JS:
    - each quiz-type exercise accepts its right answer and rejects a wrong one, and shows the feedback in view with
      the focus;
    - each `generated` deep link with a seed shows the task the notation gives for that seed. The right answer
      counts, each declared mistake shows its message, the comparator's wrong answer is wrong, and "Neue Aufgabe"
      changes the task;
    - each component hydrates without a console error;
  - nothing is stored. The tests run with reduced motion and in parallel.
- tooling: `create.e2e` generates an explainer app, installs it and runs `lernapps check` (passes). A fixture page
  that is empty without JS fails the new check (Q4), and a content page the start page does not reach is a finding.
  lernapps/apps' entry-point test covers the explainer by itself, because it runs every archetype the tooling names.

#### 9. Reuse map
- **Shared with the quiz, unchanged:** generator (`create`, `update`, the pin, the generated workflows, issue form,
  LICENSE, Renovate), preset and `tsconfig`, `lernapps hooks`, `lernapps check` and its checks, the Playwright preset,
  storage, i18n and a11y helpers, the app check and publish actions, the listing validation, `/review`, the plan
  template and `AGENTS.md`, the skills `lernapps-app` and `lernapps-listing`.
- **Shared with the quiz runtime, by import:**
  - the six question types, the schema's `$defs/question`, the question validation and the checker;
  - the rendering of controls and of the solution with background and links;
  - the per-question feedback and focus of the engine, and their messages;
  - the e2e helpers `answerQuestion`, `expectBackground` and `expectFeedbackInView`;
  - the skill `lernapps-quiz` for writing questions.

  `generated` uses the same controls, checker and feedback through its comparators. To share them, the quiz runtime
  exports them per question: today `parseBank`, `renderQuiz` and `startQuiz` work on a whole bank.
- **Shared with the interactive archetype (step 12):** the `vue-component` model: server-side rendering, islands,
  props validation, the exercise contract with its property tests, the component rules and checks.
- **Same pattern, new code in `runtime/explainer/`:** the Vite plugin with build-time validation, a published schema,
  rendering into a shell with a marker, generic e2e from the app's data, messages, styles, a many-items CI job.
- **New:**
  - the structure: levels, order lists, navigation, glossary;
  - multi-page rendering, one page tree per language;
  - the blocks and their rendering: restricted Markdown, Temml with mhchem, figure kinds, labelled figures, tables,
    timelines, quotes, code highlighting;
  - data files of records;
  - `generated`: arbitraries, the expression language, the property test at build, worked tasks;
  - `vue-component`: server-side rendering at build with `vue/server-renderer`, the island loader, props from
    `vue-component-meta`, the build checks on the SFC compiler's output, `vue-tsc` in the type step;
  - `llms.txt`, the skill `lernapps-explainer`, the explainer and component rules, the check of Q4.

#### 10. Steps and pull requests
1. **app-templates: the quiz's questions per question.** The runtime exports validation, rendering, checking and
   feedback per question; the quiz uses the same exports. *Done when* the quiz's tests and `quiz-many-questions` pass
   unchanged.
2. **app-templates: explainer structure, blocks and languages.** The first commit is the spike: the plugin emits many
   pages and one hashed client module with `vp build` (KD-02's "Vite only"); the result goes into this plan. Then
   the schema, chapters and navigation, the blocks without exercises, headings in text rejected, data files, language
   maps and page trees, the template with the Prozent chapter, and `explainerTests()` without JS. *Done when* `lernapps check` passes in
   `explainer/`, on the 60-page fixture and on the history fixture without its exercises and component, and every
   broken fixture of these parts fails the build with its line.
3. **app-templates: exercises.** Quiz-type exercise blocks and `generated`: arbitraries, expression language,
   comparators through the quiz's checker, the property test at build, worked tasks without JS, and the JS part of
   `explainerTests()`. Language maps in the shared quiz question schema and its validation (owner, 2026-10-14),
   because the explainer embeds the quiz's question types through `$defs/question`:
   - every learner-facing text field of a question (question, options, statements, pairs, background and `info`,
     explanation, link titles, units) accepts a string or a language map `{ de: …, en: … }`;
   - German is required and first; completeness is checked against the declared languages, with the same messages
     as the explainer's language check;
   - the shared language-map module of step 2 is reused;
   - rendering and the checker pick the page's language;
   - existing quiz banks stay valid unchanged (plain strings).

   *Done when* the e2e tests check every exercise of the template and both fixtures, the fixtures with a mistake
   equal to the answer and with a starving `where` fail the build, an explainer fixture page with an embedded
   quiz-type exercise in German and English passes, a missing translation in an embedded question fails the build
   with its line, and the quiz's own tests and the `quiz-many-questions` job pass unchanged.
4. **app-templates: the quiz in several languages.**
   - an optional `languages` field in the bank;
   - one page per language, German at the root and others under `/<lang>/`, with `lang`, `hreflang` and a language
     switch that works without JS;
   - `quizTests()` run per language;
   - the skill `lernapps-quiz` mentions it.

   *Done when* a bilingual fixture bank passes `lernapps check` and the existing banks are unchanged.
5. **app-templates: `vue-component`.** The `nojs` text, server-side rendering at build, islands, props validation,
   the exercise contract and its property tests, the build checks on the SFC, the size budget, and the labelling
   component of the history fixture with its logic module and test. *Done when* the history fixture passes
   `lernapps check`, a page without components ships no component JS, and each broken component fixture fails the
   build with its line.
6. **tooling: the archetype `explainer`.**
   - pin bump and `appTemplates.archetypes`, the schema on the docs site;
   - `vue-tsc` in the check's type step for apps with `.vue` files, and the component lint rules in the lint plugin;
   - the skill `lernapps-explainer` with its rules, the quiz rules' wider scope, `learner-text-german` reworded,
     `topic-has-exercises` to error, the rubric, `create.e2e`;
   - arc42 where it names only the quiz's runtime, KD-02's rendering decision, and the component model.

   *Done when* `lernapps create --archetype explainer`, `npm install` and `npx lernapps check` pass in the test and
   in CI, `npm run rules` lists the new ids, and lernapps/apps' entry-point test passes for both archetypes.
7. **tooling: the check `explainer-readable-without-js`** (Q4), unreached pages as a finding, and section anchors in
   `entry-links-resolve`. It brings back the page visit without JS that #47 removed, only for marked pages.
   *Done when* the empty-without-JS fixture and a component with an empty `nojs` text fail it, and quiz and other
   bundles are unaffected.
   As built (in review, #64): the visit opens a marked page a second time in one more browser context with JavaScript
   off, shared by all marked pages, at the same time as the rest of its visit; an app without the marker gets no
   such context. Without JavaScript, every `<details>` opened: the page's h1, each heading, `<math>` and figure
   visible, a figure with its accessible name, each exercise with a "Lösung" that is not empty, each component's
   `nojs` text visible and not empty. Not read: the parts the runtime fills only with JavaScript (island, live task,
   a question's controls and reveal). It counts no formulas against the content, which a URL does not have; that
   stays with `explainerTests()`. A topic's `#<section>` must be an element id of its page in the HTML as the server
   sends it, without a browser. `pages-reachable` needed no change: the template, both fixtures and a bundle of two
   language trees with chapter pages and the glossary give no finding.
8. **A first full explainer run**, from a creator prompt to the listing, as with naturwunder-quiz; the lessons go
   into this plan. *Done when* the app is listed or each lesson is an issue. Then 10, with both archetypes.

#### 11. Decisions (owner, 2026-10-13)
The open questions of the earlier versions, decided:
- **Q1 Rendering:** a Vite plugin, KD-02's alternative, with one toolchain as for the quiz; the spike that opens the
  structure pull request (10., step 2) decides, and Eleventy is the fallback.
- **Q2 Authoring format:** YAML, with pages as blocks.
- **Q3 Data or code:** content and `generated` exercises are data; code comes in only as a `vue-component` under its
  contract. Size budget: 20 kB gzip of the component's own code, with Vue loaded once per page; a component that
  needs more is split, or becomes a new built-in block.
- **Q4 No-JS at the gate:** `lernapps check` visits the pages marked as explainer pages without JavaScript, so the
  listing and `/review` check the promise too.
- **Q5 Later:** test page, self-assessment, videos and the tutor prompt come after the evals (10), each with its own
  issue; so do further figure kinds and other component types.
- **Q6 Depth:** chapter, page and two section levels; content that needs more is split into two apps.
- **Q7 Languages:** language maps, German first and required; the build fails on a gap.
- **Q8 Chapters:** mandatory; a single chapter is hidden in the navigation and kept in the URL.
- **Headings:** structure only by `section` blocks; a heading inside a text field is a build error.
- **`nojs`:** required for every `vue-component`.
- **Quiz blocks in several languages** (owner, 2026-10-14): "add the i18n for the quiz blocks in step 3". The
  shared quiz question schema takes language maps in step 3, so embedded questions have the explainer's text shape;
  the quiz template becomes multi-language in the step after it (10., step 4).

### Completed
- [x] 1 · The tooling's own build: package, strict TypeScript, vite-plus, hooks, `check` in CI
  ([#10](https://github.com/lernapps/tooling/issues/10), merged in #23). `npm run check` checks the code and builds
  nothing; the docs site is built and checked by the job `site` (`npm run build && npm run check:site`); the site
  actions have the input `check-script`; every site repo names its Pages job `site` (owner, 2026-10-09)
- [x] 2 · Rule ids and the id test; the first rules ([#11](https://github.com/lernapps/tooling/issues/11), merged in
  #28). Rules are declared as `rule` blocks in skills; a rule's scope can be a list; severity lives only in the rule
  block; ids shared with other mechanisms are one rule enforced several ways; the id test reads the artifacts and
  writes the rule page at lernapps.net/tooling/rules/
- [x] 5 · Process guidance: `AGENTS.md`, the plan template, its front matter schema and the skill `lernapps-app`
  ([#14](https://github.com/lernapps/tooling/issues/14), merged in #27)
- [x] 3 · Check CLI `lernapps check` ([#12](https://github.com/lernapps/tooling/issues/12), merged in #31): checks of
  the built app in `check/rules/`, each with its rule id and severity; YAML validation report with its schema;
  `--entry`, `--site`, `--report`; every check runs, those without input are left out. 26 rules. Follow-ups:
  suppressions with a reason, `on-click` measured by clicking, external links, per-archetype readability, `npm audit`
- [x] 4 · Shared preset and lint rules ([#13](https://github.com/lernapps/tooling/issues/13), merged in #34): an app
  needs `export default lernapps()`, a `tsconfig.json` that extends the package's, and one `prepare` line for the
  hooks; Playwright, storage, i18n and a11y helpers; lint plugin with `no-request-before-click`,
  `storage-through-wrapper`, `learner-text-german`, `suppression-reason`. Follow-ups: a blanket disable comment
  silences `suppression-reason`; a check that `vite.config.ts` turns no rule off; vite-plus and the package move
  together in Renovate
- [x] 8 · Review procedure and rubric ([#17](https://github.com/lernapps/tooling/issues/17), merged in #33):
  `review/prompt.md` for a fresh agent, rubric for all apps and per archetype, verdict schema and `npm run verdict`;
  tested with a recorded verdict on a fixture with a planted ad. Follow-ups: review the quiz app of step 6; move the
  archetype rule sections into the archetype skills; severity of the archetype rules (error or hint) is the owner's
  call
- [x] 6 · Generator and the quiz archetype ([#15](https://github.com/lernapps/tooling/issues/15), merged in #36
  with lernapps/app-templates#4): `lernapps create --archetype <name>` copies the archetype's folder of app-templates
  at the commit pinned in `package.json`; the app depends on the runtime `@lernapps/app-templates` of the same
  commit. The quiz is a deep scaffold: the assistant writes only the question bank `src/quiz.json`, validated at build
  time against its schema; the skill `lernapps-quiz` says how to write good questions
- [x] 7 · App check action ([#16](https://github.com/lernapps/tooling/issues/16)): `actions/app-check` runs
  `lernapps check` without a flag, exactly the hooks' command, and keeps the report every run writes
  (`node_modules/.cache/lernapps/validation-report.yaml`) as an artifact; on `main` it hands the checked `dist/` to
  `site-deploy`. The generated `pages.yml` uses it in place of `site-check`. CI runs what the hooks run in every repo:
  the generator's tests fetch app-templates at the pinned commit instead of being skipped. The check treats a link
  that only changes the query as the same page, so a quiz's random seed no longer changes the report. Tested by
  `test/app-check.e2e.test.ts` and the workflow `app-check.yml` on a passing and a failing fixture app
- [x] Review follow-ups (merged in #44): the tooling's own pre-push hook runs the heavy end-to-end tests only for
  the paths they exercise, CI runs everything (`dec-tooling-pre-push`, the one exception to `dec-one-check-command`);
  the CLI's help and the actions' descriptions hold the details, the architecture states responsibilities and the
  README orients; scaffolding is `npx --yes github:lernapps/tooling#main create`, then `npx lernapps check`
- [x] 9 · Listing validation ([lernapps/apps#3](https://github.com/lernapps/apps/issues/3), merged in #45
  with lernapps/apps#8, #11, #14): `npm run listing -- entries/<id>.yaml` in lernapps/apps runs
  `lernapps check --entry` on the deployed app, plus the catalog's rule `entry-fitness-matches` (`checked: true` only
  while the check passes). `listing.yml` runs it on the entries a pull request changes, read-only and without
  secrets; `listing-comment.yml`, from `main`, keeps one results comment per pull request: every finding as a task
  grouped by rule, cut off only past GitHub's size limit with a link to the full report, and "bestanden" on a pass
  too. The skill `lernapps-listing` says how to open the pull request and act on the comment; it names no entry field
  (KD-04)
- [x] 13 · Documentation and the creator's entry point ([#21](https://github.com/lernapps/tooling/issues/21), merged
  in #46 with lernapps/apps#10, #12, lernapps/lernapps.github.io#25, lernapps/app-templates#6, lernapps/.github#42):
  building and listing have a page each, `/apps/build/` (a prompt to copy, the `create` command, the skill
  `lernapps-app`) and `/apps/enter/` (the skill `lernapps-listing` first, then the form, one e-mail fallback);
  `/apps/eintragen/` is gone without a redirect, and the navigation links both. The entry-point test runs the page's
  command for every archetype the tooling names. The READMEs only orient: the tooling helps builders get their apps
  out; lernapps/apps explains building and listing and holds the catalog
- [x] First full run, from the first prompt to the listing, in lernapps/naturwunder-quiz (25 questions, listed in
  lernapps/apps#13). Lessons and the fixes they led to:
  - The quiz's generic e2e tests timed out from about 15–25 questions: every focus move scrolled smoothly. They run
    with reduced motion, a CI job checks a 64-question bank (`quiz-many-questions`), and after an answer the focus
    moves to the feedback, which stays in view (lernapps/app-templates#9, #10; pin in #50)
  - Where the guidance, the check or the publish action said nothing, the agent guessed (#52, #53). A failing
    runtime test while the content validates is a template bug: reported, never worked around. `lernapps update`
    moves an app to the tooling's pins and never downgrades. The agent works on `work` until the first publish
    creates `main`. It checks the default branch and Pages before the publish checkpoint and puts any admin clicks
    into that question; a first run that did not start is dispatched. HTTP 429 on a link is a hint, "not checked",
    never scraped. The check names a failing test of the runtime as the template's. Plan-only pushes deploy nothing,
    and the plan with its retrospective is pushed before the listing
  - A maintainer starts the review agent with `/review` on a listing pull request (lernapps/apps#15, #51). A job
    without secrets builds the app in a container and runs the checks; a separate job runs the agent with read-only
    tools on those prepared inputs. The result is one verdict comment; the review decides nothing
- [x] Other merged work: no site scope and no site rules in the tooling. Readable without JavaScript applies only to
  lernapps.net's own site, not to apps (owner; #47, #49). Git hooks are installed only where the app is the root of
  its repository: `prepare` is `lernapps hooks`, and templates install none (#48, lernapps/app-templates#7)
- [x] 11, steps 1–5 of the explainer MVP (sketch, 10.), in lernapps/app-templates:
  - 1 · The quiz's questions one by one (merged in lernapps/app-templates#13): `@lernapps/app-templates/quiz/question`
    (schema `$defs/question`, `validateQuestion`, `renderQuestion`, `renderSolution`, the checker, messages),
    `startQuestion` and the per-question e2e helpers; the quiz is built from the same exports, byte for byte
    unchanged
  - 2 · Structure, blocks and languages (merged in lernapps/app-templates#14): the spike (KD-02: Vite alone works),
    `explainer.v1.schema.json`, build-time validation with one line per problem (`file:line: place (lang): what to
    do`), the closed set of blocks, Temml with mhchem, chapters with one hidden, navigation, glossary, one page tree
    per language, `llms.txt`, the template with the Prozent chapter, `explainerTests()` without JS. The 60-page
    fixture became two of each (2 chapters × 2 pages, every block, de and en) after review
  - 3 · Exercises (merged in lernapps/app-templates#15): the quiz's six types as blocks and `generated` with
    arbitraries, the expression language (exact fractions, no eval), comparators onto the quiz's answer kinds, the
    property test over 200 seeds at build, three worked tasks without JS, a live task with `?seed=<n>#<id>`;
    language maps in the quiz's question schema (owner, 2026-10-14). Deviations: the sketch's prozentwert example
    with p = 50 fails its own property test (a mistake equals the answer), so the template draws p up to 40;
    `distinct(xs)` is true or false; the unsolved-figure check works on numbers; mistake messages are plain text
  - 4 · The quiz in several languages (merged in lernapps/app-templates#16): optional `languages`, a page per
    language below `/<lang>/` with `lang`, `hreflang` and a switch; `quizTests()` adds two tests per further language
  - Follow-up, the placeholder decision (owner, merged in lernapps/app-templates#17): placeholders are always
    `{{name}}`, in prose and formulas alike ("whatever is more safe/checkable"), replacing step 3's rule that every
    declared name in a formula is one. One brace stays LaTeX grouping, so a bare letter is always the letter; the build
    fails on an unknown placeholder, one brace or spaces in prose, and a variable nothing uses
  - 5 · `vue-component` (merged in lernapps/app-templates#18): the `nojs` text, server-side rendering at build into
    hidden islands, hydration only on pages with a component (a page without one ships no Vue), props checked against
    the prop types, the build checks on the SFC compiler's output, the 20 kB budget, the exercise contract with its
    property test over 50 seeds per block, the history fixture's `AssignLabels`. Deviations: the logic module's
    contract is `generate(seed, props)`, not `generate(seed)`, since a task depends on the block's props; browser
    globals are allowed in the unmount hooks too (`onBeforeUnmount`, `onUnmounted`), which also never run at build;
    props are resolved by Vue's SFC compiler instead of `vue-component-meta` (no language service, milliseconds);
    `explainerTests()` tests an exercise component's `answered` by emitting it through the island's vnode, not by
    operating the component's controls, which only the component knows

## Commit

### Tasks
- [ ] Pull request per repo, previews green

### Completed
