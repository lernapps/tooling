---
name: lernapps-explainer
description: Use in Code of a lernapps.net explainer whenever you write or change its content in src/ - a chapter, page, block, figure, formula, exercise, data file, language or component - or a build or runtime test of the explainer fails. What a page looks like in YAML, the mistakes that most often fail the build, and which reference holds the notation of structure, blocks, exercises and components.
license: MIT
---

# Explainer

You write the content as YAML in `src/`: `app.yaml`, a folder per chapter with its `chapter.yaml` and one file per
page, data files in `src/data/`, images in `src/images/`. The runtime `@lernapps/app-templates` makes everything else
from it: pages, navigation, formulas, figures, exercises with feedback, the page without JavaScript and the tutor
pages. You write a Vue component only where the plan names one.

`create` wrote a placeholder with one chapter, one page and one exercise. Replace it with the planned content. A
complete chapter to look things up in is `node_modules/@lernapps/app-templates/explainer/src/prozent/`.

## A page

```yaml
# yaml-language-server: $schema=../../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v2.schema.json
title: Prozentwert
description: "Den Prozentwert berechnen: mit einem Beispiel und dem Hunderterfeld."
competencies: [prozent-prozentwert]
blocks:
  - type: section
    id: beispiel
    title: Beispiel
    blocks:
      - type: text
        text: Ein Skateboard kostet 250 €. Es gibt 12 % Rabatt. Wie viel Euro sparst du?
      - type: figure
        draw: { kind: hundred-grid, filled: 12 }
        alt: Ein Hunderterfeld mit 100 Kästchen, 12 davon sind gefärbt.
        caption: Die 12 gefärbten Kästchen sind 12 % des Ganzen.
      - type: formula
        formula: 'W = \frac{250 \cdot 12}{100} = 30'
  - type: section
    id: uebung
    title: Übung
    blocks:
      - type: single-choice
        id: grundwert-erkennen
        text: Was ist beim Skateboard der Grundwert?
        options:
          - text: 250 €
            correct: true
            info: Der volle Preis ist das Ganze, also 100 %.
          - text: 12 %
            correct: false
            info: "12 % ist der Prozentsatz: Er sagt, welcher Anteil gemeint ist."
          - text: 30 €
            correct: false
            info: 30 € ist der Prozentwert, also der Teil des Ganzen.
        explanation: Der Grundwert ist das Ganze, von dem ein Anteil genommen wird.
        links:
          - title: Prozentrechnung (Wikipedia)
            url: "https://de.wikipedia.org/wiki/Prozentrechnung"
      - type: generated
        id: prozentwert-ueben
        given:
          G: { int: [150, 1500], step: 5 }
          p: { oneOf: [5, 10, 12, 15, 20, 25, 30, 40] }
        where: ["decimals(G * p / 100) <= 2"]
        task:
          text: "Ein Fahrrad kostet {{G}} €. Es gibt {{p}} % Rabatt. Wie viel Euro sparst du?"
        answer: { value: "G * p / 100", compare: { number: { format: money } } }
        mistakes:
          - value: "G * p"
            message: "Du hast vergessen, durch 100 zu teilen: {{p}} % sind {{p}} Hundertstel."
        hint: "Rechne erst 1 % aus: {{G}} € geteilt durch 100."
        steps:
          - '$W = \frac{{{G}} \cdot {{p}}}{100} = {{answer}}$, also {{answer}} € Rabatt.'
```

A new page is listed in `pages` of its `chapter.yaml`, a new chapter in `chapters` of `src/app.yaml`.

## Before the first page

These fail the build or the check most often. Each line says what to write instead.

- **A text with `: ` or a comma.** YAML reads `info: 12 % ist der Prozentsatz: Er sagt …` as a map, and a comma ends
  a value inside `{ … }` or `[ … ]`. Put such a text in double quotes, and write options, mistakes and table rows
  with text in block style, as above. Quote a text that looks like a number too (`"8."`, `"0"`, `"01000001"`).
- **Formulas.** Only the commands listed in [references/blocks.md](references/blocks.md) ("Formulas"): `\overline`,
  `\cdots` and `\ldots` are not among them. Write a formula in single quotes.
- **Every option has `text`, `correct` and `info`; every question has `explanation`.** The schema requires them;
  `links` is optional (rule `quiz-further-reading`). A table cell is never empty, a header cell neither.
- **Headings.** A heading is a `section` block with `id` and `title`, never a Markdown heading in a text.
- **`generated`.** No mistake may give the same number as the answer for any drawn values: narrow the range of
  `given` until it cannot. Keep the answer within the decimals its format allows (`where: ["decimals(…) <= 2"]`).
  Placeholders have two braces: `{{G}}`.
- **Text load.** At most 350 words to read on a page and at most 4 text blocks in a row; something to look at or do
  within the first 4 blocks (`explainer-text-load`).
- **Width.** A table with more than three columns and a long formula overflow at 360 px: split the table, break the
  formula into steps.
- **A formula in `matching`.** A side that is only a formula has no name for a screen reader: add a word to it.
- **Writing a page through the shell.** A heredoc with an unquoted delimiter replaces `$…` and `\`. Use your file
  tool, or `<<'EOF'`.

After each page, run `npx vp build`: a problem is one line `file:line: place (language): what to do`. Fix where it
points, then go on. Before each commit, run `npx vp check --fix`: it formats the YAML, which the commit hook
otherwise rejects. `npx --no -- lernapps check` runs everything and names the rule of each finding.

## Read when

- [references/blocks.md](references/blocks.md): before the first page. The blocks and their fields, formulas, images,
  videos, languages, data files.
- [references/exercises.md](references/exercises.md): before the first exercise. `generated`, `open-task`, and what a
  wrong answer is told.
- [references/structure.md](references/structure.md): before you add or move a chapter or page, and for the fields
  that put the app on the learning map (`strand`, `competencies`, `recap`, `ahead`, `scope`).
- [references/language-tasks.md](references/language-tasks.md): before an exercise or the words of a page in a foreign
  language.
- [references/components.md](references/components.md): only when the plan names a component.
- [references/runtime.md](references/runtime.md): when a runtime test fails, for the addresses of pages, and before
  you write `scope` or rules for the tutor.
- [references/rules.md](references/rules.md): when a finding names an `explainer-*` rule. Each rule is a short
  section under its id.
- Questions with options: skill `lernapps-content-questions`. The self-assessment (`selfAssessment`) comes in Commit,
  with skill `lernapps-explainer-self-assessment`.
