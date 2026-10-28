---
name: lernapps-explainer-self-assessment
description: Use in Commit of a lernapps.net explainer, once its content and its forms of teaching are final, to add, change or leave out its self-assessment (selfAssessment in src/app.yaml or a chapter.yaml) - which exercises it asks, how many on each of its pages, and what the build checks. Also when a build problem names selfAssessment.
license: MIT
---

# Self-assessment of an explainer

## What it is

- Optional, for the learner and for the app. Before learning, the learner answers exercises of the content pages,
  without the page around them, a few on each page of the self-assessment.
- No exercise is checked alone. "Auswerten" checks all of them together. The result per content page:
  "Kannst du wahrscheinlich schon" (all right), "Schau sie dir noch einmal an" (at least half), "Lies sie genau"
  (less), "Nicht abgefragt" (none of its exercises asked).
- JavaScript only: without it, it is not offered. The last result stays on the device; a new run replaces it.
- The learner may take the result to their KI tutor: the build writes a tutor page with every exercise asked, its
  solutions and mistakes, and the links to the pages. You write nothing for the tutor.
- The app's: `selfAssessment` in `src/app.yaml`, at `einschaetzung/`, offered on the start page. A chapter's: in its
  `chapter.yaml`, at `<chapter>/einschaetzung/`, offered on the chapter's page; only in an app with two or more
  chapters.

## Decide

- Default: one for the whole app in `src/app.yaml`.
- Also one per chapter, when a chapter has four or more pages and learners may start with it alone.
- None, when most pages teach what no exercise can check (an open activity, a discussion, making something). Write
  the reason under "Key decisions" and tell the creator in one sentence.
- Leave a page out when its competency cannot be checked by one of its exercises. The result says "Nicht
  abgefragt"; that is right for such a page.

## Choose the exercises

- Read each page's competency under "Notes" ("Ich kann …"). Ask the exercise that checks it best.
- Prefer `generated`: each run draws a new task. Then `number`, `ordering`, `matching`, `multiple-choice`,
  `single-choice`. `true-false` only beside another exercise of the same page: alone it is a coin toss.
- Each must be clear without its page: no "wie im Beispiel oben", no figure that stands elsewhere on the page. A
  question carries its figure in `material`. Not clear alone → take another exercise of the page, or leave the page
  out.
- An exercise component cannot be in it (build problem).
- 1 to 3 exercises per page asked; more for a page with more to know.

## Write it

- Pages of the self-assessment: 2 to 5 exercises each, best 3 (else a build hint). Keep the order of the course.
- At most about 15 exercises in all: about ten minutes.
- Each exercise by its page and id: `/<chapter>/<page>/#<exercise>`, each once.

```yaml
selfAssessment:
  pages:
    - exercises:
        - /prozent/prozentwert/#prozentwert-ueben
        - /prozent/prozentsatz/#welche-rechnung
        - /prozent/prozentsatz/#prozentsatz-ueben
    - exercises:
        - /prozent/grundwert/#grundwert-ueben
        - /prozent/grundwert/#klammern
```

- In the content guide (`.agents/skills/app-content/SKILL.md`), in the procedure for a new chapter or page, add the
  step: "1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt."
  None in the app → the content guide says why.

## Check

- Build and `lernapps check`: one line per problem, e.g.
  `src/app.yaml:22: selfAssessment.pages[0].exercises[0]: /prozent/prozentwert/#prozent-raten names no exercise of src/prozent/prozentwert.yaml; …`.
  Fix where it points.
- Do one run yourself in `npm run dev` at `/einschaetzung/`: each exercise clear alone? Then write the commit.
- The end-to-end tests do two runs of each self-assessment: every answer right, and none.

## Gotchas

- An exercise renamed or moved → change its reference in the same commit.
- `einschaetzung` is reserved: no chapter or page may have that id.
- An app with one chapter: the self-assessment goes into `src/app.yaml`, never into its `chapter.yaml`.
- Nothing about a real learner in any file (`no-learner-data-in-texts`).
