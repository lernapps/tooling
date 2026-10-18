---
# Read by the hooks, the review, the evals. Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json
# Keep all four keys.
# Archetype, null until chosen in Explore. Allowed values: explainer, interactive, quiz.
archetype: null
# Current phase. Allowed values: explore, plan, code, commit. Change the value line below, never this comment.
phase: explore
# prePushFailures: written by the pre-push hook. Never change it.
prePushFailures: 0
# failedChecks: failed rules and runs, written by lernapps check and the hooks. Never change it.
failedChecks: {}
---

# Plan: <app name>, first version

<!--
For you, the assistant.
- Path: .vibe/plans/01-<short name>.md. Later changes: increment template, own plan.
- Read this plan before each step. One phase at a time, tasks in order.
- Done → tick `[x]` at once, move it to "Completed" of its phase. Unticked boxes count as not done.
- New task found → add it.
- Read every skill and page named here in full, from its file (curl, cat). Never a summarising fetch tool.
- Checkpoint task: stop, ask, wait for the creator's answer.
- Work on the branch `work` until the first publish; push only `work`. Commit brings `work` into `main`.
- GitHub step fails → skill `lernapps-github`.
- Plan in the creator's language. Keep headings and front matter keys.
- Delete a comment once its part is filled.
-->

*Started <date>. Explore, Plan, Code, Commit.*

## Goal

<!-- 1–2 sentences: what learners do, what they learn. Explore. -->

## Key decisions

<!-- One line each: decision, reason. Archetype first. Own choice without the creator: mark "(guess)". -->

## Notes

<!-- Sources and licences, links, open questions, curriculum, competencies by chapter. -->

## Explore

<!--
- All content questions belong here: what, for whom, scope, didactics, look and feel. Plan only maps them onto the
  scaffold.
- Ask; write no code; run no `create`.
- One topic per question, max 2 questions per message. Never bundle topics into one question.
- An answer counts only in the creator's words under "Answers"; never tick a question you assumed.
-->

### Tasks

- [ ] Install the skills, if missing: `npx skills add lernapps/tooling#exp/compact-guidance`. The app commits them.
- [ ] Tell the creator where the app lives: GitHub Pages of their own repo, free, public, own address (usually
      `https://<owner>.github.io/<repo>/`). Offer a short explanation of GitHub; say they need not know it. Page for
      them: <https://lernapps.net/tooling/github/>. Example: "Deine App wird über GitHub veröffentlicht, kostenlos
      und öffentlich, unter deiner eigenen Adresse. Soll ich dir kurz erklären, was GitHub ist?"
- [ ] Set up the branches before anything else is pushed:
      - settle the repo name with the creator first (a rename can cost your access);
      - no git repo: `git init --initial-branch=main`;
      - no `main` (`git ls-remote --heads origin main`, `git branch --list main` empty): `git switch --orphan main`,
        `git commit --allow-empty -m "chore: start"`, `git push -u origin main`;
      - missing `gh-pages`: `git switch --orphan gh-pages`, `git commit --allow-empty -m "chore: gh-pages"`;
      - missing `work`: `git switch -c work main`;
      - `git push -u origin gh-pages work`. No remote yet: push all three later, `main` first;
      - Pages from `gh-pages`, root (`pages-from-gh-pages`): `gh api -X POST repos/<owner>/<repo>/pages
        -f build_type=legacy -f "source[branch]=gh-pages" -f "source[path]=/"`; refused → put the click from skill
        `lernapps-github` into your next question;
      - default branch not `main` (`gh api repos/<owner>/<repo> --jq .default_branch`) → skill `lernapps-github`.
- [ ] Load skill `lernapps-content-research` before the first question about learners or curriculum.
- [ ] Interview: ask every topic of "Answers", in order. Skip a topic only when an earlier answer already
      covers it; note which. No answer → ask once more; still none → write your assumption with "(guess)" and
      show it at the checkpoint. Done only when every topic has an answer or a shown guess.
- [ ] Research: follow skill `lernapps-content-research` (filled-in `app-content` first). Write under "Notes":
      curriculum orientation (Lehrplan cited where used), competencies by chapter as Ich-kann-Sätze, verified
      sources. No competencies written = task not done.
- [ ] Didactic approach under "Notes", one line per competency: how learners get there (derive, not only read off;
      e.g. a tree diagram shows how a probability comes about), which misconception the feedback catches.
- [ ] Scope under "Notes": what is in, what is out (and why), data range (e.g. "all main-group elements", not a
      silent "1–20"), languages.
- [ ] Fetch https://lernapps.net/apps/schemas/entry.v1.schema.json; read every property's description. Ask what
      helps teachers and parents find the app. Fill "Entry draft". Search words: short, one or two words each, as
      people type them into a search.
- [ ] Choose the archetype; write it with its reason under "Key decisions"; set `archetype`:
      - `interactive`: learners act in one app page (game, trainer, simulation; e.g. a typing game);
      - `explainer`: many pages of explanation, each with exercises;
      - `quiz`: questions with options and feedback.
- [ ] **Checkpoint:** research. Show in plain words: curriculum orientation, competencies by chapter, didactic
      approach, scope (in, out, data range, languages), every "(guess)" of the interview, sources and how checked,
      what is unchecked, archetype and reason. Stop and wait. Changes → change, ask again.
- [ ] Set `phase: plan`: change the value line (`grep '^phase:'` prints `phase: plan`).

### Answers

<!-- The interview: per topic the creator's answer, their words. Keep the topics. -->

- Goal: what learners do in the app, what they learn.
- Learners: subject, school year, prior knowledge. Land and Schulform only if the creator names a school or class,
  at most once; none → KMK-Bildungsstandards.
- Model and focus: an app of the catalog (read https://lernapps.net/apps/llms.txt) as model; what matters most
  (exercises, visualisations, game feel).
- Hurdles: misconceptions and mistakes of the learners; the creator's examples and experiments.
- Content: who writes it (creator, you, from sources); own material (worksheets, tests); how it is made (sources,
  research, a skill or data format for producing it).
- Amount: how much content per level or chapter in the first version (e.g. "one text per school year"); what
  comes later.
- Languages: German only, or more (texts, code).
- Look and feel: calm like a worksheet, or like a game (colours, praise, effects); dark mode.
- Terms: the creator's words for the main things in the app, used everywhere.

### Entry draft

<!-- YAML valid against the entry schema; its property names. Only known values, never invented. -->

```yaml
```

### Completed

## Plan

<!--
- Map the confirmed content onto the scaffold: the archetype's blocks, components, data files, patterns.
- No new content questions; a content gap → back to Explore, say so.
- Confirmable in one read. After the confirmation: work on your own (creator turns to the listing: max 3).
-->

### Tasks

- [ ] Write the Code tasks under "Code": pages or screens, content, what each shows; each ends in a commit.
- [ ] Load the archetype's skill with all its references, `lernapps-app/references/archetype-rules.md`, skill
      `lernapps-exercise-patterns` with `references/patterns.md` and `references/success.md`. Explainer with
      quiz-type exercises: also skill `lernapps-quiz`. Write "Content method".
- [ ] Show the creator, short: goal, competencies by chapter, entry draft, tasks; the content method in plain words
      (what learners see and do, what it cannot do). Max 2 questions.
- [ ] Each screen, component or interactive exercise: show a sketch (static SVG or image, or the steps with what
      learners see after each). Words alone are not enough.
- [ ] **Checkpoint:** confirm the plan and the content method. Only with the sketches shown. Stop and wait for an
      explicit yes. Changes → change, ask again. No `create` before the yes.
- [ ] Set `phase: code`: change the value line (`grep '^phase:'` prints `phase: code`).

### Content method

<!-- One line each: exercise patterns and where; figures and how made; data files; each component, what it checks
and cannot; how a later agent adds a chapter. Becomes the content guide in Code. -->

### Completed

## Code

<!--
- Commit after each task; the hooks check. Pre-commit fails → read node_modules/.cache/lernapps/pre-commit.log.
- Fix from the message; never bypass a hook.
- Undecidable → choose, mark "(guess)" under "Key decisions", go on.
- Creator asks for a change → first say your reading in one sentence ("Ich nehme alle 44 Hauptgruppenelemente
  auf."); never narrow it silently. Content change → update "Notes" too.
- Test fails at runtime → read the archetype's `references/runtime.md` first.
- Push `work` after each task: the pull request's preview shows the creator the current state. Never push `main`.
- `create` needs git, Node ≥ 22.18, github.com, codeload.github.com, registry.npmjs.org. Blocked → ask the creator
  to allow it, rerun. Never write the app by hand.
-->

### Tasks

- [ ] Only after the confirmation: in this plan's folder, `npx --yes github:lernapps/tooling#exp/compact-guidance create
      --archetype <archetype>`. Keeps this plan.
- [ ] `git switch work`, then `npm install` (dependencies, git hooks). From now on: `npx lernapps check`.
- [ ] Commit the generated app with this plan on `work`.
- [ ] `git push -u origin work`; open a pull request `work` → `main` over REST (`gh api repos/<owner>/<repo>/pulls
      -f base=main -f head=work -f title="Erste Version" -f body="Vorschau"`; `gh pr create` needs GraphQL, which
      may be blocked). The comment "Vorschau der App" links the preview; give the creator the link once. Refused →
      skill `lernapps-github`.
- [ ] Load skill `lernapps-app` and the archetype's skill.
- [ ] Fill the content guide `.agents/skills/app-content/SKILL.md` from the plan and its content method: replace
      every placeholder comment with concrete instructions (files, ids, data files, one example). Delete its top
      comment. `grep -c "FILL IN" .agents/skills/app-content/SKILL.md` must print 0. Commit it before any content.
- [ ] <the tasks written in Plan>
- [ ] Content guide still matches what was built (`app-content-matches`); `grep -c "FILL IN"` prints 0.
- [ ] `npx lernapps check` passes.
- [ ] Look at a screenshot of every screen and state (start, each mode, pause, end), desktop and 360 px; check each
      against the confirmed sketches and the archetype's rules (interactive: `references/frame.md`).
- [ ] Every box of Explore, Plan and Code ticked.
- [ ] Set `phase: commit`: change the value line (`grep '^phase:'` prints `phase: commit`).

### Completed

## Commit

<!--
- Push to `main` = publish (workflow `Pages`, job `deploy`). Until the creator's yes: branch `work`.
- Only `main` publishes; it must be the default branch. Explore set up branches and Pages; here: verify.
- A push of only `.vibe/` publishes nothing; push the plan when a task says so.
- Every push to `main` needs a run of `Pages`: none after a minute
  (`gh run list --workflow Pages --branch main --commit <commit>`) → `gh workflow run Pages --ref main`.
- "403 Resource not accessible by integration" → a click for the creator (skill `lernapps-github`). Never push to
  trigger a run.
-->

### Tasks

- [ ] `git push origin work` (not `main`). Pre-push runs the heavy checks; fix failures. See the pull request's
      checks to green.
- [ ] Verify over REST: default branch `main` (`gh api repos/<owner>/<repo> --jq .default_branch`); Pages serves
      `gh-pages` from `/` (`gh api repos/<owner>/<repo>/pages`; "Not Found" = off). Not right and not yours to
      change → note the creator's click (skill `lernapps-github`).
- [ ] **Checkpoint:** publish. Show the preview link from the comment "Vorschau der App"; ask before the app goes
      online; wait for the yes. Put the noted clicks into the same question.
- [ ] `git switch main`, `git merge --ff-only work`, `git push origin main` (GitHub marks the pull request merged
      and removes the preview). Run started?
      `gh run list --workflow Pages --branch main --commit "$(git rev-parse HEAD)"`; none after a minute →
      `gh workflow run Pages --ref main` (refused: creator clicks Actions → Pages → Run workflow). Watch it
      (`gh run watch`). Fails → read the failed step, fix, push. Admin-only Pages setting → the run deployed
      anyway; after the creator's click the app appears without a new run.
- [ ] Open the address the job `deploy` printed ("published at ...", also in the run summary); confirm the app shows.
      Use that address, never a derived one; follow redirects. Do not wait for it yourself.
- [ ] Load skill `lernapps-listing`.
- [ ] Complete the entry draft (e.g. the address).
- [ ] **Checkpoint:** list. Ask before opening the listing pull request; wait for the yes.
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it (listing check and review read it there).
- [ ] Open the listing pull request as the skill says; see it to "bestanden" (not "nicht bestanden") in the results
      comment.
- [ ] Plan changed since its last push → commit on `main`, push again.

### Completed

## Retrospective

<!-- At the end of Commit, before the listing pull request. Facts, short, no names. Read by review and evals. -->

### Phases reached

<!-- Last phase completed, checkpoints passed. E.g. "commit; confirmed, published". -->

### Creator turns after the plan

<!-- Number of creator messages after the confirmation, topic of each. Target: max 3. -->

### Where I had to guess

<!-- Each gap in plan, skills, messages or answers, and your choice. "None" if none. -->
