# Review rubric: archetype explainer

Chapters of pages that explain and practise a topic, readable without JavaScript, from content written as YAML and,
where no block fits, Vue components. The build has validated the content and its exercises, and the validation report
says whether the end-to-end tests passed; judge what they cannot. Judge these items after those of
`review/rubric.md`, and the item `quiz-feedback-explains` of `review/archetypes/quiz.md` on every exercise of the
quiz's types. Read the content in `src/` and the built pages in the bundle.

## Every page has exercises that fit

```rubric
id: topic-has-exercises
```

The schema already requires an exercise on every page; judge whether it fits. Open every page. A finding: an exercise
that practises something other than what its page explains, or one whose solution or feedback does not let learners
check their answer. Name the page and the exercise.

## Typical mistakes, diagnosed

```rubric
id: explainer-mistakes-diagnosed
```

Read every `generated` exercise. A finding: one without `mistakes` where learners make a typical mistake (forgetting
to divide by 100, the reverse order), or a mistake whose message only says that it is wrong, not what went wrong.

## Points of an open task, from the material

```rubric
id: explainer-open-points
```

Read every `open-task` with the sections its points name. A finding: a point that is not in the named section or not
in the material at all; a point a learner cannot check with yes or no; points that miss what a good answer needs; a
model answer that lacks a point or is not in the words of the class.

## Scope matches the pages

```rubric
id: explainer-scope-matches
```

Read the scope, if the app has one (`scope` in `src/app.yaml` and in each page), against the pages. A finding: a page's
scope that says what the page does not teach, or leaves out what it teaches; a scope that copies the material instead of saying it in its own words; "Gehört dazu" or
"Gehört nicht dazu" that contradicts the pages.

## Plausible numbers

```rubric
id: explainer-plausible-numbers
```

Read the ranges in `given` and a worked task of every `generated` exercise in the bundle. A finding: values that do
not fit the thing in the text (a price of 3 € for a bicycle, 90.91 people), or a range so narrow that the tasks
repeat.

## The figure explains the text

```rubric
id: explainer-figure-explains
```

Look at every `figure` and `labelled-figure` with its caption and alt text. A finding: a figure that does not show
what the text next to it says, a caption that does not say what to see, or an alt text that does not say what the
figure shows.

## Quotes exact and sourced

```rubric
id: explainer-quote-sourced
```

Read every `quote`. A finding: a quotation that differs from its source where you can open it, or one whose origin,
source or licence is missing or does not fit. Quote the block.

## Formulas as formulas

```rubric
id: explainer-formulas-static
```

Read the texts of the content. A finding: a formula written as plain text (`W = G * p / 100`, `x^2` outside `$…$`)
or shown as a picture instead of a `formula` block or `$…$`.

## Readable without JavaScript

```rubric
id: explainer-readable-without-js
```

Read each page as it is without JavaScript: the bundle's HTML, where components show their `nojs` text. A finding:
meaning that is only inside an exercise or a component (a fact the page never states), or a `nojs` text that does
not say what the component shows or does not carry its content.

## Ids kept

```rubric
id: explainer-stable-ids
```

Compare the ids of chapters, pages, sections and exercises with the last listed version of the app, if there is one
(the entry's topics and the bundle at its address). A finding: an id that was renamed or reused, so that a listed
link no longer leads where it did.

## A component only where no block fits

```rubric
id: prefer-built-in-block
```

Read every component in `src/components/` and the block that uses it. A finding: a component that does what a
built-in block or a `generated` exercise could do, e.g. a table, a picture with labels, or an exercise with a number
answer.
