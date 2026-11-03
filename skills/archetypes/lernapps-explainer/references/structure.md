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
| `competencies` | every page | strand set: required, at least one id of the subject. `none`: not allowed |

- A page: `competencies: [laplace]` beside `title` and `blocks`.
- One app, one strand. The ids are those of `https://lernapps.net/apps/map/<subject>.json`; the build cannot know
  them, the listing checks them.
- The build writes `lernapps-pages.json` (path, title, competencies per page, in the app's order) beside
  `index.html`; the catalog lists the pages from it.
- Format 1 stays valid. `lernapps update` adds `format: 2` and `strand: none` to a format-1 app when its runtime
  knows format 2.

## Entry topics

- An explainer in format 2 has no hand-written topics: the catalog takes its pages from `lernapps-pages.json`. The
  rest of this section holds for the other apps.

- Path of a page or section relative to the app's `url`: `prozent/prozentwert/`, `prozent/prozentwert/#regel`
  (`entry-links-resolve`; `lernapps check --entry` checks the section).
- From the stable ids (`explainer-stable-ids`).
