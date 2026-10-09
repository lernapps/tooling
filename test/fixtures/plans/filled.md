---
archetype: quiz
phase: commit
prePushFailures: 2
---

# Plan: Brüche vergleichen

*Started on 2026-10-09. Workflow: Explore, Plan, Code, Commit.*

## Goal

Learners in year 6 compare fractions and order them on a number line, with feedback after each answer.

## Key decisions

- Archetype `quiz`: the creator wants short questions with feedback, no pages of explanation.
- Number line questions as ordering questions (guess): the creator did not say how to show the number line.

## Notes

- All questions written by the creator; no content of others.

## Explore

### Tasks

### Answers

- Learners compare two fractions and order four on a number line.
- Year 6, Mathematik; they know what a fraction is.
- The creator writes all questions.
- Adults search for "Brüche vergleichen" and "Klasse 6".

### Entry draft

```yaml
title: Brüche vergleichen
subject: Mathematik
```

### Completed

- [x] Ask what the app is for
- [x] Ask who the learners are
- [x] Ask where the content comes from
- [x] Fetch the entry schema and ask what it needs
- [x] Choose the archetype
- [x] Set `phase: plan`

## Plan

### Tasks

### Completed

- [x] Write the tasks of Code
- [x] Show the creator the plan
- [x] **Checkpoint:** confirm the plan
- [x] Set `phase: code`

## Code

### Tasks

### Completed

- [x] Generate the app
- [x] Load the skills
- [x] Twelve questions comparing two fractions
- [x] Eight ordering questions on the number line
- [x] `npx lernapps check` passes
- [x] Set `phase: commit`

## Commit

### Tasks

- [ ] Open the listing pull request

### Completed

- [x] Push
- [x] **Checkpoint:** publish
- [x] Complete the entry draft
- [x] **Checkpoint:** list
- [x] Fill the retrospective

## Retrospective

### Phases reached

commit; confirmed, published, listing approved.

### Failed checks

- `no-request-before-click`: 1 (a web font from another server)
- `accessible`: 1 (contrast of the feedback colour)

### Creator turns after the plan

2: the wording of one question; the yes to publish.

### Where I had to guess

- How to show the number line: as an ordering question.
