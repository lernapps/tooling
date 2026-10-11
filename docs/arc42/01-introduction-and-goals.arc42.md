# Introduction and Goals

With an AI assistant, anyone can build a small learning app quickly. But its creators, mostly teachers and parents,
do not know the platform's rules, and the platform's one owner cannot read every app.

The tooling closes this gap. With it, a creator without development skills and their assistant build an app that
keeps the promises of lernapps.net: it runs in the browser, collects nothing and is accessible. The app is listed
quickly, and the owner trusts it without reading the code. The app stays the creator's: it lives at their own
hosting, by default their own GitHub Pages, and lernapps.net only lists and links it. The tooling is the platform's
[guidance for building apps](https://lernapps.net/docs/platform-design/#2-design/d6-learning-engine.pdt42.md:el-s-building-guidance).

## 1.1 Requirements Overview

The creator decides at a few points; the assistant does the rest.

| # | Step | Outcome |
|---|---|---|
| UC-1 | Clarify the app | The creator has said what the app is for and for whom, and agreed to a plan before anything is built |
| UC-2 | Set up | The creator has a working app that keeps every promise from the start |
| UC-3 | Build | The assistant learns of a broken rule at once, with the fix, and fixes it without asking |
| UC-4 | Validate | The owner has a result to trust: measured where possible, judged by an independent review otherwise |
| UC-5 | List | The creator lists the app in minutes, with an entry that adults find |

Showing an entry as a fact sheet and checking listed apps again belong to the app overview, not to the tooling.

The same repo also keeps lernapps.net's own websites and repos in shape; that part, "Platform upkeep" in chapter 5,
is not used by creators.

## 1.2 Quality Goals

- **Simple to build:** creators build alongside their job, so they never need to know the rules.
- **Listed in minutes:** creators list an app only when it costs almost nothing.
- **Listings help find the right app:** adults find an app only when its entry matches how they search.
- **Checked, not declared:** adults trust an entry because it was measured, not claimed.
- **Nothing collected in secret:** the platform promises it, so neither apps nor tooling send anything unasked.

Chapter 10 has all goals, with measurable scenarios.

## 1.3 Stakeholders

| Role | Contact | Expectations |
|---|---|---|
| Creator | teachers, parents, students | A listed app in little time, without knowing the rules |
| Creator's AI assistant | Claude Code, Codex, Gemini CLI and others | A clear next step, and messages that say how to fix a problem ([AI assistants](https://lernapps.net/docs/platform-design/#1-exploration/e2-scan.pdt42.md:el-e-ai-assistants)) |
| Platform owner | Oliver Jägle ([@mrsimpson](https://github.com/mrsimpson)) | Trusts a validation without reading the app; guidance that learns from reviews |
| Review agent | an agent in a fresh context, run by the owner | Judges only what is not decided yet, by a clear procedure |
| Adopting adults | teachers and parents | Can trust what an entry says |
| Learners | students, indirectly | Apps that start at once, collect nothing and work for everyone, on any device |
| Maintainers of the shared repos | lernapps maintainers | Each rule in one place; a change reaches every app without editing it |
