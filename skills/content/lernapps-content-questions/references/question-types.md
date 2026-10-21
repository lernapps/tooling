# Question types

| `type` | You write |
|---|---|
| `single-choice` | `options`: exactly one `"correct": true`; `info` each, `link` where useful |
| `multiple-choice` | `options`: at least one correct; `info` each, `link` where useful |
| `true-false` | `answer` (true or false) |
| `number` | `answer`, `tolerance` (0 = exact), `unit` if any; the learner may type a comma or a point |
| `ordering` | `items` in the right order; the page mixes them |
| `matching` | `pairs` as they belong; the page mixes the right side |

- Every question: `id`, `text`, `explanation`, at least one link in `links`. Optional quiz `sources`.
- Types without options carry their background in `explanation`.
- Optional `material`: what the question shows between its text and its answers, a list of blocks: `text` (restricted
  Markdown), `formula`, `figure`, `labelled-figure`, `table`, `quote`, `code`. A `figure` is `image: images/<name>.svg`
  (or `.png`, `.jpg`, `.webp`; the file is in `src/images/`) or drawn from numbers (`draw`), with `alt` (what it
  shows), `caption` (what to look at) and, for an image, `source` and `licence` (`third-party-licence`). Use it where
  the question needs the content (what does the image show, what does the table say); not as decoration. The build
  fails for a missing file, a text missing in a language, raw HTML or a link to a page of the app.
- Optional `examples: { accepted, rejected }`: options and items by index from 0 or German text; numbers as number or
  as typed (`"12,5"`; point = decimal mark: `8900`, never `8.900`). Build checks them; learners never see them.
  Mistakes and wrong options' `info` already count as rejected.

```json
{
  "id": "ring",
  "type": "single-choice",
  "text": "Welche Form zeigt das Bild?",
  "material": [
    {
      "type": "figure",
      "image": "images/kreis.svg",
      "alt": "Ein blauer Kreis mit einem weißen Kreis in der Mitte",
      "caption": "Zwei Kreise mit demselben Mittelpunkt.",
      "source": "eigene Zeichnung",
      "licence": "CC0-1.0"
    }
  ],
  "options": [
    { "text": "Ein Ring", "correct": true, "info": "Ein Ring liegt zwischen zwei Kreisen mit demselben Mittelpunkt." },
    { "text": "Eine Ellipse", "correct": false, "info": "Eine Ellipse hat zwei Brennpunkte." }
  ],
  "explanation": "Die weiße Fläche in der Mitte macht aus der Kreisscheibe einen Ring.",
  "links": [{ "title": "Kreisring (Wikipedia)", "url": "https://de.wikipedia.org/wiki/Kreisring" }]
}
```

```json
{
  "id": "grand-canyon",
  "type": "single-choice",
  "text": "Welcher Fluss hat den Grand Canyon in den USA geformt?",
  "options": [
    {
      "text": "Colorado",
      "correct": true,
      "info": "Der Colorado ist der größte Fluss im Südwesten Nordamerikas. Er ist gut 2300 km lang.",
      "link": { "title": "Colorado River (Wikipedia)", "url": "https://de.wikipedia.org/wiki/Colorado_River" }
    },
    {
      "text": "Nil",
      "correct": false,
      "info": "Der Nil fließt durch mehrere Länder Afrikas und mündet in Ägypten ins Mittelmeer. Mit rund 6650 km gilt er als längster Fluss der Erde."
    }
  ],
  "explanation": "Der Grand Canyon ist eine steile Schlucht in Arizona, etwa 450 km lang. Der Colorado hat sie über Millionen von Jahren in das Gestein gegraben.",
  "links": [{ "title": "Grand Canyon (Wikipedia)", "url": "https://de.wikipedia.org/wiki/Grand_Canyon" }]
}
```
