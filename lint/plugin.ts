// The lint plugin of the lernapps apps (docs/arc42 ch. 5, "Lint rules"): an Oxlint JS plugin on the
// ESLint-compatible API, loaded by the preset (archetypes/shared/preset.ts), which also sets each rule's severity.
// Every rule is a module lint/rules/<id>.ts; its id is the rule's name in the plugin, `lernapps/<id>`.
import type { Plugin } from "vite-plus/lint/plugins";
import learnerTextGerman from "./rules/learner-text-german.ts";
import noRequestBeforeClick from "./rules/no-request-before-click.ts";
import storageThroughWrapper from "./rules/storage-through-wrapper.ts";
import suppressionReason from "./rules/suppression-reason.ts";
import vueComponentBrowserGlobals from "./rules/vue-component-browser-globals.ts";
import vueComponentImports from "./rules/vue-component-imports.ts";
import vueComponentNoHtmlInjection from "./rules/vue-component-no-html-injection.ts";
import vueComponentNoNetwork from "./rules/vue-component-no-network.ts";

export const rules = {
  "learner-text-german": learnerTextGerman,
  "no-request-before-click": noRequestBeforeClick,
  "storage-through-wrapper": storageThroughWrapper,
  "suppression-reason": suppressionReason,
  "vue-component-browser-globals": vueComponentBrowserGlobals,
  "vue-component-imports": vueComponentImports,
  "vue-component-no-html-injection": vueComponentNoHtmlInjection,
  "vue-component-no-network": vueComponentNoNetwork,
};

export default { meta: { name: "lernapps" }, rules } satisfies Plugin;
