---
name: lernapps-content-research
description: Use in Explore whenever you need to know what a lernapps.net app teaches - school year, Lehrplan, competencies, sources - even if the creator only names a topic; in the first version and in each increment that adds a chapter. How to use the Lehrplan as orientation, write competencies as "Ich kann …", verify sources by opening them, and keep the creator's material private. For every archetype.
license: MIT
---

# Content research

- A filled-in content guide `.agents/skills/app-content/SKILL.md` comes first: its decisions stand; research only
  the gaps.
- Content comes from the curriculum, the creator and sources you opened, never from memory.
- The questions to the creator are the plan's interview. Read every file the creator gives you.

## 1. Lehrplan

- Orientation for grade and order, not a condition. None found → say so once; go on.
- Only the Land's official document (Kerncurriculum, Lehrplan, Bildungsplan, Rahmenlehrplan) from the ministry or
  state institute. No publisher, schoolbook or portal. No Land known → KMK-Bildungsstandards. The KMK has none for the subject or level (e.g. Informatik in Sekundarstufe II) → cite no unit, write "not checked" and follow the creator's material.
- Download and read it yourself. A document you cannot read here (a PDF and no tool to read it) → mark it "not checked"; never cite it from its title alone.
- Cite it under "Notes": title, issuer, year, address; page and unit (Inhaltsfeld, Lernbereich, Kompetenz).
- The creator's material differs → follow the material; say so in one sentence.

## 2. The learning map

Before you write competencies, look at the learning map of the subject.

- Open `https://lernapps.net/apps/map/<subject>.json` (for you); people see it at `https://lernapps.net/apps/map/<subject>/`.
  `<subject>` is the file name in the catalog, e.g. `mathematik`. Read it from the file or the page, in full.
- Pick ONE strand for the app: one app, one strand. A strand runs over several school years; a topic that spans two
  strands is two apps. Show the creator the strand and its competencies (Bausteine), with the ones still no app
  practises.
- Pick the competencies the app will practise. Write each with its id from the map. The app's "Ich kann …"
  competencies are those of the map, in its words: do not reword or invent them. The map's `requires` shows what
  learners need first.
- The map lacks a competency the creator wants → do not invent it in the app. Propose it to the catalog: an issue or a
  pull request in `lernapps/apps` (`map/<subject>.yaml`, the strand's list). Say so to the creator; go on with the
  ones the map has, or wait for the answer.
- No map for the subject (the address answers "not found") → `strand: none`. The app is not on the map; write its
  competencies as in the next section.
- Write the strand (`<subject>/<strand>`, or `none`) and the competency ids under "Notes".

## 3. Competencies

- With a strand: those of the map, see above. Without: one per line: "Ich kann …" with one observable verb (berechnen, zuordnen, erklären, unterscheiden, ablesen,
  zeichnen). Never "verstehen" or "kennen".
  - Yes: "Ich kann die Stromstärke in einem Reihenstromkreis berechnen."
  - No: "Ich verstehe den elektrischen Strom."
- Group them into chapters, in the order of the Lehrplan or the material. Many chapters are still one app.
- Write them under "Notes". Show them at the checkpoint "research".

## 4. Second sources

- Per competency one article or video (serlo.org, a channel the creator trusts, Wikipedia).
- Read [references/sources.md](references/sources.md) before you choose, cite or rely on a source.
- A text source (Wikipedia, a schoolbook site): take facts, never sentences. Copying a sentence needs the licence the page states; if you cannot read it, do not copy.

## 5. The creator's material and privacy

- The creator's material stays local: never commit or quote it. Only the competencies derived from it go into the
  repo.
- No learner's name, class, school, grades, picture, or one learner's goal such as a test date
  (`no-learner-data-in-texts`). School year, school type and Lehrplan may stay.

## Gotchas

- Read the primary source before you write a fact. A secondary text that seems to fit is no proof.
- Several sources disagree → report the disagreement to the creator. Never bend a fact to fit the plan.
- Never guess a Lehrplan unit, a wording or an id (video, article, unit number): look it up or leave it out, and
  mark it unchecked.
- HTTP 429 or a site down → tell the creator which; mark it "not checked"; go on. No scraper, no loop.
