---
name: lernapps-learner-check
description: Use in Code of a lernapps.net app when a task asks for the learner check of the pattern page or for the whole-app check, and again after a change to a shared component. How a sub-agent, or you, uses the app in the browser as a learner of its grade, with the brief to send and what to do with the report.
license: MIT
---

# Learner check

A check proves that the rules hold. It cannot tell where a learner gets stuck: a figure whose marks nobody explained,
a word used before its page, an exercise that gives its answer away. Someone has to use the app as a learner does.

## The two checks

| Check | When | Brief |
|---|---|---|
| One page | the pattern page, before you show it to the creator; again after a change to a shared component | [references/page.md](references/page.md) |
| The whole app | once, at the end of Code, when every page exists | [references/whole-app.md](references/whole-app.md) |

## Steps

1. Start the app with `npm run dev` as a background task of your harness, and open its address once to see that it
   answers. A process started with `nohup … &` ends with the shell that started it.
2. Read the brief of the check, fill in its brackets and send all of it to one sub-agent that has a shell and a
   browser (Playwright). Wait for its report before you go on. Without a sub-agent tool, follow the brief yourself in
   the browser.
3. Fix what the report names. A finding about a pattern, a term or a shared component holds for every page that has
   it (`feedback-applied-everywhere`).
4. After the fixes to a page, look at its screenshots yourself, at 360 px and on a desktop
   (`npx --no -- lernapps screenshots --desktop`): what you have not seen you cannot show. If reading an image
   returns no picture in your harness, check the page in the browser instead (its text, the boxes of its elements at
   both widths) and tell the creator that you did.

## The pattern page

The first page you build is the pattern for the others (`early-preview`). After its learner check, send the creator
one message that begins "**Code · Checkpoint** Zwischenstand", with:

- the screenshots (their paths, or the images where the chat shows them), and the address of `npm run dev` when the
  creator works on the same machine;
- what learners do on the page, in one or two sentences;
- one question: may the other pages follow this pattern?

Example: "**Code · Checkpoint** Zwischenstand: So sieht die erste Seite aus (Bilder: …). Die Kinder teilen einen
Kuchen mit dem Regler in gleich große Stücke und markieren dann selbst. Soll ich die anderen Seiten nach diesem Muster
bauen?"
