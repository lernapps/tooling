# Patterns: Foreign languages

- For every language learners learn at school. A start, not a rule. Columns: idea; what learners see and do; how it
  is expressed.
- Means: explainer blocks; the language task `language-task` (notation: skill `lernapps-explainer`,
  `references/language-tasks.md`); `open-task` for texts of the learner's own; question types.
- New pattern in an app → its content guide, with example.

## Principles

- **Children's everyday life.** Each unit starts from a situation children of the class live; name it in the page's
  first section.
- **Not too complex too early.** Short and simple before long and complex; a new rule with known words, new words
  with known structures; one new thing per exercise.
- **No textbook assumed.** Everything a task needs is on the page, every new word with its meaning.
- **The basic vocabulary** beside the learning map (`https://lernapps.net/apps/map/<subject>/grundwortschatz/`): its
  words by CEFR level. It says how far a word is, not where it belongs.
  - Assume the words of the levels below the unit's.
  - Choose the words of the exercises from the unit's level and situation; introduce each with its meaning before an
    exercise asks for it.
  - A word above the level or outside the list: only when the situation needs it, explained where it first appears.

## Strand app or unit app

- The maps of the foreign languages and German say `explainerFocus: competency`: their strands (words, grammar,
  communication, …) only illustrate. Other subjects say `strand`: one app, one strand.
- A strand app (`strand: <subject>/<strand>`): e.g. the forms of one tense.
- A unit app (`subject: <subject>`): a unit of the class, e.g. "Einkaufen", with its words, grammar and phrases from
  several strands.
- One strand per page: a page practises competencies of one strand, so the method of each strand stays the same. The
  unit mixes strands across its pages.
- Prerequisites in order: each `requires` of a page's competency comes on an earlier page. Nothing missing in
  between: a step of the chain the unit skips is a gap.
- At the entry: what learners bring from earlier units goes on a recap page before the first page that needs it
  (`recap: <subject>/<competency>`), or the page links it on the map. `lernapps check` names each missing one
  (`prerequisites-in-order`).

## Kinds of competency

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Naming things | a figure with markers; write the word for each | `labelled-figure` (`legend: false`) in `material`, items with `marker` |
| Translating | a word or sentence in one language; write it in the other | mode `write`, items with both sides |
| Choosing a form | a gap; choose among plausible forms | mode `choice`, `distractors` per gap |
| Forms of a word | a table of forms with gaps | mode `table` |
| Building one form | a cue; write the form | mode `write`, items with `cue` |
| Words in a sentence | a sentence with a gap; write the word | mode `gap` |
| Word order | the words of a sentence mixed | `ordering` |
| Understanding | a short text; fill in gaps in the learners' language, or answer questions | `text` or `quote`; `language-task` `direction: to-source`; question types |
| Writing a text | a task from everyday life | `open-task` with points of form |
| Culture | facts about the countries | question types; figures |
| Listening, speaking | a sentence to hear and write, or to hear and translate; a model to say after, recorded and compared | `language-task` items with `audio`; `speaking-task`; made with skill `lernapps-audio`, for English, French, Spanish and Italian only: for another language note it under "Where I had to guess" |

## A page

1. **Situation**, in one or two sentences.
2. **Introduce** the words or the rule, each word with its meaning.
3. **Practise, easy to hard**: choose → fill gaps → write words and forms → translate into the learners' language →
   translate into the language learnt.
4. **Apply**: an `open-task` from the situation.

## Checking answers

- The direction is part of the task; both directions are two tasks.
- Mistakes of form count as wrong by default; loosen one only with a reason the page can state.
- List every right version as a variant or under `accepted`; one not listed counts as wrong.
- Per item 1–3 `mistakes` whose message names the rule, never only the solution.
- `examples.rejected`: the mistakes of form the task must not accept.

## Examples (French)

Examples only, for French; take the idea, not the words. The complete example app is
`node_modules/@lernapps/app-templates/explainer/examples/franzoesisch/`.

- Situation: "Du triffst eine Austauschschülerin und stellst dich vor."
- Translating a sentence, with a variant and a typical mistake:

  ```yaml
  - type: language-task
    id: vorstellen-uebersetzen
    languages: { source: de, target: fr }
    items:
      - source: Ich heiße Paul.
        target: "Je (m'appelle|suis) Paul."
        mistakes:
          - answer: Je appelle Paul.
            message: "Zu s'appeler gehört das m': je m'appelle."
        examples:
          rejected: ["je m'appelle Paul.", "Je m'appelle Paul"]
  ```

- A table of forms, capital letters loosened to a hint:

  ```yaml
  - type: language-task
    id: etre-konjugieren
    languages: { source: de, target: fr }
    mode: table
    form: { case: hint }
    table:
      caption: "être · présent"
      header: [Person, Form]
      rows:
        - [je, suis]
        - [tu, "[es]"]
        - [nous, "[sommes]"]
  ```

- Choosing a form: the article of a noun, `distractors: [[La, "L'"]]` for `"[Le] pain est bon."`.
- Building one form: `cue: "aller · nous · présent"`, `target: allons`.
- Loosening form: `form: { punctuation: ok }` when learners translate into German.
