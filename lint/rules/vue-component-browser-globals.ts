// A component uses browser globals (window, document, localStorage, …) only inside onMounted, or the unmount hooks
// that run after it: the build renders every component with Vue's server renderer, where they do not exist. The
// explainer's build checks the same on the SFC compiler's output, with the same wording (lint/component.ts).
import type { ESTree } from "vite-plus/lint/plugins";
import { BROWSER, BROWSER_HOOKS, isComponentCode, isFreeReference } from "../component.ts";
import { lintRule } from "../rule.ts";

export default lintRule({
  id: "vue-component-browser-globals",
  description: "A component uses browser globals only inside onMounted (and the unmount hooks).",
  messages: {
    global:
      "{{name}} outside onMounted; the build renders the component where there is no {{name}}, so use it only inside onMounted.",
  },
  create(context) {
    if (!isComponentCode(context.filename)) return {};
    return {
      Identifier(node: ESTree.IdentifierReference) {
        if (!BROWSER.has(node.name) || !isFreeReference(context, node)) return;
        const stack: ESTree.Node[] = [...(context.sourceCode.getAncestors(node) as ESTree.Node[]), node];
        const inHook = stack.some(
          (ancestor, index) =>
            ancestor.type === "CallExpression" &&
            ancestor.callee.type === "Identifier" &&
            BROWSER_HOOKS.has(ancestor.callee.name) &&
            ancestor.arguments.some((argument) => argument === stack[index + 1]),
        );
        if (!inHook) context.report({ node, messageId: "global", data: { name: node.name } });
      },
    };
  },
});
