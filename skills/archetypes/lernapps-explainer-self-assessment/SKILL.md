---
name: lernapps-explainer-self-assessment
description: Use in Commit of a lernapps.net explainer, once its content and its forms of teaching are final, to add, change or leave out its self-assessment (selfAssessment in each chapter.yaml) - which exercises it asks, how many on each of its pages, and what the build checks. Also when a build problem names selfAssessment.
license: MIT
---

# Self-assessment of an explainer

## What it is

- Two kinds of page: a content page of the app (`/<chapter>/<page>/`), and a step, one page of the
  self-assessment with a few exercises.
- Optional, for the learner and for the app. Before learning, the learner answers exercises of the content pages,
  without the page around them, a few on each step.
- No exercise is checked alone. "Auswerten" checks all of them together. The result per content page:
  "Kannst du wahrscheinlich schon" (all right), "Schau sie dir noch einmal an" (at least half), "Lies sie genau"
  (less), "Nicht abgefragt" (none of its exercises asked).
- JavaScript only: without it, it is not offered. The last result stays on the device; a new run replaces it.
- The chapter is the unit: each chapter declares its own in its `chapter.yaml` (at `<chapter>/einschaetzung/`,
  offered on the chapter's page). The app's (at `einschaetzung/`, offered on the start page) is every chapter's
  together; you write nothing for it. In an app with one chapter, the app's is the chapter's.
- The learner may take the result to their KI tutor. The tutor then guides chapter by chapter: to the pages that do
  not stick, then into a new round of the chapter's self-assessment. The build writes the tutor's page; you write
  nothing for the tutor.

## Decide

- Default: one in every chapter.
- None in a chapter whose pages teach what no exercise can check (an open activity, a discussion, making something):
  the tutor goes through it page by page. None in any chapter: write the reason under "Key decisions" and tell the
  creator in one sentence.
- Leave a page out when its competency cannot be checked by one of its exercises. The result says "Nicht
  abgefragt"; that is right for such a page.

## Choose the exercises

- Read each content page's competency under "Notes" ("Ich kann …"). No "Notes": take it from the page's title,
  description and rule. Ask the exercises that check it best.
- Prefer `generated`: each run draws a new task. Then `number`, `ordering`, `matching`, `multiple-choice`,
  `single-choice`. A content page asked only by exercises that can be guessed (`true-false`, a `single-choice` or a
  small `matching`) gives a weak result: add a `generated` or `number` one of the same page.
- Each must be clear without its page: no "wie im Beispiel oben", no figure that stands elsewhere on the page. A
  question carries its figure in `material`. Not clear alone → take another exercise of the page, or leave the page
  out.
- An exercise component (a `vue-component` block whose component checks an answer) cannot be in it (build problem).
  Its competency is then not asked, unless another exercise of the page checks it.
- 2 or 3 exercises per content page asked: with one alone, the page is never "Kannst du wahrscheinlich schon". A page
  with one fitting `generated` exercise: list it twice, each listing draws a task of its own. A question is listed
  once.

## Write it

- Steps: 2 to 5 exercises each, best 3; fewer or more gives a build hint. Keep the order of the course, also within a
  content page.
- About 3 to 8 exercises per chapter; the app's, every chapter's together, at most about 15 to 20: about ten minutes.
- Each exercise by its page and id: `/<chapter>/<page>/#<exercise>`, of the chapter's own pages.

```yaml
# src/prozent/chapter.yaml
selfAssessment:
  pages:
    - exercises:
        - /prozent/prozentwert/#prozentwert-ueben
        - /prozent/prozentsatz/#welche-rechnung
        - /prozent/prozentsatz/#prozentsatz-ueben
    - exercises:
        - /prozent/grundwert/#klammern
        - /prozent/grundwert/#grundwert-ueben
```

- In the content guide (`.agents/skills/app-content/SKILL.md`), in the procedure for a new chapter or page, add the
  step: "1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt."
  None in the app → the content guide says why.

## Check

- Build and `lernapps check`: one line per problem (the hint on the size of a step names its file and place), e.g.
  `src/prozent/chapter.yaml:9: selfAssessment.pages[0].exercises[0]: /prozent/prozentwert/#prozent-raten names no exercise of src/prozent/prozentwert.yaml; …`.
  Fix where it points.
- Do one run yourself in `npm run dev` at `/einschaetzung/`, and one at `/<chapter>/einschaetzung/?via=tutor`: it
  ends in "Zurück zum Tutor". For each exercise: no "oben", "im Beispiel" or other
  reference to its page; its figure shows with it; the task is the whole question. For each content page asked: one
  exercise at least that cannot be guessed. Then write the commit.
- The end-to-end tests do three runs of each self-assessment: every answer right; none; one a tutor opened.

## Gotchas

- An exercise renamed or moved → change its reference in the same commit.
- `einschaetzung` is reserved: no chapter or page may have that id.
- Never `selfAssessment` in `src/app.yaml` (build problem): the app's comes from the chapters.
- Nothing about a real learner in any file (`no-learner-data-in-texts`).
