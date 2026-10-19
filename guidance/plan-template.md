---
# Read by the git hooks, the review and the evals.
# Schema: @lernapps/tooling/guidance/plan-front-matter.v1.schema.json. Keep all four keys.
# archetype: the kind of app, chosen at the end of Explore: explainer, interactive or quiz. null until then.
archetype: null
# phase: the phase you work in now: explore, plan, code or commit. Change it when you enter the next phase.
phase: explore
# prePushFailures: failed runs of the pre-push hook. The hook counts them. Never change this value.
prePushFailures: 0
# failedChecks: the rules that failed in a run of lernapps check (hooks included), with the number of runs. The check
# writes it. Never change it.
failedChecks: {}
---

# Plan: <name of the app>, first version

<!--
This file guides you, the assistant, through the first version of an app, and shows the creator where you are.
- Keep it at .vibe/plans/01-<short name>.md. Read it before each step. Each later increment gets a plan of its own,
  from the increment template.
- Read each skill and page this plan names in full, from its file: a skill where `npx skills add lernapps/tooling`
  installed it, a page downloaded unchanged. Never work from the summary of a fetch tool: it loses tasks and rules.
- Work through one phase at a time: Explore, Plan, Code, Commit. Do the tasks of the current phase in order.
- Tick a task when it is done and move it to "Completed" of its phase. Add tasks as you find them.
- A task marked as a checkpoint means: stop, show the creator what they need to decide, and wait for their answer.
- The repo gets its branches `main`, `gh-pages` and `work` at the start of Explore, before anything else is pushed.
  Work on the branch `work` until the first publish: before it, if your environment asks you to push, push `work`
  only. The first publish, in Commit, brings `work` into `main`; from then on, push `main` as the Commit tasks say.
  While a check fails, tell the creator instead of pushing. When a GitHub step fails, load the skill `lernapps-github`.
- Write the plan in the language you talk to the creator in. Keep the headings and the front matter keys as they
  are: the review reads them.
- Delete these comments only where you have filled the part they explain.
-->

*Started on <date>. Workflow: Explore, Plan, Code, Commit.*

## Goal

<!-- One or two sentences: what learners do in the app, and what they learn or train by it. Fill it in Explore. -->

## Key decisions

<!--
One line each: the decision and why. The archetype is the first one. Add decisions in any phase.
Mark a choice you made without asking the creator with "(guess)", and list it in the retrospective.
-->

## Notes

<!-- What you need later: sources and licences of content, links, open questions. -->

## Explore

<!--
Find out what the app is for, for whom, and what the app overview needs to help adults find it.
Ask the creator; write no code. Ask one or two questions per turn, in plain words. Do not ask what you can derive
from earlier answers. Write each answer under "Answers".
-->

### Tasks

- [ ] Install the skills, if they are not installed yet: `npx skills add lernapps/tooling`. The app commits them.
- [ ] Tell the creator, in plain words, where the app will live: it is published with GitHub Pages, from their own
      GitHub repo, free and public, at their own address (usually `https://<owner>.github.io/<repo>/`). Offer to
      explain GitHub simply: what it is, and the parts we use: the repo; the branches `main` (what is published),
      `work` (the work until then) and `gh-pages` (what Pages serves); pull requests with a preview; Actions, which
      check and publish; Pages, which serves the app. Say that they need not know any of it: the tooling and you
      handle it. For them to read: <https://lernapps.net/tooling/github/>. Example: "Deine App wird über GitHub
      veröffentlicht, kostenlos und öffentlich, unter deiner eigenen Adresse. Soll ich dir kurz erklären, was GitHub
      ist? Du musst es nicht wissen, ich kümmere mich darum."
- [ ] Set up the repo's branches before anything else is pushed. First settle the repo's name with the creator: a
      rename later can cost your session its access. If the folder is not a git repository yet:
      `git init --initial-branch=main`. If the repo has no branch `main` yet (`git ls-remote --heads origin main` and
      `git branch --list main` list none), create it first, so that it becomes the default branch:
      `git switch --orphan main`, `git commit --allow-empty -m "chore: start"`, `git push -u origin main`. Then
      create what is missing of `gh-pages`, empty (`git switch --orphan gh-pages`,
      `git commit --allow-empty -m "chore: gh-pages"`), and `work` (`git switch -c work main`), and push them:
      `git push -u origin gh-pages work`. Without a remote yet, push the three, `main` first, once it exists.
      Then let Pages serve `gh-pages` from its root (`pages-from-gh-pages`), so that the first publish works: set
      it yourself if you may (`gh api -X POST repos/<owner>/<repo>/pages -f build_type=legacy
      -f "source[branch]=gh-pages" -f "source[path]=/"`), else ask the creator, with your next question, to click:
      Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: gh-pages, folder: / (root) →
      Save. If the default branch is not `main` (`gh api repos/<owner>/<repo> --jq .default_branch`), the skill
      `lernapps-github` says how to change it.
- [ ] Ask what the app is for: what do learners do in it, and what do they learn or train?
- [ ] Ask who the learners are: subject, school year, what they know already.
- [ ] Ask where the content comes from: written by the creator, or taken from others (with source and licence)?
- [ ] Research the content: load the skill `lernapps-content-research` and follow it (in an app whose
      `.agents/skills/app-content/SKILL.md` is filled in, load that first; it takes precedence). Write the curriculum
      orientation (the Lehrplan, cited where you used one), the competencies by chapter and the verified sources
      under "Notes".
- [ ] Fetch the entry schema of the app overview: https://lernapps.net/apps/schemas/entry.v1.schema.json. Read the
      description of every property. Ask the creator what it needs to help adults (teachers, parents) find the app.
      Fill the "Entry draft" from the answers.
- [ ] Choose the archetype from the answers: `explainer` (many pages of explanation and exercises), `interactive`
      (one app page in the browser, plus a static start page) or `quiz` (questions with options and feedback).
      Write it under "Key decisions" with the reason; set `archetype`.
- [ ] **Checkpoint:** research. Explain to the creator, in plain words, what you found and how: the curriculum
      orientation, the competencies by chapter, the sources and how you checked them, what you could not check, and
      the archetype with its reason. Stop and wait for the creator. Change it if they ask, then ask again.
- [ ] Set `phase: plan`.

### Answers

<!-- The creator's answers, in their words, one bullet per question. -->

### Entry draft

<!--
The entry of the app in the app overview, as YAML that validates against the entry schema. Use the schema's
property names; its descriptions say what each one needs. Fill it from the answers; never invent a value. Leave out
what is not known yet, such as the app's address before it is published. The listing completes it.
-->

```yaml
```

### Completed

## Plan

<!--
Turn the answers into tasks the creator can confirm in one read. After the confirmation you work on your own: the
creator's turns from here to the listing are counted in the retrospective (target: at most 3).
-->

### Tasks

- [ ] Write the tasks of Code under "Code": the pages or screens, the content, and what each must show. Each task
      ends in a commit.
- [ ] Write the content method under "Content method": load the skill of the archetype and the skill
      `lernapps-exercise-patterns`, and decide with them how you will make the content.
- [ ] Show the creator the goal, the competencies by chapter, the entry draft and the tasks, short. Explain the
      content method in plain words: what learners will see and do, and what it cannot do.
- [ ] For every component and interactive exercise, show a sketch: a static SVG or image of what learners see, or
      the steps (what they do, what they see after each). A description in words alone is not enough.
- [ ] **Checkpoint:** confirm the plan and the content method. Stop and wait for the creator. Change the plan if they
      ask, then ask again.
- [ ] Set `phase: code`.

### Content method

<!--
How you will make the content, one line each, so the creator can judge it: the exercise patterns and where each is
used; the figures and how they are made; data files for material used more than once; each component, what it
checks and what it cannot; how a later agent adds a chapter. In Code, it becomes the content guide.
-->

### Completed

## Code

<!--
Generate the app, then build it task by task. Load the skill lernapps-app and the skill of the archetype before you
write code. Commit after each task: the git hooks run the checks. The pre-commit hook is quiet: when it fails, it
prints one line naming the step and its log, `node_modules/.cache/lernapps/pre-commit.log`; read that log for the
messages. Fix every failed check from its message; never bypass a hook. When you cannot decide something, choose, mark it "(guess)" under "Key decisions" and go on.

The generator needs git, Node 22.18 or later and the network: github.com and codeload.github.com for the tooling, the
template and the runtime, and the npm registry (registry.npmjs.org) for the other dependencies. If the sandbox blocks
one of them, stop and ask the creator to allow it, then run the command again. Never write the app by hand.
-->

### Tasks

- [ ] Generate the app in the folder that holds this plan: `npx --yes github:lernapps/tooling#main create --archetype
      <archetype>`. Nothing needs to be installed first. The generator keeps this plan where it is.
- [ ] Be on the branch `work` from Explore (`git switch work`). Then run `npm install`: it installs the dependencies and the git hooks. From now on,
      everything runs from the app's own `node_modules`: `npx lernapps check`, the hooks.
- [ ] Commit what the generator wrote, with this plan, on `work`.
- [ ] Load the skill `lernapps-app` and the skill of the archetype.
- [ ] Fill in the content guide `.agents/skills/app-content/SKILL.md`, which the generator wrote, from the confirmed
      plan and its content method, before you build the content: replace every "FILL IN" with precise, concrete
      instructions, as its comments show (the skill `lernapps-exercise-patterns` helps with its patterns). Commit it.
      Whenever a content decision changes later, update it in the same commit: this plan records the run, the guide
      stays for the agents after you.
- [ ] <the tasks written in Plan>
- [ ] `npx lernapps check` passes.
- [ ] Set `phase: commit`.

### Completed

## Commit

<!--
Publish the app only after the creator says yes; open the pull requests (to `main`, to the catalog) without asking:
they publish nothing, and their preview and result are what the creator decides on. Then fill the retrospective.
A push to `main` publishes the app: the workflow `Pages` checks it and, in its job `deploy`, publishes the checked
bundle to the repo's GitHub Pages, at the repo's own address (usually https://<owner>.github.io/<repo>/). So work on
the branch `work` until the creator says yes; the first publish brings `work` into `main`.
The repo's default branch must be `main`: only `main` publishes, and update pull requests (Renovate) and new pull
requests target the default branch. Explore set up the branches and Pages; here you only verify them.
A push to `main` that changes only the plan (`.vibe/`) starts a run of `Pages` that checks and publishes nothing:
push the plan whenever a task says so. Every push to `main` must start a run of `Pages`. If none has started a minute
after the push (`gh run list --workflow Pages --branch main --commit <commit>` lists none), start it:
`gh workflow run Pages --ref main`. When GitHub refuses a step with "403 Resource not accessible by integration",
it is a click for the creator (skill `lernapps-github`): never push a change only to start a run.
-->

### Tasks

- [ ] Push the branch `work` (not `main`): `git push -u origin work`. The pre-push hook runs the heavy checks; fix
      what fails. Open a pull request from `work` to `main` right away, without asking: it publishes nothing, and its
      preview is what the creator needs to decide. See its checks through to green. When a GitHub step fails or is
      refused, load the skill `lernapps-github`.
- [ ] Verify the setup from Explore over REST: the default branch is `main`
      (`gh api repos/<owner>/<repo> --jq .default_branch`) and Pages serves `gh-pages` from `/`
      (`gh api repos/<owner>/<repo>/pages`; "Not Found" means it is off). For each one that is not right and that you
      may not change, note the creator's click from the skill `lernapps-github`.
- [ ] **Checkpoint:** publish. Show the creator what the app does and the link to its preview from the comment
      "Vorschau der App" on the pull request, and ask whether it may go online. Wait for their yes. Put the clicks you
      noted into the same question, to make after the first run, so that they cost no extra turn.
- [ ] Bring `work` into `main` as one commit and push it: squash-merge the pull request, or `git switch main`,
      `git merge --squash work`, `git commit` (message as in AGENTS.md), `git push origin main`. The pull request
      closes with it.
      Check that a run of the workflow `Pages` started for this commit:
      `gh run list --workflow Pages --branch main --commit "$(git rev-parse HEAD)"`. If none is listed a minute after
      the push, start it: `gh workflow run Pages --ref main` (refused: the creator clicks Actions → Pages → Run
      workflow). Watch the run until it ends (for example `gh run watch`, or the Actions tab of the repo). If it
      fails, read the message of the failed step: fix what you can and push again. A Pages setting only a repository
      admin may change: the run has deployed the app to `gh-pages` anyway, so once the creator has made the click the
      message names, the app appears without a new run; check the address below.
- [ ] Open the address the job `deploy` printed ("published at ...", also in the run's summary) and confirm that it
      shows the app. Take that address, never one you derive: a repo whose owner has its own domain is served there,
      and its github.io address only redirects to it. The job ends only once the app answers at that address, so do
      not wait for it yourself; when you open an address, follow its redirects.
- [ ] Load the skill `lernapps-listing`.
- [ ] Complete the entry draft with what is known now, such as the app's address.
- [ ] Fill the retrospective.
- [ ] Commit this plan on `main` and push it: the listing check and the review read it, with the filled
      retrospective, in the repo. A push that changes only `.vibe/` publishes nothing again.
- [ ] **Checkpoint:** list. Open the listing pull request as the skill says, without asking first: the pull request
      is the review. See it through to "bestanden": when the check passes, the results comment on the pull request
      says "bestanden" (not "nicht bestanden"). Then show the creator the pull request and its result, and wait for
      their word before you change anything in it.
- [ ] If this plan changed since its last push, commit it on `main` and push it again.

### Completed

## Retrospective

<!--
Fill it at the end of Commit, before the listing pull request: facts, short, no names of people. The review reads
it with the listing; the evals compare it across runs. It stays in the creator's repo.
-->

### Phases reached

<!-- The last phase you completed and the checkpoints the creator passed. Example: "commit; confirmed, published". -->

### Creator turns after the plan

<!-- How many messages the creator sent after confirming the plan, and what each was about. Target: at most 3. -->

### Where I had to guess

<!--
Each place where this plan, a skill, a message or the creator's answers did not tell you what to do, and what you
chose. Write "None" if there was none.
-->
