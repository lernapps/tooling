# Structure

| Level | File | Holds |
|---|---|---|
| App | `src/app.yaml` | `title`, `intro`, `languages`, order of `chapters`, `sources` |
| Chapter | `src/<chapter>/chapter.yaml` | `title`, `summary`, order of its `pages` |
| Page | `src/<chapter>/<page>.yaml` | `title`, `description`, `blocks` |
| Section | `section` block in a page | `id`, `title`, `blocks`; one more section level inside |

- Chapters mandatory. One chapter: hidden in navigation; addresses keep it (`/<chapter>/<page>/`).
- Order lists complete: `chapters`, `pages` list every folder or file exactly once. No sorting by name.
- Ids: lowercase, digits, hyphens; unique per level; stable once published. Not chapter ids: `data`, `images`,
  `glossar`, `components`, `assets`.
- Depth: page, section, subsection; headings follow from nesting (h1–h3). Boxes (`example`, `note`) take the next
  level, hold no sections. More levels = two apps.
- Navigation generated: contents on start and chapter pages, breadcrumbs, previous/next across chapters, page
  contents from three sections, glossary from `definition` blocks.

## Entry topics

- Path of a page or section relative to the app's `url`: `prozent/prozentwert/`, `prozent/prozentwert/#regel`
  (`entry-links-resolve`; `lernapps check --entry` checks the section).
- From the stable ids (`explainer-stable-ids`).
