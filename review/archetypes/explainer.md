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
check their answer; a task that shows several representations at once, or asks for content of a later page. Name the
page and the exercise.

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
scope that says what the page does not teach, or leaves out what it teaches; a scope that copies the material instead of saying it in its own words; "Gehört nicht dazu"
that names what a page teaches.

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

Do every exercise with a figure or a component in the browser: mark, slide and type, but do not press "Prüfen". A
finding: the task's figure, its caption or `alt`, its text or the component shows the answer before the check (a
counter or live sentence that states what is checked, a field it fills in, a mark on the right spot, an option
repeated). Name the page, the exercise and what gave it away.

# Learning quality

The items below judge whether a learner of the app's grade can follow what a page does. Open each page in the browser
and use it as such a learner, who knows the competencies its competency `requires` in the map
(`https://lernapps.net/apps/map/<subject>.json`) and their everyday life, and nothing of the page yet. Operate every
control. Each item names its unit (a page, a figure or component, an exercise) and three levels; the review writes a
finding for level 0 or 1, the eval juror (`evals/juror/prompt.md`) writes the level of every unit. Level 0: a learner
gets stuck or is misled. Level 1: a learner gets there with a detour or a guess. Level 2: clear.

## Learners start where they stand

```rubric
id: explainer-learner-start
```

Unit: a page. 2: it starts from something learners of that grade know (a prerequisite, an everyday situation), links
the new idea to it with an analogy or a situation, and explains each term where it is first needed. 1: the start is
there, but a term comes unexplained or too early, or an analogy is not connected to the idea. 0: it starts with a rule,
a definition or a question that needs what the page is about to teach. Quote the first sentences and the term.

## Each figure and model says what it means

```rubric
id: explainer-representation-explained
```

Unit: a figure, diagram or component (with its text, `nojs` and `alt`). Ask the five questions of the rule: the whole
or reference, the meaning of parts, colours, patterns and marks, what learners change and what stays, how that leads to
the statement, what to enter or check. 2: the page answers all five before learners need them. 1: one or two are left
to guess. 0: three or more, or a mark that reads as a sign it is not (a tick in a field, a pattern like a boundary).
Name the figure and the unanswered questions.

## Every control has a visible purpose

```rubric
id: explainer-control-purpose
```

Unit: a component with controls. Use each control. 2: each one changes something visible, the text says why to use
it, the start state shows first what stays the same, and labels, limits and positions agree after every change. 1: one
control's purpose must be guessed, or the start state already shows the changed state. 0: a control has no visible
effect or no purpose on the page, or labels and positions disagree. Name the control and what you did.

## Text, figure and task tell the same

```rubric
id: explainer-text-figure-agree
```

Unit: a figure or component with the text around it. 2: the same numbers and the same whole in text, figure and task,
an announced switch to another example, and only tools and views the page has. 1: a switch of numbers without notice.
0: the text names a view, a tool or a control the page does not have, or describes another figure. Quote the text and
say what the figure shows.

## One new step per page

```rubric
id: explainer-one-step
```

Unit: a page. 2: one new step; nothing of a later competency or page; one example per box. 1: a second method or
several examples in one box. 0: content of a later competency in its text, figures or exercises or its options (e.g. a
case the next page introduces), or two competencies of their own on one page. Name what belongs elsewhere.

## A solution step explains

```rubric
id: explainer-steps-explain
```

Unit: an exercise with steps or a worked example. Read the steps of three tasks. 2: each step uses the task's numbers
and gives its reason; given values are worked out. 1: a step without its reason, or a given value as an unworked term.
0: a step that only says to apply a rule ("Setze die Angaben in die Regel ein"). Quote the step.

## Headings say what the section does

```rubric
id: explainer-honest-headings
```

Unit: a page. 2: every title fits its section; "Ausprobieren" only where learners operate something. 1: one title that
does not fit. 0: "Ausprobieren" or a like title over a section with nothing to operate, on several pages. Name the
section.

## Address fits the age

```rubric
id: explainer-age-appropriate
```

Unit: a page. 2: tone, examples and length fit the grade (younger learners: short sentences, things from their day; older learners:
not childish, situations of their world, a denser text is fine). 1: a passage too hard or too childish. 0: the page
as a whole misses the grade. Quote the passage.
