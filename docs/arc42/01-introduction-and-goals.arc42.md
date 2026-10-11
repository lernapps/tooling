# Introduction and Goals

With an AI assistant, anyone can build a small learning app in an afternoon. But the people who build them, mostly
teachers and parents, do not know what lernapps.net promises about every app it lists: it runs in the browser,
collects nothing and is accessible. And the platform's one owner cannot read every app before listing it.

The tooling closes this gap. It lets a creator without development skills build an app with their assistant that
keeps these promises and is listed quickly, and it lets the owner trust the result without reading the code. It is
the platform's [guidance for building apps](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-building-guidance).

## 1.1 Requirements Overview

The creator's journey has five steps. The creator decides at a few clear points; the assistant does the rest.

| # | Step | What the tooling does |
|---|---|---|
| UC-1 | Clarify the app | The creator says what the app is for and for whom, and nothing is built before they agree to a plan |
| UC-2 | Set up | The creator gets a working app that already keeps every promise, ready to fill with content |
| UC-3 | Build | The assistant learns of each broken rule at once, with what to fix, and fixes it without asking the creator |
| UC-4 | Validate | The owner gets a result to trust: what can be measured is measured, the rest is judged by an independent review |
| UC-5 | List | The creator lists the app in minutes, with an entry that describes it as teachers and parents search for it |

Apps come in a few kinds, called archetypes, such as a quiz or pages that explain and practise a topic.

Not part of the tooling: showing an entry as a fact sheet of an app hosted elsewhere, and checking listed apps again
over time. Both belong to the catalog.

## 1.2 Quality Goals

- **Simple to build:** creators build alongside their job, so the next step is always clear and they never need to
  know the rules.
- **Listed in minutes:** creators list an app only when it costs almost nothing.
- **Checked, not declared:** teachers and parents trust what the catalog says about an app because it was measured.
- **Nothing collected in secret:** neither the apps nor the tooling send anything about learners or creators.
- **Few iterations:** every round trip costs the creator's time and the assistant's tokens.

Chapter 10 has the complete list, with priorities and measurable scenarios.

## 1.3 Stakeholders

| Role | Contact | Expectations |
|---|---|---|
| Creator | teachers, parents, students who build an app | From an idea to a listed app in little time, without knowing the rules; in control at a few clear decisions |
| Creator's AI assistant | Claude Code, Codex, Gemini CLI and others | A working, listable app in few iterations: a clear next step and messages that say how to fix a problem ([AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants)) |
| Platform owner | Oliver Jägle ([@mrsimpson](https://github.com/mrsimpson)) | Decides on listings; trusts a validation without reading every app; guidance that improves from what reviews find |
| Review agent | an agent in a fresh context, run by the owner | A clear procedure, and a starting point that tells it what is already decided |
| Teachers and parents | users of the catalog | Can trust what an entry says about an app |
| Learners | students, indirectly | Apps that run at once, collect nothing, and work with assistive technology and on a phone |
| Maintainers of the shared repos | lernapps maintainers | Few moving parts; one place per rule; a change reaches every app without editing it |
