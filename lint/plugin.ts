// The lint plugin of the lernapps apps (docs/arc42 ch. 5, "Lint rules"): an Oxlint JS plugin on the
// ESLint-compatible API, loaded by the preset (archetypes/shared/preset.ts), which also sets each rule's severity.
// Every rule is a module lint/rules/<id>.ts; its id is the rule's name in the plugin, `lernapps/<id>`.
import type { Plugin } from "vite-plus/lint/plugins";
import learnerTextGerman from "./rules/learner-text-german.ts";
import noRequestBeforeClick from "./rules/no-request-before-click.ts";
import storageThroughWrapper from "./rules/storage-through-wrapper.ts";
import suppressionReason from "./rules/suppression-reason.ts";

export const rules = {
  "learner-text-german": learnerTextGerman,
  "no-request-before-click": noRequestBeforeClick,
  "storage-through-wrapper": storageThroughWrapper,
  "suppression-reason": suppressionReason,
};

export default { meta: { name: "lernapps" }, rules } satisfies Plugin;
