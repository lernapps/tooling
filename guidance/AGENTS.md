# AGENTS.md

Learning app for lernapps.net: static, runs in the browser, collects nothing, accessible. Built with its creator.

## Start here

1. Current plan: `.vibe/plans/<NN>-<short name>.md` with the highest NN.
2. No plan, or its Commit is completed: start a new plan. Copy a template complete and unchanged from
   `@lernapps/tooling/guidance/` (in `node_modules/`; before the app exists:
   <https://raw.githubusercontent.com/lernapps/tooling/exp/compact-guidance/guidance/>):
   - `plan-template.md`: the first version;
   - `increment-template.md`: every later change.
3. Read the plan before each step. Do its tasks in order. Each phase names its skills.

## Always

- Read guidance and skills from the file, in full. Never use a fetch tool that summarises.
- Push only the branch the current plan names. A push to `main` publishes.
- Never `--no-verify`. Never edit `prePushFailures` or `failedChecks`.
- Never edit a `lernapps-*` skill: `lernapps update` replaces them. The app's own skills (`app-content`, `app-*`)
  take precedence; app rules go there.
- Nothing about a real learner in any file or commit message (`no-learner-data-in-texts`).

## Language

- Learners, teachers, parents: German, plain language.
- Creator: their language, plain words, no forms.
