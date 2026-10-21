---
name: lernapps-explainer
description: Use in Code of a lernapps.net explainer whenever you write or change its content in src/ - a chapter, page, block, figure, formula, exercise, data file, language or component - or a build or runtime test of the explainer fails. What you write, the notation of structure, blocks and exercises, components, the runtime, and the explainer's technical rules.
license: MIT
---

# Explainer

- You write YAML in `src/`; a Vue component only where the plan names one. Rendering, navigation, formulas, figures,
  exercises, accessibility, languages and the no-JS page come from the runtime `@lernapps/app-templates`.
- `create` writes the example chapter "Prozent": replace it with the planned content.
- Schema: `node_modules/@lernapps/app-templates/runtime/explainer/explainer.v1.schema.json`. Start every YAML file with
  `# yaml-language-server: $schema=../../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v1.schema.json`
  (one `../` less in `src/app.yaml`).
- Questions of the quiz's types: also skill `lernapps-content-questions`.

## Read when

- [references/structure.md](references/structure.md): before you add or move a chapter or page.
- [references/blocks.md](references/blocks.md): before you write a page.
- [references/exercises.md](references/exercises.md): before you write an exercise, above all a `generated` one.
- [references/components.md](references/components.md): only when the plan names a component.
- [references/runtime.md](references/runtime.md): when the build or a runtime test fails, and before you set up the
  tutor.
- [references/rules.md](references/rules.md): when a check names an `explainer-*` or `vue-component-*` rule.

## Gotchas

- A build problem is one line `file:line: place (language): what to do`. Fix where it points.
- Headings are `section` blocks, never Markdown headings.
- A new chapter: a folder with `chapter.yaml`, listed in `src/app.yaml`, each page listed in `chapter.yaml`.
