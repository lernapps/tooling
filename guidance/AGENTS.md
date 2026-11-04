# AGENTS.md

Learning app for lernapps.net: static, runs in the browser, collects nothing, accessible. Built with its creator.

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

| Rule | What | What to do |
|---|---|---|
| `plan-file` | Keep the plan file | Each plan in `.vibe/plans/`, with every section and front matter key of its template. Never change the plan of an earlier piece of work. Set `phase` when you enter a phase. Tick each task box when it is done. Never edit `prePushFailures` or `failedChecks`: the hook and the check write them. |
| `explore-before-code` | No code before the plan is confirmed | No code and no `lernapps create` until the creator has confirmed the plan with a yes. |
| `stop-at-checkpoints` | Stop at the creator's checkpoints | Checkpoints: research, confirm the plan and the content method, the pattern page (`early-preview`), publish. Stop at each and wait for the answer. Checkpoint list: open the listing pull request first (it publishes nothing), then show it and its result and wait. A message sent before the checkpoint's question is no yes. |
| `few-turns-after-plan` | Work on your own after the plan | After the confirmation, ask only what you cannot decide. Else choose, mark "(guess)" under "Key decisions" and list it in the retrospective. |
| `early-preview` | A pattern page first, with the creator's look | In Code, build one complete page or screen first: the pattern for the others. An explainer: entry, figure or model, how learners use it, example, exercise. Before you show it, check it: against the rules of skill `lernapps-<archetype>-design` (an explainer: the five questions of `explainer-representation-explained` for each figure and model), and let a sub-agent use it in the browser as a learner of the app's grade (`@lernapps/tooling/guidance/subagent-brief.md`, "Learner check"). Run the sub-agent in the foreground and wait for its report in the same turn; no turn ends while it runs. No sub-agent tool: do the learner check yourself, in the browser, with the same brief. Fix what they find. Look at the screenshots yourself, each image (`npx --no -- lernapps screenshots --desktop`, desktop and 360 px): what you have not seen you cannot show. Then send the creator one message that begins "**Code · Checkpoint** Zwischenstand": the screenshots (their paths, or the images where the chat shows them), on the creator's machine also the address of `npm run dev`, started in the background; what learners do on the page in one or two sentences; one question: may the other pages follow this pattern? A checkpoint: wait for the answer. Every message after it is the creator's answer. A change → change the pattern first, then build the other pages after it. |
| `feedback-applied-everywhere` | A remark on one page is checked on all | The creator remarks on one page, figure or component: say whether it is about that place or a pattern ("Gilt das für alle Seiten?" only when you cannot tell). A pattern → find every place that follows it (the same component, block type or wording) and change them all in the same task. A fix in a shared component: look at every page that uses it again. |
| `retrospective-filled` | Fill the retrospective | At the end of Commit, fill every part with facts: phases reached, creator turns after the plan, where you guessed. No names. Failed checks need no entry: the check counts them in `failedChecks`. |
| `app-content-guide` | Keep the app's content guide | Keep `.agents/skills/app-content/SKILL.md` with its fixed headings, in this order, each filled: Curriculum, Competencies, Content structure, Terminology, Exercise patterns, Figures, Sources, Adding a chapter or round, Rules learned from mistakes ("None yet." until the first rule). After the plan is confirmed and before content: replace every placeholder ("FILL IN") with concrete instructions for writing new content: files, ids, data files, an example of this app. Not how the app works, no general advice. A content decision changes (pattern, figure type, source rule) → change the guide in the same commit. `lernapps check` checks the file and its headings always, and that no placeholder is left once the plan is in Commit. App older than the guide: `lernapps update` adds the skeleton (skill `lernapps-cli`). |
| `app-content-matches` | The content guide says what was built | Every pattern it names is used; no pattern is used that it does not name. Curriculum, competencies, chapters, pages or rounds match the content. Its procedure for a new chapter or round names the current files. An agent without your conversation can add the next chapter or round from it alone. |

<!-- end of the process rules -->

## Language

- Learners, teachers, parents: German, plain language.
- Creator: their language, plain words, no forms.
