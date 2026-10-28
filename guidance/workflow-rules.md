# Workflow rules

The plan holds the workflow. These rules say what each step must meet. They hold in every phase.

## Plan

### `plan-file`: Keep the plan file

```rule
id: plan-file
scope: tooling
severity: error
```

- Each plan in `.vibe/plans/`, with every section and front matter key of its template.
- Never change the plan of an earlier piece of work.
- Set `phase` when you enter a phase. Tick each task box when it is done.
- Never edit `prePushFailures` or `failedChecks`: the hook and the check write them.

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

- Checkpoints: research, confirm the plan and the content method, publish. Stop at each and wait for the answer.
- Checkpoint list: open the listing pull request first (it publishes nothing), then show it and its result and wait.
- A message sent before the checkpoint's question is no yes.
- Example: "Die App ist fertig und geprüft. Soll ich sie jetzt veröffentlichen?"

### `few-turns-after-plan`: Work on your own after the plan

```rule
id: few-turns-after-plan
scope: tooling
severity: hint
```

- After the confirmation, ask only what you cannot decide.
- Else choose, mark "(guess)" under "Key decisions" and list it in the retrospective.

### `early-preview`: Show a first look early

```rule
id: early-preview
scope: tooling
severity: hint
```

- In Code, as soon as the first screen or page shows real content: send the creator a short "Zwischenstand".
- Show screenshots, desktop and 360 px. On the creator's machine also the address of `npm run dev`, started in the
  background.
- No checkpoint, no question: go on in the same message. The creator may stop you or ask for a change.
- Example: "Zwischenstand: So sieht die erste Seite aus. Ich baue weiter; sag Bescheid, wenn etwas nicht passt."

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

- Keep `.agents/skills/app-content/SKILL.md` with its fixed headings.
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

- Every pattern it names is used; no pattern is used that it does not name.
- Curriculum, competencies, chapters, pages or rounds match the content.
- Its procedure for a new chapter or round names the current files.
- An agent without your conversation can add the next chapter or round from it alone.
