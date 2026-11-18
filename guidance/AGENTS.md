# AGENTS.md

Learning app for lernapps.net: static, runs in the browser, collects nothing, accessible. Built with its creator.

## Before `lernapps init`

No `package.json` with `lernapps.init` here yet? The app does not exist. Ask the creator what they want: an app to share
(topic, grade, what learners do), or to practise for an occasion such as a test. One question at a time. Choose a short
name (lower case, hyphens). Run once, in this folder, never in a subfolder, `npx --yes @lernapps/tooling init <name>`, or
for an occasion `npx --yes @lernapps/practice init <name>`. It rewrites this file: read it again.

## Start here

1. Current plan: `.vibe/plans/<NN>-<short name>.md` with the highest NN.
2. No plan, or its Commit is completed: start a new plan. Copy a template complete and unchanged from
   `@lernapps/tooling/guidance/` (in `node_modules/`):
   - `plan-template.md`: the first version;
   - `increment-template.md`: every later change.
3. Read the plan before each step. Do its tasks in order. Each phase names its skills. The plan gives the order; the
   process rules below hold in every phase.

## Folder

- The app is the folder where `lernapps init` ran: this file, `CLAUDE.md` and `.vibe/` are in it. `lernapps create`
  and every command run there, never in a subfolder or a copy.

## Always

- Read guidance and skills from the file, in full. Never use a fetch tool that summarises.
- Push only the branch the current plan names. A push to `main` publishes.
- Tick a box only after you did what it says, and only as far as it says. A box you did in part stays open, with a line
  saying what is missing.
- Never `--no-verify`. Never edit `prePushFailures` or `failedChecks`.
- Never edit a `lernapps-*` skill: `lernapps update` replaces them. The app's own skills (`app-content`, `app-*`)
  take precedence; app rules go there.
- Nothing about a real learner in any file or commit message (`no-learner-data-in-texts`).

## Process rules

Each rule in full, with examples: `@lernapps/tooling/guidance/workflow-rules.md` (in `node_modules/`) and
https://lernapps.net/tooling/rules/.

<!-- process rules: written by scripts/agents-md.ts from guidance/workflow-rules.md -->

| Rule | What | What to do | Lines in workflow-rules.md |
|---|---|---|---|
| `plan-file` | Keep the plan file | Keep each plan in `.vibe/plans/` as its template says: every section and front matter key, `phase` set when you enter a phase, each task box ticked when it is done. | 7–18 |
| `explore-before-code` | No code before the plan is confirmed | No code and no `lernapps create` until the creator has confirmed the plan with a yes. | 20–28 |
| `stop-at-checkpoints` | Stop at the creator's checkpoints | Checkpoints: research, confirm the plan and the content method, the pattern page (`early-preview`), publish. Stop at each and wait for the answer. | 30–42 |
| `few-turns-after-plan` | Work on your own after the plan | After the confirmation, ask only what you cannot decide; else choose, mark "(guess)" under "Key decisions" and list it in the retrospective. | 44–53 |
| `early-preview` | A pattern page first, with the creator's look | In Code, build one complete page or screen first, check it as a learner would, then show it to the creator and ask whether the other pages may follow it. | 55–85 |
| `feedback-applied-everywhere` | A remark on one page is checked on all | A remark of the creator on one place that is about a pattern, a fact or a term holds for every place: find them all and change them in the same task. | 87–100 |
| `retrospective-filled` | Fill the retrospective | At the end of Commit, fill every part with facts: phases reached, creator turns after the plan, where you guessed. No names. | 102–112 |
| `app-content-guide` | Keep the app's content guide | Keep the app's content guide `.agents/skills/app-content/SKILL.md` complete and true: no placeholder left once content is written, and it says what was built. | 116–134 |
| `app-content-matches` | The content guide says what was built | The guide describes the app as built, so that an agent without your conversation can add the next chapter or round from it alone. | 136–148 |

<!-- end of the process rules -->

## Language

- Learners, teachers, parents: German, plain language.
- Creator: their language, plain words, no forms.
