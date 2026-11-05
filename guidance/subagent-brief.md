# Sub-agent brief

Fill the brackets. Send the whole brief to each sub-agent.

```text
Add the chapter/round "<title>" to the lernapps app in <repo>, on the branch <branch>, in your own git worktree.

Read first, in this order: .agents/skills/app-content/SKILL.md (it takes precedence), then the skills
lernapps-<archetype> and lernapps-cli; for questions with options also lernapps-content-questions.

Competencies, one slice each, in this order:
1. "Ich kann …" (Lehrplan: <document, page, unit> | none)
   - Content: <page or questions, with ids>
   - Exercise: pattern "<name from the guide>", varied as <…>
   - Second source: <address and exact title, verified> | none
2. …

Change only: <the files of this chapter or round>. Do not change: the content guide, the plan, <the shared files>.
Write what the shared files need into your report instead.

Per slice: content, exercise, `npx --no -- lernapps check` green, one commit. Never bypass a hook.

Report: branch, commits, per competency the ids of its page or questions and exercises, the patterns used, what the
shared files need, what you could not verify.
```

## Learner check

For the pattern page (`early-preview`), and again after a change to a shared component. Fill the brackets; send it to
a sub-agent that has a shell and a browser (Playwright), in the foreground: wait for its report before you go on, in
the same turn. Start the app first and check that its address answers. Without a sub-agent tool, follow the brief
yourself.

```text
Use one page of a learning app as a learner would, and tell me where a learner gets stuck. Change nothing.

The app runs at <address of `npm run dev` or of the built app>. The page: <path>. You are a learner of class <grade>
in a German school. You know <the competencies its competency requires in the map, in plain words> and your everyday
life, and nothing of what the page is about to teach.

Open the page in the browser (Playwright, 1280 px and 360 px wide). Read it from the top, as a learner would. Use
every control: each slider to its ends, each button; in each exercise type a right answer, a typical wrong one and an
incomplete one, then press "Prüfen". Before "Prüfen", look at what the page shows.

For each figure, model and component, answer: What is the whole? What do its parts, colours and marks mean? What do I
change, and what stays the same? How does that lead to what the page says? What do I enter afterwards? Then: Does the
page start from something I know? Does it explain each word where it first needs it? Does the text name only what the
page has? Does anything give the answer away before "Prüfen"? Does it talk to me as someone of my age?

Report, short: per figure or component the questions it leaves open, quoting the page; every place where you were
stuck or guessed, with what you did; nothing else.
```
