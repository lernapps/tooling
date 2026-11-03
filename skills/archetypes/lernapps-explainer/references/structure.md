# Structure

| Level | File | Holds |
|---|---|---|
| App | `src/app.yaml` | `title`, `intro`, `languages`, order of `chapters`, `sources` |
| Chapter | `src/<chapter>/chapter.yaml` | `title`, `summary`, order of its `pages` |
| Page | `src/<chapter>/<page>.yaml` | `title`, `description`, `blocks` |
| Section | `section` block in a page | `id`, `title`, `blocks`; one more section level inside |
| Scope | `scope` in app, chapter and page (optional) | the whole learning path for the tutor, beside each page (`runtime.md`) |

- Chapters mandatory. One chapter: hidden in navigation; addresses keep it (`/<chapter>/<page>/`).
- Order lists complete: `chapters`, `pages` list every folder or file exactly once. No sorting by name.
- Ids: lowercase, digits, hyphens; unique per level; stable once published. Not chapter ids: `data`, `images`,
  `glossar`, `components`, `assets`, `scope`.
- Depth: page, section, subsection; headings follow from nesting (h1–h3). Boxes (`example`, `note`) take the next
  level, hold no sections. More levels = two apps.
- Navigation generated: contents on start and chapter pages, breadcrumbs, previous/next across chapters, page
  contents from three sections, glossary from `definition` blocks.

### When `scope` is needed

- All or nothing: `scope` in `src/app.yaml` → every page needs its own `scope`, else the build stops; none in
  `src/app.yaml` → no page has one.
- Needed when the app has an `open-task` (the tutor judges open answers by the scope, never from general knowledge),
  or follows the creator's material (the scope keeps the tutor to it). Else optional; the plan says which.
- Each page's `scope`: what the page teaches, in your own words; `src/app.yaml`: `scope: { text, out: [...] }` with
  what does not belong (`explainer-scope-matches`, form in `runtime.md`).

## Format 2: strand and competencies

An explainer on the learning map is in format 2. `src/app.yaml` starts with:

```yaml
# yaml-language-server: $schema=../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v2.schema.json
format: 2
strand: mathematik/stochastik   # "<subject>/<strand>" of the map, or none
title: Stochastik
```

| Field | Where | Rule |
|---|---|---|
| `format` | `src/app.yaml` | `2`; absent means format 1 (an app that has not moved) |
| `strand` | `src/app.yaml` | required in format 2: `<subject>/<strand>` (two ids of the map) or `none` |
| `competencies` | every page | strand set: required, ids of the app's strand; as a rule one. `none`: not allowed |

- A page: `competencies: [laplace]` beside `title` and `blocks`. One page per competency; a large one may take
  several pages; several on one page are not recommended (`one-competency-per-page`).
- Chapters group competencies that build on each other; pages follow the map's `requires`.
- One app, one strand. The ids are those of `https://lernapps.net/apps/map/<subject>.json`; the build cannot know
  them. `lernapps check` compares them with the map before the push (`competencies-on-map`); the listing checks
  them again.
- The build writes `lernapps-pages.json` (path, title, competencies or recap per page, in the app's order) beside
  `index.html`; the catalog lists the pages from it.

### A recap page

A competency of the app may require one the app does not practise: of another strand, or of the app's strand outside
the app's scope. The app may repeat it on a recap page, placed before the page that needs it:

```yaml
title: Brüche – kurz wiederholt
recap: mathematik/brueche-anteile   # "<subject>/<competency>", one the app does not practise
blocks: [...]                       # descriptive blocks only: no exercise
```

| Rule | Checked by |
|---|---|
| A page has either `competencies` or `recap`, never both | schema v2 |
| A recap page has no exercise; `topic-has-exercises` does not apply to it | schema v2, build |
| The link to the competency's page on the map is written by the runtime, so it cannot be missing | runtime |
| The recapped competency exists, and the app does not practise it on a page of its own | `lernapps check` (`competencies-on-map`, warning), listing (error) |

- A recap page counts as nothing on the map and is left out of the self-assessment.
- A prerequisite the app does not practise (of any strand) with neither a recap page nor a link in the page's text to
  `https://lernapps.net/apps/map/<subject>/c/<id>/`: a hint of `lernapps check` (`prerequisites-linked`).
- Format 1 stays valid. `lernapps update` adds `format: 2` and `strand: none` to a format-1 app when its runtime
  knows format 2.

## Entry topics

- An explainer in format 2 has no hand-written topics: the catalog takes its pages from `lernapps-pages.json`. The
  rest of this section holds for the other apps.

- Path of a page or section relative to the app's `url`: `prozent/prozentwert/`, `prozent/prozentwert/#regel`
  (`entry-links-resolve`; `lernapps check --entry` checks the section).
- From the stable ids (`explainer-stable-ids`).
