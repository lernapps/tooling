# Solution Strategy

The platform is built around a person's goals. A creator knows what learners should be able to do afterwards. An AI
assistant can build the app. The platform keeps the two aligned, from the first question to a published app, and asks
the person only for what is theirs to decide: what the app is for, what it teaches and whether it goes out. The
technical decisions are taken once, by the platform, and never by the person.

This works because the two sides differ. The app is deterministic: it does the same every time. The assistant that
builds it is not. So the strategy puts deterministic guardrails around a probabilistic builder, and measures where the
person was still needed.

The lifecycle has five phases: plan and scope, build, test, roll out and monitor. Process and support run through all of
them.

```arc42
:::solution-strategy
id: strategy-architecture
title: Surface the person's goals first, hold them through every phase, measure where the person was still needed
addresses: qg-simple-to-build, qg-list-in-minutes, qg-findable, qg-checked-not-declared, qg-nothing-collected, qg-few-iterations, qg-any-assistant, qg-guidance-evolves
:::
```

## Plan and scope: surface the goals

The work starts with the person, not with code. The assistant explores what the app is for, who the learners are and
what they should be able to do afterwards, and grounds this in the curriculum and in sources it has checked, not in its
memory. The person confirms the goals before anything is built. The same answers later describe the app to the adults
who look for it.

## Build: keep the goals consistent

From the confirmed goals the assistant works on its own. Where the kind of app fixes its form, the goals cannot drift:
the person writes only content and the platform supplies the behaviour. Where the form is free, a readable architecture
holds them, and it is checked against the code with every change. The less the form is fixed, the more the
architecture has to carry. Rules reach the assistant while it works, and every message says how to fix a problem.

## Test: decide what can be decided

Everything a program can decide is decided by one check, the same wherever it runs, with a result tied to one version
of the app. What no program can decide is judged by an independent review against published criteria. Every one of
them, a check or a judgment, answers to a goal with an id. A judgment may vary; the goal it judges does not. The goals
of the app itself, what learners should be able to do, are written in the plan as text and are not machine-readable
yet. Neither the check nor the review judges whether the content teaches correctly. That stays with the person.

## Roll out: release at the person's yes

Release is a chain of approvals, not a date. The person says yes before the app goes online and again before it is
listed. The app that goes online is the one that was checked, and the platform's owner decides on the listing. A change
to the platform reaches every app as an update, so a rule changes in one place.

## Monitor: learn where the goals were not held

The platform collects nothing, so it cannot watch apps in use. It watches the process that makes them. Each piece of
work ends with a report by the assistant: how far it got, how often the person was needed after the plan, and where it
had to guess. Failures are counted by the platform, not by the assistant. Every guess marks a missing decision point,
and the guidance is improved from it. The number of times the person was needed measures the alignment, and the
platform aims for it to fall as the guidance matures. Two things are planned and not built: reading the sessions of
the assistant itself, the owner's own and later those that contributors send in, and turning the reports into feedback
automatically.

## Across all phases

- **Process and support.** The process is a short, readable plan the assistant follows, and the support is guidance it
  loads when a task needs it. Both work with any assistant.
- **One source for the rules.** Each rule is told once, has an id, and is named in every message about it.
- **Nothing leaves unasked.** The platform sends nothing about a person or an app. What is measured stays with the
  creator until they submit a listing.
