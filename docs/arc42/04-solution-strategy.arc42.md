# Solution Strategy

| Quality goal | Approach |
|---|---|
| Simple to build with guidance | Five layers around the assistant; a scaffold per archetype that meets the rules from the start; a plan file with checkpoints |
| List in minutes | The entry is generated from the plan and the validation report; failed validations come back as a comment the assistant can act on |
| Checked, not declared | Deterministic checks first, the same everywhere (hook, CI, listing); a report bound to a commit; judgment only for the rest |
| Nothing collected in secret | Everything runs on the creator's machine or in their repo; data reaches the platform only with a listing the creator submits |
| Fewer iterations for the assistant | Precise messages written for agents; fast hooks; a rule catalog the checks and skills share |
| Works through any assistant | Plain files (`AGENTS.md`, plan file, skills) and CLIs; git hooks enforce, not agent hooks |
| The guidance evolves | One rule catalog; one versioned package from git, kept current by Renovate; findings move down the layers |

The strategy in one sentence: support the creator's assistant in five layers per archetype, start it from a scaffold
that already keeps the rules, decide everything a machine can decide with one check that runs everywhere, keep all
guidance in plain files and one versioned package, and let nothing leave the creator's side unasked.

```arc42
:::solution-strategy
id: strategy-architecture
title: Five layers around the assistant, deterministic first, one source
addresses: qg-simple-to-build, qg-list-in-minutes, qg-checked-not-declared, qg-nothing-collected, qg-few-iterations, qg-any-assistant, qg-guidance-evolves
:::
```

## Five layers around the assistant, per archetype

The assistant is supported by process guidance, scaffolding, conventions, deterministic verification and formal
validation. Each layer is built per archetype (`explainer`, `interactive`, `quiz`): an archetype is a
bundle of scaffold, skills, rules in scope and review rubric.


## The scaffold meets the rules from the start

The generator writes an app that already passes every check: strict TypeScript, the site frame where needed, i18n,
a11y, hooks and the app's CI. The `quiz` archetype goes furthest: the creator supplies only questions and options.
The assistant changes a working app instead of building one from nothing.


## Deterministic first, the same check everywhere

One check CLI decides every rule that can be decided by a machine, in the pre-push hook, in the app's CI and in the
listing validation. Its report is bound to a commit and provides the entry's fitness values. The review agent starts
from that report and judges only the rest.


## Plain files and git hooks

Process guidance, plan and skills are Markdown files any assistant reads; the generator and the checks are CLIs;
enforcement sits in git hooks, which every agent triggers. Agent-specific hooks or an MCP
server may add convenience, never replace these.


## Nothing leaves the creator's side unasked

The tooling fetches what it needs (packages, schemas) and sends nothing. Measurements are kept where the creator's work
is: counters and the retrospective in the plan file, which reach the platform only with a listing. Feedback sent
directly to the platform would need the creator's consent for each sending.


## One rule catalog, one versioned package

Every rule is defined once in the rule catalog, with scope, severity and enforcement; skills, lint configuration,
the check CLI and the review rubric take their rules from it. Everything an app uses comes from one package,
installed from git and kept current by Renovate, so a change reaches every app without editing it.

