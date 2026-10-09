---
name: lernapps-quiz
description: Use when you build or change a quiz for lernapps.net (archetype quiz). How the generated quiz works, what you write (only the question bank src/quiz.json), and how to write good questions, options, background knowledge and links. Load it together with lernapps-app before you write questions.
license: MIT
---

# Building a quiz

A quiz from the archetype `quiz` asks about things to know. The archetype is a deep scaffold. The engine, the six
types of questions, the background knowledge after each answer, scoring, the order, accessibility and the page
without JavaScript are built in. They come from the runtime `@lernapps/app-templates`, which the app depends on.
You write the questions as data in `src/quiz.json`, and no code. The rules of `lernapps-app` apply too.

## How the quiz works

- `lernapps create --archetype quiz` writes the app with an example bank, "Naturwunder der Welt". Replace the
  example in `src/quiz.json` with the creator's questions. The schema (`"$schema"` in the file) describes every
  field: <https://lernapps.net/tooling/schemas/quiz.v1.schema.json>.
- The build reads the bank, validates it and renders every question into `index.html`.
  - Without JavaScript, the page is a worksheet: all questions, then the solutions with the same background and links.
  - With JavaScript, the learner answers one question at a time and sees whether the answer is right. After each
    answer the page shows:
    - the background (`info`) of every option, with the right ones and the learner's choice marked;
    - the explanation;
    - the links for further reading.

    The score and the solutions come at the end.
- The order is shuffled by the seed in the address (`?seed=42`): the same link gives the same order. A deep link
  opens one question: `#frage-<id>`.
- The quiz stores nothing. With `"rememberLastResult": true` it keeps the last score on the device and shows it at
  the end; then the entry's `fitness.storage` is `device`.
- Your end-to-end tests come with the runtime (`e2e/quiz.e2e.ts`). For every question of your bank they check:
  - its deep link;
  - a right and a wrong answer;
  - that every option's background, the explanation and the links show.

  They also check the full score and the page without JavaScript. `lernapps check` runs them.
- A new feature of the quiz reaches the app with a newer `@lernapps/app-templates`; Renovate proposes it.

## Types of questions

| `type` | The learner | You write |
|---|---|---|
| `single-choice` | chooses one option | `options`: exactly one with `"correct": true`; `info` for each, `link` where useful |
| `multiple-choice` | chooses every correct option | `options`: at least one correct; `info` for each, `link` where useful |
| `true-false` | judges a statement | `answer` (true or false) |
| `number` | types a number (comma or point) | `answer`, `tolerance` (0 for exact), `unit` if any |
| `ordering` | gives each item its place, e.g. by height | `items` in the right order; the page mixes them |
| `matching` | matches each left entry with a right one | `pairs` as they belong; the page mixes the right entries |

Every question has an `id`, its `text`, an `explanation` and at least one link in `links`. Types without options
(true/false, number, ordering, matching) carry their background in `explanation`. The quiz may list its `sources`.

```json
{
  "id": "grand-canyon",
  "type": "single-choice",
  "text": "Welcher Fluss hat den Grand Canyon in den USA geformt?",
  "options": [
    {
      "text": "Colorado",
      "correct": true,
      "info": "Der Colorado ist der größte Fluss im Südwesten Nordamerikas. Er ist gut 2300 km lang.",
      "link": { "title": "Colorado River (Wikipedia)", "url": "https://de.wikipedia.org/wiki/Colorado_River" }
    },
    {
      "text": "Nil",
      "correct": false,
      "info": "Der Nil fließt durch mehrere Länder Afrikas und mündet in Ägypten ins Mittelmeer. Mit rund 6650 km gilt er als längster Fluss der Erde."
    }
  ],
  "explanation": "Der Grand Canyon ist eine steile Schlucht in Arizona, etwa 450 km lang. Der Colorado hat sie über Millionen von Jahren in das Gestein gegraben.",
  "links": [{ "title": "Grand Canyon (Wikipedia)", "url": "https://de.wikipedia.org/wiki/Grand_Canyon" }]
}
```

## Rules

Each rule is a section headed by its rule block. All rules: <https://lernapps.net/tooling/rules/>.

### `quiz-only-data`: Write only the question bank

```rule
id: quiz-only-data
scope: archetype:quiz
severity: error
```

Change `src/quiz.json` and nothing of the quiz's code. Keep `index.html`, `src/main.ts`, `e2e/quiz.e2e.ts` and the
configuration as generated (`keep-the-preset`). If the quiz needs something the bank cannot say, write it under
"Where I had to guess" in the retrospective instead of coding around the runtime.

### `quiz-bank-valid`: The question bank validates

```rule
id: quiz-bank-valid
scope: archetype:quiz
severity: error
```

The bank validates against its schema. The build also checks what the schema cannot say:
- exactly one correct option in a single choice, at least one in a multiple choice;
- ids and options that appear only once.

A broken bank fails the build with one line per problem, naming the question by its position and id. Fix each one in
`src/quiz.json`.

### `quiz-clear-question`: One clear question at a time

```rule
id: quiz-clear-question
scope: archetype:quiz
severity: warning
```

Ask one thing per question, complete in itself: the learner knows what to answer before reading the options. Ask
positively; avoid "nicht" in the question, and never two negations. No trick questions: ask what is worth knowing,
not whether the learner reads carefully. Plain German, short sentences (`learner-text-german`).

### `quiz-plausible-options`: Options a learner could believe

```rule
id: quiz-plausible-options
scope: archetype:quiz
severity: warning
```

Make every wrong option a real thing of the same kind as the right one: a river for a river, a mountain for a
mountain. A learner could mix it up, and it has true background of its own. Make all options alike in length and
form, so that the right one does not stand out. No "Alle genannten" or "Keine davon", no joke options. Three or four
options are enough.

### `quiz-feedback-explains`: Background and explanation say why

```rule
id: quiz-feedback-explains
scope: archetype:quiz
severity: hint
```

Give every option an `info` of one to three sentences about the option itself. It must be true whether or not the
option is the right answer, so that a learner who chose it learns something real. Example: "Der Nil fließt durch
mehrere Länder Afrikas und mündet in Ägypten ins Mittelmeer." The `explanation` says in one to three sentences why the
right answer is right. For true/false, number, ordering and matching it also carries the background.

### `quiz-further-reading`: Every question links to further reading

```rule
id: quiz-further-reading
scope: archetype:quiz
severity: warning
```

Link every question to at least one page where learners read on, best the article in the German Wikipedia
(`https://de.wikipedia.org/wiki/...`). Open every link before you commit:
- it answers without an error;
- it is the article you mean, not a disambiguation page ("Begriffsklärung");
- it says what your question and options say.

Name the page in the link's `title`, e.g. "Uluru (Wikipedia)". Never guess an address.

### `quiz-own-words`: Write in your own words

```rule
id: quiz-own-words
scope: archetype:quiz
severity: warning
```

Take facts from your sources, never their sentences. Wikipedia's texts are under CC BY-SA, so a copied sentence
needs attribution and puts the app's texts under the same licence. Write each `info` and `explanation` new, shorter
and plainer than the source, for learners of the school year the app is for. Facts themselves are free to use; name
where they come from in `sources` (`third-party-licence`).

### `quiz-number-precision`: Numbers with unit and rounding

```rule
id: quiz-number-precision
scope: archetype:quiz
severity: warning
```

A `number` question says in its text how exactly to answer, e.g. "Bis zu 100 m daneben zählt noch als richtig". It
names the unit in `unit`, not in the learner's answer. Match `tolerance` to what the text says. Where sources differ
(the height of a mountain), choose a tolerance that covers them.

### `quiz-fitting-type`: The type that fits the question

```rule
id: quiz-fitting-type
scope: archetype:quiz
severity: hint
```

Choose the type from what the learner should do:
- recall one fact out of several things of the same kind: `single-choice`;
- several facts: `multiple-choice`;
- estimate a size: `number`;
- compare sizes or dates: `ordering`;
- connect things that belong together: `matching`;
- judge a statement: `true-false`.

Mix types across the quiz.

### `quiz-answers-checked`: Check every fact

```rule
id: quiz-answers-checked
scope: archetype:quiz
severity: hint
```

Check every marked option, every number and every `info` against the linked article before you commit. Where you
cannot open a source, say so in the plan and mark the fact as not checked; never fill a gap from memory. Learners
report errors through the issue form the generator wrote (`.github/ISSUE_TEMPLATE/inhaltsfehler.yml`).

### `quiz-stable-ids`: Keep the ids

```rule
id: quiz-stable-ids
scope: archetype:quiz
severity: warning
```

Give each question a short, telling `id` ("grand-canyon") and keep it when you change the text: teachers share links
to single questions (`#frage-<id>`). Give a new question a new id; never reuse the id of a removed one.
