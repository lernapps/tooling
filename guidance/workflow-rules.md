# Workflow rules

The plan holds the workflow. These rules say what each step must meet. They hold in every phase.

## Plan

### `plan-file`: The plan's tasks change only through `lernapps plan`

```rule
id: plan-file
scope: tooling
severity: error
```

- Change the tasks, the phase and the front matter of a plan only with `lernapps plan`: `next` prints the task to do,
  `done` ticks it, `skip` ticks a task that does not apply, `add` adds one. Never reword, delete or tick a task by
  hand.
- Run `plan done` when the work of the task has succeeded. In one command line with that work, join it with `&&`,
  so that a step that fails does not tick the task. Never tick several tasks in a loop.
- Write into the plan's other sections yourself: Goal, Key decisions, Notes, Answers, Entry draft, Content method,
  Retrospective. Keep every section.
- Never change the plan of an earlier piece of work.
- The commit hook compares the tasks with the last commit and stops a commit that reworded or removed one. Restore
  the task; what it should say instead is a new task (`plan add`) or a skipped one (`plan skip`).

### `explore-before-code`: No code before the plan is confirmed

```rule
id: explore-before-code
scope: tooling
severity: error
```

- No code and no `lernapps create` until the creator has confirmed the plan with a yes.

### `stop-at-checkpoints`: Stop at the creator's checkpoints

```rule
id: stop-at-checkpoints
scope: tooling
severity: error
```

- Checkpoints: research, confirm the plan and the content method, the pattern page (`early-preview`), publish. Stop at
  each and wait for the answer.
- Checkpoint list: open the listing pull request first (it publishes nothing), then show it and its result and wait.
- A message sent before the checkpoint's question is no yes. `lernapps plan done --answer "<their words>"` ticks a
  checkpoint and keeps the answer in the plan.
- Example: "Die App ist fertig und geprüft. Soll ich sie jetzt veröffentlichen?"

### `few-turns-after-plan`: Work on your own after the plan

```rule
id: few-turns-after-plan
scope: tooling
severity: hint
```

- After the confirmation, ask only what you cannot decide; else choose, mark "(guess)" under "Key decisions" and list
  it in the retrospective.

### `early-preview`: A pattern page first, with the creator's look

```rule
id: early-preview
scope: tooling
severity: hint
```

- In Code, build one complete page or screen first, check it as a learner would, then show it to the creator and ask
  whether the other pages may follow it.
- The learner check and the message to the creator: skill `lernapps-learner-check`.
- A checkpoint: wait for the answer. A change → change the pattern first, then build the other pages after it.

### `feedback-applied-everywhere`: A remark on one page is checked on all

```rule
id: feedback-applied-everywhere
scope: tooling
severity: hint
```

- A remark of the creator on one place that is about a pattern, a fact or a term holds for every place: find them all
  and change them in the same task.
- Say first whether the remark is about that place or more ("Gilt das für alle Seiten?" only when you cannot tell).
- Search all of `src/` for it, with variants: texts, answer infos, explanations, captions, alt texts and the content
  guide. Name the places in the plan.
- A fix in a shared component: look at every page that uses it again.

### `retrospective-filled`: Fill the retrospective

```rule
id: retrospective-filled
scope: tooling
severity: error
```

- At the end of Commit, fill every part with facts: phases reached, creator turns after the plan, where you guessed.
  No names.
- Failed checks need no entry: the check counts them in `failedChecks`.

## Content guide

### `app-content-guide`: Keep the app's content guide

```rule
id: app-content-guide
scope: tooling
severity: error
```

- Keep the app's content guide `.agents/skills/app-content/SKILL.md` complete and true: no placeholder left once
  content is written, and it says what was built.
- Its fixed headings, in this order, each filled: Curriculum,
  Competencies, Content structure, Terminology, Exercise patterns, Figures, Sources, Adding a chapter or round,
  Rules learned from mistakes ("None yet." until the first rule).
- After the plan is confirmed and before content: replace every placeholder ("FILL IN") with concrete instructions
  for writing new content: files, ids, data files, an example of this app. Not how the app works, no general advice.
- A content decision changes (pattern, figure type, source rule) → change the guide in the same commit.
- `lernapps check` checks the file and its headings always, and that no placeholder is left once the plan is in
  Commit.
- App older than the guide: `lernapps update` adds the skeleton (skill `lernapps-cli`).

### `app-content-matches`: The content guide says what was built

```rule
id: app-content-matches
scope: tooling
severity: error
```

- The guide describes the app as built, so that an agent without your conversation can add the next chapter or round
  from it alone.
- Every pattern it names is used; no pattern is used that it does not name.
- Curriculum, competencies, chapters, pages or rounds match the content.
- Its procedure for a new chapter or round names the current files.
