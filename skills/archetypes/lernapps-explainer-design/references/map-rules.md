# Explainer rules for the place on the learning map

"Map the content" of the skill says how to place an app on the map. These rules say what `lernapps check`, the
listing and the review hold it to. Read the section of the rule a finding names.

Contents: `one-competency-per-page`, `prerequisites-in-order`, `competencies-on-map`, `content-matches-competencies`,
`recap-names-competencies`.

## `one-competency-per-page`: One page per competency

```rule
id: one-competency-per-page
scope: tooling
severity: hint
```

- Each page teaches one competency of the map: `competencies` holds one id. Several pages for one large competency
  are fine.

## `prerequisites-in-order`: Prerequisites come before the page that needs them

```rule
id: prerequisites-in-order
scope: tooling
severity: warning
```

A learner who meets a page without what it builds on is stuck, and the map shows which pages those are.

- Each direct prerequisite (`requires` in the map) of a page's competency is one of these: practised on that page or
  an earlier one; repeated on a recap page before it; or named in the page's text with a link to its page on the map,
  `https://lernapps.net/apps/map/<subject>/c/<id>/`. The prerequisites of a recapped competency do not count.
- A page that comes before its prerequisite on purpose names it in `ahead: [<id>]`, and another page of the app
  practises it. A recap page or a link is not enough for `ahead`.
- A finding names the page, the prerequisite and its kind:
  - order: the app has it, but later. Move the pages.
  - gap: the app lacks it, but practises something that builds on it. Practise it in between, or recap or link it.
  - entry: nothing of its chain is in the app. Add a recap page before the page, or a link.
  - ahead: named in `ahead`, but no page practises it, or no competency of the page requires it. Practise it, or
    remove it from `ahead`.
- In a subject with `explainerFocus: competency` a finding is a warning, else a hint. At the listing, order and gap
  are errors there.

## `competencies-on-map`: The strand or subject and the page competencies are on the map

```rule
id: competencies-on-map
scope: tooling
severity: warning
```

- `strand` in `src/app.yaml` is a strand of the subject's map, and each page's `competencies` are ids of that strand.
- `subject` (a unit app) only where the subject's map says `explainerFocus: competency`. Its pages may take ids of
  every strand of the subject, but the ids of one page belong to one strand.
- Each competency of a recap page (`recap`) is on the map, of any strand, and the app does not practise it on a page
  of its own.
- At the listing each of these is an error of the catalog (`entry-learning-map`).

## `content-matches-competencies`: Each page teaches its competencies

```rule
id: content-matches-competencies
scope: tooling
severity: hint
```

- A page teaches what the "Ich kann …" sentence (`iCan`) of its competencies says in the map: not clearly more, and
  not something else. The review reads each page with that sentence.
- More to teach belongs on a page of the competency that says it. If the map has none, propose it to `lernapps/apps`
  (`map/<subject>.yaml`); never invent a competency in the app.

## `recap-names-competencies`: A recap page names each competency it repeats

```rule
id: recap-names-competencies
scope: tooling
severity: warning
```

The runtime puts only a link with the competency's id at the top of a recap page. What the learner should already
know, the page's text has to say.

- The text names each competency of `recap`, with its name (`name.de`) or its "Ich kann …" sentence (`iCan`) from
  `https://lernapps.net/apps/map/<subject>.json`. Best as a short self-check at the start of the page.
