# Exercises

- Every page at least one, best in a last section "Übung".
- What counts as right and each wrong answer's feedback: from "Content method" of the plan.
- Wrong answer gets the most specific reason: chosen option's `info`, a matching `mistakes` entry (`generated`;
  `number` with `answer`, `message`), the `hint`, else "look again". Write `info` per wrong option, 2–3 mistakes,
  a `hint`.

## Quiz types

- `single-choice`, `multiple-choice`, `true-false`, `number`, `ordering`, `matching`: blocks with the quiz fields
  (`id`, `type`, `text`, `explanation`, `links`, type fields). Fields and how to write them: skill
  `lernapps-content-questions`.

```yaml
- type: ordering
  id: staende-ordnen
  text: Bringe die Stände in ihre Rangfolge, den ersten Stand zuerst.
  items: [die Geistlichen, der Adel, alle anderen]
  explanation: Der erste Stand waren die Geistlichen, der zweite der Adel, der dritte alle anderen.
  links:
    - { title: Ständegesellschaft (Wikipedia), url: "https://de.wikipedia.org/wiki/Ständegesellschaft" }
```

## `generated`

- New task per seed.
- `given`: `int: [min, max]` + `step`; `decimal: [min, max]` + `step`; `oneOf: [...]`; `pick: <n>` `from:` list or
  `{ data: <name> }` (`distinct: true`; `pick: 1` = one record).
- `where`: boolean expressions; failing draws are redrawn.
- `task`: `text`. A figure that changes with the task: an exercise component (`components.md`).
- `answer`: `value` (expression) and `compare`: `number` or
  `{ number: { format: integer|decimal|money|percent, decimals, tolerance, unit } }`, `{ choice: <options> }`,
  `order`, `pairs` or `{ pairs: { left, right } }`.
- `mistakes`: `value` + `message` each. `hint`, `steps`: help, the way to the solution.
- Expressions (no eval): exact fractions, `+ - * /`, parentheses, `== != < <= > >=`, `and`, `or`, `not`, strings,
  fields (`e.year`), index (`xs[0]`), lists, `round(x, n)`, `decimals`, `map(xs, field)`,
  `sortBy(xs, field)`, `reverse`.

### Placeholders

- Always two braces around a declared name or field: `{{G}}`, `{{e.name}}`, `{{answer}}` in steps. Prose and
  formulas alike.
- One brace is never a placeholder: `G`, `{G}`, `\frac{W}{G}` are letters. Group around a value stays:
  `$\frac{{{W}}}{{{G}}} \cdot 100 = {{answer}}$`.
- Build fails on: undeclared name; `{G}` or `{{ G }}` in prose; a `given` variable nothing uses (`where` does not
  count); a placeholder left after filling.

```yaml
- type: generated
  id: prozentwert-ueben
  given:
    G: { int: [150, 1500], step: 5 }
    p: { oneOf: [5, 10, 12, 15, 20, 25, 30, 40] }
  where: ["decimals(G * p / 100) <= 2"]
  task:
    text: "Ein Fahrrad kostet {{G}} €. Im Angebot gibt es {{p}} % Rabatt. Wie viel Euro sparst du?"
  answer: { value: "G * p / 100", compare: { number: { format: money } } }
  mistakes:
    - { value: "G * p", message: "Du hast vergessen, durch 100 zu teilen: {{p}} % sind {{p}} Hundertstel." }
    - { value: "G - G * p / 100", message: "Das ist der neue Preis, nicht der Rabatt." }
  hint: "Rechne erst 1 % aus: {{G}} € geteilt durch 100."
  steps:
    - '$W = \frac{G \cdot p}{100}$'
    - '$W = \frac{{{G}} \cdot {{p}}}{100} = {{answer}}$, also {{answer}} € Rabatt.'
```

- Data-file example: `given: { events: { pick: 3, distinct: true, from: { data: ereignisse } } }`,
  `where: ["events[0].date != events[1].date"]`, `answer: { value: "map(sortBy(events, date), title)", compare: order }`,
  mistake `map(reverse(sortBy(events, date)), title)`.

### Property test (200 fixed seeds; first problem with its seed)

- `where` holds in at least 1 of 10 draws.
- Answer defined, in its format, passes its own comparator.
- No mistake equals the answer (`for seed 17 the mistake equals the answer (20); …`); each mistake is enterable.
- Same task for the same seed; no placeholder left.
- Mistake equal to the answer for some values = range too wide (`G - G * p / 100` = `G * p / 100` at 50 %: so `p`
  ≤ 40).

## Examples

- Any exercise: `examples: { accepted, rejected }`, checked by the build, never shown. `generated`: expressions of
  `given` and `answer`, checked per seed (e.g. `reverse(answer)`).
