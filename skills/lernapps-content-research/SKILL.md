---
name: lernapps-content-research
description: Use when you find out what a learning app for lernapps.net teaches, before its plan or before a new chapter - clarify the curriculum (Land, Schulform, Jahrgang, the creator's own material), use the official Lehrplan as orientation for grade and order, write the competencies as "Ich kann …" statements grouped into chapters, and find second sources you verified by opening them. For every archetype. In an app whose content guide (.agents/skills/app-content) is filled in, load that first; it takes precedence.
license: MIT
---

# Content research

- When: Explore (before the plan); each new chapter.
- Filled-in `.agents/skills/app-content/SKILL.md` first: its decisions stand; fill only gaps.
- Content from curriculum and creator, never from memory.

## 1. Curriculum

- Need: Land, Schulform, Jahrgang, creator's own material (worksheet, checklist, test topics).
- Derive what you can; ask the rest, max 2 questions per message. Read files the creator gives.

## 2. Lehrplan

- Orientation for grade and order, not a condition. None found → say so once, go on.
- Only the Land's official document (Kerncurriculum, Lehrplan, Bildungsplan, Rahmenlehrplan) from ministry or
  state institute; no publisher, schoolbook, portal.
- Download and read it yourself; no summarising fetch tool.
- Cite in the plan's notes: title, issuer, year, address; page and unit (Inhaltsfeld, Lernbereich, Kompetenz).
- Creator's material differs → follow the material; say so in one sentence.

## 3. Competencies

- One per line: "Ich kann …" + one observable verb (berechnen, zuordnen, erklären, unterscheiden, ablesen,
  zeichnen). Never "verstehen", "kennen".
  - Yes: "Ich kann die Stromstärke in einem Reihenstromkreis berechnen."
  - No: "Ich verstehe den elektrischen Strom."
- Group into chapters, in Lehrplan or material order. Many competencies, several chapters: still one app.
- Write them into the plan (Notes). Show them at the checkpoint "research".

## 4. Second sources

- Per competency one article or video (serlo.org, a channel the creator trusts, Wikipedia).
- Verify each by opening it: [references/sources.md](references/sources.md).

## 5. Privacy

- Creator's material stays local: never commit or quote it; only derived competencies go into the repo.
- No learner's name, class, school, grades, picture, or one learner's goal (test date, competition)
  (`no-learner-data-in-texts`). Grade, school type, Lehrplan may stay.

## 6. Never guess

- Never guess Lehrplan units, wording or ids (video, article, unit number): look up or leave out; mark unchecked.
- HTTP 429 or site down → tell the creator which, mark "not checked", go on. No scraper, no loop.

## Output

- Plan: curriculum orientation, competencies by chapter (Notes); choices (Key decisions).
- After confirmation, content guide: "Curriculum", "Competencies", "Sources" (`app-content-guide`).
