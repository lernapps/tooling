---
name: lernapps-content-research
description: Use when you find out what a learning app for lernapps.net teaches, before its plan or before a new chapter - clarify the curriculum (Land, Schulform, Jahrgang, the creator's own material), use the official Lehrplan as orientation for grade and order, write the competencies as "Ich kann …" statements grouped into chapters, and find second sources you verified by opening them. For every archetype. In an app whose content guide (.agents/skills/app-content) is filled in, load that first; it takes precedence.
license: MIT
---

# Researching the content

What an app teaches comes from the curriculum and the creator, never from memory. This skill is for Explore, before
the plan, and for each new chapter later. The rules of `lernapps-app` apply; the skill of the archetype says how the
result becomes pages, rounds or questions. In an app whose content guide `.agents/skills/app-content/SKILL.md` is
filled in, read it first: its decisions stand, and this skill fills only what it leaves open.

## 1. Clarify the curriculum

You need four things: the **Land** (state), the **Schulform** (school type), the **Jahrgang** (grade), and whether
the creator has **their own material**, such as a worksheet, a checklist or the topics of a test. Derive what you can
from what the creator said; ask the rest, one or two questions per turn. If they hand over a file, read it.

## 2. Use the Lehrplan as orientation

- The Lehrplan decides which content belongs to which grade, and in which order. It is orientation, not a condition:
  a citation is welcome, not required. When you find none, say so once and go on; never stop for it or ask again.
- Take the official document of the Land: Kerncurriculum, Lehrplan, Bildungsplan or Rahmenlehrplan, from its
  ministry or state institute. Not a publisher, a schoolbook or a teaching portal: they interpret the curriculum.
- When you use one, download it and read it yourself (the PDF or the page), never through a fetch tool that
  summarises. Cite what you used: the document (title, issuer, year, address), and the page and unit (Inhaltsfeld,
  Lernbereich, Kompetenz) of each part the app covers, in the plan's notes.
- When the creator's material differs from the Lehrplan (the class is behind or ahead), follow the material and say
  so in one sentence.

## 3. Write the competencies

- One statement per competency, as "Ich kann …", with one observable skill: something a learner can show, with a
  verb such as berechnen, zuordnen, erklären, unterscheiden, ablesen, zeichnen. Not "verstehen" or "kennen".
  - Observable: "Ich kann die Stromstärke in einem Reihenstromkreis berechnen."
  - Not observable: "Ich verstehe den elektrischen Strom."
- Group the competencies into **chapters**: the units learners work through, in the order of the Lehrplan or the
  creator's material. An app may have many competencies in several chapters; a chapter is a part of the app, not a
  reason to split it.
- Explain the chapters with their competencies, and how you found them, to the creator at the checkpoint "research"
  of the plan; they confirm them there.

## 4. Find second sources, verified

A second explanation in other words helps learners and teachers: per competency, look for one article or video, for
example on serlo.org (free, without ads or login), a video channel the creator trusts, or Wikipedia.

- **Open each one** before you use it, and check three things:
  - it exists: the page loads, not an error, an empty page or a redirect to a start or search page;
  - it is the actual article or video: not a search result, a category, a list or a disambiguation page;
  - it covers exactly this competency: an article on resistance for "Ich kann den Widerstand berechnen", not one on
    electricity in general.
- **No weak matches.** When nothing fits exactly, leave the source out and say so in the plan; never force one.
- For a video, check its channel and title through the platform's own metadata (for YouTube its oEmbed address),
  never by a search result alone. A video loads only after a click (`no-request-before-click`).
- Note per source: the address, its exact title, and that you verified it.
- Take facts from sources, never their sentences; name source and licence of what you take
  (`third-party-licence`).

## 5. The creator's material and personal data

- The creator's own material (a worksheet, a test) stays on their machine: never commit it, never quote it. Only the
  competencies derived from it go into the repo.
- No personal data in public texts: no learner's name, class, school, grades or picture, and no goal of one learner,
  such as a test date or a competition. The app is for every learner of the grade (`no-learner-data-in-texts`).
  Grade, school type and Lehrplan may stay, as curriculum context.

## 6. Never guess

Never guess Lehrplan units, curriculum wording or ids (a video's, an article's, a unit's number): look them up, or
leave them out. What you could not look up you mark in the plan as not checked.

When a site limits your requests (HTTP 429) or will not open, tell the creator which sources you could not check,
mark them as not checked in the plan, and go on with the others. Write no scraper or loop to get around it.

## Where the results go

Into the plan file: the curriculum orientation (with its citation, where you used one) and the competencies by
chapter under "Notes", the choices under "Key decisions".
Once the creator has confirmed the plan, into the content guide: its parts "Curriculum", "Competencies" and
"Sources" (`app-content-guide`).
