# AGENTS.md

Learning app for lernapps.net: static, runs in the browser, collects nothing, accessible. Built with its creator.

## Before `lernapps init`

No `package.json` with `lernapps.init` here? The app does not exist yet. Ask the creator what they want: an app to
share (topic, grade, what learners do), or to practise for an occasion such as a test. Choose a short name (lower
case, hyphens). Run once, in this folder, `npx --yes @lernapps/tooling init <name>`, or for an occasion
`npx --yes @lernapps/practice init <name>`. It rewrites this file: read it again.

## The plan

- Four phases: Explore, Plan, Code, Commit. The current plan is `.vibe/plans/<NN>-<short name>.md` with the highest
  NN. The creator reads it too.
- `npx --no -- lernapps plan next` prints the one task to do now. Do it, then `npx --no -- lernapps plan done`: it
  ticks the task and prints the next. Does not apply: `plan skip "<reason>"`. More to do: `plan add "<task>"`. A
  task done in part stays open.
- Change tasks, phase and front matter only with `lernapps plan` (`plan-file`). Findings and decisions you write
  into the plan's other sections, in the creator's language.
- A checkpoint: stop, ask, wait. Then `plan done --answer "<the creator's words>"`.
- Every task ticked: `npx --no -- lernapps plan new <short name>` starts the next plan.
- Begin each reply to the creator with the phase: "**Code**", "**Plan · Checkpoint**".

## Always

- The app is this folder. Every command runs here, never in a subfolder or a copy.
- Read each skill or file a task names whole, with your file tool.
- Push only the branch the current plan names. A push to `main` publishes.
- Never `--no-verify`.
- Never edit a `lernapps-*` skill: `lernapps update` replaces them. The app's own skills (`app-content`, `app-*`)
  take precedence.
- Nothing about a real learner in any file or commit message (`no-learner-data-in-texts`).
- Learners, teachers, parents: German, plain language. The creator: their language, plain words.

## Process rules

Each rule in full: `@lernapps/tooling/guidance/workflow-rules.md` (in `node_modules/`) and
https://lernapps.net/tooling/rules/.

<!-- process rules: written by scripts/agents-md.ts from guidance/workflow-rules.md -->

| Rule | What | What to do | Lines in workflow-rules.md |
|---|---|---|---|
| `plan-file` | The plan's tasks change only through `lernapps plan` | Change the tasks, the phase and the front matter of a plan only with `lernapps plan`: `next` prints the task to do, `done` ticks it, `skip` ticks a task that does not apply, `add` adds one. Never reword, delete or tick a task by hand. | 7–24 |
| `explore-before-code` | No code before the plan is confirmed | No code and no `lernapps create` until the creator has confirmed the plan with a yes. | 26–34 |
| `stop-at-checkpoints` | Stop at the creator's checkpoints | Checkpoints: research, confirm the plan and the content method, the pattern page (`early-preview`), publish. Stop at each and wait for the answer. | 36–49 |
| `few-turns-after-plan` | Work on your own after the plan | After the confirmation, ask only what you cannot decide; else choose, mark "(guess)" under "Key decisions" and list it in the retrospective. | 51–60 |
| `early-preview` | A pattern page first, with the creator's look | In Code, build one complete page or screen first, check it as a learner would, then show it to the creator and ask whether the other pages may follow it. | 62–73 |
| `feedback-applied-everywhere` | A remark on one page is checked on all | A remark of the creator on one place that is about a pattern, a fact or a term holds for every place: find them all and change them in the same task. | 75–88 |
| `retrospective-filled` | Fill the retrospective | At the end of Commit, fill every part with facts: phases reached, creator turns after the plan, where you guessed. No names. | 90–100 |
| `app-content-guide` | Keep the app's content guide | Keep the app's content guide `.agents/skills/app-content/SKILL.md` complete and true: no placeholder left once content is written, and it says what was built. | 104–122 |
| `app-content-matches` | The content guide says what was built | The guide describes the app as built, so that an agent without your conversation can add the next chapter or round from it alone. | 124–136 |

<!-- end of the process rules -->
