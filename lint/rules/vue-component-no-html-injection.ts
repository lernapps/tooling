// A component runs no code and writes no HTML from strings: no eval, new Function, innerHTML, outerHTML or
// insertAdjacentHTML (and no v-html in its template, which only the build sees). The explainer's build checks the
// same on the SFC compiler's output, with the same wording (lint/component.ts).
import type { ESTree } from "vite-plus/lint/plugins";
import { memberName } from "../ast.ts";
import { isComponentCode, isFreeReference } from "../component.ts";
import { lintRule } from "../rule.ts";

const HTML = new Set(["innerHTML", "outerHTML", "insertAdjacentHTML"]);

export default lintRule({
  id: "vue-component-no-html-injection",
  description: "A component runs no code and writes no HTML from strings: no eval, new Function, innerHTML or v-html.",
  messages: {
    code: "{{name}}: a component runs no code from strings.",
    html: "{{name}}: a component writes no HTML from strings; let the template render it.",
  },
  create(context) {
    if (!isComponentCode(context.filename)) return {};
    return {
      Identifier(node: ESTree.IdentifierReference) {
        if (node.name !== "eval" && node.name !== "Function") return;
        if (!isFreeReference(context, node)) return;
        const parent = node.parent;
        const called = (parent.type === "NewExpression" || parent.type === "CallExpression") && parent.callee === node;
        if (node.name === "eval" || called) context.report({ node, messageId: "code", data: { name: node.name } });
      },
      MemberExpression(node) {
        const key = memberName(node);
        if (key !== undefined && HTML.has(key)) context.report({ node, messageId: "html", data: { name: key } });
      },
      Property(node) {
        // innerHTML as a prop of a render function, h("div", { innerHTML })
        const key = node.key;
        const name = key.type === "Identifier" ? key.name : key.type === "Literal" ? key.value : undefined;
        if (!node.computed && name === "innerHTML") context.report({ node, messageId: "html", data: { name } });
      },
    };
  },
});
