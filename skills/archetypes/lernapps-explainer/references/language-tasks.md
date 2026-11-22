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

## Vocabulary

- `vocabulary` (not a `language-task`): the new words of a page, as in a vocabulary book, each with its language.
  Only in an app for a language; never in other subjects (a term of maths or history is a `definition`). Instead of a
  `table` of words, which knows no languages. Not in a task's `material`.
- Fields: `caption`, `languages` (`source`, `target`), `entries`.
- `target`, `source`: as learners learn them, shown as written. A noun always with its article (`le pain`, `l'eau`,
  `der Tisch`): nothing derives it, also when `gender` is given. `gender` (`m`, `f`, `n`) adds `(m)` after the word; give
  it where the article does not show it (`l'eau`, Latin).
- `forms`: further forms after the word, as in a dictionary: plural (`les yeux`), feminine (`belle`), principal parts
  (`amo, amavi, amatum`), genitive (`regis`).
- `example` (`target`, `source`), `note`, `falseFriend`: the middle column, only shown when an entry has one.
- `inflection`: 1–4 tables of forms (`caption`, optional `header`, `rows`; the first cell heads the row; `**…**` marks
  the ending). Only for grammar the learners already know (the tense, the cases); otherwise leave it out and teach the
  grammar on its own page first. Every row as long as the others and the header; the build checks it.
- Not an exercise: learners cover a column to practise, unchecked. Words to write and check: `language-task`.

```yaml
- type: vocabulary
  caption: Die Wörter auf dem Tisch
  languages: { source: de, target: fr }
  entries:
    - target: le pain
      source: das Brot
      example: { target: "Le pain est bon.", source: "Das Brot ist gut." }
    - target: l'eau
      source: das Wasser
      gender: f
      note: "Vor einem Vokal wird *la* zu *l'*."
    - target: être
      source: sein
      inflection:
        - caption: Präsens
          rows: [[je, suis], [tu, es], [il / elle, est], [nous, sommes], [vous, êtes], [ils / elles, sont]]
```

## Speaking

- `speaking-task` (not a `language-task`): the learner hears a model, records themself, compares and rates the
  pronunciation. Fields: `id`, `language` (the target language code), `items` (1–10, each `audio` and optional `text`),
  `task`, `hint`. The page checks nothing, and the recording stays in the browser. It counts as the page's exercise, but a
  chapter's `selfAssessment` cannot ask it. Make the models and write the block with skill `lernapps-audio`.
