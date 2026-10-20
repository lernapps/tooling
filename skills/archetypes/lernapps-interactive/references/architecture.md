# Architecture (arc42)

- `docs/arc42/`, arc42 DSL (`@doctc/arc42`), English, minimal.
- `create` copies the generic part and the interactive extension; `update` replaces them.
- Write only between `<!-- app: begin … -->` and `<!-- app: end … -->`; nothing outside.
- Chapter 5: each part of core, UI, data as a level-3 heading in section `core`, `ui` or `data`, with `parent`,
  `path` and a diagram of the block and its parts. Each new leaf block on a deployment node in chapter 7.
- Concepts, decisions (canvas or DOM), declared accessibility with reasons: in the sections at the chapter ends.
- 1–2 sentences per block or decision: responsibility, reason; nothing the code says.
- Update with every change, same commit as the code.
- Pre-commit `arc42 diff --staged` fails on: block changed without prose (or the reverse); new `src/` code no block
  claims and not in `.arc42ignore`. It reads staged files: `git add` new files.
- Review hint (code under an interface's path changed): warning; read and update if needed.
- Accept a finding with `ARC42_CONSISTENT` only for a shown consistency finding judged intended, with a note in the
  plan. Never preset it (e.g. `$(git rev-parse HEAD)`): a bypass like `--no-verify`.
- Unclaimed new code is never accepted: give it a block, or list config in `.arc42ignore`.
- `lernapps check` runs `arc42 validate --strict` on the working tree: any error, warning or hint fails.
- Your work; no creator checkpoint.
