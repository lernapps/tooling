# Explainer runtime

What the runtime does with your content, as far as it changes what you write. What an explainer can and cannot do is
in the template's README.

## A build problem

- The build reads and validates every file and renders every page to static HTML. A problem is one line
  `file:line: place (language): what to do`, for example
  `src/prozent/prozentwert.yaml:12: blocks[0].blocks[1].text: a Markdown heading ("Regel"); use a section block with the title "Regel"`.
  Fix where it points.

## A runtime test fails

- The tests come from the runtime (`e2e/explainer.e2e.ts`) and run in `lernapps check`: every page in every language
  without JavaScript, and with it one exercise of each type per page.
- Your content validates, the build passes and a test still fails: that is a bug of the template. Act as "A check
  fails" of skill `lernapps-cli` says, and go on with the content.
- Never change the runtime in `node_modules` (`explainer-only-content`). The fix arrives with `lernapps update`.

## Addresses

- Page `/<chapter>/<page>/`; section `#<section>`, subsection `#<section>/<sub>`; exercise `#<exercise>`; a task of
  a generated exercise `/<chapter>/<page>/?<exercise>=<n>#<exercise>`.
- Glossary `/glossar/`. Other languages: the same tree under `/<language>/`.
- Tutor page of a page: `/<chapter>/<page>/tutor/`. Scope: `/<chapter>/<page>/scope/`, `/<chapter>/scope/`, `/scope/`.
- Self-assessment: `/einschaetzung/` and `/<chapter>/einschaetzung/`.
- No exercise id: `seed`, `via`, `uebung`, `abschnitt`. No chapter or page id: `einschaetzung`, `scope`.
- A page you move or remove changes its address: links from outside break.

## Without JavaScript

- Every page is complete: text, formulas, figures, tables, navigation. An exercise shows its task and a folded
  "Lösung"; a `generated` exercise three worked tasks; a component its `nojs` text; an `open-task` its points and
  the model answer.
- So a solution, a `steps` list and a `nojs` text are content a learner reads: write them as carefully as the page.

## Tutor

The learner may switch on an AI assistant of their own. The build writes a tutor page per page from your content;
the app sends nothing. The tutor neither calculates nor invents: it has only what you wrote.

- It reads the blocks as text (a figure by its `alt` and `caption`) and every exercise: task, solution, `hint`,
  the mistakes with their messages, the options with their `info`, the `explanation`, the `steps`. These must be
  complete and right.
- Task numbers 1 to N (at most 67) are what learner, tutor and address share. Changing a generated exercise changes
  what a number points to.
- `scope`: the learning path in your own words, as continuous prose with the exact content (facts, terms, reasons,
  examples). On each page: what the page teaches. In `src/app.yaml`: `scope: { text, out: [...] }`, what the app is
  about and what does not belong to it. Optional in a `chapter.yaml`.
- `tutor.rules` in `src/app.yaml`: the app's own rules for the tutor, if the plan has any.
