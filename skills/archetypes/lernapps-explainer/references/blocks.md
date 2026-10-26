# Blocks

- A page = list of blocks from a closed set. Every text field: text or language map.
- Prose: restricted Markdown: paragraphs, `**bold**`, `*italics*`, lists, links, line breaks, `$…$`.
- No headings (use `section`), HTML, images, code, quotes, tables in Markdown: each has its block.
- App-internal links start with `/` (`/prozent/grundwert/#regel`); the build checks them.

| `type` | Fields | Shows |
|---|---|---|
| `section` | `id`, `title`, `blocks` | heading and blocks |
| `text` | `text` | prose |
| `formula` | `formula` (LaTeX subset, no `$`) | formula on its own line, MathML |
| `figure` | `draw` (`hundred-grid` with `filled`, `bar` with `part`, `whole`) or `image` (`images/<name>.svg`, `source`, `licence`); `alt`, `caption` | inline SVG or bundled image |
| `labelled-figure` | `image`, `alt`, `caption`, `labels` (`x`, `y` in %, `text`), `source`, `licence` | image with numbered markers and legend |
| `table` | `caption`, `header`, `rowHeaders`, `rows` | table with caption |
| `timeline` | `events` (`date`, `title`, `label`, `text`) or `data` | dated events, earliest first |
| `definition` | `term`, `explanation` | term in place, in the glossary |
| `quote` | `text`, `origin` (`author`, `work`, `year`), `source`, `licence` | quotation with origin |
| `code` | `language` (bash, c, css, html, java, javascript, json, plaintext, python, sql, typescript), `code`, `caption` | highlighted code |
| `example`, `note` | `title`, `blocks` | box: worked example, hint |
| `video` | `youtube` (the 11-character id, not the address), `title`, `channel` (both as on YouTube, plain strings) | YouTube video behind two clicks: link, channel, privacy note; player only after a click |
| exercises | quiz's six types, `generated` | `exercises.md` |
| `vue-component` | `component`, `props`, `nojs` | `components.md` |

```yaml
- type: section
  id: regel
  title: Regel
  blocks:
    - type: formula
      formula: 'W = \frac{G \cdot p}{100}'
    - type: definition
      term: Prozentwert
      explanation: Der Prozentwert $W$ ist der Anteil am Ganzen, in der Einheit des Grundwerts.
    - type: figure
      draw: { kind: hundred-grid, filled: 12 }
      alt: Ein Hunderterfeld mit 100 Kästchen, 12 davon sind gefärbt.
      caption: Die 12 gefärbten Kästchen sind 12 % des Ganzen.
```

- Images in `src/images/`; `source` (URL or citation), `licence` (SPDX id, e.g. `CC-BY-SA-4.0`, or `gemeinfrei`).
  Several languages: a citation is a language map; a URL one string.

## Videos

- YouTube only, explainer only (not in a quiz question's `material`). No thumbnail, no video files in the bundle.
- `title`, `channel`: as YouTube names them, in the video's language; the page's language does not change them.
- What the learner should notice in the video: a `text` block before it; the block has no note field.
- An app with a video loads from another server after a click: its catalog entry says `fitness.thirdParty: on-click`,
  and with the choice "Videos immer direkt laden" also `fitness.storage: device`.

```yaml
- type: video
  youtube: rkLmLaFHodo
  title: einstufiger Zufallsversuch | Wahrscheinlichkeitsrechnung - einfach erklärt
  channel: Lehrerschmidt
```

## Formulas

- LaTeX subset → MathML; `formula` block or inline `$…$`.
- Commands: `\frac`, `\cdot`, `\times`, `\div`, `\%`, `\text`, `^`, `_`, `\sqrt`, `\approx`, `\pm`, `\le`, `\ge`,
  `\neq`, `\,`, parentheses, braces (`\{`, `\}`).
- Chemistry (mhchem): `\ce{2H2 + O2 -> 2H2O}`, `\ce{CO2 + H2O <=> H2CO3}`, units `\pu{123 kJ/mol}`.
- Other command or parse error → build fails with the place.
- YAML formulas in single quotes. Same in every language unless `\text{…}` differs (then a map).

## Languages

- `languages` in `src/app.yaml`, German first: `[de]` or `[de, en]` (runtime texts: de, en).
- A string = German, enough only while German is the only language. Else every text a map:
  `title: { de: Die drei Stände, en: The three estates }`.
- Build fails on a missing translation (`the translation is missing; write the text as a map: { de: …, en: … }`)
  and an undeclared language.
- Same in every language: ids, addresses, numbers, formulas, drawn figures.
- Trees: German at root, others under `/<language>/`; `lang`, `hreflang`, plain-link switch.

## Data files

- `src/data/<name>.yaml`: list of records, same lowercase fields; values number, boolean, text (map if several
  languages).
- Used by `timeline` (`data: ereignisse`) and `generated` (`from: { data: elemente }`). Each fact once, there.
