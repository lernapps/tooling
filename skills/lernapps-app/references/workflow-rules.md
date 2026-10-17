# Workflow rules

How you work with the creator, from the plan file: `AGENTS.md` and the current plan in `.vibe/plans/` hold the
workflow; these rules say what each step must meet. Each rule is a section headed by its rule block (`id`, `scope`,
`severity`).

## The plan

### `plan-file`: Keep the plan file

```rule
id: plan-file
scope: tooling
severity: error
```

Keep each plan in `.vibe/plans/` as its template has it, with every section and front matter key; never change the
plan of an earlier piece of work. Update `phase` when you enter a
phase. Never edit `prePushFailures`: the pre-push hook writes it.

### `explore-before-code`: No code before the plan is confirmed

```rule
id: explore-before-code
scope: tooling
severity: error
```

Write no code and generate nothing until the creator has confirmed the plan.

### `stop-at-checkpoints`: Stop at the creator's checkpoints

```rule
id: stop-at-checkpoints
scope: tooling
severity: error
```

Stop at each checkpoint (research, confirm the plan and the content method, publish, list) and wait for the
creator's answer. Example: "Die App ist fertig und geprüft. Soll ich sie jetzt veröffentlichen?"

### `few-turns-after-plan`: Work on your own after the plan

```rule
id: few-turns-after-plan
scope: tooling
severity: hint
```

After the plan is confirmed, ask the creator only what you cannot decide. Otherwise choose, mark it "(guess)" under
"Key decisions" and list it in the retrospective.

### `retrospective-filled`: Fill the retrospective

```rule
id: retrospective-filled
scope: tooling
severity: error
```

At the end of Commit, fill every part of the retrospective with facts: phases reached, failed checks with rule ids,
the creator's turns after the plan, where you had to guess. No names of people.

## The content guide

### `app-content-guide`: Keep the app's content guide

```rule
id: app-content-guide
scope: tooling
severity: error
```

Keep `.agents/skills/app-content/SKILL.md` with its fixed headings. Fill in every placeholder ("FILL IN") once the
creator has confirmed the plan, before you build the content, with precise, concrete instructions: the files, ids,
data files and an example of this app, not general advice. Whenever a content decision changes (a new pattern, a
figure type, a source rule), change the guide in the same commit. The plan file records one run; the guide is what
the agents after you follow. `lernapps check` checks an app from the generator: the file and its headings always,
and that no placeholder is left once the app has content, which is when its plan is in Commit: by then the
creator's questions (quiz) or chapters (explainer) are built in place of the generated example. An app made before
the guide existed gets its skeleton from `npx --yes github:lernapps/tooling#main update`.

### `app-content-matches`: The content guide says what was built

```rule
id: app-content-matches
scope: tooling
severity: error
```

The guide describes the app as it is: every exercise pattern it names is used, and the app uses no pattern it does
not name; the curriculum, the competencies and their chapters, pages or rounds match the content; the procedure for a
new chapter or round names the files as they are now. Write it so that an agent who never saw your conversation can
add the next chapter or round from it alone.
