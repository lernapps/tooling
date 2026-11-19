---
name: lernapps-explainer-design
description: Use in Explore right after choosing the `explainer` archetype, and again in Plan to map the confirmed content - how the content of a lernapps.net explainer maps onto chapters, pages, blocks and exercises.
license: MIT
---

# Designing an explainer

An explainer is chapters of pages that explain a topic, with exercises on every page. You will write its content as
YAML; the runtime makes navigation, contents, glossary, the tutor pages and other languages from it. What it can and
cannot do is in the template's README, `node_modules/@lernapps/app-templates/explainer/README.md`: read it first.

## Map the content

1. **Strand app or unit app.** Read `explainerFocus` in `https://lernapps.net/apps/map/<subject>.json`.
   - `strand` (most subjects): the app has one strand of the map, `<subject>/<strand>`, and every page practises
     competencies of that strand. An app that fits no strand has `strand: none` and is not on the map.
   - `competency` (foreign languages, German): the app may instead be a unit app across strands
     (`subject: <subject>`), for example the words, the grammar and the communication of one situation. Each page
     still practises competencies of one strand only.
2. **One competency, one page.** A competency is one teachable thing, one or two lessons. A large one may take
   several pages; several on one page are a hint of the check (`one-competency-per-page`). Each page names the
   competency of the map it practises. A competency the map lacks is proposed to the catalog (`lernapps/apps`), never
   invented in the app.
3. **Order by `requires`.** Read the `requires` of each competency in the map. What learners need first comes first;
   competencies that build on each other form a chapter (`prerequisites-in-order`).
4. **Prerequisites the app does not practise** (of another strand, or before the app's start). The page that needs
   one links it in its text, or a recap page repeats it before that page. A chapter that needs several gets one
   recap page at its start ("Das brauchst du hier"), not one each. A competency the app practises on a page of its
   own gets no recap page; a prerequisite between two competencies of the app is practised too, else the app has a
   gap.
5. **A page before its prerequisite, on purpose** (greetings as fixed phrases before the grammar behind them): the
   page names that prerequisite in `ahead`, and another page of the app practises it.
6. **Sections.** Give sections the same ids on every page (for example `einstieg`, `beispiel`, `uebung`). Which
   sections a page has and in which order follows what it teaches, not a template; each title says what the section
   does on that page (`explainer-honest-headings`). A page has at most two levels of sections: content that needs
   more is two apps.
7. **Data files.** Records that a `timeline` shows or a `generated` exercise draws from go into
   `src/data/<name>.yaml`, each fact once. No other block reads a data file.
8. **Components.** A Vue component only for what no block can show or check: reading a value off a scale, labelling
   a figure, dragging into place. It costs a logic module, a test and a text for readers without JavaScript; say in
   the plan why no block fits (`prefer-built-in-block`).

How to write strand, competencies, recap pages and `ahead` in YAML:
[structure.md](../lernapps-explainer/references/structure.md) of skill `lernapps-explainer`, in Code.

## Engagement

Per page, one line under "Content method" in the plan:

1. Opening: a first, easy task learners act on in the first blocks, before the explanation, with the reason for its answer.
2. Change: which activities alternate (look, do, read); never a long text run.
3. Reward: what learners made or can do now, not only "Richtig"; a chapter ends with a look back.
4. Story: how the concern shows on this page (a scene, messages, a case) and what comes next; none, none.
5. Repeat on purpose only: a fact met again in another form deepens it, the same words twice do not.

## Decide

- Languages: German, or German and English (`[de, en]`), each complete. Never English only: the runtime's texts are
  German first, so an English-only app mixes both.
- The tutor: the build writes it from the content. Plan only rules for the tutor that are special to this app, if
  any.

## Read when

- [references/rules.md](references/rules.md): before you write "Content method". The rules a page is planned by and
  reviewed against: what `lernapps check` counts on a page, how a page starts and ends, figures and controls,
  numbers and mistakes, the story.
- [references/map-rules.md](references/map-rules.md): when a finding names `prerequisites-in-order`,
  `competencies-on-map`, `one-competency-per-page`, `content-matches-competencies` or `recap-names-competencies`.
