# Patterns: Mathematics

- A start, not a rule. Columns: idea; what learners see and do; how it is expressed.
- Means: explainer blocks (`figure` `hundred-grid`/`bar`/`image`, `labelled-figure`, `table`, `timeline`, `formula`
  with `\ce{…}`/`\pu{…}`, `definition`, `quote`, `code`); question types (`single-choice`, `multiple-choice`,
  `true-false`, `number`, `ordering`, `matching`); `generated` (task per seed, `given` or data-file records,
  `mistakes`, optional drawn figure); component (`vue-component` + `nojs`) last, each with a static form first.
- New pattern in an app → its content guide, with example and data file.

| Idea | Learners see and do | Expressed with |
|---|---|---|
| Part of a whole (percent, fractions) | a 10×10 grid with the part filled; compute the part, the whole or the rate | `figure` `hundred-grid` on the page; `generated` with `compare: { number: { format: percent } }`; a figure that changes with the task: an exercise component |
| Before and after a change | two bars, old and new value; compute the change or the new value | `figure` `bar` (`part`, `whole`) on the page; `generated` with the typical mistake "added the rate instead of the amount" |
| Product of brackets (binomial formulas) | a rectangle split into a², ab, ab, b², lengths from the task | `image` (SVG) for the rule; `generated` for the task; a component only for lengths that follow the task |
| Difference of squares | a² − b² as an L-shape, rearranged into (a + b)(a − b) | two `image`s side by side with captions; `ordering` of the steps |
| Outcome set (Laplace) | die faces, wheel sectors or balls, the favourable ones marked | `table` or `image`; `generated` drawing from a data file of experiments, answer as a fraction |
| Multi-stage experiment | a tree from top to bottom with branch probabilities; multiply along a path | `image` (SVG) of the tree; `generated` with the path rule; a clickable tree as a component |
| Drawing without replacement | an urn before and after one ball is taken | two `image`s; `generated` with `pick: 2, distinct: true` from a data file of balls |
| Unit conversion | a value with one unit; give it in another | `generated` with `compare: { number: { unit } }` and the mistake "factor in the wrong direction" |
| Sides and angles in a right triangle (trigonometry) | a right triangle, the angle α marked, its sides named from α (Gegenkathete, Ankathete, Hypotenuse); compute a side from an angle and a side, or an angle from two sides | `image` (SVG) of the triangle with the right angle and α marked, the sides labelled; `formula` with `\sin`, `\cos`, `\tan`, `\arcsin`, Greek letters and `^\circ`; `generated` with `sin`/`cos`/`tan`, `asin`/`acos`/`atan` (degrees) and `sqrt`, answer rounded (`round`, `decimals`, `tolerance`); mistakes: opposite and adjacent side swapped (`cos` instead of `sin`), calculator in radians (the value of `sin` of α taken as radians), sin⁻¹ confused with 1/sin; a triangle that changes with the task: an exercise component |

## Example: a side in a right triangle

```yaml
- type: generated
  id: gegenkathete-berechnen
  given:
    c: { int: [5, 20] }
    alpha: { int: [20, 70], step: 5 }
  task:
    text: "In einem rechtwinkligen Dreieck ist die Hypotenuse c = {{c}} cm lang, der Winkel α = {{alpha}}°. Wie lang ist die Gegenkathete a von α? Runde auf eine Stelle nach dem Komma."
  answer:
    value: "round(c * sin(alpha), 1)"
    compare: { number: { format: decimal, decimals: 1, tolerance: 0.1, unit: cm } }
  mistakes:
    - { value: "round(c * cos(alpha), 1)", message: "Das ist die Ankathete: die Gegenkathete liegt α gegenüber, also Sinus." }
    - { value: "round(c * sin(alpha * 57.29578), 1)", message: "Dein Taschenrechner rechnet im Bogenmaß (RAD): stelle ihn auf Grad (DEG)." }
    - { value: "round(c / sin(alpha), 1)", message: "sin α = a : c, also a = c · sin α: mal, nicht geteilt." }
```

An angle from two sides: `answer: { value: "round(asin(a / c), 1)" }`, in degrees. Mistakes: opposite and adjacent
swapped (`round(acos(a / c), 1)`, the other angle); sin⁻¹ taken as 1 : sin (`round(c / a, 1)`: "sin⁻¹ ist die
Umkehrfunktion, nicht 1 : sin"). A mistake value must have a value: `asin(c / a)` with c > a has none.
