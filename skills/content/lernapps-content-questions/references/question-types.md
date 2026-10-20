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
- Optional `examples: { accepted, rejected }`: options and items by index from 0 or German text; numbers as number or
  as typed (`"12,5"`; point = decimal mark: `8900`, never `8.900`). Build checks them; learners never see them.
  Mistakes and wrong options' `info` already count as rejected.

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
