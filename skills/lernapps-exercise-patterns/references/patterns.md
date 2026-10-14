# Patterns that worked, by subject

A catalogue to start from, not a rule. Each pattern names the idea, what learners see and do, and how it is expressed
with the archetypes' means:

- **blocks** of the explainer: `figure` with a drawn kind (`hundred-grid` with `filled`, `bar` with `part` and
  `whole`) or a bundled `image` (an SVG in `src/images/`), `labelled-figure`, `table`, `timeline`, `formula`
  (with `\ce{…}` and `\pu{…}` for chemistry and units), `definition`, `quote`, `code`;
- **question types** of the quiz, also exercises of the explainer: `single-choice`, `multiple-choice`, `true-false`,
  `number`, `ordering`, `matching`;
- **`generated`** exercises of the explainer: a new task per seed, from `given` values or the records of a data file,
  with `mistakes` and an optional drawn figure;
- a **component** (`vue-component` with its `nojs` text) where learners change a value and watch the idea respond.
  It is the last resort: each one below has a static form first, which stays when the component is left out.

A pattern that is new to an app goes into its content guide with a concrete example and its data file.

## Mathematics

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Part of a whole (percent, fractions) | a 10×10 grid with the part filled; compute the part, the whole or the rate | `figure` `hundred-grid`; `generated` with `task.figure: { kind: hundred-grid, filled: p }`, `compare: { number: { format: percent } }` |
| Before and after a change | two bars, old and new value; compute the change or the new value | `figure` `bar` (`part`, `whole`); `generated` with the typical mistake "added the rate instead of the amount" |
| Product of brackets (binomial formulas) | a rectangle split into a², ab, ab, b², lengths from the task | `image` (SVG) for the rule; `generated` for the task; a component only for lengths that follow the task |
| Difference of squares | a² − b² as an L-shape, rearranged into (a + b)(a − b) | two `image`s side by side with captions; `ordering` of the steps |
| Outcome set (Laplace) | die faces, wheel sectors or balls, the favourable ones marked | `table` or `image`; `generated` drawing from a data file of experiments, answer as a fraction |
| Multi-stage experiment | a tree from top to bottom with branch probabilities; multiply along a path | `image` (SVG) of the tree; `generated` with the path rule; a clickable tree as a component |
| Drawing without replacement | an urn before and after one ball is taken | two `image`s; `generated` with `pick: 2, distinct: true` from a data file of balls |
| Unit conversion | a value with one unit; give it in another | `generated` with `compare: { number: { unit } }` and the mistake "factor in the wrong direction" |

## Physics

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Circuit symbols | the symbol of a part and its name and function | `table` from a data file of parts; `matching` symbol ↔ part; `generated` `pick` from the data file |
| Series and parallel circuit | two circuits with the same parts; where is the current larger | `labelled-figure` of both schematics; `single-choice` with the reason in each option's `info`; `ordering` of currents |
| Ohm's law and quantities | U, R and I of a circuit; compute the missing one with its unit | `formula` `U = R \cdot I`; `generated` with `\pu{…}` units, `where` for realistic values, mistakes "U · I instead of U / I", "mA not converted" |
| Linear motion | s-t and v-t graphs side by side; read off or compute speed | `image` of the graphs with a `table` of values; `generated` for s = v · t; a component with a slider for v |
| Lever and moment | a beam with weights at distances; does it balance | `image` of the beam; `generated` for F₁ · a₁ = F₂ · a₂; a component with draggable weights |
| Optics | a ray diagram of a convex lens; where the image forms | `labelled-figure` of the rays; `true-false` on image properties; a component with a draggable object |
| Density | blocks of equal mass and different volumes; float or sink | `table` from a data file of materials; `generated` with `compare: { choice: [schwimmt, sinkt] }` |

## Chemistry

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Particle model | the states of matter as dots with their spacing | three `image`s with captions; `matching` state ↔ description; a component with a temperature slider |
| Atom model | shells with electrons for the elements 1 to 20, valence electrons marked | a data file of elements (protons, shells, valence electrons); `generated` `pick: 1` with a number answer |
| Reaction equations | atom counts left and right; balance by coefficients | `formula` with `\ce{…}`; `number` or `generated` asking one coefficient from a data file of reactions; a component that shows the counts |
| Stoichiometry | mol, g and particles as three boxes with the molar mass between them | `formula` with `\pu{…}`; `generated` from a data file of substances, the mistake "multiplied instead of divided by M" |
| pH scale | a coloured scale; where substances lie | `image` of the scale; `ordering` of substances by pH from a data file |

## Biology and geography

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Parts and functions | an organ, a cell or a landscape with numbered parts | `labelled-figure`; `table` of parts and functions from a data file; `matching` part ↔ function |
| Classification | living things or places by a feature | `multiple-choice` "which of these are …"; `generated` `pick` from a data file with a `{ set: … }` answer |

## History

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Source and context | a quotation with its origin; what it says about its time | `quote` with `origin`, `source` and `licence`; `single-choice` on its meaning |
| Chronology | events on a timeline; put them in order | `timeline` from a data file of events; `generated` with `pick: 3, distinct: true` and `compare: order` |

## Computer science

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Reading code | a short program; what it prints | `code`; `single-choice` or `number` on its output |
| Number systems | a number in binary; convert it | `generated` with `int` drawn and the answer computed; the mistake "read from the wrong end" |

## Page structures (explainer)

Recommended, not required; choose the sections that fit the topic and keep them alike across the app's pages:
- **Mathematics and the sciences:** Warum, Regel, Beispiel, Übung: why it matters, the rule with its formula and a
  figure, a worked example in an `example` box, then the exercise.
- **History:** Quelle, Einordnung, Zeitleiste, Übung: a `quote` from a source, its context, a `timeline` from a data
  file, then an ordering or `generated` events exercise.
- **Biology and geography:** Überblick, Aufbau, Funktion, Übung: a `labelled-figure` of the parts, a `table` of what
  each does, then a matching exercise.
- **Computer science:** Idee, Beispiel, Code, Übung: the idea in prose, a worked example, a `code` block, then an
  exercise on what the code gives.

A quiz groups its questions into rounds the same way: one round per chapter of competencies, its questions in the
patterns above that a question type can express.

## Figures that teach

- A figure earns its place when it shows what the text next to it says; the caption says what to look at, the `alt`
  text what it shows (`explainer-figure-explains`).
- Draw from the task's given values, never from its answer (`explainer-figure-hides-answer`).
- Bundle every image; nothing loads from another server before a click (`no-request-before-click`). Name source and
  licence of an image you did not make (`third-party-licence`).
- Mobile first: it works at 360 px. A tree runs from top to bottom; one too wide for 360 px becomes a table, or is
  split into its stages.
- Keep a figure's conventions (colours, labels, units, orientation) the same across the app, and write them into the
  content guide, part "Figures".
