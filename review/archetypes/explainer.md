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

The schema already requires an exercise on every page except a recap page (`recap`), which has none; judge whether it
fits. Open every page. A finding: an exercise
that practises something other than what its page explains, or one whose solution or feedback does not let learners
check their answer; a task that shows several representations at once. Name the page and the exercise. Not here:
content of a later page (`explainer-one-step`), the order of the exercises (`explainer-exercise-progression`).

## Typical mistakes, diagnosed

```rubric
id: explainer-mistakes-diagnosed
```

Read every `generated` exercise, and try a typical wrong answer in every exercise component. A finding: one without
`mistakes` where learners make a typical mistake (forgetting to divide by 100, the reverse order), or a message that
only says that it is wrong, not what went wrong.

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
scope that says what the page does not teach, or leaves out what it teaches; a scope that copies the material instead of saying it in its own words; "Gehört nicht dazu"
that names what a page teaches.

## Plausible numbers

```rubric
id: explainer-plausible-numbers
```

Read the ranges in `given` and a worked task of every `generated` exercise in the bundle. A finding: values that do
not fit the thing in the text (a price of 3 € for a bicycle, 90.91 people), or a range so narrow that the tasks
repeat.

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

## Pages teach their competencies

```rubric
id: content-matches-competencies
```

Only for an explainer in format 2 with a strand (`strand` in `src/app.yaml` not `none`). Open
`https://lernapps.net/apps/map/<subject>.json` (`<subject>` the part of `strand` before `/`) and read, for every page,
the `iCan` of each competency in its `competencies`, then the page. A finding, always a hint: a page that teaches
clearly more than its "Ich kann …" says, or something else. Name the page, the competency and what is more or other.
The map cannot be opened: no finding; say that it was not judged.

## The figure of a task does not give the answer away

```rubric
id: explainer-figure-hides-answer
```

Unit: an exercise. Do it in the browser: mark, slide and type, but do not press "Prüfen". Judge only what belongs to
the task: its figure, caption, `alt`, text and component. 2: none of them gives the answer before the check. 0: one of
them shows it (a counter or live sentence that states what is checked, a field it fills in, a mark on the right spot,
the task's text naming the option to choose). Two levels only. Name the page, the exercise and what gave it away. Not
here: a question that repeats what the page explained above it; that is a check of understanding
(`explainer-exercise-progression` judges whether the exercises go further).

# Learning quality

The items below judge whether a learner of the app's grade can follow what a page does. Open each page in the browser
and use it as such a learner, who knows the competencies its competency `requires` in the map
(`https://lernapps.net/apps/map/<subject>.json`) and their everyday life, and nothing of the page yet. Operate every
control. Each item names its unit (a page, a figure or component, an exercise) and three levels; the review writes a
finding for level 0 or 1, the eval juror (`evals/juror/prompt.md`) writes the level of every unit. Level 0: a learner
gets stuck or is misled. Level 1: a learner gets there with a detour or a guess. Level 2: clear.

## The page says where it leads

```rubric
id: explainer-page-goal
```

Unit: a page. 2: near its start the page says what learners will be able to do after it and how it builds on the page
before (or on what they know); its exercises check that. 1: one of the two is missing, or the exercises check
something else. 0: neither. Quote the sentence. Not here: how the page starts its explanation
(`explainer-learner-start`).

## Learners start where they stand

```rubric
id: explainer-learner-start
```

Unit: a page. 2: the explanation starts from something learners of that grade know (a prerequisite, an everyday
situation), links the new idea to it with an analogy or a situation, and explains each term where it is first
needed. 1: the start is there, but a term comes unexplained or too early, or an analogy is not connected to the
idea. 0: the first paragraph presupposes a term or rule of the page without linking it to anything known. Quote
the first sentences and the term. Not here: long sentences (`learner-text-german`), tone (`explainer-age-appropriate`).

## Each figure and model says what it means

```rubric
id: explainer-representation-explained
```

Unit: a figure, diagram or component, with its caption and `alt`. Count only the questions of the rule that apply
(a static figure has no input): the whole or reference, the meaning of parts, colours and marks, how it leads to the
statement, what to enter or check. 2: all that apply are answered before learners need them, and a common misreading
is named. 1: one or two are left to guess. 0: three or more, the figure shows something else than the text says, or
a mark reads as a sign it is not. Name the figure and the open questions. Not here: what a control does
(`explainer-control-purpose`), the `nojs` text (`explainer-readable-without-js`).

## Every control has a visible purpose

```rubric
id: explainer-control-purpose
```

Unit: a component with controls. Use each control. 2: the page names each control, says what to do with it and what
to watch; each changes something visible; the start state shows what stays the same; labels, limits and positions
agree after every change. 1: the page names a control but not what to watch, or the start state already shows the
change. 0: the page does not mention a control, a control has no visible effect, or labels and positions disagree.
Name the control and what you did.

## Text, figure and task tell the same

```rubric
id: explainer-text-figure-agree
```

Unit: a section. 2: the same numbers and the same whole in its text, figures and task; a switch to another example
announced; the text names only tools and views the page has. 1: a switch of numbers without notice. 0: the text names
a view, a tool or a control the page does not have, or describes another figure. Quote the text and say what the
page shows. Not here: headings (`explainer-honest-headings`).

## One new step per page

```rubric
id: explainer-one-step
```

Unit: a page. A new idea is a statement the page's exercises check. 2: one new idea; nothing of a later competency or
page, also not in the options; one example per box. 1: two new ideas, a second way to the result without its own
derivation, or several examples in one box. 0: content of a later competency or page in its text, figures, exercises
or options, or two competencies of their own on one page. Name what belongs elsewhere.

## Exercises go from recognising to applying

```rubric
id: explainer-exercise-progression
```

Unit: the exercises of a page. 2: they go from recognising or repeating what the page showed to applying it with other
values and in a new situation (another context, a word problem, the reverse question). 1: two of these levels. 0: one
level only. Name the exercises and their levels. Not here: whether each fits the page (`topic-has-exercises`).

## A solution step explains

```rubric
id: explainer-steps-explain
```

Unit: an exercise with steps or a worked example. Read the steps of three tasks; the level is that of the worst. 2:
each step uses the task's numbers and gives its reason; given values are worked out. 1: a step without its reason, or
a given value as an unworked term. 0: a step that only says to apply a rule ("Setze die Angaben in die Regel ein").
Quote the step. Not here: the message to a wrong answer (`explainer-mistakes-diagnosed`).

## Headings say what the section does

```rubric
id: explainer-honest-headings
```

Unit: a page. 2: every heading fits its section; "Ausprobieren" only where learners operate something. 1: a heading
that is vague or fits only half its section. 0: a heading that promises an action the section does not offer. Name
the section.

## Address fits the age

```rubric
id: explainer-age-appropriate
```

Unit: a page. Tone and examples only. 2: they fit the grade (younger learners: things from their day, a friendly
tone; older learners: not childish, situations of their world). 1: a passage with a tone or example that misses the
grade. 0: more than half of the paragraphs miss it. Quote the passage. Not here: sentence length and jargon
(`learner-text-german`), terms (`explainer-learner-start`).
