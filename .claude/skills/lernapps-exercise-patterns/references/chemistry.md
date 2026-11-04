# Patterns: Chemistry

- A start, not a rule. Columns: idea; what learners see and do; how it is expressed.
- Means: explainer blocks (`figure` `hundred-grid`/`bar`/`image`, `labelled-figure`, `table`, `timeline`, `formula`
  with `\ce{…}`/`\pu{…}`, `definition`, `quote`, `code`); question types (`single-choice`, `multiple-choice`,
  `true-false`, `number`, `ordering`, `matching`); `generated` (task per seed, `given` or data-file records,
  `mistakes`, optional drawn figure); component (`vue-component` + `nojs`) last, each with a static form first.
- New pattern in an app → its content guide, with example and data file.

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Particle model | the states of matter as dots with their spacing | three `image`s with captions; `matching` state ↔ description; a component with a temperature slider |
| Atom model | shells with electrons for the elements 1 to 20, valence electrons marked | a data file of elements (protons, shells, valence electrons); `generated` `pick: 1` with a number answer |
| Reaction equations | atom counts left and right; balance by coefficients | `formula` with `\ce{…}`; `number` or `generated` asking one coefficient from a data file of reactions; a component that shows the counts |
| Stoichiometry | mol, g and particles as three boxes with the molar mass between them | `formula` with `\pu{…}`; `generated` from a data file of substances, the mistake "multiplied instead of divided by M" |
| pH scale | a coloured scale; where substances lie | `image` of the scale; `ordering` of substances by pH from a data file |
