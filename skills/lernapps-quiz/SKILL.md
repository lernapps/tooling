---
name: lernapps-quiz
description: Use when you build or change a quiz for lernapps.net (archetype quiz), or write the quiz-type exercises of an explainer. How the generated quiz works, what you write (only the question bank src/quiz.json), its languages, how content patterns are expressed in it, and how to write good questions, options, background knowledge and links. Load it together with lernapps-app before you write questions.
license: MIT
---

# Building a quiz

A quiz from the archetype `quiz` asks about things to know. The archetype is a deep scaffold. The engine, the six
types of questions, the background knowledge after each answer, scoring, the order, accessibility and the page
without JavaScript are built in. They come from the runtime `@lernapps/app-templates`, which the app depends on.
You write the questions as data in `src/quiz.json`, and no code. The rules of `lernapps-app` apply too. An explainer
(`lernapps-explainer`) embeds the same six types as exercises; the rules below for writing questions apply there.

## How the quiz works

- The generator writes the app with an example bank, "Naturwunder der Welt" (the plan's Code tasks name the
  command). Replace the example in `src/quiz.json` with the creator's questions. The schema (`"$schema"` in the
  file) describes every field: <https://lernapps.net/tooling/schemas/quiz.v1.schema.json>.
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

  They also check the full score and the page without JavaScript. In a quiz with several languages, each further
  language gets two more tests: its page without JavaScript (every question, its solution, the language switch), and
  one question answered with the feedback in that language. `lernapps check` runs them.
- A new feature or a fix of the quiz reaches the app with a newer `@lernapps/app-templates`; `lernapps update` moves
  the app to it, as the skill `lernapps-app` says.

## Languages

A quiz is German, and may add languages: `"languages": ["de", "en"]`, German first (the runtime has its own texts in
German and English). Then every text for learners (the title, the intro, the source titles, and in each question
the text, options, `info`, items, pairs, unit, explanation and link titles) is a map with each declared language:

```json
{
  "id": "totes-meer",
  "type": "true-false",
  "text": {
    "de": "Im Toten Meer kann man nicht untergehen.",
    "en": "You cannot sink in the Dead Sea."
  },
  "answer": true,
  "explanation": {
    "de": "Das Wasser ist so salzig, dass ein Mensch an der Oberfläche treibt.",
    "en": "The water is so salty that a person floats on the surface."
  },
  "links": [
    { "title": { "de": "Totes Meer (Wikipedia)", "en": "Dead Sea (Wikipedia)" }, "url": "https://de.wikipedia.org/wiki/Totes_Meer" }
  ]
}
```

- Without `languages` the quiz is German only and its texts are strings, as before.
- A link's `url` is one address for every language, or a map by language where each has its own page (its Wikipedia).
- The build checks every text against the list, with one line per problem:
  `questions[1].explanation (en) (question "totes-meer"): the translation is missing; write the text as a map: { de: …, en: … }`,
  and for a language the list does not declare `… is not a language of the app; declare it in languages in src/quiz.json, or remove it`.
  `languages[0]: German comes first`.
- The build writes a page per language: German at `index.html`, every other at `<language>/index.html`, each with
  `lang`, `hreflang` links and a language switch that works without JavaScript.

## When a test of the runtime fails

The end-to-end tests come from the runtime, not from your app. If one of them fails while your bank validates (the
build passes), the bug is in the template, not in your questions: do what the skill `lernapps-app` says for a
failing test of the runtime. Never change the runtime in `node_modules` either (`quiz-only-data`); go on with the
questions.

## Content and question patterns

What the quiz asks and how its rounds are built is decided once, in the app's content guide
`.agents/skills/app-content/SKILL.md`; load it first. The archetype-neutral skills say how to decide it: the skill
`lernapps-content-research` (curriculum, competencies, verified sources), the skill `lernapps-exercise-patterns`
(patterns by subject) and the skill `lernapps-content-growth` (a new round). In a quiz they are expressed like this:
- a **competency** is practised by one or more questions; a **round** is the questions of one chapter of
  competencies, next to each other in the bank;
- the bank is the **shared material**: each fact in one question;
- a **pattern** is a question type with a fixed form of text, options and `info`, varied over the facts of a round;
- what the bank cannot say is no code: write it under "Where I had to guess" (`quiz-only-data`), and open an issue at
  <https://github.com/lernapps/app-templates/issues> when other quizzes would need it too.

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
scope: [archetype:quiz, archetype:explainer]
severity: error
```

The bank validates against its schema. The build also checks what the schema cannot say:
- exactly one correct option in a single choice, at least one in a multiple choice;
- ids and options that appear only once.

A broken bank fails the build with one line per problem, naming the question by its position and id. Fix each one in
`src/quiz.json`. A quiz-type exercise of an explainer validates the same way, named by its file and block path.

### `quiz-clear-question`: One clear question at a time

```rule
id: quiz-clear-question
scope: [archetype:quiz, archetype:explainer]
severity: warning
```

Ask one thing per question, complete in itself: the learner knows what to answer before reading the options. Ask
positively; avoid "nicht" in the question, and never two negations. No trick questions: ask what is worth knowing,
not whether the learner reads carefully. Plain language and short sentences, in German and in every other language
of the quiz (`learner-text-german`).

### `quiz-plausible-options`: Options a learner could believe

```rule
id: quiz-plausible-options
scope: [archetype:quiz, archetype:explainer]
severity: warning
```

Make every wrong option a real thing of the same kind as the right one: a river for a river, a mountain for a
mountain. A learner could mix it up, and it has true background of its own. Make all options alike in length and
form, so that the right one does not stand out. No "Alle genannten" or "Keine davon", no joke options. Three or four
options are enough.

### `quiz-feedback-explains`: Background and explanation say why

```rule
id: quiz-feedback-explains
scope: [archetype:quiz, archetype:explainer]
severity: hint
```

Give every option an `info` of one to three sentences about the option itself. It must be true whether or not the
option is the right answer, so that a learner who chose it learns something real. Example: "Der Nil fließt durch
mehrere Länder Afrikas und mündet in Ägypten ins Mittelmeer." The `explanation` says in one to three sentences why the
right answer is right. For true/false, number, ordering and matching it also carries the background. For a wrong
option, say in its `info` why it does not fit: a learner who chose it reads it as the reason. Give a `number` question
its typical wrong numbers as `mistakes` (`answer`, `message`), and any question an optional `hint` that points to
where to look without giving the answer away.

### `quiz-further-reading`: Every question links to further reading

```rule
id: quiz-further-reading
scope: archetype:quiz
severity: warning
```

Link every question to at least one page where learners read on, best the article in the German Wikipedia
(`https://de.wikipedia.org/wiki/...`). Read every linked page before you commit:
- it is the article you mean, not a disambiguation page ("Begriffsklärung");
- it says what your question and options say.

Leave resolving links to `lernapps check`: it checks the app's own links and the entry's, and reading an article shows
that its link resolves. Write no scraper, script or API loop that fetches pages for you. When a site limits your
requests (HTTP 429), tell the creator which links you could not read, mark those facts as not checked in the plan,
and go on.

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
scope: [archetype:quiz, archetype:explainer]
severity: warning
```

A `number` question says in its text how exactly to answer, e.g. "Bis zu 100 m daneben zählt noch als richtig". It
names the unit in `unit`, not in the learner's answer. Match `tolerance` to what the text says. Where sources differ
(the height of a mountain), choose a tolerance that covers them.

### `quiz-fitting-type`: The type that fits the question

```rule
id: quiz-fitting-type
scope: [archetype:quiz, archetype:explainer]
severity: hint
```

Choose the type from what the learner should do:
- recall one fact out of several things of the same kind: `single-choice`;
- several facts: `multiple-choice`;
- estimate a size: `number`;
- compare sizes or dates: `ordering`;
- connect things that belong together: `matching`;
- judge a statement: `true-false`.

Mix types across the quiz. Choose a type that accepts every answer the text allows: an `ordering` only where the
order is fixed (skill `lernapps-exercise-patterns`, "How an exercise checks success").

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
