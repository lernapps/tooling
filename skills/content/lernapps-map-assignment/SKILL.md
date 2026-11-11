---
name: lernapps-map-assignment
description: Use in Explore whenever a teacher wants an app for a subject but has no fixed content yet - "a start into French", "what should I build for my class 7", "an app for a gap on the map" - even if they never mention the map. Turns the lernapps.net learning map into one assignment the teacher confirms, naming which competencies (gaps), in which order, what the app cannot do, and a story for children that carries the pages. Run it before lernapps-content-research and the plan.
license: MIT
---

# From the learning map to an assignment

The map knows what builds on what. Use that logic, not a curriculum or a textbook: an app that follows the chain
can be used by any class at that point of the course. The result is an assignment the teacher confirms with "yes";
nothing is built yet.

## 1. Ask

Subject; where the class stands (school year, and for a foreign language the year of the course); a topic or
situation, if the teacher has one. Ask the teacher to look at the map themselves:
`https://lernapps.net/apps/map/<subject>/c/` (rows by grade band and step, gaps dashed). Propose all the same.

## 2. Read the map

Fetch `https://lernapps.net/apps/map/<subject>.json` and read it in full; no script needed. Per competency:

- `place.band`, `place.step`: within its band a competency is one step below its deepest prerequisite of the same
  band, from any strand. Everything it requires stands above it; competencies of one step do not depend on each other.
- `opens`: how many competencies build on it, directly or further down.
- `practisedBy` empty: a gap.

The class's band: its school year. A foreign language counts the course, not the school year: year y of n years →
part ⌊3(y − ½)/n⌋ + 1, and parts 1, 2, 3 are 5-6, 7-8, 9-10.

## 3. Choose

Take gaps of the class's band and weigh them in this order:

1. **The archetype can practise it.** An explainer shows text, figures and exercises; it plays no sound and checks
   no speaking or listening. Pronunciation becomes reading: sound and spelling, phonetic signs.
2. **It can start:** each prerequisite is in the cut, practised by an app, or fits on one recap page.
3. **It opens the way:** prefer the higher `opens`. On a map of gaps this decides.
4. **It holds together:** one strand, or for a unit (`explainerFocus: competency`) one situation that needs words,
   grammar and texts at once. No topic given → choose the situation the earliest gaps serve best, and say why.

Cut 3-8 competencies: one chapter, one page each. Order them by step; within a step the story decides.

- **Hidden prerequisites:** for each page, ask what its exercises need that is not in the cut (words, forms: "I am
  12" needs numbers; pronouns need a verb to stand in). Put it in the cut, keep the exercise without it, or list it
  under "Offen".
- **A page ahead on purpose:** a fixed phrase may come before the grammar behind it ("Bonjour, je suis Léa" before
  être). Then the page names that prerequisite in `ahead`, and the cut must practise it on another page.
- Do not reword competencies; a missing one is proposed to `lernapps/apps` (skill `lernapps-content-research`).

## 4. Propose a story

One concern that runs through the chapter, so each page answers a question the story asks.

- One or two children of the learners' age, with names; an everyday place; for a language, where it is spoken.
- One scene per page, in the order of the pages.
- Invented: no characters or worlds from books, films, games or brands; drawings, not photos; no stereotypes.
- Short and the same throughout, so it carries the tasks instead of competing with them. Fix names, age, place and
  looks once, in the content guide, and keep them on every page.

## 5. Write the assignment

```markdown
## Auftrag: <title>
- Fach: <subject> · Stand: <school year / year of the course> · Richtstufe <band>
- Strang: <subject>/<strand> | Einheit: Fach <subject>, Stränge <a>, <b>
- Warum: <why these gaps, in one or two sentences from step 3>
- Seiten (ein Kapitel), in dieser Reihenfolge:
  1. <id> – <name>: „<iCan>“ (<strand>, Schritt <step>, öffnet <opens>) – Szene: <scene>
     [ahead: <id>, geübt auf Seite <n>]
- Wiederholung: <id> – <name> (<app> | Wiederholungsseite) | keine
- Geschichte: <characters with age and looks, place, concern>
- Sprache der Seiten: <e.g. German explanations, French examples>
- Übungen: <only exercises the app checks | also free writing>
- Was die App nicht kann: <e.g. no sound: pronunciation as phonetic signs>
- Offen: <questions, hidden prerequisites>
```

Wait for "yes". Then the assignment answers the plan's interview and is the result of the checkpoint "research": copy
it into the plan, the competencies and the story into the content guide (`app-content`, "Competencies" and "Content
structure"), and go on with `lernapps-content-research` for the sources only.

### `assignment-from-map`: An app without fixed content starts from an assignment

```rule
id: assignment-from-map
scope: tooling
severity: hint
```

- The teacher has no fixed content → write the assignment of section 5 before the plan.
- Its pages are gaps of the class's band the archetype can practise, in the order of their place.
