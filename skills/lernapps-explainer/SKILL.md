---
name: lernapps-explainer
description: Use when you build or change an explainer for lernapps.net (archetype explainer). How the generated explainer works, what you write (the content as YAML in src/, Vue components only where no block fits), its structure, blocks, formulas, languages, exercises and components, how content patterns are expressed in it, and the rules the build checks. Load it together with lernapps-app before you write content; for questions of the quiz's types also load lernapps-quiz.
license: MIT
---

# Explainer

- Pages that explain a topic; exercises on every page.
- You write YAML in `src/`; a Vue component only where no block fits. Rendering, navigation, formulas, figures,
  exercises, accessibility, languages, no-JS page: runtime `@lernapps/app-templates`.
- Generated with the example chapter "Prozent": replace it.
- Schema: <https://lernapps.net/tooling/schemas/explainer.v1.schema.json>. Start every YAML file with
  `# yaml-language-server: $schema=../../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v1.schema.json`
  (one `../` less in `src/app.yaml`).
- Quiz-type exercises: also skill `lernapps-quiz`.

## Index

- [references/runtime.md](references/runtime.md): build, pages with and without JS, addresses, tests, failing
  runtime tests, the tutor.
- [references/structure.md](references/structure.md): app, chapter, page, section; entry topics.
- [references/blocks.md](references/blocks.md): blocks, Markdown, formulas, languages, data files.
- [references/exercises.md](references/exercises.md): quiz-type exercises, `generated`.
- [references/components.md](references/components.md): Vue components; before the first one.
- [references/rules.md](references/rules.md): the rules the build checks.

## Content in an explainer

- Load `.agents/skills/app-content/SKILL.md` first.
- Competency → a page or section; its chapter → an app chapter.
- Content structure → the same sections on every page, fixed ids and titles.
- Shared material → data file in `src/data/`.
- Pattern → block, quiz-type or `generated` exercise with fixed parts, varied in `given` or the records it picks.
- Not expressible → component.
- New chapter → folder with `chapter.yaml`, listed in `src/app.yaml`, its pages listed in it.
