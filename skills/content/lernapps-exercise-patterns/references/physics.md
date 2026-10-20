# Patterns: Physics

- A start, not a rule. Columns: idea; what learners see and do; how it is expressed.
- Means: explainer blocks (`figure` `hundred-grid`/`bar`/`image`, `labelled-figure`, `table`, `timeline`, `formula`
  with `\ce{…}`/`\pu{…}`, `definition`, `quote`, `code`); question types (`single-choice`, `multiple-choice`,
  `true-false`, `number`, `ordering`, `matching`); `generated` (task per seed, `given` or data-file records,
  `mistakes`, optional drawn figure); component (`vue-component` + `nojs`) last, each with a static form first.
- New pattern in an app → its content guide, with example and data file.

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Circuit symbols | the symbol of a part and its name and function | `table` from a data file of parts; `matching` symbol ↔ part; `generated` `pick` from the data file |
| Series and parallel circuit | two circuits with the same parts; where is the current larger | `labelled-figure` of both schematics; `single-choice` with the reason in each option's `info`; `ordering` of currents |
| Ohm's law and quantities | U, R and I of a circuit; compute the missing one with its unit | `formula` `U = R \cdot I`; `generated` with `\pu{…}` units, `where` for realistic values, mistakes "U · I instead of U / I", "mA not converted" |
| Linear motion | s-t and v-t graphs side by side; read off or compute speed | `image` of the graphs with a `table` of values; `generated` for s = v · t; a component with a slider for v |
| Lever and moment | a beam with weights at distances; does it balance | `image` of the beam; `generated` for F₁ · a₁ = F₂ · a₂; a component with draggable weights |
| Optics | a ray diagram of a convex lens; where the image forms | `labelled-figure` of the rays; `true-false` on image properties; a component with a draggable object |
| Density | blocks of equal mass and different volumes; float or sink | `table` from a data file of materials; `generated` with `compare: { choice: [schwimmt, sinkt] }` |
