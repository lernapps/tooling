# Language tasks

- `language-task`: the learner writes a word, a form or sentences in a language; the page checks it against the
  answers the task lists. Patterns, principles and examples: skill `lernapps-exercise-patterns`,
  `references/foreign-languages.md`.
- Schema: `$defs/languageTask` of the explainer's schema. Counts as a page's exercise; may be in a self-assessment.

## Fields

- `languages: { source, target }`: the language learners know, the one they learn (language codes).
- `direction`: `to-target` (default) or `to-source`: which side the learner writes.
- `mode`: `write` (default; the whole answer), `gap` (the gaps), `choice` (one choice per gap, with `distractors`),
  `table` (a `table` with gaps instead of `items`).
- `items`: 1–20. Each has the side the learner writes and one thing to start from: the other side, `cue`,
  `marker` (a label of a `labelled-figure` with `legend: false` in `material`), or `audio` (a file of `src/audio/`,
  spoken in the target language: a dictation when the learner writes `target`, a listening task with a translation
  when `direction: to-source` and the item has `source` and no `target`). The text of the file must be a right answer.
  Make the files with skill `lernapps-audio`; it also says what the creator must know first.
- `task`: optional; without it a text by mode.
- `form`: per class (`case`, `accents`, `hyphen`, `apostrophe`, `punctuation`) `ok`, `hint`, `partly` or `wrong`
  (default).
- Per item `mistakes` (`answer`, `message`) and `examples` (`accepted`, `rejected`: a text, or one text per gap).
- `material`, `hint`, `explanation`: as for questions.

## Writing answers

- Variants in place: `(a|b)`; a word that may be left out: `(word |)`; brackets without `|` are text.
- Gaps: `[ … ]` on the side the learner writes; alternatives of a gap: `[a|b]`.
- Further whole answers, mode `write` only: `accepted`.
- At most 64 versions per item.

## Gotchas

- `distractors`: one list per gap, in order; none may be a right answer of its gap.
- A `marker` needs the figure in the task's own `material`.
- YAML: quote a text with `: `, or one that starts with `'` or `[`.
- The build runs each mistake and each example through the page's check and stops with the place to fix.

## Speaking

- `speaking-task` (not a `language-task`): the learner hears a model, records themself, compares and rates the
  pronunciation. Fields: `id`, `language` (the target language code), `items` (1–10, each `audio` and optional `text`),
  `task`, `hint`. The page checks nothing, and the recording stays in the browser. It counts as the page's exercise, but a
  chapter's `selfAssessment` cannot ask it. Make the models and write the block with skill `lernapps-audio`.
