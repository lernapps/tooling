# Patterns by subject

- A start, not a rule. Columns: idea; what learners see and do; how it is expressed.
- Means: explainer blocks (`figure` `hundred-grid`/`bar`/`image`, `labelled-figure`, `table`, `timeline`, `formula`
  with `\ce{…}`/`\pu{…}`, `definition`, `quote`, `code`); question types (`single-choice`, `multiple-choice`,
  `true-false`, `number`, `ordering`, `matching`); `generated` (task per seed, `given` or data-file records,
  `mistakes`, optional drawn figure); component (`vue-component` + `nojs`) last, each with a static form first.
- New pattern in an app → its content guide, with example and data file.

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

- Recommended; keep alike across the app's pages.
- Maths, sciences: Warum, Regel (formula, figure), Beispiel (`example` box), Übung.
- History: Quelle (`quote`), Einordnung, Zeitleiste (`timeline` from data), Übung (ordering or `generated`).
- Biology, geography: Überblick, Aufbau (`labelled-figure`), Funktion (`table`), Übung (matching).
- Computer science: Idee, Beispiel, Code (`code`), Übung (output of the code).
- Quiz: one round per chapter, questions in the patterns above a question type can express.

## Figures

- Shows what the text next to it says; caption: what to look at; `alt`: what it shows (`explainer-figure-explains`).
- Drawn from the given, never the answer (`explainer-figure-hides-answer`).
- Bundled; nothing from other servers before a click (`no-request-before-click`); others' images with source and
  licence (`third-party-licence`).
- Works at 360 px: trees top to bottom; too wide → table, or split by stage.
- Same conventions (colours, labels, units, orientation) across the app; write them into the guide, "Figures".
