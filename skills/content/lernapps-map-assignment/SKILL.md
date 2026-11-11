---
name: lernapps-map-assignment
description: Use in Explore when a teacher wants an app for a gap on the lernapps.net learning map, asks what to build next for a subject, or names only a subject and a class. How to read the map, find the gaps that fit the class, cut them into one app (3-8 competencies in the order of the chain), propose a story for children that carries the pages, and write the assignment the teacher confirms. Before lernapps-content-research. For every archetype; the story is for explainers.
license: MIT
---

# From the learning map to an assignment

The result is an **assignment** for one app: which competencies, in which order, for which class, why this gap, and
a story that carries the pages. The teacher confirms it; then `lernapps-content-research` and the archetype's skills
build it. Nothing here is built yet.

## 1. Ask the teacher

- Subject, Land and school type, class, and the topic the class is on now (if any).
- The teacher names no topic → ask them to look at the map themselves (step 2 gives the address) and say what they
  see; you make a proposal of your own all the same. The teacher decides.

## 2. Read the map

- Data: `https://lernapps.net/apps/map/<subject>.json` (`<subject>` as in the catalog, e.g. `franzoesisch`). Read it
  in full. For the teacher: `https://lernapps.net/apps/map/<subject>/c/` (by grade and chain: gaps are dashed).
- Per competency: `id`, `name`, `iCan`, `gradeBand`, `requires`, `practisedBy` (empty = a gap), and `place`
  (`{ band, step }`) where the JSON carries it. Without `place`, work it out: within its grade band a competency is in
  step 1 if it requires nothing of the same band, else one step below its deepest prerequisite of the same band.
  Everything a competency requires stands above it; competencies of one step do not depend on each other.
- `explainerFocus`: `strand` → one app, one strand. `competency` (foreign languages, German) → an app may be a unit
  across strands, one strand per page (skill `lernapps-content-research`, section 2).
- Foreign languages: the grade band is the stage of the course, not the school year (first, second or third language
  start at different grades). Map the teacher's class to the stage: first third of the course 5-6, then 7-8, 9-10.

## 3. Find the candidates

Gaps in the teacher's grade band, in the strand of the topic (or, for a unit, the strands the situation needs).
Nothing fits the class → say so and show the nearest band.

## 4. Weigh them

Prefer, in this order:

1. **Fits the class:** the band and, if named, the topic.
2. **Can start:** every prerequisite is practised by an app, or the app can recap it on one page; a prerequisite that
   is itself a large gap rules the candidate out for now.
3. **Opens the way:** many competencies build on it (follow `requires` backwards).
4. **Holds together:** the candidates form a chain or a set from one or two adjacent steps.

## 5. Cut one app

- 3 to 8 competencies; in an explainer one page per competency (skill `lernapps-explainer-design`).
- In the order of their place: step by step; within one step the order that fits the story.
- A prerequisite outside the cut → a recap page before the page that needs it, or a link to its page on the map.
- Do not reword or add competencies; a missing one is proposed to `lernapps/apps` (skill `lernapps-content-research`).

## 6. Propose a story (explainers)

One story the pages follow, so each competency is needed in a situation learners recognise.

- Characters (one or two, with names), a place and a concern that runs through the app. Age fits the class; children
  of the age of the learners, or a little older.
- Per competency one scene in which it is needed: the scene asks, the page answers.
- Own invention: no characters, brands or worlds of books, films or games. No stereotypes of gender, origin or
  country; everyday settings over clichés. Foreign languages: the scenes happen where the language is used.
- It carries the tasks and does not compete with them: short, the same characters throughout, numbers that fit
  (`explainer-plausible-numbers`).
- Accepted → it goes into the content guide (`app-content`, "Content structure").

## 7. Write the assignment

Show it to the teacher in this form and wait for the confirmation:

```markdown
## Auftrag: <short title>
- Fach: <subject> · Klasse: <class> (Richtstufe <band>) · <Land, school type>
- Strang: <subject>/<strand>   (unit app: Fach <subject>, Stränge <a>, <b>)
- Warum diese Lücke: <one or two sentences from step 4>
- Bausteine, in dieser Reihenfolge:
  1. <id> – <name> (Schritt <step>)
  2. …
- Wiederholung vorher: <id> – <name> (geübt in <app> | Wiederholungsseite)
- Geschichte: <characters, place, concern>; Seite 1: <scene> … 
- Offen: <questions for the teacher>
```

After the confirmation: the competencies and ids go into the plan and the content guide (skill
`lernapps-content-research`); the archetype's design skill takes over.

### `assignment-from-map`: An app for a gap starts from an assignment

```rule
id: assignment-from-map
scope: tooling
severity: hint
```

- The teacher wants an app for a gap or asks what to build → write the assignment of section 7 before the plan.
- Its competencies are gaps of the map in the class's band, in the order of their place; prerequisites outside the
  cut are recapped or linked.
