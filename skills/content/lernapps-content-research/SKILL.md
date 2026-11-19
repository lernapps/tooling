---
name: lernapps-content-research
description: Use in Explore whenever you need to know what a lernapps.net app teaches - school year, competencies, sources - even if the creator only names a topic; in the first version and in each increment that adds a chapter. How to take strand and competencies from the learning map, when a Lehrplan is needed at all, how to verify sources by opening them, and how to keep the creator's material private. For every archetype.
license: MIT
---

# Content research

Content comes from the learning map, the creator and sources you opened, never from memory. A filled-in content guide
(`.agents/skills/app-content/SKILL.md`) comes first: its decisions stand, and you research only the gaps. Read every
file the creator gives you.

## 1. The learning map

The map of the subject says which competencies there are and what builds on what. Start here.

- Open `https://lernapps.net/apps/map/<subject>.json` and read it in full. `<subject>` is the file name in the
  catalog, for example `mathematik`. People see the map at `https://lernapps.net/apps/map/<subject>/`.
- A strand fits the app: recommend it to the creator, with its competencies and those no app practises yet. One app
  has one strand; a strand runs over several school years; a topic that spans two strands is two apps. Where the map
  says `explainerFocus: competency`, an app may be a unit across strands instead (skill `lernapps-explainer-design`).
- With a strand the app practises only competencies of that strand. Take each with its id and its "Ich kann …"
  sentence from the map; do not reword or invent them. The map's `requires` gives the order.
- The map lacks a competency the creator wants: propose it to the catalog, as an issue or a pull request in
  `lernapps/apps` (`map/<subject>.yaml`). Tell the creator, and go on with the competencies the map has.
- No strand fits, the creator wants none, or the subject has no map (the address answers "not found"): the app has
  `strand: none`. It is listed as usual, only not on the map.

### `strand-from-map`: Recommend a strand of the learning map

```rule
id: strand-from-map
scope: tooling
severity: hint
```

- The subject has a learning map → check its strands and recommend the one that fits the app.
- `strand: none` only when no strand fits or the creator wants none; say why under "Notes".
- With a strand: only that strand's competencies, by their ids; a missing one is proposed to `lernapps/apps`.

## 2. Competencies without a strand

Only for an app with `strand: none`. With a strand, the competencies are those of the map.

- One per line: "Ich kann …" with one observable verb (berechnen, zuordnen, erklären, unterscheiden, ablesen,
  zeichnen). Never "verstehen" or "kennen".
  - Yes: "Ich kann die Stromstärke in einem Reihenstromkreis berechnen."
  - No: "Ich verstehe den elektrischen Strom."
- Group them into chapters of competencies that build on each other, in the order of the creator's material or of
  the Lehrplan.

## 3. Lehrplan

Only for an app with `strand: none`, and only as orientation for grade and order. An app with a strand, or one that
follows an assignment of skill `lernapps-map-assignment`, needs no Lehrplan: the map gives the order.

- Use only the Land's official document (Kerncurriculum, Lehrplan, Bildungsplan, Rahmenlehrplan) from the ministry
  or the state institute; no publisher, schoolbook or portal. The creator names no Land: the KMK-Bildungsstandards
  of the subject and level, if there are any.
- Read it yourself. A document you cannot read here, or none for the level: write "not checked" and follow the
  creator's material. Never cite a document from its title.
- Cite it under "Notes": title, issuer, year, address, page and unit. Where the creator's material differs, follow
  the material and say so in one sentence.

## 4. Second sources

- Per competency one article or video (serlo.org, a channel the creator trusts, Wikipedia).
- Read [references/sources.md](references/sources.md) before you choose, cite or rely on a source.
- Take facts from a text source, never sentences. Copying a sentence needs the licence the page states; if you
  cannot read the licence, do not copy.
- Read the primary source before you write a fact. Sources that disagree: tell the creator; never bend a fact to
  fit the plan.
- Never guess a wording, an address or an id (a video, an article, a unit number): look it up, or leave it out and
  mark it unchecked.
- A site answers HTTP 429 or is down: tell the creator which, mark it "not checked", go on. No scraper, no loop.

## 5. The creator's material and privacy

- The creator's material stays local: never commit or quote it. Only the competencies derived from it go into the
  repository.
- No learner's name, class, school, grades or picture, and no goal of one learner such as a test date
  (`no-learner-data-in-texts`). School year, school type and Lehrplan may stay.
