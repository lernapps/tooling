# Structure

## Files

| Level | File | Holds |
|---|---|---|
| App | `src/app.yaml` | `format: 2`, `strand` or `subject`, `title`, `intro`, `languages`, the order of `chapters`, `sources` |
| Chapter | `src/<chapter>/chapter.yaml` | `title`, `summary`, the order of its `pages` |
| Page | `src/<chapter>/<page>.yaml` | `title`, `description`, `competencies` or `recap`, `blocks` |
| Section | a `section` block in a page | `id`, `title`, `blocks`; one more level of sections inside |

- `chapters` and `pages` list every folder and file exactly once, in reading order. Nothing is sorted by name.
- An app with one chapter hides it in the navigation; the addresses keep it (`/<chapter>/<page>/`).
- Ids: lower-case letters, digits and hyphens, unique per level, kept once published. Not allowed as a chapter id:
  `data`, `images`, `glossar`, `components`, `assets`, `scope`, `einschaetzung`.
- Depth: page, section, subsection. Headings follow from the nesting. A box (`example`, `note`) holds no sections.
- The runtime generates the navigation: contents on the start page and the chapter pages, breadcrumbs, previous and
  next across chapters, the contents of a page from three sections on, the glossary from `definition` blocks.

## The place on the learning map

Which strand, which competency on which page and which order: skill `lernapps-explainer-design` ("Map the content").
Here is how to write the result.

```yaml
# src/app.yaml
# yaml-language-server: $schema=../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v2.schema.json
format: 2
strand: mathematik/stochastik   # "<subject>/<strand>" of the map, or none
title: Stochastik
```

```yaml
# src/zufall/laplace.yaml
title: Laplace-Wahrscheinlichkeit
competencies: [laplace]         # the id of the map
blocks: [...]
```

| Field | Where | Value |
|---|---|---|
| `strand` | `src/app.yaml` | a strand app: `<subject>/<strand>`, or `none` for an app that is not on the map |
| `subject` | `src/app.yaml` | a unit app across strands: `<subject>`, instead of `strand`; only where the subject's map says `explainerFocus: competency` |
| `competencies` | every page | the ids of the map the page practises, as a rule one; with `strand: none` the page has none |
| `recap` | a recap page | `<subject>/<competency>`, or a list of them, instead of `competencies` |
| `ahead` | a page with `competencies` | the ids of prerequisites that come on a later page on purpose |

The build cannot know the ids of the map: `lernapps check` compares them with the map before the push.

### A recap page

A recap page repeats what the app needs but does not practise. It stands before the first page that needs it; a
chapter that needs several such competencies gets one recap page at its start, not one each.

```yaml
title: Das brauchst du hier
recap: [physik/kraft, physik/masse]   # one competency: recap: physik/kraft
blocks:
  - type: text
    text: |
      Kannst du das schon? Ich kann eine Kraft mit ihrem Betrag und ihrer Richtung angeben. Ich kann die Masse
      eines Körpers in Kilogramm angeben.
```

- It is short and has no new content. It needs no exercise: a self-check is plain text the learner answers in their
  head. One or two exercises to check what it repeats are allowed, a third is a build problem; they are not part of a
  self-assessment. Do not build a normal page with exercises that says it repeats something: use a recap page.
- Its text names each competency of `recap`, with its name or its "Ich kann …" sentence from
  `https://lernapps.net/apps/map/<subject>.json` (`recap-names-competencies`). The runtime adds the link to each
  competency on the map by itself.
- A competency the app practises on a page of its own gets no recap page.

## `scope`

- All or nothing: `scope` in `src/app.yaml` makes the build require a `scope` on every page; without it no page has
  one.
- The app needs it when it has an `open-task` (the tutor judges open answers by the scope, never from general
  knowledge) or when it follows the creator's material (the scope keeps the tutor to it). Else it is optional.
- How to write it: [runtime.md](runtime.md) ("Tutor") and rule `explainer-scope-matches`.

## What the build writes for the catalog

- `lernapps-pages.json`, beside `index.html`: the strand or subject and, per page in the app's order, its path, title
  and `competencies`, `ahead` or `recap`. The catalog lists the pages from it; you write no list of topics.
- An app made before the learning map has no `format` in `src/app.yaml`. `lernapps update` moves it to `format: 2`
  with `strand: none`.
