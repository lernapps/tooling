# Workflow rules

The plan holds the workflow; these rules say what each step must meet.

## Plan

### `plan-file`: Keep the plan file

```rule
id: plan-file
scope: tooling
severity: error
```

- Each plan in `.vibe/plans/`, every section and front matter key of its template kept.
- Never change the plan of an earlier piece of work.
- Update `phase` on entering a phase. Tick each task box when done.
- Never edit `prePushFailures`: the pre-push hook writes it.

### `explore-before-code`: No code before the plan is confirmed

```rule
id: explore-before-code
scope: tooling
severity: error
```

- No code, no `lernapps create`, until the creator has confirmed the plan with a yes.

### `stop-at-checkpoints`: Stop at the creator's checkpoints

```rule
id: stop-at-checkpoints
scope: tooling
severity: error
```

- Checkpoints: research, confirm the plan and content method, publish, list. Stop at each; wait for the answer.
- A message sent before the checkpoint's question is no yes.
- Example: "Die App ist fertig und geprüft. Soll ich sie jetzt veröffentlichen?"

### `few-turns-after-plan`: Work on your own after the plan

```rule
id: few-turns-after-plan
scope: tooling
severity: hint
```

- After the confirmation ask only what you cannot decide.
- Else choose, mark "(guess)" under "Key decisions", list it in the retrospective.

### `retrospective-filled`: Fill the retrospective

```rule
id: retrospective-filled
scope: tooling
severity: error
```

- End of Commit: every part filled with facts: phases reached, failed checks with rule ids, creator turns after the
  plan, where you guessed. No names.

## Content guide

### `app-content-guide`: Keep the app's content guide

```rule
id: app-content-guide
scope: tooling
severity: error
```

- Keep `.agents/skills/app-content/SKILL.md` with its fixed headings.
- After the plan is confirmed, before content: replace every placeholder ("FILL IN") with concrete instructions:
  files, ids, data files, an example of this app. No general advice.
- Content decision changes (pattern, figure type, source rule) → change the guide in the same commit.
- `lernapps check`: file and headings always; no placeholder once the plan is in Commit.
- App older than the guide: `npx --yes github:lernapps/tooling#exp/compact-guidance update` adds the skeleton.

### `app-content-matches`: The content guide says what was built

```rule
id: app-content-matches
scope: tooling
severity: error
```

- Every pattern it names is used; no pattern used that it does not name.
- Curriculum, competencies, chapters, pages or rounds match the content.
- Procedure for a new chapter or round names the current files.
- An agent without your conversation can add the next chapter or round from it alone.
